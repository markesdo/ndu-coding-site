import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-3/experience-map.astro (Tag 3, 09:00–09:25): die Experience Map vor dem
// Baum nachschärfen. Die drei Anläufe der Kaffeebar sind ausgedacht; Momente, Zitate und Zählung wie journey-map#beispiel.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_TAG_3_EXPERIENCE_MAP: Record<string, Notiz> = {
  'warum-nochmal': {
    live: [
      'Ist-Zeit notieren.',
      '„Der schwerste Schritt der Methode: Aus Geschichten werden Momente.“',
      'Keine Map von Tag 2 kommentieren, nicht zurückblicken.',
    ],
    kern: [
      { text: 'Oft reicht es, jeden Knoten der Experience Map auf die oberste Ebene des Baums zu legen; die Momente sollen sich nicht überschneiden.', quelle: `${TORRES}, S. 86–87` },
    ],
    ueberleitung: 'Was braucht ein Moment, damit er einen Ast trägt?',
  },
  bausteine: {
    live: [
      'Kacheln einzeln aufdecken, je ein Satz.',
      '„Ein Moment ist ein Zeitpunkt – mit dem, was die Person dort tut und fühlt.“',
      'Torres: Knoten und Kontext. Zitat und Zählung: Kursregel.',
    ],
    kern: [
      { text: 'Knoten: „a distinct moment in time, an action, or an event“. Kontext an jedem Schritt: Was denkt, fühlt, tut die Person dort?', quelle: `${TORRES}, S. 56` },
    ],
    ueberleitung: 'Drei Anläufe an der Kaffeebar – an welchem Baustein hapert es?',
  },
  'drei-anlaeufe': {
    live: [
      'Anläufe verteilen: A, B, C – je eine Person.',
      'Timer 4 min: still schauen, dann reihum laut, zwei Sätze.',
      'Keine Hinweise geben; die vier Bausteine stehen unten.',
      'Danach „Auflösung zeigen“: öffnet die nächsten fünf Folien.',
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
      'Bilanz zeigen: tut ja, sonst nichts.',
      'Fragen: Wo würde die Pendlerin umkehren?',
      'Falle: „Ablauf ist falsch“ – er ist das halbe Material.',
    ],
    kern: [
      { text: '„Don’t just map out the happy path.“ Wiederholungen, Umwege und Abbrüche gehören auf die Map.', quelle: `${TORRES}, S. 56` },
    ],
    ueberleitung: 'B hat das Gegenteil: nur Gefühle.',
  },
  'anlauf-b': {
    live: [
      'Bilanz zeigen: fühlt ja, sonst nichts.',
      'Fragen: Wann genug Zeitdruck, dass jemand geht?',
      'Gefühl als Ast: Prüfpunkt baum-konkret des Baums.',
    ],
    ueberleitung: 'Und wenn man A und B übereinanderlegt?',
  },
  zusammen: {
    live: [
      'Spalten einzeln aufdecken: Schritte + Gefühl, dann Karte.',
      '„Was zum selben Zeitpunkt gehört, wird ein Moment.“',
      'Graue Schritte zeigen: kein Gefühl, kein Zitat.',
      'Hinweis: Jede*r prüft gleich die eigene Map so.',
    ],
    ueberleitung: 'C klingt sachlich – aber wer spricht da?',
  },
  'anlauf-c': {
    live: [
      'Links gegen rechts: Deutung gegen Worte der Kundschaft.',
      'Belegprobe: Zitat zählt, Notiz nicht, Meinung nicht.',
      '„Die ID muss tragen, was auf der Karte steht.“',
      '„Eure eigene Frage ist kein Beleg.“',
    ],
    ueberleitung: 'Was allen drei Anläufen fehlt.',
  },
  'was-allen-fehlt': {
    live: [
      'Fertige Kaffeebar-Map zeigen: Umweg, Tief, Ende.',
      'Graue Karte: zählt nicht, ist die nächste Interviewfrage.',
      'Fragen: Passt ein Zitat unter zwei Momente?',
    ],
    kern: [
      { text: 'Momente ohne Überschneidung, damit man an einer Chance arbeiten kann, ohne alle anderen mitzuziehen.', quelle: `${TORRES}, S. 86` },
    ],
    ueberleitung: 'Jetzt eure eigene Map.',
  },
  'eure-map': {
    live: [
      'Timer 12 min: allein in der eigenen Spalte auf T2 · 1.',
      'Herumgehen: auf die Stelle zeigen und fragen, nichts umschreiben.',
      'Fragen: Welcher Schritt gehört zu diesem Gefühl?',
      'Nach 10 min: Je Moment ein Zitat mit ID?',
    ],
    uebung: { dauer: '12 min', form: 'allein, Markus geht herum' },
    miro: {
      frame: 'T2 · 1 · Experience Map',
      schritte: [
        'Jede*r arbeitet in der eigenen Spalte; Schritt und Gefühl zum selben Zeitpunkt zusammenlegen.',
        'Je Moment ein Zitat mit ID und ‚N von 3‘; ohne Zitat graue Karte.',
      ],
    },
    ueberleitung: 'Reihum: eure Momente, laut.',
  },
  'in-den-baum': {
    live: [
      'Reihum, je eine Minute: Momente in Reihenfolge vorlesen.',
      'Höchstens eine Frage pro Person: ein Zeitpunkt oder zwei?',
      'Weiter zum Baum: Momente werden die blauen Karten.',
    ],
    uebung: { dauer: '3 min', form: 'reihum laut' },
    ueberleitung: 'Die Momente stehen – jetzt wächst der Baum.',
  },
};
