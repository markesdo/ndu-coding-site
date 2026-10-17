import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANMELDE_PFAD, TESTPERSONEN, anmeldeSeite, fakeIdentitaet } from './fake-identitaet';

const CALLBACK = 'http://localhost:4321/api/werkstatt/auth/callback';

describe('fakeIdentitaet', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('loginUrl zeigt auf die lokale Auswahlseite derselben Origin, mit state und redirect_uri', () => {
    const url = new URL(fakeIdentitaet().loginUrl('st-1', CALLBACK));
    expect(url.origin).toBe('http://localhost:4321');
    expect(url.pathname).toBe(ANMELDE_PFAD);
    expect(url.searchParams.get('state')).toBe('st-1');
    expect(url.searchParams.get('redirect_uri')).toBe(CALLBACK);
  });

  it('codeEinloesen: Code ist die GitHub-ID einer Testperson', async () => {
    const p = TESTPERSONEN[0];
    expect(await fakeIdentitaet().codeEinloesen(String(p.githubId), CALLBACK)).toEqual({ githubId: p.githubId, login: p.login });
    await expect(fakeIdentitaet().codeEinloesen('42', CALLBACK)).rejects.toThrow();
  });

  it('Auswahlseite maskiert Text, den keine URL-Kodierung schützt (Login im Linktext)', async () => {
    const url = new URL(ANMELDE_PFAD, 'http://localhost:4321');
    url.searchParams.set('state', 's');
    url.searchParams.set('redirect_uri', CALLBACK);
    const html = await anmeldeSeite(new Request(url), [{ githubId: 1, login: '<img src=x onerror=alert(1)>', rolle: null, kuerzel: null }]).text();
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('Auswahlseite verlinkt jede Testperson auf den Callback, state bleibt erhalten', async () => {
    const url = new URL(ANMELDE_PFAD, 'http://localhost:4321');
    url.searchParams.set('state', '"><script>x</script>');
    url.searchParams.set('redirect_uri', CALLBACK);
    const r = anmeldeSeite(new Request(url));
    expect(r.status).toBe(200);
    const html = await r.text();
    for (const p of TESTPERSONEN) expect(html).toContain(p.login);
    const ziel = new URL(CALLBACK);
    ziel.searchParams.set('code', String(TESTPERSONEN[0].githubId));
    ziel.searchParams.set('state', '"><script>x</script>');
    expect(html).toContain(ziel.toString().replaceAll('&', '&amp;'));
  });

  it('Auswahlseite leitet nie auf eine fremde Origin', async () => {
    const url = new URL(ANMELDE_PFAD, 'http://localhost:4321');
    url.searchParams.set('state', 's');
    url.searchParams.set('redirect_uri', 'https://boese.example/api/werkstatt/auth/callback');
    expect(anmeldeSeite(new Request(url)).status).toBe(400);
  });

  it('verweigert außerhalb von development und test, auch ohne NODE_ENV', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => fakeIdentitaet()).toThrow();
    expect(() => anmeldeSeite(new Request(`http://localhost:4321${ANMELDE_PFAD}`))).toThrow();
    vi.stubEnv('NODE_ENV', undefined);
    expect(() => fakeIdentitaet()).toThrow();
  });
});
