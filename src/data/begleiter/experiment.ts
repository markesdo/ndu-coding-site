import type { Notiz } from './typen';

// Begleiter-Notizen zu /innolab/methoden/experiment (Tag 4, 28.11.: 11:00–11:40 Experiment-Karte mit Theorie und Beispiel,
// 18 min Übung; seit 26.11.2026 nachts ohne den Claude-Pro-Block davor – dessen Notizen stehen jetzt in tag-5.ts). Jede Folie hat eine Notiz
// (begleiter-tag-4.test.ts). Die Origin Story steht seit 26.11. im Abschluss von Tag 4 (tag-4#abschluss), nicht mehr hier.
// Seit 26.11. ohne die Intuit-Folien (Geschichte im Handout von #karte); neu: schritte-der-idee,
// ergebnis-gilt, test-arten, beispiel-map; gegen-den-beleg steht nach der Lernkarte. Seit dem Nachtrag 26.11. abends
// keine docs-Dateien: Karte E1 und Lernkarten auf Miro, Annahmen in der Werkstatt; Tag 4 ohne Claude (seit 27.11. auch ohne Hausaufgabe in claude.ai), Claude Code erst ab Tag 5.
// Thomke: gedruckte Seiten aus quellen/thomke/text.txt (=====PAGE n=====); Torres: PDF-Seiten wie in
// quellen/torres/text.txt; Bland: gedruckte Seiten.
const THOMKE = 'Stefan H. Thomke, The Scientific Mindset';
const BLAND = 'David J. Bland & Alexander Osterwalder, Testing Business Ideas';
const TORRES = 'Teresa Torres, Continuous Discovery Habits';

export const NOTIZEN_EXPERIMENT: Record<string, Notiz> = {
  'annahmen-der-idee': {
    live: [
      'Zeit: Theorie und Beispiel bis zur Übung, dann 18 min allein.',
      '„Euer Spitzenreiter steht auf Papier – an welcher Annahme hängt er?“',
      'Zwei Fallen: Bestätigung suchen, sich in Investiertes verlieben.',
      'Ergebnis um 11:40 nennen: Karte E1.',
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
      'Bei Bedarf: Zeilen erklären – Kund*in, Software selbst, Partner mit Inhalt.',
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
        text: 'Die Software als eigene Zeile: „In some products or services, the interface or software itself may be an actor in your map (e.g., for an end-user conversing with a chatbot, the chatbot should be listed as a player in the story map).“',
        quelle: `${TORRES}, S. 120`,
      },
      {
        text: 'Die Schritte im Text: „Our subscriber comes to our platform to watch live sports. Our platform has live sports options for our subscriber to choose from. Our subscriber browses the options and chooses a sport that is currently on a local TV channel. Our local channel provider’s content is available to stream. Our subscriber watches live sports.“',
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
    geschichte: {
      text: 'Das Beispiel zieht sich durch Torres’ ganzes Buch: ein Streamingdienst für Unterhaltung – „if we worked at a streaming-entertainment company (e.g., Netflix, Hulu)“ (S. 52). Sein Outcome: mehr gesehene Minuten, „increase the average minutes watched“ (S. 52), später „Increase weekly viewer minutes“ (S. 126); dahinter steht das Geschäftsziel „increase subscriber retention“ (S. 154). Die Chance „I want to watch live sports“ begründet sie mit dem Markt: Wegen der „cord-cutters“, also Kabelkund*innen, die kündigen, könnte der Dienst diese Chance wählen, „to grab some of this market“ (S. 100). Für diese Ziel-Chance stehen drei Lösungen: „1. Integrate local networks (e.g., ABC, CBS, NBC) into our service 2. License broadcast rights directly from the different sports leagues and serve the sporting events up ourselves 3. Bundle our streaming service with a partner who streams live sports“ (S. 120). Die Story Map auf der Folie zeigt die erste: Das Programm lokaler Fernsehsender läuft im eigenen Dienst. Warum lokale Sender, steht in ihren Annahmen: „Most of the major sports are on local channels“ und „Our subscribers are more likely to want to watch major sports“ (S. 126). Sie warnt vor einer Falle beim Benennen der Beteiligten: „it’s easy to make the mistake of thinking our key players are our business-development folks and their equivalent at the respective local channel providers. But remember, with story mapping, we want to assume the solution already exists.“ (S. 120). Gemappt wird also nicht der Vertrag, sondern was passiert, „for our consumer to get value from it“ (S. 121).',
      quelle: `${TORRES}, S. 52, 100, 120–121, 126, 154`,
    },
    fragen: [
      {
        frage: 'Was sind Subscriber, Platform und Local Channel?',
        antwort: 'Subscriber ist die Kundin oder der Kunde mit Abo, die Sport schauen will: „the sports consumer (i.e., our subscriber)“ (S. 121). Bei ihr entsteht der Wert, ihr gehören erster und letzter Schritt. Platform ist der Streamingdienst selbst, die Software als eigene Zeile: „the interface or software itself may be an actor in your map“ (S. 120). Sie zeigt, welcher Sport gerade läuft. Local Channel ist ein Partner von außen, ein lokaler Fernsehsender (Torres nennt ABC, CBS, NBC, S. 120), der das Live-Programm liefert: „any number of local TV channel partners“ (S. 121). Nicht gemeint sind die Leute, die den Vertrag aushandeln (S. 120).',
      },
      {
        frage: 'Wie liest man die Map?',
        antwort: 'Von links nach rechts läuft die Zeit, jede Zeile ist ein Beteiligter: „Sequence the steps horizontally over time … You may need to jump back and forth between players if they need to take turns taking actions.“ (S. 120). Subscriber: Visits platform → Platform: Shows sports options → Subscriber: Browses options, Chooses sport → Local Channel: Delivers content → Subscriber: Watches sport. Zwei Schritte machen also nicht die Kund*innen: das Angebot zeigen (Plattform) und den Inhalt liefern (Sender). Gerade dort stehen Machbarkeits-Annahmen: „Feasibility: We know what sports are available right now.“ (S. 123) und „Feasibility: The local provider’s source content will be available.“ (S. 124). Im Text sind es fünf Schritte („From a simple 5-step story map“, S. 124); die Abbildung trennt „Browses options“ und „Chooses sport“, daher sechs Kästen.',
      },
      {
        frage: 'Welche Annahmen leitet Torres aus dieser Map ab?',
        antwort: 'Aus Schritt 1: „Desirability: Our subscriber wants to watch sports.“ – „Usability: Our subscriber knows they can watch sports on our platform.“ – „Feasibility: Our platform is available when our subscriber wants to watch sports.“ (S. 123). Aus Schritt 2 (Plattform): „Feasibility: We know what sports are available right now.“ (S. 123). Aus Schritt 4 (Sender): „Feasibility: The local provider’s source content will be available.“ (S. 124). Dazu, seltener aus der Map: „Viability: Integrating a local channel feed won’t be too expensive.“ – „Ethical: Subscribers will be okay with us sharing viewership data with their local channels.“ (S. 124). Wünschbarkeit, Bedienbarkeit und Machbarkeit stecken überall dort, wo jemand etwas tun muss – „every time you assume that an end-user will do something“ (S. 122); für Wirtschaftlichkeit und Schaden hat Torres eigene Wege: den Baum entlanggehen und nach möglichem Schaden fragen (S. 125–127). Zusammen: „From a simple 5-step story map, we generated 20 assumptions.“ (S. 124).',
      },
      {
        frage: 'Wo stecken die drei Zeilen bei der Kaffeebar?',
        antwort: 'Pendler*in wie Subscriber: will etwas und bekommt am Ende den Wert. Seite am Handy wie Platform: die Software als Beteiligte – sie öffnet sich nach dem Scan und nimmt Getränk und Abfahrtszeit entgegen (Schritte 2 und 3); Code scannen und wählen tut die Pendler*in. Bar wie Local Channel: liefert, was gewählt wurde – zeigt „Fertig 7:31“ und bereitet zu (Schritt 4). Die Schritte stehen auf der Folie „Am Beispiel“. Ein Unterschied: Der Sender ist bei Torres ein fremder Partner, die Bar gehört zum eigenen Geschäft. Auch dort hängen an der Seite und an der Bar Annahmen, die nicht die Kund*innen betreffen, etwa A2 (machbar: 40 Bestellungen in 30 Minuten). Die Zuordnung ist eine Lesart des Kurses, nicht von Torres.',
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
      'Bei Bedarf: Portland von Tag 1 aufgreifen, siehe Geschichte.',
    ],
    verstaendnis: {
      frage: 'Was heißt „Spitzenreiter auf Papier“?',
      antwort: 'Die Wahl stützt sich auf den Fit zwischen Value Map und Kundenprofil, nicht auf einen Test – „The fit you achieve is not yet proven and exists mainly on paper“ (Value Proposition Design, S. 117 PDF). Ein Test könnte sie ändern – dann entscheidet ihr nach Blands drei Möglichkeiten, oft mit der Idee aus der Zeile unter der Karte.',
      falsch: '„Wir haben uns entschieden.“ Entschieden ist nur, womit ihr heute weiterarbeitet. Entscheiden würde erst, was ein Test zeigt (Blands drei Möglichkeiten, S. 61–63).',
    },
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
    geschichte: {
      text: 'Torres verweist hier auf die Denkfehler aus dem vorigen Kapitel – bei uns die Portland-Geschichte von Tag 1: Die Stadt hat eine einzige Idee verfolgt, und je länger sie das tat, desto fester hielt sie an ihr fest – trotz ihrer Schwächen. Torres nennt das Bestätigungsneigung und „escalation of commitment“ (S. 116). Darum vergleicht sie drei Ideen: „If we test only one idea at a time, confirmation bias will rear its ugly head. We’ll be more likely to notice the confirming evidence and miss the disconfirming evidence.“ (S. 134). Ihr Beispiel: drei Ideen für „I want to watch sports“ – lokale Sender, Rechte direkt von den Ligen, ein Bündel mit einem Sportanbieter. Alle drei hängen an „Our subscriber wants to watch sports“; ist das falsch, fällt das ganze Set (S. 135–136). Wir machen es anders, als Kursregel: Ihr seid drei, jede*r mit einem eigenen Produkt, und Story Map, Usage Story und Prototyp von heute brauchen eine Idee. Von Torres bleibt: gemeinsame Annahmen zuerst (S. 136). Dazu, ebenfalls als Kursregel, die anderen beiden als Zeile „Falls E1 scheitert“ unter der Karte.',
      quelle: `${TORRES}, S. 116, 134–136; Abweichung und Zeile unter der Karte sind Kursregeln (Handout der Folie)`,
    },
    fragen: [
      {
        frage: 'Was ist eine gemeinsame Annahme?',
        antwort: 'Eine Annahme, an der alle drei Ideen hängen – fällt sie, fallen alle drei. Bei der Kaffeebar ist das A8: „Wir glauben, dass Pendler*innen die Bar wählen, wenn sie sicher wissen, dass es sich bis zur Abfahrt ausgeht.“ Wartezeit-Anzeige, Bestellen im Gehen und Kaffeewagen versprechen alle, die Frage „Geht sich das aus?“ zu beantworten (P1). Getestet wird dort trotzdem A5 zuerst, weil A8 schon teils belegt ist – eine Ausnahme (Folie „Die Map der Kaffeebar“). A8 ist ein Beispiel dieses Kurses; Torres’ Beispiel ist „Our subscriber wants to watch sports“ (S. 136).',
      },
      {
        frage: 'Was passiert mit den anderen beiden Ideen?',
        antwort: 'Sie bleiben offen: im Baum als Lösungen unter der Ziel-Chance, und auf der Karte E1 steht in der letzten Zeile „Falls E1 scheitert“ je ihre riskanteste Annahme – auf Miro im Frame „T4 · 0 · Annahmen der Idee“, Feld „Karte E1 für die oberste rechts“. Bei der Kaffeebar: Wartezeit-Anzeige (A6) · Kaffeewagen („Am Bahnsteig gibt es keine Schlange“).',
      },
      {
        frage: 'Und wenn der Spitzenreiter scheitert?',
        antwort: 'Bland nennt drei Möglichkeiten: weitermachen (persevere – derselbe Test stärker oder die nächste Annahme), umschwenken (pivot – eine deutliche Änderung an Idee, Wertversprechen oder Geschäftsmodell) und verwerfen (kill); ist die Annahme widerlegt, bleiben umschwenken oder verwerfen (Bland S. 61–63). Umschwenken heißt bei uns meist: auf die Idee aus der Zeile „Falls E1 scheitert“ – wie auf der Folie „Vorher festlegen“ (unter 5 → Wartezeit-Anzeige); das ist eine Lesart des Kurses. Interviews, Kundenprofil und was alle drei teilen, gelten weiter. Bei uns ist das an Tag 5 ein Gedankenexperiment: Was hättet ihr bei welchem Ergebnis getan?',
      },
      {
        frage: 'Warum nicht alle drei testen, wie Torres?',
        antwort: 'Eine Kursregel, bewusst gegen Torres: Ihr seid drei Personen mit je einem eigenen Produkt, und Story Map, Usage Story und Prototyp von heute brauchen eine Idee – an Tag 5 baut Claude Code daraus Slice 1. Von Torres behalten wir: gemeinsame Annahmen zuerst (S. 136). Die Zeile „Falls E1 scheitert“ für die anderen beiden ist eine Kursregel – damit sie nicht aus dem Blick geraten.',
      },
      {
        frage: 'Der Spitzenreiter ist nicht meine Idee – was jetzt?',
        antwort: 'Du entscheidest: bestätigen oder ändern. Der Vorschlag in T3 · 4 war ein Ausgangspunkt, keine Vorgabe. Maßstab ist derselbe wie um 9:05: Welche deiner drei Ideen trifft dein Kundenprofil am besten (✓ ✗ ?)? Bleibst du beim Vorschlag, ist er ab jetzt deine Wahl. Wechselst du, arbeitest du mit der anderen Idee weiter und ziehst Value Map und Fit nach.',
      },
    ],
    ueberleitung: 'Mit welcher Annahme fangt ihr an? Das zeigt die Map.',
  },

  map: {
    live: [
      '„Die Map kennt ihr von Tag 1 – jetzt mit dem Spitzenreiter von 9:05.“',
      'Vier Felder wie auf Miro: „Zuerst testen“ oben rechts.',
      'Höchstens zehn Minuten: relativ zueinander, nicht genau.',
      'Wege nennen: Miro sortieren, Karte E1 auf Miro, Werkstatt am Abend.',
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
      'Kohl’s: Führung begeistert, Möbel, 70 Läden, sechs Monate, gestoppt.',
      'Warum der Umsatz sank: Möbel nahmen anderen Waren die Fläche.',
      '„Gute Ergebnisse glaubt man sofort – schlechte prüft man so lange nach, bis sie zur eigenen Erwartung passen.“',
      'Falle: Kohl’s eine Matrix vorab andichten – belegt ist der vereinbarte Test.',
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
      {
        text: 'Die Regel dahinter, Thomkes erste von vier: „(1) commit to abide by results“ (S. 85). „Before conducting any test, stakeholders must agree on how they’ll proceed once the results are in. … Most importantly, they must be willing to walk away from a project if a hypothesis is not supported“ (S. 86).',
        quelle: `${THOMKE}, S. 85–86`,
      },
      {
        text: 'Warum ein Test nur zählt, wenn sein Ergebnis etwas stoppen kann: „But if the proposed initiative is a done deal, why go through the time and expense of conducting a test? In such cases, it’s best to call programs what they are—a rollout, commitment, or implementation.“',
        quelle: `${THOMKE}, S. 87`,
      },
      {
        text: 'Was Kohl’s vorher vereinbart hat: den Test – „the company first agreed to test sales at seventy stores over six months“. Ob auch feststand, was bei welchem Ergebnis folgt, sagt Thomke nicht. Die Entscheidungsmatrix empfiehlt er im Absatz davor allgemein („a decision matrix that links possible outcomes to predetermined actions before any data comes in“, S. 86). Die Zeile „Wir entscheiden vorher“ mit drei Bändern ist die Form, die der Kurs dafür nimmt.',
        quelle: `${THOMKE}, S. 86; Zeile und Bänder: Kurs`,
      },
    ],
    geschichte: {
      text: 'Wer Kohl’s ist: eine große Handelskette in den USA, bei Thomke „another large retailer“ (S. 13) und „the large US retailer“ (S. 66). Er kennt die Firma als eine, die testet: Bevor sie ihre Läden eine Stunde später öffnete, um Betriebskosten zu sparen, prüfte sie das in hundert Läden (S. 13, 66–67). Die Idee: Möbel ins Sortiment – „When Kohl’s was considering adding furniture to its product categories, many executives were tremendously enthusiastic, anticipating significant additional revenue.“ Viele in der Führung erwarteten also deutlich mehr Umsatz. Der Test: „Nevertheless, the company first agreed to test sales at seventy stores over six months—and the data showed a net decrease in revenue.“ Warum, steht gleich dabei: Die Möbel brauchten Platz, und was dafür weichen musste, verkaufte weniger – „Products that now had less floor space (to make room for the furniture) experienced a drop in sales, and Kohl’s was actually losing customers overall.“ Die Befürworter*innen: „Those negative results were a huge disappointment for the program’s advocates, but the initiative was nevertheless scrapped“ (S. 86–87). Mehr über ihre Reaktion erzählt Thomke nicht, etwa ob sie das Ergebnis angezweifelt haben – nicht ausschmücken. Seine Lesart: „The Kohl’s example highlights the fact that experiments are often needed to perform objective assessments of proposals backed by people with organizational clout“ (S. 87).',
      quelle: `${THOMKE}, S. 13, 66–67, 86–87`,
    },
    fragen: [
      {
        frage: 'Was hat der Test bei Kohl’s gemessen – die Möbel oder den ganzen Laden?',
        antwort: 'Den Umsatz insgesamt: „a net decrease in revenue“ (S. 86). Die Möbel nahmen anderen Waren die Fläche, die verkauften weniger, und Kohl’s verlor Kundschaft (S. 86–87). Wer nur auf die Möbel schaut, sieht die Verdrängung nicht. Darum zählt E1 beides, Automat und Aufsteller: Gemessen wird die Wahl, nicht nur das Interesse am Neuen.',
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
      falsch: '„Wir schauen uns die Zahl an und überlegen dann“ – genau dann prüft man schlechte Ergebnisse so lange nach, bis sie zur eigenen Erwartung passen (Thomke S. 14).',
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
        frage: 'E1 ergibt 8 von 30, und jemand sagt: „Der Aufsteller stand ungünstig.“ Ist das Wegerklären?',
        antwort: 'Nicht, wenn es vorher auf der Karte stand: Für 5–9 heißt die Zeile „Wir entscheiden vorher“ schon „wiederholen, eine Sache ändern“ – den Ort ändern ist dann die vereinbarte Handlung. Prüffrage nach Thomke (S. 14): Hättet ihr den Ort auch bei 12 von 30 hinterfragt? Bei 3 von 30 gilt „unter 5 → Wartezeit-Anzeige“, auch wenn der Morgen ungewöhnlich wirkte.',
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
      'Eine Zeile pro Klick, von schwach nach stark.',
      'Concierge: Wert von Hand, die Person sieht die Menschen dahinter.',
      'Fragen: Welcher passt zu eurer Annahme oben rechts?',
      'Kein Ort, keine Besucher: simulierter Moment.',
      'Mock Sale: Klick, sofort aufgeklärt, Kaffee wie sonst, kleines Dankeschön.',
    ],
    kern: [
      {
        text: 'Simulierter Moment – Aufbau: ein Bild oder Mock-up am Handy, das genau den Moment zeigt, um den es geht. Testpersonen: Menschen aus der Zielgruppe, in der beschriebenen Situation; Torres: „A strong assumption test simulates an experience, giving your participant the opportunity to behave either in accordance with your assumption or not.“',
        quelle: `${TORRES}, S. 135`,
      },
      {
        text: 'Simulierter Moment – gemessen: ob die Person die Handlung wählt oder nicht. Kaffeebar: zehn Pendler*innen in der Halle sehen am Handy den Bestellbildschirm – wer tippt auf „Bestellen“? Achtung: gestellt, nicht die echte Lage; schwach bis mittel ist Kurseinordnung. Billige Formen für eine Woche: S. 142–144.',
        quelle: `${TORRES}, S. 142–144; Kaffeebar und Einordnung: Kurs`,
      },
      {
        text: 'Landingpage / Aufsteller – Aufbau: „A simple, digital web page that clearly illustrates your Value Proposition with a call to action.“ Das Angebot steht da, das Produkt noch nicht, und die Seite sagt das (Kursregel). Testpersonen: wer vorbeikommt – Bland rechnet mit „about 100 unique visitors a day“; beim Aufsteller die Menschen in der Halle.',
        quelle: `${BLAND}, Simple Landing Page, S. 260, 262`,
      },
      {
        text: 'Landingpage – gemessen: Aufrufe, Eintragungen, Klicks; „Email is a rather weak strength of evidence, in that everyone has email and they give it out freely if even mildly interested.“ Kaffeebar: E1, der Aufsteller an der Hallentür, gezählt gegen die Strichliste am Automaten.',
        quelle: `${BLAND}, S. 261–262`,
      },
      {
        text: 'Concierge – Aufbau: „Creating a customer experience and delivering value manually, with people instead of using technology. Unlike Wizard of Oz, the people involved are obvious to the customer.“ Wizard of Oz liefert ebenfalls von Hand, aber „without making the human steps visible to the end customer“.',
        quelle: `${BLAND}, Concierge, S. 248; S. 251`,
      },
      {
        text: 'Concierge – Testpersonen: wenige echte Kund*innen, die bestellen; gemessen: Zufriedenheit, Käufe, Durchlaufzeit; „Payments are strong evidence, even if you are manually delivering value.“ Kaffeebar: ein paar Morgen nimmt jemand an der Hallentür Bestellungen von Hand an. Achtung: kostet vor allem Zeit – „The biggest requirement for a concierge test is time.“',
        quelle: `${BLAND}, S. 250`,
      },
      {
        text: 'Mock Sale – Aufbau: „Presenting a sale for your product without processing any payment information.“ Online: nach dem Klick auf den Preis ein „we’re not ready yet“-Hinweis mit E-Mail-Feld. Gemessen: Kaufklicks, E-Mails, eingegebene Zahlungsdaten – „Purchase clicks are relatively strong“, „Payment info submissions are very strong evidence.“',
        quelle: `${BLAND}, Mock Sale, S. 288–290`,
      },
      {
        text: 'Mock Sale – Achtung: Bland lässt im Laden „intercept and explain that the product is not yet available“ und die Kundschaft „with a gift card for the inconvenience“ entschädigen; online kommt der Hinweis sofort nach dem Klick. Zahlungsdaten nicht speichern ist Kursregel. Kaffeebar: Knopf „Vorbestellen für 2,90 €“, danach „Das ist ein Test – das gibt es noch nicht. Zeig diese Seite an der Bar: dein Dankeschön. Sollen wir dir Bescheid sagen? [E-Mail]“.',
        quelle: `${BLAND}, S. 289; Kaffeebar und Speicherregel: Kurs`,
      },
    ],
    verstaendnis: {
      frage: 'Warum ist Mock Sale stärker als Landingpage?',
      antwort: 'Der Kaufklick hängt an einem Preis, der Eintrag auf der Landingpage nicht: „Email is a rather weak strength of evidence, in that everyone has email and they give it out freely if even mildly interested“ (S. 262); beim Mock Sale sind „Purchase clicks are relatively strong“, „Payment info submissions are very strong evidence“ (S. 290).',
      falsch: '„Weil mehr Leute klicken“ – es klicken eher weniger; dafür kostet der Klick mehr.',
    },
    geschichte: {
      text: 'Die vier Tests an der Kaffeebar, von schwach nach stark. Simulierter Moment: Zehn Pendler*innen in der Halle sehen am Handy den Bestellbildschirm – wer tippt auf „Bestellen“? Sie wählen, aber in einer gestellten Lage. Aufsteller: An der Hallentür steht „Trag deinen Zug ein“ mit QR-Code; wer auf dem Weg zum Zug vorbeikommt, trägt sich ein oder nicht, gezählt gegen die Strichliste am Automaten. Concierge: Ein paar Morgen nimmt jemand an der Hallentür Bestellungen von Hand an und gibt sie an die Bar; die Pendler*innen bekommen echten Kaffee und sehen, wer ihn holt. Mock Sale: Der Knopf „Vorbestellen für 2,90 €“; wer tippt, liest „Das ist ein Test – das gibt es noch nicht. Zeig diese Seite an der Bar: dein Dankeschön. Sollen wir dir Bescheid sagen? [E-Mail]“. Von Stufe zu Stufe gibt die Person mehr her: eine Wahl am Bild, einen Eintrag, eine echte Bestellung beim Concierge – „Payments are strong evidence“ (S. 250). Der Kaufklick allein ist „relatively strong“; „sehr stark“ wird der Mock Sale erst mit Zahlungsdaten (S. 290).',
      quelle: `Kaffeebar: Kurs; Stärken nach ${TORRES}, S. 135, 142–144, und ${BLAND}, S. 250, 262, 290`,
    },
    fragen: [
      {
        frage: 'Was ist ein Mock Sale?',
        antwort: 'Ein Angebot mit Preis und Kaufen-Knopf für etwas, das es noch nicht gibt: „Presenting a sale for your product without processing any payment information.“ Nach dem Klick erfährt die Person, dass es das noch nicht gibt – online ein „we’re not ready yet“-Hinweis mit E-Mail-Feld. Es fließt kein Geld (Bland, Mock Sale, S. 288–289). Gut für Preise: „Mock sale is ideal for determining different price points for your product“ (S. 288). Kaffeebar: „Vorbestellen für 2,90 €“ → „Das ist ein Test – das gibt es noch nicht. Zeig diese Seite an der Bar: dein Dankeschön. Sollen wir dir Bescheid sagen? [E-Mail]“ (E-Mail-Feld wie bei Bland, S. 289). Ohne Zahlungsdaten (Kursregel: nie speichern) zählt euer Mock Sale die Kaufklicks – „relatively strong, although not as strong as subsequent email and payment submissions“ – und, wer Bescheid will, die E-Mails danach, ebenfalls „relatively strong“ (S. 290); „sehr stark“ wäre er erst mit Zahlungsdaten.',
      },
      {
        frage: 'Sind die Testpersonen schon echte Kund*innen?',
        antwort: 'Bei drei der vier Tests hat noch niemand gekauft, weil es das Produkt noch nicht gibt: Die Testpersonen sind mögliche Kund*innen. Wer teilnimmt, hängt vom Test ab. Simulierter Moment: angeworbene Menschen aus der Zielgruppe, denen ihr ein Mock-up zeigt – „you need to be thoughtful about who you recruit“, mit Streuung statt zehn Gleichen (Torres, S. 139, 143; bei Torres sind es Abonnent*innen eines bestehenden Dienstes, „we need to recruit our own subscribers“). Landingpage / Aufsteller: wer vorbeikommt, in der echten Lage – Bland rechnet mit „about 100 unique visitors a day“ (S. 262). Mock Sale: eine bestimmte Zielgruppe in einer echten Kaufsituation, online oder im Laden – „target a specific audience with your solution and give them enough time to consider a purchase“ (S. 290). Ausnahme Concierge: echte Kund*innen, die bestellen, zahlen können und den Wert von Hand bekommen; Bland: „acquire customers for it“, „Payments are strong evidence, even if you are manually delivering value“ (S. 250). Einordnung des Kurses: Nur beim Concierge bekommt jemand schon etwas geliefert.',
      },
      {
        frage: 'Wie läuft das beim Mock Sale mit echten Menschen – ist das nicht unehrlich?',
        antwort: 'Unehrlich wäre es, wenn die Person es nicht erfährt. Bland löst sofort auf: im Laden „intercept and explain that the product is not yet available“, nach Rückmeldung fragen und die Person „with a gift card for the inconvenience“ entschädigen; Ladenleitung und Personal kennen Dauer und Art des Tests vorher. Online kommt der Hinweis direkt nach dem Klick (S. 289). Grundsatz: „Are you experimenting with your customers or on them?“ – das Buch sei kein Grund „to scam people out of their money … In short, don’t be evil“ (S. 86). Beim Pop-up-Store schreibt Bland zum Mock Sale „do not collect payment information“ (S. 303). Kursregel: Zahlungsdaten nie speichern, und am Ende klar sagen, dass es ein Test war. Torres’ ethische Frage passt dazu: „Do your customers understand that you’ll be collecting that data?“ (S. 127) – darum die E-Mail nur, wenn die Person nach dem Hinweis Bescheid haben will.',
      },
      {
        frage: 'Welcher Test passt zu uns?',
        antwort: 'Blands Faustregeln von der Folie davor: am Anfang schnell und billig, dann der stärkste Beleg, den ihr euch leisten könnt (S. 93). Habt ihr keinen Ort und keine Besucher*innen, bleibt der simulierte Moment: Bild am Handy, Situation in einem Satz (Torres, S. 135, 142–144). Concierge kostet vor allem Zeit (Bland S. 250); ein Mock Sale braucht einen durchgerechneten Preis – „If you test a ridiculously low price, then you’ll receive false positives“ (S. 290). Kursregel: E1 führt ihr nicht durch. Heute beschreibt ihr auf der Karte, welcher Test es wäre und wie er liefe; an Tag 5 besprecht ihr, was er gezeigt hätte.',
      },
      {
        frage: 'Wie sähe der Mock Sale an der Kaffeebar aus – und was ist mit der Person, die klickt und keinen Kaffee bekommt?',
        antwort: 'Ort: am selben Ort wie E1, als eigener Durchlauf nach E1 – der Aufsteller an der Hallentür, jetzt mit Angebot und Preis: „Kaffee im Gehen vorbestellen – fertig vor deinem Zug. Cappuccino 2,90 €“, darunter der QR-Code. Wer: Pendler*innen, die morgens ankommen und die Schlange sehen. Angeworben wird niemand – es ist die Zielgruppe in einer echten Kaufsituation; Bland: „target a specific audience with your solution and give them enough time to consider a purchase“ (S. 290). Ablauf: scannen; auf der ersten Seite steht „Fährt dein Zug in weniger als 5 Minuten? Dann bitte nicht jetzt.“ (Hinweis des Kurses: niemand soll durchs Tippen den Zug verpassen). Dann Getränk wählen, Abfahrtszeit eintragen, auf „Vorbestellen für 2,90 €“ tippen. Sofort danach: „Das ist ein Test – das gibt es noch nicht. Zeig diese Seite an der Bar: dein Dankeschön. Sollen wir dir Bescheid sagen? [E-Mail]“. Die Person: Sie bekommt durch den Test keinen Kaffee, und es fließt kein Geld. Sie erfährt es sofort, noch in der Halle und bevor sie das Anstellen aufgibt; ihren Kaffee holt sie wie sonst an der Bar oder am Automaten. Als Dank, nach Blands „gift card for the inconvenience“ (S. 289): Mit der Seite bekommt sie an der Bar eine kleine Aufmerksamkeit, etwa einen Gutschein – der Gutschein ist eine Anpassung des Kurses, Bland beschreibt die Entschädigung für den Test im Laden. Gezählt: Kaufklicks pro Besucher*in der Seite, dazu die E-Mails – und wie bei E1 gegen die Alternative: die Strichliste am Automaten in derselben Zeit, damit sichtbar wird, ob die Vorbestellung den Automaten verdrängt; gemessen wird die Wahl, nicht nur das Interesse am Neuen (wie bei Kohl’s: der ganze Laden zählt, nicht nur das Neue; Anpassung des Kurses). „Purchase clicks are relatively strong“, die E-Mails danach ebenfalls „relatively strong“ (S. 290); ohne Zahlungsdaten nicht „very strong“. Warum vertretbar: mit der Kundschaft, nicht an ihr – „Are you experimenting with your customers or on them?“ (S. 86). Die Person kostet es knapp eine Minute, und sie erfährt es sofort.',
      },
    ],
    ueberleitung: 'Alles zusammen an der Kaffeebar: erst die Schritte.',
  },

  'annahmen-finden': {
    live: [
      'Fünf Fragen nacheinander aufdecken, je mit Art.',
      'Kaffeebar Schritt 1 laut durchgehen: Wollen sie?',
      'Antwort mit „hoffentlich“ → Annahme, hier A5 – bei euch: ab A7.',
      'Pre-Mortem-Frage von vorhin dazu.',
      'Zeit: Sprechzeit ~2 min.',
    ],
    verstaendnis: {
      frage: 'Woran merkt ihr, dass eine Antwort eine Annahme ist?',
      antwort: 'Wenn ihr „hoffentlich“ denkt oder keinen Beleg nennen könnt: Dann kommt sie als „Wir glauben, dass …“ mit Art auf Miro.',
      falsch: '„Wenn sie falsch klingt“ – auch was plausibel klingt, ist ohne Beleg eine Annahme.',
    },
    kern: [
      {
        text: '„Desirability assumptions: Does anyone want it?“ – „Viability assumptions: Should we build it?“ – „Feasibility assumptions: Can we build it?“ – „Usability assumptions: Is it usable?“ – „Ethical assumptions: Is there any potential harm in building this idea?“ Die deutschen Fragen an den einzelnen Schritt sind Kursformulierung.',
        quelle: `${TORRES}, S. 118; Kursformulierung`,
      },
    ],
    ueberleitung: 'Und wenn eine Frage nichts ergibt? Ein Schritt der Kaffeebar, alle fünf Fragen.',
  },

  'ein-schritt-fuenf-fragen': {
    live: [
      'Vor jedem Klick die Frage laut stellen – wer mag, antwortet.',
      'Zwei Treffer: A6 und A2 – A2 trotz Beleg, auf der Map links.',
      'Leere Fragen: kein Zettel, auch kein „–“ – so reichen fünf Minuten.',
      '„Eine Frage darf leer bleiben – ein Schritt nicht.“',
      'Zeit: Sprechzeit ~2 min.',
    ],
    verstaendnis: {
      frage: 'An Schritt 4 ergeben drei von fünf Fragen keinen Zettel. Ist das ein Fehler?',
      antwort: 'Nein. Eine Frage kann an einem Schritt nichts ergeben: Es gibt dort nichts zu hoffen (kein Zettel), oder sie betrifft die ganze Idee statt des Schritts (weiter). Ein Fehler wäre ein Schritt mit weniger als zwei Annahmen – oder eine Art, die an allen Schritten leer bleibt (Torres S. 131–132).',
      falsch: '„Zu jeder Frage muss etwas stehen“ – dann erfindet ihr Annahmen, an denen nichts hängt, und die fünf Minuten reichen nicht.',
    },
    kern: [
      {
        text: 'An den Schritten sucht Torres drei Arten: „every time you assume that an end-user will do something, you are making desirability assumptions […], usability assumptions […], and feasibility assumptions“. In ihrem Beispiel bleiben zwei Stellen leer: Schritt 3 ohne Machbarkeit, Schritt 4 (der Sender liefert) ohne Bedienbarkeit. Jeder Schritt hat drei bis fünf Annahmen.',
        quelle: `${TORRES}, S. 122–124`,
      },
      {
        text: 'Wirtschaftlich und ethisch findet sie für die ganze Idee, nicht je Schritt: „Sometimes story maps can help us uncover viability and ethical assumptions as well.“ Auf der Folie stehen trotzdem alle fünf Fragen an jedem Schritt, damit keine Art vergessen wird.',
        quelle: `${TORRES}, S. 124–126`,
      },
      {
        text: 'Leer über alle Schritte ist ein blinder Fleck: „Use the categories to catch your blind spots.“ – „Some teams struggle to come up with anything. But all products have some potential harm.“',
        quelle: `${TORRES}, S. 126, 132`,
      },
    ],
    fragen: [
      {
        frage: '„Aber verstehen sie die Zeile ‚Fertig 7:31‘ überhaupt?“',
        antwort: 'Dann ist das für dich ein „hoffentlich“ – genau so entsteht ein Zettel (bedienbar, S4). Bei der Kaffeebar bekommt er keine ID, er ist nur zur Übung. Die Folie zeigt eine mögliche Antwort, nicht die einzige.',
      },
      {
        frage: 'Soll ich auch aufschreiben, was ich sicher weiß?',
        antwort: 'Wenn der Schritt daran hängt: ja, wie A2 – der Zettel kommt auf der Map nach links. Torres schreibt auch harmlose Annahmen auf, die Map sortiert sie (S. 124, 131). Für die fünf Minuten: Was sicher ist und an dem nichts hängt, lasst ihr weg.',
      },
      {
        frage: 'A2 steht auf Miro beim Pre-Mortem, hier bei Schritt 4 – was stimmt?',
        antwort: 'Beides. Dieselbe Annahme lässt sich auf zwei Wegen finden; sie bekommt einen Zettel.',
      },
    ],
    ueberleitung: 'Dasselbe an allen fünf Schritten – das kommt heraus.',
  },

  beispiel: {
    live: [
      'Schritt 4 kennt ihr schon: zwei Treffer.',
      'Andere Schritte: je ein Treffer – zusammen alle fünf Arten.',
      'A5 ohne Beleg – I2-3 spricht sogar dagegen.',
      'A4 kommt aus dem Geschäftsmodell vorhin.',
      'Zeit: kurz, ~30 s.',
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
      'Concierge erklären: Bestellungen von Hand an der Hallentür.',
    ],
    verstaendnis: {
      frage: 'Was ist ein Concierge-Test?',
      antwort: 'Ihr liefert den Wert von Hand statt mit Software, und die Kundschaft sieht die Menschen dahinter: „Creating a customer experience and delivering value manually, with people instead of using technology. Unlike Wizard of Oz, the people involved are obvious to the customer.“ (Bland, S. 248). Kaffeebar: ein paar Morgen nimmt jemand an der Hallentür Bestellungen von Hand an.',
      falsch: '„Ein Test mit einem Prototyp“ – geliefert wird echter Wert, nur ohne Software.',
    },
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
      'Nach 11 min: Liegt jeder Tag-1-Zettel in einem Feld? Werkstatt erst abends.',
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
    ueberleitung: 'Wie E1 laufen würde – Schritt für Schritt.',
  },

  'so-liefe-e1': {
    live: [
      'Klarstellen: E1 läuft bei uns nicht – so sähe es aus.',
      'Fünf Schritte einzeln aufdecken, je mit Kaffeebar.',
      'Zählen statt überreden: auch die Gegenseite (Strichliste).',
      'Ehrlich sagen, dass es das noch nicht gibt.',
      'Zeit: Sprechzeit ~2 min.',
    ],
    fragen: [
      {
        frage: 'Wer wären die Testpersonen für E1, und wo?',
        antwort: 'Menschen aus der Zielgruppe in der Situation, um die es geht – bei der Kaffeebar Pendler*innen morgens in der Halle, drei Morgen. Ohne echten Ort: ein simulierter Moment mit zehn Menschen aus der Zielgruppe, Bild am Handy.',
      },
    ],
    kern: [
      {
        text: 'Die fünf Schritte sind eine Kurszusammenfassung aus Blands Test Card (S. 46) und Simple Landing Page (S. 260) und Torres’ simuliertem Moment: „A strong assumption test simulates an experience, giving your participant the opportunity to behave either in accordance with your assumption or not.“',
        quelle: `${BLAND}, S. 46, 260; ${TORRES}, S. 135, 142–144; Kurszusammenfassung`,
      },
    ],
    ueberleitung: 'Und so sähe die Lernkarte danach aus – am Beispiel der Kaffeebar.',
  },

  lernkarte: {
    live: [
      'Learning Card zeigen: geglaubt, beobachtet, gelernt, darum.',
      'Kaffeebar: 8 von 30 – Band 5–9 – wiederholen, eine Sache ändern.',
      'Erst der Beleg (gestützt, widerlegt, unklar, neu), dann die Handlung.',
      'E1 läuft nicht: an Tag 5 besprechen, was die Karte gezeigt hätte.',
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
        text: 'Zeile „Weicht ab von ‚Wir entscheiden vorher‘? Grund: …“ – macht die Ausnahme prüfbar. E1 läuft in diesem Kurs nicht (Entscheidung 27.11.); eine Lernkarte schreibt nur, wer E2 mit dem Prototyp testet.',
        quelle: 'Kurs (Entscheidungen Markus 26. und 27.11.2026)',
      },
    ],
    ueberleitung: 'Und wenn man nach dem Test anders entscheiden will, als die Karte sagt? Das geht – aber offen.',
  },

  'gegen-den-beleg': {
    live: [
      'Erst erklären: Serie, zwei Stars, Netflix testet Vorschaubilder.',
      'Netflix erzählen: Tomlin allein klickt besser, trotzdem beide, Grund offen.',
      'Regel, Ausnahme, Nie – einzeln aufdecken.',
      '„Ihr dürft gegen einen Beleg entscheiden – aber nicht so tun, als gäbe es ihn nicht.“',
      'Brücke: E1 mit 12, trotzdem kein Concierge – Grund auf die Lernkarte.',
    ],
    verstaendnis: {
      frage: 'Was hat der Test Netflix gebracht, obwohl die Entscheidung gegen die Daten ging?',
      antwort: 'Offenheit: Weil der Test da war, konnte niemand behaupten, Fonda bleibe im Bild, weil die Kundschaft es wolle. Der Grund war offen ein anderer – die Sorge um Fonda und womöglich ihren Vertrag.',
      falsch: '„Nichts, der Test war umsonst“ – ohne ihn hätte man die Entscheidung mit erfundenen Kundenwünschen begründen können.',
    },
    kern: [
      {
        text: 'Hintergrund (nicht bei Thomke): „Grace and Frankie“ ist eine Comedyserie auf Netflix (2015–2022); Jane Fonda und Lily Tomlin spielen die beiden Titelrollen. Netflix zeigt zu jedem Titel ein Vorschaubild und testet Bilder darauf, welches mehr Menschen zum Ansehen bringt.',
        quelle: 'https://en.wikipedia.org/wiki/Grace_and_Frankie; Netflix, „The Power of a Picture“ (3.5.2016), https://about.netflix.com/en/news/the-power-of-a-picture',
      },
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
      {
        text: 'Was Thomke über Netflix’ Tests allgemein sagt: nur, dass die Firma „has built a sophisticated infrastructure for large-scale experimentation“. Wie Netflix Vorschaubilder testet und warum sie zählen, beschreibt er nicht; der Hintergrund dazu oben ist nicht von ihm. Seine Quelle für den Fall: Shalini Ramachandran und Joe Flint, „At Netflix: Who Wins When It’s Hollywood vs. the Algorithm?“, Wall Street Journal, 10.11.2018 (Anm. 17).',
        quelle: `${THOMKE}, S. 127 und Anm. 17 zu Kap. 6`,
      },
      {
        text: 'Wo der Fall im Buch steht: im Abschnitt „Insist That Data Overrides Opinions“. „The results of experiments must prevail when they clash with strong opinions, no matter whose opinions they are.“ „Nothing stalls experiments faster than a so-called HiPPO—highest-paid person’s opinion.“ „But if everything that can be tested is tested, experiments can become instrumental to management decisions and fuel healthy debates.“ Netflix folgt direkt darauf: „Sometimes those discussions might result in a conscious choice to overrule the data.“',
        quelle: `${THOMKE}, S. 126–127`,
      },
    ],
    geschichte: {
      text: 'Bei Thomke: Netflix, „which has built a sophisticated infrastructure for large-scale experimentation“, testete Werbung für die Comedyserie „Grace and Frankie“. „The company’s executives were torn when tests showed that a promotion featuring an image of only Lily Tomlin, one of the stars of Grace and Frankie, resulted in more clicks by potential viewers than promotions featuring both Tomlin and her costar Jane Fonda.“ Getestet wurde also ein Bild nur mit Tomlin gegen Bilder mit beiden; gemessen wurden Klicks möglicher Zuschauer*innen. Der Einwand kam aus dem Content-Team: „The content team worried that excluding Fonda would alienate the actress and possibly violate her contract.“ Ob der Vertrag wirklich verletzt worden wäre, sagt Thomke nicht – nur „possibly“. Entschieden hat Netflix nach Streit: „After heated debates that pitted empirical evidence against ‚strategic considerations,‘ Netflix chose to use images that included both actresses, even though customer data didn’t support the decision.“ Wer genau entschied, nennt er nicht; die Führung war „torn“. Sein Punkt ist die Offenheit: „However, the experimental evidence made the decision more transparent. Nobody could argue that Fonda should remain in the promotion because customers preferred it.“',
      quelle: `${THOMKE}, S. 127`,
    },
    fragen: [
      {
        frage: 'Wann ist es legitim, gegen den Beleg zu entscheiden?',
        antwort: 'Ausnahmsweise, wenn es einen Grund gibt, den der Test nicht misst – bei Netflix die Sorge um Fonda und ihren Vertrag. Der Grund wird offen festgehalten, der Beleg bleibt sichtbar.',
      },
      {
        frage: 'Muss so eine Zeile anders aussehen als die anderen?',
        antwort: 'Nein: „Beleg: … → darum: …“ nennt den Beleg, der dagegen spricht; darunter „Weicht ab von ‚Wir entscheiden vorher‘? Grund: …“ (Anpassung des Kurses).',
      },
      {
        frage: 'Was ist der Unterschied zwischen „gegen den Beleg entscheiden“ und „das Ergebnis umdeuten“?',
        antwort: 'Wer umdeutet, ändert den Beleg: „When results align with our beliefs, we accept them without hesitation; when they don’t, we probe them relentlessly“ (S. 126) – am Ende steht da, das Ergebnis habe nicht gezählt. Netflix hat den Beleg stehen lassen – Tomlin allein brachte mehr Klicks – und offen einen anderen Grund dagegengestellt: die Sorge um Fonda und womöglich ihren Vertrag (S. 127). Darum bleibt die Regel von Kohl’s, „commit to abide by results“ (S. 85): Die Ausnahme ist „a conscious choice“ (S. 127), keine neue Lesart der Zahlen.',
      },
      {
        frage: 'Kaffeebar: E1 ergibt 12 von 30, die Karte sagt Concierge. Was, wenn das Team nicht will?',
        antwort: 'Das geht, wenn es offen dasteht. Beispiel des Kurses: Die Bar kann um 7:30 keine Bestellungen von Hand annehmen. Auf der Lernkarte: „Beleg: gestützt → darum: …“ mit dem, was ihr stattdessen tut, und „Weicht ab von ‚Wir entscheiden vorher‘? Ja – die Bar kann um 7:30 keine Bestellungen von Hand annehmen.“ Die 12 von 30 bleiben stehen. Nicht in Ordnung: „12 ist eigentlich nicht genug“ – die Schwelle war 10, das wäre Umdeuten. Offen festhalten heißt also: Ergebnis, Entscheidung dagegen und Grund stehen zusammen auf der Lernkarte (Hinweis des Kurses; Thomke verlangt Transparenz, S. 127, nicht diese Form).',
      },
    ],
    ueberleitung: 'Zum Schluss: Wo steht euer Aufsteller?',
  },

  uebertrag: {
    live: [
      'Folien-Satz vorlesen: Wo kommt eure Zielgruppe ohnehin vorbei?',
      'Theorie: ohne echten Ort liefe E1 als simulierter Moment.',
      'Weiter: Story Map – aus dem Spitzenreiter wird Slice 1.',
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
