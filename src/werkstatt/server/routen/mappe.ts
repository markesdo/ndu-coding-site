// Mappe lesen und speichern (spec §3.3). Gemountet unter /api/werkstatt/mappe: Pfade hier relativ dazu.
// CSRF (JSON + eigene Origin) für PUT prüft schon appErstellen.
import { Hono, type Context } from 'hono';
import { kohorte } from '../../kohorten/index.js';
import { dateienFuerSpeichern, readmeRendern } from '../../render/index.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, artefaktParsen, type ArtefaktName } from '../../schemas/index.js';
import type { ApiFehler, ArtefaktAntwort, MappeStand, SpeichernAntwort } from '../../vertrag.js';
import { repoName } from '../../zugang.js';
import { ApiAusnahme, fehler, json } from '../antwort.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import { internerFehler, wirdEingerichtet } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

const KEIN_ZUGRIFF = 'Diese Mappe gehört nicht zu deiner Anmeldung. Schreib Markus.';
const NUR_STUDIERENDE = 'Als Lehrende*r hast du hier noch keine eigene Mappe.';
const UNGUELTIG = 'Das lässt sich so nicht speichern. Bitte prüfe die markierten Felder.';
const KONFLIKT = 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.';

// Heutiges Datum in Wien als JJJJ-MM-TT (en-CA formatiert genau so).
function heuteInWien(ms: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vienna', year: 'numeric', month: '2-digit', day: '2-digit' }).format(ms);
}

function istArtefaktName(x: string): x is ArtefaktName {
  return (ARTEFAKT_NAMEN as readonly string[]).includes(x);
}

function istObjekt(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function ungueltig(c: Context, felder: ApiFehler['felder'] = []): Response {
  const body: ApiFehler = { fehler: UNGUELTIG, code: 'ungueltig', felder };
  return c.json(body, 422, { 'Cache-Control': 'no-store' });
}

export function mappeRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  // Repo der Sitzung, nachdem werkstatt.json bestätigt hat, dass es dieser Person in dieser Kohorte gehört.
  // anlegen: fehlt das Repo (oder werkstatt.json), einmal erneut anlegen (idempotent) – nur GET mappe tut das.
  async function eigenesRepo(c: Context<SitzungEnv>, anlegen: boolean): Promise<string> {
    const s = c.get('sitzung');
    const m = c.get('mitgliedschaft');
    const repo = repoName(m);
    let wj = await abh.speicher.werkstattJson(repo);
    if (!wj && anlegen) {
      try {
        await abh.speicher.anlegen(m, s.githubId);
      } catch (e) {
        if (e instanceof ApiAusnahme) throw e;
        console.error('werkstatt: Mappe anlegen fehlgeschlagen –', e instanceof Error ? e.message : 'Fehler');
        throw wirdEingerichtet();
      }
      wj = await abh.speicher.werkstattJson(repo);
    }
    if (!wj) throw wirdEingerichtet();
    if (wj.githubId !== s.githubId || wj.kohorte !== s.kohorte) {
      console.error('werkstatt: werkstatt.json passt nicht zur Sitzung, Zugriff verweigert');
      throw new ApiAusnahme(403, 'nicht-freigeschaltet', KEIN_ZUGRIFF);
    }
    return repo;
  }

  r.get('/', async (c) => {
    const m = c.get('mitgliedschaft');
    // Lehrende haben kein eigenes Repo; ihre Ansicht auf die Mappen folgt in Phase 2.
    if (m.rolle !== 'studierende') return json(c, { kohorte: m.kohorte, repo: '', artefakte: [] } satisfies MappeStand);
    const repo = await eigenesRepo(c, true);
    const stand: MappeStand = { kohorte: m.kohorte, repo, artefakte: await abh.speicher.uebersicht(repo) };
    return json(c, stand);
  });

  // Gemeinsamer Anfang beider Artefakt-Routen: Name prüfen, Rolle prüfen, eigenes Repo bestätigen.
  async function artefaktZugriff(c: Context<SitzungEnv>): Promise<{ name: ArtefaktName; repo: string } | Response> {
    const name = c.req.param('artefakt') ?? '';
    if (!istArtefaktName(name)) return fehler(c, 404, 'unbekannt', 'Dieses Artefakt gibt es in der Werkstatt nicht.');
    if (c.get('mitgliedschaft').rolle !== 'studierende') return fehler(c, 403, 'nicht-freigeschaltet', NUR_STUDIERENDE);
    return { name, repo: await eigenesRepo(c, false) };
  }

  r.get('/:artefakt', async (c) => {
    const z = await artefaktZugriff(c);
    if (z instanceof Response) return z;
    const { daten, basisSha } = await abh.speicher.lesen(z.repo, z.name);
    const antwort: ArtefaktAntwort = { name: z.name, daten, basisSha };
    return json(c, antwort);
  });

  r.put('/:artefakt', async (c) => {
    const z = await artefaktZugriff(c);
    if (z instanceof Response) return z;
    const { name, repo } = z;

    let anfrage: unknown;
    try {
      anfrage = await c.req.json();
    } catch {
      return ungueltig(c);
    }
    if (!istObjekt(anfrage) || !('daten' in anfrage)) return ungueltig(c);
    const { daten: roh, nachricht } = anfrage;
    const basisSha = typeof anfrage.basisSha === 'string' ? anfrage.basisSha : null;
    if (anfrage.basisSha !== null && basisSha === null) return ungueltig(c);

    // Der Stand ist immer der Tag des Speicherns (Wien), egal was der Browser mitschickt.
    const geprueft = artefaktParsen(name, istObjekt(roh) ? { ...roh, stand: heuteInWien(abh.jetzt()) } : roh);
    if ('fehler' in geprueft) return ungueltig(c, geprueft.fehler);

    const k = kohorte(c.get('mitgliedschaft').kohorte);
    if (!k) throw internerFehler(`speichern: unbekannte Kohorte ${c.get('mitgliedschaft').kohorte}`);
    // README aus der Dateiliste nach diesem Speichern: dieses Artefakt ist danach vorhanden.
    const vorhanden = (await abh.speicher.uebersicht(repo)).map((a) => (a.name === name ? { ...a, vorhanden: true } : a));
    const dateien = dateienFuerSpeichern(name, geprueft.daten, readmeRendern(k, vorhanden));

    const s = c.get('sitzung');
    const autor = { name: s.login, email: `${s.githubId}+${s.login}@users.noreply.github.com` };
    const kurz = typeof nachricht === 'string' ? nachricht.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
    const text = `${ARTEFAKTE[name].titel}: ${kurz || 'gespeichert über die Werkstatt'}`;

    const ergebnis = await abh.speicher.speichern(repo, name, dateien, basisSha, autor, text);
    if ('konflikt' in ergebnis) return fehler(c, 409, 'konflikt', KONFLIKT);
    const antwort: SpeichernAntwort = { basisSha: ergebnis.basisSha, commitUrl: ergebnis.commitUrl };
    return json(c, antwort);
  });

  return r;
}
