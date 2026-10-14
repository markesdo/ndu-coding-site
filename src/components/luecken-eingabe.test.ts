import { describe, expect, it } from 'vitest';
import { lueckeNachEingabe } from './luecken-eingabe';

describe('lueckeNachEingabe', () => {
  it('übernimmt die Eingabe ohne Leerraum am Rand', () => {
    expect(lueckeNachEingabe('  LEI-7 ', '[Issue]')).toStrictEqual({ text: 'LEI-7', gefuellt: true });
  });

  it('stellt den Platzhalter wieder her, wenn die Lücke leer bleibt', () => {
    expect(lueckeNachEingabe('', '[Link]')).toStrictEqual({ text: '[Link]', gefuellt: false });
    expect(lueckeNachEingabe(' \n ', '[Link]')).toStrictEqual({ text: '[Link]', gefuellt: false });
  });

  it('zählt den unveränderten Platzhalter nicht als ausgefüllt', () => {
    expect(lueckeNachEingabe('[Link]', '[Link]')).toStrictEqual({ text: '[Link]', gefuellt: false });
  });

  it('macht aus Zeilenumbrüchen Leerzeichen', () => {
    expect(lueckeNachEingabe('erste\nzweite\r\n dritte', '[Text]')).toStrictEqual({ text: 'erste zweite dritte', gefuellt: true });
  });
});
