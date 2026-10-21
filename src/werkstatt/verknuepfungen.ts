// Verknüpfungen der Mappe prüfen (deterministisch, ohne KI): unbekannte IDs, fehlende Belege, verwaiste Interviews.
// Grundlage für das MCP-Werkzeug verknuepfungen_pruefen und später für die Lehrende-Ansicht (Spec §3.4, §3.7).
import { ARTEFAKT_NAMEN, ARTEFAKTE, BELEGSTUFE_TEXT, type Annahmen, type ArtefaktName, type Brief, type Entscheidungen, type Interviews, type Leitfaden } from './schemas/index.js';

// Je Artefakt: die Daten, null = noch nicht gespeichert, 'unlesbar' = Datei passt nicht zum Schema.
type Eintrag<T> = T | null | 'unlesbar';
export interface MappeDaten {
  brief: Eintrag<Brief>;
  entscheidungen: Eintrag<Entscheidungen>;
  leitfaden: Eintrag<Leitfaden>;
  annahmen: Eintrag<Annahmen>;
  interviews: Eintrag<Interviews>;
}

export type BefundArt = 'unbekannte-id' | 'fehlender-beleg' | 'verwaist';
export interface Befund {
  art: BefundArt;
  artefakt: ArtefaktName;
  // Wo: ID der Zeile (D4) oder Feld (Brief · Offene Frage 2, I2 · Chance 1).
  ort: string;
  // Die unbekannte ID bzw. das verwaiste Element.
  id?: string;
  text: string;
}
export interface Verknuepfungen {
  befunde: Befund[];
  geprueft: ArtefaktName[];
  fehlen: ArtefaktName[];
  unlesbar: ArtefaktName[];
}

// Welches Artefakt eine ID auflöst. Spätere Präfixe (T, J, P, …) gibt es in der Mappe noch nicht.
const QUELLE: Partial<Record<string, ArtefaktName>> = { D: 'entscheidungen', A: 'annahmen', F: 'leitfaden', I: 'interviews' };
// IDs im Fließtext: nur die Präfixe, die die Mappe schon kennt, damit „S1“ (S-Bahn) keinen Befund auslöst.
const ID_IM_TEXT = /(?<![\p{L}\p{N}-])[DAFI][1-9][0-9]*(?:-[1-9][0-9]*)?(?![\p{L}\p{N}-])/gu;

const da = <T>(e: Eintrag<T>): e is T => e !== null && e !== 'unlesbar';

export function verknuepfungenPruefen(m: MappeDaten): Verknuepfungen {
  const ergebnis: Verknuepfungen = {
    befunde: [],
    geprueft: ARTEFAKT_NAMEN.filter((n) => da(m[n])),
    fehlen: ARTEFAKT_NAMEN.filter((n) => m[n] === null),
    unlesbar: ARTEFAKT_NAMEN.filter((n) => m[n] === 'unlesbar'),
  };
  const befund = (b: Befund) => ergebnis.befunde.push(b);

  const bekannt = new Set<string>();
  if (da(m.entscheidungen)) m.entscheidungen.entscheidungen.forEach((e) => bekannt.add(e.id));
  if (da(m.annahmen)) m.annahmen.annahmen.forEach((a) => bekannt.add(a.id));
  if (da(m.leitfaden)) m.leitfaden.fragen.forEach((f) => bekannt.add(f.id));
  if (da(m.interviews)) m.interviews.interviews.forEach((iv) => { bekannt.add(iv.id); iv.zitate.forEach((z) => bekannt.add(z.id)); });

  // Warum eine ID nicht aufgelöst wird; null = sie wird aufgelöst oder lässt sich nicht prüfen (Quelle unlesbar).
  const warumUnbekannt = (id: string): string | null => {
    if (bekannt.has(id)) return null;
    const quelle = QUELLE[id[0]];
    if (!quelle) return `${id} gehört zu einem späteren Kurstag; in der Mappe gibt es das noch nicht.`;
    if (m[quelle] === 'unlesbar') return null;
    const titel = ARTEFAKTE[quelle].titel;
    if (m[quelle] === null) return `„${titel}“ ist noch nicht gespeichert, ${id} gibt es darum noch nicht.`;
    const interview = id.split('-')[0];
    if (id.includes('-') && bekannt.has(interview)) return `${interview} hat kein Zitat ${id}.`;
    return `In „${titel}“ gibt es ${id} nicht.`;
  };

  const belegeVon = (artefakt: ArtefaktName, ort: string, ids: readonly string[]) => {
    for (const id of ids) {
      const warum = warumUnbekannt(id);
      if (warum) befund({ art: 'unbekannte-id', artefakt, ort, id, text: `${ort} nennt ${id} als Beleg. ${warum}` });
    }
  };
  const textVon = (artefakt: ArtefaktName, ort: string, t: string) => {
    for (const [id] of t.matchAll(ID_IM_TEXT)) {
      const warum = warumUnbekannt(id);
      if (warum) befund({ art: 'unbekannte-id', artefakt, ort, id, text: `${ort} nennt ${id} im Text. ${warum}` });
    }
  };

  if (da(m.brief)) {
    const b = m.brief;
    const felder: [string, string | undefined][] = [
      ['Für wen', b.fuerWen], ['Problem', b.problem], ['Heute gelöst durch', b.heuteGeloestDurch], ['Produkt in einem Satz', b.produktSatz],
      ...b.nicht.map((t, i): [string, string] => [`Was es nicht macht ${i + 1}`, t]),
      ['Wir glauben', b.outcome.wirGlauben], ['Wir merken es', b.outcome.wirMerkenEs],
      ...b.offeneFragen.map((t, i): [string, string] => [`Offene Frage ${i + 1}`, t]),
    ];
    for (const [feld, t] of felder) if (t) textVon('brief', `Brief · ${feld}`, t);
  }

  if (da(m.entscheidungen)) {
    // Ersetzte Zeilen sind Geschichte: ihre Verweise werden geprüft, ein fehlender Beleg nicht mehr angemahnt.
    const ersetzt = new Set(m.entscheidungen.entscheidungen.flatMap((e) => (e.ersetzt ? [e.ersetzt] : [])));
    for (const e of m.entscheidungen.entscheidungen) {
      belegeVon('entscheidungen', e.id, e.belegIds);
      textVon('entscheidungen', e.id, `${e.entscheidung}\n${e.grund}`);
      if (e.beleg !== 'keiner' && e.belegIds.length === 0 && !e.belegNotiz && !ersetzt.has(e.id)) {
        befund({ art: 'fehlender-beleg', artefakt: 'entscheidungen', ort: e.id, text: `${e.id} hat die Belegstufe „${BELEGSTUFE_TEXT[e.beleg]}“, nennt aber weder eine ID noch eine Notiz zum Beleg.` });
      }
    }
  }

  if (da(m.annahmen)) {
    for (const a of m.annahmen.annahmen) {
      belegeVon('annahmen', a.id, a.belegIds);
      textVon('annahmen', a.id, a.text);
      if (a.beleg !== 'keiner' && a.belegIds.length === 0) {
        befund({ art: 'fehlender-beleg', artefakt: 'annahmen', ort: a.id, text: `${a.id} hat die Belegstufe „${BELEGSTUFE_TEXT[a.beleg]}“, nennt aber keine ID als Beleg.` });
      }
    }
  }

  if (da(m.interviews)) {
    m.interviews.interviews.forEach((iv) => iv.chancen.forEach((c, j) => {
      if (c.belege.length === 0) befund({ art: 'fehlender-beleg', artefakt: 'interviews', ort: `${iv.id} · Chance ${j + 1}`, text: `${iv.id} · Chance ${j + 1} hat kein Zitat als Beleg.` });
    }));
    // Verwaist: kein Beleg im Entscheidungslog oder in der Annahmen-Map nennt das Interview oder eines seiner Zitate.
    // Ist eine der beiden Dateien unlesbar, lässt sich das nicht sagen.
    if (m.entscheidungen !== 'unlesbar' && m.annahmen !== 'unlesbar') {
      const genannt = new Set<string>([
        ...(da(m.entscheidungen) ? m.entscheidungen.entscheidungen.flatMap((e) => e.belegIds) : []),
        ...(da(m.annahmen) ? m.annahmen.annahmen.flatMap((a) => a.belegIds) : []),
      ]);
      for (const iv of m.interviews.interviews) {
        if (genannt.has(iv.id) || iv.zitate.some((z) => genannt.has(z.id))) continue;
        befund({ art: 'verwaist', artefakt: 'interviews', ort: iv.id, id: iv.id, text: `${iv.id} wird weder im Entscheidungslog noch in der Annahmen-Map als Beleg genannt.` });
      }
    }
  }

  return ergebnis;
}

const UEBERSCHRIFT: Record<BefundArt, string> = {
  'unbekannte-id': 'Unbekannte IDs',
  'fehlender-beleg': 'Fehlende Belege',
  verwaist: 'Verwaiste Elemente',
};

/** Markdown fürs Chatfenster: je Art eine Liste, dazu was fehlt oder nicht lesbar war. */
export function verknuepfungenText(v: Verknuepfungen): string {
  const titel = (n: ArtefaktName) => ARTEFAKTE[n].titel;
  const zeilen = ['# Verknüpfungen der Mappe', '', `Geprüft: ${v.geprueft.length ? v.geprueft.map(titel).join(', ') : 'nichts, die Mappe ist noch leer'}.`];
  if (v.fehlen.length) zeilen.push(`Noch nicht gespeichert: ${v.fehlen.map(titel).join(', ')}.`);
  if (v.unlesbar.length) zeilen.push(`Nicht lesbar (passt nicht zum Format der Werkstatt, dort neu speichern): ${v.unlesbar.map(titel).join(', ')}.`);
  if (v.befunde.length === 0) {
    zeilen.push('', 'Keine Lücken: Jede genannte ID gibt es, jede Belegstufe hat einen Beleg, jedes Interview wird genannt.');
    return zeilen.join('\n');
  }
  for (const art of Object.keys(UEBERSCHRIFT) as BefundArt[]) {
    const liste = v.befunde.filter((b) => b.art === art);
    if (liste.length) zeilen.push('', `## ${UEBERSCHRIFT[art]} (${liste.length})`, ...liste.map((b) => `- ${b.text}`));
  }
  return zeilen.join('\n');
}
