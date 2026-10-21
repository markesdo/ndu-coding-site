// Kurstag und Stand der Mappe (MCP-Werkzeug tag_stand): Welcher Kurstag ist dran, welche Artefakte sind bis dahin
// fällig, und was ist davon noch leer oder dünn? Wie statistik.ts nur Zählen und Fehlendes benennen, kein Urteil über
// die Qualität – das ist Sache von artefakt_pruefen. Reine Funktionen, ohne Speicher, damit testbar.
import { ARTEFAKTE as KURS_ARTEFAKTE, TAGE, erzeugtVon, methodenVonTag } from '../components/methoden.js';
import { ARTEFAKTE, type ArtefaktName, type DatenVon } from './schemas/index.js';
import { ART_ANZEIGE, fehlendeArten } from './ui/editoren/annahmen-hilfen.js';
import { BRIEF_TAG1_FELDER } from './statistik.js';

const kursArtefakt = (name: ArtefaktName) => KURS_ARTEFAKTE.find((x) => x.werkstatt === name);

/** Interviews pro Person bis Tag 2 (Hausaufgabe am Artefakt „synthese“ in methoden.ts). */
export const INTERVIEWS_SOLL = kursArtefakt('interviews')?.hausaufgabe?.anzahl ?? 5;

// Fällig ist ein Artefakt zum Kurstag nach dem Tag seiner Methode, eine Hausaufgabe (Interviews mit Snapshots nach
// Tag 1, besprochen an Tag 2) zu ihrem bisTag.
export function faelligZuTag(name: ArtefaktName): number {
  const a = kursArtefakt(name);
  if (a?.hausaufgabe) return a.hausaufgabe.bisTag;
  const m = a && erzeugtVon(a.id);
  if (!m) throw new Error(`tag-stand: zu ${name} gibt es keine Methode in methoden.ts`);
  // Was am letzten Kurstag entsteht, ist an diesem fällig (danach gibt es keinen).
  return Math.min(m.tag + 1, TAGE.at(-1)!.n);
}

export const TAG_LAGEN = ['heute', 'naechster', 'gewaehlt', 'vorbei'] as const;
export type TagLage = (typeof TAG_LAGEN)[number];

export interface Kurstag {
  tag: number;
  titel: string;
  // Aus den Terminen der Kohorte; null = Termin offen.
  datum: string | null;
  lage: TagLage;
  // Frühere Kurstage, deren Termin noch offen ist (Tag 2 nach der Absage); ihre Artefakte sind mit fällig.
  ohneTermin: number[];
}

/** Welcher Kurstag ist dran? heute = Kalendertag in Wien (JJJJ-MM-TT). Ohne gewählten Tag: der Kurstag heute, sonst
 *  der mit dem nächsten Termin (nach Datum, nicht nach Nummer – ein verschobener Tag kann später liegen). Gibt es keinen
 *  Termin mehr, der nächste Tag ohne Termin nach dem letzten vergangenen, sonst ist der Kurs vorbei. Vor jedem Termin
 *  und ganz ohne Termine: Tag 1. Frühere Tage ohne Termin stehen in ohneTermin. */
export function kurstagBestimmen(termine: Record<string, string | null>, heute: string, gewaehlt?: number): Kurstag {
  const datum = (n: number) => termine[`tag${n}`] ?? null;
  const ohne = TAGE.filter((t) => datum(t.n) === null).map((t) => t.n);
  const tag = (n: number, lage: TagLage): Kurstag => ({
    tag: n,
    titel: TAGE.find((t) => t.n === n)!.titel,
    datum: datum(n),
    lage,
    ohneTermin: ohne.filter((x) => x < n),
  });
  if (gewaehlt !== undefined) return tag(gewaehlt, 'gewaehlt');
  const heuteTag = TAGE.find((t) => datum(t.n) === heute);
  if (heuteTag) return tag(heuteTag.n, 'heute');
  const mitDatum = TAGE.filter((t) => datum(t.n) !== null).sort((x, y) => datum(x.n)!.localeCompare(datum(y.n)!));
  const kommt = mitDatum.find((t) => datum(t.n)! > heute);
  if (kommt) return tag(kommt.n, 'naechster');
  const vorbei = mitDatum.map((t) => t.n);
  const letzter = vorbei.length ? Math.max(...vorbei) : 0;
  const offen = ohne.find((n) => n > letzter);
  if (offen !== undefined) return tag(offen, 'naechster');
  return tag(mitDatum.at(-1)!.n, 'vorbei');
}

export const STAENDE = ['leer', 'duenn', 'ausgefuellt', 'unlesbar', 'nicht-gelesen'] as const;
export type Stand = (typeof STAENDE)[number];

export interface ArtefaktStand {
  artefakt: ArtefaktName;
  titel: string;
  stand: Stand;
  // Ein Satz zum Umfang („2 von 5 Snapshots“).
  umfang: string;
  // Was fehlt oder dünn ist („I3 ohne Chance“); leer bei ausgefüllt.
  fehlt: string[];
}

const leer = (s: string | undefined) => (s ?? '').trim() === '';
const anzahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`;

// Umfang und Fehlendes je Artefakt; leer = nichts Eigenes eingetragen.
const ZAEHLEN: { [N in ArtefaktName]: (d: DatenVon<N>) => { leer: boolean; umfang: string; fehlt: string[] } } = {
  brief: (b) => {
    const fehlen = BRIEF_TAG1_FELDER.filter((f) => !f.ausgefuellt(b)).map((f) => f.name);
    const nicht = b.nicht.filter((n) => !leer(n)).length;
    const fehlt = fehlen.length ? [`fehlt: ${fehlen.join(', ')}`] : [];
    if (nicht > 0 && nicht < 3) fehlt.push(`„Was macht es NICHT?“: ${nicht} von 3`);
    // Leer nur, wenn auch Produktsatz und offene Fragen (kommen später) leer sind.
    const spaeter = !leer(b.produktSatz) || b.offeneFragen.some((f) => !leer(f));
    return { leer: fehlen.length === BRIEF_TAG1_FELDER.length && !spaeter, umfang: `${BRIEF_TAG1_FELDER.length - fehlen.length} von ${BRIEF_TAG1_FELDER.length} Feldern`, fehlt };
  },
  entscheidungen: (d) => {
    // Eine ersetzte Zeile bleibt stehen und lässt sich nicht mehr ändern; was ihr fehlt, ist keine offene Aufgabe.
    const ersetzt = new Set(d.entscheidungen.map((e) => e.ersetzt).filter((x): x is string => x !== undefined));
    const fehlt = d.entscheidungen.filter((e) => !ersetzt.has(e.id)).flatMap((e) => [
      ...(leer(e.entscheidung) ? [`${e.id} ohne Entscheidung`] : []),
      ...(leer(e.grund) ? [`${e.id} ohne Grund`] : []),
    ]);
    const mitText = d.entscheidungen.filter((e) => !leer(e.entscheidung) || !leer(e.grund)).length;
    return { leer: mitText === 0, umfang: anzahl(mitText, 'Entscheidung', 'Entscheidungen'), fehlt };
  },
  annahmen: (d) => {
    // Wie der Hinweis im Editor, aber nur Annahmen mit Text zählen.
    const mitText = d.annahmen.filter((a) => !leer(a.text));
    const arten = fehlendeArten(mitText);
    const riskanteste = mitText.some((a) => a.id === d.riskanteste);
    const fehlt = [
      ...d.annahmen.filter((a) => leer(a.text)).map((a) => `${a.id} ohne Text`),
      ...(arten.length ? [`keine Annahme der Art: ${arten.map((x) => ART_ANZEIGE[x].text).join(', ')}`] : []),
      ...(riskanteste ? [] : ['riskanteste Annahme nicht markiert']),
    ];
    return { leer: mitText.length === 0, umfang: anzahl(mitText.length, 'Annahme', 'Annahmen'), fehlt };
  },
  leitfaden: (d) => {
    const kern = d.fragen.filter((f) => f.art === 'kern' && !leer(f.text)).length;
    const nach = d.fragen.filter((f) => f.art === 'nachfrage' && !leer(f.text)).length;
    const fehlt = [
      ...(leer(d.ziel) ? ['Ziel fehlt'] : []),
      ...(leer(d.wen) ? ['„Wen“ fehlt'] : []),
      ...(kern === 0 ? ['keine Kernfragen'] : []),
      ...(nach === 0 ? ['keine Nachfragen'] : []),
      ...(leer(d.abschluss) ? ['Abschluss fehlt'] : []),
    ];
    // Der Einstieg ist vorbefüllt; ohne Ziel, Wen, Fragen mit Text und Abschluss ist noch nichts Eigenes da.
    return { leer: leer(d.ziel) && leer(d.wen) && leer(d.abschluss) && kern + nach === 0, umfang: `${anzahl(kern, 'Kernfrage', 'Kernfragen')}, ${anzahl(nach, 'Nachfrage', 'Nachfragen')}`, fehlt };
  },
  interviews: (d) => {
    // Ein Snapshot zählt erst, wenn etwas drinsteht; eine leere Zeile ist noch kein geführtes Interview.
    const gefuellt = (iv: (typeof d.interviews)[number]) =>
      !leer(iv.zitat) || !leer(iv.kurzinfos) || !leer(iv.notizen) || iv.einsichten.some((e) => !leer(e)) || iv.chancen.some((c) => !leer(c.text)) || iv.zitate.some((z) => !leer(z.text));
    const n = d.interviews.filter(gefuellt).length;
    const fehlt = [
      ...(n < INTERVIEWS_SOLL ? [`noch ${INTERVIEWS_SOLL - n} von ${INTERVIEWS_SOLL} Interviews offen`] : []),
      ...d.interviews.flatMap((iv) => {
        if (!gefuellt(iv)) return [`${iv.id} noch leer`];
        const ohne = [
          ...(leer(iv.zitat) ? ['Zitat'] : []),
          ...(leer(iv.kurzinfos) ? ['Kurzinfos'] : []),
          ...(iv.einsichten.every(leer) ? ['Einsicht'] : []),
          ...(iv.chancen.every((c) => leer(c.text)) ? ['Chance'] : []),
        ];
        return ohne.length ? [`${iv.id} ohne ${ohne.join(', ')}`] : [];
      }),
    ];
    return { leer: n === 0, umfang: n > INTERVIEWS_SOLL ? `${n} Snapshots (${INTERVIEWS_SOLL} verlangt)` : `${n} von ${INTERVIEWS_SOLL} Snapshots`, fehlt };
  },
};

/** Stand eines Artefakts: daten null = noch nicht gespeichert, 'unlesbar' = passt nicht zum Format, 'nicht-gelesen' = GitHub
 *  hat gerade nicht geantwortet. */
export function artefaktStand<N extends ArtefaktName>(name: N, daten: DatenVon<N> | null | 'unlesbar' | 'nicht-gelesen'): ArtefaktStand {
  const titel = ARTEFAKTE[name].titel;
  if (daten === 'unlesbar') return { artefakt: name, titel, stand: 'unlesbar', umfang: 'passt nicht zum Format der Werkstatt', fehlt: [] };
  if (daten === 'nicht-gelesen') return { artefakt: name, titel, stand: 'nicht-gelesen', umfang: 'ließ sich gerade nicht lesen, später noch einmal versuchen', fehlt: [] };
  if (daten === null) return { artefakt: name, titel, stand: 'leer', umfang: 'noch nicht angelegt', fehlt: [] };
  const z = ZAEHLEN[name](daten);
  return { artefakt: name, titel, stand: z.leer ? 'leer' : z.fehlt.length ? 'duenn' : 'ausgefuellt', umfang: z.umfang, fehlt: z.leer ? [] : z.fehlt };
}

/** Bis zum Kurstag fällige Artefakte (in Kursreihenfolge), nur die, die die Kohorte in der Werkstatt hat. */
export function faelligBis(tag: number, vorhanden: readonly ArtefaktName[]): ArtefaktName[] {
  return vorhanden.filter((n) => faelligZuTag(n) <= tag);
}

/** Artefakte, an denen ab diesem Kurstag gearbeitet wird (fällig zum nächsten), z. B. an Tag 1 Brief bis Interviews. */
export function inArbeitAn(tag: number, vorhanden: readonly ArtefaktName[]): ArtefaktName[] {
  return vorhanden.filter((n) => faelligZuTag(n) === tag + 1);
}

/** Was an diesem Kurstag neu entsteht (Methoden des Tages). */
export const entstehtAn = (tag: number) => methodenVonTag(tag).map((m) => ({ slug: m.slug, name: m.name }));
