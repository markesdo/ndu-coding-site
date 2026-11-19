import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/ziel-chance.astro (Tag 3, 10:40–11:30; bis 19.11. 10:30–11:30).
// Kürzen, wenn hinten (in dieser Reihenfolge): bauchwahl, ulwick-outcomes, zweiwegtuer, warum, vorgehen Schritt 3.
// Vorwissen: „bekannt“ aus Need Finding / Market Research (vorwissen.ts).
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt (Kap. 7, S. 96–104; Kap. 2, S. 30–31).
// Ulwick-Seiten = gedruckte HBR-Seiten 91–97 (quellen/ulwick/text.txt).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const ULWICK = 'Anthony W. Ulwick, Turn Customer Input into Innovation, HBR Januar 2002';

export const NOTIZEN_ZIEL_CHANCE: Record<string, Notiz> = {
  warum: {
    live: [
      'Ist-Zeit notieren.',
      'Fragen: Wie habt ihr in Need Finding entschieden, woran ihr arbeitet?',
      'Bühne erzählen: Jubel nach dem ersten Halbsatz, dann der zweite.',
      '„Heute wählt ihr eine Chance. Nicht die beste für immer – die nächste.“',
      'Fluss zeigen: Baum, Ziel-Chance, Frage, Ideen.',
      'Wenn hinten: nur Zitat und Fluss, die zwei Punkte weglassen.',
    ],
    geschichte: {
      text: 'Torres steht auf der Bühne der Davies Symphony Hall in San Francisco, letzter Vortrag des Tages bei Mind the Product, danach nur noch die Party. Sie will dem Saal einen Satz mitgeben: „You are never one feature away from success…“ – der Saal jubelt. Sie ist nicht fertig, wartet, bis es still ist: „…and you never will be.“ Sie weiß, dass die Leute das hören müssen – und dass es nicht reicht, es zu sagen.',
      quelle: `${TORRES}, S. 96`,
    },
    kern: [
      {
        text: 'Build Trap (Melissa Perri): Erfolg an Outputs messen statt an Outcomes. Fast alle Gespräche laufen im Lösungsraum: Roadmaps, Backlogs, Releases. „Our customers don’t care about the majority of our feature releases.“ – „Product strategy happens in the opportunity space.“ Strategie entsteht aus den Entscheidungen, welche Outcomes, welche Kundschaft, welche Chancen.',
        quelle: `${TORRES}, S. 96–97`,
      },
      {
        text: 'Drei Gründe für eine Chance zur Zeit: „By addressing only one opportunity at a time, we unlock the ability to deliver value iteratively over time.“ Wer sich über viele Chancen verteilt, landet wieder im Wasserfall. Zweitens Raum, mehrere Lösungen zu vergleichen. Drittens Kanban: Eine Literaturübersicht der Universität Oulu fand bessere Qualität, verlässlichere Lieferung, weniger Beschwerden – „limiting work in progress was a key component of this success“.',
        quelle: `${TORRES}, S. 97–98`,
      },
    ],
    fragen: [
      {
        frage: 'Wir sind zu dritt mit drei Produkten – gilt „eine zur Zeit“ für uns?',
        antwort: 'Ja, pro Produkt. Torres schreibt für ein Team mit einem Produkt; bei euch hat jede*r ein eigenes, also wählt jede*r eine Ziel-Chance (S. 97–98).',
      },
    ],
    ueberleitung: 'Wie wählt man? Zuerst mit der richtigen Frage.',
  },

  'ob-oder-welche': {
    live: [
      'Linke Frage vorlesen. Fragen: Was ist daran schwach?',
      'Erwartet: Es fehlt der Vergleich – was lassen wir dafür liegen?',
      'Aufdecken: rechte Frage, dann die zwei Begriffe.',
      '„Ihr fragt nie: Sollen wir das machen? Ihr fragt: Welche von diesen zuerst?“',
    ],
    verstaendnis: {
      frage: 'Warum führt „Sollen wir diese Chance angehen?“ zu schlechten Entscheidungen?',
      antwort: 'Sie macht anfällig für Bestätigungsfehler, und man vergisst die Opportunitätskosten – was man dafür nicht tut (S. 99).',
      falsch: '„Weil man Nein sagen könnte“ – das Problem ist der fehlende Vergleich, nicht die Antwort.',
    },
    kern: [
      {
        text: 'Aus „Decisive“ von Chip und Dan Heath: vier Feinde guter Entscheidungen – zu enger Blick, Bestätigungsfehler, kurzfristige Gefühle, Selbstüberschätzung. Der eine Rat, den Torres im ganzen Buch nutzt: „whether or not“-Entscheidungen vermeiden. Typisch: „Should we stop everything and fix this problem?“ – „This is perhaps the most common mistake product trios make.“',
        quelle: `${TORRES}, S. 30`,
      },
      {
        text: 'Stattdessen vergleichen: „Which of these customer needs is most important for us to address right now?“ Beim Priorisieren: nie „Should we pursue this opportunity?“ – „That’s a ‚whether or not‘ question that leads to poor decisions.“ Immer eine Gruppe von Geschwistern gegeneinander.',
        quelle: `${TORRES}, S. 31, 99`,
      },
    ],
    ueberleitung: 'Und welche vergleicht ihr? Das sagt euch der Baum.',
  },

  baum: {
    live: [
      'Abbildung von oben lesen: umrahmt ist, was verglichen wird.',
      '„Ein Ast gewählt – alle anderen Äste könnt ihr vorerst vergessen.“',
      'Fragen: Was ist ein Blatt – und ist ein Blatt leicht?',
      'Erwartet: keine Teilchance darunter; leicht heißt das nicht.',
    ],
    verstaendnis: {
      frage: 'Warum wählt ihr immer ein Blatt und nicht den ganzen Ast?',
      antwort: 'Weil ihr Wert nach und nach liefern wollt: eine kleine Chance nach der anderen statt mehrere zugleich (S. 99).',
      falsch: '„Weil Blätter leicht sind“ – ein Blatt heißt nur, dass ihr noch keine Teilchancen darunter kennt (S. 99).',
    },
    kern: [
      {
        text: 'Zuerst die obersten Chancen gegeneinander – bei uns die Momente. Ist die Struktur gut, liegt die wirkungsvollste Chance unter dem gewählten Ast. „Notice how a single decision … reduces the amount of assessing you have to do.“ – „That’s the power of the tree structure.“ Dann dasselbe mit den Teilchancen, bis keine mehr darunter hängt.',
        quelle: `${TORRES}, S. 98–99`,
      },
      {
        text: '„You always want to choose a leaf-node opportunity“. Ein Blatt ist nicht unbedingt leicht: Es heißt nur, dass ihr (noch) keine Teilchancen kennt.',
        quelle: `${TORRES}, S. 99`,
      },
    ],
    ueberleitung: 'Probiert es an der Kaffeebar – erst aus dem Bauch.',
  },

  bauchwahl: {
    live: [
      'Reihum, laut: ein Moment, ein Satz warum.',
      'Zeit: 30 Sekunden pro Person, nicht diskutieren.',
      'Mitschreiben: pro Antwort ein Stichwort zum Grund.',
      'Falle: eine Wahl richtig nennen – die Auflösung kommt gleich.',
      'Wenn hinten: überspringen, bei den Linsen einmal fragen.',
    ],
    uebung: { dauer: '2 min', form: 'reihum laut, ein Satz pro Person' },
    ablauf: {
      schritte: [
        'Baum der Kaffeebar zeigen, die drei Momente vorlesen.',
        'Reihum: Jede*r nennt einen Moment und einen Satz, warum dieser zuerst.',
        'Pro Antwort ein Stichwort notieren (z. B. „trifft die meisten“, „den Automaten gibt es schon“). Auf der nächsten Folie ordnest du sie den Linsen zu.',
      ],
      achten: [
        'Nicht werten. Wer sich einer Vorrednerin anschließt, braucht trotzdem einen eigenen Grund.',
        'Drei gleiche Gründe sind auch ein Befund: Dann fehlen drei Linsen.',
      ],
      aufloesung: 'Keine richtige Wahl. Die Gründe sind fast immer Linsen: wie viele (Größe), was es schon gibt (Markt), was die Bar kann (eigene Lage), wie sehr es schmerzt (Kundschaft). Die Wahl der Kaffeebar kommt auf der Folie „Am Beispiel“.',
    },
    kern: [
      {
        text: 'Die Mini-Übung ist Kursformat. Sie bereitet Torres’ Punkt vor, dass jede Gruppe von Kriterien eine eigene Linse auf die Wirkung ist („a different lens through which to view impact“).',
        quelle: `${TORRES}, S. 101; Mini-Übung: Kursformat`,
      },
    ],
    ueberleitung: 'Eure Gründe hatten etwas gemeinsam: Jede*r hat durch eine Linse geschaut.',
  },

  linsen: {
    live: [
      'Aufdecken: Linse für Linse, je Torres’ Beispiel dazu.',
      'Nach der vierten: Stichworte von eben zuordnen – welche Linse fehlte?',
      '„Wie viele“ und „wie oft“ getrennt fragen.',
      'Eigene Lage für alle: Produkt-Brief und was jede*r kann.',
      'Falle: nur die Kundenlinse nutzen – alle vier.',
    ],
    verstaendnis: {
      frage: 'Eine Chance trifft alle, aber nur einmal im Jahr; eine andere trifft wenige, aber täglich. Welche ist größer?',
      antwort: 'Das lässt sich nicht pauschal sagen – darum trennt Torres „how many“ von „how often“. Es sind verschiedene Wirkungen, und ihr schätzt beide grob im Vergleich der Geschwister (S. 99–100).',
      falsch: '„Die mit mehr Betroffenen“ – die Häufigkeit zählt genauso.',
    },
    kern: [
      {
        text: 'Größe: wie viele, wie oft – nicht genau messen („a never-ending data-gathering mission“), sondern Geschwister grob gegeneinander schätzen; Quellen: Verhaltensdaten, Support-Tickets, kleine Umfragen, Interview-Snapshots.',
        quelle: `${TORRES}, S. 99–100`,
      },
      {
        text: 'Markt: Pflicht oder Unterscheidung – „A missing table stake could torpedo sales, while a strategic differentiator could open up new customer segments.“ Dazu Trends: Wegen der „cord-cutters“ könnte der Streaming-Dienst „I want to watch live sports“ vorziehen.',
        quelle: `${TORRES}, S. 100`,
      },
      {
        text: 'Eigene Lage: Vision, Mission, Ziele, Werte, politisches Kapital, Stärken und Schwächen – auf Ebene Firma, Bereich und Team. „Google might choose to address an opportunity that Apple would never touch.“',
        quelle: `${TORRES}, S. 100–101`,
      },
      {
        text: 'Kundschaft: wie wichtig, wie zufrieden mit heutigen Lösungen; Vorrang hat wichtig und schlecht gelöst. Torres nennt als Quelle der Matrix Dan Olsen und Chen et al. (2007), nicht Ulwick.',
        quelle: `${TORRES}, S. 101, Fußnote 31`,
      },
    ],
    fragen: [
      {
        frage: 'Wir haben keine Firma – was ist bei uns die eigene Lage?',
        antwort: 'Euer Produkt-Brief (Ziel, „macht es nicht“) und was ihr selbst besonders gut könnt. Torres zählt Stärken des Teams ausdrücklich dazu (S. 101).',
      },
      {
        frage: 'Woher nehmen wir Zahlen für die Größe?',
        antwort: 'Aus den Snapshots: In wie vielen der fünf Interviews kam es vor, und wie oft passiert es der Person? Grob schätzen reicht (S. 100).',
      },
    ],
    ueberleitung: 'So sieht das bei der Kaffeebar aus.',
  },

  beispiel: {
    live: [
      'Erst der Ast: Halle, weil dort die meisten entscheiden.',
      'Aufdecken: Zeile für Zeile, je vorher fragen: Wer liegt vorn?',
      'Größe: unentschieden – je drei Interviews.',
      '„Kein Sieger bei der Größe. Markt und eigene Lage geben den Ausschlag.“',
      'Falle: die Tabelle als Punkteschema lesen – es sind Sätze, keine Punkte.',
    ],
    verstaendnis: {
      frage: 'Zeitnot und Nichtwissen stützen gleich viele Interviews. Warum gewinnt das Nichtwissen?',
      antwort: 'Wegen der anderen Linsen: Die Zeitnot deckt der Automat schon ab, das Nichtwissen niemand (Markt); die Bar kennt ihre Wartezeit (eigene Lage); ungelöst ist heute das Nichtwissen (Kundschaft).',
      falsch: '„Weil es mehr Leute betrifft“ – bei der Größe liegen beide gleich.',
    },
    kern: [
      {
        text: 'Kaffeebar: Verglichen wurden zuerst die drei Momente, dann die drei Geschwister unter „Ich komme in die Halle und entscheide.“ Belege: „Geht sich ein Kaffee noch aus?“ (I2-4, I3-2, I5-2), „Wenn ich anstehe, reicht mir die Zeit nicht.“ (I2-2, I3-4, I4-1), „Schnell geht nur der Automat.“ (I1-3, I4-3 – bei I4-3 unsere Lesart).',
        quelle: 'Werkstatt, Beispiel Kaffeebar; baum.astro, Folie beispiel',
      },
      {
        text: '„There may not be a clear winner, and that’s okay.“ Eine Chance kann bei der Größe vorn liegen, eine andere bei der eigenen Lage, eine dritte bei der Kundschaft. Aufgabe des Teams: darüber streiten und für jetzt entscheiden.',
        quelle: `${TORRES}, S. 101`,
      },
    ],
    ueberleitung: 'Vier Linsen, drei Chancen – da liegt eine Punktetabelle nahe. Torres sagt: nicht.',
  },

  'kein-punkteschema': {
    live: [
      'Zitat vorlesen, kurz stehen lassen.',
      'Fragen: Was verliert ihr, wenn ihr Punkte vergebt?',
      '„Die Linsen füttern euer Gespräch. Sie ersetzen es nicht.“',
      'Ankündigen: Gleich kommt jemand, der genau das Gegenteil sagt.',
    ],
    verstaendnis: {
      frage: 'Was ist nach Torres falsch daran, jede Chance pro Linse zu bepunkten und zu summieren?',
      antwort: 'Viel Arbeit, voller Annahmen, keine bessere Entscheidung. Und die Formel lässt glauben, es gebe eine einzig richtige Antwort – dann hört man auf zu denken (S. 101–102).',
    },
    kern: [
      {
        text: '„Don’t do this. This is a messy, subjective decision, and you want to keep it that way.“ Relativ vergleichen, nicht absolut bewerten. „Use the lenses to fuel your conversation.“',
        quelle: `${TORRES}, S. 101`,
      },
      {
        text: '„When we turn a subjective, messy decision into a quantitative math formula, we are treating an ill-structured problem as if it were a well-structured problem.“ – „Once we mathematize this process, we’ll stop thinking and go strictly by the numbers.“ Mit Karl Weick: genug Zweifel lassen, um später umzusteuern.',
        quelle: `${TORRES}, S. 102`,
      },
    ],
    ueberleitung: 'Die Gegenposition kommt von Anthony Ulwick – und beginnt mit einem Jet Ski.',
  },

  'ulwick-outcomes': {
    live: [
      'Jet Ski erzählen: gefragt, Polster geliefert, den Sitz bauten andere.',
      'Fragen: Was hätte Kawasaki stattdessen fragen sollen?',
      'Fluss zeigen: vom Wunsch über „Warum?“ zum Satz.',
      '„Ein Outcome-Satz hat eine Richtung und eine Maßeinheit.“',
      'Wenn hinten: nur den Fluss, Jet Ski in einem Satz.',
    ],
    geschichte: {
      text: 'Kawasaki beherrschte den Markt für Wassersport-Fahrzeuge und fragte die Fahrer*innen, was die Fahrt auf dem Jet Ski verbessern würde. Die wünschten sich mehr Polster an den Seiten, damit das Stehen bequemer wird. Nach einem Sitz fragte niemand. Kawasaki lieferte, was gewünscht war; andere Hersteller entwickelten Modelle zum Sitzen und verdrängten Kawasaki von der Spitze – eine Firma, die für Motorräder bekannt ist, auf denen niemand steht.',
      quelle: `${ULWICK}, S. 92–93`,
    },
    verstaendnis: {
      frage: 'Macht aus „Am liebsten wüsste ich einfach, wann er fertig ist.“ (I2-5) einen Outcome-Satz.',
      antwort: 'Zum Beispiel „Minimiere die Zeit, bis ich weiß, wann mein Kaffee fertig ist“: Richtung (minimiere) plus Maßeinheit (Zeit), ohne Lösung (S. 95).',
      falsch: '„Eine Anzeige mit der Wartezeit“ – das ist eine Lösung.',
    },
    kern: [
      {
        text: '„Customers only know what they have experienced.“ Niemand hätte nach Mikrowelle, Klettverschluss oder Post-it gefragt. Wer nach Lösungen fragt, wird zur Bedienung am Fast-Food-Schalter, die Bestellungen abarbeitet. „What form the solutions take should be up to you, and you alone.“',
        quelle: `${ULWICK}, S. 92`,
      },
      {
        text: 'Becherhalter: Mitte der 1980er wünschte sich die Kundschaft von Ford, Chrysler und GM Becherhalter. Japanische Hersteller hatten sie seit Jahren; als die amerikanischen nachzogen, gewann keiner einen Vorsprung – die Kundschaft sagte nur: „it’s about time.“',
        quelle: `${ULWICK}, S. 93`,
      },
      {
        text: 'So entsteht ein Outcome-Satz: Die Moderation nimmt einen Wunsch („easy to maneuver“), fragt warum (schnell durch gewundene Gefäße kommen) und schreibt ihn mit Art der Verbesserung (minimize, increase) und Maßeinheit (time, number, frequency): „minimize the time it takes to maneuver through a winding vessel“. Dann bestätigen lassen. Ohne Lösungen und ohne unscharfe Wörter wie „easy“, „reliable“.',
        quelle: `${ULWICK}, S. 95`,
      },
      {
        text: 'Derselbe Griff wie bei den Snapshots an Tag 2: „If you had that feature, what would that do for you?“',
        quelle: `${TORRES}, S. 69`,
      },
    ],
    fragen: [
      {
        frage: 'Ist ein Outcome-Satz dasselbe wie unser Outcome im Produkt-Brief?',
        antwort: 'Nein. Der Outcome im Brief ist, was Menschen mit eurem Produkt anders tun (Torres, S. 40). Ulwicks „desired outcome“ ist, was die Kundschaft erreichen will – näher an dem, was im Baum Chance heißt (Ulwick, S. 92; Einordnung: unsere).',
      },
    ],
    ueberleitung: 'Hat man solche Sätze, lässt sich rechnen.',
  },

  ulwick: {
    live: [
      'Tabelle lesen lassen: Welche Zeile ist die größte Chance?',
      'Formel an Zeile 1 vorrechnen: 9,5 + (9,5 − 3,2) = 15,8.',
      'Fragen: Zeile 2 und 5, gleiche Lücke – warum 12,4 gegen 9,2?',
      '„Die Klammer wird nie negativ: Zu zufrieden gibt es nicht.“',
      'Bei Bedarf: Cordis-Ergebnis erzählen – Stent, Marktanteil.',
    ],
    verstaendnis: {
      frage: 'Wichtigkeit 6,5, Zufriedenheit 8,5 – welcher Wert?',
      antwort: '6,5. Die Klammer wäre −2, wird aber nie kleiner als null (S. 96–97).',
      falsch: '4,5 – so rechnet, wer die Klammer negativ werden lässt.',
    },
    geschichte: {
      text: 'Cordis, Medizintechnik aus Florida: 1993 unter 1 % Marktanteil bei Angioplastie-Ballons. Rund 30 Interviews mit Kardiolog*innen, Pflegekräften und Verwaltung sammeln die Outcomes, eine Umfrage bewertet sie. Die größte Chance: „minimize the recurrence of a blockage“ – wichtig und kaum erfüllt. Cordis setzt sich 20 % Restenose als Ziel und entwickelt den Stent. 1994–95 kommen zwölf neue Katheter, der Marktanteil in der interventionellen Kardiologie in den USA steigt von unter 1 % auf fast 10 %, der Umsatz von 223 auf 443 Millionen Dollar; 1996 kauft Johnson & Johnson die Firma.',
      quelle: `${ULWICK}, S. 94–97`,
    },
    kern: [
      {
        text: 'Kasten „The Opportunity Algorithm“: Importance + (Importance − Satisfaction) = Opportunity, beide auf einer Skala von 1 bis 10 aus einer quantitativen Umfrage. Ulwick: Die Formel liefere „highly accurate“ Ergebnisse. Gegen reine Lückenanalyse: Outcomes 2 und 5, Lücke je 4,1, Werte 12,4 und 9,2.',
        quelle: `${ULWICK}, S. 96`,
      },
      {
        text: '„the amount in parentheses can never be less than zero“ – hohe Zufriedenheit mindert die Wichtigkeit nicht. Die Werte unterscheiden sich je Segment. Schlusssatz des Kastens: Wer so priorisiert, beseitige auch das Raten („the guesswork“).',
        quelle: `${ULWICK}, S. 96–97`,
      },
    ],
    ueberleitung: 'Dieselbe Rechnung für die drei Geschwister der Kaffeebar.',
  },

  'beispiel-ulwick': {
    live: [
      'Matrix zeigen: oben links ist wichtig und schlecht gelöst.',
      'Aufdecken: drei Rechnungen – 16, 12, 7.',
      'Fragen: Woher kommen diese Zahlen?',
      'Erwartet: geschätzt aus fünf Snapshots – keine Umfrage.',
      'Falle: jetzt über die Formel urteilen – das kommt nach der Übung.',
    ],
    kern: [
      {
        text: 'Outcome-Sätze der Kaffeebar: „Minimiere die Zeit, bis ich weiß, ob sich ein Kaffee bis zur Abfahrt ausgeht“ (W 9, Z 2), „Minimiere das Risiko, dass mir beim Anstehen die Zeit bis zur Abfahrt ausgeht“ (9, 6), „Minimiere die Zeit bis zu einem Kaffee, der mir schmeckt“ (6, 5). Die Abfahrt geht vor (I2-2, I3-4, I4-1), darum zweimal Wichtigkeit 9; vor der Zeitnot schützen sie sich heute selbst (I2-2, I3-4), darum Zufriedenheit 6; bei der Ziel-Chance lassen sie den Kaffee, sobald es voll ist (I5-2, I3-4) – ungelöst, darum 2.',
        quelle: 'ziel-chance.astro, Folie beispiel-ulwick (Handout); Form der Sätze: Ulwick, S. 95',
      },
      {
        text: 'Die Matrix ist die Kundenlinse von Torres (wichtig, schlecht gelöst zuerst) mit Ulwicks Zahlen – unsere Darstellung, um zu zeigen, dass beide dieselben zwei Fragen stellen.',
        quelle: `${TORRES}, S. 101; ${ULWICK}, S. 96; Darstellung: Kurs`,
      },
    ],
    ueberleitung: 'Bevor ihr selbst wählt: Wie endgültig ist diese Entscheidung?',
  },

  zweiwegtuer: {
    live: [
      'Zwei Türen erklären: Bezos’ Stufe 1 und Stufe 2.',
      'Fragen: Welche Tür ist eure Ziel-Chance?',
      '„Ihr verpflichtet euch nur, sie die nächsten Tage weiter zu erkunden.“',
      'Bullens erzählen: Wer umkehren kann, sieht die Schwächen der Wahl.',
      'Wenn hinten: ein Satz dazu auf der Folie „So geht ihr vor“.',
    ],
    verstaendnis: {
      frage: 'Warum sollt ihr die Wahl als umkehrbar sehen – auch wenn ihr sie nicht umkehren wollt?',
      antwort: 'Wer eine Entscheidung für umkehrbar hält, prüft sie danach kritischer: Er sieht eher die Schwächen der eigenen Wahl und die Stärken der Alternativen. Das schützt vor Bestätigungsfehlern (S. 103).',
    },
    kern: [
      {
        text: 'Bezos, Brief an die Aktionär*innen 2015: Stufe 1 schwer umkehrbar – langsam und vorsichtig; Stufe 2 leicht umkehrbar – schnell, ohne auf perfekte Daten zu warten. Torres’ Bild: Einweg- und Zweiwegtür. Man lernt mehr, wenn man durchgeht und schaut, als wenn man sich die andere Seite vorstellt.',
        quelle: `${TORRES}, S. 102–103`,
      },
      {
        text: 'Die Ziel-Chance ist eine Zweiwegtür: „You are not committing to addressing that opportunity. You are simply committing to exploring it further with your discovery work.“ Lottie Bullens und Kolleg*innen (Universität Amsterdam): Bei umkehrbaren Entscheidungen sehen Menschen danach eher die Schwächen ihrer Wahl und die Stärken der Alternativen; bei endgültigen nur das Gute an der eigenen.',
        quelle: `${TORRES}, S. 103, Fußnote 34`,
      },
      {
        text: 'Gegen das Aufschieben: zeitlich begrenzen – „Give yourself an hour or two or, at most, a day or two.“ Kommt jede Chance aus Interviews, gibt es keine falsche Wahl („there are no wrong decisions“).',
        quelle: `${TORRES}, S. 104`,
      },
    ],
    ueberleitung: 'Also: 30 Minuten, dann steht eure Ziel-Chance.',
  },

  vorgehen: {
    live: [
      'Timer 8 min: Momente durch vier Linsen, je ein Satz.',
      'Nach 8 min: Teilchancen des Asts bis zum Blatt, Timer 4 min.',
      'Nach 12 min: Outcome-Sätze, schätzen, rechnen, Timer 6 min.',
      'Nach 18 min: zu dritt, je 3 min, Linsen und Formel einig?',
      'Nach 27 min: Ziel-Chance im Baum markieren, Zeile ins Log.',
      'Falle: von der Lieblingsidee rückwärts begründen.',
      'Wenn hinten: Ulwick nur für die zwei stärksten Geschwister.',
    ],
    uebung: { dauer: '30 min (8 + 4 + 6 + 9 + 3)', form: 'allein, dann zu dritt reihum' },
    miro: {
      frame: 'T3 · 1 · Ziel-Chance',
      schritte: [
        'Jede*r arbeitet am eigenen Baum („Baum · Name“); T3 · 1 ist die Anleitung mit den vier Linsen.',
        'Pro Linse ein Satz als Zettel neben die verglichenen Geschwister, mit Zitat-ID bei Größe und Kundschaft.',
        'Die Ziel-Chance im Baum markieren (ein Blatt).',
        'Zu dritt: „Alle zu mir holen“ auf den Baum, der dran ist.',
      ],
    },
    ablauf: {
      schritte: [
        'Ast wählen, allein (8 min): die Momente gegeneinander, pro Linse ein Satz – wer liegt vorn und warum. Größe und Kundschaft mit Zitat-IDs.',
        'Bis zum Blatt (4 min): dasselbe mit den Teilchancen des gewählten Asts. Hängt nur eine Chance darunter, ist sie das Blatt.',
        'Ulwick (6 min): die verglichenen Geschwister als Outcome-Sätze mit Richtung und Maßeinheit, Wichtigkeit und Zufriedenheit 1–10 schätzen, rechnen.',
        'Zu dritt (9 min, je 3): Wahl in einem Satz, dann die Linse, die sie trägt. Die anderen fragen: Stimmen Linsen und Formel überein? Welche Linse fehlt?',
        'Festhalten (3 min): Ziel-Chance im Baum markieren, eine Zeile ins Entscheidungslog mit Beleg.',
      ],
      achten: [
        'Verglichen werden Geschwister – nie eine Chance allein mit „Sollen wir?“ (S. 99).',
        'Alle vier Linsen, je ein Satz; Größe und Kundschaft mit Zitat-ID.',
        'Die Zahlen sind Schätzungen. Wer lange an einer Zahl hängt: schätzen und weiter.',
        'Nur echte Belege aus der eigenen Mappe; Synthetisches trägt keine Linse.',
      ],
      fehler: [
        'Nur die Kundenlinse benutzen (S. 104).',
        'Eine Chance mit Teilchancen darunter als Ziel-Chance nehmen.',
        'Outcome-Satz mit Lösung darin („… per App …“).',
        'Die Rechnung entscheiden lassen, ohne die Linsen aufgeschrieben zu haben.',
      ],
    },
    kern: [
      {
        text: 'Drei Anti-Muster: aufschieben, bis mehr Daten da sind; eine Linse auf Kosten der anderen („Use them all.“); vom erwarteten Ergebnis rückwärts argumentieren.',
        quelle: `${TORRES}, S. 104`,
      },
    ],
    ueberleitung: 'Zwei Wege, eine Wahl: Was hat bei euch entschieden?',
  },

  aufloesung: {
    live: [
      'Reihum: Linsen und Formel – einig oder nicht?',
      'Fragen: Hätten die anderen zwei eure Chance gleich geschätzt?',
      'Aufdecken: Ulwicks Bedingung – Umfrage, nicht fünf Interviews.',
      '„Die Zahl ersetzt nicht das Gespräch. Sie kann es aber anstoßen.“',
      'Gemeinsam: Beide fragen nach Bedürfnissen, nicht nach Lösungen.',
    ],
    verstaendnis: {
      frage: 'Unter welcher Bedingung trägt Ulwicks Rechnung?',
      antwort: 'Wenn die Outcomes in rund 30 Interviews gesammelt und danach in einer quantitativen Umfrage bewertet wurden (S. 95–96). Mit fünf Interviews sind es eigene Schätzungen.',
      falsch: '„Wenn man genau genug schätzt“ – es fehlen die Daten, nicht die Sorgfalt.',
    },
    ablauf: {
      aufloesung: 'Mit fünf Interviews und eigenen Schätzungen fehlt Ulwicks Voraussetzung; genau davor warnt Torres. Beide stimmen im Ausgangspunkt überein: Kund*innen liefern Bedürfnisse, nicht Lösungen. Mit größerer Zielgruppe und Umfrage ist die Formel ein Werkzeug, das ihr kennt.',
    },
    kern: [
      {
        text: 'Ulwick: mit rund 30 Teilnehmenden über 96 % der Outcomes erfasst; bewertet wird danach in einer quantitativen Umfrage.',
        quelle: `${ULWICK}, S. 95–96`,
      },
      {
        text: 'Torres warnt vor dem Mathematisieren einer unscharfen Entscheidung; die Linsen sollen das Gespräch füttern.',
        quelle: `${TORRES}, S. 101–102`,
      },
      {
        text: 'Gemeinsamer Ausgangspunkt: Bedürfnis statt Lösung festhalten.',
        quelle: `${ULWICK}, S. 92; ${TORRES}, S. 69`,
      },
    ],
    ueberleitung: 'Eine letzte Frage an eure Wahl.',
  },

  uebertrag: {
    live: [
      'Frage vorlesen, zehn Sekunden still.',
      'Reihum: ein Satz, ehrlich.',
      '„Passt die Ziel-Chance genau zur Idee von Tag 1? Dann prüft die Linsen noch einmal.“',
      'Ausblick: Aus der Ziel-Chance wird jetzt eine Frage.',
    ],
    kern: [
      {
        text: 'Anti-Muster „Working backwards from your expected conclusion“: Die Linsen dienen dann nur dazu, ein feststehendes Ergebnis zu begründen. Torres: mit offenem Kopf hineingehen.',
        quelle: `${TORRES}, S. 104`,
      },
    ],
    ueberleitung: 'Weiter mit How Might We.',
  },
};
