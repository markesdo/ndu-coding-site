// Präsentator-Begleiter: Folienliste des Tages aus den Seitenquellen (<Folie> mit <h2 id>) und Zuordnung einer
// Beamer-Position (pfad, anker aus /api/position) zur Folie. Ohne DOM, damit testbar; die Seite ist pages/innolab/begleiter.astro.
import { textAusHtml, ueberschriftAusHtml } from '../components/abschnitt';
import type { Notiz } from '../data/begleiter/typen';

/** satz = erster <p class="folie-satz"> der Folie (steht auf dem Beamer), sonst null. */
export type Folie = { pfad: string; id: string; titel: string; satz: string | null; unterIds: string[] };

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
    const satz = quelle.slice(b.von, b.bis).match(/<p\b[^>]*\bclass="folie-satz"[^>]*>([\s\S]*?)<\/p>/)?.[1];
    folien.push({
      pfad, id: h2.id, titel: ueberschriftAusHtml(h2.html), satz: satz === undefined ? null : textAusHtml(satz) || null,
      unterIds: drin.filter((a) => a !== h2).map((a) => a.id), von: b.von,
    });
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

/** Ein Block aus dem Ablauf (<Block time="09:00–09:40" title="…" href="…">); von/bis in Minuten ab Mitternacht. */
export type Block = { von: number; bis: number; titel: string; href: string | null };

const minutenAus = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Alle <Block> mit lesbarer Zeit aus einer Seitenquelle (Ablauf von tag-1.astro), in Quelltext-Reihenfolge. */
export function bloeckeAus(quelle: string): Block[] {
  return [...quelle.matchAll(/<Block\b([^>]*)>/g)].flatMap((m) => {
    const attr = (name: string) => m[1].match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
    const zeit = attr('time')?.match(/^(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})$/);
    if (!zeit) return [];
    return [{ von: minutenAus(zeit[1]), bis: minutenAus(zeit[2]), titel: textAusHtml(attr('title') ?? ''), href: attr('href') ?? null }];
  });
}

/** Kurstag aus data-kurstag="2026-10-22" im Ablauf, sonst null. */
export function kurstagAus(quelle: string): string | null {
  return quelle.match(/\bdata-kurstag="(\d{4}-\d{2}-\d{2})"/)?.[1] ?? null;
}

/** Führende Minuten aus einer Übungsdauer („60 min (15 + 10 …)“ → 60); ohne Zahl vorn („bis Tag 2 …“) null. */
export function uebungMinuten(dauer: string | undefined): number | null {
  const m = dauer?.match(/^(\d+)\s*min\b/);
  return m ? Number(m[1]) : null;
}

/** Soll-Zeit einer Folie: ihr Block (Titel, von, bis) und das Zeitfenster der Folie darin, alles in Minuten. */
export type PlanFolie = { block: string; von: number; bis: number; sollVon: number; sollBis: number };

/** Mindestzeit je Folie ohne Übung, bevor die Übungen ihre volle Dauer bekommen. */
const MIN_JE_FOLIE = 2;

/**
 * Soll-Zeit je Folie aus dem Ablauf. Ein Block mit href beginnt bei der Folie, auf die href zeigt („#kickoff“ auf
 * seite, „/pfad#anker“, „/pfad“), und reicht bis vor die Folie des nächsten Blocks; Pausen (ohne href) zählen nicht.
 * Im Block bekommen Übungen ihre Dauer (minuten(i)), die übrigen Folien teilen sich den Rest, mindestens je
 * MIN_JE_FOLIE (dann werden die Übungen gestaucht); reicht der Block nicht einmal dafür, alle gleich viel.
 * Folien vor dem ersten Block → null.
 */
export function folienPlan(folien: Folie[], bloecke: Block[], minuten: (i: number) => number | null, seite = TAG_1_SEITEN[0]): (PlanFolie | null)[] {
  const starts = bloecke.flatMap((b) => {
    if (!b.href) return [];
    const [pfad, anker = ''] = b.href.startsWith('#') ? [seite, b.href.slice(1)] : b.href.split('#');
    const i = folieZu(folien, pfad, anker);
    return i === null ? [] : [{ b, i }];
  }).sort((x, y) => x.i - y.i);
  const plan: (PlanFolie | null)[] = folien.map(() => null);
  starts.forEach(({ b, i: von }, k) => {
    const bis = k + 1 < starts.length ? starts[k + 1].i : folien.length;
    if (bis <= von) return;
    const idx = Array.from({ length: bis - von }, (_, j) => von + j);
    const ueb = idx.map((i) => minuten(i));
    const dauer = b.bis - b.von;
    const uebSumme = ueb.reduce<number>((s, m) => s + (m ?? 0), 0);
    const ohne = ueb.filter((m) => m === null).length;
    let anteile: number[];
    if (dauer < MIN_JE_FOLIE * ohne || (uebSumme === 0 && ohne === 0)) anteile = idx.map(() => dauer / idx.length);
    else if (uebSumme + MIN_JE_FOLIE * ohne <= dauer) {
      const rest = ohne > 0 ? (dauer - uebSumme) / ohne : 0;
      const streck = ohne === 0 ? dauer / uebSumme : 1; // nur Übungen: auf den Block strecken
      anteile = ueb.map((m) => (m === null ? rest : m * streck));
    } else {
      const fuerUeb = dauer - MIN_JE_FOLIE * ohne;
      anteile = ueb.map((m) => (m === null ? MIN_JE_FOLIE : (m * fuerUeb) / uebSumme));
    }
    let t = b.von;
    idx.forEach((i, j) => { plan[i] = { block: b.titel, von: b.von, bis: b.bis, sollVon: t, sollBis: t + anteile[j] }; t += anteile[j]; });
  });
  return plan;
}

/**
 * Wo Markus gegenüber dem Plan steht: rest = Minuten bis Blockende (negativ = überzogen); abweichung > 0 = so viele
 * Minuten hinten (Folie hätte schon vorbei sein sollen), < 0 = vorn (Folie wäre erst später dran), 0 = im Plan.
 */
export function tempo(p: PlanFolie, jetzt: number): { rest: number; abweichung: number } {
  const abweichung = jetzt > p.sollBis ? jetzt - p.sollBis : jetzt < p.sollVon ? jetzt - p.sollVon : 0;
  return { rest: Math.round(p.bis - jetzt), abweichung: Math.round(abweichung) };
}
