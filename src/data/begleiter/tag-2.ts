import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-2.astro (12.11., online in Teams): Eröffnung und Abschluss des Tages.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (=====PAGE n=====), wie auf den Folien zitiert.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_TAG_2: Record<string, Notiz> = {
  heute: {
    live: [
      '„Heute wird aus euren fünf Geschichten ein Baum voller Chancen.“',
      'Fluss zeigen: Snapshots, Map und Baum heute, Ziel-Chance an Tag 3.',
      'Fragen: Wer hat Interviews in der Werkstatt? Sonst bis 14:45 eintragen.',
      'Online: Chat offen halten, heute schreibt jede*r oft hinein.',
      'Annahmen-Map von Tag 1 öffnen lassen, Belege sofort eintragen.',
    ],
    miro: {
      frame: 'Baum · Beispiel Kaffeebar',
      schritte: [
        'Kurz zeigen: Rechts neben Start hier stehen die Bäume, einer pro Produkt („Baum · Name“).',
        'Heute wachsen dort Momente und Chancen; T2 · 2 bleibt die Anleitung.',
      ],
    },
    verstaendnis: {
      frage: 'Warum zeichnen wir die Experience Map heute neu, obwohl es sie seit Tag 1 gibt?',
      antwort: 'Die Map von Tag 1 war ein Entwurf aus Vermutungen. Torres: Die drei Artefakte sind keine Einmal-Übung, sie entwickeln sich weiter, so wie das Verständnis der Kundschaft wächst (S. 49). Heute kommen fünf echte Geschichten dazu.',
      falsch: '„Weil sie falsch war“ – sie war nicht falsch, sondern unbelegt.',
    },
    kern: [
      {
        text: 'Drei Artefakte für ein gemeinsames Verständnis: die Experience Map, die festhält, was das Team über die Kundschaft weiß (Kap. 4), der Interview-Snapshot für das, was jedes Interview gezeigt hat (Kap. 5), und der Opportunity Solution Tree, auf dem die Chancen geordnet (Kap. 6) und verglichen werden (Kap. 7). „These artifacts are not intended to be one-time activities.“',
        quelle: `${TORRES}, S. 49`,
      },
    ],
    ueberleitung: 'Wir starten mit euren Snapshots: Warum verdichtet man nach jedem Interview und nicht erst am Ende?',
  },

};

// Begleiter-Notizen zu src/pages/innolab/tag-2/abschluss.astro (eigene Seite nach dem Baum, damit der Abschluss im Beamer am Ende kommt).
export const NOTIZEN_TAG_2_ABSCHLUSS: Record<string, Notiz> = {
  abschluss: {
    live: [
      'Checkliste Punkt für Punkt, jede*r hakt selbst ab.',
      'Fragen: Welche Annahme von Tag 1 steht jetzt anders da?',
      'Entscheidungslog: eine Zeile pro Entscheidung, auch „noch keiner“ als Beleg.',
      '„Tag 3 am 21. November beginnt in eurem Baum auf Miro: Ihr wählt eine Ziel-Chance.“',
      'Erinnern: Claude Pro erst am 21. November neu abschließen.',
    ],
    ueberleitung: 'Danke für heute – bis zum 21. November.',
    fragen: [
      {
        frage: 'Müssen Map und Baum bis Tag 3 fertig sein?',
        antwort: 'Nein. Struktur wird gemacht, verworfen und neu gemacht; macht so viel, wie ihr gerade wisst, der Baum wächst mit jedem Interview (Torres S. 91). Für Tag 3 reicht ein Baum mit belegten Chancen unter den Momenten.',
      },
    ],
  },
};
