// Die Opportunity Solution Trees der Kaffeebar, einmal für alle Seiten. KAFFEEBAR_BAUM: Stand Tag 1 (tag-1, problem-rahmen),
// noch ohne Momente. KAFFEEBAR_BAUM_INTERVIEWS: nach den Interviews, mit den Momenten der Experience Map (baum.astro).
// Nach Torres: Chancen in den Worten der Kundschaft, mehrere Lösungen pro Chance, getestet wird eine Annahme.
// Der Test passt zum MVP-Beispiel auf Tag 1 (Schild „Per WhatsApp vorbestellen“).
import type { Knoten } from './bild/Baum.astro';
import { MOMENTNAMEN } from '../data/kaffeebar-skizzen';

export const KAFFEEBAR_BAUM: Knoten = { t: 'Mehr Pendler*innen steigen morgens mit Kaffee in den Zug', kinder: [
  { t: '„Wenn ich anstehe, reicht mir die Zeit nicht.“', kinder: [
    { t: 'Vorbestellen per App', kinder: [{ t: 'Bestellen 3 von 10 per WhatsApp vor?' }] },
    { t: 'Express-Theke' },
    { t: 'Kaffeewagen am Bahnsteig' },
  ] },
  { t: '„Geht sich ein Kaffee noch aus?“', kinder: [{ t: 'Wartezeit an der Tür' }] },
] };

// Der Baum der Kaffeebar nach den Interviews (Torres Kap. 6): oberste Ebene = die drei Momente der Experience Map (journey-map.astro), darunter die Chancen
// aus den Interview-Snapshots, die mehr als ein Interview stützt (Torres’ Regel, S. 88; für die Bäume der Studierenden gilt die Kursregel auf baum.astro). Belege (Zitat-IDs) stehen auf baum.astro.
// Darstellen mit <Baum momente …>. Die Momente heißen seit 20.11. wie die Spalten beim Zählen (MOMENTNAMEN), keine Ich-Sätze;
// genutzt nur an Tag 3 (experience-map, baum, ziel-chance).
export const KAFFEEBAR_BAUM_INTERVIEWS: Knoten = { t: 'Mehr Pendler*innen steigen morgens mit Kaffee in den Zug', kinder: [
  { t: MOMENTNAMEN.a, kinder: [
    { t: '„Geht sich ein Kaffee noch aus?“' },
    { t: '„Wenn ich anstehe, reicht mir die Zeit nicht.“' },
    { t: '„Schnell geht nur der Automat.“' },
  ] },
  { t: MOMENTNAMEN.c, kinder: [
    { t: '„Wann ist mein Kaffee fertig?“' },
  ] },
  { t: MOMENTNAMEN.d },
] };
