import type { Notiz } from './typen';

// Begleiter-Notizen für src/pages/innolab/tag-1/abschluss.astro (Tag 1, 16:15–16:45, vier Folien).
// Torres: Seitenzahlen wie im Kurs (PDF-Seite = Buchseite, das E-Book hat keine gedruckten Zahlen).
// Mom Test: gedruckte Seite = PDF-Seite + 1.
export const NOTIZEN_ABSCHLUSS: Record<string, Notiz> = {
  'hausaufgabe': {
    live: [
      'Zeit: 30 Minuten für vier Folien, Hausaufgabe zuerst wegen Fragen.',
      '„Fünf Gespräche pro Person, jede*r für das eigene Produkt; die anderen beiden aus eurem Team zählen nicht.“',
      'Kochbuch-Geschichte erzählen, falls beim Mom Test noch nicht erzählt.',
      '„Holt die Einwilligung vor dem Gespräch ein: für die Aufnahme und für die KI-Auswertung der pseudonymisierten Notizen.“',
      '„Fragt am Ende jedes Gesprächs: ‚Wen sollte ich noch fragen?‘ So kommt ihr vom ersten zum fünften Interview.“',
    ],
    verstaendnis: {
      frage: 'Wenn ich statt des Namens ‚I3‘ schreibe, sind meine Notizen dann anonym?',
      antwort: 'Nein, sie sind pseudonymisiert: Mit Zusatzinformationen wie euren Rohnotizen lässt sich die Person wieder zuordnen, die Daten bleiben personenbezogen. Deshalb braucht es trotzdem die Einwilligung, und die Rohnotizen bleiben bei euch.',
      falsch: '„Ja, ohne Namen ist es anonym.“ Das Pseudonym senkt nur das Risiko; solange es die Rohnotizen mit Namen gibt, ist die Person zuordenbar (EDPB-Leitlinien, siehe Zusatz).',
    },
    ueberleitung: 'Was ihr nach jedem dieser Gespräche festhaltet, zeigt die nächste Folie: der Snapshot.',
    uebung: { dauer: 'bis Tag 2; je Interview 20–30 min plus Snapshot gleich danach', form: 'allein, jede*r für das eigene Produkt' },
    miro: {
      frame: 'T1 · 5 · Interview-Snapshots (Hausaufgabe)',
      schritte: [
        'T1 · 5 kurz auf dem Beamer zeigen: In jeder Spalte „Produkt von: …“ stehen fünf leere Karten untereinander, „I1 · Pseudonym“ bis „I5 · Pseudonym“. Eine Karte pro Interview.',
        'Links die fertige Kaffeebar-Karte von I2 als Muster. Mehr als fünf Interviews: ganze Karte kopieren.',
        'Was aufs Board kommt: nur der Snapshot, mit Pseudonym und Bild statt Foto, ohne Namen, Arbeitgeber oder Rohnotizen. Die Überraschungen gehören ins Entscheidungslog der Werkstatt, nicht aufs Board.',
      ],
    },
    kern: [
      {
        text: 'Fitzpatrick: Man soll niemanden fragen, ob die eigene Idee gut ist, die Mutter am wenigsten, weil sie aus Liebe am meisten lügt. Die schlechte Frage lädt aber jeden dazu ein, zumindest ein bisschen zu lügen. Wörtlich: „Your mom will lie to you the most (just ‘cuz she loves you)“. Deshalb sagt die Folie „möglichst nicht mit engen Freund*innen“.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 8',
      },
      {
        text: 'Fitzpatrick schränkt das selbst ein: Freundliche Erstkontakte sind in Ordnung und verzerren die Daten nicht, solange man gute Fragen stellt. Die Kursregel ist also strenger als die Quelle. Sie soll verhindern, dass Anfänger*innen bei Bekannten in Komplimente und Hypothesen rutschen.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 56',
      },
      {
        text: '„Who else should I talk to?“ Jedes Gespräch soll so enden („End every conversation like this.“). Läuft es gut, vervielfachen sich die Kontakte über Empfehlungen. Will jemand niemanden vorstellen, ist das auch eine Information: Entweder war das Gespräch zu förmlich oder zu werbend, oder das Problem ist der Person egal.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 22',
      },
      {
        text: 'Wie viele Gespräche? Man redet weiter, bis man nichts Neues mehr hört. Bei einer einfachen Branche und einem klaren Segment können das schon 3–5 Gespräche sein. Sind die Ergebnisse nach mehr als 10 Gesprächen noch völlig verstreut, ist das Kundensegment vermutlich zu unscharf. Die Fünf im Kurs liegt in diesem Rahmen, und der Hinweis „Nur drei geschafft?“ passt zu seiner Untergrenze.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 89',
      },
      {
        text: 'Aufnahme: Laut Fitzpatrick lassen sich die meisten Leute bereitwillig aufnehmen, wenn man offen fragt. Er selbst hat Aufnahmen kaum genutzt, weil man darin nichts wiederfindet. Notizen, die man sortieren und mit dem Team teilen kann, sind ihm wichtiger. Achtung, Unterschied zum Kurs: Bei ihm heißt es „wird nirgends geteilt“. Bei euch werden die pseudonymisierten Notizen gespeichert und mit KI ausgewertet, und genau das muss in der Einwilligung stehen.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 107–108',
      },
    ],
    geschichte: {
      text: 'Falls du die Geschichte beim Mom Test noch nicht erzählt hast: Ein Sohn fragt seine Mutter, ob sie eine Kochbuch-App fürs iPad um 40 Dollar kaufen würde. Er zählt Funktionen auf, bis sie schließlich sagt, das klinge toll und 40 Dollar seien ein guter Preis. Ob es Bilder zu den Rezepten gibt, will sie noch wissen. Er nimmt das als Bestätigung, führt noch ein paar solche Gespräche, kündigt seinen Job und steckt seine Ersparnisse in die App. Dann wundert er sich, warum niemand sie kauft, nicht einmal seine Mutter. Im zweiten Gespräch fragt er nach dem, was sie zuletzt mit dem iPad gemacht hat und welches Kochbuch sie sich zuletzt selbst gekauft hat. Dabei erfährt er: Kochbücher bekommt sie meist geschenkt und schlägt sie nie auf, gekauft hat sie sich zuletzt ein veganes Kochbuch, und neue Apps findet sie über die Zeitung, nicht im App Store. Fitzpatricks Satz dazu: Es falsch zu machen ist schlimmer, als es gar nicht zu machen.',
      quelle: 'Rob Fitzpatrick, The Mom Test, S. 9–12',
    },
    zusatz: [
      {
        titel: 'Pseudonym ist nicht anonym (EDPB-Leitlinien 2025)',
        text: 'Der Europäische Datenschutzausschuss stellt in seinen Leitlinien zur Pseudonymisierung klar: Pseudonymisierte Daten, die sich mit Zusatzinformationen einer Person zuordnen lassen, gelten weiter als Information über eine identifizierbare Person und bleiben damit personenbezogen (mit Verweis auf Erwägungsgrund 26 DSGVO). Das gilt auch, wenn die Zusatzinformation bei jemand anderem liegt. Für die Hausaufgabe heißt das: I1 bis I5 senkt das Risiko, ersetzt aber nicht die Einwilligung. Die Rohnotizen mit Namen sind genau diese „Zusatzinformation“, deshalb bleiben sie bei den Studierenden. Stand: Fassung für die öffentliche Konsultation, angenommen am 16. Januar 2025. Vor dem Kurs auf edpb.europa.eu prüfen, ob es eine neuere Fassung gibt, bevor du sie als geltende Fassung zitierst.',
        quelle: 'EDPB, Guidelines 01/2025 on Pseudonymisation, Executive Summary, S. 3: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf',
      },
      {
        titel: 'Die „fünf Nutzer“ von Nielsen gelten für Usability-Tests',
        text: 'Wenn jemand fragt, ob die Fünf von der bekannten Nielsen-Regel kommt: Jakob Nielsen hat im März 2000 argumentiert, dass ein Usability-Test mit fünf Personen rund 85 % der Usability-Probleme findet und dass drei kleine Tests mit je fünf Personen besser sind als ein großer. Das betrifft das Testen eines Entwurfs, nicht Discovery-Interviews. Die Fünf im Kurs ist eine Kursentscheidung und lehnt sich an Fitzpatricks Faustregel an (S. 89, siehe oben), nicht an Nielsen.',
        quelle: 'Jakob Nielsen, „Why You Only Need to Test with 5 Users“, NN/g, 18.03.2000: https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/',
      },
    ],
    fragen: [
      {
        frage: 'Darf ich Leute aus meinem Coding-Kurs oder meiner WG fragen?',
        antwort: 'Ja, wenn sie wirklich zur Zielgruppe gehören und das Problem haben. Fitzpatrick hält freundliche Kontakte für brauchbar, solange die Fragen gut sind (S. 56). Vermeiden sollst du nur, dass das ganze Material aus engen Freund*innen kommt, und das Team zählt nie.',
      },
      {
        frage: 'Wohin mit den Notizen?',
        antwort: 'In den Interview-Editor der Werkstatt, unten auf der Abschluss-Seite: pro Interview Pseudonym (I1 bis I5), Notizen, Zitate mit IDs wie I2-3 und den Snapshot-Text. Aufnahme und Rohnotizen mit Namen bleiben bei dir. Der Snapshot kommt zusätzlich nach Miro (T1 · 5), die Überraschungen als Zeilen ins Entscheidungslog, belegt mit den Zitat-IDs.',
      },
      {
        frage: 'Muss ich aufnehmen?',
        antwort: 'Nein. Aufnehmen nur mit Einwilligung. Fitzpatrick hat Aufnahmen selbst kaum genutzt (S. 107–108). Wer nicht aufnimmt, schreibt direkt nach dem Gespräch mit, solange die Erinnerung frisch ist.',
      },
    ],
    ablauf: {
      schritte: [
        'Fünf Personen aus der Zielgruppe suchen; am Ende jedes Gesprächs nach weiteren Kontakten fragen.',
        'Vor dem Gespräch die Einwilligung einholen (Aufnahme, Speichern, KI-Auswertung der pseudonymisierten Notizen).',
        'Mit dem Leitfaden von heute fragen: eine Geschichte über das letzte Mal, nicht über Meinungen oder die Zukunft.',
        'Gleich danach den Snapshot in Miro anlegen (T1 · 5), mit Pseudonym und ohne Foto.',
        'Jede Überraschung als eine Zeile ins Entscheidungslog der Werkstatt schreiben und Claude prüfen lassen.',
      ],
      achten: [
        'Hat jede*r eine konkrete Idee, wo die fünf Personen herkommen? Frag reihum nach den ersten zwei Namen oder Orten.',
        'Ist allen klar, was Rohnotizen und was Notizen sind? Rohnotizen und Aufnahmen kommen nie ins App-Repo.',
        'Ist allen klar, dass ins Entscheidungslog nur Überraschungen gehören, nicht ein Protokoll jedes Gesprächs?',
      ],
      fehler: [
        'Die Idee vorstellen und fragen, ob sie gefällt. Das ist genau das Kochbuch-Gespräch.',
        'Alle fünf Interviews am letzten Abend führen und erst danach die Snapshots schreiben.',
        'Klarnamen oder Arbeitgeber auf dem Board oder im Entscheidungslog.',
        'Die Einwilligung nur für die Aufnahme einholen und die KI-Auswertung vergessen.',
      ],
    },
  },

  'snapshot': {
    live: [
      'Kaffeebar-Karte I2 in T1 · 5 zeigen, Zitat vorlesen.',
      '„Wünscht sich jemand eine Funktion, fragt: ‚Was würde dir das bringen?‘ Die Antwort darauf ist die Chance.“',
      'Bei Bedarf Torres’ Streaming-Beispiel: Wunsch ‚Titel sagen‘, Bedürfnis ‚nicht tippen‘.',
      '„Schreibt auch auf, was nur eine Person sagt. Oft taucht es später in anderen Interviews wieder auf.“',
    ],
    ueberleitung: 'Bevor ihr rausgeht, schauen wir noch einmal zurück, wie ihr heute zu dieser einen Frage gekommen seid.',
    uebung: { dauer: 'gleich nach jedem Interview', form: 'allein; an Tag 2 im Team besprochen' },
    miro: {
      frame: 'T1 · 5 · Interview-Snapshots (Hausaufgabe)',
      schritte: [
        'Die Kaffeebar-Karte links durchgehen: „I2 · Pendlerin, Zug 7:42“, Bild „Uhr“, Zitat „Wenn ich auf die Uhr schauen muss, geh ich.“, die Geschichte als fünf kleine Stickies mit Pfeilen, darunter Kurzinfos, Einsichten und das gelbe Feld Chancen.',
        'Pro Interview die nächste freie Karte in der eigenen Spalte: „I1 · Pseudonym“ durch das Pseudonym ersetzen, ins Feld „Bild“ ein Bild oder Stichwort statt Foto, ins Feld „Zitat“ den wörtlichen Satz.',
        'Geschichte als Skizze: das kleine Sticky in der Karte mit Cmd+D bzw. Strg+D kopieren, je eines pro Schritt, Pfeile mit dem Verbindungswerkzeug.',
        'Kurzinfos, Einsichten und Chancen in die drei Felder darunter; Chancen in den Worten der Person, nicht als Lösung.',
        'An Tag 2 besprecht ihr die Karten gemeinsam auf dem Board. Notizen, Zitate und Snapshot-Text tragt ihr zusätzlich in den Interview-Editor der Werkstatt ein.',
      ],
    },
    kern: [
      {
        text: 'Wer laufend interviewt, hat keinen natürlichen Zeitpunkt, an dem er stehen bleibt und auswertet. Deshalb wertet man nach jedem Gespräch sofort aus („Synthesize as You Go“). Der Interview Snapshot ist eine Seite pro Interview. Er macht aus vielen Notizen umsetzbare Einsichten, und die Sammlung aller Snapshots wird zum Register des Kundenwissens.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 67–68',
      },
      {
        text: 'Schon nach einer Handvoll Interviews „interviews will start to blur together“. Dem Gedächtnis soll man nicht vertrauen. Je visueller der Snapshot, desto länger erinnert sich das Team an die Geschichten, auch noch Wochen später. Ein Foto nur mit Erlaubnis. Wo anonymisiert werden muss oder das Thema sensibel ist, ersetzt ein Bild das Foto, das an die Geschichte erinnert (Firmenlogo, Auto, sogar ein Katzen-Meme).',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 68–69',
      },
      {
        text: 'Oben steht ein Zitat, das einen einprägsamen Moment festhält, etwa einen emotionalen Satz oder ein auffälliges Verhalten. Bei bildhafter Sprache die genauen Worte festhalten. Die Kurzinfos ordnen ein, was für ein Kunde das war, damit man sieht, wie sich diese Geschichte von den anderen unterscheidet. Welche Kurzinfos sinnvoll sind, hängt vom Produkt ab.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 69',
      },
      {
        text: 'Eine Chance (Opportunity) ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch. Torres will sie als Bedürfnis notiert haben, nicht als Lösung. Wünscht sich jemand eine Funktion, fragt man: „If you had that feature, what would that do for you?“ Chancen müssen keine wörtlichen Zitate sein, sollen aber in den Worten der Kund*innen formuliert sein, also aus deren Sicht und nicht aus der des Unternehmens.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 69–70',
      },
      {
        text: 'Einsichten sind alles Interessante, das kein Bedürfnis ist, zum Beispiel ein ungewöhnliches Verhalten. Aus Einsichten werden mit der Zeit oft Chancen. Möglichst alles festhalten, auch scheinbar Einmaliges. Torres: Man ist überrascht, wie oft eine Chance, die nur ein Kunde zu haben scheint, später in mehreren Interviews auftaucht. Dazu kommt die Skizze der Geschichte aus Knoten und Verbindungen. Mit ihr findet man in Kapitel 6 die Muster über alle Geschichten hinweg.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 70',
      },
    ],
    geschichte: {
      text: 'Torres erklärt den Unterschied zwischen Wunsch und Chance an einem Streaming-Dienst. Eine Interviewte sagt: „Ich wünschte, ich könnte den Filmtitel einfach sagen.“ Das ist ein Funktionswunsch. Auf die Frage, was ihr das bringen würde, antwortet sie: Sie will keinen langen Filmtitel eintippen müssen. Das ist das eigentliche Bedürfnis. Sprachsuche wäre eine Lösung dafür, eine Autovervollständigung beim Tippen eine andere. Wer nur den Wunsch notiert, hat sich schon auf eine Lösung festgelegt. Auf der Folie heißt das Gegenstück dazu „Ich will per App vorbestellen“ und „Ich will den Zug nicht verpassen“. Zu den Zitaten erzählt Torres, dass sie sich an manche noch nach Jahren erinnert, zum Beispiel an „Ich arbeite seit drei Jahren hier, aber es fühlt sich an wie Hundejahre.“',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 69',
    },
    fragen: [
      {
        frage: 'Wie sieht ein guter Snapshot konkret aus?',
        antwort: 'Zeig das Werkstatt-Beispiel I2: Pseudonym „Pendlerin, Zug 7:42“. Zitat „Wenn ich auf die Uhr schauen muss, geh ich.“ (I2-2). Kurzinfos „Pendelt täglich nach Wien. Holt dreimal pro Woche Kaffee.“ Einsicht „Entscheidet erst beim Ankommen.“ Chancen „Wenn ich anstehe, verpasse ich den Zug.“ und „Ich will wissen, wann mein Kaffee fertig ist.“ (I2-5).',
      },
      {
        frage: 'Was, wenn nur eine Person etwas sagt? Zählt das?',
        antwort: 'Es kommt trotzdem auf den Snapshot (Torres, S. 70), wenn nötig als Einzelfall gekennzeichnet. Im Werkstatt-Beispiel steht bei I5 die Einsicht „Bestellt für Kolleg*innen per Nachricht mit (Einzelfall)“. Ob daraus ein Muster wird, zeigt sich an Tag 2.',
      },
      {
        frage: 'Wie unterscheide ich Einsicht und Chance?',
        antwort: 'Eine Chance ist ein Bedürfnis, ein Schmerz oder ein Wunsch in den Worten der Person, zum Beispiel „Ich will wissen, wann mein Kaffee fertig ist.“ Eine Einsicht ist ein auffälliges Verhalten ohne Bedürfnis, zum Beispiel „Entscheidet erst beim Ankommen.“ Im Zweifel als Einsicht notieren, daraus wird oft später eine Chance (Torres, S. 70).',
      },
    ],
    ablauf: {
      schritte: [
        'Direkt nach dem Gespräch: das Pseudonym (I1 bis I5) und ein Bild, das an die Geschichte erinnert.',
        'Ein Zitat wörtlich, das im Kopf geblieben ist.',
        'Die Geschichte als Skizze aus Knoten und Verbindungen, wie beim Toast am Morgen.',
        'Kurzinfos, Einsichten und Chancen, wobei die Chancen als Bedürfnis in ihren Worten stehen.',
        'Den Snapshot im Frame T1 · 5 auf dem Team-Board ablegen.',
      ],
      achten: [
        'Stehen in der Spalte Chancen Lösungen wie „App“, „Vorbestellen“ oder „Anzeige“? Dann fehlt die Frage, was ihnen das bringen würde.',
        'Ist das Zitat wörtlich oder schon zusammengefasst?',
        'Gibt es eine Skizze der Geschichte oder nur Text?',
      ],
      fehler: [
        'Alle fünf Snapshots am Abend vor Tag 2 in einem Rutsch schreiben.',
        'Ein Foto oder einen Klarnamen auf das Team-Board stellen.',
        'Chancen in der Sprache des Produktteams formulieren statt in der Sprache der Kund*innen.',
        'Einzelfälle weglassen, weil sie „nicht repräsentativ“ sind.',
      ],
    },
  },

  'rueckblick': {
    live: [
      'Board herauszoomen, T1 · 1 bis T1 · 4 zeigen, „Alle zu mir holen“.',
      'Fünf Schritte als Kette durchgehen: jeder begrenzt den nächsten.',
      '„Die riskanteste Annahme ist eure Forschungsfrage. Im Interview fragt ihr aber nach einer Geschichte, nicht nach der Annahme.“',
      '„An Tag 2 dreht sich die Richtung: Zu dem, was ihr glaubt, kommt, was eure Leute erlebt haben.“',
    ],
    ueberleitung: 'Zum Schluss schauen wir, was davon heute wirklich in euren Mappen gelandet ist.',
    miro: {
      schritte: [
        'Auf dem Board so weit herauszoomen, dass die Tag-1-Spalte von T1 · 1 bis T1 · 4 zu sehen ist, und „Alle zu mir holen“.',
        'Frame für Frame von oben nach unten auf die drei Spalten zeigen: Experience Map, Problem-Rahmen, Annahmen-Map, Leitfaden. Jeder Frame baut auf dem vorigen auf.',
        'Zum Schluss T1 · 5 darunter: Das kommt bis Tag 2 dazu.',
      ],
    },
    kern: [
      {
        text: 'Torres führt den Teil über das Entdecken von Chancen mit drei Artefakten ein, die aufeinander aufbauen. Die Experience Map zeigt, was man heute über die Kund*innen weiß. Sie leitet die Interviews. Was man aus jedem Interview lernt, kommt auf einen Snapshot, und aus den Snapshots entsteht der Opportunity Solution Tree. Keines davon ist eine einmalige Aufgabe: Alle wachsen mit, wenn sich das Verständnis ändert.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 49',
      },
      {
        text: 'Forschungsfragen (was man lernen will) und Interviewfragen (was man fragt) sind zwei verschiedene Dinge. Weil Menschen über ihr eigenes Verhalten schlecht Auskunft geben, übersetzt man die Forschungsfrage in eine Bitte um eine konkrete Geschichte. Torres’ Beispiel: nicht „Nach welchen Kriterien kaufst du Jeans?“, sondern „Erzähl mir vom letzten Mal, als du Jeans gekauft hast.“ Die wichtigste Forschungsfrage jedes Interviews ist, welche Bedürfnisse, Schmerzpunkte und Wünsche dieser Person am wichtigsten sind.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 64–65',
      },
      {
        text: 'Torres warnt vor langen Gesprächsleitfäden. Sie überfordern die Gesprächspartner*innen und liefern unzuverlässige Daten. Besser ist eine Liste von Forschungsfragen und ein oder zwei Story-Fragen („Tell me about a specific time when…“). Ebenfalls ein Anti-Muster: Notizseiten oder Aufnahmen weiterschicken. Geteilt werden die Snapshots.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 76–77',
      },
      {
        text: 'Ein Outcome misst, was sich ändert, nicht was gebaut wird. Torres unterscheidet Business Outcomes, Product Outcomes und Traction Metrics. Ein Produktteam kommt mit einem Product Outcome am weitesten, weil es in seinem eigenen Einflussbereich liegt. Das war der Block am Vormittag.',
        quelle: 'Teresa Torres, Continuous Discovery Habits, S. 40',
      },
    ],
    geschichte: {
      text: 'Warum die Interviews nach Tag 2 nicht aufhören: Torres zitiert Raya Raycheva, Senior User Researcher beim Londoner Versicherer Simply Business. Ihr Team erkannte, dass das Bedürfnis, das es gerade untersuchte, den Kund*innen gar nicht so wichtig war. Weil das Team laufend interviewte, musste es nicht von vorne anfangen. Am Dienstag strich es die Chance, am Mittwoch wählte es im Baum eine neue, und am Donnerstag nutzte es die ohnehin geplanten Interviews schon für die neue Chance. Torres folgert daraus: Eine Gewohnheit beizubehalten ist leichter, als sie immer wieder neu anzufangen.',
      quelle: 'Teresa Torres, Continuous Discovery Habits, S. 71–72',
    },
    fragen: [
      {
        frage: 'Was, wenn die Interviews zeigen, dass meine riskanteste Annahme falsch ist?',
        antwort: 'Das ist das beste Ergebnis, das ihr haben könnt. Die alte Zeile im Entscheidungslog bleibt stehen, darunter kommt die neue Zeile mit dem Beleg. Das Werkstatt-Beispiel zeigt so etwas: D4 verwirft „Vorbestellen vor der Ankunft“, weil I2-4, I3-1 und I5-3 sagen, dass sie erst in der Halle entscheiden.',
      },
      {
        frage: 'Muss ich den Problem-Rahmen jetzt schon ändern?',
        antwort: 'Nein. Erst die Interviews führen, geändert wird an Tag 2 mit Belegen. Die Artefakte wachsen mit (Torres, S. 49).',
      },
    ],
  },

  'zahlen': {
    live: [
      'In der Werkstatt angemeldet? Dann „Zahlen aus der Werkstatt holen“ klicken.',
      '„Gezählt wird nur, was in der Werkstatt gespeichert ist, nicht was auf dem Miro-Board oder lokal steht.“',
      '„Fehlt bei jemandem eine Zahl, ist das ein Auftrag für heute Abend, kein Urteil.“',
      'Interview-Editor unten auf der Seite und Datenschutzhinweis zeigen: „Vor jedem Gespräch zeigen.“',
    ],
    ueberleitung: 'Bis Tag 2 führt ihr eure fünf Gespräche mit je einem Snapshot, und Tag 2 beginnt mit der Interview-Synthese, in der ihr die Snapshots im Team besprecht.',
    kern: [
      {
        text: 'Fitzpatricks Faustregel: „Notes are useless if you don’t look at them.“ Notizen sollen so leicht sein, dass man sie wirklich durchsieht, allein und mit dem Team. Dafür müssen sie an einem dauerhaften Ort liegen, wo man sie sortieren und mit den Notizen des Teams zusammenführen kann. Das ist der Grund, warum nur zählt, was in der Werkstatt gespeichert ist.',
        quelle: 'Rob Fitzpatrick, The Mom Test, S. 106–108',
      },
    ],
    fragen: [
      {
        frage: 'Ich habe etwas eingetragen, aber es wird nicht gezählt.',
        antwort: 'Gezählt wird nur, was in der Werkstatt gespeichert ist. Was nur auf dem Miro-Board oder in einer lokalen Datei steht, zählt nicht. Kurz in „Meine Mappe“ nachsehen, ob es gespeichert ist, und dann die Zahlen noch einmal holen.',
      },
      {
        frage: 'Fließen die Zahlen in die Note ein?',
        antwort: 'Laut Kick-off ist die Bewertung Prototyp 70 % und Präsentation 30 %. Einen eigenen Posten für diese Zahlen gibt es dort nicht. Sie zeigen den Stand der Mappen.',
      },
    ],
    ablauf: {
      achten: [
        'Wenn „Erst in der Werkstatt anmelden.“ erscheint, über den Link anmelden. Danach landest du wieder auf dieser Folie.',
        'Die Zahlen sind ein Moment für die Gruppe. Niemanden vorführen, sondern zeigen, was alle zusammen geschafft haben.',
      ],
    },
  },
};
