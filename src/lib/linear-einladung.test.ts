import { describe, expect, it } from 'vitest';
import { linearEinladung } from './linear-einladung';

describe('linearEinladung', () => {
  it('nimmt einen https-Link auf linear.app', () => {
    expect(linearEinladung('https://linear.app/leihbar-team/join/abc123')).toBe('https://linear.app/leihbar-team/join/abc123');
  });

  it('schneidet Leerraum ab, den man beim Einfügen mitkopiert', () => {
    expect(linearEinladung('  https://linear.app/leihbar-team/join/abc123\n')).toBe('https://linear.app/leihbar-team/join/abc123');
  });

  it('gibt ohne Wert null zurück', () => {
    expect(linearEinladung(undefined)).toBeNull();
    expect(linearEinladung('')).toBeNull();
    expect(linearEinladung('   ')).toBeNull();
  });

  it('lehnt andere Hosts, http und Unsinn ab', () => {
    expect(linearEinladung('https://linear.app.example.com/join/abc')).toBeNull();
    expect(linearEinladung('https://example.com/linear.app')).toBeNull();
    expect(linearEinladung('http://linear.app/leihbar-team/join/abc')).toBeNull();
    expect(linearEinladung('javascript:alert(1)')).toBeNull();
    expect(linearEinladung('kein link')).toBeNull();
  });

  it('nimmt nur Einladungslinks, nicht die Workspace-Adresse oder andere Seiten', () => {
    expect(linearEinladung('https://linear.app/leihbar-team')).toBeNull();
    expect(linearEinladung('https://linear.app/login')).toBeNull();
    expect(linearEinladung('https://linear.app/leihbar-team/join')).toBeNull();
    expect(linearEinladung('https://u:p@linear.app/leihbar-team/join/abc123')).toBeNull();
    expect(linearEinladung('https://linear.app:8443/leihbar-team/join/abc123')).toBeNull();
  });
});
