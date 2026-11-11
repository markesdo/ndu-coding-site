import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-2.astro (12.11., online in Teams): Eröffnung und Abschluss des Tages.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (=====PAGE n=====), wie auf den Folien zitiert.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const MOMTEST = 'Rob Fitzpatrick, The Mom Test';

export const NOTIZEN_TAG_2: Record<string, Notiz> = {
  heute: {
    live: [
      '„Heute wird aus euren fünf Geschichten ein Baum voller Chancen.“',
      'Fluss zeigen: Snapshots, Map und Baum heute, Ziel-Chance an Tag 3.',
      'Fragen: Wer hat Interviews in der Werkstatt? Sonst bis 14:50 eintragen.',
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
    ueberleitung: 'Bevor wir starten: vier kurze Fragen zu Tag 1, Antworten in den Chat.',
  },

  'rueckblick-outcome': {
    live: [
      'Frage stellen, jede*r ein Satz in den Chat, dann aufdecken.',
      '„Gemessen wird, was Menschen anders tun – nicht, was ihr baut.“',
      'Heute: In den Baum kommt nur, was den Outcome bewegt.',
    ],
    verstaendnis: {
      frage: 'Ist „100 Vorbestellungen pro Woche“ ein Outcome?',
      antwort: 'Nein, eine Traction Metric: Sie misst die Nutzung einer Lösung und legt sie schon fest. Der Outcome ist, dass mehr Pendler*innen mit Kaffee in den Zug steigen (Torres S. 40–41).',
      falsch: '„Ja, das ist doch Verhalten“ – Verhalten mit eurer Lösung, nicht das Verhalten, das ihr ändern wollt.',
    },
    kern: [
      {
        text: 'Josh Seiden, zitiert bei Torres: „An outcome is a change in human behavior that drives business results.“ Business Outcome, Product Outcome, Traction Metric: Die Wurzel des Baums ist ein Product Outcome, sofort messbar und vom Team beeinflussbar.',
        quelle: `${TORRES}, S. 37, 40`,
      },
    ],
    ueberleitung: 'Vom Ziel zum Rahmen: Für wen baut ihr eigentlich?',
  },

  'rueckblick-rahmen': {
    live: [
      'Frage stellen: Zielgruppe in einem Satz in den Chat, ohne Lösung.',
      'Aufdecken: Kaffeebar-Brief, „fester Morgenzug“ seit D3.',
      'Falle: Lösung im Problem („brauchen eine App“).',
      'Entscheidungslog nur zeigen, nicht erklären – kommt in der Synthese.',
    ],
    verstaendnis: {
      frage: 'Warum steht beim Kaffeebar-Brief jetzt „fester Morgenzug“ statt „nach Wien“?',
      antwort: 'Die fünf Interviews haben gezeigt, dass der feste Zug zählt, nicht das Ziel; das Log hält es fest: D3 ersetzt D1, Beleg gesagt (I1–I5).',
    },
    kern: [
      {
        text: 'Kaffeebar-Brief, Stand 05.11.: Für wen „Pendler*innen, die werktags zwischen 7:15 und 7:45 auf ihren festen Morgenzug warten“; Problem „Die Schlange ist morgens länger als die Zeit bis zur Abfahrt …“; nicht: Lieferung an den Bahnsteig, Mittagsgeschäft, andere Bahnhöfe. Kursbeispiel, keine Buchquelle.',
        quelle: 'Werkstatt, Beispiel Kaffeebar, brief.json und entscheidungen.json (D1, D3)',
      },
    ],
    ueberleitung: 'Alles im Brief ist eine Annahme – welche testet ihr zuerst?',
  },

  'rueckblick-annahmen': {
    live: [
      'Frage stellen, je eine Annahme in den Chat, mit Grund.',
      'Aufdecken: oben rechts – sehr wichtig, kein Beleg.',
      '„Eure Interviews waren der erste Test eurer riskantesten Annahme.“',
      'Heute: Zitat-IDs als Beleg in die Annahmen-Map.',
    ],
    verstaendnis: {
      frage: 'Warum testet die Kaffeebar A1 vor A3 („bestellen in 20 s im Gehen“)?',
      antwort: 'A1 ist wichtiger: Entscheiden Pendler*innen erst in der Halle, hilft keine Vorbestellung, egal wie schnell sie geht. Beide sind kaum belegt, also gewinnt die Wichtigkeit.',
    },
    kern: [
      {
        text: 'Bland, Assumptions Map: „Focus on the top right quadrant to identify which hypotheses to test first. This defines your near-term experimentation.“ Oben links: „Check the top left quadrant against your evidence and share it with the team.“',
        quelle: `${BLAND}, S. 38`,
      },
    ],
    ueberleitung: 'Und wie ihr danach gefragt habt: eine letzte Frage.',
  },

  'rueckblick-mom-test': {
    live: [
      'Bekannt aus Need Finding: nur diese eine Frage, nicht erklären.',
      'Antwort in den Chat, dann aufdecken.',
      'Heute: als Beleg zählt Erzähltes, nicht Gemeintes.',
    ],
    kern: [
      {
        text: 'Die drei Regeln des Mom Test: „Talk about their life instead of your idea“, „Ask about specifics in the past instead of generics or opinions about the future“, „Talk less and listen more“. Faustregeln: „Opinions are worthless.“ „Anything involving the future is an over-optimistic lie.“',
        quelle: `${MOMTEST}, S. 13, 16`,
      },
    ],
    ueberleitung: 'Genau das sucht ihr jetzt in euren Snapshots: Warum verdichtet man nach jedem Interview und nicht erst am Ende?',
  },
};

// Begleiter-Notizen zu src/pages/innolab/tag-2/abschluss.astro (eigene Seite nach dem Baum, damit der Abschluss im Beamer am Ende kommt).
export const NOTIZEN_TAG_2_ABSCHLUSS: Record<string, Notiz> = {
  'log-heute': {
    live: [
      'Fragen: Was hat sich durch eure Interviews geändert? Je eine Zeile vorlesen.',
      'D3 vorlesen: die alte Zeile D1 bleibt, nur „ersetzt am“.',
      'Zeit: drei Minuten, nicht diskutieren – Rückfragen nach Tag 3.',
      'Falle: Zeile ohne Beleg-Stufe oder ohne ID.',
    ],
    verstaendnis: {
      frage: 'Warum korrigiert die Kaffeebar D1 nicht einfach?',
      antwort: 'Weil dann niemand mehr sieht, dass die Zielgruppe geraten war und erst die Interviews sie geschärft haben – genau das zeigt der Pitch an Tag 7. In der Werkstatt lassen sich gespeicherte Zeilen auch nicht ändern, nur ersetzen.',
      falsch: '„Damit das Log vollständig ist“ – es geht nicht um Vollständigkeit, sondern um den sichtbaren Lernweg.',
    },
    kern: [
      {
        text: 'Kaffeebar: D3 „Zielgruppe: Pendler*innen mit festem Morgenzug, 7:15–7:45, egal wohin“, Grund „Alle 5 haben einen festen Zug zwischen 7:20 und 7:50; das Ziel ist verschieden (Wien, Uni) …“, Beleg gesagt (I1–I5), ersetzt D1 („Pendler*innen nach Wien“, Beleg noch keiner).',
        quelle: 'Werkstatt, Beispiel Kaffeebar, entscheidungen.json',
      },
      {
        text: 'Bland, Learning Card: Der letzte Schritt „Therefore, we will …“ ist die Entscheidung; Pivot heißt, ein Element der Idee deutlich zu ändern, frühere Evidenz kann dann irrelevant werden. D3 ersetzt D1 ist ein kleiner Pivot beim Kundensegment.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 55, 61',
      },
    ],
    ueberleitung: 'Und jetzt die Checkliste für heute.',
  },
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
