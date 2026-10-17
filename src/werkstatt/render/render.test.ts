import { describe, expect, it } from 'vitest';
import { ARTEFAKT_NAMEN, artefaktParsen, type ArtefaktName, type DatenVon } from '../schemas/index';
import { kohorte } from '../kohorten/index';
import { dateienFuerSpeichern, readmeRendern, rendern } from './index';
import brief from '../beispiele/brief.json';
import entscheidungen from '../beispiele/entscheidungen.json';
import leitfaden from '../beispiele/leitfaden.json';
import annahmen from '../beispiele/annahmen.json';

const roh = { brief, entscheidungen, leitfaden, annahmen } as const;

function laden<N extends ArtefaktName>(name: N): DatenVon<N> {
  const r = artefaktParsen(name, roh[name]);
  if (!r.ok) throw new Error(JSON.stringify(r.fehler));
  return r.daten;
}

const md = (name: ArtefaktName) => rendern(name, laden(name));
const k = kohorte('2026')!;

describe('Snapshots der Kaffeebar-Beispiele', () => {
  for (const name of ARTEFAKT_NAMEN) {
    it(name, () => expect(md(name)).toMatchSnapshot());
  }
});

describe('Brief', () => {
  it('Datum österreichisch, Überschriften der Vorlage, Produktsatz offen', () => {
    const s = md('brief');
    expect(s).toContain('**Stand:** 22.10.2026 — Problem-Rahmen, Innolab Tag 1');
    expect(s).not.toContain('2026-10-22');
    for (const h of ['## 1. Für wen?', '## 2. Welches Problem?', '## 4. Was macht es NICHT?', '## 6. Woran merken wir, dass es funktioniert?', '## 7. Offene Fragen']) {
      expect(s).toContain(h);
    }
    expect(s).toContain('## 3. Was ist das Produkt in einem Satz?\nOffen – steht nach Tag 3 fest.');
    expect(s).toContain('Heute gelöst durch: Automat');
    expect(s).toContain('Wir glauben: Pendler*innen bekommen morgens Kaffee');
    expect(s).toContain('Wir merken es: Wenn 4 von 5');
    expect(s).toContain('- Kein Mittagsgeschäft');
  });
  it('Produktsatz erscheint, wenn gesetzt', () => {
    expect(rendern('brief', { ...laden('brief'), produktSatz: 'Kaffee vorbestellen.' })).toContain('Satz?\nKaffee vorbestellen.');
  });
});

describe('Entscheidungen', () => {
  const s = md('entscheidungen');
  it('Datum österreichisch, IDs fett, Belegstufe ausgeschrieben', () => {
    expect(s).toContain('- **D2** 22.10.2026 — Kein Mittagsgeschäft — Mittags ist die Bar halb leer — Beleg: getan');
    expect(s).toContain('Beleg: noch keiner');
    expect(s).toContain('Beleg: getan (Kassendaten September)');
    expect(s).toContain('Beleg: erzählt (I1, I3, I4)');
    expect(s).not.toContain('erzaehlt');
  });
  it('Beleg-Notiz steht nach Stufe und IDs', () => {
    const e = laden('entscheidungen');
    const z = { ...e.entscheidungen[2], belegNotiz: 'Interviews Oktober' };
    const s = rendern('entscheidungen', { ...e, entscheidungen: [z] });
    expect(s).toContain('Beleg: erzählt (I1, I3, I4; Interviews Oktober)');
    expect(rendern('entscheidungen', { ...e, entscheidungen: [{ ...z, belegNotiz: '' }] })).not.toContain('Oktober');
  });
  it('ersetzte Entscheidung zeigt das Datum der ersetzenden Zeile', () => {
    const d1 = s.split('\n').find((z) => z.startsWith('- **D1**'))!;
    expect(d1).toContain('ersetzt am 05.11.2026');
    const d3 = s.split('\n').find((z) => z.startsWith('- **D3**'))!;
    expect(d3).toContain('ersetzt **D1**');
    expect(d3).not.toContain('ersetzt am');
  });
});

describe('Leitfaden', () => {
  const s = md('leitfaden');
  it('Überschriften der Vorlage, Kernfragen nummeriert, IDs fett', () => {
    for (const h of ['## Einstieg', '## Kernfragen', '## Nachfragen', '## Abschluss']) expect(s).toContain(h);
    expect(s).toContain('1. **F1** Erzähl mir vom letzten Morgen');
    expect(s).toContain('5. **F5** Was hast du diese Woche');
    expect(s).toContain('- **F9** Kannst du mir das zeigen?');
    expect(s).toContain('„Wen sollte ich noch fragen?“');
    expect(s).toContain('**Stand:** 22.10.2026');
  });
});

describe('Annahmen', () => {
  const s = md('annahmen');
  it('riskanteste markiert, nur eine', () => {
    expect(s).toContain('| **A1** (riskanteste) |');
    expect(s.match(/\(riskanteste\)/g)).toHaveLength(1);
    expect(s).toContain('Riskanteste Annahme: A1');
  });
  it('Art und Beleg ausgeschrieben, Datum österreichisch', () => {
    expect(s).toContain('| wünschenswert | hoch | noch keiner |');
    expect(s).toContain('| **A2** | Wir glauben, dass die Bar morgens 40 Bestellungen in 30 Minuten zubereiten kann. | machbar | hoch | getan |');
    expect(s).toContain('Stand: 22.10.2026');
  });
  it('senkrechter Strich in der Tabelle wird maskiert', () => {
    const d = { ...laden('annahmen'), annahmen: [{ ...laden('annahmen').annahmen[0], text: 'a | b\nc' }] };
    expect(rendern('annahmen', d)).toContain('a \\| b c');
  });
});

const FALSCHE = ['x\n## Gefälscht\nfoo', 'x\r## Gefälscht\rfoo', 'x\r\n## Gefälscht\r\nfoo'];
const hatFalschzeile = (s: string) => s.split(/\r\n|\r|\n/).some((z) => z.startsWith('## Gefälscht'));

describe.each(FALSCHE)('Eingeschleuste Zeilen (%j)', (FALSCH) => {
  it('Brief: kein Feld beginnt eine Überschrift', () => {
    const b = laden('brief');
    const s = rendern('brief', { ...b, fuerWen: FALSCH, problem: FALSCH, heuteGeloestDurch: FALSCH, produktSatz: FALSCH, nicht: [FALSCH], offeneFragen: [FALSCH], outcome: { wirGlauben: FALSCH, wirMerkenEs: FALSCH } });
    expect(hatFalschzeile(s)).toBe(false);
    expect(s).toContain('\\## Gefälscht');
    expect(s.split(/\r\n|\r|\n/).filter((z) => /^## /.test(z))).toHaveLength(7);
  });
  it('Entscheidungen: Zeile bleibt eine Zeile', () => {
    const e = laden('entscheidungen');
    const s = rendern('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[0], entscheidung: FALSCH, grund: FALSCH, belegIds: [] }] });
    expect(hatFalschzeile(s)).toBe(false);
    expect(s.split('\n').filter((z) => z.startsWith('- '))).toHaveLength(1);
  });
  it('Entscheidungen: Beleg-Notiz bleibt in der Zeile', () => {
    const e = laden('entscheidungen');
    const s = rendern('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[0], belegNotiz: FALSCH }] });
    expect(hatFalschzeile(s)).toBe(false);
    expect(s.split('\n').filter((z) => z.startsWith('- '))).toHaveLength(1);
  });
  it('Leitfaden: Felder bleiben einzeilig', () => {
    const l = laden('leitfaden');
    const s = rendern('leitfaden', { ...l, ziel: FALSCH, wen: FALSCH, einstieg: FALSCH, abschluss: FALSCH, fragen: [{ id: 'F1', art: 'kern', text: FALSCH }, { id: 'F2', art: 'nachfrage', text: FALSCH }] });
    expect(hatFalschzeile(s)).toBe(false);
    expect(s.split('\n').filter((z) => z.startsWith('## '))).toHaveLength(4);
  });
  it('Annahmen: Tabellenzeilen bleiben eine Zeile, Backslash maskiert', () => {
    const a = laden('annahmen');
    const s = rendern('annahmen', { ...a, annahmen: [{ ...a.annahmen[0], text: FALSCH + ' a\\b', belegIds: ['I1'] }] });
    expect(hatFalschzeile(s)).toBe(false);
    expect(s.split('\n').filter((z) => z.startsWith('| **A1**'))).toHaveLength(1);
    expect(s).toContain('a\\\\b');
  });
});

const zeilen = (s: string) => s.split('\n');

describe('Allgemeine Zeilenanfangs-Regel', () => {
  const b = laden('brief');
  const nicht = ['## x', '___', '    Pendler', 'x\n<!--', '1. Anstellen', '2) Zahlen', ':--|--', '- y', '> z', '\\#'];
  const s = rendern('brief', { ...b, nicht });
  it('Listeneinträge: Satzzeichen am Anfang wird maskiert, Einrückung entfernt', () => {
    expect(zeilen(s)).toContain('- \\## x');
    expect(zeilen(s)).toContain('- \\___');
    expect(zeilen(s)).toContain('- Pendler');
    expect(zeilen(s)).toContain('- x <!--');
    expect(zeilen(s)).toContain('- 1\\. Anstellen');
    expect(zeilen(s)).toContain('- 2\\) Zahlen');
    expect(zeilen(s)).toContain('- \\:--|--');
    expect(zeilen(s)).toContain('- \\- y');
    expect(zeilen(s)).toContain('- \\> z');
    expect(zeilen(s)).toContain('- \\\\#');
  });
  it('mehrzeilige Felder: jede Zeile folgt der Regel', () => {
    const t = rendern('brief', { ...b, fuerWen: 'x\n<!--\n    Pendler\n___\n1. Anstellen\n:--|--' });
    expect(zeilen(t)).toContain('\\<!--\\');
    expect(zeilen(t)).toContain('Pendler\\');
    expect(zeilen(t)).toContain('\\___\\');
    expect(zeilen(t)).toContain('1\\. Anstellen\\');
    expect(zeilen(t)).toContain('\\:--|--');
    expect(t).not.toContain('\\1');
  });
  it('Felder mitten in der Zeile bleiben unmaskiert', () => {
    const l = laden('leitfaden');
    const ls = rendern('leitfaden', { ...l, ziel: '(Pilot) x', fragen: [{ id: 'F1', art: 'kern', text: '# x' }, { id: 'F2', art: 'nachfrage', text: '"Was 1. y' }] });
    expect(zeilen(ls)).toContain('1. **F1** # x');
    expect(zeilen(ls)).toContain('- **F2** "Was 1. y');
    expect(zeilen(ls)).toContain('Ziel: (Pilot) x');
    const e = laden('entscheidungen');
    const es = rendern('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[0], entscheidung: '(Pilot) nur montags' }] });
    expect(es).toContain(' — (Pilot) nur montags — ');
    const a = laden('annahmen');
    expect(rendern('annahmen', { ...a, annahmen: [{ ...a.annahmen[0], text: '# x' }] })).toContain('| # x |');
  });
  it('Links, Code und Betonung am Zeilenanfang bleiben wirksam', () => {
    const b = laden('brief');
    const nicht = ['[Interview I2](https://x.at) zeigt', '[a\\]b](https://x.at)', '`Kasse` hängt', '<https://x.at>', '<kontakt@firma.at>', '_wichtig_', '!Achtung'];
    const s = rendern('brief', { ...b, nicht, fuerWen: '[I2](https://x.at)\n`Kasse`' });
    for (const n of nicht) expect(zeilen(s)).toContain(`- ${n}`);
    expect(zeilen(s)).toContain('[I2](https://x.at)\\');
    expect(zeilen(s)).toContain('`Kasse`');
  });
  it('Blockzeichen, die nur mit Folgezeichen wirken, werden maskiert', () => {
    const b = laden('brief');
    const nicht = ['[a]: https://x.at', '[a\\]b]: /url', '[ ] Bezahlfunktion', '```js', '~~~', '_ _ _', '<div>', '<!-- x'];
    const s = rendern('brief', { ...b, nicht });
    for (const n of nicht) expect(zeilen(s)).toContain(`- \\${n}`);
  });
});

describe('Sichtbare Zeilenumbrüche', () => {
  it('Beschriftungszeilen sind eigene Absätze, Umbrüche im Feld sind harte Umbrüche', () => {
    const b = laden('brief');
    const s = rendern('brief', { ...b, problem: 'a\nb', heuteGeloestDurch: 'c' });
    expect(s).toContain('## 2. Welches Problem?\na\\\nb\n\nHeute gelöst durch: c\n');
    expect(s).toContain('\n\nWir merken es: ');
    expect(rendern('leitfaden', laden('leitfaden'))).toContain('\n\nWen: ');
    expect(rendern('annahmen', laden('annahmen'))).toContain('\n\nRiskanteste Annahme: A1\n');
  });
  it('Zeile, die mit Backslash endet, bleibt ein harter Umbruch', () => {
    const s = rendern('brief', { ...laden('brief'), problem: 'a\\\nb' });
    expect(s).toContain('a\\\\  \nb');
  });
  it('Zeile, die mit maskiertem Backslash endet, bekommt keinen zusätzlichen', () => {
    // Eine Zeile nur aus einem Backslash: maskiert \\, der Umbruch braucht genau einen weiteren.
    const s = rendern('brief', { ...laden('brief'), problem: '\\\nb' });
    expect(s).toContain('Problem?\n\\\\\\\nb');
  });
});

describe('Verweisdefinition über zwei Zeilen', () => {
  it('die erste Zeile wird maskiert, nichts verschwindet', () => {
    const s = rendern('brief', { ...laden('brief'), fuerWen: '[Interview\nI2]: siehe unten' });
    expect(zeilen(s)).toContain('\\[Interview\\');
  });
});

describe('Beleg-Klammer', () => {
  it('leere IDs zählen wie keine', () => {
    const e = laden('entscheidungen');
    const s = rendern('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[2], belegIds: ['', ' ', 'I1'], belegNotiz: ' ' }] });
    expect(s).toContain('Beleg: erzählt (I1)');
  });
});

describe('Leere Pflichtfelder', () => {
  it('zeigen „Noch nichts eingetragen.“', () => {
    const leer = rendern('brief', { ...laden('brief'), fuerWen: '', problem: '  ', heuteGeloestDurch: '', produktSatz: '   ', outcome: { wirGlauben: '', wirMerkenEs: '' } });
    expect(leer).toContain('## 1. Für wen?\nNoch nichts eingetragen.');
    expect(leer).toContain('## 2. Welches Problem?\nNoch nichts eingetragen.\n\nHeute gelöst durch: Noch nichts eingetragen.');
    expect(leer).toContain('Satz?\nOffen – steht nach Tag 3 fest.');
    expect(leer).toContain('Wir glauben: Noch nichts eingetragen.');
    const l = rendern('leitfaden', { ...laden('leitfaden'), ziel: '', wen: '', einstieg: '', abschluss: ' ' });
    expect(l).toContain('Ziel: Noch nichts eingetragen.');
    expect(l).toContain('## Einstieg\nNoch nichts eingetragen.');
    expect(l).toContain('## Abschluss\nNoch nichts eingetragen.');
    expect(l).not.toContain('„Noch nichts');
    const e = laden('entscheidungen');
    expect(rendern('entscheidungen', { ...e, entscheidungen: [{ ...e.entscheidungen[0], entscheidung: '', grund: '' }] })).toContain('Noch nichts eingetragen. — Noch nichts eingetragen.');
    const a = laden('annahmen');
    expect(rendern('annahmen', { ...a, annahmen: [{ ...a.annahmen[0], text: '' }] })).toContain('| Noch nichts eingetragen. |');
  });
});

describe('README', () => {
  it('Titel, Kohorte, Link nur bei vorhandenen Dateien', () => {
    const s = readmeRendern(k, [
      { name: 'brief', vorhanden: true },
      { name: 'entscheidungen', vorhanden: false },
      { name: 'leitfaden', vorhanden: false },
      { name: 'annahmen', vorhanden: true },
    ]);
    expect(s).toContain('# Projektmappe');
    expect(s).toContain('**Kohorte:** Innolab 26/27');
    expect(s).toContain('| Produkt-Brief | [mappe/brief.md](mappe/brief.md) |');
    expect(s).toContain('| Entscheidungslog | noch offen |');
    expect(s).toContain('| Annahmen-Map | [mappe/annahmen.md](mappe/annahmen.md) |');
    expect(s).not.toContain('mappe/entscheidungen.md');
    expect(s).toMatchSnapshot();
  });
});

describe('dateienFuerSpeichern', () => {
  it('genau json, md und README', () => {
    const daten = laden('brief');
    const d = dateienFuerSpeichern('brief', daten, 'README-Text');
    expect(Object.keys(d).sort()).toStrictEqual(['README.md', 'mappe/brief.json', 'mappe/brief.md']);
    expect(d['mappe/brief.json']).toBe(`${JSON.stringify(daten, null, 2)}\n`);
    expect(d['mappe/brief.json']).toMatch(/\n {2}"schema": "brief@1"/);
    expect(d['mappe/brief.md']).toBe(rendern('brief', daten));
    expect(d['README.md']).toBe('README-Text');
  });
});
