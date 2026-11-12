// Die Opportunity Solution Trees der Kaffeebar, einmal für alle Seiten. KAFFEEBAR_BAUM: Stand Tag 1 (tag-1, problem-rahmen),
// noch ohne Momente. KAFFEEBAR_BAUM_INTERVIEWS: nach den Interviews, mit den Momenten der Experience Map (baum.astro).
// Nach Torres: Chancen in den Worten der Kundschaft, mehrere Lösungen pro Chance, getestet wird eine Annahme.
// Der Test passt zum MVP-Beispiel auf Tag 1 (Schild „Per WhatsApp vorbestellen“).
import type { Knoten } from './bild/Baum.astro';

export const KAFFEEBAR_BAUM: Knoten = { t: 'Mehr Pendler*innen steigen morgens mit Kaffee in den Zug', kinder: [
  { t: '„Wenn ich anstehe, verpasse ich meinen Zug.“', kinder: [
    { t: 'Vorbestellen per App', kinder: [{ t: 'Bestellen 3 von 10 per WhatsApp vor?' }] },
    { t: 'Express-Theke' },
    { t: 'Kaffeewagen am Bahnsteig' },
  ] },
  { t: '„Geht sich ein Kaffee noch aus?“', kinder: [{ t: 'Wartezeit an der Tür' }] },
] };

// Der Baum der Kaffeebar nach den Interviews (Torres Kap. 6): oberste Ebene = die drei Momente der Experience Map (journey-map.astro), darunter die Chancen
// aus den Interview-Snapshots, die mehr als ein Interview stützt (S. 88). Belege (Zitat-IDs) stehen auf baum.astro.
// Darstellen mit <Baum momente …>.
export const KAFFEEBAR_BAUM_INTERVIEWS: Knoten = { t: 'Mehr Pendler*innen steigen morgens mit Kaffee in den Zug', kinder: [
  { t: '„Ich komme in die Halle und entscheide.“', kinder: [
    { t: '„Geht sich ein Kaffee noch aus?“' },
    { t: '„Wenn ich anstehe, verpasse ich meinen Zug.“' },
    { t: '„Schnell geht nur der Automat.“' },
  ] },
  { t: '„Ich stehe an und warte auf meinen Kaffee.“', kinder: [
    { t: '„Wann ist mein Kaffee fertig?“' },
  ] },
  { t: '„Ich bin im Zug.“' },
] };
