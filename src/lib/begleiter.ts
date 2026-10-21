// Präsentator-Begleiter: Folienliste des Tages aus den Seitenquellen (<Folie> mit <h2 id>) und Zuordnung einer
// Beamer-Position (pfad, anker aus /api/position) zur Folie. Ohne DOM, damit testbar; die Seite ist pages/innolab/begleiter.astro.
import { textAusHtml, ueberschriftAusHtml } from '../components/abschnitt';
import type { Notiz } from '../data/begleiter/typen';

export type Folie = { pfad: string; id: string; titel: string; unterIds: string[] };

/** Reihenfolge von Tag 1 nach dem Zeitplan in tag-1.astro (für „nächste Folie“ und die Folienliste). */
export const TAG_1_SEITEN: string[] = [
  '/innolab/tag-1',
  '/innolab/methoden/problem-rahmen',
  '/innolab/methoden/entscheidungslog',
  '/innolab/methoden/annahmen',
  '/innolab/methoden/interview',
  '/innolab/tag-1/abschluss',
];

/** Name je Seite von Tag 1, falls der Layout-Titel im Quelltext nicht lesbar ist. */
const SEITEN_NAMEN: Record<string, string> = {
  '/innolab/tag-1': 'Tag 1 · Rahmen & Verstehen',
  '/innolab/methoden/problem-rahmen': 'Problem-Rahmen & Produkt-Brief',
  '/innolab/methoden/entscheidungslog': 'Entscheidungslog',
  '/innolab/methoden/annahmen': 'Annahmen-Map',
  '/innolab/methoden/interview': 'Jobs to be Done & Mom Test',
  '/innolab/tag-1/abschluss': 'Tag 1 · Abschluss',
};

/** Glob-Schlüssel („../pages/innolab/tag-1.astro“ oder „/src/pages/innolab/tag-1.astro“) → „/innolab/tag-1“ (index → Ordner). */
export function pfadAusGlob(schluessel: string): string {
  return schluessel.replace(/^(?:\.\.\/)*(?:\/?src\/)?pages(?=\/)/, '').replace(/\.astro$/, '').replace(/\/index$/, '') || '/';
}

/** Ergebnis von import.meta.glob(…, { query: '?raw', … }) → Seitenpfad → Quelltext. */
export function quellenAusGlob(glob: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(glob).map(([k, v]) => [pfadAusGlob(k), v]));
}

/** Titel aus <Layout title="…">, title='…', title={"…"} oder title={`…`} (ohne ${}); sonst null. */
export function layoutTitel(quelle: string): string | null {
  const tag = quelle.match(/<Layout\b[^>]*?\btitle=(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`$]*)`)\s*\})/);
  const roh = tag?.slice(1).find((t) => t !== undefined);
  return roh === undefined ? null : textAusHtml(roh) || null;
}

/** Name einer Seite für Kopf und Folienliste: Layout-Titel, sonst SEITEN_NAMEN, sonst der Pfad. */
export function seitenLabel(pfad: string, quelle: string): string {
  return layoutTitel(quelle) ?? SEITEN_NAMEN[pfad] ?? pfad;
}

const UEBERSCHRIFT = /<(h2|h3)\b([^>]*)>([\s\S]*?)<\/\1>/g;

/**
 * Je <Folie …>…</Folie>: h2-id, Titel (ueberschriftAusHtml) und Unter-Anker = ids der h2/h3 in der Folie, dazu die
 * h2/h3 außerhalb jeder Folie, die nach ihr und vor der nächsten Folie stehen (z. B. #werkstatt, #pruefen). Anker vor
 * der ersten Folie (z. B. #ablauf) gehören zur ersten Folie.
 */
export function folienAus(pfad: string, quelle: string): Folie[] {
  const bloecke = [...quelle.matchAll(/<Folie\b[^>]*>[\s\S]*?<\/Folie>/g)].map((m) => ({ von: m.index!, bis: m.index! + m[0].length }));
  const anker = [...quelle.matchAll(UEBERSCHRIFT)].flatMap((m) => {
    const id = m[2].match(/\bid="([^"]+)"/)?.[1];
    return id ? [{ id, tag: m[1], html: m[3], bei: m.index! }] : [];
  });
  const folien: (Folie & { von: number })[] = [];
  for (const b of bloecke) {
    const drin = anker.filter((a) => a.bei > b.von && a.bei < b.bis);
    const h2 = drin.find((a) => a.tag === 'h2');
    if (!h2) continue;
    folien.push({ pfad, id: h2.id, titel: ueberschriftAusHtml(h2.html), unterIds: drin.filter((a) => a !== h2).map((a) => a.id), von: b.von });
  }
  if (folien.length === 0) return [];
  for (const a of anker) {
    if (bloecke.some((b) => a.bei > b.von && a.bei < b.bis)) continue;
    const davor = folien.filter((f) => f.von < a.bei).at(-1) ?? folien[0];
    davor.unterIds.push(a.id);
  }
  return folien.map(({ von: _von, ...f }) => f);
}

/** Alle Folien von Tag 1 in Tagesreihenfolge; Schlüssel von quellen = Seitenpfad. */
export function tagFolien(quellen: Record<string, string>): Folie[] {
  return TAG_1_SEITEN.flatMap((pfad) => folienAus(pfad, quellen[pfad] ?? ''));
}

/**
 * Index der Folie zur Beamer-Position: h2-id oder Unter-Anker. Leerer oder unbekannter Anker auf einer Seite des Tages →
 * erste Folie dieser Seite; Seite nicht im Tag → null.
 */
export function folieZu(folien: Folie[], pfad: string, anker: string): number | null {
  const ersteDerSeite = folien.findIndex((f) => f.pfad === pfad);
  if (ersteDerSeite < 0) return null;
  if (anker) {
    const i = folien.findIndex((f) => f.pfad === pfad && (f.id === anker || f.unterIds.includes(anker)));
    if (i >= 0) return i;
  }
  return ersteDerSeite;
}

/** „pfad#id“ jeder Notiz, zu der es keine Folie gibt (z. B. nach Umbenennen der h2-id). */
export function notizenOhneFolie(folien: Folie[], notizen: Record<string, Record<string, Notiz>>): string[] {
  const da = new Set(folien.map((f) => `${f.pfad}#${f.id}`));
  return Object.entries(notizen).flatMap(([pfad, je]) => Object.keys(je).map((id) => `${pfad}#${id}`).filter((k) => !da.has(k)));
}

/** „pfad#id: Name“ jeder Notiz, deren miro.frame nicht auf dem Team-Board steht (miro-frames.ts). */
export function notizenMitFremdemFrame(notizen: Record<string, Record<string, Notiz>>, frames: Readonly<Record<string, string>>): string[] {
  return Object.entries(notizen).flatMap(([pfad, je]) =>
    Object.entries(je).flatMap(([id, n]) => {
      const frame = n.miro?.frame;
      return frame !== undefined && !Object.hasOwn(frames, frame) ? [`${pfad}#${id}: ${frame}`] : [];
    }),
  );
}
