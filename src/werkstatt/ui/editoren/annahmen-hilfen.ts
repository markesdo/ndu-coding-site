// Reine Hilfsfunktionen des Annahmen-Editors. Ohne React und DOM.
import { naechsteId } from '../../ids.js';
import type { Annahme, Annahmen } from '../../schemas/index.js';

type Art = Annahme['art'];

// Text, Leitfrage und Farbe je Art wie auf der Folie „Vier Arten von Annahmen“ (annahmen.astro, VierArten.astro).
export const ART_ANZEIGE: Record<Art, { text: string; titel: string; frage: string; farbe: 'yellow' | 'blue' | 'green' | 'purple' | 'grau' }> = {
  wuenschenswert: { text: 'wünschenswert', titel: 'Wünschenswert', frage: 'Wollen die Menschen das?', farbe: 'yellow' },
  machbar: { text: 'machbar', titel: 'Machbar', frage: 'Können wir es bauen und betreiben?', farbe: 'blue' },
  wirtschaftlich: { text: 'wirtschaftlich', titel: 'Wirtschaftlich', frage: 'Trägt es sich?', farbe: 'green' },
  bedienbar: { text: 'bedienbar', titel: 'Bedienbar', frage: 'Kommen die Menschen damit zurecht?', farbe: 'purple' },
  ethisch: { text: 'ethisch', titel: 'Ethisch', frage: 'Kann es jemandem schaden?', farbe: 'grau' },
};

// Der Hinweis auf fehlende Arten gilt den vier Arten von Tag 1; „ethisch“ kommt an Tag 3 dazu und ist kein Muss.
const TAG1_ARTEN: readonly Art[] = ['wuenschenswert', 'machbar', 'wirtschaftlich', 'bedienbar'];

export const WICHTIG_TEXT: Record<Annahme['wichtig'], string> = { hoch: 'hoch', mittel: 'mittel', niedrig: 'niedrig' };

/** Neue, leere Annahme mit der nächsten freien ID; `vergeben` enthält auch inzwischen gelöschte IDs. */
export function annahmeNeu(vorhandene: readonly Annahme[], vergeben: readonly string[]): Annahme {
  const id = naechsteId('A', [...vergeben, ...vorhandene.map((a) => a.id)]);
  return { id, text: '', art: 'wuenschenswert', wichtig: 'mittel', beleg: 'keiner', belegIds: [] };
}

export function fehlendeArten(annahmen: readonly Annahme[]): Art[] {
  return TAG1_ARTEN.filter((art) => !annahmen.some((a) => a.art === art));
}

/** Hinweis, solange eine der vier Arten fehlt (kein Schemafehler, Speichern bleibt erlaubt). */
export function fehlendeArtenHinweis(annahmen: readonly Annahme[]): string | null {
  const namen = fehlendeArten(annahmen).map((a) => `„${ART_ANZEIGE[a].text}“`);
  if (namen.length === 0) return null;
  if (namen.length === 1) return `Es fehlt noch eine Annahme der Art ${namen[0]}.`;
  return `Es fehlt noch je eine Annahme der Art ${namen.slice(0, -1).join(', ')} und ${namen.at(-1)}.`;
}

function ohneRiskanteste(d: Annahmen): Annahmen {
  const { riskanteste: _weg, ...rest } = d;
  return rest;
}

/** Neue Liste übernehmen; zeigt „riskanteste“ danach ins Leere, fällt sie weg. */
export function annahmenSetzen(d: Annahmen, annahmen: Annahme[]): Annahmen {
  const neu = { ...d, annahmen };
  return neu.riskanteste !== undefined && !annahmen.some((a) => a.id === neu.riskanteste) ? ohneRiskanteste(neu) : neu;
}

/** '' heißt: keine gewählt. */
export function riskantesteSetzen(d: Annahmen, id: string): Annahmen {
  return id === '' ? ohneRiskanteste(d) : { ...d, riskanteste: id };
}
