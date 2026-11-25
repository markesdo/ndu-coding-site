// Verknüpfungen der Mappe prüfen (deterministisch, ohne KI): unbekannte IDs, fehlende Belege, verwaiste Interviews,
// riskanteste Annahme ohne Beleg trotz Interviews.
// Grundlage für das MCP-Werkzeug verknuepfungen_pruefen und später für die Lehrende-Ansicht (Spec §3.4, §3.7).
import { entscheidungsIds, ersetztDurch, getanHatEigeneQuelle, getanMitNotiz, getanQuellePruefer } from './belege.js';
import { AKTIVE_ARTEFAKTE, ARTEFAKTE, BELEGSTUFE_TEXT, STILLGELEGT, interviewGefuellt, type Annahmen, type ArtefaktName, type Brief, type Entscheidungen, type Interviews, type Leitfaden } from './schemas/index.js';

// Je Artefakt: die Daten, null = noch nicht gespeichert, 'unlesbar' = Datei passt nicht zum Schema.
type Eintrag<T> = T | null | 'unlesbar';
export interface MappeDaten {
  brief: Eintrag<Brief>;
  entscheidungen: Eintrag<Entscheidungen>;
  leitfaden: Eintrag<Leitfaden>;
  annahmen: Eintrag<Annahmen>;
  interviews: Eintrag<Interviews>;
}

export const BEFUND_ARTEN = ['unbekannte-id', 'fehlender-beleg', 'verwaist', 'riskanteste-ohne-beleg'] as const;
export type BefundArt = (typeof BEFUND_ARTEN)[number];
export interface Befund {
  art: BefundArt;
  artefakt: ArtefaktName;
  // Wo: ID der Zeile (D4) oder Feld (Brief · Offene Frage 2, I2 · Chance 1).
  ort: string;
  // Die unbekannte ID, das verwaiste Element bzw. die riskanteste Annahme ohne Beleg.
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
const QUELLE_FEST = { D: 'entscheidungen', A: 'annahmen', F: 'leitfaden', I: 'interviews' } as const satisfies Record<string, ArtefaktName>;
const QUELLE: Partial<Record<string, ArtefaktName>> = QUELLE_FEST;
// IDs im Fließtext: nur die Präfixe, die die Mappe schon kennt, damit „S1“ (S-Bahn) keinen Befund auslöst; nach dem
// Wort „der“, „auf“, „von“ … ist eher die Autobahn gemeint („von der A2“), nach „oder“ oder „Kunden“ nicht.
const VOR_STRASSE = '(?<![\\p{L}])(?:der|die|den|dem|auf|von|über|Richtung|zur|zum) ';
const ID_IM_TEXT = new RegExp(`(?<![\\p{L}\\p{N}-])(?<!${VOR_STRASSE})[${Object.keys(QUELLE_FEST).join('')}][1-9][0-9]*(?:-[1-9][0-9]*)?(?![\\p{L}\\p{N}-])`, 'gu');
const idsImText = (t: string): string[] => [...t.matchAll(ID_IM_TEXT)].map(([id]) => id);

const da = <T>(e: Eintrag<T>): e is T => e !== null && e !== 'unlesbar';

export function verknuepfungenPruefen(m: MappeDaten): Verknuepfungen {
  const ergebnis: Verknuepfungen = {
    befunde: [],
    // Stillgelegte Artefakte (Entscheidungslog, NDU-70) werden nicht erwartet: weder geprüft noch als fehlend gemeldet.
    geprueft: AKTIVE_ARTEFAKTE.filter((n) => da(m[n])),
    fehlen: AKTIVE_ARTEFAKTE.filter((n) => m[n] === null),
    unlesbar: AKTIVE_ARTEFAKTE.filter((n) => m[n] === 'unlesbar'),
  };
  const befund = (b: Befund) => ergebnis.befunde.push(b);
  // Das stillgelegte Entscheidungslog (NDU-70): Gespeicherte Zeilen lösen D-IDs weiter auf und nennen Interviews. Ist die
  // alte Datei unlesbar, lassen sich D-IDs nicht prüfen (kein Befund dazu); gemeldet wird sie nirgends mehr.
  const log = m.entscheidungen === 'unlesbar' ? null : m.entscheidungen;
  const logUnlesbar = m.entscheidungen === 'unlesbar';

  const bekannt = new Set<string>();
  if (da(log)) log.entscheidungen.forEach((e) => bekannt.add(e.id));
  if (da(m.annahmen)) m.annahmen.annahmen.forEach((a) => bekannt.add(a.id));
  if (da(m.leitfaden)) m.leitfaden.fragen.forEach((f) => bekannt.add(f.id));
  if (da(m.interviews)) m.interviews.interviews.forEach((iv) => { bekannt.add(iv.id); iv.zitate.forEach((z) => bekannt.add(z.id)); });

  // Warum eine ID nicht aufgelöst wird; null = sie wird aufgelöst oder lässt sich nicht prüfen (Quelle unlesbar).
  const warumUnbekannt = (id: string): string | null => {
    if (bekannt.has(id)) return null;
    const quelle = QUELLE[id[0]];
    if (!quelle) return `${id} gehört zu einem späteren Kurstag; in der Mappe gibt es das noch nicht.`;
    // Stillgelegtes Artefakt (Entscheidungslog): unlesbar → nicht prüfbar; sonst nie auf es verweisen, niemand legt es an.
    if (STILLGELEGT.includes(quelle)) return logUnlesbar ? null : `In der Mappe gibt es ${id} nicht.`;
    if (m[quelle] === 'unlesbar') return null;
    const titel = ARTEFAKTE[quelle].titel;
    if (m[quelle] === null) return `„${titel}“ ist noch nicht gespeichert, ${id} gibt es darum noch nicht.`;
    const interview = id.split('-')[0];
    if (quelle === 'interviews' && id.includes('-') && bekannt.has(interview)) return `${interview} hat kein Zitat ${id}.`;
    return `In „${titel}“ gibt es ${id} nicht.`;
  };

  const belegeVon = (artefakt: ArtefaktName, ort: string, ids: readonly string[]) => {
    for (const id of ids) {
      const warum = warumUnbekannt(id);
      if (warum) befund({ art: 'unbekannte-id', artefakt, ort, id, text: `${ort} nennt ${id} als Beleg. ${warum}` });
    }
  };
  const textVon = (artefakt: ArtefaktName, ort: string, t: string) => {
    for (const id of idsImText(t)) {
      const warum = warumUnbekannt(id);
      if (warum) befund({ art: 'unbekannte-id', artefakt, ort, id, text: `${ort} nennt ${id} im Text. Ist das eine ID? ${warum}` });
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

  // Das Entscheidungslog selbst prüfen wir nicht mehr (in diesem Kursjahr stillgelegt, NDU-70): keine Befunde zu seinen
  // Zeilen. Seine IDs und Beleg-Notizen zählen oben und unten weiter, damit Verweise darauf nicht als unbekannt gelten.

  if (da(m.annahmen)) {
    // Eine alte Log-Zeile, die selbst „getan“ mit Quelle ist, trägt weiter; das Wort Entscheidungslog steht in keinem Befund.
    const hatQuelle = da(log) ? getanQuellePruefer(log) : getanHatEigeneQuelle;
    const nachId = new Map(da(log) ? log.entscheidungen.map((e) => [e.id, e] as const) : []);
    const ersetztVon = da(log) ? ersetztDurch(log.entscheidungen) : new Map<string, string>();
    for (const a of m.annahmen.annahmen) {
      belegeVon('annahmen', a.id, a.belegIds);
      textVon('annahmen', a.id, `${a.text}\n${a.belegNotiz ?? ''}`);
      // Skala nach Bland: „gesagt“ und „erzählt“ kommen aus Gesprächen, also aus den Interviews. Ein D- oder A-Verweis
      // oder eine Beleg-Notiz allein reicht dafür nicht.
      if ((a.beleg === 'gesagt' || a.beleg === 'erzaehlt') && !a.belegIds.some((id) => QUELLE[id[0]] === 'interviews')) {
        befund({ art: 'fehlender-beleg', artefakt: 'annahmen', ort: a.id, text: `${a.id} hat die Belegstufe „${BELEGSTUFE_TEXT[a.beleg]}“, nennt aber kein Interview oder Zitat als Beleg.` });
      }
      // „getan“ heißt beobachtet, gemessen, bezahlt: Regel in belege.ts. Ohne Quelle fragt man nach (Begleiter Annahmen-Map:
      // „getan, aber ohne Quelle – nachfragen“). Still nur, wenn es nichts zu prüfen gibt: altes Log unlesbar, oder jede
      // genannte D-ID ist unbekannt (dafür steht schon der Befund zur unbekannten ID). Sonst zählen die aufgelösten.
      const dIds = entscheidungsIds(a);
      const dNichtPruefbar = dIds.length > 0 && (logUnlesbar || dIds.every((id) => warumUnbekannt(id) !== null));
      if (!hatQuelle(a) && !dNichtPruefbar) {
        // Würde eine genannte alte Zeile tragen, ist aber ersetzt: auf die Ersatzzeile zeigen.
        const ersetzte = dIds.filter((id) => { const e = nachId.get(id); return e !== undefined && getanMitNotiz(e) && ersetztVon.has(id); });
        const zusatz = ersetzte.map((id) => ` ${id} ist ersetzt – nennt die neue Zeile (${ersetztVon.get(id)}).`).join('');
        befund({ art: 'fehlender-beleg', artefakt: 'annahmen', ort: a.id, text: `${a.id} hat die Belegstufe „getan“, nennt aber keine Quelle (Beleg-Notiz). Ein Interview-Zitat belegt höchstens „erzählt“. Wo liegt das beobachtete Verhalten?${zusatz}` });
      }
    }
    // Die riskanteste Annahme hat gar keinen Beleg (Stufe „noch keiner“, keine auflösbare ID, keine Notiz), obwohl schon
    // Interviews mit Inhalt gespeichert sind. „verwaist“ sieht das nicht, sobald eine alte Log-Zeile die Interviews nennt.
    // Stufe „noch keiner“ mit aufgelöster ID oder Notiz zählt nicht: Da liegt etwas, nur die Stufe fehlt. Eine unbekannte
    // ID ist kein Beleg (dafür steht zusätzlich der Befund zur unbekannten ID); eine ID, die sich nicht prüfen lässt
    // (Quelle unlesbar, auch das alte Log), zählt im Zweifel als Beleg. Andere Stufen ohne Beleg meldet schon „fehlender-beleg“.
    const { riskanteste } = m.annahmen;
    const r = m.annahmen.annahmen.find((a) => a.id === riskanteste);
    const gefuehrt = da(m.interviews) ? m.interviews.interviews.filter(interviewGefuellt).length : 0;
    if (r && r.beleg === 'keiner' && r.belegIds.every((id) => warumUnbekannt(id) !== null) && !r.belegNotiz?.trim() && gefuehrt > 0) {
      befund({ art: 'riskanteste-ohne-beleg', artefakt: 'annahmen', ort: r.id, id: r.id, text: `${r.id} ist deine riskanteste Annahme und hat noch keinen Beleg, obwohl ${gefuehrt === 1 ? '1 Interview gespeichert ist' : `${gefuehrt} Interviews gespeichert sind`}. Was hast du dazu gehört?` });
    }
  }

  if (da(m.interviews)) {
    m.interviews.interviews.forEach((iv) => iv.chancen.forEach((c, j) => {
      if (c.belege.length === 0) befund({ art: 'fehlender-beleg', artefakt: 'interviews', ort: `${iv.id} · Chance ${j + 1}`, text: `${iv.id} · Chance ${j + 1} hat kein Zitat als Beleg.` });
    }));
    // Verwaist: Weder die Annahmen-Map noch eine lesbare alte Log-Zeile nennt das Interview oder eines seiner Zitate (als
    // Beleg oder im Text). Ob geprüft wird, entscheidet allein die Annahmen-Map (das Log ist stillgelegt, NDU-70): Ist sie
    // nicht gespeichert oder unlesbar, gibt es nichts zu sagen; ein unlesbares Log schaltet die Prüfung nicht ab.
    if (da(m.annahmen)) {
      const genannt = new Set<string>([
        ...m.annahmen.annahmen.flatMap((a) => [...a.belegIds, ...idsImText(a.text)]),
        ...(da(log) ? log.entscheidungen.flatMap((e) => [...e.belegIds, ...idsImText(`${e.entscheidung}\n${e.grund}`)]) : []),
      ]);
      for (const iv of m.interviews.interviews) {
        if (genannt.has(iv.id) || iv.zitate.some((z) => genannt.has(z.id))) continue;
        befund({ art: 'verwaist', artefakt: 'interviews', ort: iv.id, id: iv.id, text: `${iv.id} wird in der Annahmen-Map nicht als Beleg genannt.` });
      }
    }
  }

  return ergebnis;
}

const UEBERSCHRIFT = {
  'unbekannte-id': 'Unbekannte IDs',
  'fehlender-beleg': 'Fehlende Belege',
  verwaist: 'Verwaiste Elemente',
  'riskanteste-ohne-beleg': 'Riskanteste Annahme ohne Beleg',
} as const satisfies Record<BefundArt, string>;

/** Markdown fürs Chatfenster: je Art eine Liste, dazu was fehlt oder nicht lesbar war. */
export function verknuepfungenText(v: Verknuepfungen): string {
  const titel = (n: ArtefaktName) => ARTEFAKTE[n].titel;
  const zeilen = ['# Verknüpfungen der Mappe', '', `Geprüft: ${v.geprueft.length ? v.geprueft.map(titel).join(', ') : 'nichts, die Mappe ist noch leer'}.`];
  if (v.fehlen.length) zeilen.push(`Noch nicht gespeichert: ${v.fehlen.map(titel).join(', ')}.`);
  if (v.unlesbar.length) zeilen.push(`Nicht lesbar (passt nicht zum Format der Werkstatt, dort neu speichern): ${v.unlesbar.map(titel).join(', ')}.`);
  if (v.befunde.length === 0) {
    zeilen.push('', 'Keine Lücken: Jede genannte ID gibt es, jede Belegstufe hat einen Beleg, jedes Interview wird genannt, und die riskanteste Annahme hat einen Beleg oder es gibt noch keine Interviews.');
    return zeilen.join('\n');
  }
  for (const art of BEFUND_ARTEN) {
    const liste = v.befunde.filter((b) => b.art === art);
    if (liste.length) zeilen.push('', `## ${UEBERSCHRIFT[art]} (${liste.length})`, ...liste.map((b) => `- ${b.text}`));
  }
  return zeilen.join('\n');
}
