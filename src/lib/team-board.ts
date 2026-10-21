// Das Team-Board des Innolab, einmal für alle Seiten: MIRO_BOARD_URL aus astro:env (beim Build gelesen, wie
// LINEAR_INVITE_URL auf Tag 3), geprüft durch miroBoard(); ungültig oder leer → null, dann zeigen die Seiten Text ohne Link.
// Eigene Datei, weil astro:env/server nur im Astro-Build existiert – miro-board.ts bleibt so ohne Astro testbar.
import { MIRO_BOARD_URL } from 'astro:env/server';
import { MIRO_FRAMES } from '../components/miro-frames';
import { miroBoard, miroFrameLink } from './miro-board';

export const TEAM_BOARD: string | null = miroBoard(MIRO_BOARD_URL);

// Deep Link auf einen Frame des Team-Boards, oder null (kein Board oder Frame nicht in MIRO_FRAMES).
export function teamFrameLink(name: string): string | null {
  if (!TEAM_BOARD || !Object.hasOwn(MIRO_FRAMES, name)) return null;
  return miroFrameLink(TEAM_BOARD, MIRO_FRAMES[name]);
}
