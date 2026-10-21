// Adresse des Miro-Team-Boards fürs Innolab. Sie kommt aus der Vercel-Variable MIRO_BOARD_URL und landet beim Build
// in den Seiten hinter dem Kurspasswort – das Repo ist öffentlich, darum steht sie nie im Code.
// Nur Board-Links der Form https://miro.com/app/board/<key>/ zählen; von der Query bleibt nur share_link_id.
// Alles andere fällt auf den Text ohne Link zurück.
const BOARD_PFAD = /^\/app\/board\/([A-Za-z0-9_=-]+)\/?$/;
const SHARE_LINK_ID = /^[A-Za-z0-9_-]+$/;
const FRAME_ID = /^\d+$/;

export function miroBoard(wert: string | undefined): string | null {
  const roh = wert?.trim();
  if (!roh) return null;
  try {
    const url = new URL(roh);
    if (url.protocol !== 'https:' || url.hostname !== 'miro.com' || url.port || url.username || url.password) return null;
    const key = BOARD_PFAD.exec(url.pathname)?.[1];
    if (!key) return null;
    const board = new URL(`https://miro.com/app/board/${key}/`);
    const share = url.searchParams.get('share_link_id');
    if (share && SHARE_LINK_ID.test(share)) board.searchParams.set('share_link_id', share);
    return board.href;
  } catch {
    return null;
  }
}

// Deep Link auf einen Frame: dasselbe Board, dazu moveToWidget=<Frame-ID> (share_link_id bleibt).
// board ist schon durch miroBoard() geprüft (TEAM_BOARD in team-board.ts); hier wird nur noch angehängt.
export function miroFrameLink(board: string, frameId: string): string | null {
  if (!FRAME_ID.test(frameId)) return null;
  const url = new URL(board);
  url.searchParams.set('moveToWidget', frameId);
  return url.href;
}
