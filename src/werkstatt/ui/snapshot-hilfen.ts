// Reine Hilfen für den Zeigen-Modus im Leser der Lehrenden (SnapshotAnsicht.tsx, Zeigen.tsx): Belege auflösen,
// synthetische Interviews erkennen, blättern, Tasten, Personen-Reiter, Neu laden.
import { interviewGefuellt, type Chance, type Interview, type Interviews } from '../schemas/index.js';
import type { LehrendenMappe } from '../vertrag.js';
import { nachbar } from './lehrenden-hilfen.js';

export type AufgeloesterBeleg = { id: string; text: string | null };

/** Belege einer Chance mit dem Text des Zitats aus demselben Interview; unbekannte IDs mit text null. */
export function belegeAufloesen(chance: Chance, zitate: readonly { id: string; text: string }[]): AufgeloesterBeleg[] {
  return chance.belege.map((id) => ({ id, text: zitate.find((z) => z.id === id)?.text ?? null }));
}

/** Synthetisch (erfunden, zählt nicht als Beleg): Pseudonym beginnt mit „Synthetisch“ oder Kurzinfos mit „SYNTHETISCH“.
 *  Ein eigenes Feld gibt es im Schema nicht. */
export function istSynthetisch(iv: Pick<Interview, 'pseudonym' | 'kurzinfos'>): boolean {
  return /^synthetisch/i.test(iv.pseudonym.trim()) || /^synthetisch/i.test(iv.kurzinfos.trim());
}

/** Die Snapshots, die der Zeigen-Modus zeigt: wie tag_stand nur Interviews, in denen etwas steht (interviewGefuellt). */
export function zeigbareInterviews(daten: unknown): Interview[] {
  const d = daten as Interviews | null;
  return Array.isArray(d?.interviews) ? d.interviews.filter(interviewGefuellt) : [];
}

/** Nächster Snapshot beim Blättern, am Rand ringsum (nach dem letzten wieder der erste). Ohne Snapshots 0. */
export function blaettern(nr: number, anzahl: number, richtung: -1 | 1): number {
  if (anzahl <= 0) return 0;
  return (((nr + richtung) % anzahl) + anzahl) % anzahl;
}

export type TastenZiel = { art: 'person'; person: string } | { art: 'snapshot'; nr: number } | null;

/** ←/→ im Leser. Ohne Zeigen wie bisher: dasselbe Artefakt bei der Nachbarperson. Im Zeigen-Modus nur der nächste
 *  Snapshot – nie eine andere Person (sonst landet beim Teilen unversehens eine andere Mappe auf dem Bildschirm). */
export function tastenZiel(taste: string, z: { zeigen: boolean; personen: readonly LehrendenMappe[]; person: string; nr: number; anzahl: number }): TastenZiel {
  if (taste !== 'ArrowLeft' && taste !== 'ArrowRight') return null;
  const richtung = taste === 'ArrowLeft' ? -1 : 1;
  if (z.zeigen) return z.anzahl > 0 ? { art: 'snapshot', nr: blaettern(z.nr, z.anzahl, richtung) } : null;
  const ziel = nachbar(z.personen, z.person, richtung);
  return ziel ? { art: 'person', person: ziel } : null;
}

/** Stelle des Snapshots mit dieser Interview-ID; gibt es sie nicht (mehr), der erste. */
export function stelleNachId(interviews: readonly Interview[], id: string | null): number {
  const i = id === null ? -1 : interviews.findIndex((iv) => iv.id === id);
  return i < 0 ? 0 : i;
}

/** Nach „Neu laden“: hat sich an den Snapshots nichts geändert? */
export function nichtsNeues(vorher: readonly Interview[], nachher: readonly Interview[]): boolean {
  return JSON.stringify(vorher) === JSON.stringify(nachher);
}

export type Neu = { einsichten: ReadonlySet<string>; chancen: ReadonlySet<string> };

/** Einsichten und Chancen, die seit dem letzten Laden dazugekommen oder geändert sind (Vergleich über den Text,
 *  im Interview mit derselben ID). Ohne früheren Stand nichts; ein neues Interview ist ganz neu. */
export function neueEintraege(vorher: readonly Interview[] | null, iv: Interview): Neu {
  if (vorher === null) return { einsichten: new Set(), chancen: new Set() };
  const alt = vorher.find((v) => v.id === iv.id);
  const altE = new Set(alt?.einsichten.map((e) => e.trim()) ?? []);
  const altC = new Set(alt?.chancen.map((c) => c.text.trim()) ?? []);
  return {
    einsichten: new Set(iv.einsichten.map((e) => e.trim()).filter((e) => e && !altE.has(e))),
    chancen: new Set(iv.chancen.map((c) => c.text.trim()).filter((c) => c && !altC.has(c))),
  };
}

/** Zahl der Snapshots aus dem Umfang der Matrix („3 von 5 Snapshots“, „6 Snapshots (5 verlangt)“), ohne eigene Anfrage. */
export function snapshotZahl(umfang: string | null): number {
  const m = umfang?.match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
}

/** Personen-Reiter im Zeigen-Modus: dieselben Mappen in derselben Reihenfolge wie die Personen-Navigation des Lesers
 *  (nur bereite Mappen), mit der Zahl der Snapshots. */
export function zeigenPersonen(personen: readonly LehrendenMappe[]): { kuerzel: string; anzahl: number }[] {
  return personen.flatMap((p) => {
    if (p.zustand !== 'bereit') return [];
    const a = p.artefakte.find((x) => x.name === 'interviews');
    return [{ kuerzel: p.kuerzel, anzahl: a && a.stand === 'vorhanden' && !a.leer ? snapshotZahl(a.umfang) : 0 }];
  });
}
