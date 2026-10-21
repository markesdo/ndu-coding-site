// Präsentator-Begleiter: Folienliste des Tages aus den Seitenquellen (<Folie> mit <h2 id>) und Zuordnung einer
// Beamer-Position (pfad, anker aus /api/position) zur Folie. Ohne DOM, damit testbar; die Seite ist pages/innolab/begleiter.astro.
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

/** Glob-Schlüssel „../pages/innolab/tag-1.astro“ → „/innolab/tag-1“ (index → Ordner). */
export function pfadAusGlob(schluessel: string): string {
  return schluessel.replace(/^(\.\.\/)*pages/, '').replace(/\.astro$/, '').replace(/\/index$/, '') || '/';
}

const ENTITAETEN: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', nbsp: ' ', shy: '' };

function textAus(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\{[^{}]*\}/g, '') // Astro-Ausdrücke
    .replace(/&(\w+);/g, (m, n: string) => ENTITAETEN[n] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Je <Folie …>…</Folie>: h2-id, Titel ohne Tags und alle weiteren id="…" im Block (Unter-Anker). */
export function folienAus(pfad: string, quelle: string): Folie[] {
  return [...quelle.matchAll(/<Folie\b[^>]*>([\s\S]*?)<\/Folie>/g)].flatMap(([, inhalt]) => {
    const h2 = inhalt.match(/<h2\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/);
    if (!h2) return [];
    const unterIds = [...inhalt.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]).filter((id) => id !== h2[1]);
    return [{ pfad, id: h2[1], titel: textAus(h2[2]), unterIds }];
  });
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
