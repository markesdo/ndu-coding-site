// Feedback lesen und ändern für die Routen (Lehrende, eigene Mappe) und den Connector (NDU-35). Besitz und Rolle prüfen
// die Aufrufer vorher; hier nur Schema, Commit und die Sätze für die Person.
import { FeedbackAbgelehnt, feedbackJson, feedbackParsen, type Feedback } from '../feedback.js';
import { ApiAusnahme } from './antwort.js';
import { DateiUnlesbar } from './speicher-fehler.js';
import type { Speicher } from './typen.js';

export const FEEDBACK_UNLESBAR = 'Das Feedback dieser Mappe lässt sich nicht lesen (vielleicht direkt auf GitHub geändert). Schreib Markus.';

// Datei da, aber kaputtes JSON oder nicht feedback@1: Lesen zeigt einen Hinweis, Schreiben wird abgelehnt (lieber nichts
// schreiben als fremde Einträge überschreiben).
export class FeedbackUnlesbar extends ApiAusnahme {
  constructor() {
    super(502, 'github-fehler', FEEDBACK_UNLESBAR);
  }
}

function parsen(roh: unknown): Feedback {
  const p = feedbackParsen(roh);
  if (!p.ok) {
    console.error('werkstatt: mappe/feedback.json passt nicht zu feedback@1');
    throw new FeedbackUnlesbar();
  }
  return p.daten;
}

/** Das Feedback der Mappe; leer, wenn es noch keins gibt. Wirft FeedbackUnlesbar oder einen Fehler des Speichers. */
export async function feedbackHolen(speicher: Speicher, repo: string): Promise<Feedback> {
  try {
    return parsen(await speicher.feedbackLesen(repo));
  } catch (e) {
    throw e instanceof DateiUnlesbar ? new FeedbackUnlesbar() : e;
  }
}

/** Wendet eine Änderung auf den Stand an, auf dem der Commit landet; gibt den Stand danach zurück. Liefert die Änderung
 *  dieselbe Datei zurück, gibt es keinen Commit. FeedbackAbgelehnt wird zu 422 mit dem Satz der Änderung. */
export async function feedbackAendern(
  speicher: Speicher,
  repo: string,
  aenderung: (f: Feedback) => Feedback,
  autor: { name: string; email: string },
  nachricht: string,
): Promise<Feedback> {
  let danach: Feedback | null = null;
  try {
    await speicher.feedbackAendern(
      repo,
      (roh) => {
        const alt = parsen(roh);
        const neu = aenderung(alt);
        danach = neu;
        return neu === alt ? null : feedbackJson(neu);
      },
      autor,
      nachricht,
    );
  } catch (e) {
    if (e instanceof FeedbackAbgelehnt) throw new ApiAusnahme(422, 'ungueltig', e.message);
    throw e instanceof DateiUnlesbar ? new FeedbackUnlesbar() : e;
  }
  if (danach === null) throw new Error('feedbackAendern: Änderung lief nicht');
  return danach;
}
