// Fokus im Arbeitsfluss (NDU-74): Was eine Station im Fokus mit den anderen macht. Ohne Importe und ohne DOM, damit
// dasselbe beim Bauen (Prop fokus) und im Browser (Maus, Tastatur, ?station=, Tour) gilt – und testbar ist.

/** fokus: die Station selbst; quelle: gibt ihr etwas; ziel: nimmt etwas von ihr; blass: unbeteiligt. */
export type Rolle = 'fokus' | 'quelle' | 'ziel' | 'blass';

/** Rolle jeder Station bei einem Fokus; ohne Fokus hat keine eine Rolle. */
export function rollen(alle: string[], fokus: string | undefined, kanten: { quellen: string[]; ziele: string[] }): Record<string, Rolle | undefined> {
  const r: Record<string, Rolle | undefined> = {};
  for (const id of alle) {
    r[id] = !fokus ? undefined : id === fokus ? 'fokus' : kanten.quellen.includes(id) ? 'quelle' : kanten.ziele.includes(id) ? 'ziel' : 'blass';
  }
  return r;
}

/** Tour: Fokus auf der zuletzt aufgedeckten Station (Schritte werden der Reihe nach aufgedeckt); keine: kein Fokus. */
export const tourFokus = (schritte: { id: string; gezeigt: boolean }[]): string | undefined =>
  schritte.filter((s) => s.gezeigt).at(-1)?.id;

/** ?station=… aus der Adresse, nur wenn es die Station gibt. */
export function stationAusAdresse(suche: string, bekannt: string[]): string | undefined {
  const id = new URLSearchParams(suche).get('station') ?? undefined;
  return id && bekannt.includes(id) ? id : undefined;
}
