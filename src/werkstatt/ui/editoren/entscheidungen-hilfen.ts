// Reine Hilfsfunktionen des Entscheidungslog-Editors: Zeile anlegen, ersetzen, löschen. Ohne React und DOM.
// Regeln: IDs werden nie wiederverwendet; eine gespeicherte Zeile wird nie gelöscht, nur ersetzt; jede Zeile wird
// höchstens einmal ersetzt, und zwar von einer späteren (die neue Zeile kommt ans Ende).
import { naechsteId } from '../../ids.js';
import type { Entscheidung, Entscheidungen } from '../../schemas/index.js';

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

/** Legt eine neue Zeile an, die `altId` ersetzt. Die alte Zeile bleibt, wie sie ist. */
export function ersetzen(d: Entscheidungen, altId: string, vergeben: readonly string[], heute: string): Ergebnis {
  const alt = d.entscheidungen.find((e) => e.id === altId);
  if (alt === undefined) return { ok: false, grund: `Die Entscheidung ${altId} gibt es nicht.` };
  const schon = ersetztVon(d, altId);
  if (schon !== undefined) return { ok: false, grund: `${altId} ist schon durch ${schon.id} ersetzt.` };
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
