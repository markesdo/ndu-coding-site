import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-3/experience-map.astro (Tag 3, 09:00–09:25): die Experience Map vor dem
// Baum nachschärfen. Folien 1–8 (Kaffeebar) in etwa 10 Minuten, dann 15 Minuten Durchgang am eigenen Material der
// Studierenden auf Miro (T3 · 0). Die drei Anläufe der Kaffeebar sind ausgedacht; Momente, Zitate und Zählung wie
// journey-map#beispiel. Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_TAG_3_EXPERIENCE_MAP: Record<string, Notiz> = {
  'warum-nochmal': {
    live: [
      'Ist-Zeit notieren; Folien 1–8 in zehn Minuten.',
      '„Der schwerste Schritt der Methode: Aus Geschichten werden Momente.“',
    ],
    kern: [
      { text: 'Oft reicht es, jeden Knoten der Experience Map auf die oberste Ebene des Baums zu legen; die Momente sollen sich nicht überschneiden.', quelle: `${TORRES}, S. 86–87` },
    ],
    ueberleitung: 'Was braucht ein Moment, damit er einen Ast trägt?',
  },
  bausteine: {
    live: [
      'Kacheln zügig aufdecken, je ein Satz.',
      'Torres: Knoten und Kontext. Zitat und Zählung: Kursregel.',
    ],
    kern: [
      { text: 'Knoten: „a distinct moment in time, an action, or an event“. Kontext an jedem Schritt: Was denkt, fühlt, tut die Person dort?', quelle: `${TORRES}, S. 56` },
    ],
    ueberleitung: 'Drei Anläufe an der Kaffeebar – an welchem Baustein hapert es?',
  },
  'drei-anlaeufe': {
    live: [
      'A, B, C verteilen; Timer 4 min, dann reihum zwei Sätze.',
      'Dann weiter: „Auflösung zeigen“ liegt auf der nächsten Folie.',
    ],
    uebung: { dauer: '4 min', form: 'allein, dann reihum laut' },
    ablauf: {
      achten: ['Erkennt jemand den eigenen Anlauf wieder: nicht vertiefen, beim Kaffeebar-Beispiel bleiben.'],
      aufloesung: 'A hat nur Schritte, B nur Gefühle, C fasst in der dritten Person zusammen – allen fehlen Zitat, Zählung, Umweg, Tief und Ende.',
    },
    ueberleitung: 'Zuerst A: der Ablauf.',
  },
  'anlauf-a': {
    live: [
      'Hier „Auflösung zeigen“: öffnet Folien 4 bis 8.',
      'Bilanz: tut ja, sonst nichts. Der Ablauf ist das halbe Material.',
    ],
    kern: [
      { text: '„Don’t just map out the happy path.“ Wiederholungen, Umwege und Abbrüche gehören auf die Map.', quelle: `${TORRES}, S. 56` },
    ],
    ueberleitung: 'B hat das Gegenteil: nur Gefühle.',
  },
  'anlauf-b': {
    live: ['Bilanz: fühlt ja, sonst nichts. Gefühl braucht seinen Schritt.'],
    ueberleitung: 'Und wenn man A und B übereinanderlegt?',
  },
  zusammen: {
    live: [
      'Spalten aufdecken: Schritte + Gefühl, dann Karte.',
      '„Was zum selben Zeitpunkt gehört, wird ein Moment.“',
    ],
    ueberleitung: 'C klingt sachlich – aber wer spricht da?',
  },
  'anlauf-c': {
    live: [
      'Belegprobe: Zitat zählt, Notiz nicht, Meinung nicht.',
      '„Eure eigene Frage ist kein Beleg.“',
    ],
    ueberleitung: 'Was allen drei Anläufen fehlt.',
  },
  'was-allen-fehlt': {
    live: ['Fertige Kaffeebar-Map: Umweg, Tief, Ende; graue Karte zählt nicht.'],
    kern: [
      { text: 'Momente ohne Überschneidung, damit man an einer Chance arbeiten kann, ohne alle anderen mitzuziehen.', quelle: `${TORRES}, S. 86` },
    ],
    ueberleitung: 'Jetzt euer eigenes Material, Schritt für Schritt.',
  },
  'eure-map': {
    live: [
      'Timer 15 min: je Person ca. 5 min auf T3 · 0.',
      'Reihenfolge Sofie → Joachim → Hewen.',
      'Je Zeile: Schritt 1, zusammenlegen, zählen, Momente, Map.',
      'Zeigen und fragen, nichts umschreiben; die Person entscheidet.',
    ],
    uebung: { dauer: '15 min (3 × 5)', form: 'Markus geht jede Zeile auf T3 · 0 durch' },
    miro: {
      frame: 'T3 · 0 · So entsteht eure Map',
      schritte: [
        'Eine Zeile je Person: Schritt 1 → zusammenlegen → zählen → Momente → Map.',
        '„Alle zu mir holen“ auf die Zeile, die dran ist.',
      ],
    },
    ueberleitung: 'Eure Momente werden die obersten Äste.',
  },
  'in-den-baum': {
    live: [
      'Kurz, jede*r für sich: zwei Momente ein Zeitpunkt?',
      'Weiter zum Baum: Momente von T3 · 0 werden blaue Karten.',
    ],
    ueberleitung: 'Die Momente stehen – jetzt wächst der Baum.',
  },
};
