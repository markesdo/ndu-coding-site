import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/interview (Tag 1, 14:00–16:15).
// Seitenzahlen: Mom Test = gedruckte Seite (PDF − 1, also PDF-Seite + 1); Torres und VPD wie im Kurs nach PDF-Seite
// (die Torres-PDF hat keine gedruckten Seitenzahlen). Kaffeebar-Zitate: IDs aus src/werkstatt/beispiele/interviews.json
// (ausgedachte Beispieldaten, gekennzeichnet).

export const NOTIZEN_INTERVIEW: Record<string, Notiz> = {
  'jtbd': {
    live: [
      'Brücke von der Annahmen-Map: Die riskanteste Annahme kennt ihr. Jetzt geht es darum, wie ihr sie bei echten Menschen prüft.',
      'Niemand will „einen Kaffee“. Die Pendlerin will wach und gut gelaunt in Wien ankommen, ohne den Zug zu riskieren.',
      'Konkurrenz ist alles, was denselben Job erledigt, auch der Automat oder Schlaf im Zug. Und „gar nichts tun“ ist immer auch eine Option.',
      'Satz laut durchgehen: Wenn … will ich … damit … Das „damit“ ist der eigentliche Job.',
      'Pointe für die nächste Folie: Jobs findet man nicht, indem man danach fragt.',
    ],
    ueberleitung: 'Wie findet ihr so einen Job heraus? Bevor ich es erkläre, schreibt ihr selbst drei Fragen.',
    kern: [
      {
        text: 'Jobs sind das, was Kund*innen in Arbeit oder Leben erledigen wollen: Aufgaben, Probleme, Bedürfnisse. Und zwar aus ihrer Sicht, nicht aus der des Unternehmens. Das Buch unterscheidet funktionale Jobs (eine Aufgabe erledigen), soziale Jobs (wie man vor anderen dasteht) und persönliche/emotionale Jobs (ein Gefühl, etwa Sicherheit). Dazu kommen unterstützende Jobs rund um den Kauf, etwa „in der Kassenschlange stehen“.',
        quelle: 'Osterwalder, Pigneur u. a., Value Proposition Design, S. 54–55 (PDF)',
      },
      {
        text: 'Jobs hängen vom Kontext ab. Das Beispiel im Buch passt genau zur Kaffeebar: Jemanden unterwegs anrufen ist im Zug etwas anderes als am Steuer. Bei der Pendlerin ist der Kontext „7:30, Zug in ein paar Minuten“ ein Teil des Jobs.',
        quelle: 'Osterwalder, Pigneur u. a., Value Proposition Design, S. 55 (PDF)',
      },
      {
        text: 'Woher die Idee kommt: Jobs to be Done wurde unabhängig von mehreren Leuten entwickelt (Anthony Ulwick, Rick Pedi und Bob Moesta, Denise Nitterhouse) und von Clay Christensen und Innosight sowie Ulwicks Strategyn bekannt gemacht.',
        quelle: 'Osterwalder, Pigneur u. a., Value Proposition Design, S. 55 (PDF)',
      },
      {
        text: 'Torres nennt dasselbe „Opportunities“: Bedürfnisse, Schmerzpunkte und Wünsche der Kund*innen. Interviews sind nicht dazu da, Kund*innen zu fragen, was ihr bauen sollt, sondern um solche Chancen zu finden. Fitzpatrick sagt es kurz: „They own the problem, you own the solution.“',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 59; Rob Fitzpatrick, The Mom Test, S. 23',
      },
    ],
    zusatz: [
      {
        titel: 'Der Milchshake der Pendler*innen (Christensen)',
        text: 'Eine Fast-Food-Kette wollte mehr Milchshakes verkaufen und ließ Zielkund*innen den idealen Shake beschreiben. Die Verkäufe änderten sich nicht. Dann verbrachte ein Forscher einen ganzen Tag im Restaurant und notierte, wer wann Shakes kauft und ob die Leute bleiben. Laut dem Artikel wurden 40 Prozent der Shakes frühmorgens von Pendler*innen zum Mitnehmen gekauft. Am nächsten Morgen fragte er sie nach dem Job: Der Shake machte die Fahrt zur Arbeit interessanter, hielt bis Mittag satt und ging mit einer freien Hand. Gewählt wurde er statt Bagel oder Donut, weil er sauberer und sättigender war. Das ist fast dieselbe Lage wie bei der Pendlerin an der Kaffeebar.',
        quelle: 'Carmen Nobel, „Clay Christensen’s Milkshake Marketing“, HBS Working Knowledge, 14.2.2011, https://www.library.hbs.edu/working-knowledge/clay-christensens-milkshake-marketing; ausführlich in Christensen, Hall, Dillon, Duncan, „Know Your Customers’ Jobs to Be Done“, HBR, Sept. 2016, https://hbr.org/2016/09/know-your-customers-jobs-to-be-done',
      },
      {
        titel: 'Woher die Form „Wenn – will ich – damit“ kommt',
        text: 'Die Satzform stammt nicht von Christensen. Sie ist die „Job Story“, die Alan Klement 2013 als Ersatz für die User Story („As a …, I want …, so that …“) beschrieben hat. Statt einer Rolle beginnt sie mit der Situation: „When [Kontext], I want to [Motivation], so that [Ergebnis]“ (so zitiert bei thoughtbot). Das Team von thoughtbot beschreibt, wie es seine Stories auf dieses Format umgestellt hat.',
        quelle: 'Alan Klement, „Replacing The User Story With The Job Story“ (2013), https://jtbd.info/replacing-the-user-story-with-the-job-story-af7cdee10c27; Kyle Fiedler, „Converting to Job Stories“, thoughtbot, 16.1.2015, https://thoughtbot.com/blog/converting-to-jobs-stories',
      },
    ],
    fragen: [
      {
        frage: 'Ist „einen Kaffee in der Hand haben“ nicht schon das Produkt?',
        antwort: 'Ja, das ist eine berechtigte Kritik am Satz auf der Folie. Der eigentliche Job steckt im „damit“: wach ankommen, die Fahrt nutzen. Prüft bei euren Sätzen, ob euer Produkt darin vorkommt. Wenn ja, schreibt ihn um.',
      },
      {
        frage: 'Was ist der Unterschied zwischen Job, Pain und Gain?',
        antwort: 'Der Job ist das, was jemand erledigen will. Pains sind das, was dabei stört oder Angst macht, Gains das, was er sich davon erhofft. Genauer kommt das im Kundenprofil (VPD, S. 54–58).',
      },
      {
        frage: 'Wie finde ich den Job, wenn die Leute ihn selbst nicht benennen können?',
        antwort: 'Gar nicht durch direktes Fragen. Lasst euch erzählen, was beim letzten Mal passiert ist, und schließt selbst auf den Job. Genau dafür ist der Mom Test da.',
      },
    ],
  },

  'mom-test': {
    live: [
      'Erst machen: drei Fragen an eure Zielgruppe, eine pro Sticky, allein.',
      'Du spielst die Zielgruppe: „Würdest du …?“ → begeistertes Ja; „Normalerweise …“ → allgemein; „letztes Mal“ → Geschichte.',
      'Dann Auflösung aufdecken; sie öffnet die ganze Gruppe „mom-test“.',
      'Kern: Wer nie über seine Idee redet, dem kann man nichts vorlügen.',
      'Block 14:00–14:30; ab 14:30 sind die Auflösungen ohnehin offen.',
    ],
    ueberleitung: 'Jetzt legt ihr eure drei Fragen auf zwei Achsen und seht, wo sie liegen.',
    uebung: { dauer: '5 min', form: 'allein, eine Frage pro Sticky; danach antwortest du als Person aus ihrer Zielgruppe' },
    miro: {
      frame: 'T1 · 4 · Interviewleitfaden',
      schritte: [
        '„Alle zu mir holen“ auf T1 · 4. Die Kaffeebar-Spalte hat drei Felder: „Meine drei Fragen“, „Umgeschrieben nach der Auflösung“ und „Gelernt im Live-Interview“. Jetzt bleiben alle drei leer, sonst verrät die Kaffeebar die Auflösung. Gefüllt wird sie erst auf der Folie „Eure Fragen umschreiben“.',
        'Jede*r schreibt in der eigenen Spalte „Produkt von: …“ ins Feld „Meine drei Fragen“: drei gelbe Stickies, eine Frage pro Sticky.',
        'Nach dem Timer „Alle zu mir holen“; Spalte für Spalte liest jede*r eine Frage vor, und du antwortest in der Rolle.',
      ],
    },
    kern: [
      {
        text: 'Die drei Regeln wörtlich: „1. Talk about their life instead of your idea“, „2. Ask about specifics in the past instead of generics or opinions about the future“, „3. Talk less and listen more“. Den Namen haben sie, weil die Fragen selbst die eigene Mutter nicht anlügen kann.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 13 (Wiederholung im Cheatsheet S. 115)',
      },
      {
        text: 'Warum es wirkt: „Mom was unable to lie to us because we never talked about our idea.“ Man findet heraus, ob Leute etwas wichtig finden, indem man es nie erwähnt. Irgendwann muss die Idee auf den Tisch, aber der häufige Fehler ist, sie zu früh zu erwähnen, nicht zu spät.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 13',
      },
      {
        text: '„Doing it wrong is worse than doing nothing at all.“ Wer weiß, dass er nichts weiß, ist vorsichtig. Wer sich eine Handvoll falscher Bestätigungen holt, ist überzeugt und investiert.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 10',
      },
      {
        text: 'Regel 3 als Faustregel: „The more you’re talking, the worse you’re doing.“ Wenn jemand anfängt, eure Idee zu deuten („Also so ähnlich wie …“), nicht korrigieren. Gerade dann zeigt er euch, wie er die Welt sieht.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 39–40',
      },
    ],
    geschichte: {
      text: 'Ein Sohn will eine Kochbuch-App fürs iPad bauen und fragt seine Mutter, ob sie so etwas kaufen würde. Er nennt den Preis, 40 Dollar, zählt Funktionen auf und hört nicht auf, bis sie sagt: „Das klingt toll.“ Er hält das für eine Bestätigung, kündigt, steckt sein Erspartes in die App, und niemand kauft sie, auch die Mutter nicht. Im zweiten Gespräch erwähnt er die App gar nicht. Er fragt, was sie zuletzt auf dem iPad gemacht hat (eine Reise geplant, über Google, nicht über eine App) und woher die Kochbücher im Regal kommen. Antwort: Geschenke, nie aufgeschlagen, „als ob ich in meinem Alter noch ein Lasagne-Rezept bräuchte“. Das letzte Kochbuch, das sie selbst gekauft hat, war ein veganes für den Vater. Ein einziges Gespräch liefert zwei mögliche Zielgruppen und das größte Risiko: Diese Kundschaft sucht nicht im App Store.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 9–13',
    },
    fragen: [
      {
        frage: 'Darf ich meine Idee nie erwähnen?',
        antwort: 'Doch, aber spät. Erst wenn ihr das Leben der Person verstanden habt und ein Commitment wollt. Rutscht ihr vorher in den Pitch, entschuldigt euch und fragt zurück: „Du hast gerade erzählt, dass …“ (Mom Test, S. 13, 39).',
      },
      {
        frage: 'Ist eine Frage nach der Zukunft immer verboten?',
        antwort: 'Nein. Fitzpatrick sagt, der Fehler liege darin, den Antworten Wert beizumessen, nicht darin, die Fragen zu stellen. Eine „Machst du jemals …?“-Frage kann der Einstieg sein, dann folgt sofort „Wann war das zuletzt?“ (S. 29–30).',
      },
    ],
    ablauf: {
      schritte: [
        'Aufgabe zeigen, Timer 5 min starten. Nichts zur Methode sagen.',
        'Jede*r liest eine Frage vor, du antwortest in der Rolle. Hypothetisch heißt höflich Ja, allgemein heißt allgemein, „letztes Mal“ heißt konkrete Geschichte.',
        'Fragen: Welche Antwort hat euch etwas Neues verraten? Meist ist es die einzige Frage nach einem echten Ereignis.',
        'Auflösung aufdecken, die drei Regeln mit dem Kochbuch-Beispiel verbinden.',
      ],
      achten: [
        'Fragen, die eure Lösung schon enthalten („Würdest du per App vorbestellen?“), sind die besten Lehrbeispiele. Merk sie dir für die Matrix.',
        'Bleib in der Rolle konsequent. Die Pointe funktioniert nur, wenn „Würdest du …?“ wirklich ein leeres Ja bekommt.',
      ],
      fehler: [
        'Fragen nach Meinung („Findest du …?“) oder Zahlungsbereitschaft („Wie viel würdest du zahlen?“).',
        'Ja/Nein-Fragen, die keine Geschichte auslösen.',
        'Die Idee wird in der Frage erklärt, bevor überhaupt gefragt wird.',
      ],
      aufloesung: 'Auf „Würdest du …?“ sagen alle Ja, selbst eure Mutter. 1. Redet über ihr Leben, nicht über eure Idee. 2. Fragt nach dem letzten konkreten Mal. 3. Redet weniger, hört mehr. Nach Rob Fitzpatrick, „The Mom Test“ (2013).',
    },
  },

  'fragen-matrix': {
    live: [
      'Zwei Achsen, eure drei Stickys: Thema (eure Idee oder ihr Leben) und Zeit (Zukunft oder Vergangenheit).',
      'Rechts oben fragen. Links unten gibt es höfliches Ja.',
      'Jede*r legt die eigenen Fragen hin, ohne Diskussion. Danach schaut ihr gemeinsam auf den Quadranten links unten.',
      'Die leeren Felder sind nicht automatisch schlecht: „Hast du schon mal so eine App ausprobiert?“ fragt nach der Vergangenheit und ist laut Fitzpatrick ein guter Anker.',
    ],
    ueberleitung: 'Was links unten liegt, schreibt ihr jetzt um, und zwar nach rechts oben.',
    uebung: { form: 'allein die eigenen drei Fragen einordnen, dann kurz alle zusammen' },
    miro: {
      frame: 'T1 · 4 · Interviewleitfaden',
      schritte: [
        'Die Matrix steht nur auf dem Beamer, nicht auf dem Board. Die Stickies bleiben im Feld „Meine drei Fragen“.',
        'Jede*r ordnet die eigenen drei Stickies laut ein: Thema (eure Idee oder ihr Leben), Zeit (Zukunft oder Vergangenheit).',
        'Für die Frage von links unten, die ihr gemeinsam anseht: auf das Sticky zoomen und alle mit „Alle zu mir holen“ dorthin holen.',
      ],
    },
    kern: [
      {
        text: 'Faustregeln aus dem Fragen-Spiel: „Opinions are worthless.“ und „Anything involving the future is an over-optimistic lie.“ Fragen wie „Glaubst du, das ist eine gute Idee?“ oder „Würdest du ein Produkt kaufen, das X kann?“ liefern fast immer Ja und sind damit wertlos.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 15–16',
      },
      {
        text: 'Die Fragen rechts oben im Buch: „Talk me through the last time that happened.“, „What else have you tried?“, „How are you dealing with it now?“. Wer euch durch das letzte Mal führt, beantwortet viele Fragen auf einmal: Tagesablauf, Werkzeuge, mit wem man redet, welche Zwänge es gibt.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 15, 18–20',
      },
      {
        text: '„What are the implications of that?“ trennt Probleme, für die jemand zahlen würde, von Problemen, die nur ein bisschen nerven. Faustregel: „Some problems don’t actually matter.“',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 17–18',
      },
      {
        text: 'Die Matrix ist eine eigene Darstellung des Kurses nach den Regeln 1 und 2. Im Buch gibt es keine Abbildung dazu.',
        quelle: 'Kursergänzung nach Rob Fitzpatrick, The Mom Test, S. 13',
      },
    ],
    geschichte: {
      text: 'Fitzpatrick prüft eine Idee bei einem möglichen Kunden. Der sagt begeistert: „Das passiert ständig. Für eine Lösung würde ich sofort zahlen.“ Ein Zukunftsversprechen, also fragt Fitzpatrick: „Wann ist das zuletzt passiert?“ Ziemlich kürzlich, gutes Zeichen. „Wie hast du versucht, es zu lösen?“ Leerer Blick. „Hast du mal nach anderen Lösungen gegoogelt?“ Etwas ertappt: „Nein, ich bin das halt gewohnt.“ Abstrakt würde er „definitiv“ zahlen. Konkret hat er nicht einmal gesucht, obwohl es Lösungen gibt. Die Faustregel dazu: Wer noch nicht nach einer Lösung gesucht hat, wird auch eure nicht suchen und nicht kaufen.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 19',
    },
    fragen: [
      {
        frage: 'Wohin gehört „Was nervt dich an der Schlange?“',
        antwort: 'Ihr Leben, aber ohne Zeitpunkt, also Mitte bis links. Außerdem unterstellt die Frage schon, dass es nervt. Besser: „Was hast du gemacht, als die Schlange das letzte Mal zu lang war?“',
      },
      {
        frage: 'Und Fragen nach einer bestehenden Lösung, etwa „Hast du die App vom Campus-Café ausprobiert?“',
        antwort: 'Das ist Vergangenheit und konkret. Solange ihr nicht eure eigene Idee vorstellt, ist das ein guter Anker (Mom Test, S. 31–32).',
      },
    ],
    ablauf: {
      schritte: [
        'Matrix aufdecken (ist mit der Mom-Test-Auflösung schon offen).',
        'Jede*r ordnet die eigenen drei Stickys ein.',
        'Eine Frage von links unten gemeinsam ansehen: Was würde die Person antworten, und was wüsstet ihr danach?',
      ],
      achten: [
        'Bei 3 Personen gibt es 9 Fragen. Jede einzeln zu diskutieren dauert zu lang, nimm die zwei lehrreichsten.',
      ],
      fehler: [
        '„Wie oft …?“ gilt als Vergangenheit, ist aber eine Verallgemeinerung. Menschen schätzen Häufigkeiten schlecht (Torres, S. 61).',
      ],
      aufloesung: 'Rechts oben liegen Fragen nach dem, was jemand zuletzt getan hat (Regeln 1 und 2). Links unten bekommt ihr Höflichkeit statt Tatsachen. Beispielpunkte: „Würdest du eine App zum Vorbestellen nutzen?“ (links unten), „Erzähl mir vom letzten Morgen am Bahnhof.“ (rechts oben).',
    },
  },

  'statt-besser': {
    live: [
      'Vier Paare schrittweise: Was antwortet die Pendlerin links, was rechts?',
      'Zukunft → letztes Mal, Zahlungsbereitschaft → echte Ausgaben, Meinung → Handlung.',
      'Warnsignale: Kompliment, Allgemeinplatz, Zukunft → „Wann war das zuletzt?“',
      'Dann 5 min: eigene drei Fragen umschreiben.',
    ],
    ueberleitung: 'Und wenn die Antworten kommen: Welche davon zählt überhaupt?',
    uebung: { dauer: '5 min', form: 'allein, die eigenen drei Fragen umschreiben' },
    miro: {
      frame: 'T1 · 4 · Interviewleitfaden',
      schritte: [
        'Erst jetzt, nach der Auflösung, füllst du die Kaffeebar-Spalte live: „Statt“-Fragen ins Feld „Meine drei Fragen“, „Besser“-Fragen in derselben Reihenfolge ins Feld „Umgeschrieben nach der Auflösung“ (Paare unten).',
        'Das dritte Feld „Gelernt im Live-Interview“ bleibt leer, bis die Live-Interviews gelaufen sind.',
        'Jede*r kopiert die eigenen Stickies (Cmd+D bzw. Strg+D) ins Feld „Umgeschrieben nach der Auflösung“ und schreibt sie dort um; das Original bleibt stehen.',
        'Nach dem Timer „Alle zu mir holen“ und zwei, drei umgeschriebene Stickies vorlesen lassen.',
      ],
      vorschlaege: [
        'Würdest du Kaffee vorbestellen, wenn es eine App gäbe? → Erzähl mir vom letzten Morgen, an dem du am Bahnhof Kaffee wolltest.',
        'Wie viel würdest du dafür zahlen? → Was hast du diese Woche für Kaffee unterwegs ausgegeben?',
        'Findest du die Schlange nervig? → Was hast du gemacht, als die Schlange zu lang war?',
        'Wäre es nicht praktisch, wenn …? → Hast du schon mal etwas ausprobiert, um das zu umgehen? Was war das?',
      ],
    },
    kern: [
      {
        text: 'Drei Arten schlechter Daten: Komplimente, „Fluff“ (Verallgemeinerungen, Hypothetisches, Zukunft) und Ideen. Und drei Gegenmittel: Komplimente ablenken, Fluff verankern, unter Ideen graben.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 24',
      },
      {
        text: 'Fluff gibt es in drei Formen: Verallgemeinerungen („I usually“, „I always“, „I never“), Zukunftsversprechen („I would“, „I will“) und hypothetische Vielleichts („I might“, „I could“). Der gefährlichste Satz: „I would definitely buy that.“ Darauf ist das erste Startup, bei dem er arbeitete, hereingefallen; die ganze Geschichte steht bei der nächsten Folie „Welche Antwort zählt?“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 28–29',
      },
      {
        text: 'Komplimente: „Compliments are the fool’s gold of customer learning“. Warnsignale nach dem Gespräch sind Sätze wie „Das Treffen lief richtig gut“ oder „Alle, mit denen ich geredet habe, lieben die Idee“. Dann nachfragen: Warum mochte die Person es? Was hat sie schon versucht?',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 28',
      },
      {
        text: 'Zahlungsbereitschaft: Statt „Wie viel würdest du zahlen?“ fragt man, was das Problem heute kostet und was die Person heute zahlt. Eine Zahl in der Frage lässt die Antwort nur exakter wirken.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 16–17, 19–20',
      },
      {
        text: 'Bei Verallgemeinerungen beschreiben sich Menschen so, wie sie gern wären, nicht so, wie sie sind. Erst das konkrete Beispiel bringt die Ausnahmen ans Licht (das Inbox-Zero-Beispiel: alles im Griff, außer als das Hotel-WLAN ausfiel und zehn Tage Aufräumen folgten).',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 30–31',
      },
    ],
    geschichte: {
      text: 'Ganz nah an der Kaffeebar, Fitzpatricks Beispiel: Stell dir vor, du baust eine Treue-App, mit der Läden ihrer Stammkundschaft Rabatte geben, und vor dir in der Schlange schimpft einer: „Welcher Idiot hatte die Idee, dass ich tausend Café-Stempelkarten mit mir herumtragen muss?“ Die schlechte Reaktion ist der Pitch: „Ich baue genau dafür eine App, würdest du die nutzen?“ Antwort: „Klar, wurde ja Zeit!“, also wertloser Fluff. Die gute Reaktion verankert in der Vergangenheit: „Hast du schon mal eine dieser Treue-Apps ausprobiert?“ – „Gibt es die?“ – „Ja, im Campus-Café hängt ein Schild.“ – „Ach ja, ich hab es halt immer eilig.“ Und dann: „Warum lädst du sie nicht jetzt runter?“ – „Mach ich nächstes Mal.“ Kein echtes Problem: ein Nörgler, kein Kunde. Andere Antworten wären wertvoll gewesen, etwa „Für jede Kette eine eigene App, das will ich nicht“ oder „Die App ist so umständlich, dass das Bezahlen schneller geht“.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 31–33',
    },
    fragen: [
      {
        frage: 'Ist „Was hast du diese Woche für Kaffee ausgegeben?“ nicht zu persönlich?',
        antwort: 'Meist nicht, solange es locker im Gespräch kommt. Es liefert einen echten Preisanker statt einer ausgedachten Zahl. Fitzpatrick: Kaum jemand sagt euch genau, was er zahlen würde, aber viele zeigen euch, was es ihnen wert ist (S. 20).',
      },
      {
        frage: 'Was mache ich, wenn jemand „Coole Idee!“ sagt?',
        antwort: 'Nicht freuen, sondern ablenken: sich kurz für den Pitch entschuldigen und fragen, wie die Person das heute löst (Mom Test, S. 26–27).',
      },
    ],
    ablauf: {
      schritte: [
        'Die vier Zeilen schrittweise aufdecken und zu jeder kurz die Antwort der Pendlerin durchspielen.',
        'Die drei Warnsignale aus dem Handout nennen.',
        'Timer 5 min: Jede*r schreibt die Fragen um, die du wieder mit „Ja, total!“ beantworten würdest.',
        'Zwei, drei umgeschriebene Fragen vorlesen lassen und kurz in der Rolle antworten, ob jetzt eine Geschichte kommt.',
      ],
      achten: [
        'Umgeschriebene Fragen, die die Lösung noch enthalten („Erzähl vom letzten Mal, als du per App bestellt hast“), sind nur scheinbar besser.',
      ],
      fehler: [
        'Die Zukunft wird nur ins Präsens gesetzt („Nutzt du Vorbestell-Apps?“). Das bleibt eine Verallgemeinerung.',
        'Suggestivfragen, die den Schmerz schon unterstellen („Wie sehr nervt dich …?“).',
      ],
      aufloesung: 'Die Tabelle: Vorbestellen-App → letzter Morgen am Bahnhof; Zahlungsbereitschaft → diese Woche ausgegeben; Schlange nervig → was du gemacht hast, als sie zu lang war; „Wäre es nicht praktisch …“ → schon mal etwas ausprobiert? Vorsicht bei Komplimenten, Allgemeinplätzen, Zukunftsversprechen, jeweils zurück zu „Wann war das zuletzt?“.',
    },
  },

  'antworten': {
    live: [
      'Erst sortieren lassen (2 min), dann die Skala Punkt für Punkt aufdecken.',
      'Das Kriterium ist nicht, wie begeistert jemand klingt, sondern was die Antwort kostet.',
      'Kompliment und Zukunft kosten nichts. Erzählte Vergangenheit ist verlässlicher. Commitment heißt, jemand gibt Zeit, Geld oder Ruf her.',
      'Commitment bekommt ihr nicht im Interview, sondern in Experimenten (Tag 3).',
    ],
    ueberleitung: 'Warum ist „Würde ich sicher nutzen“ so wertlos, selbst wenn die Person es ehrlich meint?',
    uebung: { dauer: '2 min', form: 'alle zusammen die vier Antworten sortieren' },
    kern: [
      {
        text: 'Commitment heißt, jemand zeigt, dass es ihm ernst ist, indem er etwas hergibt, das ihm wichtig ist: Zeit, Ruf oder Geld. „A compliment costs them nothing, so it’s worth nothing and carries no data.“ Die Hauptwährungen sind Zeit, Reputationsrisiko und Geld.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 64–65',
      },
      {
        text: 'Beispiele je Währung. Zeit: ein klares nächstes Treffen, Feedback zu Wireframes, eine Testphase. Ruf: Vorstellung bei Kolleg*innen oder bei Entscheider*innen, ein öffentliches Testimonial. Geld: Absichtserklärung, Vorbestellung, Anzahlung. Faustregel: „The more they’re giving up, the more seriously you can take their kind words.“',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 65–66',
      },
      {
        text: '„There’s more reliable information in a ‚meh‘ than a ‚Wow!‘“ Eine lauwarme Reaktion ist ehrlicher als Begeisterung, und auf Lauwarmem baut man kein Geschäft.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 44',
      },
      {
        text: 'Christian Rohrer (NN/g) ordnet Forschungsmethoden unter anderem nach „was Menschen sagen“ und „was sie tun“ und schreibt, die beiden unterschieden sich sehr oft. Interviews sind Selbstauskunft, also sagen. Darum steht erzählte Vergangenheit auf der Skala zwar weit rechts, ist aber noch kein beobachtetes Tun, nur verlässlicher als Meinung.',
        quelle: 'Christian Rohrer, „When to Use Which User-Experience Research Methods“, Nielsen Norman Group, https://www.nngroup.com/articles/which-ux-research-methods/',
      },
    ],
    geschichte: {
      text: 'Fitzpatrick erzählt, wie das erste Startup, bei dem er arbeitete, in die Falle „I would definitely buy that“ getappt ist. Das Team hielt Zukunftsversprechen und begeisterte Komplimente für Commitment und glaubte, es habe sich bestätigt. Daraufhin investierte es viel zu viel und verlor rund 10 Millionen Dollar.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 29',
    },
    fragen: [
      {
        frage: 'Ist erzählte Vergangenheit schon „tun“?',
        antwort: 'Nicht ganz. Es bleibt Selbstauskunft, ist aber viel verlässlicher als Meinungen, weil eine konkrete Erinnerung weniger Raum für das ideale Ich lässt (Torres, S. 64). Echtes Tun seht ihr erst, wenn jemand etwas hergibt.',
      },
      {
        frage: 'Kann ich im Interview schon nach Commitment fragen?',
        antwort: 'Kleine Formen ja, etwa „Wen sollte ich noch fragen?“, das ist eine Vorstellung, also Ruf (Mom Test, S. 22, 66). Vorbestellung und Geld kommen in den Experimenten an Tag 3.',
      },
      {
        frage: 'Wie ist das in den Kaffeebar-Beispielinterviews?',
        antwort: 'In den ausgedachten Beispieldaten ist I3-3 erzählt („Einmal stand ich da, der Zug war schon eingefahren …“), I2-2 dagegen gesagt, eine Regel („Wenn ich auf die Uhr schauen muss, geh ich.“). Genau diese Unterscheidung prüft die Synthese an Tag 2.',
      },
    ],
    ablauf: {
      schritte: [
        'Die vier Antworten vorlesen, Timer 2 min, gemeinsam sortieren.',
        'Skala aufdecken, die Punkte nacheinander zeigen.',
        'Bei „Letzte Woche zweimal den Zug verpasst“ kurz fragen: Was würdet ihr jetzt nachfragen?',
      ],
      achten: [
        'Oft landet „Würde ich sicher nutzen“ vor „Coole Idee“ oder umgekehrt. Beides ist links und beides kostet nichts. Nicht lange streiten.',
      ],
      fehler: [
        'Die Begeisterung im Ton wird mit Stärke verwechselt.',
        'Die erzählte Vergangenheit wird für den Beweis gehalten. Sie zeigt ein Problem, aber noch keine Bereitschaft, für eine Lösung etwas herzugeben.',
      ],
      aufloesung: 'Von sagen nach tun: Kompliment („Coole Idee!“) → Zukunft („Würde ich sicher nutzen.“) → Vergangenheit („Letzte Woche zweimal den Zug verpasst.“) → Commitment (bestellt vor und zahlt im Voraus). Komplimente und Zukunftsversprechen kosten nichts und beweisen nichts. Commitment seht ihr erst in Experimenten.',
    },
  },

  'warum-geschichten': {
    live: [
      'Live machen, bevor du aufdeckst: Eine Person fragen „Worauf achtest du beim Jeanskauf?“, dann „Erzähl vom letzten Jeanskauf.“ Torres macht das immer wieder in Workshops.',
      'Niemand lügt. Wir verstehen unser eigenes Verhalten schlecht und erzählen von unserem idealen Ich.',
      'Das Gehirn erfindet stimmige Gründe (Gazzaniga). Selbstsicherheit beweist nichts (Kahneman).',
      'Torres’ eigener Flop: Alle Recruiter*innen wollten passive Kandidat*innen, und das Produkt dafür floppte.',
    ],
    ueberleitung: 'Wenn direkte Fragen täuschen: Wie fragt ihr dann nach dem, was ihr wissen wollt?',
    kern: [
      {
        text: 'Das Jeans-Beispiel: Auf die Frage nach ihren Kriterien sagt eine Frau: „Fit is my number-one factor.“ Gefragt nach dem letzten Kauf: auf Amazon. Woher sie wusste, dass die Jeans passt? „I didn’t, but they were a brand I liked, and they were on sale.“ Die erste Antwort zeigt, wie sie glaubt zu kaufen, die zweite, wie sie gekauft hat.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 60–61',
      },
      {
        text: 'Torres stellt diese zwei Fragen in Workshops immer wieder, und es gibt immer eine Lücke. „We just aren’t very good at understanding our own behavior.“ Direkte Fragen verlangen, Fakten ohne Kontext abzurufen, und dabei wirken Denkfehler: Wir schätzen Häufigkeiten schlecht, verallgemeinern, antworten nach unserem Selbstbild. Beispiele: Wer Sport treibt, überschätzt, wie oft; die meisten halten sich für überdurchschnittliche Autofahrer*innen.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 61',
      },
      {
        text: 'Gazzaniga ließ Split-Brain-Patient*innen eine Karte wählen, deren Grund nur die rechte Hirnhälfte kannte, und fragte nach dem Warum. Statt ratlos zu sein, erfand jede Person eine Begründung. Er nannte das den „left brain interpreter“, und spätere Studien zeigen: Das tun wir alle. Kahneman: „A remarkable aspect of your mental life is that you are rarely stumped.“ Und: „Confidence is a feeling, which reflects the coherence of the information and the cognitive ease of processing it.“',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 61–62',
      },
      {
        text: 'Fitzpatrick sagt dasselbe von der anderen Seite: „People rarely lie about specific stuff that’s already happened, regardless of your ego.“',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 38',
      },
    ],
    geschichte: {
      text: '2007 arbeitete Teresa Torres an einem Produkt, mit dem Recruiter*innen in Unternehmen Kandidat*innen finden. Damals war die ganze Branche überzeugt, passive Kandidat*innen seien besser, also Menschen mit Job, die nur offen für Neues sind. Alle Vordenker*innen sagten das, und jede Kundin, mit der Torres sprach, sagte: Wir wollen passive Kandidat*innen. Das Team baute genau dafür eine Lösung, und sie floppte. Wenn eine Stelle zu besetzen war, griffen die Recruiter*innen doch wieder zu aktiv Suchenden. Gemessen werden sie nämlich daran, wie schnell sie Stellen besetzen, und das geht mit aktiv Suchenden am schnellsten. Torres vergleicht das mit einer Salatbar gegenüber von McDonald’s, weil alle sagen, sie wollten sich gesünder ernähren. Ihr Fazit: Es fehlte nicht an Forschung, sie hatte die falschen Fragen gestellt.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 63',
    },
    fragen: [
      {
        frage: 'Heißt das, die Leute lügen uns an?',
        antwort: 'Nein. Torres betont, das ist eine Eigenschaft unseres Gehirns, keine Täuschung, und oft passiert es gerade, weil die Befragten hilfsbereit sein wollen (S. 61).',
      },
      {
        frage: 'Woher weiß ich, ob eine Geschichte stimmt?',
        antwort: 'Sicher wisst ihr es nie. Aber eine konkrete Erinnerung an ein bestimmtes Mal ist verlässlicher als jede Verallgemeinerung (S. 64). Fünf Geschichten, die zueinander passen, sind mehr wert als eine überzeugte Aussage.',
      },
    ],
  },

  'forschungsfrage': {
    live: [
      'Zwei Spalten: was ihr lernen wollt und was ihr im Gespräch fragt. Die linke Spalte sagt ihr nie laut.',
      'Die Forschungsfrage kommt aus der riskantesten Annahme. Bei der Kaffeebar ist das A1: Entscheiden Pendler*innen schon vor der Ankunft?',
      'Eng oder weit: Eng verbessert ein bestehendes Angebot, weit zeigt, womit es eigentlich konkurriert.',
      'Ein, zwei Geschichten-Fragen ersetzen einen langen Fragebogen.',
    ],
    ueberleitung: 'Auf „Erzähl mir vom letzten Morgen“ kommt meist nur ein Satz. Wie wird daraus eine Geschichte?',
    kern: [
      {
        text: 'Der Schlüssel zum guten Interview: trennen, was ihr lernen wollt (Forschungsfragen), von dem, was ihr fragt (Interviewfragen). Statt mehrseitiger Gesprächsleitfäden: davon ausgehen, dass ihr regelmäßig mit Kund*innen redet, und euch auf das konzentrieren, was ihr gerade jetzt lernen müsst.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 64',
      },
      {
        text: 'Torres’ wichtigste Forschungsfrage für jedes Interview: „What needs, pain points, and desires matter most to this customer?“ Erst wenn das geklärt ist, geht ihr in eure eigenen Themen. Was der Person wichtig ist, geht vor dem, was ihr lernen wollt.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 64',
      },
      {
        text: 'Übersetzung in Geschichten-Fragen: statt „Nach welchen Kriterien kaufst du Jeans?“ lieber „Tell me about the last time you purchased a pair of jeans.“ Begründung: „Memories about recent instances are more reliable than our generalizations about our own behavior …“',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 64–65',
      },
      {
        text: 'Fitzpatrick: Vor jedem Gespräch die drei wichtigsten Dinge festlegen, die ihr von diesem Typ Person lernen wollt („You always need a list of your 3 big questions.“). Nicht lange über die „richtigen“ grübeln, sie ändern sich ohnehin. Nehmt die, die gerade am unklarsten oder wichtigsten sind.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 55',
      },
    ],
    geschichte: {
      text: 'Torres’ Beispiel für eng und weit: Ein Streaming-Anbieter will, dass Leute mehr schauen. „Erzähl vom letzten Mal, als du unseren Dienst genutzt hast“ zeigt Probleme mit dem eigenen Produkt. „Erzähl vom letzten Mal, als du irgendeinen Streamingdienst genutzt hast“ bringt auch die Konkurrenz ins Gespräch. Und „Tell me about the last time you were entertained“ bringt Kino, Konzerte und Abende mit Freund*innen hervor, also das, womit die ganze Kategorie konkurriert. Bei der Kaffeebar entspricht das den drei Zeilen der Tabelle.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 65',
    },
    fragen: [
      {
        frage: 'Wie viele Fragen braucht der Leitfaden dann überhaupt?',
        antwort: 'Im Kern ein, zwei Geschichten-Fragen plus vorbereitete Nachfragen. Die 5–7 Fragen im Vorgehen sind ein Gerüst für den Anfang, kein Fragebogen, den ihr abarbeitet.',
      },
      {
        frage: 'Darf ich die Forschungsfrage nicht einfach direkt stellen?',
        antwort: 'Dann bekommt ihr das ideale Ich (Jeans-Beispiel). Die Antwort auf die Forschungsfrage leitet ihr aus den Geschichten ab.',
      },
    ],
  },

  'ausgraben': {
    live: [
      'Die erste Antwort ist ein Satz: „Gestern nach dem Essen hab ich eine Serie geschaut.“ Das ist noch keine Geschichte.',
      'Gespräche laufen normalerweise 50/50. Das müsst ihr am Anfang ausdrücklich aufheben.',
      'Bausteine jeder Geschichte: Hauptfigur, Ablauf, Ort, Hindernisse, Helfer. Danach fragt ihr.',
      '„Normalerweise …“ freundlich zurückholen: „Und an diesem Morgen?“',
      'Nicht jede Person hat die Geschichte, die ihr sucht. Nehmt, was sie erzählen will.',
    ],
    ueberleitung: 'Jetzt habt ihr alle Werkzeuge. So läuft die nächste Stunde ab.',
    kern: [
      {
        text: 'Auf eine kurze Frage kommt eine kurze Antwort, weil wir im Gespräch ein Hin und Her zu gleichen Teilen erwarten („50/50 back-and-forth“). Am wirksamsten: vorher ankündigen, dass ihr die ganze Geschichte mit allen Details hören wollt und am Ende nachfragt.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 65–66',
      },
      {
        text: 'Zeitliche Anstöße funktionieren am besten: „Start at the beginning. What happened first?“, „Where were you? Set the scene for me.“, „What happened next?“, „What happened before that?“ Dazu die Rollen in der Geschichte: „Who was with you?“, „What challenges did you encounter?“, „Did anyone help you?“',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 66',
      },
      {
        text: 'Die Person springt zwischen Geschichte und Verallgemeinerung hin und her („I usually …“). Sanft zurückführen: „In this specific example, did you face that challenge?“ Die Verallgemeinerung fühlt sich an wie eine Abkürzung zum echten Bedürfnis. Genau dann nicht nachgeben.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 66',
      },
      {
        text: 'Torres’ „golden rule of interviewing“: Die Person über das reden lassen, was ihr am wichtigsten ist. Steuern könnt ihr auf zwei Arten: welche Art Geschichte ihr erbittet und wo ihr mit Nachfragen tiefer grabt. Manche kooperieren nicht (keine passende Geschichte, Ein-Satz-Antworten, Feature-Ideen, Beschwerden). Dann mitnehmen, was geht, und nichts erzwingen.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 67',
      },
      {
        text: 'Bei starken Gefühlen und Feature-Wünschen graben: „Erzähl mehr“, „Was würde dir das ermöglichen?“, „Wie kommst du heute ohne aus?“ Faustregel: „Ideas and feature requests should be understood, but not obeyed.“',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 36–37',
      },
    ],
    geschichte: {
      text: 'Fitzpatrick sitzt in einem Café neben einem Gründer, der gerade jemanden interviewt. Der Gründer nennt ein Problem, und sein Gegenüber sagt: „Das ist so ziemlich der schlimmste Teil meines Tages.“ Der Gründer notiert etwas und geht zur nächsten Frage über. Fitzpatrick kann es kaum fassen: Es ist der schlimmste Teil seines Tages, und du willst nicht wissen, warum? Seine Lehre: Jedes starke Gefühl ist es wert, nachzugraben, ob Ärger, Peinlichkeit oder Freude.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 36',
    },
    fragen: [
      {
        frage: 'Ist ständiges Nachfragen nicht unhöflich?',
        antwort: 'Meist empfinden es die Leute als Interesse. Fitzpatrick: Ihr seid vielleicht seit Langem die ersten, die sich wirklich für die kleinen Ärgernisse ihres Tages interessieren (Mom Test, S. 59). Wichtig ist, dass ihr nach der Person fragt und nicht eure Idee verteidigt.',
      },
      {
        frage: 'Was, wenn die Person keine passende Geschichte hat?',
        antwort: 'Dann ist das auch ein Ergebnis, vielleicht kommt die Situation seltener vor als gedacht. Nicht erzwingen, mitnehmen, was sie erzählt (Torres, S. 67).',
      },
    ],
  },

  'vorgehen': {
    live: [
      'Vier Schritte, 90 min (14:45–16:15): schreiben, dann zweimal proben.',
      'Leitfaden zur Forschungsfrage; Herz: ein, zwei Fragen nach dem letzten Mal.',
      'Speichern in der Werkstatt („Bearbeiten“), Miro T1 · 4 zum Denken.',
      'Live-Interview: du spielst eine schwierige Person, zwei beobachten.',
    ],
    ueberleitung: 'Zum Schluss die Frage, mit der ihr morgen rausgeht: Was ist bei euch „der letzte Morgen am Bahnhof“?',
    uebung: { dauer: '90 min (20 + 10 + 15 + 3 × 15)', form: 'Leitfaden, Prüfliste und Claude-Probe allein; Live-Interview reihum mit dir, die anderen beobachten' },
    miro: {
      frame: 'T1 · 4 · Interviewleitfaden',
      schritte: [
        'Jede*r füllt in der eigenen Spalte das oberste Feld „Forschungsfrage (aus eurer riskantesten Annahme)“ mit einem Sticky. Vorbild links: „Wann und wo entscheiden Pendler*innen, ob sie Kaffee holen?“',
        'Der Leitfaden selbst entsteht in der Werkstatt („Bearbeiten“ im Handout). Das Board ist nur die Denkfläche; die Stickies aus „Umgeschrieben nach der Auflösung“ sind das Rohmaterial.',
        'Live-Interviews reihum: Nach jeder Runde schreibt die interviewende Person ins eigene Feld „Gelernt im Live-Interview“, was sie aus Interview und Feedback mitnimmt. Die Beobachtenden sagen es mündlich oder kommentieren, statt in der fremden Spalte zu schreiben.',
        'Zum Schluss das Gelernte vom Board in den Leitfaden in der Werkstatt übernehmen.',
      ],
    },
    kern: [
      {
        text: 'Vorbereitung nach Fitzpatrick: die aktuelle Liste der drei großen Fragen kennen und die unangenehmen nicht auslassen. Wenn ihr schon weiter seid, auch wissen, welches Commitment ihr am Ende wollt. Was sich am Schreibtisch recherchieren lässt, vorher recherchieren. Die Gespräche sind für das da, was das Internet nicht weiß.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 100',
      },
      {
        text: 'Gute Fragen für den Leitfaden aus dem Fragen-Spiel: „Talk me through the last time that happened.“, „What else have you tried?“, „How are you dealing with it now?“, „What are the implications of that?“, und zum Schluss „Who else should I talk to?“ (jedes Gespräch so beenden).',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 15–22',
      },
      {
        text: 'Zu förmlich ist ein eigener Fehler. Symptome laut Buch: „So, first off, thanks for agreeing to this interview …“ und Skalenfragen („On a scale of 1 to 5 …“). Faustregel: „If it feels like they’re doing you a favour by talking to you, it’s probably too formal.“ Die Einwilligung zur Aufnahme braucht ihr trotzdem. Also kurz und locker einholen, nicht als Ritual.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 58–59',
      },
      {
        text: 'Für deine Rolle als schwierige Person: Torres beschreibt, wie unkooperative Teilnehmende aussehen. Sie haben keine passende Geschichte, wollen über einen anderen Teil der Geschichte reden, antworten in einem Satz, bringen Feature-Ideen oder beschweren sich über das Produkt. Dazu Fitzpatricks Fallen: Komplimente, „normalerweise“, „würde ich sicher“.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 67; Rob Fitzpatrick, The Mom Test, S. 24–29',
      },
    ],
    geschichte: {
      text: 'Bei Fitzpatricks Firma Habit sagt MTV: Wir brauchen Analysen und Reports für unsere Kampagnen. Das Team baut ein schickes Dashboard mit unzähligen Filtern, MTV ist beeindruckt. Dann ruft MTV trotzdem jeden Freitag an und will die Zahlen als CSV, später als PDF. Das Team baut beide Exporte, die Anrufe gehen weiter. Als MTV auch noch Logo und Farben auf den Reports will, fragt Fitzpatrick endlich, wozu. Die Antwort: „Die liest eh niemand.“ Die Kund*innen von MTV wollen einfach jeden Freitag etwas Hübsches per E-Mail bekommen. Ein kleiner geplanter Versand mit ein paar Kennzahlen hätte gereicht; 90 Prozent des Gebauten waren irrelevant, drei Monate verloren. Für die Beobachter*innen im Live-Interview: Wer einen Feature-Wunsch einfach notiert, statt nach dem Wozu zu fragen, macht denselben Fehler.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 34–36',
    },
    fragen: [
      {
        frage: 'Die Vorlage fragt „Was war daran mühsam?“ – ist das nicht suggestiv?',
        antwort: 'Ein bisschen: Die Frage unterstellt, dass es mühsam war. Neutraler ist „Was hat das für dich bedeutet?“ oder „Was ist dann passiert?“. Fitzpatricks Frage nach den Folgen („What are the implications of that?“) zeigt, ob das Problem überhaupt zählt (S. 17–18).',
      },
      {
        frage: 'Wie gut ist die Probe mit Claude?',
        antwort: 'Gut, um Pitch-Reflexe und fehlende Nachfragen zu finden. Claude erfindet aber eine plausible Person und kennt eure Zielgruppe nicht. Inhaltlich lernt ihr daraus nichts über echte Menschen.',
      },
      {
        frage: 'Müssen wir die Einwilligungsformel wirklich so sagen?',
        antwort: 'Die Einwilligung ja, die Formulierung nicht. Kurz und natürlich, ohne einleitende Danksagung im Interviewton, damit es nicht förmlich wird (Mom Test, S. 58).',
      },
    ],
    ablauf: {
      schritte: [
        '20 min: Leitfaden allein schreiben, Ziel aus der riskantesten Annahme, die meisten Fragen nach dem letzten Mal, jede gegen die drei Regeln halten, in der Werkstatt speichern.',
        '10 min: Prüfliste durchgehen und von Claude prüfen lassen (Handout „Prüfen“).',
        '15 min: Probe-Interview mit Claude als zurückhaltender Person, danach Feedback mit „Ende“ (Prompt im Handout „Probe mit Claude“).',
        '3 × 15 min reihum: 10 min Interview mit dir als schwieriger Person, 5 min Feedback. Die anderen beiden beobachten und notieren Pitch-Stellen und verpasste Nachfragen.',
        'Was sie aus der Runde lernen, kommt danach in den Leitfaden.',
      ],
      achten: [
        'Steht im Ziel eine Forschungsfrage oder eine Bestätigung der eigenen Idee („Herausfinden, ob sie die App wollen“)?',
        'Fängt das Interview mit einer Geschichte an oder mit Demografie und Meinungen?',
        'Im Live-Interview: Wird nach „normalerweise“ zurückgeholt? Wird ein Kompliment abgelenkt? Wird ein Feature-Wunsch hinterfragt?',
        'Zeit: Die drei Live-Runden brauchen 45 min. Wenn Schritt 1 überzieht, Schritt 2 kürzen, nicht die Live-Runden.',
      ],
      fehler: [
        'Die Idee wird in der Einleitung erklärt („Wir bauen eine App, die …“).',
        'Leitfaden als Fragebogen: 7 Fragen werden der Reihe nach abgearbeitet, ohne nachzufragen.',
        'Die Interviewperson wird bei einem starken Gefühl nicht gefragt, warum.',
        'Es wird mehr geredet als zugehört, oft beim Erklären, was man eigentlich meint.',
      ],
    },
  },

  'uebertrag': {
    live: [
      'Eine Frage an alle drei: Was ist eure Situation, nach der ihr fragt? So konkret wie „7:30 am Bahnhof“.',
      'Wem keine einfällt, dessen Zielgruppe ist noch zu allgemein. Zurück zum Problem-Rahmen.',
      'Jede*r sagt die eigene Situation in einem Satz. Das ist die erste Kernfrage des Leitfadens.',
    ],
    ueberleitung: 'Mit dieser Situation geht ihr jetzt raus: fünf echte Interviews bis Tag 2.',
    kern: [
      {
        text: 'Solange eine Idee vage bleibt, wirkt sie immer gut, und man kann keine der schwierigen Fragen beantworten. Erst das konkrete Gespräch macht das Bild schärfer und zeigt die Zielgruppen, die man bedienen könnte.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 12',
      },
      {
        text: 'Wie weit die Situation gefasst ist, hängt davon ab, was ihr gerade lernen wollt: eng, um ein Angebot zu verbessern, weiter, um Konkurrenz und neue Chancen zu sehen.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 65',
      },
      {
        text: 'Ein Job hängt vom Kontext ab: Ort, Zeit, Einschränkungen. Die Situation im „Wenn …“ ist dieser Kontext.',
        quelle: 'Osterwalder, Pigneur u. a., Value Proposition Design, S. 55 (PDF)',
      },
    ],
    fragen: [
      {
        frage: 'Unser Produkt ist für mehrere Situationen gedacht. Welche nehmen wir?',
        antwort: 'Die, die zur riskantesten Annahme passt. Andere Situationen könnt ihr in späteren Interviews erkunden. Fitzpatrick: Nicht jede Person muss alle Fragen beantworten (S. 55).',
      },
      {
        frage: 'Was, wenn die Situation sehr selten vorkommt?',
        antwort: 'Dann fragt nach dem letzten Mal, auch wenn es Monate her ist, und prüft, ob das Problem häufig genug ist, um es zu lösen. Das ist selbst ein wichtiges Ergebnis.',
      },
    ],
  },
};
