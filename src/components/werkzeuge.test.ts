import { describe, expect, it } from 'vitest';
import { EBENEN, REIHEN, VERBINDUNGEN, WERKZEUGE, verbindungenVon } from './werkzeuge';

const ids = WERKZEUGE.map((w) => w.id);

describe('werkzeuge', () => {
  it('jedes Werkzeug hat eine eindeutige id und alle Texte', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WERKZEUGE) {
      for (const feld of [w.name, w.rolle, w.wann, w.konto]) expect(feld.trim().length).toBeGreaterThan(0);
    }
  });

  it('jedes Werkzeug steht in einer bekannten Reihe', () => {
    const reihen = REIHEN.map((r) => r.id);
    for (const w of WERKZEUGE) expect(reihen).toContain(w.reihe);
  });

  it('jede Reihe hat mindestens ein Werkzeug im Netz', () => {
    for (const r of REIHEN) expect(WERKZEUGE.some((w) => w.reihe === r.id && w.zone === 'netz')).toBe(true);
  });

  it('jede Verbindung führt zwischen zwei bekannten, verschiedenen Werkzeugen', () => {
    for (const v of VERBINDUNGEN) {
      expect(ids).toContain(v.von);
      expect(ids).toContain(v.nach);
      expect(v.von).not.toBe(v.nach);
      expect(v.text.trim().length).toBeGreaterThan(0);
    }
  });

  it('jede Ebene hat Verbindungen, und jede Verbindung liegt auf einer bekannten Ebene', () => {
    const ebenen = EBENEN.map((e) => e.id);
    for (const e of ebenen) expect(VERBINDUNGEN.some((v) => v.ebene === e)).toBe(true);
    for (const v of VERBINDUNGEN) expect(ebenen).toContain(v.ebene);
  });

  it('jedes Werkzeug ist mit etwas verbunden', () => {
    for (const id of ids) expect(verbindungenVon(id).length, id).toBeGreaterThan(0);
  });

  it('der Code kommt nur über GitHub zu Vercel, nie direkt vom Mac', () => {
    const code = VERBINDUNGEN.filter((v) => v.ebene === 'code');
    expect(code.filter((v) => v.nach === 'vercel').map((v) => v.von)).toStrictEqual(['github']);
    for (const v of code) {
      const von = WERKZEUGE.find((w) => w.id === v.von)!;
      const nach = WERKZEUGE.find((w) => w.id === v.nach)!;
      // Was den Mac verlässt, geht zu GitHub.
      if (von.zone === 'mac' && nach.zone === 'netz') expect(nach.id).toBe('github');
    }
  });

  it('Supabase erreicht nur die App selbst, Claude nur über MCP', () => {
    const zuSupabase = VERBINDUNGEN.filter((v) => v.nach === 'supabase');
    expect(zuSupabase.filter((v) => v.ebene === 'app').map((v) => v.von).sort()).toStrictEqual(['localhost', 'vercel']);
    expect(zuSupabase.filter((v) => v.ebene === 'claude').map((v) => v.von)).toStrictEqual(['claude-code']);
  });
});
