// Zeigen-Modus im Leser der Lehrenden: Snapshot groß (SnapshotAnsicht), Kopf mit Personen-Reitern (Zeigen) und die
// reinen Hilfen (Tasten, Stelle nach Neu laden, „Nichts Neues“, neue Einträge).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import KAFFEEBAR from '../beispiele/interviews.json';
import type { Interview } from '../schemas/index.js';
import type { LehrendenArtefakt, LehrendenMappe } from '../vertrag.js';
import SnapshotAnsicht from './SnapshotAnsicht';
import { blaettern, istSynthetisch, neueEintraege, nichtsNeues, snapshotZahl, stelleNachId, tastenZiel, zeigbareInterviews, zeigenPersonen } from './snapshot-hilfen';
import Zeigen, { type ZeigenProps } from './Zeigen';

const IVS = KAFFEEBAR.interviews as Interview[];
const I2 = IVS.find((i) => i.id === 'I2')!;
const html = (iv: Interview) => renderToStaticMarkup(<SnapshotAnsicht iv={iv} />);
const text = (h: string) => h.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"');

describe('SnapshotAnsicht', () => {
  it('Kopf „ID · Pseudonym“ und das einprägsame Zitat', () => {
    const t = text(html(I2));
    expect(t).toContain('I2 · Pendlerin, Zug 7:42');
    expect(t).toContain('„Wenn ich auf die Uhr schauen muss, geh ich.“');
    expect(html(I2)).toContain('aria-label="Interview-Snapshot I2 · Pendlerin, Zug 7:42"');
  });

  it('Belege mit dem Text des Zitats', () => {
    const h = html(I2);
    expect(text(h)).toContain('Wenn ich anstehe, verpasse ich den Zug.I2-2 „Wenn ich auf die Uhr schauen muss, geh ich.“');
    expect(text(h)).toContain('I2-5 „Am liebsten wüsste ich einfach, wann er fertig ist.“');
  });

  it('unbekannte Beleg-ID: „(unbekannt)“', () => {
    const iv = { ...I2, chancen: [{ text: 'Ich will wissen, wann er fertig ist.', belege: ['I2-9', 'I2-5'] }] };
    const t = text(html(iv));
    expect(t).toContain('I2-9 (unbekannt)');
    expect(t).toContain('I2-5 „Am liebsten wüsste ich einfach, wann er fertig ist.“');
  });

  it('Chance ohne Beleg: „noch ohne Beleg“', () => {
    expect(text(html({ ...I2, chancen: [{ text: 'Schneller', belege: [] }] }))).toContain('Schneller – noch ohne Beleg');
  });

  it('Synthetisch: Abzeichen bei Pseudonym oder Kurzinfos, sonst nicht', () => {
    const marke = 'Synthetisch – zählt nicht als Beleg';
    expect(text(html({ ...I2, pseudonym: 'Synthetisch: Pendlerin' }))).toContain(marke);
    expect(text(html({ ...I2, kurzinfos: 'SYNTHETISCH – von der KI erfunden' }))).toContain(marke);
    expect(text(html(I2))).not.toContain(marke);
    expect(istSynthetisch({ pseudonym: 'Pendlerin', kurzinfos: 'nicht synthetisch' })).toBe(false);
  });

  it('leere Felder: „—“ gedämpft', () => {
    const iv: Interview = { ...I2, zitat: '', kurzinfos: ' ', einsichten: [''], chancen: [], notizen: '', zitate: [] };
    const h = html(iv);
    expect(h.match(/<span class="snap-leer">—<\/span>/g)).toHaveLength(5);
  });

  it('Geschichte (Notizen) als ein Text, nicht an den Kommas geteilt', () => {
    const h = html(I2);
    expect(h).toContain('<p class="snap-notizen">Ankunft 7:31, acht Leute in der Schlange, Blick auf die Uhr, weiter zum Automaten, Zug 7:42.</p>');
  });

  it('kein HTML aus der Mappe: <b> erscheint maskiert', () => {
    const iv = { ...I2, zitat: '<b>fett</b>', notizen: '<img src=x onerror=alert(1)>', chancen: [{ text: '<i>x</i>', belege: ['I2-1'] }], zitate: [{ id: 'I2-1', text: '<b>Zitat</b>' }] };
    const h = html(iv);
    expect(h).not.toContain('<b>');
    expect(h).not.toContain('<img');
    expect(h).not.toContain('<i>');
    expect(h).toContain('&lt;b&gt;fett&lt;/b&gt;');
    expect(h).toContain('&lt;b&gt;Zitat&lt;/b&gt;');
  });

  it('neue Einsichten und Chancen mit Marke „neu“', () => {
    const vorher = [{ ...I2, einsichten: [], chancen: [I2.chancen[0]] }];
    const h = renderToStaticMarkup(<SnapshotAnsicht iv={I2} neu={neueEintraege(vorher, I2)} />);
    expect(h.match(/class="snap-neu"/g)).toHaveLength(2);
    expect(text(h)).toContain('Entscheidet erst beim Ankommen. neu');
    expect(text(h)).toContain('Ich will wissen, wann mein Kaffee fertig ist. neu');
  });
});

describe('Hilfen', () => {
  it('blättern ringsum', () => {
    expect([blaettern(0, 3, 1), blaettern(2, 3, 1), blaettern(0, 3, -1), blaettern(1, 3, -1), blaettern(0, 0, 1)]).toStrictEqual([1, 0, 2, 0, 0]);
  });

  const a = (stand: LehrendenArtefakt['stand'], umfang: string | null, leer = false) => ({ name: 'interviews', stand, umfang, leer }) as LehrendenArtefakt;
  const P: LehrendenMappe[] = [
    { kuerzel: 'sofie', zustand: 'bereit', artefakte: [a('vorhanden', '3 von 5 Snapshots')] } as LehrendenMappe,
    { kuerzel: 'otto', zustand: 'keine-mappe' },
    { kuerzel: 'joachim', zustand: 'bereit', artefakte: [a('offen', null)] } as LehrendenMappe,
    { kuerzel: 'hewen', zustand: 'bereit', artefakte: [a('vorhanden', '6 Snapshots (5 verlangt)')] } as LehrendenMappe,
  ];

  it('←/→ ohne Zeigen: Nachbarperson wie bisher', () => {
    expect(tastenZiel('ArrowRight', { zeigen: false, personen: P, person: 'sofie', nr: 0, anzahl: 3 })).toStrictEqual({ art: 'person', person: 'joachim' });
    expect(tastenZiel('ArrowLeft', { zeigen: false, personen: P, person: 'sofie', nr: 0, anzahl: 3 })).toBeNull();
    expect(tastenZiel('Enter', { zeigen: false, personen: P, person: 'sofie', nr: 0, anzahl: 3 })).toBeNull();
  });

  it('←/→ im Zeigen-Modus: nur Snapshots, nie eine andere Person', () => {
    expect(tastenZiel('ArrowRight', { zeigen: true, personen: P, person: 'sofie', nr: 0, anzahl: 3 })).toStrictEqual({ art: 'snapshot', nr: 1 });
    expect(tastenZiel('ArrowLeft', { zeigen: true, personen: P, person: 'sofie', nr: 0, anzahl: 3 })).toStrictEqual({ art: 'snapshot', nr: 2 });
    expect(tastenZiel('ArrowRight', { zeigen: true, personen: P, person: 'sofie', nr: 2, anzahl: 3 })).toStrictEqual({ art: 'snapshot', nr: 0 });
    // Ohne Snapshots passiert nichts – auch kein Personenwechsel.
    expect(tastenZiel('ArrowRight', { zeigen: true, personen: P, person: 'sofie', nr: 0, anzahl: 0 })).toBeNull();
  });

  it('Neu laden: Stelle nach Interview-ID, nicht nach Nummer', () => {
    const vorne = [{ ...I2, id: 'I0' }, ...IVS];
    expect(stelleNachId(IVS, 'I3')).toBe(2);
    expect(stelleNachId(vorne, 'I3')).toBe(3);
    expect(stelleNachId(IVS, 'I9')).toBe(0);
    expect(stelleNachId(IVS, null)).toBe(0);
  });

  it('„Nichts Neues“ nur, wenn sich nichts geändert hat', () => {
    expect(nichtsNeues(IVS, structuredClone(IVS))).toBe(true);
    expect(nichtsNeues(IVS, [...IVS.slice(0, 4), { ...IVS[4], einsichten: [...IVS[4].einsichten, 'Neu'] }])).toBe(false);
  });

  it('neue Einträge: ohne früheren Stand keine; neues Interview ganz', () => {
    expect(neueEintraege(null, I2).chancen.size).toBe(0);
    expect([...neueEintraege([], I2).chancen]).toStrictEqual(I2.chancen.map((c) => c.text));
    expect(neueEintraege(IVS, I2).einsichten.size).toBe(0);
  });

  it('zeigbar sind nur gefüllte Interviews', () => {
    const leer: Interview = { ...I2, id: 'I6', zitat: '', kurzinfos: '', einsichten: [], chancen: [], notizen: '', zitate: [] };
    expect(zeigbareInterviews({ interviews: [...IVS, leer] }).map((i) => i.id)).toStrictEqual(['I1', 'I2', 'I3', 'I4', 'I5']);
    expect(zeigbareInterviews(null)).toStrictEqual([]);
  });

  it('Personen-Reiter: bereite Mappen in Reihenfolge mit Zahl der Snapshots', () => {
    expect(snapshotZahl(null)).toBe(0);
    expect(zeigenPersonen(P)).toStrictEqual([{ kuerzel: 'sofie', anzahl: 3 }, { kuerzel: 'joachim', anzahl: 0 }, { kuerzel: 'hewen', anzahl: 6 }]);
  });
});

describe('Zeigen', () => {
  const props = (x: Partial<ZeigenProps> = {}): ZeigenProps => ({
    personen: [{ kuerzel: 'sofie', anzahl: 5 }, { kuerzel: 'joachim', anzahl: 0 }, { kuerzel: 'hewen', anzahl: 2 }],
    person: 'sofie', interviews: IVS, vorher: null, nr: 1, laedt: false, fehler: null, stand: Date.UTC(2026, 10, 12, 13, 5), meldung: '',
    personWaehlen: () => {}, nrWaehlen: () => {}, blaettern: () => {}, neuLaden: () => {}, beenden: () => {}, ...x,
  });
  const knoepfe = (h: string) => [...h.matchAll(/<button([^>]*)>(.*?)<\/button>/g)].map((m) => [text(m[2]).trim(), m[1].includes(' disabled')]);

  it('Kopf: Personen mit Zahl, 0 gesperrt; „Snapshot n von m“; Neu laden; Zeigen beenden', () => {
    const h = renderToStaticMarkup(<Zeigen {...props()} />);
    expect(knoepfe(h).slice(0, 3)).toStrictEqual([['sofie (5)', false], ['joachim (0)', true], ['hewen (2)', false]]);
    expect(h).toMatch(/aria-current="true"[^>]*>sofie \(5\)/);
    expect(h).toContain('<span class="zg-zaehler" aria-live="polite" aria-atomic="true">Snapshot 2 von 5</span>');
    expect(text(h)).toContain('Stand 14:05');
    expect(knoepfe(h).map((k) => k[0])).toEqual(expect.arrayContaining(['Neu laden', 'Zeigen beenden']));
    // Eine Leiste mit allen Snapshots, der gezeigte markiert.
    expect(h).toMatch(/aria-current="true">I2 · „Wenn ich auf die Uhr schauen muss, geh ich\.“/);
  });

  it('zeigt nur den Snapshot: kein Feedback, keine Lücken, keine Repo-Links', () => {
    const h = renderToStaticMarkup(<Zeigen {...props()} />);
    expect(h).not.toMatch(/class="fb|lv-leser-befunde|lv-leser-fehlt|lv-links|href=/);
    expect(h.match(/class="snap"/g)).toHaveLength(1);
  });

  it('Neu laden: „lädt …“, danach „Nichts Neues gespeichert“', () => {
    expect(text(renderToStaticMarkup(<Zeigen {...props({ laedt: true })} />))).toContain('lädt …');
    expect(renderToStaticMarkup(<Zeigen {...props({ laedt: true })} />)).toContain('aria-disabled="true"');
    expect(text(renderToStaticMarkup(<Zeigen {...props({ meldung: 'Nichts Neues gespeichert' })} />))).toContain('Nichts Neues gespeichert · Stand 14:05');
  });

  it('ohne Interviews: „Noch keine Interviews eingetragen.“', () => {
    expect(text(renderToStaticMarkup(<Zeigen {...props({ interviews: [] })} />))).toContain('Noch keine Interviews eingetragen.');
  });
});
