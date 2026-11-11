// Reine Hilfen für das Feedback (NDU-35) in Lehrenden-Ansicht, Editor und „Meine Mappe“: Zahlen als Text, was „neu“
// ist. Die Zeilen zur Auswahl stehen in feedback.ts (die Route prüft gegen dieselben). Nur Text und Daten; das
// Einsetzen macht React. Dazu die Reihenfolge der Anfragen (unten). Keine Noten, keine Punkte.
import { tagInWien } from '../../lib/kurswahl.js';
import { feedbackZaehlen, zeilenName, type FeedbackEintrag, type FeedbackZahlen } from '../feedback.js';
import { datumAt } from '../render/format.js';
import type { ArtefaktName } from '../schemas/index.js';
import { ROUTEN } from '../vertrag.js';

/** „zu A2“, „zu Welches Problem?“ oder „zum ganzen Artefakt“. */
export function bezugText(e: Pick<FeedbackEintrag, 'artefakt' | 'zeilenId'>): string {
  return e.zeilenId === undefined ? 'zum ganzen Artefakt' : `zu ${zeilenName(e.artefakt, e.zeilenId)}`;
}

/** „22.10.2026“ (Tag in Wien). */
export const feedbackDatum = (iso: string): string => datumAt(tagInWien(new Date(iso)));

const mehrzahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`;

/** Zelle der Lehrenden-Ansicht: „1 offen · 1 Antwort“, „2 erledigt“; null = kein Feedback (oder nicht lesbar). */
export function zellenFeedback(z: FeedbackZahlen | null): string | null {
  if (!z || z.offen + z.erledigt === 0) return null;
  const teile: string[] = [];
  if (z.offen) teile.push(`${z.offen} offen`);
  if (z.erledigt) teile.push(`${z.erledigt} erledigt`);
  if (z.antworten) teile.push(mehrzahl(z.antworten, 'Antwort', 'Antworten'));
  return teile.join(' · ');
}

/** Zeile in „Meine Mappe“: wie viel neu und offen ist; null = kein Feedback. */
export function mappeFeedback(eintraege: readonly FeedbackEintrag[], name: ArtefaktName): { neu: number; text: string } | null {
  const z = feedbackZaehlen(eintraege, name);
  if (z.offen + z.erledigt === 0) return null;
  const text = z.offen ? `Feedback: ${z.offen} offen` : `Feedback: ${z.erledigt} erledigt`;
  return { neu: z.neu, text };
}

/** Feedback der Lehrenden zu diesem Artefakt, das die Person noch nicht geöffnet hat. Im Editor einmal beim Laden
 *  gemerkt: „neu“ bleibt stehen, solange der Editor offen ist, auch wenn der Server es schon als gesehen führt. */
export function neueIds(eintraege: readonly FeedbackEintrag[], name: ArtefaktName): Set<string> {
  return new Set(eintraege.filter((e) => e.von === 'lehrende' && e.artefakt === name && !e.gesehen).map((e) => e.id));
}

/** Pfad zum Schreiben für Lehrende. */
export function lehrendeFeedbackPfad(kohorte: string, person: string): string {
  return `${ROUTEN.lehrendeFeedback.pfad}?${new URLSearchParams({ kohorte, person }).toString()}`;
}

// --- Reihenfolge und laufende Änderungen (Editor und „Meine Mappe“) ----------------------------------------------------

/** Jede Anfrage zieht beim Start eine Nummer; ihre Antwort gilt nur, wenn noch keine später gestartete übernommen ist.
 *  So überschreibt eine langsame alte Antwort nie einen neueren Stand. Scheitert die neuere, gilt die ältere weiter. */
export function reihenfolge(): { start: () => number; uebernehmen: (nr: number) => boolean } {
  let gezogen = 0;
  let uebernommen = 0;
  return {
    start: () => ++gezogen,
    uebernehmen: (nr) => {
      if (nr <= uebernommen) return false;
      uebernommen = nr;
      return true;
    },
  };
}

export interface LaufendeAenderungen {
  merken: <T>(p: Promise<T>) => Promise<T>;
  ruhig: () => Promise<void>;
}

/** Was gerade am Feedback geändert wird (gesehen, erledigt, Antwort), über alle Editoren der Seite. ruhig() wartet, bis
 *  nichts mehr läuft, auch auf das, was währenddessen dazukommt. Scheitern zählt wie fertig. */
export function laufendeAenderungen(): LaufendeAenderungen {
  const laufend = new Set<Promise<unknown>>();
  return {
    merken(p) {
      laufend.add(p);
      const weg = () => { laufend.delete(p); };
      p.then(weg, weg);
      return p;
    },
    async ruhig() {
      while (laufend.size > 0) await Promise.allSettled([...laufend]);
    },
  };
}

// Eine für die ganze Seite: Editoren merken sich hier, „Meine Mappe“ wartet darauf.
export const feedbackAenderungen = laufendeAenderungen();

/** Im Editor: Antworten des Servers (Laden, gesehen, erledigt, Antwort) in der Reihenfolge des Starts übernehmen; jede
 *  Anfrage zählt als laufende Änderung. Eine späte Antwort auf „gesehen“ überschreibt so kein späteres „erledigt“. */
export function geordnet(setzen: (e: FeedbackEintrag[]) => void, aenderungen: LaufendeAenderungen = feedbackAenderungen) {
  const r = reihenfolge();
  return <T extends { eintraege: FeedbackEintrag[] }>(p: Promise<T>): Promise<T> => {
    const nr = r.start();
    return aenderungen.merken(p).then((x) => {
      if (r.uebernehmen(nr)) setzen(x.eintraege);
      return x;
    });
  };
}

/** „Meine Mappe“: Feedback neu laden, erst wenn keine Änderung mehr läuft (sonst stünde nach dem Schließen des Editors
 *  noch „neu“ da, weil „gesehen“ erst gleich ankommt); ältere Antworten fallen weg. Nach bestem Bemühen: scheitert es,
 *  bleibt der alte Stand. */
export function feedbackLader(holen: () => Promise<FeedbackEintrag[]>, setzen: (e: FeedbackEintrag[]) => void, aenderungen: LaufendeAenderungen = feedbackAenderungen): () => Promise<void> {
  const r = reihenfolge();
  return async () => {
    const nr = r.start();
    try {
      await aenderungen.ruhig();
      const e = await holen();
      if (r.uebernehmen(nr)) setzen(e);
    } catch {
      // still
    }
  };
}

/** Ein Knopf, eine Anfrage: Solange die eigene läuft, tut ein weiterer Klick nichts, auch der zweite im selben Takt, bevor
 *  React den Knopf gesperrt hat. melden setzt den Zustand für disabled. */
export function einzeln(melden: (laeuft: boolean) => void): (f: () => Promise<unknown>) => Promise<void> {
  let laeuft = false;
  return async (f) => {
    if (laeuft) return;
    laeuft = true;
    melden(true);
    try {
      await f();
    } finally {
      laeuft = false;
      melden(false);
    }
  };
}
