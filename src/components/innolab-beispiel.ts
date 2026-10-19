// Der Opportunity Solution Tree der Kaffeebar, einmal für alle Seiten (tag-1, problem-rahmen), damit er nicht auseinanderläuft.
// Nach Torres: Chancen in den Worten der Kundschaft, mehrere Lösungen pro Chance, getestet wird eine Annahme.
// Der Test passt zum MVP-Beispiel auf Tag 1 (Schild „Per WhatsApp vorbestellen“).
import type { Knoten } from './bild/Baum.astro';

export const KAFFEEBAR_BAUM: Knoten = { t: 'Mehr Pendler*innen steigen morgens mit Kaffee in den Zug', kinder: [
  { t: '„Wenn ich anstehe, verpasse ich meinen Zug.“', kinder: [
    { t: 'Vorbestellen per App', kinder: [{ t: 'Bestellen 3 von 10 per WhatsApp vor?' }] },
    { t: 'Express-Theke' },
    { t: 'Kaffeewagen am Bahnsteig' },
  ] },
  { t: '„Ich weiß nicht, ob sich ein Kaffee noch ausgeht.“', kinder: [{ t: 'Wartezeit an der Hallentür' }] },
] };
