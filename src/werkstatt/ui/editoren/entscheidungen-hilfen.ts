// Reine Hilfsfunktionen des Entscheidungslog-Editors: Zeile anlegen, ersetzen, löschen. Ohne React und DOM.
// Regeln: IDs werden nie wiederverwendet; eine gespeicherte Zeile wird weder geändert noch gelöscht, nur ersetzt
// (und nur, wenn sie fehlerfrei ist); jede Zeile wird höchstens einmal ersetzt, und zwar von einer späteren (die neue
// Zeile kommt ans Ende). Noch nicht gespeicherte Zeilen sind frei änderbar und löschbar.
import { naechsteId } from '../../ids.js';
import { BELEG_NOTIZ_MAX, type Entscheidung, type Entscheidungen } from '../../schemas/index.js';
import { graphemAnzahl } from '../../text.js';

export type Ergebnis = { ok: true; daten: Entscheidungen; id: string } | { ok: false; grund: string };

/** 2026-10-22 → 22.10.2026. Fremdes bleibt unverändert. */
export function datumAnzeigen(iso: string): string {
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return t ? `${t[3]}.${t[2]}.${t[1]}` : iso;
}

// `vergeben`: alle IDs, die in dieser Sitzung schon einmal da waren, auch inzwischen gelöschte.
function neueId(d: Entscheidungen, vergeben: readonly string[]): string {
  return naechsteId('D', [...vergeben, ...d.entscheidungen.map((e) => e.id)]);
}

/** Die Zeile, die `id` ersetzt (es gibt höchstens eine). */
export function ersetztVon(d: Entscheidungen, id: string): Entscheidung | undefined {
  return d.entscheidungen.find((e) => e.ersetzt === id);
}

export function zeileHinzufuegen(d: Entscheidungen, vergeben: readonly string[], heute: string): { daten: Entscheidungen; id: string } {
  const id = neueId(d, vergeben);
  const zeile: Entscheidung = { id, datum: heute, entscheidung: '', grund: '', beleg: 'keiner', belegIds: [] };
  return { daten: { ...d, entscheidungen: [...d.entscheidungen, zeile] }, id };
}

/**
 * Legt eine neue Zeile an, die `altId` ersetzt. Die alte Zeile bleibt, wie sie ist. Nur für gespeicherte, fehlerfreie
 * und noch nicht ersetzte Zeilen: Eine ersetzte Zeile ist schreibgeschützt und könnte ihre Fehler sonst verstecken.
 */
export function ersetzen(
  d: Entscheidungen,
  altId: string,
  vergeben: readonly string[],
  heute: string,
  gespeichert: ReadonlySet<string>,
  fehlerfrei = true,
): Ergebnis {
  const alt = d.entscheidungen.find((e) => e.id === altId);
  if (alt === undefined) return { ok: false, grund: `Die Entscheidung ${altId} gibt es nicht.` };
  const schon = ersetztVon(d, altId);
  if (schon !== undefined) return { ok: false, grund: `${altId} ist schon durch ${schon.id} ersetzt.` };
  if (!gespeichert.has(altId)) return { ok: false, grund: `${altId} ist noch nicht gespeichert. Ändere sie direkt.` };
  if (!fehlerfrei) return { ok: false, grund: `${altId} hat noch Fehler. Ersetzen geht erst, wenn sie fehlerfrei ist.` };
  const id = neueId(d, vergeben);
  const zeile: Entscheidung = { id, datum: heute, entscheidung: alt.entscheidung, grund: '', beleg: 'keiner', belegIds: [], ersetzt: altId };
  return { ok: true, daten: { ...d, entscheidungen: [...d.entscheidungen, zeile] }, id };
}

/** Warum `id` nicht gelöscht werden darf, oder null. */
export function loeschenVerboten(d: Entscheidungen, id: string, gespeichert: ReadonlySet<string>): string | null {
  if (gespeichert.has(id)) return `${id} ist schon gespeichert und bleibt im Log. Ersetze sie stattdessen.`;
  const neue = ersetztVon(d, id);
  if (neue !== undefined) return `${id} ist durch ${neue.id} ersetzt. Lösch zuerst ${neue.id}.`;
  return null;
}

/** Löscht nur Zeilen, die noch nie gespeichert waren und von keiner anderen ersetzt werden. */
export function loeschen(d: Entscheidungen, id: string, gespeichert: ReadonlySet<string>): Ergebnis {
  const grund = loeschenVerboten(d, id, gespeichert);
  if (grund !== null) return { ok: false, grund };
  return { ok: true, daten: { ...d, entscheidungen: d.entscheidungen.filter((e) => e.id !== id) }, id };
}

/** IDs der Zeilen, die auf dem Server liegen (`gespeichert` aus der Editor-Hülle; null = noch keine Datei). */
export function gespeicherteIds(gespeichert: Entscheidungen | null): Set<string> {
  return new Set(gespeichert?.entscheidungen.map((e) => e.id) ?? []);
}

const FELDER = ['id', 'datum', 'entscheidung', 'grund', 'beleg', 'belegIds', 'belegNotiz', 'ersetzt'] as const;

export const belegNotizHilfe = `Zum Beispiel „Kassendaten September“. Höchstens ${BELEG_NOTIZ_MAX} Zeichen, eine Zeile.`;

/** Zähler neben dem Feld, z. B. „12/120“ (Grapheme, wie im Schema). */
export function belegNotizZaehler(notiz: string): string {
  return `${graphemAnzahl(notiz)}/${BELEG_NOTIZ_MAX}`;
}

/** Setzt die Beleg-Notiz; nach trim() leer entfernt das Feld ganz (optional, nie als leerer Text gespeichert). Rand-Leerraum meldet das Schema. */
export function belegNotizSetzen(e: Entscheidung, notiz: string): Entscheidung {
  const { belegNotiz: _alt, ...rest } = e;
  return notiz.trim() === '' ? rest : { ...rest, belegNotiz: notiz };
}

/** Alle Feldfehler der Zeile `i` (auch die einzelner Beleg-IDs), ohne doppelte. */
export function zeileFehler(e: Entscheidung, i: number, fehler: (pfad: string) => string | undefined): string[] {
  const pfade = [...FELDER.map((f) => `entscheidungen.${i}.${f}`), ...e.belegIds.map((_, j) => `entscheidungen.${i}.belegIds.${j}`)];
  return [...new Set(pfade.map(fehler).filter((m): m is string => m !== undefined))];
}

export interface ZeilenModus {
  /** Felder änderbar: nur noch nicht gespeicherte, nicht ersetzte Zeilen. */
  bearbeitbar: boolean;
  /** „Ersetzen“: nur gespeicherte, fehlerfreie, noch nicht ersetzte Zeilen. */
  ersetzbar: boolean;
  loeschbar: boolean;
  fehler: string[];
}

export function zeilenModus(
  d: Entscheidungen,
  i: number,
  gespeichert: ReadonlySet<string>,
  fehler: (pfad: string) => string | undefined,
): ZeilenModus {
  const e = d.entscheidungen[i]!;
  const ersetzt = ersetztVon(d, e.id) !== undefined;
  const meldungen = zeileFehler(e, i, fehler);
  return {
    bearbeitbar: !gespeichert.has(e.id) && !ersetzt,
    ersetzbar: gespeichert.has(e.id) && !ersetzt && meldungen.length === 0,
    loeschbar: loeschenVerboten(d, e.id, gespeichert) === null,
    fehler: meldungen,
  };
}

/** Wie sich Fehler in einer schreibgeschützten Zeile beheben lassen. */
export function sperrHinweis(d: Entscheidungen, id: string, gespeichert: ReadonlySet<string>): string {
  const neue = ersetztVon(d, id);
  if (neue !== undefined && loeschenVerboten(d, neue.id, gespeichert) === null) {
    return `Lösch zuerst ${neue.id}, dann kannst du ${id} wieder bearbeiten.`;
  }
  return `${id} ist gespeichert und hier nicht änderbar. Sag Markus Bescheid, damit er die Datei korrigiert.`;
}
