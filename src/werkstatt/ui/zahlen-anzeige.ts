// Was der Knopf „Zahlen holen“ auf der Rückblick-Folie anzeigt (WerkstattZahlen.astro): Summen über die Gruppe als
// große Zahlen, darunter eine Zeile pro Person. Nur Text, das Einsetzen ins DOM macht die Komponente.
import type { Zahlen } from '../vertrag.js';

export interface Kachel {
  zahl: string;
  was: string;
}

export function kacheln(z: Zahlen): Kachel[] {
  const summe = (f: (p: Zahlen['personen'][number]) => number) => z.personen.reduce((s, p) => s + f(p), 0);
  return [
    { zahl: String(summe((p) => p.annahmen)), was: 'Annahmen auf der Map' },
    { zahl: String(summe((p) => p.fragen)), was: 'Fragen im Leitfaden' },
    { zahl: String(summe((p) => p.entscheidungen)), was: 'Zeilen im Entscheidungslog' },
    { zahl: `${summe((p) => p.briefFelder)} / ${z.briefFelderGesamt * z.personen.length}`, was: 'Felder im Produkt-Brief' },
  ];
}

export function personZeile(p: Zahlen['personen'][number], briefFelderGesamt: number): string {
  if (p.fehler) return `${p.kuerzel}: Mappe gerade nicht lesbar`;
  const teile = [`Brief ${p.briefFelder}/${briefFelderGesamt}`, `${p.annahmen} Annahmen`, `${p.fragen} Fragen`, `${p.entscheidungen} Entscheidungen`];
  const zusatz = p.unlesbar.length ? ` (nicht lesbar: ${p.unlesbar.join(', ')})` : '';
  return `${p.kuerzel}: ${teile.join(' · ')}${zusatz}`;
}
