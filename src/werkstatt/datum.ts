// Datum für Werkstatt-Einträge: Der Kurs findet in Wien statt, „heute“ gilt dort, nicht in der Zeitzone des Geräts.

/** Heutiges Datum in Wien als JJJJ-MM-TT. */
export function heuteWien(jetzt: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Vienna' }).format(jetzt);
}
