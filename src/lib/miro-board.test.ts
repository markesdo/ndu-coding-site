import { describe, expect, it } from 'vitest';
import { miroBoard, miroFrameLink } from './miro-board';

// Fake-Board – die echte Adresse steht nur in der Vercel-Variable MIRO_BOARD_URL.
const BOARD = 'https://miro.com/app/board/TESTKEY=/';

describe('miroBoard', () => {
  it('nimmt einen Board-Link auf miro.com samt share_link_id', () => {
    expect(miroBoard(BOARD)).toBe(BOARD);
    expect(miroBoard(`${BOARD}?share_link_id=123456`)).toBe(`${BOARD}?share_link_id=123456`);
    expect(miroBoard('https://miro.com/app/board/Ab_9-x=')).toBe('https://miro.com/app/board/Ab_9-x=/');
  });

  it('schneidet Leerraum ab, den man beim Einfügen mitkopiert', () => {
    expect(miroBoard(`  ${BOARD}?share_link_id=1\n`)).toBe(`${BOARD}?share_link_id=1`);
  });

  it('behält von der Query nur share_link_id, das Fragment fällt weg', () => {
    expect(miroBoard(`${BOARD}?share_link_id=1&moveToWidget=99&utm_source=x#frag`)).toBe(`${BOARD}?share_link_id=1`);
    expect(miroBoard(`${BOARD}?foo=bar`)).toBe(BOARD);
    expect(miroBoard(`${BOARD}?share_link_id=%22%3E%3Cscript%3E`)).toBe(BOARD);
  });

  it('gibt ohne Wert null zurück', () => {
    expect(miroBoard(undefined)).toBeNull();
    expect(miroBoard('')).toBeNull();
    expect(miroBoard('   ')).toBeNull();
  });

  it('lehnt andere Hosts, http, Lookalikes und Unsinn ab', () => {
    expect(miroBoard('https://evil.tld/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('https://miro.com.evil.tld/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('https://evilmiro.com/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('https://www.miro.com/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('http://miro.com/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('javascript:alert(1)')).toBeNull();
    expect(miroBoard('kein link')).toBeNull();
  });

  it('nimmt nur Board-Pfade mit Schlüssel, ohne Port und Anmeldedaten', () => {
    expect(miroBoard('https://miro.com/app/board/')).toBeNull();
    expect(miroBoard('https://miro.com/app/board')).toBeNull();
    expect(miroBoard('https://miro.com/app/dashboard/')).toBeNull();
    expect(miroBoard('https://miro.com/app/board/TESTKEY=/extra')).toBeNull();
    expect(miroBoard('https://miro.com/app/board/TEST%20KEY/')).toBeNull();
    expect(miroBoard('https://miro.com/x/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('https://u:p@miro.com/app/board/TESTKEY=/')).toBeNull();
    expect(miroBoard('https://miro.com:8443/app/board/TESTKEY=/')).toBeNull();
  });
});

describe('miroFrameLink', () => {
  it('hängt moveToWidget an und behält share_link_id', () => {
    expect(miroFrameLink(`${BOARD}?share_link_id=1`, '3458764687728125026')).toBe(`${BOARD}?share_link_id=1&moveToWidget=3458764687728125026`);
    expect(miroFrameLink(BOARD, '42')).toBe(`${BOARD}?moveToWidget=42`);
  });

  it('ersetzt ein schon vorhandenes moveToWidget statt es zu verdoppeln', () => {
    expect(miroFrameLink(`${BOARD}?moveToWidget=1`, '42')).toBe(`${BOARD}?moveToWidget=42`);
  });

  it('gibt bei ungültiger Frame-ID null zurück', () => {
    expect(miroFrameLink(BOARD, '')).toBeNull();
    expect(miroFrameLink(BOARD, 'abc')).toBeNull();
    expect(miroFrameLink(BOARD, '42&x=1')).toBeNull();
  });
});
