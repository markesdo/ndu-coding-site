// Die fünf Kaffeebar-Skizzen wie auf Miro T1 · 5, Stickies in Erzählreihenfolge (Experience Map, Folien „gruppieren“
// und „beispiel“). notiz = aus den Interview-Notizen, ohne Zitat-ID (gestrichelt, zählt nicht); g = Gruppe, aus der
// im Raster eine Spalte wird; ohne g = grau, bleibt im Snapshot. Gezählt werden Geschichten, nicht Stickies, und nur
// Stickies mit Zitat.
export type GruppeId = 'a' | 'b' | 'c' | 'd';
export type Sticky = { t: string; id?: string; notiz?: true; g?: GruppeId; marke?: 'tief' | 'ende' };
export type Skizze = { i: string; stickies: Sticky[] };

export const GRUPPEN: { g: GruppeId; name: string }[] = [
  { g: 'a', name: 'Halle: schauen, entscheiden' },
  { g: 'b', name: 'Umweg: Automat' },
  { g: 'c', name: 'Anstehen und Warten' },
  { g: 'd', name: 'Im Zug' },
];

export const SKIZZEN: Skizze[] = [
  { i: 'I2', stickies: [
    { t: 'Tafel, Schlange', id: 'I2-4', g: 'a' }, { t: '8 Leute: das wird nix', id: 'I2-1', g: 'a', marke: 'tief' },
    { t: 'Blick auf die Uhr', id: 'I2-2', g: 'a' }, { t: 'Zum Automaten', id: 'I2-3', g: 'b' }, { t: 'Zug 7:42', notiz: true, g: 'd' },
  ] },
  { i: 'I3', stickies: [
    { t: 'wie es ausschaut', id: 'I3-1', g: 'a' }, { t: 'stellt sich an', notiz: true, g: 'c' },
    { t: 'Ich warte', id: 'I3-2', g: 'c' }, { t: 'Das war ein Fehler', id: 'I3-3', g: 'c', marke: 'tief' },
    { t: 'Im Zug, in Ruhe', id: 'I3-5', g: 'd', marke: 'ende' },
  ] },
  { i: 'I1', stickies: [
    { t: 'immer knapp dran', id: 'I1-1' }, { t: 'Schlange, dann Uhr', notiz: true, g: 'a' },
    { t: 'Automat: Notlösung', id: 'I1-3', g: 'b' }, { t: 'erster Schluck: Morgen gerettet', id: 'I1-4' },
  ] },
  { i: 'I4', stickies: [
    { t: 'um 7:28 da', id: 'I4-1' }, { t: 'Anstellen? Glücksspiel', id: 'I4-2' },
    { t: 'zum Automaten', id: 'I4-3', g: 'b' }, { t: 'Dann halt die Brühe', id: 'I4-4', g: 'b', marke: 'tief' },
  ] },
  { i: 'I5', stickies: [
    { t: '10 Min. vor Abfahrt', id: 'I5-1' }, { t: 'Halle: wie voll?', id: 'I5-3', g: 'a' },
    { t: 'Bestellungen der Kolleg*innen', id: 'I5-4' }, { t: 'Warten: zu lang', id: 'I5-6', g: 'c', marke: 'tief' },
    { t: '4 Becher tragen', id: 'I5-5' },
  ] },
];

export const gruppeName = (g: GruppeId) => GRUPPEN.find((x) => x.g === g)?.name ?? '';
export const buchstabe = (g: GruppeId) => g.toUpperCase();

/** Geschichten je Gruppe: nur Stickies mit Zitat, je Geschichte einmal. */
export const geschichtenIn = (g: GruppeId, skizzen: Skizze[] = SKIZZEN) =>
  skizzen.filter((s) => s.stickies.some((st) => st.g === g && st.id)).length;

/** „3 von 5“: Geschichten der Gruppe von allen Skizzen. */
export const zaehlung = (g: GruppeId, skizzen: Skizze[] = SKIZZEN) => `${geschichtenIn(g, skizzen)} von ${skizzen.length}`;

/**
 * Fehler in den Skizzen: Notiz mit Zitat-ID, Zitat-Sticky ohne ID, ID fehlt im Werkstatt-Beispiel oder gehört zu einer
 * anderen Geschichte (I3-x nur in der Reihe I3). journey-map.astro bricht damit den Build ab.
 */
export function skizzenFehler(skizzen: Skizze[], zitatIds: Set<string>): string[] {
  return skizzen.flatMap((s) => s.stickies.flatMap((st) => {
    if (st.notiz) return st.id ? [`${s.i}: Notiz „${st.t}“ trägt eine ID (${st.id})`] : [];
    if (!st.id) return [`${s.i}: „${st.t}“ hat weder Zitat-ID noch notiz`];
    const f: string[] = [];
    if (!zitatIds.has(st.id)) f.push(`${s.i}: ${st.id} fehlt in werkstatt/beispiele/interviews.json`);
    if (!st.id.startsWith(`${s.i}-`)) f.push(`${s.i}: ${st.id} gehört zu einer anderen Geschichte`);
    return f;
  }));
}
