import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/experiment (Tag 4, 28.11.: 10:50–11:00 Claude Pro und Claude Code gemeinsam,
// zwei Folien; 11:00–11:30 Experiment-Karte mit Theorie und Beispiel, 18 min Übung). Jede Folie hat eine Notiz
// (begleiter-tag-4.test.ts). Die Origin Story steht seit 26.11. im Abschluss von Tag 4 (tag-4#abschluss), nicht mehr hier.
// Seit 26.11. ohne die Intuit-Folien (Geschichte im Handout von #karte); neu: claude-code-opus, schritte-der-idee,
// ergebnis-gilt, test-arten, beispiel-map; gegen-den-beleg steht nach der Lernkarte. Seit dem Nachtrag 26.11. abends
// keine docs-Dateien: Karte E1 und Lernkarten auf Miro, Annahmen in der Werkstatt, Claude immer mit Opus.
// Thomke: gedruckte Seiten aus quellen/thomke/text.txt (=====PAGE n=====); Torres: PDF-Seiten wie in
// quellen/torres/text.txt; Bland: gedruckte Seiten.
const THOMKE = 'Stefan H. Thomke, The Scientific Mindset';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_EXPERIMENT: Record<string, Notiz> = {
  'claude-pro-jetzt': {
    live: [
      'Timer 10 min starten, sobald alle die Folie sehen.',
      'Wer Pro oder Max hat: gleich zu Schritt 3.',
      'Falle: Erstattung statt Kündigung – beendet Pro sofort.',
      'Nach 4 min: Läuft bei allen Claude Code?',
    ],
    uebung: { dauer: '10 min', form: 'alle zugleich, jede*r am eigenen Laptop' },
    ablauf: {
      schritte: [
        'Pro neu abschließen (Monthly, 21,60 €) und gleich kündigen; wer Pro oder Max hat, überspringt beides.',
        'Claude Code im Repo starten und mit demselben Konto anmelden.',
        'Weiterblättern, sobald die Ersten angemeldet sind: Opus und Test.',
      ],
    },
    ueberleitung: 'Claude Code läuft – jetzt noch Opus wählen und kurz testen.',
  },

  'claude-code-opus': {
    live: [
      '„In Claude Code einmal /model opus – überall im Kurs nehmt ihr Opus.“',
      'Test: Screenshot vom eigenen Concept-Story-Frame einfügen, ein Satz.',
      'Nach 8 min: Steht bei allen „Claude Pro“ im Startbild?',
      'Wer hängt: 11:00 trotzdem Theorie, Hilfe vor 11:30.',
    ],
    ablauf: {
      schritte: [
        '/model opus in Claude Code; in der Claude-App Opus im Modellmenü.',
        'Screenshot des Frames „T4 · 0 · Concept Story · Produkt n“ einfügen (Ctrl+V), Prompt „Sag mir in einem Satz …“.',
      ],
      achten: [
        'Keine Versionsnummer nennen – nur „Opus“.',
        'Limit oder kein Opus: /model, das vorgeschlagene Standardmodell wählen, weiter.',
        'Bild kommt nicht an: die Screenshot-Datei ins Terminal ziehen.',
      ],
    },
    ueberleitung: 'Claude Code läuft – jetzt die Annahmen eures Spitzenreiters.',
  },

  'annahmen-der-idee': {
    live: [
      'Zeit: Theorie und Beispiel bis zur Übung, dann 18 min allein.',
      '„Euer Spitzenreiter steht auf Papier – an welcher Annahme hängt er?“',
      'Zwei Fallen: Bestätigung suchen, sich in Investiertes verlieben.',
      'Ergebnis um 11:30 nennen: Karte E1.',
    ],
    verstaendnis: {
      frage: 'Warum testet ihr eine Annahme statt der ganzen Idee?',
      antwort: 'Eine ganze Idee testen heißt sie bauen – das dauert Wochen. Eine Annahme lässt sich in ein, zwei Tagen prüfen (Torres S. 138, 144).',
    },
    kern: [
      {
        text: 'Zwei Fallen: Bestätigungsneigung und „escalation of commitment“ – je mehr investiert, desto mehr hängt man an der Idee. Darum Annahmen testen statt ganzer Ideen.',
        quelle: `${TORRES}, S. 116–117`,
      },
      {
        text: '„Our first test was designed to be completed in a day or two. This test will take up to two weeks“ – „Design your tests to be completed in a day or two, or a week, at most.“',
        quelle: `${TORRES}, S. 138, 144`,
      },
    ],
    ueberleitung: 'Woher kommen die Annahmen? Aus den Schritten eurer Idee.',
  },

  'schritte-der-idee': {
    live: [
      'Abbildung: Torres’ kleine Story Map – drei Beteiligte, sechs Schritte.',
      'Fünf Arten: wünschenswert, bedienbar, machbar, wirtschaftlich, ethisch.',
      'Pre-Mortem vorlesen: gescheitert, nicht „könnte scheitern“.',
      'Bezug: Pre-Mortem kennen alle von Tag 1, als Joker.',
    ],
    verstaendnis: {
      frage: 'Woher kommen die Annahmen, bevor ihr sie mappt?',
      antwort: 'Aus den Schritten, als gäbe es die Lösung schon: Wo ihr annehmt, dass jemand etwas tut, steckt eine Annahme. Dazu das Pre-Mortem und die wirtschaftliche Annahme aus dem Geschäftsmodell.',
      falsch: '„Aus der Value Map“ – dort stehen erste Kandidaten („?“), aber die Schritte decken die meisten auf.',
    },
    kern: [
      {
        text: '„Start by assuming the solution already exists.“ – „From a simple 5-step story map, we generated 20 assumptions.“',
        quelle: `${TORRES}, S. 119, 124`,
      },
      {
        text: 'Beteiligte im Beispiel: „our key players might be the sports consumer (i.e., our subscriber), our streaming platform, and any number of local TV channel partners.“',
        quelle: `${TORRES}, S. 121`,
      },
      {
        text: 'Pre-Mortem: „Imagine it’s six months in the future; your product or initiative launched, and it was a complete failure. What went wrong?“ Entscheidend: als sicheres Scheitern formuliert.',
        quelle: `${TORRES}, S. 125`,
      },
      {
        text: 'Formulierung: „always phrase your assumptions such that you need them to be true: ‚Customers will remember their passwords.‘“',
        quelle: `${TORRES}, S. 131`,
      },
    ],
    zusatz: [
      {
        titel: 'Pre-Mortem nach Gary Klein',
        text: 'Das Team nimmt an, das Projekt sei bereits gescheitert, und sucht die Gründe, statt nur zu fragen, was schiefgehen könnte. Torres zitiert die Methode und die Forschung zu „prospective hindsight“.',
        quelle: 'Gary Klein, „Performing a Project Premortem“, Harvard Business Review, Sept. 2007: https://hbr.org/2007/09/performing-a-project-premortem; vgl. Torres S. 125',
      },
    ],
    ueberleitung: 'Torres macht das für drei Ideen – wir für eine. Warum?',
  },

  spitzenreiter: {
    live: [
      'Torres testet alle drei Ideen parallel – wir den Spitzenreiter.',
      'Kursregel: Abweichung von Torres, weil drei Personen, eine Idee für heute.',
      'Gemeinsame Annahmen zuerst: Scheitern sie, fallen alle drei.',
      'Unter die Karte: je eine Zeile für die anderen Ideen.',
    ],
    kern: [
      {
        text: '„You’ll want to story map, generate assumptions, and assumption map for each of your three ideas.“ – „If we test only one idea at a time, confirmation bias will rear its ugly head.“ – „we are looking for a clear front runner.“',
        quelle: `${TORRES}, S. 130, 134`,
      },
      {
        text: '„It’s common for ideas to share assumptions. It’s one of the reasons why assumption testing is faster than idea testing.“',
        quelle: `${TORRES}, S. 136`,
      },
    ],
    ueberleitung: 'Mit welcher Annahme fangt ihr an? Das zeigt die Map.',
  },

  map: {
    live: [
      '„Die Map kennt ihr von Tag 1 – jetzt mit dem Spitzenreiter von 9:05.“',
      'Vier Felder wie auf Miro: „Zuerst testen“ oben rechts.',
      'Höchstens zehn Minuten: relativ zueinander, nicht genau.',
      'Wege nennen: Miro sortieren, Werkstatt festhalten, Karte E1 auf Miro.',
    ],
    miro: { frame: 'T4 · 0 · Annahmen der Idee', schritte: ['Annahmen der Idee auf die Map: wichtig nach oben, wenig Beleg nach rechts.'] },
    kern: [
      {
        text: '„this exercise does not need to be precise. You are mapping assumptions relative to each other.“ Getestet werden die Annahmen oben rechts – „the assumptions that Bland calls your ‚leap of faith‘ assumptions“.',
        quelle: `${TORRES}, S. 130`,
      },
      {
        text: 'Wichtig heißt: Ist die Hypothese falsch, „your business idea will fail and all other hypotheses become irrelevant.“',
        quelle: `${BLAND}, S. 38`,
      },
      {
        text: 'Reihenfolge nach Bland: erst wünschenswert, dann machbar, dann wirtschaftlich.',
        quelle: `${BLAND}, S. 34–35, 39`,
      },
    ],
    fragen: [
      {
        frage: 'Warum heißt das Feld oben links „Beleg prüfen, darauf bauen“?',
        antwort: 'Dort stehen wichtige Annahmen mit Beleg. Ihr baut auf ihnen auf, schaut aber nach, ob der Beleg wirklich trägt (Feldnamen wie im Miro-Frame).',
      },
    ],
    ueberleitung: 'Für die Annahme oben rechts schreibt ihr eine Karte. So sieht sie aus.',
  },

  karte: {
    live: [
      'Test Card zeigen: vier Zeilen von oben nach unten.',
      'Schwelle als x von y: „16 of the 20 parents“, nicht 80 %.',
      '„Gemessen wird, was Menschen tun – nicht, was sie sagen.“',
      'Bei Bedarf: Intuit erzählen – 0 von 20 gesagt, 58 % geklickt.',
      'Falle: Schwelle erst nach dem Test festlegen.',
    ],
    verstaendnis: {
      frage: 'Warum „mindestens 3 von 10“ statt „30 %“?',
      antwort: 'Weil die Karte so festlegt, mit wie vielen Menschen ihr testet und wie viele das Verhalten zeigen müssen (Torres S. 136). Ein Prozentsatz verschweigt die Zahl der Getesteten.',
    },
    kern: [
      {
        text: 'Vier Teile: Hypothese, Test, Messgröße, Kriterium; Beispiel auf der Karte: „16 of the 20 parents“.',
        quelle: `${BLAND}, S. 44–46`,
      },
      {
        text: '„Instead of saying, ‚Some people choose sports,‘ we want to say, ‚At least 3 out of 10 people choose sports.‘ We want to define both how many people we’ll test with and how many people need to exhibit the behavior“.',
        quelle: `${TORRES}, S. 136`,
      },
      {
        text: 'Intuit (Handout): Usability-Studie „none of the twenty participants was interested in a fast payroll solution“; auf der Webseite wählten „58 percent of new users“ den Knopf „Pay employees first“, bevor es die Funktion gab. Gebaut: Conversion +14 %. „testing customers’ actual behavior was more useful than trusting what they say they would prefer.“',
        quelle: `${THOMKE}, S. 72`,
      },
      {
        text: 'Bland ordnet dasselbe als Achse der Belegstärke: „What people say in an interview or survey is not necessarily what they do in real life or will do in the future.“',
        quelle: `${BLAND}, S. 52`,
      },
    ],
    fragen: [
      {
        frage: 'Ist ein Knopf ohne Funktion nicht Täuschung?',
        antwort: 'Die Seite sagt es sofort: Bei Intuit kam die Meldung, die Funktion sei noch nicht fertig; bei E1 steht „Bestellen geht noch nicht“ auf der Seite, und wer einträgt, erfährt, wann es losgeht. Thomke zitiert die Regel von LinkedIn: keine Tests, die absichtlich eine schlechte Erfahrung liefern, Stimmungen verändern sollen oder Einstellungen übergehen (S. 133).',
      },
    ],
    ueberleitung: 'Und was, wenn das Ergebnis nicht passt? Ein Fall, in dem es trotzdem galt.',
  },

  'ergebnis-gilt': {
    live: [
      'Kohl’s erzählen: viele begeistert, erst ein Test, Umsatz sinkt, gestoppt.',
      '„Gute Ergebnisse glaubt man sofort – schlechte prüft man, bis sie passen.“',
      'Falle: behaupten, Kohl’s habe vorab eine Matrix gehabt.',
      'Brücke: Darum steht die Handlung vorher auf der Karte.',
    ],
    verstaendnis: {
      frage: 'Was hätte bei Kohl’s ohne vereinbarten Test passieren können?',
      antwort: 'Die Begeisterung hätte entschieden: Wer Möbel wollte, hätte einen schlechten Umsatz mit anderen Gründen erklärt. Thomke: Tests braucht es gerade für Vorschläge von Menschen mit „organizational clout“ (S. 87).',
      falsch: '„Der Test hat bewiesen, dass Möbel schlecht sind“ – er hat gezeigt, dass der Umsatz insgesamt sank; entscheidend ist, dass das Ergebnis galt.',
    },
    kern: [
      {
        text: 'Kohl’s: „many executives were tremendously enthusiastic … Nevertheless, the company first agreed to test sales at seventy stores over six months—and the data showed a net decrease in revenue.“ „the initiative was nevertheless scrapped.“',
        quelle: `${THOMKE}, S. 86–87`,
      },
      {
        text: '„we tend to happily accept ‚good‘ results that confirm our beliefs because they feel right. But we challenge and thoroughly investigate ‚bad‘ results that go against our assumptions.“',
        quelle: `${THOMKE}, S. 14`,
      },
      {
        text: '„When results align with our beliefs, we accept them without hesitation; when they don’t, we probe them relentlessly. The remedy is to implement the changes that experiments validate (although there are always exceptions).“',
        quelle: `${THOMKE}, S. 126`,
      },
    ],
    ueberleitung: 'Wie schreibt ihr vorher auf, was ihr dann tut? Mit drei Bändern.',
  },

  'vorher-entscheiden': {
    live: [
      'Setup-Zeile vorlesen: E1, Schwelle 10 von 30.',
      'Bänder aufdecken: erst ab 10, dann unter 5, zuletzt 5–9.',
      'Kursregel: Grenze darunter etwa die halbe Schwelle.',
      'Falle: „knapp darunter“ erst nach dem Test festlegen.',
    ],
    verstaendnis: {
      frage: 'E1 der Kaffeebar ergibt 8 von 30, die Schwelle war 10. Wer entscheidet jetzt, was passiert?',
      antwort: 'Die Karte: 8 liegt im Band 5–9, die Zeile „Wir entscheiden vorher“ sagt schon, was folgt: wiederholen, eine Sache ändern. Niemand muss nach dem Ergebnis neu verhandeln.',
      falsch: '„Wir schauen uns die Zahl an und überlegen dann“ – genau dann prüft man schlechte Ergebnisse so lange, bis sie passen (Thomke S. 14).',
    },
    kern: [
      {
        text: '„Before conducting any test, stakeholders must agree on how they’ll proceed once the results are in. … One way to encourage this discipline is to prepare a decision matrix that links possible outcomes to predetermined actions before any data comes in.“ Dasselbe in den Tipps („Define specific changes you will make based on the results“, S. 103) und S. 116.',
        quelle: `${THOMKE}, S. 86`,
      },
      {
        text: 'Befunde und Handlungen: gestützt → nächste Hypothese oder derselbe Test stärker; widerlegt → verwerfen oder umschwenken; unklar → weiter testen; neue Einsicht → alles drei möglich.',
        quelle: `${BLAND}, S. 63`,
      },
      {
        text: 'Kursregeln: drei Bänder als Form für die Entscheidungsmatrix; „knapp darunter“ = unklar, „deutlich darunter“ = widerlegt; Grenze etwa die halbe Schwelle. Die Quellen geben dafür keine Zahl.',
        quelle: 'Kurs (Entscheidung Markus 26.11.2026)',
      },
      {
        text: 'Warum drei Bänder: Die Zahlen sind „a subjective decision“ – sie sollen Risiko senken, nicht beweisen. 9 von 30 ist nicht das Gegenteil von 10 von 30.',
        quelle: `${TORRES}, S. 137`,
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht dasselbe wie die Schwelle?',
        antwort: 'Die Schwelle sagt, wann ihr recht habt. Die Zeile daneben sagt, was ihr dann tut – auch wenn ihr nicht recht habt. Thomke verlangt beides vor den Daten (S. 86).',
      },
      {
        frage: 'Woher wissen wir, wo „knapp darunter“ endet?',
        antwort: 'Kursregel: etwa bei der halben Schwelle, vor dem Test als Zahl festgelegt. Bei der Kaffeebar 5 von 30 – eine Setzung, keine Regel aus dem Buch.',
      },
      {
        frage: 'Und eine neue Einsicht?',
        antwort: 'Lässt sich nicht vorab planen; sie steht nach dem Test auf der Lernkarte (Bland S. 63).',
      },
    ],
    ueberleitung: 'Welcher Test liefert euch so ein Ergebnis? Vier Faustregeln.',
  },

  'welcher-test': {
    live: [
      'Blands vier Faustregeln, eine pro Klick.',
      '„Ein Test simuliert einen Moment – und ihr schaut, was Menschen tun.“',
      'Fragen: Was ist bei euch schnell und billig?',
    ],
    kern: [
      {
        text: '„Go cheap and fast at the beginning.“ – „Increase the strength of evidence with multiple experiments for the same hypothesis.“ – „Always pick the experiment that produces the strongest evidence given your constraints.“ – „Reduce uncertainty as much as you can before you build anything.“',
        quelle: `${BLAND}, S. 93`,
      },
      {
        text: '„A strong assumption test simulates an experience, giving your participant the opportunity to behave either in accordance with your assumption or not.“',
        quelle: `${TORRES}, S. 135`,
      },
      {
        text: '„With assumption testing, most of our learning comes from failed tests.“',
        quelle: `${TORRES}, S. 138`,
      },
    ],
    ueberleitung: 'Welche Tests gibt es? Vier zur Auswahl.',
  },

  'test-arten': {
    live: [
      'Eine Zeile pro Klick, von schwach nach sehr stark.',
      'Concierge erklären: Wert von Hand liefern – darum E1 ab 10.',
      'Fragen: Welcher passt zu eurer Annahme oben rechts?',
      'Kein Ort, keine Besucher: simulierter Moment.',
    ],
    kern: [
      {
        text: 'Simple Landing Page: eher schwach, eine E-Mail gibt man leicht her (S. 260–263). Concierge: stark (S. 248–251). Mock Sale: Zahlungsdaten, sehr stark (S. 288–291).',
        quelle: `${BLAND}`,
      },
      {
        text: 'Billige Formen für eine Woche, u. a. ein simulierter Moment mit einem Mock-up. Die Stärke „schwach bis mittel“ ist eine Einordnung des Kurses.',
        quelle: `${TORRES}, S. 135, 142–144`,
      },
    ],
    ueberleitung: 'Alles zusammen an der Kaffeebar: erst die Schritte.',
  },

  beispiel: {
    live: [
      'Fünf Schritte, als gäbe es „Im Gehen bestellen“ schon.',
      'Pro Zeile: Schritt, Annahme, Art.',
      'A5 ohne Beleg – I2-3 spricht sogar dagegen.',
      'A4 kommt aus dem Geschäftsmodell von 10:30.',
    ],
    kern: [
      {
        text: 'Annahmen und Belege der Kaffeebar (A2–A8, I2-3 u. a.) stehen im Handout der Folie; A3 an Schritt 2 und A4 an Schritt 5 sind Setzungen der Kaffeebar.',
        quelle: 'experiment.astro, Folie beispiel (Handout)',
      },
    ],
    ueberleitung: 'Und welche davon zuerst? Die Map der Kaffeebar.',
  },

  'beispiel-map': {
    live: [
      'Oben rechts zeigen: A5, A7, A4.',
      'A8 teilen alle drei Ideen – teils belegt, darum Mitte.',
      'Ausnahme benennen: A5 vor der gemeinsamen A8.',
      '„Bestellt niemand, sind Datenschutz und Wirtschaftlichkeit egal.“',
    ],
    verstaendnis: {
      frage: 'Warum testet die Kaffeebar A5 vor A8, obwohl gemeinsame Annahmen zuerst kommen sollen?',
      antwort: 'A8 ist teils belegt (I2-1, I3-3 erzählt; I2-2, I4-2, I2-5 gesagt) und steht darum oben in der Mitte; A5 hat gar keinen Beleg und ist wünschenswert. Eine bewusste Ausnahme von der Regel.',
    },
    kern: [
      {
        text: 'Reihenfolge der Tests: zuerst Wünschbarkeit, dann Machbarkeit, dann Wirtschaftlichkeit – bestellt niemand, sind Datenschutz und Wirtschaftlichkeit egal.',
        quelle: `${BLAND}, S. 34–35`,
      },
    ],
    ueberleitung: 'Für A5 die Karte E1.',
  },

  'karte-e1': {
    live: [
      'Zeile „Wir entscheiden vorher“ zeigen – die Bänder von eben.',
      '„Unter 5 schwenkt ihr um – das steht hier, bevor der erste Pendler vorbeikommt.“',
      'Bezug: unter 5 → Wartezeit-Anzeige aus der Zeile „Falls E1 scheitert“.',
      'Kursregel: drei Zeilen sind Zusätze des Kurses zu Blands Karte.',
    ],
    kern: [
      {
        text: 'Die Zeile verbindet jedes mögliche Ergebnis mit einer Handlung, bevor gezählt wird: „a decision matrix that links possible outcomes to predetermined actions before any data comes in.“ Ab 10 der Concierge, 5–9 denselben Test wiederholen und eine Sache ändern, unter 5 umschwenken auf die Wartezeit-Anzeige (A6). Die Grenze 5 ist eine Setzung der Kaffeebar.',
        quelle: `${THOMKE}, S. 86`,
      },
    ],
    fragen: [
      {
        frage: 'Und wenn an Tag 5 doch etwas anderes sinnvoll ist?',
        antwort: 'Dann entscheidet ihr offen dagegen: Auf der Lernkarte stehen der Beleg und der Grund (Folie „Gegen den Beleg entscheiden“ nach der Lernkarte). Die Zeile „Wir entscheiden vorher“ auf der Karte bleibt stehen.',
      },
    ],
    ueberleitung: 'Jetzt ihr: Schritte, Annahmen, Map, Karte – 18 Minuten, allein.',
  },

  vorgehen: {
    live: [
      'Anleitung-Frame links neben „T4 · 0“ zeigen.',
      'Nach 11 min: Stehen die Annahmen in der Werkstatt?',
      'Nach 13 min: Steht bei allen die Zeile „Wir entscheiden vorher“?',
      'Nach 16 min: Annahme und E1 in den Baum – Timer 2 min.',
    ],
    miro: { frame: 'T4 · 0 · Annahmen der Idee', schritte: ['Schritte, Annahmen mit Art, Map: wichtig nach oben, wenig Beleg nach rechts.'] },
    kern: [
      {
        text: 'Prüfpunkt experiment-schwelle: Die Schwelle steht als „x von y“ fest, bevor der Test läuft – und mit ihr, was ihr bei welchem Ergebnis tut. Grundlage: Thomkes Entscheidungsmatrix vor den Daten.',
        quelle: `Kurs: methoden.ts, Prüfliste „experiment“; ${THOMKE}, S. 86`,
      },
    ],
    ueberleitung: 'Und wenn E1 gelaufen ist? Dann schreibt ihr die Lernkarte.',
  },

  lernkarte: {
    live: [
      'Learning Card zeigen: geglaubt, beobachtet, gelernt, darum.',
      'Hausaufgabe nennen: nach dem Test füllen, an Tag 5 vorlesen.',
      'Erst der Beleg (gestützt, widerlegt, unklar, neu), dann die Handlung.',
      'Verlässlichkeit dazuschreiben: schwach, mittel oder stark – und warum.',
    ],
    verstaendnis: {
      frage: 'E1 ist widerlegt, ihr schwenkt auf die Wartezeit-Anzeige um. Was müsst ihr mit euren alten Belegen tun?',
      antwort: 'Prüfen, was weiter gilt und was neu zu testen ist: Ein Pivot macht frühere Belege oft irrelevant (Bland S. 61) – darum die Zeile „gilt weiter / neu zu testen“.',
    },
    kern: [
      {
        text: 'Entscheiden in zwei Schritten: Befund – „Evidence Supports Hypothesis“, „Evidence Refutes Hypothesis“, „Unclear Insight“ oder „New Insight“ (S. 63) –, dann Handlung: weitermachen, umschwenken oder verwerfen (S. 61).',
        quelle: `${BLAND}, S. 61, 63`,
      },
      {
        text: '„A pivot often means that some of your earlier evidence may be irrelevant to your new trajectory. It usually requires retesting elements of your business model that you’ve already tested.“',
        quelle: `${BLAND}, S. 61`,
      },
      {
        text: 'Neue Zeile der Vorlage: „Weicht ab von ‚Wir entscheiden vorher‘? Grund: …“ – macht die Ausnahme prüfbar.',
        quelle: 'Kurs (Entscheidung Markus 26.11.2026)',
      },
    ],
    ueberleitung: 'Und wenn ihr nach dem Test anders entscheiden wollt, als die Karte sagt? Das geht – aber offen.',
  },

  'gegen-den-beleg': {
    live: [
      'Netflix in drei Schritten erzählen, Fluss links nach rechts.',
      'Regel, Ausnahme, Nie – einzeln aufdecken.',
      '„Ihr dürft gegen einen Beleg entscheiden – aber nicht so tun, als gäbe es ihn nicht.“',
      'Bezug: die Zeile „Weicht ab …? Grund“ auf der Lernkarte.',
    ],
    verstaendnis: {
      frage: 'Was hat der Test Netflix gebracht, obwohl die Entscheidung gegen die Daten ging?',
      antwort: 'Offenheit: Weil der Test da war, konnte niemand behaupten, Fonda bleibe im Bild, weil die Kundschaft es wolle. Der Grund war offen ein anderer – die Sorge um Fonda und womöglich ihren Vertrag.',
      falsch: '„Nichts, der Test war umsonst“ – ohne ihn hätte man die Entscheidung mit erfundenen Kundenwünschen begründen können.',
    },
    kern: [
      {
        text: 'Netflix: Tests zeigten, dass eine Werbung nur mit Lily Tomlin („Grace and Frankie“) mehr Klicks brachte als Werbung mit Tomlin und Jane Fonda. Das Content-Team fürchtete, Fonda vor den Kopf zu stoßen und womöglich ihren Vertrag zu verletzen. Nach heftigen Debatten – Belege gegen „strategic considerations“ – nahm Netflix Bilder mit beiden, „even though customer data didn’t support the decision. However, the experimental evidence made the decision more transparent. Nobody could argue that Fonda should remain in the promotion because customers preferred it.“',
        quelle: `${THOMKE}, S. 127`,
      },
      {
        text: 'Regel und Ausnahme: „The remedy is to implement the changes that experiments validate (although there are always exceptions)“ (S. 126); die Ausnahme ist „a conscious choice to overrule the data“ (S. 127).',
        quelle: `${THOMKE}, S. 126–127`,
      },
      {
        text: '„Of course, there might be good reasons for rolling out an initiative even when the anticipated benefits are not supported by the data.“ Aber: „if the proposed initiative is a done deal, why go through the time and expense of conducting a test?“ – dann „a rollout, commitment, or implementation“.',
        quelle: `${THOMKE}, S. 87`,
      },
      {
        text: 'Umdeuten ist bei Thomke „cherry-picking data that supports a preferred point of view“.',
        quelle: `${THOMKE}, S. 86`,
      },
    ],
    fragen: [
      {
        frage: 'Wann ist es legitim, gegen den Beleg zu entscheiden?',
        antwort: 'Ausnahmsweise, wenn es einen Grund gibt, den der Test nicht misst – bei Netflix die Sorge um Fonda und ihren Vertrag. Der Grund steht auf der Lernkarte, der Beleg bleibt sichtbar.',
      },
      {
        frage: 'Muss so eine Zeile anders aussehen als die anderen?',
        antwort: 'Nein: „Beleg: … → darum: …“ nennt den Beleg, der dagegen spricht; darunter „Weicht ab von ‚Wir entscheiden vorher‘? Grund: …“ (Kursregel).',
      },
    ],
    ueberleitung: 'Zum Schluss: Wo steht euer Aufsteller?',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Wo kommt eure Zielgruppe ohnehin vorbei?',
      'Kein echter Ort: E1 als simulierter Moment, zehn Menschen, Bild am Handy.',
      'Schwelle und Bänder dafür vorher neu schreiben, z. B. 4 von 10.',
    ],
    kern: [
      {
        text: '„A strong assumption test simulates an experience“; billige Formen für eine Woche sind u. a. ein simulierter Moment mit einem Mock-up.',
        quelle: `${TORRES}, S. 135, 142–144`,
      },
    ],
    ueberleitung: 'Weiter mit der Story Map: Aus dem Spitzenreiter wird Slice 1.',
  },
};
