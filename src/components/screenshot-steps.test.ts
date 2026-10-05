import { describe, expect, it } from 'vitest';
import { markStyle } from './screenshot-steps';

describe('markStyle', () => {
  it('rechnet Pixel des Bildes in Prozent um', () => {
    expect(markStyle({ x: 100, y: 50, w: 200, h: 25 }, 1000, 500)).toBe('left:10%;top:10%;width:20%;height:5%');
  });

  it('rundet auf drei Nachkommastellen', () => {
    expect(markStyle({ x: 1, y: 1, w: 1, h: 1 }, 3, 3)).toBe('left:33.333%;top:33.333%;width:33.333%;height:33.333%');
  });

  it('erlaubt einen Rahmen bis genau an den Bildrand', () => {
    expect(markStyle({ x: 0, y: 0, w: 1000, h: 500 }, 1000, 500)).toBe('left:0%;top:0%;width:100%;height:100%');
  });

  it.each([
    { x: 900, y: 10, w: 200, h: 5 },
    { x: 10, y: 490, w: 10, h: 20 },
    { x: -1, y: 10, w: 10, h: 5 },
    { x: 10, y: 10, w: 0, h: 5 },
    { x: 10, y: 10, w: Number.NaN, h: 5 },
  ])('lehnt Rahmen außerhalb des Bildes ab: %o', (m) => {
    expect(() => markStyle(m, 1000, 500)).toThrow('außerhalb des Bildes');
  });
});
