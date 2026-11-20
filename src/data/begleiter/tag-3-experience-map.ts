import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-3/experience-map.astro (Tag 3, 09:00–09:25): die Experience Map vor dem
// Baum nachschärfen. Folien 1–8 (Kaffeebar) in etwa 10–12 Minuten, die Auflösung (Folien 4–8) in knapp 5; Folie 9
// („Momente finden“) am Beamer überspringen und erst am ersten Frame öffnen. Dann 15 Minuten Durchgang am eigenen Material
// der Studierenden auf Miro (T3 · 0). Ein Moment = Bezeichnung aus Sicht der Kundschaft + die Zitat-IDs, die er bündelt
// (tut · fühlt · belegt). Die drei Anläufe der Kaffeebar sind ausgedacht; Momente, Zitate und Zählung wie
// journey-map#beispiel. Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt.
// Welcher Moment je Person im Durchgang dran ist, steht nicht hier (Repo öffentlich, Analysen der Studierenden privat).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_TAG_3_EXPERIENCE_MAP: Record<string, Notiz> = {
  'warum-nochmal': {
    live: [
      'Ist-Zeit notieren; Kaffeebar-Folien in gut zehn Minuten.',
      '„Der schwerste Schritt der Methode: Aus Geschichten werden Momente.“',
      'Überschneidung hier nur nennen; erklärt wird sie bei „Was fehlt allen dreien?“.',
    ],
    kern: [
      { text: 'Oft reicht es, jeden Knoten der Experience Map auf die oberste Ebene des Baums zu legen; die Momente sollen sich nicht überschneiden.', quelle: `${TORRES}, S. 86–87` },
      { text: '„identify 3-5 distinct moments in time to serve as your top-level opportunities“ – ohne Begründung; im Buch hat das Beispiel vier Momente (S. 87).', quelle: 'Torres, Buchclub-Leitfaden zu Kap. 6 („Ch. 6: Mapping the Opportunity Space“, Product Talk, 2026)' },
    ],
    ueberleitung: 'Was braucht ein Moment, damit er einen Ast trägt?',
  },
  bausteine: {
    live: [
      'Kacheln zügig aufdecken, je ein Satz: tut, fühlt, belegt.',
      '„Ein Moment bündelt Zitate: ein Name aus Sicht der Kundschaft, darunter alle IDs.“',
      'Torres: Knoten und Kontext (S. 56), Muster über Geschichten (S. 87).',
      'IDs und Zählung: so im Kurs, damit jeder Ast nachprüfbar bleibt.',
    ],
    kern: [
      { text: 'Knoten: „a distinct moment in time, an action, or an event“. Kontext an jedem Schritt: Was denkt, fühlt, tut die Person dort?', quelle: `${TORRES}, S. 56` },
      { text: 'Muster über Geschichten: „What nodes are showing up in story after story?“ Die häufigsten Knoten zu einer Map zusammennähen.', quelle: `${TORRES}, S. 87` },
      { text: '„A journey map is only as reliable as the evidence behind it.“', quelle: 'Nielsen Norman Group, „Journey Mapping 101“' },
    ],
    ueberleitung: 'Drei Anläufe an der Kaffeebar – an welchem Baustein hapert es?',
  },
  'drei-anlaeufe': {
    live: [
      'Timer 2 min, still: A, B, C anschauen. Kein Papier, nichts ankreuzen.',
      'Danach offen an alle: „Wo wart ihr unsicher?“ Niemanden aufrufen.',
      'Kommt nichts: „Bei C steht ‚Viele‘ – ist das N von M?“',
      'Zeit: höchstens 1 min. Dann „Auflösung zeigen“ auf der nächsten Folie.',
    ],
    uebung: { dauer: '2 min + 1 min', form: 'allein und still, dann eine offene Frage an alle' },
    ablauf: {
      achten: [
        'Erkennt jemand die eigene Map wieder: notieren lassen und im Durchgang auf T3 · 0 aufgreifen; hier bei der Kaffeebar bleiben.',
      ],
      aufloesung: 'A hat nur Schritte, B nur Gefühle, C fasst in der dritten Person zusammen. „Frust“ gehört zu „anstellen, warten“. Allen fehlen die Belege (Zitat-IDs, N von M), Umweg, Tief und Ende.',
    },
    ueberleitung: 'Vergleicht mit eurem Blick von eben. Zuerst A: der Ablauf.',
  },
  'anlauf-a': {
    live: [
      'Hier „Auflösung zeigen“: öffnet Folien 4 bis 9.',
      'Bilanz: tut ja, fühlt und belegt nein. 40 Sekunden.',
      'Glatter Weg: „Wer fehlt hier? Der Automat – in drei von fünf Geschichten.“',
      '„Frust“ noch nicht auflösen: kommt bei „A und B übereinander“.',
    ],
    kern: [
      { text: 'Erst Knoten und Pfeile, dann Kontext an jedem Schritt: Was denkt, fühlt, tut die Person dort?', quelle: `${TORRES}, S. 56` },
      { text: '„Don’t just map out the happy path.“ Wiederholte Schritte, Aufgeben aus Frust und Schleifen gehören auf die Map.', quelle: `${TORRES}, S. 56` },
    ],
    ueberleitung: 'Wo der Frust entsteht, sagt A nicht. B hat das Gegenteil: nur Gefühle.',
  },
  'anlauf-b': {
    live: ['30 Sekunden. Bilanz: fühlt ja, tut und belegt nein.', '„Wann? Wobei?“ – nicht beantworten, weiter.'],
    ueberleitung: 'Und wenn man A und B übereinanderlegt?',
  },
  zusammen: {
    live: [
      'Frust-Antwort von eben aufgreifen: anstellen, warten.',
      'Spalte 2 zuerst zeigen, dann 1 und 3.',
      'Karte 1: „Fünf IDs, drei Geschichten. Die Arbeit: Welche Zitate gehören hierher?“',
      'Restzeile nur zeigen, nicht besprechen.',
    ],
    ueberleitung: 'C klingt sachlich – aber wer spricht da?',
  },
  'anlauf-c': {
    live: [
      '„Wer spricht da?“ Dann: „Viele“ gegen „3 von 5“.',
      'Belegprobe zeigen: Zitat gehört darunter, Notiz und Meinung nicht.',
      'Nur Punkt 1 sprechen; Punkt 2 und 3 stehen lassen.',
      '„Zitat fehlt“ nur hier sagen, bei A und B nicht.',
    ],
    ueberleitung: 'Was allen drei Anläufen fehlt.',
  },
  'was-allen-fehlt': {
    live: [
      'Map zeigen, ein Satz: Umweg, Tief, Ende.',
      'Map zeigt je ein Beispielzitat; ID-Listen standen auf „A und B übereinander“.',
      'Punkt 4 betonen: „Steht ein Zitat unter zwei Momenten, überschneiden sie sich.“',
      'Graue Karte nur erwähnen.',
    ],
    kern: [
      { text: 'Momente ohne Überschneidung, damit man an einer Chance arbeiten kann, ohne alle anderen mitzuziehen.', quelle: `${TORRES}, S. 86–87` },
    ],
    ueberleitung: 'Jetzt euer eigenes Material, Schritt für Schritt.',
  },
  'vom-tief-aus': {
    live: [
      'Am Beamer überspringen.',
      'Am ersten Frame öffnen, sobald eine Karte Gefühl oder Thema ist.',
      'Dort die drei Fragen zeigen: Kriterien für „Welche Zitate gehören hierher?“',
      'Zwölf Fragen und Tabelle: Handout.',
    ],
    kern: [
      { text: 'Im Interview führt die Zeitleiste: „What happened first?“, „What happened next?“, „What happened before that?“', quelle: `${TORRES}, S. 66` },
      { text: 'Zu breit? „Where did this pain point show up in your customer’s story?“', quelle: `${TORRES}, S. 88` },
      { text: 'Ein Gefühl ist ein Wegweiser: nicht das Gefühl festhalten, sondern seine Ursache (bei Torres für Chancen; für Momente übertragen).', quelle: `${TORRES}, S. 95` },
    ],
    ueberleitung: 'Jetzt euer eigenes Material, Schritt für Schritt.',
  },
  'eure-map': {
    live: [
      'Timer 15 min: je Person ca. 5 min auf T3 · 0.',
      'Reihenfolge Sofie → Joachim → Hewen.',
      'Je Frame ein Moment, nicht alle fünf Schritte: „Welche Zitate gehören hierher?“',
      'Dann: „Steht eine dieser IDs noch unter einem zweiten Moment?“',
      'Zeigen und fragen, nichts umschreiben; die Person entscheidet.',
    ],
    uebung: { dauer: '15 min (3 × 5)', form: 'Markus geht jeden Frame T3 · 0 durch' },
    miro: {
      frame: 'T3 · 0 · So entsteht eure Map - Sofie',
      schritte: [
        'Ein Frame je Person, über dem eigenen Baum; der Link oben führt zu Sofie, Joachim und Hewen liegen rechts daneben.',
        'Je Frame ein Moment: „Welche Zitate gehören hierher?“, dann die IDs gegen die anderen Momente prüfen.',
        '„Alle zu mir holen“ auf den Frame, der dran ist.',
      ],
    },
    ueberleitung: 'Eure Momente werden die obersten Äste.',
  },
  'in-den-baum': {
    live: [
      'Kurz, jede*r für sich: Steht eine Zitat-ID unter zwei Momenten?',
      'Weiter zum Baum: Momente von T3 · 0 werden blaue Karten.',
    ],
    ueberleitung: 'Die Momente stehen – jetzt wächst der Baum.',
  },
};
