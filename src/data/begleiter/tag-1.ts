import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/tag-1.astro (19 Folien). Schlüssel = h2-id der Folie.
// Torres-Seiten = Seiten der Kurs-PDF (wie auf den Folien zitiert, identisch mit quellen/torres/text.txt).
// Patton ist EPUB: Kapitel + Abschnitt. Kniberg: Blogartikel (URL).
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const PATTON = 'Jeff Patton, User Story Mapping';
const KNIBERG = 'Henrik Kniberg, Making sense of MVP (Crisp Blog, 2016), https://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp';

export const NOTIZEN_TAG_1: Record<string, Notiz> = {
  'kickoff': {
    live: [
      '„Ihr dürft ein neues Produkt starten oder euer Projekt aus dem Coding-Kurs weiterführen – beides zählt.“',
      '„Jede Methode läuft gleich: erst die Theorie mit der Buchgrafik, dann die Kaffeebar gemeinsam, dann euer Produkt.“',
      'Fragen: Wer hat schon eine Produktidee, wer führt weiter?',
      'Rollen klären: Product Owner entscheidet, die anderen denken und interviewen mit.',
    ],
    ueberleitung: 'Ihr arbeitet auf einem gemeinsamen Miro-Board – ich zeige euch kurz, wie es aufgebaut ist.',
    fragen: [
      { frage: 'Darf ich mein Projekt aus dem Coding-Kurs weiterführen?', antwort: 'Ja, laut Handout: neu oder als Weiterführung. Entscheidend ist, dass es ein eigenes digitales Produkt mit einer echten Zielgruppe ist, die man bis Tag 2 interviewen kann.' },
      { frage: 'Warum die Kaffeebar und nicht gleich unser Produkt?', antwort: 'Am Beispiel, das alle kennen, sieht man die Methode ohne Streit über Inhalte. Danach wendet ihr sie sofort auf euer Produkt an – im selben Frame direkt daneben.' },
      { frage: 'Wie arbeiten wir in den Produkten der anderen mit?', antwort: 'Als Mitglied des Teams: mitdenken, mitinterviewen, Belege prüfen. Entscheiden tut die Product Ownerin bzw. der Product Owner des jeweiligen Produkts.' },
    ],
  },

  'miro': {
    live: [
      'Board am Beamer öffnen, „Start hier“ zeigen.',
      'Spalten wählen lassen: jede*r trägt Namen und Produkt ein.',
      'Vorführen: „Alle zu mir holen“ holt alle an deinen Frame.',
      '„Das Ergebnis jedes Blocks haltet ihr in den letzten zehn Minuten in der Werkstatt fest – daraus liest Claude.“',
      'Hinweis Datenschutz: Interviewte nur als I1 bis I5, keine Namen, Fotos.',
    ],
    ueberleitung: 'Miro ist die Denkfläche. Jetzt richtet ihr die Werkstatt ein, aus der Claude liest.',
    miro: {
      schritte: [
        '„Start hier“ auf dem Beamer öffnen. Als Erstes wählt jede*r eine der drei Spalten „Produkt von: …“ und trägt Namen und Produkt ein. Diese Spalte gehört ihr bzw. ihm in jedem Frame; die linke Spalte ist die Kaffeebar.',
        'Zurechtfinden zeigen: Frames-Liste in Miro oder die Links im Kasten „Inhalt“. Tag 1 läuft von oben nach unten, T1 · 1 bis T1 · 5. Verirrt: herauszoomen, wieder hinein.',
        '„Alle zu mir holen“ einmal vorführen: So holst du bei jeder Übung alle an deinen Frame.',
        'Regeln für Stickies: ein Gedanke pro Sticky, wenige Wörter. Gelb ist der Normalfall, andere Farben nur, wo der Frame es sagt (heute nur in T1 · 3).',
        'Die Kaffeebar und die farbigen Felder nicht verschieben, eigene Stickies einfach daraufkleben. Ein Sticky kopieren: Cmd+D bzw. Strg+D.',
        'In fremden Spalten nichts verschieben oder löschen, sondern kommentieren.',
        'Parkplatz: Für eine Frage ein Sticky vom Stapel „Neue Frage“ (unten rechts in „Start hier“) ziehen und in den Parkplatz kleben.',
      ],
    },
    fragen: [
      { frage: 'Wie komme ich aufs Board?', antwort: 'Über den Link auf der Folie (Handout) bzw. im Teams-Kanal; das Passwort ist dasselbe wie für die Website.' },
      { frage: 'Warum zusätzlich die Werkstatt, wenn alles in Miro steht?', antwort: 'Aus der Werkstatt liest Claude, und dort sind die Entscheidungen nachvollziehbar festgehalten. Miro bleibt die Denkfläche.' },
      { frage: 'Dürfen Interviewte mit Namen oder Foto aufs Board?', antwort: 'Nein. Nur Pseudonyme I1 bis I5, keine Namen, Fotos oder Arbeitgeber – auch in Miro.' },
    ],
  },

  'verbinden': {
    live: [
      'Timer 10 min starten, alle arbeiten am eigenen Laptop.',
      'Reihenfolge: Mappe anmelden, Connector anlegen, Modelltraining aus.',
      '„Meldet die Mappe ‚nicht freigeschaltet‘, sagt mir euren GitHub-Namen.“',
      'Nach 10 min: Wer noch hängt, macht in der Pause weiter.',
    ],
    ueberleitung: 'Jetzt sind die Werkzeuge bereit. Fehlt noch das Bild, das uns durch alle Tage trägt.',
    uebung: { dauer: '10 min', form: 'allein am eigenen Laptop' },
    ablauf: {
      schritte: [
        'Folie zeigen, Timer 10 min. Die Anleitung mit Bildern liegt auf /innolab/werkstatt/claude.',
        'Mappe zuerst: Die Anmeldung mit GitHub legt sie an und zeigt sofort, ob jemand freigeschaltet ist.',
        'Dann der Connector über den Ein-Klick-Link, Bestätigung in GitHub, danach Modelltraining aus.',
        'Kurz herumgehen: Sieht jede*r die leere Mappe und den Connector mit vier Werkzeugen?',
      ],
      achten: [
        '„Nicht freigeschaltet“ heißt: GitHub-Name fehlt in der Werkstatt. Neu anmelden hilft nicht, erst eintragen.',
        'Kein Dialog in claude.ai: Connector von Hand unter Customize → Connectors anlegen, Name und URL stehen auf der Anleitung.',
      ],
      fehler: [
        'Den Connector auf die erste Prüfung um 12:00 verschieben – dann wird die Prüfung zur Einrichtung.',
      ],
    },
    fragen: [
      { frage: 'Was sieht Claude über den Connector?', antwort: 'Nur die eigene Mappe, und nur lesend: vier Werkzeuge, alle read-only. Claude prüft, schreibt aber nichts.' },
      { frage: 'Was, wenn der Connector nicht klappt?', antwort: 'Ohne ihn weiterarbeiten: Im Editor „Für Claude kopieren“ und den Text in ein Gespräch mit Claude einfügen.' },
    ],
  },

  'faden': {
    live: [
      'Geschichte erzählen: Team fragt Torres, wie es allein weiterweiß.',
      'Fragen: Womit fangen Teams meist an? Erwartet: mit Lösungen.',
      '„Chancen heißen Chancen, nicht Probleme: Auch Wünsche zählen – Eis oder Mountainbiken lösen kein Problem.“',
      '„Eine Lösung zählt nur, wenn sie Menschen hilft und euer Ziel bewegt.“',
    ],
    ueberleitung: 'Erste Falle, gegen die der Baum hilft: nur eine Lösung im Blick und die Frage „ja oder nein?“.',
    kern: [
      { text: 'Die Struktur von Discovery: Zuerst ein klares Outcome, das den Rahmen setzt; dann den Opportunity Space entdecken und abbilden – das gibt dem schlecht strukturierten Problem Struktur; dann Lösungen, die diese Chancen adressieren und damit das Outcome bewegen. Visualisiert als Opportunity Solution Tree.', quelle: `${TORRES}, S. 26` },
      { text: 'Die Ebenen: Wurzel = gewünschtes Outcome (der Geschäftsbedarf, über den das Team Wert für das Unternehmen schafft); darunter Chancen (Bedürfnisse, Schmerzen, Wünsche der Kundschaft, die das Outcome treiben würden); darunter Lösungen; darunter Annahmen-Tests, mit denen man bewertet, welche Lösung Kundenwert so schafft, dass er Geschäftswert treibt.', quelle: `${TORRES}, S. 26–27` },
      { text: 'Warum „Opportunities“ statt „Probleme“: Viele Produkte lösen kein Problem, sondern erfüllen Wünsche (Disneyland, Eis, Mountainbiken). Der Begriff umfasst Bedürfnisse, Schmerzpunkte und Wünsche.', quelle: `${TORRES}, S. 24–25` },
      { text: 'Den Weg zum Outcome zu finden ist ein „ill-structured“ (wicked) Problem: viele Lösungen, keine richtige, nur bessere und schlechtere. Ein großer Teil der Arbeit ist, das Problem zu rahmen; gute Problemlöser probieren mehrere Rahmungen aus (David Jonassen).', quelle: `${TORRES}, S. 24–25` },
      { text: 'Die Form des Baums sagt, was als Nächstes dran ist: zu flacher Chancenraum → mehr Interviews; ausufernder → fokussieren; zu wenige Lösungen → Ideensession; zu wenige Tests → mehr testen.', quelle: `${TORRES}, S. 33` },
    ],
    geschichte: {
      text: '2016 coachte Teresa Torres ein Produkt-Trio, das zum ersten Mal kontinuierlich Discovery machen sollte. Eines Tages sagte das Team: „Wir lernen viele Discovery-Taktiken, aber wir wissen nicht, was wann dran ist. Du sagst uns immer die nächsten Schritte – wie sollen wir das allein schaffen?“ Die Frage traf sie: Abhängigkeit von ihr wollte sie am wenigsten, aber eine einfache Antwort hatte sie nicht. Wie entschied sie selbst, was als Nächstes kommt? Nach einigem Nachdenken erkannte sie eine Struktur, die Discovery zugrunde liegt: Outcome, Chancen, Lösungen, Tests. Diese Struktur zeichnete sie als Baum – und gab Teams damit ein Werkzeug, mit dem sie selbst sehen, was der nächste Schritt ist.',
      quelle: `${TORRES}, S. 25–26`,
    },
    fragen: [
      { frage: 'Wird der Baum von oben nach unten abgearbeitet?', antwort: 'Meist startet man oben, aber die besten Teams arbeiten auch von unten: Tests verändern Lösungen und den Chancenraum, und mit der Zeit sogar, wie man das Outcome misst (Torres S. 33).' },
      { frage: 'Wie groß muss unser Baum werden?', antwort: 'So viel Struktur, dass man das große Bild sieht, nicht so viel, dass man in Details ertrinkt. Der erste Entwurf ist nie fertig; Struktur wird gemacht, verworfen, neu gemacht (Torres S. 91).' },
    ],
  },

  'was-noch': {
    live: [
      'Fragen: Wer hat zur eigenen Idee schon Alternativen geprüft?',
      '„Torres nennt ‚ja oder nein?‘ eine Whether-or-not-Entscheidung – für sie vielleicht der häufigste Fehler von Produktteams.“',
      'Heath nennen: vier Feinde – enger Blick, Bestätigung, Gefühle, Selbstüberschätzung.',
      'Falle: „Wir wissen schon, welche die beste ist“ – das ist Selbstüberschätzung.',
      '„Drei Lösungen heißt nicht drei bauen: Ihr testet Annahmen über mehrere parallel.“',
    ],
    ueberleitung: 'Zweiter Nutzen des Baums: Große Chancen lassen sich in kleine zerlegen.',
    kern: [
      { text: 'Der Reflex: Wer ein Problem hört, will es lösen – aus guter Absicht. Aber man hinterfragt die Rahmung nicht, verliebt sich in die erste Lösung und vergisst zu fragen „Wie könnten wir das sonst lösen?“. Im Team wird es schlimmer: jede*r springt zur eigenen Lösung, es folgen fruchtlose Meinungskämpfe, am Ende entscheidet die Rolle statt der Zusammenarbeit.', quelle: `${TORRES}, S. 28` },
      { text: 'Chip und Dan Heath (Decisive) nennen vier Feinde guter Entscheidungen: (1) das Problem zu eng sehen, (2) Bestätigungsfehler – nur Belege suchen, die die eigene Meinung stützen, (3) kurzfristige Gefühle – im Produkt: sich in Ideen verlieben, (4) Selbstüberschätzung – man ist sicher, dass die Idee ein Erfolg wird.', quelle: `${TORRES}, S. 30` },
      { text: 'Whether-or-not-Entscheidung: „Sollen wir das tun oder nicht?“ – wenn ein einzelner Kundenschmerz auftaucht („Alles stoppen und das beheben?“) oder wenn Stakeholder ihr Lieblingsfeature wollen. Torres: vielleicht der häufigste Fehler von Produkt-Trios.', quelle: `${TORRES}, S. 30` },
      { text: 'Stattdessen Compare-and-contrast: „Welches dieser Kundenbedürfnisse ist gerade am wichtigsten?“ statt „Sollen wir dieses lösen?“; „What else could we build?“ statt Verlieben in die erste Idee (wörtlich geprüft, S. 31).', quelle: `${TORRES}, S. 31` },
      { text: 'Gute Discovery verhindert Scheitern nicht, sie senkt nur die Wahrscheinlichkeit. Die meisten Discovery-Entscheidungen sind umkehrbar – wer testet, kann schnell korrigieren und muss nicht in Analyse-Lähmung verfallen.', quelle: `${TORRES}, S. 31` },
    ],
    fragen: [
      { frage: 'Heißt drei Lösungen, dass wir drei bauen?', antwort: 'Nein. Ihr testet Annahmen über mehrere Lösungen parallel, damit ihr euch nicht zu früh auf eine festlegt (Torres S. 34). Gebaut wird, was die Tests trägt.' },
      { frage: 'Was, wenn wir schon wissen, welche Lösung die beste ist?', antwort: 'Genau das ist der vierte Feind, Selbstüberschätzung. Dann sollte es leicht sein, zwei Alternativen zu nennen und zu zeigen, warum sie schlechter abschneiden.' },
    ],
  },

  'klein-gross': {
    live: [
      'Provozieren: Sechs-Monats-Projekt in Sprints schneiden ist für Torres nicht agil.',
      'Streaming-Beispiel erzählen: „Wer spielt mit?“ als kleine Chance.',
      '„Welche kleine Chance könnte euer Prototyp in einer Woche wirklich lösen?“',
      '„Euer Prototyp muss nicht alles können: Eine kleine Chance, wirklich gelöst, zeigt mehr als eine halbe Lösung.“',
    ],
    ueberleitung: 'Und wenn eine Lösung scheitert, lernt ihr etwas über die Kundschaft – Problem und Lösung wachsen gemeinsam.',
    kern: [
      { text: 'Kontinuierliches Denken statt Projekt-Denken: Ein sechsmonatiges Wasserfallprojekt in Zwei-Wochen-Sprints zerlegen und „agil“ nennen ist weder agil noch kontinuierlich. Kontinuierlich heißt: jeden Sprint Wert liefern.', quelle: `${TORRES}, S. 29` },
      { text: 'Der Baum zerlegt projektgroße Chancen in kleinere; je tiefer im Baum, desto kleiner. Teams lösen eine Chance nach der anderen, und die vielen kleinen Lösungen lösen nach und nach die große.', quelle: `${TORRES}, S. 29` },
      { text: 'Zweifacher Nutzen des Zerlegens: Man kann Probleme angehen, die sonst unlösbar wirken, und man liefert Wert über die Zeit – statt zu warten, bis das große Problem gelöst ist. Das ist Kern des Agilen Manifests und kontinuierlicher Verbesserung.', quelle: `${TORRES}, S. 85` },
      { text: 'Geschwister-Chancen gehören zum selben Elternteil, sind aber getrennt lösbar: Wer eine löst, löst die Eltern-Chance teilweise.', quelle: `${TORRES}, S. 83–84` },
    ],
    geschichte: {
      text: 'Torres nimmt ein Streaming-Beispiel: „Ist diese Serie gut?“ wirkt auf den ersten Blick wie ein schwieriges Problem. Schaut man genauer hin, entscheiden Menschen ganz unterschiedlich: manche nach dem Genre, andere danach, wer mitspielt – sie haben Lieblingsschauspieler*innen und schauen zuerst auf die Besetzung. So zerfällt die große Frage in kleinere: „Was für eine Serie ist das?“, „Wer spielt mit?“, „Ähnelt sie einer, die ich schon gesehen habe?“, „Wer schaut sie sonst?“. Ein Team könnte mit „Wer spielt mit?“ anfangen, weil es relativ leicht zu lösen ist und viele so auswählen. Das löst die große Frage nicht ganz, aber ein kleines Bedürfnis vollständig – und mit jeder weiteren kleinen Chance wird auch die große kleiner.',
      quelle: `${TORRES}, S. 84–85`,
    },
    fragen: [
      { frage: 'Ist eine kleine Chance nicht zu wenig für eine Präsentation?', antwort: 'Eine kleine Chance wirklich gelöst und belegt zeigt mehr als eine halbe Lösung für alles. Und am Baum seht ihr, auf welche große Chance sie einzahlt.' },
      { frage: 'Woran erkenne ich, dass eine Chance klein genug ist?', antwort: 'Wenn ihr dafür mehrere konkrete Lösungen nennen und eine davon in kurzer Zeit testen könnt. Ist sie zu vage („Das ist zu kompliziert“), weiter fragen, in welchem Moment genau (Torres S. 94).' },
    ],
  },

  'problem-loesung': {
    live: [
      'Kontrast nennen: PM besitzt Problem, Design die Lösung – zerbricht in der Praxis.',
      'Fragen: Ist ein gescheiterter Test Zeitverschwendung? Nur ohne Ableitung.',
      'Falle: nach Fehlschlag sofort neue Idee, ohne Chancen anzupassen.',
      '„Euer Baum wächst jeden Tag mit – am Ende zeigt er, wie ihr zu euren Entscheidungen gekommen seid.“',
    ],
    ueberleitung: 'Jetzt die vier Ebenen konkret – am Beispiel der Kaffeebar.',
    kern: [
      { text: 'Rollentrennung „PM besitzt das Problem, Design und Engineering die Lösung“ klingt gut, fällt in der Praxis aber schnell auseinander.', quelle: `${TORRES}, S. 32` },
      { text: 'Nigel Cross (Open University) verglich erfahrene und unerfahrene Designer*innen über viele Disziplinen: Die besten entwickeln Problem- und Lösungsraum gemeinsam. Beim Erkunden von Lösungen lernen sie mehr über das Problem, und mit mehr Verständnis werden neue Lösungen möglich.', quelle: `${TORRES}, S. 32` },
      { text: 'Nach einem gescheiterten Test reflektieren: „Ich dachte, diese Lösung funktioniert. Sie tat es nicht. What did I misunderstand about my customer?“ (wörtlich geprüft). Dann den Chancenraum überarbeiten, bevor neue Lösungen kommen; wer das überspringt, rät nur wieder.', quelle: `${TORRES}, S. 33` },
      { text: 'Alle Gewohnheiten im Buch sind für das ganze Trio gedacht; Rollen dürfen keine Ausrede sein, Problem- und Lösungsraum künstlich zu trennen. Der Baum macht das Verständnis der Kundschaft explizit, sodass man es nach einem Fehlschlag schnell überarbeiten kann.', quelle: `${TORRES}, S. 33` },
    ],
    fragen: [
      { frage: 'Ist ein gescheiterter Test dann Zeitverschwendung?', antwort: 'Nur, wenn ihr nichts daraus ableitet. Er sagt euch, welche Annahme über die Kundschaft falsch war – das gehört in den Baum und ins Entscheidungslog.' },
    ],
  },

  'ebenen': {
    live: [
      'Werbung-Beispiel erzählen: „Werbung vorspulen“ ist Lösung, Chance ist „keine Werbung mögen“.',
      '„Schreibt Chancen so, wie Menschen sie im Interview sagen würden – niemand sagt ‚Ich wünsche mir mehr Kaffeebar-Umsatz‘.“',
      'Falle: zu vage Chancen wie „Das soll einfach sein“.',
      '„Getestet wird nicht die ganze Idee, sondern das, was dafür stimmen muss – mehr an Tag 3.“',
    ],
    ueberleitung: 'So sieht der Baum der Kaffeebar aus – und heute entsteht nur die Wurzel.',
    kern: [
      { text: 'Chancen aus Sicht der Kundschaft formulieren, nicht aus Sicht des Unternehmens. Torres: Niemand würde sagen „Ich hätte gern mehr Streaming-Abos“, wohl aber „Ich will Zugang zu spannenderen Inhalten“. Prüffrage pro Chance: „Haben wir das in Interviews gehört?“ bzw. „Kann ich mir vorstellen, dass jemand das sagt – oder wünschen wir es uns nur?“', quelle: `${TORRES}, S. 91–92` },
      { text: 'Lösungen in Verkleidung: Kundschaft äußert oft Lösungswünsche, die wie Chancen klingen. Test: „Is there more than one way to address this opportunity?“ (wörtlich geprüft). Gibt es nur einen Weg, ist es keine Chance, sondern eine Lösung – dann die dahinterliegende Chance suchen.', quelle: `${TORRES}, S. 94` },
      { text: 'Chancen müssen konkret sein: Themen, Designrichtlinien oder Stimmungen („Das soll einfach sein“, „Das ist zu schwer“) sind zu vage; konkret wäre „Eine Serie zu finden soll einfacher sein“ oder „Ich will auf dem Weg zur Arbeit im Zug schauen“.', quelle: `${TORRES}, S. 94` },
      { text: 'Annahmen-Tests stehen unter den Lösungen: Mit ihnen bewertet man, welche Lösung Kundenwert so schafft, dass er Geschäftswert treibt.', quelle: `${TORRES}, S. 27` },
    ],
    geschichte: {
      text: 'Torres erzählt ein Beispiel aus dem Streaming: Eine Kundin sagt im Interview „Ich wünschte, ich könnte Werbung vorspulen.“ Das klingt nach Chance, ist aber eine Lösung – es gibt genau einen Weg, sie umzusetzen: Vorspulen anbieten. Dahinter steckt die eigentliche Chance: „Ich mag keine Werbung.“ Fragt man jetzt „Wie könnten wir das angehen?“, gibt es mehrere Antworten: unterhaltsamere Werbung, wie man sie beim Super Bowl sieht, Vorspulen, wie vorgeschlagen, oder ein Abo ohne Werbung. Erst die Umformulierung öffnet den Lösungsraum.',
      quelle: `${TORRES}, S. 94–95`,
    },
    fragen: [
      { frage: 'Was, wenn die Kundschaft selbst eine Lösung vorschlägt?', antwort: 'Aufschreiben und nachfragen, wofür sie das bräuchte. Die Antwort ist die Chance; die vorgeschlagene Lösung kommt als eine von mehreren darunter.' },
      { frage: 'Sind Annahmen-Tests dasselbe wie Experimente?', antwort: 'Ja, auf dieser Ebene ja: kleine Tests einer Annahme, von der eine Lösung abhängt – nicht der Test der ganzen Idee. Ausführlich an Tag 3.' },
    ],
  },

  'baum-kaffeebar': {
    live: [
      'Auf die Wurzel zeigen: Pendler*innen mit Kaffee im Zug – heute dran.',
      '„Die Chancen der Kaffeebar zeigen nur die Form – eure kommen erst aus echten Interviews.“',
      '„An Tag 2 werden die Momente eurer Experience Map die oberste Ebene unter dem Outcome.“',
      'Zeit: 09:40 Toast.',
    ],
    verstaendnis: {
      frage: 'Ist ‚Ich will per App vorbestellen‘ eine Chance oder eine Lösung – und woran erkennt ihr das?',
      antwort: 'Eine Lösung in Verkleidung: Es gibt nur einen Weg, sie umzusetzen. Die Chance dahinter wäre etwa „Wenn ich anstehe, verpasse ich meinen Zug“, die App, Express-Theke und Kaffeewagen zulässt.',
      falsch: '„Eine Chance, weil die Kundschaft es so sagt“ – Kund*innen äußern oft Lösungswünsche; der Prüfstein ist, ob es mehr als eine Lösung gibt.',
    },
    ueberleitung: 'Bevor wir eure Wurzel schreiben, ein Warm-up: Wie macht man Toast?',
    kern: [
      { text: 'Die Wurzel des Baums ist das gewünschte Outcome – der Geschäftsbedarf, über den das Team Wert für das Unternehmen schafft.', quelle: `${TORRES}, S. 26` },
      { text: 'Die oberste Ebene der Chancen lässt sich oft direkt aus den Knoten der Experience Map ableiten: unterschiedliche Momente im Erleben der Kundschaft, damit sich Äste nicht überschneiden.', quelle: `${TORRES}, S. 86` },
      { text: 'Der Baum ist kein Einmal-Artefakt: Experience Map und Chancenraum entwickeln sich weiter, je mehr man über die Kundschaft lernt.', quelle: `${TORRES}, S. 49` },
    ],
    fragen: [
      { frage: 'Woher stammen die Chancen der Kaffeebar, wenn noch niemand interviewt wurde?', antwort: 'Sie sind ein Beispiel für die Form. Bei euch steht heute nur das Outcome; Chancen kommen erst aus echten Interviews in den Baum.' },
    ],
  },

  'toast': {
    live: [
      'Blatt und dicken Stift verteilen, Timer starten.',
      'Aufgabe nur einmal sagen, keine Beispiele geben.',
      'Rückfragen wie „Toaster oder Pfanne?“ nicht beantworten.',
      '„Ihr könnt nicht zeichnen? Kästchen, Pfeile und Strichmännchen reichen völlig.“',
      'Danach Blätter nebeneinander, Video per Knopf öffnen (sonst 10:15).',
    ],
    ueberleitung: 'Zeichnungen nebeneinander: Was fällt euch auf?',
    uebung: { dauer: '3 min Zeichnen, danach Video (TED, ca. 9 min)', form: 'allein, ohne zu reden' },
    ablauf: {
      schritte: [
        'Aufgabe nur einmal sagen: „Zeichnet, wie man Toast macht.“ Keine Beispiele geben.',
        'Timer 3 min; währenddessen nichts kommentieren.',
        'Die drei Blätter nebeneinander legen oder hochhalten lassen.',
        'Video von Tom Wujec zeigen: Auflösung per Knopf auf dem Beamer öffnen (sie öffnet sich sonst erst automatisch um 10:15).',
      ],
      achten: [
        'Rückfragen („Toaster oder Pfanne?“) nicht beantworten – genau die Unterschiede sind die Pointe.',
        'Niemand redet beim Zeichnen; niemand schaut beim Nachbarn ab.',
        'Blätter aufheben: Sie sind gleich das Material für „Was der Toast zeigt“.',
      ],
      fehler: [
        'Ein Satz statt einer Zeichnung – freundlich auf Bilder hinweisen.',
        'Die Pointe vorwegnehmen, bevor gezeichnet ist.',
      ],
      aufloesung: 'Video: Tom Wujec, „Got a wicked problem? First, tell me how you make toast“, TED 2013 (9 min). Öffnet sich zusammen mit der Auflösung der nächsten Folie (gleiche Gruppe).',
    },
    kern: [
      { text: 'Wujec hat Tausende Menschen zeichnen lassen, wie man Toast macht (TED-Beschreibung). Seine Beobachtung: Zeichnungen bestehen aus Knoten und Verbindungen, und diese Kombination macht private mentale Modelle sichtbar. Gruppenmodelle, die aus mehreren Einzelzeichnungen zusammengesetzt werden, sind klarer als die einzelnen.', quelle: 'Tom Wujec, TED 2013, https://www.ted.com/talks/tom_wujec_got_a_wicked_problem_first_tell_me_how_you_make_toast (paraphrasiert)' },
    ],
    fragen: [
      { frage: 'Was hat Toast mit unserem Produkt zu tun?', antwort: 'Gleich nach dem Video: Ihr zeichnet mit denselben Regeln, wie eure Zielgruppe ihr Problem heute löst – die Experience Map.' },
    ],
  },

  'toast-aufloesung': {
    live: [
      'Erst fragen und sammeln, dann die drei Punkte aufdecken.',
      '„Wo fängt eure Zeichnung an – in der Küche, im Supermarkt oder auf dem Feld?“',
      '„Welches Modell ist das richtige? Keines allein – zusammengeführt entsteht ein reicheres Bild als jedes einzelne.“',
      'Brücke schlagen: Torres nutzt dieselben Wörter, Knoten und Verbindungen.',
    ],
    verstaendnis: {
      frage: 'Warum genau ein Knoten pro Sticky?',
      antwort: 'Damit sich die Modelle verschieben und mehrere Einzelzeichnungen zu einem gemeinsamen, reicheren Bild zusammenführen lassen.',
      falsch: '„Damit es ordentlich aussieht“ – es geht nicht um Ordnung, sondern darum, Knoten neu anordnen und ähnliche zusammenlegen zu können.',
    },
    ueberleitung: 'Jetzt dasselbe für euer Produkt: Wie löst eure Zielgruppe ihr Problem heute?',
    kern: [
      { text: 'Torres verwendet dieselbe Sprache: Beim Zusammenführen werden die einzelnen Maps in Knoten (ein Moment, eine Handlung, ein Ereignis) und Verbindungen zerlegt, ähnliche Knoten zusammengelegt, ohne wichtige Details wegzugeneralisieren, und Pfeile zeigen den Fluss – inklusive Schleifen, Wiederholungen und Abbrüche.', quelle: `${TORRES}, S. 56` },
      { text: 'Sprache ist ungenau: Zwei Menschen können glauben, sich einig zu sein, und doch Verschiedenes meinen. Zeichnen zwingt dazu, konkret zu werden.', quelle: `${TORRES}, S. 55` },
      { text: 'Nach Wujec: Ausdrücken, reflektieren, analysieren in schnellen Runden bringt Klarheit; Modelle mehrerer Menschen zusammengeführt sind besser als jedes einzelne.', quelle: 'Tom Wujec, TED 2013 (paraphrasiert)' },
    ],
    ablauf: {
      aufloesung: 'Jede*r hat ein anderes Modell im Kopf – sichtbar wird es erst gezeichnet. Knoten und Verbindungen; kein Bild ist falsch (Küche vs. Feld); ein Knoten pro Sticky, damit Modelle verschoben und zusammengeführt werden können. Handout: Toast-Modell 1 (Brot, Toaster, Butter, essen) und Modell 2 (Feld, Bäckerei, Supermarkt, Toaster).',
    },
    fragen: [
      { frage: 'Welches Modell ist denn das richtige?', antwort: 'Keines allein. Jedes zeigt einen anderen Ausschnitt; zusammengeführt entsteht ein reicheres Bild als jedes einzelne.' },
    ],
  },

  'toast-uebertrag': {
    live: [
      'Alle zu mir holen auf T1 · 1, Kaffeebar-Map links zeigen.',
      'Falle: Klickpfad durch die eigene App statt heutiges Erleben.',
      'Nach dem Timer reihum zeigen: nachfragen, nicht verteidigen.',
      '„Jede Verbindung mit Fragezeichen nehmt ihr nach der Mittagspause mit in die Annahmen-Map.“',
      'Bei Protest gegen Alleinzeichnen: Antrags-Trio von Torres erzählen.',
    ],
    ueberleitung: 'Damit habt ihr gezeichnet, was Menschen heute tun – jetzt: Woran messt ihr, ob sie es nach eurem Produkt anders tun?',
    uebung: { dauer: '6 min', form: 'allein, ohne zu reden; danach reihum zeigen' },
    miro: {
      frame: 'T1 · 1 · Experience Map',
      schritte: [
        '„Alle zu mir holen“ auf T1 · 1 und kurz die Kaffeebar links zeigen: sechs Knoten von „Ankunft am Bahnhof, 7:31“ bis „Im Zug, mit oder ohne Kaffee“, ein Abzweig mit „ja“ und „nein“ an „Reicht die Zeit bis 7:42?“ und ein „?“ an der Verbindung vom Automaten in den Zug.',
        'Jede*r geht in die eigene Spalte „Produkt von: …“, in die Fläche „Heute, aus Sicht der Kundschaft“.',
        'Ein Knoten pro gelbem Sticky, wenige Wörter. Das nächste Sticky mit Cmd+D bzw. Strg+D kopieren.',
        'Pfeile mit dem Verbindungswerkzeug von Sticky zu Sticky. Abzweige beschriften wie bei der Kaffeebar, unsichere Verbindungen mit „?“.',
        'Nach dem Timer „Alle zu mir holen“ und Spalte für Spalte durchgehen. Die Map bleibt auf dem Board; die Verbindungen mit „?“ holt ihr nach der Mittagspause in T1 · 3.',
      ],
    },
    ablauf: {
      schritte: [
        'Rahmen kurz setzen: Jede*r zeichnet für das eigene Produkt, wie die Zielgruppe das Problem heute löst.',
        'Timer 6 min; Miro-Frame T1 · 1, eigene Spalte neben der Kaffeebar.',
        'Reihum: jede*r zeigt die Map, die anderen beiden fragen nach, ohne zu bewerten.',
        'Die „?“ markieren lassen – sie wandern nachmittags in die Annahmen-Map.',
      ],
      achten: [
        'Knoten sind Momente im Erleben der Kundschaft, keine Screens des eigenen Produkts.',
        'Auch Abbrüche, Schleifen und Umwege zeichnen, nicht nur den glatten Weg.',
        'Beim Zeigen: Wer präsentiert, erklärt nur und verteidigt nicht; die anderen achten auf Unterschiede.',
      ],
      fehler: [
        'Ein Klickpfad durch die eigene App statt des heutigen Erlebens (Torres S. 54).',
        'Ganze Sätze auf Stickies statt Kästchen, Pfeile, Strichmännchen (Torres S. 57).',
        'Nur der Happy Path ohne Abbrüche (Torres S. 56).',
        'Die Map als Wahrheit behandeln statt als ersten Entwurf (Torres S. 57).',
      ],
    },
    kern: [
      { text: 'Umfang vom Outcome her setzen: nicht alles über die Kundschaft, sondern eine Leitfrage. Zu breit („Wie unterhalten sich Menschen?“) überfordert, zu eng („…mit unserem Dienst?“) schneidet Inspiration ab; „Wie unterhalten sich Menschen mit Videos?“ ist ein Mittelweg. Es gibt nicht den einen richtigen Umfang.', quelle: `${TORRES}, S. 52–53` },
      { text: 'Erst allein, um Gruppendenken zu vermeiden: In Gruppen strengen sich manche weniger an, manche halten sich zurück, und Gruppen bleiben oft auf dem Niveau des schwächsten Mitglieds. Das fühlt sich ineffizient an, ist aber der einfachste Weg zu mehreren Perspektiven.', quelle: `${TORRES}, S. 53` },
      { text: 'Visuell, nicht verbal: Zeichnen externalisiert Denken und macht Lücken sichtbar. Kästchen, Pfeile, Strichmännchen genügen; es geht nicht um Kunst.', quelle: `${TORRES}, S. 53–54` },
      { text: 'Nicht das Produkt zeichnen, sondern das Erleben der Kundschaft: wo sie hängen bleiben, was schiefgeht, wie sie umsteuern, wo sie aufgeben.', quelle: `${TORRES}, S. 54` },
      { text: 'Perspektiven teilen: reihum zeigen, nachfragen, auf Unterschiede achten, neugierig sein; die eigene Zeichnung nicht verteidigen. Danach zu einer gemeinsamen Map zusammenführen, statt die „beste“ auszuwählen. Antipatterns: endlose Debatten (lieber zeichnen), Wörter statt Bilder, Map als Wahrheit, Map nicht weiterentwickeln.', quelle: `${TORRES}, S. 55–57` },
    ],
    geschichte: {
      text: 'Torres coachte ein neues Produkt-Trio mit dem Outcome, mehr Antragsabschlüsse zu erreichen – viele Kund*innen brachen einen langen Antrag ab. Alle drei hatten eigene Vermutungen. Statt im Raum zu diskutieren, zeichnete jede*r zuerst allein; das war unbequem, weil dem Designer Kontext fehlte, die Person aus der Entwicklung kaum Kundenkontakt hatte und die Produktmanagement-Person nur Ahnungen ohne Daten. Beim Vergleich zeigte sich: Das Produktmanagement kannte die bekannten Beschwerden aus Callcenter und Tickets; der Designer, neu im Unternehmen, sah den Prozess von außen und fing Verwirrung und Unsicherheit der Kundschaft ein; die Entwicklung bildete den Ablauf genau ab und zeigte, wie ein falsch ausgefüllter früher Schritt später alles entgleisen lässt. Zusammengeführt ergab das eine reichere Map als jede einzelne – mit Vermutungen, offenen Fragen und dem, was sie in den nächsten Interviews prüfen mussten.',
      quelle: `${TORRES}, S. 50–51`,
    },
    fragen: [
      { frage: 'Was, wenn ich die Zielgruppe noch gar nicht gut kenne?', antwort: 'Genau dann zeichnen: Die Map ist eine Bestandsaufnahme dessen, was ihr zu wissen glaubt. Lücken und „?“ sind das Ergebnis – sie sagen euch, was ihr in den Interviews fragt.' },
      { frage: 'Sollen wir unsere drei Maps zu einer zusammenführen?', antwort: 'Bei Torres ja, wenn ein Trio am selben Produkt arbeitet. Hier hat jede*r ein eigenes Produkt: Die anderen beiden helfen durch Nachfragen, die Map bleibt bei der Product Ownerin bzw. dem Product Owner.' },
    ],
  },

  'outcome': {
    live: [
      'Fragen: Woran merkt ein Team, dass sich eine Funktion gelohnt hat?',
      'Seiden zitieren: Outcome ist Verhaltensänderung, die Geschäftsergebnisse antreibt.',
      'Kursbewertungs-Geschichte erzählen: nach der Wirkung des Outcomes fragen.',
      '„Ein fester Feature-Fahrplan täuscht Gewissheit vor; ein Outcome sagt ehrlich: Wir wissen noch nicht, wie.“',
      'Falle: „App launchen“ ist Output, kein Outcome.',
    ],
    ueberleitung: 'Outcome ist nicht gleich Outcome – Torres unterscheidet drei Arten von Zielen.',
    kern: [
      { text: 'Motto des Kapitels, wörtlich geprüft: „An outcome is a change in human behavior that drives business results.“ (Josh Seiden, Outcomes Over Output).', quelle: `${TORRES}, S. 37` },
      { text: 'Vom Output- zum Outcome-Denken: Statt Features (Outputs) zählt deren Wirkung auf Kundschaft und Unternehmen (Outcomes). Mit einem Outcome sagt das Unternehmen, welchen Wert das Team schaffen soll, und lässt ihm den Spielraum, die besten Outputs zu finden.', quelle: `${TORRES}, S. 23` },
      { text: 'Fester Fahrplan kommuniziert falsche Gewissheit; ein Outcome kommuniziert Unsicherheit („Wir müssen dieses Problem lösen, wissen aber nicht, wie am besten“) und erlaubt, Ideen zu verwerfen und umzuschwenken. Ein klares Outcome sagt auch, woran Erfolg gemessen wird; ohne es wird Discovery endlos und frustrierend.', quelle: `${TORRES}, S. 39` },
      { text: 'Antipattern „Output als Outcome“: „Android-App launchen“ statt „mobile Nutzung steigern“, „Feature-Parität auf dem neuen Tech-Stack“ statt „Kundschaft auf den neuen Stack bringen“. Tipp: Das Outcome sollte eine Zahl sein, auch wenn man noch nicht weiß, wie man sie misst – und man sollte nach der Wirkung fragen.', quelle: `${TORRES}, S. 47–48` },
    ],
    geschichte: {
      text: 'Torres arbeitete mit einem Team, das Studierenden bei der Kurswahl hilft. Sein Outcome: „Mehr Kursbewertungen auf der Plattform“. Auf die Frage, was mehr Bewertungen bewirken, kam: „Mehr Studierende sehen Kurse mit Bewertungen.“ Das stimmt aber nicht unbedingt – wenn sich die Bewertungen auf wenige Kurse ballen oder auf Kurse, die niemand ansieht, ändert sich nichts. Besser war: „Mehr Kursaufrufe, die Bewertungen enthalten.“ Die Lehre: Ein Outcome wird zum echten Outcome, indem man nach seiner Wirkung fragt.',
      quelle: `${TORRES}, S. 48`,
    },
    fragen: [
      { frage: 'Ist „App veröffentlichen“ nicht auch ein Ziel?', antwort: 'Ein Output. Fragt: Was tun Menschen anders, wenn es die App gibt? Das ist das Outcome – und vielleicht erreicht ihr es ganz ohne App.' },
      { frage: 'Brauchen wir für das Outcome schon eine Zahl?', antwort: 'Torres rät, das Outcome als Zahl zu denken, auch wenn die Messung noch offen ist (S. 48). Die Zielhöhe kommt später – siehe Lernziel auf der übernächsten Folie.' },
    ],
  },

  'outcome-arten': {
    live: [
      'tails.com erzählen: 90 Tage warten, Interviews zeigen zwei Kündigungsgründe.',
      '„Ein Product Outcome könnt ihr sofort messen und selbst beeinflussen – darum steht es an der Wurzel eures Baums.“',
      '„Will den Umstellungskalender niemand, steckt ein Team mit dieser Traction Metric fest.“',
      'Nachfrage erwarten: Traction Metric passt nur beim Optimieren bewährter Lösungen.',
    ],
    ueberleitung: 'Dieselben drei Arten bei der Kaffeebar – und warum ein neues Outcome mit einem Lernziel beginnt.',
    kern: [
      { text: 'Business Outcome misst, wie gut das Geschäft vorankommt; Product Outcome, wie gut das Produkt das Geschäft voranbringt; Traction Metric die Nutzung einer bestimmten Funktion oder eines Ablaufs.', quelle: `${TORRES}, S. 40` },
      { text: 'Business Outcomes sind oft nachlaufende Indikatoren: Sie messen, was schon passiert ist, und versetzen Teams in den Reaktionsmodus. Besser sind vorlaufende Indikatoren, die die Richtung vorhersagen.', quelle: `${TORRES}, S. 40` },
      { text: 'Product Outcomes liegen per Definition im Einflussbereich des Teams; Business Outcomes verlangen Abstimmung über viele Bereiche (bei tails.com auch Support-Zeiten und Preiserhöhungen nach der Probephase). Ein eigenes Product Outcome stärkt Verantwortung – bei geteiltem Ziel schiebt man leicht die Schuld weiter.', quelle: `${TORRES}, S. 40–41` },
      { text: 'Traction Metrics engen ein: Wer die Nutzung des Umstellungskalenders misst, setzt voraus, dass der Kalender der richtige Output ist. Sinnvoll nur in zwei Fällen: für junge, unerfahrene Teams (Optimierung als Übung) und zum Optimieren einer bewährten Lösung in einem reifen Produkt – nicht, wenn neue Lösungen entdeckt werden sollen.', quelle: `${TORRES}, S. 41–42` },
    ],
    geschichte: {
      text: 'Sonja Martin war Produktmanagerin bei tails.com, einem Abo-Dienst für maßgeschneidertes Hundefutter. Ihr Team sollte die Kundenbindung verbessern, gemessen nach 90 Tagen. Das Problem: Auf die Wirkung jeder Änderung mussten sie 90 Tage warten. Sie wechselten auf 30 Tage – immer noch zu lang –, dann auf 5 Tage, waren aber unsicher, ob 5 Tage überhaupt etwas über die langfristige Bindung sagen. Die Wende kam aus Interviews: Manche verstanden den Wert des maßgeschneiderten Futters nicht, und manchen Hunden schmeckte es schlicht nicht. Daraus machte das Team zwei Product Outcomes – wahrgenommenen Wert steigern und mehr Hunde, die das Futter mögen –, die es sofort messen konnte und von denen es annahm, dass sie die Bindung treiben.',
      quelle: `${TORRES}, S. 37–38`,
    },
    fragen: [
      { frage: 'Ist eine Traction Metric immer schlecht?', antwort: 'Nein. Für die Optimierung einer Lösung, von der man schon weiß, dass die Kundschaft sie nutzt, ist sie passend (Torres S. 42). Für Discovery – also für euch – nicht.' },
      { frage: 'Woher weiß man, dass das Product Outcome das Business Outcome treibt?', antwort: 'Anfangs ist das eine Annahme. tails.com „glaubte“, dass beide Product Outcomes die Bindung treiben (S. 38); Teams müssen diesen Zusammenhang oft erst durch Discovery herausfinden.' },
    ],
  },

  'outcome-kaffeebar': {
    live: [
      'Zuerst verdeckt fragen: Welche Zeile taugt als Wurzel?',
      '„Mit Kaffee in den Zug ist keine Lösung – es beschreibt Verhalten und lässt App, Express-Theke oder Kaffeewagen offen.“',
      '„Bei komplexen Aufgaben schneiden Teams mit Lernziel besser ab als Teams, die sofort eine schwierige Zahl erreichen sollen.“',
      'Ausblick: Schwellen wie „4 von 5“ kommen auf die Experiment-Karte.',
    ],
    ueberleitung: 'Das Outcome hat noch eine zweite Aufgabe: Es filtert, was überhaupt in den Baum kommt.',
    kern: [
      { text: 'Forschung zu Zielen: Spezifische, herausfordernde Ziele wirken bei einfachen Aufgaben. Bei komplexen Aufgaben können sie die Leistung senken, wenn das Team noch keine Strategie hat; dort war „gebt euer Bestes“ besser, und ein anfängliches Lernziel („die Strategien entdecken, die funktionieren könnten“) wirksamer als ein Leistungsziel.', quelle: `${TORRES}, S. 44` },
      { text: 'Daraus: Bei einem neuen Outcome erst ein Lernziel („die Chancen entdecken, die Nutzung treiben“), dann ein Leistungsziel („Nutzung um 10 % steigern“). S.M.A.R.T.-Ziele passen für Teams, die ihr Outcome schon kennen; man darf mit einem Lernziel starten und sich dorthin vorarbeiten.', quelle: `${TORRES}, S. 44–45` },
      { text: 'Wer ein Outcome zum ersten Mal bekommt, braucht Zeit zu lernen, was die Zahl bewegt. Jedes Mal, wenn man das Team umbaut oder das Outcome wechselt, zahlt man eine „Lernsteuer“.', quelle: `${TORRES}, S. 43` },
      { text: 'Antipatterns: zu viele Outcomes gleichzeitig, Ping-Pong von Quartal zu Quartal, individuelle statt Team-Ziele. Meist wirkt ein Outcome zur Zeit am stärksten.', quelle: `${TORRES}, S. 47` },
    ],
    fragen: [
      { frage: 'Ist ein Lernziel nicht zu weich für eine Bewertung?', antwort: 'Es ist der ehrliche Start bei einem neuen Outcome (Torres S. 44). Die messbare Schwelle – etwa „4 von 5“ – kommt auf die Experiment-Karte, sobald ihr wisst, was ihr testet.' },
      { frage: 'Ist „mit Kaffee in den Zug“ nicht auch schon eine Lösung?', antwort: 'Nein, es beschreibt Verhalten und lässt viele Lösungen offen: App, Express-Theke, Kaffeewagen, Wartezeit-Anzeige.' },
    ],
  },

  'outcome-filter': {
    live: [
      'Wells Fargo erzählen: Konten ohne Wissen der Kundschaft, Klagen in Milliardenhöhe.',
      'Fragen: Was tun mit Funden, die nicht zum Outcome passen?',
      '„Wells Fargo hatte das richtige Ziel, aber keinen Blick auf die Kundschaft – darum führt ihr ein Gegengewicht mit.“',
      '„Ein Vorbestell-Weg könnte die Schlange für alle anderen verlängern – genau das misst euer Gegengewicht.“',
    ],
    ueberleitung: 'Vom Ziel zum Bauen: Wie klein darf euer erster Schritt sein, damit ihr schon etwas lernt?',
    kern: [
      { text: 'Der Baum löst die Spannung zwischen Geschäft und Kundschaft: zuerst das Geschäftsziel, dann nur die Chancen, die dieses Ziel treiben können. Outcome und Chancenraum begrenzen die Lösungen – das schützt vor dem Schicksal von Wells Fargo.', quelle: `${TORRES}, S. 27–28` },
      { text: 'Rahmung entscheidet: Wells Fargo hatte das Problem (ob ausgesprochen oder nicht) als „Konten um jeden Preis steigern“ gerahmt – das öffnete dem Betrug die Tür. „Kundschaft schaffen, die mehr Konten eröffnen will“ hätte Betrug unwahrscheinlicher gemacht.', quelle: `${TORRES}, S. 24` },
      { text: 'Antipattern „ein Outcome auf Kosten von allem anderen“: Neben dem Hauptziel Gesundheitsmetriken beobachten, z. B. Kundengewinnung zusammen mit Kundenzufriedenheit – Ziel ist, die eine zu steigern, ohne die andere zu verschlechtern.', quelle: `${TORRES}, S. 48` },
      { text: 'Drucker: Aufgabe eines Unternehmens ist, Bedürfnisse der Gesellschaft in profitable Geschäftschancen zu verwandeln – Kundschaft zu dienen ist der Weg zum Gewinn, kein Gegensatz.', quelle: `${TORRES}, S. 21–22` },
    ],
    geschichte: {
      text: '2016 deckten mehrere Aufsichtsbehörden Betrug bei der US-Bank Wells Fargo auf: Bankangestellte hatten ohne Wissen der Kundschaft Giro-, Spar- und Kreditkartenkonten eröffnet. Zuerst schob die Bank es auf einzelne Filialmitarbeitende. Bei genauerem Hinsehen zeigte sich: Die Führung setzte die Mitarbeitenden massiv unter Druck, die durchschnittliche Zahl der Konten pro Kunde zu erhöhen – die bekannte Cross-Selling-Strategie war immer aggressiver geworden, mit unerreichbaren Quoten und lukrativen Prämien. Die Folge laut Torres: 185 Millionen Dollar Strafe vom Consumer Financial Protection Bureau und Klagen in Milliardenhöhe. Torres liest das so: Das Outcome war richtig gewählt, aber ohne den Blick auf die Kundschaft.',
      quelle: `${TORRES}, S. 21–22`,
    },
    zusatz: [
      { titel: 'Wells Fargo: 3 Milliarden Dollar Vergleich 2020', text: 'Am 21. Februar 2020 einigte sich Wells Fargo mit dem US-Justizministerium und der SEC auf 3 Milliarden Dollar, um die strafrechtlichen und zivilrechtlichen Ermittlungen zu den Verkaufspraktiken beizulegen. Die Bank räumte ein, dass ihr Privatkundengeschäft Mitarbeitende unter Druck setzte, große Mengen Produkte an bestehende Kundschaft zu verkaufen, oft ohne Rücksicht auf deren Bedarf. Für 2002 bis 2016 wurden u. a. Konten ohne Zustimmung eröffnet, Unterschriften gefälscht und Kontaktdaten geändert, damit Kund*innen nichts merkten. Laut der Mitteilung wussten die obersten Führungskräfte der Community Bank, des Privatkundengeschäfts, schon 2002 von diesen Praktiken.', quelle: 'US Department of Justice, Pressemitteilung vom 21.02.2020, https://www.justice.gov/usao-cdca/pr/wells-fargo-agrees-pay-3-billion-resolve-criminal-and-civil-investigations-sales (gespiegelt: https://fdicoig.gov/news/investigations-press-releases/wells-fargo-agrees-pay-3-billion-resolve-criminal-and-civil)' },
    ],
    fragen: [
      { frage: 'Was machen wir mit Interview-Funden, die nicht zum Outcome passen?', antwort: 'Notieren, aber nicht in den Baum. Sie können für ein anderes Outcome wertvoll sein; im Baum lenken sie ab.' },
      { frage: 'Warum ein Gegengewicht bei der Kaffeebar?', antwort: 'Ein Vorbestell-Weg könnte die Schlange für alle anderen verlängern. Die Gesundheitsmetrik sorgt dafür, dass ihr das Outcome nicht auf Kosten anderer Kundschaft erreicht (Torres S. 48).' },
    ],
  },

  'skateboard': {
    live: [
      'Bild zeigen, fragen: Wer ist oben nach Schritt eins zufrieden?',
      'Lego Universe gegen Minecraft erzählen: Jahre ohne Skateboard, sechs Tage mit.',
      '„Kniberg sagt lieber ‚früh‘ als ‚minimal‘: Kaum jemand will minimal, aber fast alle wollen früh.“',
      'Busticket erwähnen: manchmal geht es noch früher als ein Skateboard.',
      'Falle: MVP als „Minimum Releasable Crap“ missverstehen.',
    ],
    ueberleitung: 'Was ist das Skateboard der Kaffeebar?',
    kern: [
      { text: 'Die obere Reihe ist für Kniberg „bastardized agile“: in Schritten geliefert, aber ohne Rückkopplung – Big-Bang-Lieferung in Etappen. Unten ist jede Stufe benutzbar; die Kundin ist anfangs kaum zufrieden, aber das Team lernt mit jeder Stufe.', quelle: KNIBERG },
      { text: 'Begriffe statt MVP: Earliest Testable Product (die erste Version, mit der Kundschaft tatsächlich etwas tun kann), Earliest Usable Product (die erste, die frühe Nutzer*innen freiwillig nutzen), Earliest Lovable Product (die erste, die sie lieben, weiterempfehlen und bezahlen würden). Begründung: Kaum jemand will „minimal“, aber fast alle wollen „früh“.', quelle: KNIBERG },
      { text: 'Schlüsselfrage, wörtlich: „What is the cheapest and fastest way we can start learning?“ Davor die Frage: Geht es noch früher als ein Skateboard – etwa ein Busticket? Vielleicht, vielleicht nicht, aber man lernt etwas, wenn man es echten Nutzer*innen in die Hand gibt.', quelle: KNIBERG },
      { text: 'Spotify (bei Kniberg): erste Version völlig unpoliert, fast keine Funktionen außer dem Abspielen einiger fest eingebauter Songs, ohne Lizenzen und Geschäftsmodell. Erst intern, dann Freunden und Familie gegeben, um zu prüfen, ob sofortiges, flüssiges Streaming technisch möglich ist und ob es Menschen begeistert. Messgröße war, wie viele Millisekunden vom Drücken auf Play bis zur Musik vergehen.', quelle: KNIBERG },
    ],
    geschichte: {
      text: 'Kniberg erzählt zwei Gegenbeispiele. Lego Universe: ein Online-Spiel, an dem laut Kniberg rund 250 Menschen vier bis fünf Jahre arbeiteten. Das fertige Spiel war schön, aber nicht so unterhaltsam wie erwartet, und wurde nach etwa zwei Jahren eingestellt – Knibergs Fazit: „There was no skateboard!“ Minecraft dagegen: Die erste öffentliche Version entstand laut Kniberg nach sechs Tagen Programmieren durch eine einzige Person; genau diese Version nennt er das Skateboard.',
      quelle: `${KNIBERG} (Abschnitte zu Lego und Minecraft; Zahlen nach Kniberg)`,
    },
    fragen: [
      { frage: 'Ist ein MVP nicht einfach eine schlechte erste Version?', antwort: 'Kniberg warnt genau davor („Minimum Releasable Crap“). Ein Skateboard ist klein, aber es erfüllt den Zweck – von A nach B – und bringt echte Rückmeldung.' },
      { frage: 'Was ist bei einer Software-Idee das „Busticket“?', antwort: 'Etwas, das das Bedürfnis ohne eigenes Produkt bedient, z. B. ein vorhandenes Werkzeug oder ein Ablauf von Hand. Ihr lernt, ob das Bedürfnis trägt, bevor ihr baut.' },
    ],
  },

  'mvp': {
    live: [
      'Erst nur obere Reihe zeigen, fragen: Wann lernen wir hier etwas?',
      '„Ein Schild ist ein Test, kein Produkt: Nach einer Woche wisst ihr, was sonst erst die App zeigt.“',
      '„Kommt in einer Woche keine WhatsApp-Bestellung, braucht es die App nicht.“',
      'Fragen: Was wäre das Schild für das eigene Produkt?',
      'Bei Bedarf: Zappos, Schuhe fotografiert statt eingelagert.',
    ],
    ueberleitung: 'Zum Schluss des Vormittags: wie Design Thinking typischerweise schiefgeht.',
    kern: [
      { text: 'Knibergs Frage auf die Kaffeebar übertragen: Der billigste, schnellste Weg, mit dem Lernen anzufangen, ist ein Schild an der Theke – die Kursübertragung, nicht Knibergs eigenes Beispiel.', quelle: KNIBERG },
      { text: 'Jede Stufe beantwortet eine eigene Frage: will jemand vorbestellen? → was und wann? → wie oft? Damit passt das MVP zum Test im Baum („Bestellen 3 von 10 per WhatsApp vor?“).', quelle: 'Kursbeispiel (KAFFEEBAR_BAUM, src/components/innolab-beispiel.ts)' },
    ],
    zusatz: [
      { titel: 'Zappos: Schuhe fotografiert, nicht eingelagert', text: 'Nick Swinmurn, Gründer von Zappos (zuerst Shoesite.com, 1999), testete die Idee, Schuhe online zu verkaufen, ohne Lager: Er fotografierte Schuhe in Geschäften, stellte sie online und kaufte sie bei einer Bestellung zum vollen Preis im Laden ein. Im Interview beschreibt er das Angebot an die Läden so: Er mache Fotos, stelle die Schuhe online, und wenn Leute sie kaufen, kaufe er sie dem Laden zum vollen Preis ab. Das ist ein Skateboard im Sinne von Kniberg: Es prüft, ob Menschen Schuhe online kaufen, bevor Lager und Logistik gebaut werden.', quelle: 'Fortune, „Nick Swinmurn: Zappos’ silent founder“, 05.09.2012, https://fortune.com/2012/09/05/nick-swinmurn-zappos-silent-founder' },
    ],
    fragen: [
      { frage: 'Ist ein WhatsApp-Schild nicht unprofessionell?', antwort: 'Es ist ein Test, kein Produkt. Es beantwortet in einer Woche die Frage, die sonst erst die fertige App beantworten würde.' },
      { frage: 'Muss unser Prototyp am Ende eine App sein?', antwort: 'Er muss eine kleine Chance wirklich lösen und benutzbar sein. Wie viel davon Software ist, entscheidet die Annahme, die ihr prüft.' },
    ],
  },

  'schiefgehen': {
    live: [
      'Patton-Geschichte erzählen: agil, planbar – und trotzdem kaum Outcome.',
      'Fragen: Welchen Fehler kennt jede*r aus dem Coding-Projekt?',
      '„Patton ist für Design Thinking – er kritisiert, wie es oft ausgeführt wird, nicht den Prozess.“',
      '„Gegen den ersten Fehler arbeiten wir gleich: Ohne Rahmen weiß niemand, für wen die Lösung gut sein soll.“',
    ],
    verstaendnis: {
      frage: 'Ein Prototyp ‚sieht toll aus‘, alle nicken. Ist er damit getestet?',
      antwort: 'Nein. Ein Test prüft, ob die Lösung das Problem wirklich löst und Menschen ihr Verhalten ändern – also das Outcome, nicht den Eindruck.',
      falsch: '„Ja, positives Feedback ist ein Test“ – Zustimmung zu einem schönen Prototyp sagt nichts darüber, ob ihn jemand benutzt.',
    },
    ueberleitung: 'Was ihr heute noch erarbeitet: die Methoden des Tages auf einen Blick.',
    kern: [
      { text: 'Woher die erste Zeile stammt: Die Schritte von Design Thinking „seem like obviously good ideas. But, in practice, what I and most people tend to do is the exact opposite.“ Und später: „There are some predictable ways that design processes fail. […] It’s not the process.“', quelle: `${PATTON}, Kap. 15, Abschnitte „Empathize, Focus, Ideate, Prototype, Test“ und „How to Mess Up a Good Thing“` },
      { text: 'Design Thinking (IDEO, später d.school): Empathize – hingehen, beobachten, mitarbeiten, nicht nur Daten sammeln; Define – gemeinsam Sinn stiften und bestimmte Menschen und Probleme wählen; Ideate – bewusst mehrere Lösungen; Prototype – einfache Papierprototypen; Test – prüfen, ob die Lösung das Problem wirklich löst, nicht ob Fehler drin sind.', quelle: `${PATTON}, Kap. 15, Abschnitt „Empathize, Focus, Ideate, Prototype, Test“` },
      { text: 'Pattons Liste „How to Mess Up a Good Thing“ (zehn Punkte, der Kurs zeigt fünf – eine Kürzung des Kurses): ohne Rahmen für Geschäftsbedarf und Zielkundschaft starten; endlos recherchieren ohne Timebox; gar nicht mit Menschen reden; nicht auf ein Problem fokussieren; nur „echte“ Designer*innen Ideen beitragen lassen; keine Alternativen betrachten; einen schön aussehenden Prototyp bauen, der nicht benutzbar ist („looks really lovely“); sich selbst überzeugen, dass es klappt; Baukosten ignorieren; nach dem Misserfolg Schuldige suchen.', quelle: `${PATTON}, Kap. 15, Abschnitt „How to Mess Up a Good Thing“` },
      { text: 'Pattons Pointe: Verwechselt Prozess nicht mit Können – es liegt nicht am Prozess. Ein Kernfehler klassischer Designprozesse ist, so lange zu lernen und zu gestalten, dass man an den Lösungen hängt und dann nicht prüft, ob sie das gewünschte Outcome bringen; daher kurze, validierte Lernschleifen (Build-Measure-Learn nach Eric Ries).', quelle: `${PATTON}, Kap. 15, Abschnitte „How to Mess Up a Good Thing“ und „Short Validated Learning Loops“` },
    ],
    geschichte: {
      text: 'Patton erzählt von einem potenziellen Kunden, der ihn bat, beim Einführen von Design Thinking zu helfen. Die Firma arbeitete schon agil und machte das gut: Sie lieferte planbar und in hoher Qualität. Gelernt hatte sie aber, wörtlich: „the faster you deliver crap, the more crap you get.“ Freundlicher gesagt: Zwischen der Menge gebauter Software und Outcome bzw. Impact gab es kaum einen Zusammenhang. Patton dachte zuerst: „Ich bin Designer und denke, also mache ich Design Thinking“ – und lag falsch; gemeint war eine bestimmte Arbeitsweise. Die Geschichte schlägt die Brücke zurück zu „Outcome statt Output“.',
      quelle: `${PATTON}, Kap. 15, Abschnitt „Empathize, Focus, Ideate, Prototype, Test“ (Zitat im EPUB geprüft)`,
    },
    fragen: [
      { frage: 'Ist Design Thinking dann schlecht?', antwort: 'Nein, Patton ist ausdrücklich dafür. Er kritisiert, wie es oft ausgeführt wird: zu lang, ohne Rahmen, mit nur einer Idee, ohne echten Test.' },
      { frage: 'Wo im Innolab steht welche Phase?', antwort: 'Heute Rahmen und Verstehen (Entdecken), Tag 2 Chancen auswählen (Definieren), danach Lösungen und Tests.' },
    ],
  },

  'methoden': {
    live: [
      'Zeit: 11:00 Pause, 11:10 Problem-Rahmen.',
      '„Bis Tag 2 führt ihr fünf echte Interviews; Notizen nur mit Pseudonym, Snapshot auf Miro, Entscheidungslog nachziehen.“',
      'Fragen offen? In den Parkplatz unter „Start hier“.',
      'Toolbox zeigen, falls jemand fragt, welche Methode welches Artefakt liefert.',
    ],
    ueberleitung: 'Ihr habt jetzt Pause bis 11:10, danach legt ihr mit dem Problem-Rahmen und eurem Produkt-Brief los.',
    fragen: [
      { frage: 'Bis wann müssen die fünf Interviews fertig sein?', antwort: 'Bis Tag 2; Details auf der Seite Abschluss & Hausaufgabe (/innolab/tag-1/abschluss).' },
      { frage: 'Wo sehe ich, welche Methode welches Artefakt liefert?', antwort: 'In der Toolbox (/innolab/methoden): jede Methode mit ihrer Frage und dem Artefakt.' },
    ],
  },
};
