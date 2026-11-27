import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/concept-story.astro.
// Tag 3 (21.11.): Story-Bogen nur als Theorie. Tag 4 (28.11., NDU-66): Die Theorie läuft als eigener Teil vor der Übung,
// alle 17 Folien von story-bogen bis drei-storys, in dieser Reihenfolge (Fable-Durchsicht 26.11.: concept-story vor flach,
// hoehepunkt darin aufgegangen, flach – hoch – hoch-lehre – baut-mit als iPhone-Strang, drei-storys als Ausblick am Ende).
// Danach 30 min Übung (vorgehen): sieben Stationen auf Miro in „T4 · 0 · Concept Story · Produkt n“ mit der Flach-Probe als Check (seit 27.11.),
// festhalten – allein, Markus 1:1, keine Erzählrunde. Die Story bleibt auf Miro – keine Datei (Entscheidung 26.11. abends).
// Zeit: Die Sprechzeiten in den live-Stichworten ergeben zusammen rund 23 min; die Uhrzeiten des Blocks stehen in tag-4.astro.
// Vorwissen: „unsicher“ – „storyboard“ aus dem Entrepreneur Lab genannt (vorwissen.ts). Zuerst fragen; das Storyboard
// selbst kommt bei der Usage Story, hier geht es um den Bogen dahinter.
// Lichaw liegt als EPUB vor: Quellen mit Kapitel + Abschnitt + Seite nach den Seitenmarken der Druckausgabe im EPUB.
// Was nicht von Lichaw stammt, ist markiert: ältere Notizen mit „Kursformulierung“ oder „Kursregel“, neuere mit „Übertrag des Kurses“,
// „Beispiel des Kurses“ bzw. „Kursbeispiel“ (Kaffeebar) oder „Lesart des Kurses“ bzw. „Lesart dieses Kurses“, oft mit „nicht bei Lichaw“.
const LICHAW = 'Donna Lichaw, The User’s Journey';

export const NOTIZEN_CONCEPT_STORY: Record<string, Notiz> = {
  'story-bogen': {
    live: [
      'Zeit: Ist-Zeit notieren; Sprechzeit ~1 min.',
      'Fragen: Wer hat im Entrepreneur Lab ein Storyboard gezeichnet?',
      '„Ihr wisst nicht, ob eure Idee gut ist? Lichaw sagt: Das ist eine Geschichte.“',
      'Bogen zeigen: x Zeit, y Spannung; Cliffhanger endet am Gipfel.',
    ],
    verstaendnis: {
      frage: 'Was ist ein Cliffhanger auf dieser Kurve?',
      antwort: 'Eine Geschichte, die endet, während die Spannung noch steigt oder am Gipfel steht – sie klingt nicht ab (Kap. 2, Story Has a Structure).',
      falsch: '„Ein besonders spannendes Ende“ – gemeint ist ein fehlendes Ende.',
    },
    geschichte: {
      text: '2004 zeigte Lichaw im Master ihren Dokumentarfilm zum Jahresende vor rund 100 Leuten. Kaum war der Film aus, noch bevor das Licht anging, meldete sich ein Kommilitone: „I can’t believe you made me sit through that. What was the point?“ Ihr Urteil über den eigenen Film: „no conflict, no climax, and no resolution—ergo, no story“. Ein Produkt ist wie ein Film etwas, das Menschen erleben – es braucht eine Geschichte als Fundament.',
      quelle: `${LICHAW}, Kap. 1 (Einleitung), S. 2`,
    },
    kern: [
      {
        text: 'Warum für euch: „Let’s say that you want to build a new product, but aren’t sure if it’s a good idea? That’s a story.“ Ebenso: „You want to figure out how your product should work? Story.“ Und vor jedem neuen Projekt drei Fragen: „What’s the story? Who is the hero? What is the hero’s goal?“',
        quelle: `${LICHAW}, Introduction (vor Kap. 1), S. xiii–xiv`,
      },
      {
        text: 'Bezug: Hauptfigur und Ziel stehen seit Tag 3 im Kundenprofil (Segment, Jobs); offen ist die erste Frage. Im Handout steht dazu eine Kursregel: Am Bogen prüft ihr, was in den Prototyp kommt. Sie stützt sich auf Lichaws iPhone-Beispiel (Folie „Die Story entscheidet, was ihr baut“).',
        quelle: 'Kursregel; vgl. Lichaw, Kap. 3, Supporting the Story, S. 33',
      },
      {
        text: '„Whether you plan for it or not, your customers use their story-driven brains to understand your product and what it’s like to use your product.“ Und zum Weitererzählen: „The better the story, the better the experience, the better the word of mouth.“',
        quelle: `${LICHAW}, Kap. 1, Why Story?`,
      },
      {
        text: 'Aristoteles: Jede Geschichte braucht Figuren, Ziele und Konflikt, verbunden durch eine Struktur. Anfang, Mitte, Ende; die Mitte dauert am längsten. „When the story doesn’t wind down and instead ends while the action is still rising or at a peak, the story is called a cliffhanger.“',
        quelle: `${LICHAW}, Kap. 2 (Einleitung) und Story Has a Structure, Abb. 2.1–2.2`,
      },
      {
        text: 'Storyboard (Vorwissen): bei Lichaw eines von mehreren Mitteln, eine Storyline zu zeigen – „a visual representation of your story that is laid out as panels in a grid“, höchstens neun Felder. Es kommt bei der Usage Story.',
        quelle: `${LICHAW}, Kap. 7, Storyboard`,
      },
    ],
    fragen: [
      {
        frage: 'Ist das nicht einfach Storytelling fürs Marketing?',
        antwort: 'Nein. Lichaw: „concept stories don’t just help you figure out how to talk about a product, but how to build the product“ (Kap. 3, Supporting the Story, S. 33). Dazu kommt eine eigene Folie.',
      },
    ],
    ueberleitung: 'Probiert den Bogen gleich aus – an einem einzigen Bild.',
  },

  facetime: {
    live: [
      'Zeit: Sprechzeit ~1 min.',
      'Bild zeigen, nichts sagen.',
      'Fragen: Welches Produkt? Woran erkennt ihr das? Antworten laut.',
      'Nachfragen, bis die Geschichte da ist: wer, warum lachen, warum Video?',
      '„Euer Gehirn sucht in allem, was es sieht, eine Geschichte – mit Struktur.“',
    ],
    uebung: { dauer: '1 min', form: 'Antworten laut, je ein Satz; dann aufdecken' },
    verstaendnis: {
      frage: 'Woher wisst ihr, dass es FaceTime ist?',
      antwort: 'Aus der Geschichte, die ihr ergänzt: ältere Menschen, vielleicht Großeltern; sie lachen über die Enkel, die weit weg wohnen; hinfliegen geht nicht regelmäßig; also anrufen, mit Video. Nichts davon steht im Bild.',
      falsch: '„Weil man ein iPhone sieht“ – das Gerät allein sagt nicht, welche App.',
    },
    kern: [
      {
        text: 'Abb. 2.11, ein Standbild aus einem Apple-Werbespot. Lichaw fragt: „What do you see? How do you know that these people are using FaceTime?“ Die Antwort ist eine erschlossene Geschichte: „This is the type of computational math that your brain makes during a series of microseconds“. Und: „Your brain seeks out a story in the data it consumes. And that story has a structure to it, whether you realize it or not.“',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story, Abb. 2.11`,
      },
      {
        text: '„Story is not only a tool your brain uses to understand what you see, it’s a tool your brain uses to understand what you experience.“ Die schnelle Rechnung beim ersten Hören von einem Produkt heißt in Kap. 3 „the mental calculation“ – die Concept Story.',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story; Kap. 3, How Concept Stories Work, S. 24`,
      },
    ],
    ablauf: {
      schritte: [
        'Bild zeigen, Frage stellen: Welches Produkt? Woran erkennt ihr das?',
        'Antworten laut, je ein Satz. Nachfragen, bis Figur, Ziel und Problem genannt sind.',
        'Aufdecken: FaceTime, dann der Satz zum Gehirn.',
      ],
      achten: [
        'Kommt eine witzige falsche Antwort (bei Lichaw: „Tinder for seniors“), aufnehmen: Auch die hat eine Geschichte, mit der man einen Prototyp testen könnte.',
      ],
      aufloesung: 'FaceTime. Erkannt wird es nicht am Gerät, sondern an der Geschichte, die alle in Sekundenbruchteilen ergänzen (Kap. 2, Building Products with Story).',
    },
    ueberleitung: 'Diese Geschichte hat eine Struktur – sieben Stationen, an einem Film.',
  },

  stationen: {
    live: [
      'Fragen: Wer kennt „Zurück in die Zukunft“?',
      'Zeit: Sprechzeit ~2 min; Film an der Abbildung, je Station ein Satz.',
      '„Ihr müsst Marty nicht mögen. Ihr müsst nur verstehen, was er will.“',
      'Krise betonen: Nichts hat funktioniert, das Ziel ist weiter weg denn je.',
      'Bei Bedarf: Film unbekannt – Drachen der Abbildung erzählen.',
    ],
    verstaendnis: {
      frage: 'Worin unterscheiden sich Auslöser und Krise?',
      antwort: 'Der Auslöser ist das Problem, das die Figur losschickt (Marty strandet 1955). Die Krise ist der Punkt des größten Konflikts auf dem Weg: Nichts hat funktioniert (er beginnt zu verschwinden). Der Höhepunkt löst beides.',
      falsch: '„Die Krise ist das Problem“ – das Problem steht schon am Auslöser.',
    },
    // Je Station ein Eintrag, immer gleich gebaut: Was sie tut – Frage (Kap. 3 Concept Story, Kap. 5 Usage Story) – Film (Kap. 2) –
    // Kaffeebar (Kursbeispiel, wörtlich wie concept-story#beispiel und usage-story#beispiel) – Falle.
    kern: [
      {
        text: 'Sieben Stationen auf einem Bogen: „Every narrative arc has specific key plot points and sequences“ – Exposition, Inciting incident or problem, Rising action, Crisis, Climax or resolution, Falling action or denouement, End (Abb. 2.3). Lichaw begründet die Zahl sieben nicht eigens; die Stationen sind die Punkte auf dem Bogen aus Abb. 2.2, der bis zum Gipfel steigt und dann abklingt. Dieselben sieben Stationen nutzt sie für die Concept Story (Kap. 3) und die Usage Story (Kap. 5), jeweils mit eigenen Fragen. Die Fragen unten stammen von dort.',
        quelle: `${LICHAW}, Kap. 2, Story Has a Structure, S. 9–10, Abb. 2.2–2.3; Kap. 3, How Concept Stories Work, S. 24–25; Kap. 5, How Usage Stories Work, S. 71`,
      },
      {
        text: '1 Exposition. Was sie tut: „During the exposition, you are introduced to the world of the story, the characters, and some kind of big goal. There is a main character, and that character wants something. Big.“ Sie soll euch an die Figur binden: „At the very least, it compels you to empathize with them.“ Frage: Wer? Welche Ziele? Was steht im Weg? – bei Lichaw „Who is your target customer?“, „What are her goals as they relate to your product?“, „What is the problem or impediment standing in the way of this person meeting her goal?“ (Usage Story). Für die Concept Story fragt sie statt nach dem Hindernis: „What’s good in her world as it relates to your product or service?“ – das Hindernis kommt dort erst an Station 2. Film: Marty McFly lebt in Hill Valley, „any suburb USA“. „His family isn’t very ambitious, but Marty has plans. He’s going to make something of himself.“ Sein Freund Doc, ein verrückter Wissenschaftler, hat eine Zeitmaschine gebaut. „You don’t have to like him. You just have to understand him, his goals and why he wants to pursue them.“ Mehr sagt Lichaw zur Exposition nicht: Was schief ist, ist die Familie ohne Ehrgeiz; was Marty vor 1955 im Weg steht, nennt sie nicht. Eine Band nennt sie nicht; die Gitarre kommt erst am Höhepunkt, die Freundin am Ende, Namen wie Jennifer gar nicht. Kaffeebar (Kursbeispiel): Concept Story – Pendler*innen, werktags zwischen 7:15 und 7:45, mit festem Morgenzug; gut in ihrer Welt: Die Bar liegt am Weg, die Barista kennt die Stammgäste (G3, I3-6), und „wenn der erste Schluck passt, ist der Morgen gerettet“ (I1-4); großes Ziel: auf dem Weg zum Zug Kaffee besorgen (J1), ohne gehetzt in den Tag zu starten (J2). Usage Story – I1, Zug 7:38, „eigentlich immer knapp dran“ (I1-1); will Kaffee, ohne den Zug zu riskieren (J1, P1). Falle: nur die Person beschreiben, ohne dass sie etwas will. Lichaw: „Your character is someone, and she wants something.“',
        quelle: `${LICHAW}, Kap. 2, Exposition, S. 11, Abb. 2.4; Kap. 3, Mapping a Concept Story, S. 34; Kap. 5, Exposition, S. 71–72, und Mapping the Usage Story, S. 82–83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '2 Auslöser (Inciting incident). Was er tut: „The inciting incident is the moment where something changes or goes dramatically wrong in the world of the story. A problem surfaces and gets in the way of the character meeting his big goal.“ Der Moment, in dem die Figur ihre sichere Welt verlässt, heißt „call to action“. Fürs Publikum ist er „the first hook“: „It’s what gets you hooked.“ Frage: Concept Story – „What is her problem or pain point?“; Usage Story – „What will kick-start the customer on this specific journey?“, ein Ereignis oder Call to Action, das zum Problem der Concept Story passt („This step should map out onto the problem you outlined in your concept story.“). Film: Militante schießen Doc auf einem Parkplatz nieder, weil er ihnen Plutonium gestohlen hat. Auf der Flucht fährt Marty mit der Zeitmaschine nach 1955 und merkt, dass er nicht zurückkommt – „a meaty enough problem to name the movie after“. Sein Ruf zum Handeln: „to get back to the future“. Kaffeebar (Kursbeispiel): Concept Story – sie wissen nicht, ob sich der Kaffee bis zur Abfahrt ausgeht (P1); bei mehr als fünf Leuten reicht die Zeit nicht (P2). Usage Story – 7:27, „Ich komme in die Halle und entscheide.“: Schlange bis zur Tür, an der Tür der Aufsteller. Falle: kein echtes Problem. Lichaw: „If there isn’t a problem, then there is no solution…and without either, there is no story.“ Groß muss es nicht sein: „It can be as simple as boredom.“',
        quelle: `${LICHAW}, Kap. 2, Inciting Incident or Problem, S. 11–12, Abb. 2.5; Kap. 3, Inciting Incident/Problem, S. 26; Mapping a Concept Story, S. 34; Kap. 5, Inciting Incident/Problem, S. 72; Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '3 Steigende Handlung. Was sie tut: Die Figur macht sich auf, das Unrecht zu richten; „A good story escalates during the rising action, creating new tensions and conflicts that help move the story forward.“ Und: „Without conflict, endings come too easily, and the audience is unconvinced or bored or both.“ Frage: Concept Story – „What is the name of your product?“, „What type of product is it?“; hier kommt das Produkt „to the rescue“. Usage Story – „What is the first action that the user should take?“, „What’s next?“, „And next?“; jeder Schritt soll interessanter sein als der letzte. Film: Marty sucht den Doc von 1955; zusammen versuchen sie, ihn heimzubringen. „But they can’t solve the problem, or the movie would end.“ Er trifft seine junge Mutter, die sich in ihn verguckt, und Biff, den Erzfeind seines Vaters, der zu seinem eigenen wird. „Things get tense. And more tense.“ Kaffeebar (Kursbeispiel): Concept Story – „Gleis-1-Express“ – bestellen im Browser, per QR-Code an der Hallentür, abholen an der Express-Ausgabe. Usage Story – scannen → eins aus drei → 7:38 eintippen (die Tasks aus Slice 1). Falle: in der Concept Story eine Funktionsliste statt Name und Art. Lichaw: „Because concept stories are short and conceptual in nature, the rising action shouldn’t be too complicated or wordy.“',
        quelle: `${LICHAW}, Kap. 2, Rising Action, S. 12–13, Abb. 2.6; Kap. 3, Rising Action, S. 26; Mapping a Concept Story, S. 35; Kap. 5, Rising Action, S. 72; Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '4 Krise. Was sie tut: der Punkt (oder die Punkte) größten Konflikts, „the point of no return. Nothing the hero has done has worked, and he is further from the goal than ever.“ Aufgeben geht nicht mehr: „Defeat or success is the only option.“ Frage: Concept Story – „What does the competition look like?“, „What mental hurdles might keep her from adopting your solution?“; Usage Story – „What might get in her way of solving her problem and meeting her goal?“, greifbar wie eine Paywall oder emotional wie Langeweile. Film: Marty ist nah dran, heimzukommen. Doch seine Mutter verliebt sich in ihn statt in seinen Vater; vielleicht wird er nie geboren, und er beginnt zu verschwinden, auf der Bühne beim Schulball (Abb. 2.7). Erst müssen die Eltern zusammenfinden, dann muss er immer noch heimkommen. Kaffeebar (Kursbeispiel): Concept Story – der Automat, „halt Notlösung, aber er ist schnell“ (I1-3), oder gar kein Kaffee: „Bei mehr als fünf Leuten lass ich es“ (I3-4); dazu der Widerstand gegen Neues: im Gehen am Handy tippen? Usage Story – tippen im Gehen und der Zweifel, ob es reicht (P1, I3-3). Falle: nur Konkurrenzprodukte aufzählen. Lichaw zählt auch „an alternative way that people currently solve their problems“ und „resistance to change or people not wanting to adopt something new“ dazu. Fehlt die Krise ganz, ist die Story flach: „A concept without a conflict and a resulting climax is a flat story—literally just a line.“',
        quelle: `${LICHAW}, Kap. 2, Crisis, S. 13–14, Abb. 2.7; Kap. 3, Crisis, S. 27; Climax/Resolution, S. 28; Mapping a Concept Story, S. 35; Kap. 5, Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '5 Höhepunkt (Climax or resolution). Was er tut: „It’s the most important part of the story. It’s the high point.“ Hier entscheiden sich Schicksal und Richtung; aufgelöst werden „the main problem from the inciting incident and the hurdle from the crisis“. „Climax is why you are glad that you tuned in and stayed tuned in.“ Und: „it’s what you remember most.“ Frage: Concept Story – „What will help her resolve her problem and overcome a crisis moment or resistance?“, „What’s your product’s primary value proposition or differentiator?“; Usage Story – „What is the high point of this experience or flow?“, „What will make all of her conflict, crisis, and work she puts in so far be worthwhile?“ Film: Der Höhepunkt beginnt, als sich Martys Eltern beim Schulball küssen; jetzt kann er sein Lied auf der Gitarre zu Ende spielen. „But wait! There’s more!“: Uhrturm und Blitz. Doc nutzt den Blitz als Energie für die Zeitmaschine: „In a bolt of lightning, boom, Marty gets catapulted back to the future.“ Erst löst sich also die Hürde der Krise (die Eltern), dann das Problem des Auslösers (heimkommen). Kaffeebar (Kursbeispiel): „Fertig 7:31. Dein Zug fährt 7:38.“ – Gewissheit statt Glücksspiel; anders als der Automat (schnell, aber Brühe) und die Schlange (Glücksspiel). In der Usage Story geht I1 an der Schlange vorbei. Falle: „leicht zu bedienen“ als Höhepunkt. Lichaw: „But ‚easy to use‘ is a pretty boring story when difficulty isn’t really the problem.“ Und wer nur das Problem löst, bekommt eine Story, die fließt, „yet be anti-climactic“.',
        quelle: `${LICHAW}, Kap. 2, Climax or Resolution, S. 14–15, Abb. 2.8; Kap. 3, Climax/Resolution, S. 28; Mapping a Concept Story, S. 35; Kap. 5, Climax/Resolution, S. 73; Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '6 Fallende Handlung (Denouement). Was sie tut: Abschluss. „Humans, it turns out, need closure. Stories, likewise, need closure so that humans can feel closure.“ Denouement kommt aus dem Französischen, „to unknot“: Der Konflikt ist gelöst, das Tempo fällt bis zur Schlussszene. Aber kurz: „Ideally, the falling action or denouement should happen as quickly as possible.“ Frage: Concept Story – „What do you want people to think, feel, or envision after learning about your product?“, ein Gedanke, keine Handlung: „Falling action for concept stories should still remain in the realm of thought, rather than action.“ Usage Story – „What then?“, der letzte Schritt im Ablauf, „as quickly as possible“. Film: Marty kommt heim – „the hero goes home“. Und zu Hause ist es besser als zu Beginn: „Marty’s parents are successful. Biff is his family’s servant. Marty got the truck he always wanted.“ Kaffeebar (Kursbeispiel): Concept Story – „Ich muss nicht mehr auf die Uhr schauen“, als Annahme, das Gegenbild zu „Wenn ich auf die Uhr schauen muss, geh ich“ (I2-2). Usage Story – Express-Ausgabe, Nummer am Bildschirm, bar bezahlt; hier ist die fallende Handlung ein Schritt, in der Concept Story ein Gedanke. Falle: in der Concept Story eine Handlung statt eines Gedankens schreiben oder den Gedanken für sicher halten. Lichaw: „If you posit this falling action as a hypothesis, you should test it with real people.“',
        quelle: `${LICHAW}, Kap. 2, Falling Action or Denouement, S. 15–16, Abb. 2.9; Kap. 3, Falling Action, S. 28–29; Mapping a Concept Story, S. 35; Kap. 5, Falling Action, S. 73; Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
      {
        text: '7 Ende. Was es tut: „Quite literally, the end is the end. Characters grow throughout a story and should be changed by the end.“ Das große Ziel aus der Exposition: „How did it all work out?“ Frage: Concept Story – „What happens when the user meets her goal?“ und fürs Geschäft „What’s the business goal? How will you know you’re on the right path?“; Usage Story – „Where does the user end up—both in terms of character development and logistics?“, „Is this really the end or perhaps the starting point of her next story?“ Film: Martys Freundin fragt, ob alles in Ordnung sei. „Everything,“ Marty says, „is perfect.“ Sie umarmen sich. Dann kommt Doc die Einfahrt hoch, es gibt ein neues Problem – der Anfang der Fortsetzung („serial stories“). Kaffeebar (Kursbeispiel): Concept Story – Kaffee in der Hand, bevor der Zug einfährt (G1); fürs Geschäft: mehr Pendler*innen steigen morgens mit Kaffee in den Zug, gemessen an Bestellungen über den Code zwischen 7:15 und 7:45. Usage Story – 7:34 am Bahnsteig, im Zug der erste Schluck (I1-4); die nächste Episode wäre Slice 2. Falle: nur das Ziel der Figur nennen und das Geschäft vergessen. Lichaw: „your high-level business goal or mission must also resonate with the story.“ Oder die Figur kommt unverändert heim: „the main character never just ends up at home after a journey“.',
        quelle: `${LICHAW}, Kap. 2, End, S. 17–18, Abb. 2.10; Kap. 3, End, S. 29; Mapping a Concept Story, S. 35; Kap. 5, End, S. 73–74; Mapping the Usage Story, S. 83. Kaffeebar: Kursbeispiel (concept-story#beispiel, usage-story#beispiel)`,
      },
    ],
    geschichte: {
      text: 'Zurück in die Zukunft (1985), Station für Station: Marty lebt in Hill Valley, seine Familie hat keinen Ehrgeiz, er hat Pläne; sein Freund Doc hat eine Zeitmaschine gebaut (Exposition). Doc wird angeschossen, Marty landet 1955 und kommt nicht zurück (Auslöser). Mit dem jungen Doc sucht er einen Weg; seine Mutter verliebt sich in ihn, Biff wird sein Gegner (steigende Handlung). Weil die Eltern nicht zusammenfinden, beginnt er zu verschwinden (Krise). Die Eltern küssen sich, der Blitz am Uhrturm schickt ihn zurück (Höhepunkt). Zu Hause ist es besser als vorher: Die Eltern sind erfolgreich, Biff arbeitet für die Familie, Marty hat den Truck, den er immer wollte (fallende Handlung). Alles ist perfekt, sagt Marty (Ende) – bis Doc mit dem nächsten Problem in der Einfahrt steht.',
      quelle: `${LICHAW}, Kap. 2, Story Has a Structure, S. 11–18, Abb. 2.4–2.10`,
    },
    fragen: [
      {
        frage: 'Warum sieben Stationen – reichen nicht Anfang, Mitte, Ende?',
        antwort: 'Lichaw begründet die Zahl nicht. Sie beginnt mit Anfang, Mitte, Ende (Abb. 2.1) und dem Bogen (Abb. 2.2) und benennt dann die Punkte darauf: „Every narrative arc has specific key plot points and sequences“ (Kap. 2, Story Has a Structure, S. 10). Was die Feinteilung zeigt, sieht man an ihrem iPhone-Gegenbeispiel: Die Patent-Story hat Exposition, Auslöser, steigende Handlung und Ende; ihr fehlen „two key plot points that give stories their height: crisis and climax“ (Kap. 3, Avoiding the Anticlimactic, S. 32). Dass man das mit nur drei Teilen nicht sähe, ist die Lesart des Kurses.',
      },
      {
        frage: 'Warum hört die Geschichte nicht am Höhepunkt auf?',
        antwort: 'Weil sie sonst so unbefriedigend wäre wie ein Cliffhanger: „Stories can’t just end on a high point, or they’re as unsatisfying as a cliffhanger.“ (Kap. 2, Climax or Resolution, S. 15). Lichaws Belege: das halbe Telefongespräch, „a halfalogue“, das das Gehirn ungefragt zu Ende bringen will, und der Zauberer von Oz, wenn er nach dem Sieg über die Hexe endete – „What about Kansas?“ (Kap. 2, Falling Action or Denouement, S. 15–16). Für Produkte: „The flow can’t just end on a high point—it has to go somewhere and take the user with it.“ (Kap. 5, Falling Action, S. 73).',
      },
      {
        frage: 'Warum sollen fallende Handlung und Ende so kurz sein?',
        antwort: '„As much as humans need closure, they’re also impatient beings.“ Abschluss heißt nicht, ihn „dragged out with a 10-minute long ticker-tape parade“ (Kap. 2, Falling Action or Denouement, S. 16). Die Grenze zwischen Höhepunkt, fallender Handlung und Ende „can be blurry and happen so quickly that it’s hard to discern the difference between one and another“ (ebd.). Im Storyboard aus neun Feldern gehört der Höhepunkt deshalb ins siebte: „your climax or resolution leads to a very swift ending“ (Kap. 7, Storyboard, S. 117–118).',
      },
      {
        frage: 'Was gehört in eine gute Exposition? Gibt es Beispiele?',
        antwort: 'Vier Dinge: eine Person, ihre Welt und ihr Ziel (Kap. 2, Exposition, S. 11) und was ihr im Weg steht – danach fragt Lichaw nur in Kap. 5 („What is the problem or impediment standing in the way of this person meeting her goal?“, Mapping the Usage Story, S. 83). Lichaws eigenes Beispiel ist die Studieninteressierte: Will sie die richtige Schule, um einmal Tierärztin zu werden, will sie Berufe erkunden oder mit Gleichgesinnten studieren? „Each exposition is the beginning of a very different story.“ (Kap. 5, Exposition, S. 72). Beispiele des Kurses, nicht bei Lichaw: (a) Kaffeebar – „Pendler I1, Zug 7:38, eigentlich immer knapp dran. Die Bar liegt am Weg, die Barista kennt die Stammgäste. Er will Kaffee, ohne den Zug zu riskieren – ob es sich ausgeht, weiß er erst in der Halle.“ (I1-1, G3, J1, P1). (b) Lern-App – „Studentin im zweiten Semester, arbeitet 20 Stunden die Woche neben dem Studium, lernt abends in der Bahn. Sie will die Statistik-Prüfung im ersten Anlauf schaffen – aber die Übungsblätter gibt es nur als PDF für den Laptop.“ (c) Rechnungs-Tool – „Selbstständiger Grafiker mit drei Kund*innen im Monat, schreibt die Rechnungen am Monatsende in Word. Er will pünktlich bezahlt werden – aber wer noch nicht gezahlt hat, merkt er erst Wochen später.“ In der Concept Story wird das Hindernis zum Auslöser (Station 2); in ihrer Exposition steht stattdessen, was in der Welt der Figur gut ist.',
      },
      {
        frage: 'Reicht eine Persona-Beschreibung als Exposition?',
        antwort: 'Nein. Schwach (Beispiel des Kurses): „Pendler, 34, fährt jeden Tag mit dem Zug, trinkt gern Kaffee, hat ein Smartphone, hört Podcasts.“ Alles kann stimmen, aber niemand will etwas – also kann auch nichts schiefgehen, und der Auslöser hat nichts zu stören. Stark: „Pendler I1, Zug 7:38, eigentlich immer knapp dran (I1-1). Er will Kaffee, ohne den Zug zu riskieren (J1). Ob es sich ausgeht, weiß er erst in der Halle (P1).“ Lichaw: „Your character is someone, and she wants something.“ (Kap. 5, Exposition, S. 72) und „There is a main character, and that character wants something. Big.“ (Kap. 2, Exposition, S. 11).',
      },
    ],
    ueberleitung: 'Wer ist die Figur in eurer Geschichte? Nicht ihr.',
  },

  hauptfigur: {
    live: [
      '„Die Hauptfigur ist die Person am anderen Ende – die, die es erlebt.“',
      'Abbildung: jede Linie eine Figur, ein eigener Weg.',
      'Brücke: Segment aus dem Kundenprofil von Tag 3.',
      'Falle: das Produkt oder das Team als Held erzählen.',
      'Zeit: Sprechzeit ~1 min.',
    ],
    geschichte: {
      text: '„In 2006, people said that they wanted an iPod that made phone calls. In 2007, instead they got a new way to communicate.“ Lichaw rät, so oft „warum“ zu fragen, bis das eigentliche Ziel da ist: Ein iPod, der telefoniert? Warum? Weil es bequem wäre. Warum? Weil man nur ein Gerät tragen will. Warum? … Für euch: Das große Ziel eurer Hauptfigur steht im Kundenprofil unter den Jobs, nicht in eurer Idee.',
      quelle: `${LICHAW}, Kap. 8, Goals Can Change, S. 135; „Für euch“ ist Kursformulierung`,
    },
    kern: [
      {
        text: 'Die Hauptfigur: „your main character must be the person on the other end, i.e., the person experiencing the story“. Figuren sind keine erfundenen Traumkund*innen: „They are based on real people, real goals, real behaviors, and real stories.“ Erfinden geht nur – „as long as you validate it later“.',
        quelle: `${LICHAW}, Kap. 8, Stories Are Character-Driven, S. 134`,
      },
      {
        text: '„Systems are complex. Human experiences are linear.“ Jede Figur, jeder Anwendungsfall, jeder wichtige Weg bekommt eine eigene Story; Storys können sich kreuzen.',
        quelle: `${LICHAW}, Kap. 8, Choose Your Own Adventure, S. 137–138, Abb. 8.2`,
      },
      {
        text: '„People don’t care about your product or brand. They care about themselves.“ Nach Kathy Sierra: Es zählt, was die Menschen mit dem Produkt können, nicht, was das Produkt kann.',
        quelle: `${LICHAW}, Kap. 2, Building Products with Story`,
      },
    ],
    fragen: [
      {
        frage: 'Wir haben mehrere Segmente. Mehrere Storys?',
        antwort: 'Eine: für das Segment eures Kundenprofils. Lichaw: Unterscheiden sich die Storys stark, getrennt entwerfen; meist reicht eine mit notierten Unterschieden (Kap. 3, Falling Action, Hinweis „Different strokes for different personas?“, S. 29).',
      },
    ],
    ueberleitung: 'Eine Figur und ein Ziel reichen noch nicht. Probe an einer Geschichte, die ihr kennt.',
  },

  pinocchio: {
    live: [
      'Zeit: Sprechzeit ~1 min; vier Kästen vorlesen, nichts erklären.',
      'Fragen: Was fehlt? Antworten laut, je ein Satz.',
      'Noch nicht aufdecken – erst alle drei gehört.',
      '„Ohne Konflikt ist es keine Geschichte – nur Dinge, die passieren.“',
      'Falle: „Es ist zu kurz“ – auch lang bliebe es flach.',
    ],
    uebung: { dauer: '1 min', form: 'Antworten laut, je ein Satz; dann aufdecken' },
    verstaendnis: {
      frage: 'Figur und Ziel sind da. Warum ist es trotzdem keine Geschichte?',
      antwort: 'Es wirkt keine Kraft gegen die Figur. Ohne Konflikt ist es eine Folge von Ereignissen („a series of events—stuff happening“).',
      falsch: '„Weil Details fehlen“ – mehr Details machen aus einer Linie keinen Bogen.',
    },
    kern: [
      {
        text: '„Once upon a time, there was a wooden doll named Pinocchio. He wanted to become a real human boy. So he went out, bought some magic, and transformed into a boy. The end.“ – „Stories wouldn’t be stories without conflict. They would be a series of events—stuff happening.“ Jede Figur und jedes Ziel braucht eine Kraft, die dagegen wirkt.',
        quelle: `${LICHAW}, Kap. 8, Conflict Is Key, S. 136`,
      },
      {
        text: 'Für Produkte: „it is not your job to place obstacles in the way, but instead to consider them and plan around them“. Die Hürden gibt es schon; ihr plant sie ein. Dass sie in euren Interviews stehen, ist ein Übertrag des Kurses (im Handout).',
        quelle: `${LICHAW}, Kap. 8, Conflict Is Key, S. 136; Übertrag des Kurses`,
      },
    ],
    ablauf: {
      schritte: [
        'Folie zeigen, die vier Kästen vorlesen.',
        'Antworten laut: Was fehlt? Nicht werten.',
        'Aufdecken: Figur und Ziel sind da – nichts steht dazwischen. Dann der zweite Punkt.',
      ],
      aufloesung: 'Es fehlt der Konflikt: eine Kraft, die gegen Figur und Ziel wirkt. Lichaw: „Stories wouldn’t be stories without conflict.“ (Kap. 8, Conflict Is Key, S. 136)',
    },
    ueberleitung: 'Lichaw macht daraus eine Formel.',
  },

  'a-mal-b': {
    live: [
      'Zeit: Sprechzeit ~1 min; Abbildung: zwei Pfeile, ein Gipfel.',
      '„A ist die Kraft zum Ziel, B die Kraft dagegen. Zusammen ergeben sie den Gipfel.“',
      'iPhone: A zwei Geräte in einem, B kein neues Gerät kaufen.',
      'Fragen: Was ist B bei der Kaffeebar?',
      'Falle: Zahl der Lattes nennen – das Buch widerspricht sich.',
    ],
    verstaendnis: {
      frage: 'Was ist B bei der Kaffeebar?',
      antwort: 'Was gegen die Pendlerin wirkt: Der Automat ist schon schnell (I1-3), verzichten geht auch (I3-4) – und ob sie im Gehen bestellen, ist offen (Annahme A3).',
      falsch: '„Die Schlange“ – die Schlange ist das Problem (Auslöser), B wirkt gegen die Lösung.',
    },
    kern: [
      {
        text: '„A represents forward momentum, which is the force that a character exerts to meet his or her goal with your product or service. B is the force or forces that act against your character“ – multipliziert ergeben sie C, den Höhepunkt. iPhone: A will ein 2-in-1-Gerät, um besser zu kommunizieren; B will kein neues Gerät kaufen oder fürchtet die Bedienung. „Then C is what wins: a 3-in-1 device that works like magic and is easy to use.“',
        quelle: `${LICHAW}, Kap. 8, Math Is Fun, S. 136–137, Abb. 8.1`,
      },
      {
        text: '„Alternativen, Zweifel, Aufwand“ auf der Folie ist Kursformulierung für B. Nicht zitieren: Kap. 7 (Build and Communicate) nennt 1.000 bestellte Lattes, Kap. 8 (Math Is Fun) 4.000.',
        quelle: `Kursformulierung; ${LICHAW}, Kap. 7 und Kap. 8, S. 137`,
      },
    ],
    fragen: [
      {
        frage: 'Warum „mal“ und nicht „plus“?',
        antwort: 'Lichaw begründet es nicht; sie nennt es eine Formel, „you didn’t learn in math class“. Als Bild lesen: Fehlt eine der Kräfte, gibt es keinen Gipfel.',
      },
    ],
    ueberleitung: 'Rechnet die Formel einmal nach – an Pinocchio.',
  },

  'pinocchio-abc': {
    live: [
      'Zeit: Sprechzeit ~1 min; A und B als Gegenkräfte zeigen, dann C.',
      '„Jetzt steht etwas dazwischen. Erst dadurch ist die Verwandlung verdient.“',
      'Quelle: Illustration des Kurses nach Disney 1940, nicht Lichaw.',
      'Fragen: Was spricht für eure Figur dagegen, es anders zu machen?',
      'Falle: Collodis Roman einmischen – die Folie folgt nur Disney.',
    ],
    verstaendnis: {
      frage: 'Was ist bei Pinocchio B – und warum braucht C es?',
      antwort: 'B sind Versuchungen und Lügen: Er lässt sich weglocken, seine Nase wächst. Erst weil er dagegen ankommt und Geppetto rettet, ist die Verwandlung der Höhepunkt – ohne B wäre es wieder „bought some magic“.',
      falsch: '„Dass er aus Holz ist“ – das ist die Ausgangslage, nicht die Kraft, die ihn auf dem Weg bremst (wie „die Schlange“ bei der Kaffeebar).',
    },
    kern: [
      {
        text: 'Lichaw erzählt Pinocchio nur ohne Konflikt („bought some magic, and transformed into a boy. The end.“) und nennt keine Kraft gegen ihn; sie fordert nur: „Every character and every goal in a story should always have some kind of force working in opposition to it.“ Ihr Beispiel für A × B = C ist das iPhone.',
        quelle: `${LICHAW}, Kap. 8, Conflict Is Key und Math Is Fun, S. 136–137`,
      },
      {
        text: 'A – B – C bei Pinocchio ist eine Illustration des Kurses, nach Disneys Film (1940): Die Blaue Fee verlangt mutig, ehrlich, selbstlos; Stromboli und die Vergnügungsinsel locken ihn weg, beim Lügen wächst die Nase; er rettet Geppetto aus dem Wal Monstro und wird ein echter Junge. Collodis Roman (1883) erzählt anders – nicht mischen.',
        quelle: 'Illustration des Kurses; Walt Disney, „Pinocchio“ (1940)',
      },
    ],
    ueberleitung: 'Wie sieht dieser Bogen aus, wenn er ein Produkt erzählt?',
  },

  'concept-story': {
    live: [
      'Zeit: Ist-Zeit notieren; Sprechzeit ~2 min, mit der BOOM-Karte.',
      '„Das ist die Rechnung, die jemand in Sekunden macht, wenn er von euch hört.“',
      'Abbildung von links lesen, je Zeile auf eine Stelle zeigen.',
      'Krise = Konkurrenz: Produkt, heutiger Weg, Widerstand gegen Neues.',
      'Falle: Schluss als Handlung – bei der Concept Story nur gedacht.',
    ],
    verstaendnis: {
      frage: 'Was steht in der Krise, wenn es kein Konkurrenzprodukt gibt?',
      antwort: 'Wie die Menschen ihr Problem heute lösen („an alternative way that people currently solve their problems“) oder ihr Widerstand, etwas Neues anzufangen (Kap. 3, Crisis, S. 27).',
      falsch: '„Dann gibt es keine Krise“ – eine heutige Lösung gibt es fast immer.',
    },
    kern: [
      {
        text: '„Think of them as the mental calculation that someone makes when they first hear about your product. The story might only last a few seconds“. Drei Zwecke: eine gemeinsame Vision vermitteln, darauf ausrichten, daran priorisieren.',
        quelle: `${LICHAW}, Kap. 3, How Concept Stories Work, S. 24; What Is a Concept Story?, S. 23`,
      },
      {
        text: 'Beschriftung der Abb. 3.1 ↔ Stationen: Current State = Exposition, Problem = Auslöser, Your product = steigende Handlung, Competition = Krise, Value proposition / Competitive advantage = Höhepunkt, Takeaway = fallende Handlung, Goal(s) met = Ende. Die Folie fasst sie zu Anfang, Krise, Höhepunkt, Schluss.',
        quelle: `${LICHAW}, Kap. 3, How Concept Stories Work, S. 24–25, Abb. 3.1`,
      },
      {
        text: '„Think of the crisis as the competition.“ Drei Formen: ein anderes Produkt; „an alternative way that people currently solve their problems“; oder emotional: „resistance to change or people not wanting to adopt something new“.',
        quelle: `${LICHAW}, Kap. 3, Crisis, S. 27`,
      },
      {
        text: 'Höhepunkt: „Implicit in the value proposition is that it’s not only different, but also better than the alternative ways your customer has to solve this problem.“ Schluss: „Falling action for concept stories should still remain in the realm of thought, rather than action.“ – „If you posit this falling action as a hypothesis, you should test it with real people.“',
        quelle: `${LICHAW}, Kap. 3, Climax/Resolution, S. 28; Falling Action, S. 28–29`,
      },
    ],
    geschichte: {
      text: 'Die Autor*innen von Breaking Bad hängen eine ganze Staffel als Karten an die Wand: „They map the story out before they write a line of dialogue or shoot a single scene.“ Nahe am Ende der Storyline von Staffel 4 hängt eine Karte mit einem einzigen Wort: „BOOM.“ Lichaw: „Mapping the story helps TV writers make things go BOOM. And it will help you, someone who builds products, make things go BOOM as well.“ Für euch: Die Concept Story ist diese Wand für euer Produkt – gelegt, bevor ihr etwas baut.',
      quelle: `${LICHAW}, Kap. 1, Making Things Go BOOM!, S. 2–3 (Abb. 1.1–1.2 liegen nicht vor; ohne Bild erzählen); „Für euch“ ist Kursformulierung`,
    },
    fragen: [
      {
        frage: 'Warum hört die Story nicht am Höhepunkt auf?',
        antwort: 'Weil Menschen einen Abschluss brauchen. Lichaw: Ein halbes Handygespräch nervt, weil „your brain naturally wants to complete the conversation“ – „Humans, it turns out, need closure.“ (Kap. 2, Falling Action or Denouement, S. 15–16). Darum gehören Takeaway und Ende dazu.',
      },
    ],
    ueberleitung: 'Probe: Apple hatte eine Version ohne Krise und Höhepunkt. Was fehlt ihr?',
  },

  flach: {
    live: [
      'Zeit: Sprechzeit ~1 min; Punkte 1–3 aufdecken, dann die Frage.',
      '„Das ist nicht das iPhone von 2007 – sondern ein iPod, der telefoniert.“',
      'Fragen: Was fehlt dieser Geschichte? Erst still, dann alle zugleich laut.',
      'Nicht auflösen – die Antwort kommt auf den nächsten zwei Folien.',
    ],
    uebung: { dauer: '1 min', form: 'Erst still überlegen, dann alle zugleich laut; Auflösung auf den nächsten Folien' },
    kern: [
      {
        text: '„Six months before the iPhone 1 announcement, Apple filed a patent for a different kind of device“ – „The device was essentially an iPod that made phone calls“. Als Geschichte: „I love my iPod; I love my mobile phone.“ – „I don’t love carrying two devices, and I wish I could have my iPod and phone all in one.“ – „iPhone to the rescue!“ – „I now have a way to have my iPod and phone in one device.“',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, S. 31–32, Abb. 3.5–3.6`,
      },
      {
        text: 'Achtung Abbildung: Abb. 3.6 beschriftet auch das Patent-Gerät mit „iPhone“. Den Auslöser („I don’t love carrying two devices“) nennt der Text, die Abbildung zeichnet ihn nicht. Die gestrichelte Linie erklärt Lichaw nicht – „so hoch könnte der Bogen sein“ ist unsere Lesart.',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, S. 31–32, Abb. 3.6; Lesart: Kursformulierung`,
      },
      {
        text: 'Jobs zeigte in der Keynote 2007 zum Spaß ein Gerät, das dem Prototyp ähnelte, bevor er das echte iPhone vorstellte.',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, S. 32`,
      },
    ],
    ablauf: {
      aufloesung: 'Es fehlen Krise und Höhepunkt. Die flache Version hat Exposition, Problem, Produkt und Ende – eine Linie. Aufgelöst wird auf „Dieselbe Figur, jetzt mit Bogen“ und „Krise und Höhepunkt geben Höhe“ (Kap. 3, Avoiding the Anticlimactic, S. 32).',
    },
    ueberleitung: 'Und so sah die Version aus, die Apple 2007 vorgestellt hat – mit derselben Figur.',
  },

  hoch: {
    live: [
      'Zeit: Sprechzeit ~2 min; Abbildung von links, je Punkt zeigen.',
      'Anfang: dieselbe Figur wie beim Patent – neu nur „smartphones suck“.',
      'Krise: auf die Hürde zeigen – iPod, Handy, Preis, Bedienung.',
      'Höhepunkt: auf die Glühbirne zeigen – kommunizieren, „worked like magic“.',
      '„Danach nur ein Gedanke: Ich will ein iPhone. Gekauft ist noch nichts.“',
    ],
    verstaendnis: {
      frage: 'Was hat die Version von 2007, das der Patent-Version fehlt?',
      antwort: 'Eine Krise (schon ein iPod und ein Handy, Preis, Angst vor dem Touchscreen) und einen Höhepunkt, der sie auflöst: der beste Weg zu kommunizieren, mit Internet, Karten und E-Mail, und „the iPhone worked like magic“ (Kap. 3, S. 27–28).',
      falsch: '„Mehr Funktionen“ – es zählt, dass der Höhepunkt die Krise auflöst.',
    },
    geschichte: {
      text: 'Januar 2007, Jobs’ Keynote. Medien und Fachleute erwarten genau eines: einen iPod, der telefoniert. Jobs nennt zuerst ein Problem: Smartphones taugen nichts (so fasst Lichaw es zusammen). Dann kündigt er drei Produkte an: „A widescreen touchscreen iPod / A revolutionary new mobile phone / An Internet communicator“. Er wiederholt die drei einige Male, bis er fragt: „Are you getting it?“ Der Saal applaudiert, denn es sind nicht drei Geräte, sondern eines: das iPhone. Ein halbes Jahr vorher hatte Apple noch die Version von der letzten Folie zum Patent angemeldet, „essentially an iPod that made phone calls“ – 2-in-1. „Dieselbe Figur“ heißt: Es ist dieselbe Person wie dort. Sie liebt iPod und Handy und will unterwegs Musik hören und telefonieren. An ihr ändert sich nichts, nur der Bogen ihrer Geschichte: Der Auslöser bekommt einen zweiten Satz („Oh, and smartphones suck.“), und Krise und Höhepunkt kommen dazu.',
      quelle: `${LICHAW}, Kap. 3 (Einleitung), S. 22; Exposition, S. 25; Avoiding the Anticlimactic, S. 31–33, Abb. 3.6 (S. 32); Abb. 3.4 (S. 30); „dieselbe Figur“ ist Kursformulierung`,
    },
    kern: [
      {
        text: 'Jobs nannte zuerst das Problem – bei Lichaw zusammengefasst: Smartphones taugen nichts –, dann drei Produkte – „A widescreen touchscreen iPod / A revolutionary new mobile phone / An Internet communicator“ – und fragte: „Are you getting it?“',
        quelle: `${LICHAW}, Kap. 3 (Einleitung), S. 22`,
      },
      {
        text: 'Exposition: „Your character doesn’t want a two-in-one device, per se, but just needs to communicate with the world.“ Auslöser: „the problem that the user knew she had was that it sucked to carry two devices“ – „Apple solved a problem that people didn’t know they had.“ Steigende Handlung: „the iPhone is a smartphone, specifically, and a mobile communication device, more broadly“.',
        quelle: `${LICHAW}, Kap. 3, How Concept Stories Work, S. 25–26`,
      },
      {
        text: 'Krise: schon iPod oder Handy, der Preis, der Touchscreen – „Wouldn’t a touchscreen make the iPhone difficult to use? And no keyboard? Typing would be impossible. At least that’s what the few people who owned Blackberrys and Palm Treos thought at the time.“ Der alte Weg war also Tastatur oder Stift. Höhepunkt: „what they get with the iPhone was the best way to communicate“, mit Internet, Karten, E-Mail; „the iPhone worked like magic. It was easy to use.“ Fallende Handlung: überzeugt, neugierig oder skeptisch – „in the realm of thought, rather than action“.',
        quelle: `${LICHAW}, Kap. 3, Crisis, S. 27; Climax/Resolution, S. 28; Falling Action, S. 28–29; Abb. 3.4, S. 30`,
      },
      {
        text: 'Abb. 3.4 von links gelesen. Exposition (Wolken links unten): „I love my iPod and my mobile phone. / I want to listen to music and make phone calls on the go.“ – Ich liebe meinen iPod und mein Handy; ich will unterwegs Musik hören und telefonieren. Wie in der flachen Version (Abb. 3.6, S. 32); im Text S. 25. Auslöser (Wolke am Stern): „It sucks to carry two devices. / Oh, and smartphones suck.“ – Zwei Geräte mitzuschleppen nervt; ach ja, und Smartphones taugen nichts. Der erste Satz ist das Problem, das die Figur kennt; der zweite ist das Problem, das Jobs in der Keynote nannte; Lichaw fasst es zusammen: Smartphones taugen nichts (S. 22, 26). Steigende Handlung: „iPhone – A smartphone“ – Name und Produktart (S. 26). Krise (Hürde): „iPod, Mobile phones, Smartphones, Cost, Usability“ – iPod und Handy hat man schon; die Smartphones von damals (Blackberry, Palm Treo) gelten als schlecht; der Preis; die Bedienbarkeit, also Touchscreen ohne Tastatur (S. 27). Höhepunkt (Glühbirne): „The best way to communicate / Better than 2-in-1 / Internet at fingertips / Works like magic“ – der beste Weg zu kommunizieren; besser als 2-in-1; Internet griffbereit (wörtlich: an den Fingerspitzen), dazu Karten und E-Mail; funktioniert wie Zauberei, leicht zu bedienen (S. 28, 33). Fallende Handlung: „I want an iPhone!“ – Ich will ein iPhone! Ein Gedanke, noch kein Kauf (S. 28–29). Ende (Wolke rechts unten): „I can communicate, listen to music, and make phone calls on the go.“ – Ich kann unterwegs kommunizieren, Musik hören und telefonieren (S. 29).',
        quelle: `${LICHAW}, Kap. 3, How Concept Stories Work, S. 25–29, Abb. 3.4 (S. 30); Avoiding the Anticlimactic, S. 33; Übersetzungen: Kursformulierung`,
      },
    ],
    fragen: [
      {
        frage: 'Was heißt „dieselbe Figur“?',
        antwort: 'Dieselbe Person wie in der flachen Version vom Patent: Sie liebt iPod und Handy und will unterwegs Musik hören und telefonieren (Kap. 3, S. 31–32, Abb. 3.6; für das iPhone von 2007 S. 25). Die Exposition bleibt, neu sind Krise und Höhepunkt. Der Ausdruck ist Kursformulierung; Lichaw stellt die beiden Versionen so gegenüber: „Contrasting what could have been with what actually became the first iPhone“ (Kap. 3, S. 33).',
      },
      {
        frage: 'Warum 3-in-1 und nicht 2-in-1 – mehr Funktionen = besser?',
        antwort: 'Nein. Der Höhepunkt muss auflösen, was Auslöser und Krise aufwerfen: „The climax is where the problem outlined in the inciting incident and the additional hurdles that surface during your crisis are resolved and overcome.“ (Kap. 3, Climax/Resolution, S. 28). Das Internet zählt, weil es zum besten Weg zu kommunizieren gehört; „worked like magic“ antwortet auf die Angst vor dem Touchscreen. Ausführlich auf der nächsten Folie, „Krise und Höhepunkt geben Höhe“.',
      },
      {
        frage: 'Warum ist der Touchscreen eine Krise?',
        antwort: 'Wer schon einen benutzt hatte, kannte ihn als schlecht: „touchscreens were as awful as the smartphones they accompanied those days. Wouldn’t a touchscreen make the iPhone difficult to use? And no keyboard? Typing would be impossible. At least that’s what the few people who owned Blackberrys and Palm Treos thought at the time.“ (Kap. 3, Crisis, S. 27). Das ist Widerstand gegen Neues: Gewohnt waren Tastatur und, bei Palm, der Stift (S. 33–34).',
      },
      {
        frage: 'Was hat das mit unserem Produkt zu tun?',
        antwort: '„Think of the crisis as the competition.“ – ein anderes Produkt, der heutige Weg oder der Widerstand gegen Neues (Kap. 3, Crisis, S. 27). Bei euch steht das schon im „anders als …“ eures Lückensatzes; euer Höhepunkt muss genau das auflösen. Die Verbindung zum Lückensatz ist eine Lesart dieses Kurses.',
      },
    ],
    zusatz: [
      {
        titel: 'Hintergrund (nicht bei Lichaw): die Keynote',
        text: 'Jobs stellte das iPhone am 9. Januar 2007 auf der Macworld in San Francisco vor. Apples Pressemitteilung vom selben Tag spricht ebenfalls von drei Produkten in einem: Handy, Breitbild-iPod mit Touch-Bedienung, Gerät fürs Internet. Angekündigt war es für Juni 2007 in den USA (Europa Ende 2007, Asien 2008), 4 GB für 499 US-Dollar, 8 GB für 599 US-Dollar, verkauft über Apple und den Netzbetreiber Cingular; die Tarife sollten vor dem Start folgen.',
        quelle: 'Apple Newsroom, 9.1.2007: https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/ (abgerufen 27.11.2026)',
      },
    ],
    ueberleitung: 'Legt beide nebeneinander: Was macht den Unterschied?',
  },

  'hoch-lehre': {
    live: [
      'Zeit: Sprechzeit ~2 min; kleine Abbildung: die Linie von vorhin.',
      '„2-in-1 war eine Linie. 3-in-1 war der Gipfel.“',
      '„Niemand hatte nach drei Geräten in einem gefragt.“',
      'Fragen: Was ist bei euch die naheliegende Lösung?',
      'Bei Bedarf: Kaffeebar – Wartezeit-Anzeige als Linie, „Fertig 7:31“ als Gipfel.',
    ],
    verstaendnis: {
      frage: 'Woran erkennt ihr, dass eure Story nur die Linie ist?',
      antwort: 'Sie geht von Problem über Produkt zum Ende, ohne Krise: Keine Alternative und kein Widerstand stehen dazwischen, also löst der Höhepunkt nichts auf. Lichaw: „A concept without a conflict and a resulting climax is a flat story—literally just a line.“ (Kap. 3, S. 28)',
      falsch: '„Wenn das Produkt einfach ist“ – einfach zu bauen ist nicht dasselbe wie flach.',
    },
    kern: [
      {
        text: 'Die Keynote im Januar 2007. Erwartet wurde ein iPod, der telefoniert. „Jobs presented a problem: smartphones are no good.“ Dann zeigte er drei Produkte – „A widescreen touchscreen iPod“, „A revolutionary new mobile phone“, „An Internet communicator“ – und wiederholte sie, bis er fragte: „Are you getting it?“ Es war ein einziges Gerät. „No one had asked for a three-in-one communication device. Actually, most iPod owners in 2007 would have been content with an iPod that let them make phone calls.“ Für Lichaw war dieser Moment „the inciting incident that kick-started a storyline that flowed through everything from the actual product itself to the rest of the presentation“.',
        quelle: `${LICHAW}, Kap. 3 (Einleitung), S. 22`,
      },
      {
        text: 'Die Linie: das Patentgerät, sechs Monate vor der Keynote angemeldet, „essentially an iPod that made phone calls“. Als Story: „I love my iPod; I love my mobile phone.“ – „I don’t love carrying two devices, and I wish I could have my iPod and phone all in one.“ – „iPhone to the rescue!“ – „I now have a way to have my iPod and phone in one device.“ Lichaw: „This story lacks gravitas or dignity. It has a structure, but when you visually assess the story as a diagram, you can see that the structure isn’t very tall.“ Diagramm und Konzept „lack two key plot points that give stories their height: crisis and climax“. Jobs machte sich in der Keynote über so ein Gerät lustig, bevor er das echte zeigte.',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, S. 31–32, Abb. 3.5–3.6`,
      },
      {
        text: 'Der Gipfel: Die Krise der Version von 2007 sind iPod und Handy, die man schon hat, der Preis und der Touchscreen, „a huge crisis“ für alle, die frühe Touchscreens kannten. Der Höhepunkt: „if the character wanted a two-in-one device to communicate, what they get with the iPhone was the best way to communicate“, dazu Internet, Karten und E-Mail, und „the iPhone worked like magic. It was easy to use.“ Lichaws Vergleich: „A simple solution, an iPhone that made phone calls, was flat. A climactic solution, an iPhone that did everything, worked like ‚magic.‘ One was a 2-in-1 device, the other 3-in-1. One helped you play music and make phone calls, the other was a communication powerhouse.“ Der Gipfel ist also nicht die Zahl der Funktionen, sondern der beste Weg zu kommunizieren.',
        quelle: `${LICHAW}, Kap. 3, Crisis, S. 27; Climax/Resolution, S. 28; Avoiding the Anticlimactic, S. 33`,
      },
      {
        text: '„Our brains don’t like flat. Our brains need structure in order to get excited about things before, during, and after experiencing something, whether the experience involves thinking about or actually using the thing.“ Warum das ein Produkt trifft: Die Concept Story ist „the mental calculation that someone makes when they first hear about your product“, nur Sekunden lang, aber „this story sets the stage for your customer being intrigued or excited by what your product is“. Und allgemein: „A concept without a conflict and a resulting climax is a flat story—literally just a line.“',
        quelle: `${LICHAW}, Kap. 3, Avoiding the Anticlimactic, S. 32; How Concept Stories Work, S. 24; Climax/Resolution, S. 28`,
      },
      {
        text: 'Die zwei Fragen stehen am Anfang von Kap. 3, als die letzten von zehn: „Concept stories, when used to define products, help you answer the following questions“ – darunter „What is the straightforward solution to the problem?“ und „What is the awesome solution to the problem?“. In der Liste „Mapping a Concept Story“ kommen sie nicht vor; danach greift Lichaw sie am Slack-Beispiel auf: „there is always a simple solution to every story, which can look like a straight line. People want to communicate and collaborate? So give them a better communication and collaboration tool. However, while you might want to design solutions that are simply better than whatever else is out there, “better” isn’t always enough.“ Ein festes Vorgehen für die zwei Fragen gibt sie nicht; das Nebeneinanderlegen (Flach-Probe) ist ein Übertrag des Kurses.',
        quelle: `${LICHAW}, Kap. 3, What Is a Concept Story?, S. 23; Mapping a Concept Story, S. 35; Übertrag des Kurses`,
      },
      {
        text: 'Wann die naheliegende Lösung reicht: Beim Kalender von iOS, dessen Kernaufgabe flach bleibt, fragt Lichaw: „Is Apple in trouble? Not at all. Unless calendaring becomes core to their business and engagement strategies.“ Und: „When it matters, you should plot even the smallest and seemingly trivial core tasks story-first.“ Zu „leicht zu bedienen“: „But ‚easy to use‘ is a pretty boring story when difficulty isn’t really the problem.“ Dass „leicht“ dann der Gipfel sein kann, wenn die Schwierigkeit wirklich das Problem ist, folgt daraus, sagt Lichaw aber nicht ausdrücklich.',
        quelle: `${LICHAW}, Kap. 5, Micro-Stories: Core Tasks, S. 90; Kap. 3, Mapping a Concept Story, S. 35`,
      },
    ],
    fragen: [
      {
        frage: 'Wofür sind die zwei Fragen da?',
        antwort: 'Damit ihr die Linie seht, bevor ihr sie baut. Eine naheliegende Lösung gibt es fast immer: „there is always a simple solution to every story, which can look like a straight line“ (Kap. 3, S. 35). Sie löst das Problem, das die Leute nennen – beim iPhone „it sucked to carry two devices“. Die großartige Lösung löst das Problem dahinter und die Krise mit: nicht zwei Geräte in einem, sondern „the best way to communicate“ (Kap. 3, S. 26 und 28). Lichaw stellt die Fragen, ohne ein Vorgehen dazu.',
      },
      {
        frage: 'Was machen wir heute konkret damit?',
        antwort: 'Übertrag des Kurses, nicht bei Lichaw (Flach-Probe in Schritt 1 der Übung): 1. Die naheliegende Lösung als Linie hinschreiben, Problem → Produkt → Ende – im Feld „Flach-Probe“ unten links in „T4 · 0 · Concept Story · Produkt n“, freiwillig. 2. Daneben eure Story: Steht in der Krise eine Alternative oder ein Widerstand aus den Interviews, mit Zitat-ID? 3. Den Höhepunkt prüfen: Löst er genau diese Krise auf? Steht dort gegenüber der Linie nur „schneller“ oder „leichter“, fehlt die Krise. Fertig ist Schritt 1, wenn Krise und Höhepunkt stehen. Die Linie ist kein Fehler, sondern der Vergleich, an dem ihr seht, was euer Höhepunkt mehr hat.',
      },
      {
        frage: 'Wie sieht das bei der Kaffeebar aus?',
        antwort: 'Beispiel des Kurses. Naheliegend: die Wartezeit-Anzeige an der Tür – „Geht sich ein Kaffee aus?“ → Wartezeit-Anzeige an der Tür → Kaffee vor dem Zug. Eine Linie, ohne Krise und Gipfel; sie trifft P1, aber nicht P2, P3 und G1 und verlor schon im Vergleich der Lückensätze (Value Map). Großartig: Gleis-1-Express – im Gehen per QR-Code bestellen, und beim Bestellen steht, ob es sich ausgeht: „Fertig 7:31. Dein Zug fährt 7:38.“ Was sich am Höhepunkt ändert: Die Linie sagt nur, wie lange es dauert. Die Story nimmt die Krise auf – den Automaten („halt Notlösung, aber er ist schnell“, I1-3), den Verzicht (I3-4), den Zweifel, ob er doch nicht fertig ist (I3-3) – und löst sie: Gewissheit statt Glücksspiel, und der gute Kaffee statt der Brühe.',
      },
      {
        frage: 'Frage an den Raum: War ein iPod, der telefoniert, eine schlechte Idee?',
        antwort: 'Nein. Er löste das Problem, das die Leute kannten, und hätte den meisten gereicht (Kap. 3, S. 22). Er war nur flach: keine Krise, die er auflöst, kein Höhepunkt, an den man sich erinnert. Die Frage ist nicht gut oder schlecht, sondern Linie oder Gipfel.',
      },
      {
        frage: 'Frage an den Raum: Wann dürft ihr bei der naheliegenden Lösung bleiben?',
        antwort: 'Wenn die Aufgabe nicht zum Kern eures Geschäfts gehört – Lichaws Kalender-Beispiel (Kap. 5, S. 90). Und wenn die Schwierigkeit wirklich das Problem ist, kann „leichter“ der Höhepunkt sein; das ist eine Lesart aus Kap. 3, S. 35. Für eure Concept Story heute gilt: Die Kernaufgabe ist euer Geschäft, also braucht sie Krise und Höhepunkt.',
      },
      {
        frage: 'Vorsicht beim Erzählen: Was davon steht so bei Lichaw?',
        antwort: '„Niemand hatte 3-in-1 verlangt“ und „hätte gereicht“ sind Lichaws Sätze („No one had asked …“, „would have been content …“, Kap. 3, S. 22), aber ihre Einschätzung, ohne Beleg oder Zahl – erzählt es als ihre Sicht, nicht als Marktforschung. „3-in-1 war der Gipfel“ heißt nicht „mehr Funktionen“: Ihr Höhepunkt ist „the best way to communicate“ und „worked like magic“ (S. 28). Die gestrichelte Linie in Abb. 3.6 erklärt sie nicht; wir lesen sie als möglichen Bogen. Und das Nebeneinanderlegen der zwei Lösungen ist ein Übertrag des Kurses, kein Schritt bei Lichaw.',
      },
    ],
    ueberleitung: 'Die Story war mehr als die Rede dazu: Sie hat entschieden, was gebaut wurde.',
  },

  'baut-mit': {
    live: [
      'Zeit: Sprechzeit ~2 min.',
      'Kette von links lesen: Krise, Höhepunkt, Anforderung, Gebaut.',
      'Fragen: Warum fehlte Kopieren und Einfügen?',
      '„Die Story sagt nicht nur, wie ihr redet, sondern was ihr baut.“',
    ],
    verstaendnis: {
      frage: 'Warum fehlte Kopieren und Einfügen?',
      antwort: 'Weil es die Story – „worked like magic“, leicht mit dem Finger – nicht stützte: „Animation supported the story. Cut-and-paste did not.“ (Kap. 3, S. 33). Die Krise war die Angst vor dem Touchscreen; Animation und Technik zum Tippen statt Stift lösten sie auf. Lichaw nennt keinen weiteren Grund.',
      falsch: '„Weil Apple es nicht konnte“ – das sagt Lichaw nicht; der Palm Treo hatte es längst (Kap. 7, S. 129).',
    },
    geschichte: {
      text: 'Die Krise war die Angst vor dem Touchscreen. Wer einen Palm Treo kannte, kannte Stift und fummeliges Tippen: „Wouldn’t a touchscreen make the iPhone difficult to use?“ (S. 27). Der Höhepunkt löst genau das auf: „the iPhone worked like magic. It was easy to use.“ (S. 28). Daraus folgt die Anforderung: Tippen mit dem Finger muss sich leicht anfühlen. Also baute Apple Animation und Tippen mit dem Finger statt Stift (S. 33). Jetzt der Kontrast: Der Palm Treo, im Jahr davor das meistverkaufte Smartphone, hatte Kopieren und Einfügen und ließ einen Apps und Spiele installieren. „The iPhone did neither.“ (Kap. 7, S. 129). Lichaws Urteil: „Animation supported the story. Cut-and-paste did not.“ (S. 33). Und ihre Faustregel: „Everything you want that person to experience must drive the story forward. If it doesn’t, you cut it out.“ (Kap. 8, S. 134).',
      quelle: `${LICHAW}, Kap. 3, Crisis, S. 27; Climax/Resolution, S. 28; Supporting the Story, S. 33; Note „The Early Touchscreens Flopped“, S. 34 (Stift); Kap. 7, S. 129; Kap. 8, Stories Are Character-Driven, S. 134; „Anforderung“ als Schritt der Kette: Kursformulierung (Folie)`,
    },
    fragen: [
      {
        frage: 'Warum stützte Kopieren und Einfügen die Story nicht – was hätte es ihr gebracht?',
        antwort: 'Lesart dieses Kurses, nicht bei Lichaw: Sie nennt keinen Grund. Am Bogen gelesen trägt es keine Station. Es nimmt nicht die Angst vor dem Touchscreen (Krise), und es macht den Höhepunkt – „worked like magic“, leicht mit dem Finger – nicht stärker. Und der alte Weg hatte es schon: Der Palm Treo konnte Kopieren und Einfügen (Kap. 7, S. 129). Damit hätte das iPhone auf dem Feld der Konkurrenz mitgehalten, statt die Krise aufzulösen. Technische Gründe nennt Lichaw nicht.',
      },
      {
        frage: 'Wie findet ihr euer „Kopieren und Einfügen“?',
        antwort: 'Fragt bei jeder Funktion in eurer Story Map: Welche Station eurer Concept Story trägt sie – löst sie die Krise auf, macht sie den Höhepunkt stärker? Trägt sie keine, kommt sie nicht in den ersten Slice. Das ist ein Übertrag des Kurses; bei Lichaw steht dazu die Faustregel „If it doesn’t, you cut it out.“ (Kap. 8, S. 134).',
      },
    ],
    kern: [
      {
        text: '„in order for the touchscreen to be user-friendly (which Palm Treo touchscreens were not), Apple’s strategy was to employ animation and cutting-edge technology that enabled people to tap, rather than to interact with their device using a stylus.“ – „Animation supported the story. Cut-and-paste did not.“',
        quelle: `${LICHAW}, Kap. 3, Supporting the Story, S. 33`,
      },
      {
        text: '„There was a good reason why the iPhone launched with fancy animation but no cut-and-paste functionality.“ Gemeint ist das erste iPhone (2007), und gefehlt hat Kopieren und Einfügen auf dem iPhone selbst. Welche Animation, sagt Lichaw hier nicht; in Kap. 7 nennt sie eine: die Pin-Animation in Maps, „a tiny animation that transpired when a pin dropped on a map“ – laut Abb. 7.9 „meticulously crafted for bounce and elasticity“. Wann Kopieren und Einfügen kam, nennt sie nicht. Zum Vergleich: „The Palm Treo, which was the best-selling smartphone the year before, not only had features like cut-and-paste, but it also let you install apps and games. The iPhone did neither.“',
        quelle: `${LICHAW}, Kap. 3, Supporting the Story, S. 33; Kap. 7, Build and Communicate, S. 129–130, Abb. 7.9`,
      },
      {
        text: 'Die Story „wasn’t just a marketing pitch or shiny packaging—it drove everything from what the product requirements were to how the iPhone worked“; „concept stories don’t just help you figure out how to talk about a product, but how to build the product.“ Zur Krise: Frühe Touchscreens ohne Stift „simply weren’t easy to use, and that wasn’t a very good story“.',
        quelle: `${LICHAW}, Kap. 3, Supporting the Story, S. 33; Note „The Early Touchscreens Flopped“, S. 34`,
      },
      {
        text: '„Everything you want that person to experience must drive the story forward. If it doesn’t, you cut it out.“ Die Kursregel „Was eure Concept Story nicht stützt, kommt nicht in den Prototyp“ und der Bezug zur Story Map (erster Slice) sind ein Übertrag des Kurses; sie stehen im Handout.',
        quelle: `${LICHAW}, Kap. 8, Stories Are Character-Driven, S. 134; Kursregel`,
      },
    ],
    zusatz: [
      {
        titel: 'Hintergrund (nicht bei Lichaw): das erste iPhone',
        text: 'Vorgestellt am 9. Januar 2007, in den USA verkauft ab 29. Juni 2007. Zu den Gesten von iPhone OS 1.0 gehörten Zoomen mit zwei Fingern (Pinch) und Scrollen mit Schwung. Kopieren und Einfügen fehlte zum Start; es kam erst 2009 mit iPhone OS 3.0. Lichaw selbst nennt als Beispiel die Pin-Animation in Maps (Kap. 7, S. 129–130, Abb. 7.9); was es sonst an Animationen gab, sagt sie nicht.',
        quelle: 'Apple Newsroom, 9.1.2007: https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/; Wikipedia, „IPhone (1st generation)“ und „IPhone OS 1“ (abgerufen 27.11.2026)',
      },
    ],
    ueberleitung: 'Lichaw füllt den Bogen einmal ganz aus – für Slack.',
  },

  slack: {
    live: [
      'Stationen 1–4 aufdecken, zügig.',
      'Fragen: Was muss der Höhepunkt jetzt auflösen? Antworten laut.',
      'Aufdecken: alles an einem Ort – und überall.',
      '„‚Easier to use‘ als E-Mail wäre die Linie gewesen.“',
      'Zeit: Sprechzeit ~1 min.',
    ],
    verstaendnis: {
      frage: 'Was muss der Höhepunkt bei Slack auflösen?',
      antwort: 'Beides: das Problem (nichts ist an einem Ort) und die Krise (es gibt schon Gmail, Chat, Basecamp – und niemand will sich noch irgendwo anmelden). Antwort: eine Lösung für alles, überall erreichbar.',
      falsch: '„Dass E-Mail kompliziert ist“ – Schwierigkeit war nicht das Problem.',
    },
    kern: [
      {
        text: 'Slack, Station für Station: „Busy professionals“ mit mehr Werkzeugen denn je; trotzdem ist es mühsam, alles im Blick und an einem Ort zu behalten. Slack: „An online collaboration tool.“ Krise: Gmail, IM, Basecamp und „What, sign up for another online service? Ack. No.“ Höhepunkt: „Unlike the competition, Slack is a one-stop solution.“ Takeaway: sich Slack mit dem Team vorstellen – „…and maybe never using email again.“',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story, An Example: Slack, S. 36–37, Abb. 3.7`,
      },
      {
        text: '„there is always a simple solution to every story, which can look like a straight line“. Slack hätte eine Plattform bauen können, die „easier to use“ ist als E-Mail; „But ‚easy to use‘ is a pretty boring story when difficulty isn’t really the problem.“',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story, S. 35`,
      },
    ],
    fragen: [
      {
        frage: 'Was heißt „die Linie“ hier?',
        antwort: 'Jede Story hat eine naheliegende Lösung: „there is always a simple solution to every story, which can look like a straight line“ (Kap. 3, Mapping a Concept Story, S. 35). Bei Slack wäre das eine Plattform, die „easier to use“ ist als E-Mail. Flach ist sie, weil Schwierigkeit nicht das Problem war: „But ‚easy to use‘ is a pretty boring story when difficulty isn’t really the problem“ (S. 35). Der echte Auslöser: Alles im Blick und an einem Ort zu behalten ist schwer und kostet Zeit und Geld (S. 36). Von dort läuft der Bogen über die Krise („What, sign up for another online service? Ack. No.“) zum Höhepunkt („Unlike the competition, Slack is a one-stop solution.“, S. 36). Derselbe Zug wie beim iPhone, den Lichaw selbst zieht („much like with the first iPhone“, S. 35): 2-in-1 war die Linie, der beste Weg zu kommunizieren der Bogen.',
      },
      {
        frage: 'Was ist bei euch die Linie?',
        antwort: 'Lesart dieses Kurses: Steht in eurem Höhepunkt „einfacher als …“, prüft in euren Interviews, ob Schwierigkeit dort wirklich der Pain ist. Ist sie es nicht, ist das eure Linie; der Höhepunkt muss dann aus eurem echten P1 kommen.',
      },
    ],
    ueberleitung: 'Dieselben sieben Stationen – jetzt für die Kaffeebar.',
  },

  beispiel: {
    live: [
      'Zeit: Sprechzeit ~2 min; Stationen 1–4 aufdecken, IDs aus Profil und Interviews.',
      'Fragen: Was muss der Höhepunkt auflösen? Antworten laut.',
      'Aufdecken: „Fertig 7:31. Dein Zug fährt 7:38.“',
      'Fragen: Was denkt die Pendlerin danach?',
      'Kursregel – Flach-Probe zeigen: Wartezeit-Anzeige an der Tür – eine Linie.',
    ],
    verstaendnis: {
      frage: 'Warum ist die Wartezeit-Anzeige eine Linie?',
      antwort: 'Sie hat Problem, Produkt und Ende, aber keine Krise: Sie setzt sich mit Automat und Verzicht nicht auseinander, also löst ihr Höhepunkt nichts auf.',
      falsch: '„Weil sie technisch einfacher ist“ – einfach zu bauen ist nicht dasselbe wie flach.',
    },
    kern: [
      {
        text: 'Die Krise der Kaffeebar stammt aus den Interviews: der Automat („halt Notlösung, aber er ist schnell“, I1-3; I4-3, I4-4) oder Verzicht (I3-4, I5-2). Der Widerstand, im Gehen zu tippen, ist unsere Annahme (A3). Der Höhepunkt löst P1–P3 und liefert G1. Die fallende Handlung ist das Gegenbild zu I2-2. Das Ende nennt den Outcome aus dem Produkt-Brief: mehr Pendler*innen steigen morgens mit Kaffee in den Zug.',
        quelle: 'Kursbeispiel Kaffeebar (kundenprofil.astro, value-map.astro, Produkt-Brief und Annahmen-Map in der Werkstatt); Aufbau nach Lichaw, Kap. 3, Mapping a Concept Story',
      },
      {
        text: 'Die Wartezeit-Anzeige war eine der drei Ideen aus der Ideation und verlor im Vergleich der Lückensätze: Sie trifft P1, aber nicht P2, P3 und G1. Auf Miro hängt diese Story als Beispiel-Frame neben den Frames der Studierenden.',
        quelle: 'Kursbeispiel Kaffeebar (value-map.astro, Folie „Am Beispiel“)',
      },
    ],
    ablauf: {
      schritte: [
        'Stationen 1–4 aufdecken.',
        'Antworten laut: Was muss der Höhepunkt auflösen? Dann Station 5 aufdecken.',
        'Antworten laut: Was denkt die Pendlerin danach? Dann 6 und 7.',
        'Flach-Probe (Kursregel) aufdecken und die Linie neben die Story stellen.',
      ],
      achten: [
        'Jede Behauptung hat eine ID – das ist die Messlatte für die eigene Story.',
        'Station 6 steht in „…“ und ist als Annahme markiert.',
      ],
    },
    ueberleitung: 'Woher kamen die Antworten? Sechs von sieben standen schon da.',
  },

  woher: {
    live: [
      '„Sechs von sieben Stationen stehen schon in euren Unterlagen.“',
      'Zeit: Sprechzeit ~1 min; Tabelle Zeile für Zeile.',
      'Betonen: Nur Station 6 ist neu – und eine Annahme.',
      'Zeilen 6 und 7 sind Kursregeln: Annahmen-Map, Messgröße.',
      'Falle: Krise aus dem Kopf – sie steht in den Interviews.',
    ],
    verstaendnis: {
      frage: 'Welche Station schreibt ihr ganz neu?',
      antwort: 'Die fallende Handlung: was die Person nach dem Hören denkt. Alles andere kommt aus Kundenprofil, Value Map, Interviews und Produkt-Brief.',
      falsch: '„Den Höhepunkt“ – er steht als Pain Reliever und Gain Creator in der Value Map.',
    },
    kern: [
      {
        text: '„Stories are not something that you make up“ – „Stories for products come from data“. Die Zuordnung der Stationen zu Kundenprofil, Value Map, Interviews und Produkt-Brief ist eine Regel dieses Kurses.',
        quelle: `${LICHAW}, Kap. 6 (Einleitung); Kursregel`,
      },
      {
        text: 'Kursregel zu 6: fallende Handlung als Annahme in die Annahmen-Map, an der Experiment-Karte die riskanteste wählen. Lichaw: „If you posit this falling action as a hypothesis, you should test it with real people.“ Kursregel zu 7: Messgröße. Lichaw: „Goals in the stories you create can and should be measured, both for your characters and your business.“',
        quelle: `${LICHAW}, Kap. 3, Falling Action, S. 29; Kap. 8, Goals Are Measurable, S. 135; Kursregel`,
      },
      {
        text: 'Lichaws Fragen je Station, u. a. „What’s good in her world as it relates to your product or service?“, „What mental hurdles might keep her from adopting your solution?“, „What do you want people to think, feel, or envision after learning about your product?“, „How will you know you’re on the right path?“',
        quelle: `${LICHAW}, Kap. 3, Mapping a Concept Story, S. 34–35`,
      },
    ],
    fragen: [
      {
        frage: 'Unsere Interviews nennen keine Alternative. Was dann?',
        antwort: 'Dann steht in der Krise, was die Interviewten heute tun, auch wenn es „nichts“ ist, plus der innere Widerstand. Fehlt beides, ist das eine Lücke für das nächste Interview – als Annahme notieren, nicht erfinden.',
      },
    ],
    geschichte: {
      text: 'FitCounter, ein Fitness-Start-up, das Lichaw ausdrücklich fiktionalisiert hat („It is not a real company, nor a real product.“): Die Gratis-Videos hatten viele Aufrufe, aber „very few website visitors signed up to become members, and even fewer of the members paid“. Es gab eine kleine Gruppe treuer, zahlender Kund*innen, die „superfans“ – und niemand im Team verstand, warum sie das Produkt liebten. Erst Gespräche mit ihnen ergaben die Concept Story: eigene Trainingspläne aus kurzen Videos. Und dann der Befund: „But this was not the concept behind our current product.“ Für euch: Die Story kam aus den Gesprächen, nicht aus dem Kopf.',
      quelle: `${LICHAW}, Kap. 3, Finding the Concept Story at FitCounter, S. 38–42, Abb. 3.8; Fall fiktionalisiert (S. 38), kein Beleg; „Für euch“ ist Kursformulierung`,
    },
    ueberleitung: 'Aus der Story wird am Ende ein Satz.',
  },

  'ein-satz': {
    live: [
      'Muster zeigen: Die kleinen Zahlen sind die Stationen.',
      '„Fallende Handlung und Ende stehen nicht im Satz – die erzählt die Story.“',
      'Kaffeebar-Satz vorlesen.',
      'Falle: mit dem Satz anfangen – erst die sieben Stationen.',
      'Zeit: Sprechzeit ~1 min; Satz → Brief, Abschnitt 3; Pitch an Tag 7.',
    ],
    kern: [
      {
        text: '„For [target customer] who has [customer need], [product name] is a [market category] that [one key benefit]. Unlike [competition], the product [unique differentiator].“ Zielkunde = Hauptfigur, Bedürfnis = Auslöser, Name, Kategorie und Nutzen = steigende Handlung, Konkurrenz = Krise, Unterschied = Höhepunkt. Und: „the falling action and end = this is how it all comes together“. Das Format übernimmt Lichaw von gamestorming.com (Fußnote 4).',
        quelle: `${LICHAW}, Kap. 7, Elevator Pitch, S. 128`,
      },
    ],
    geschichte: {
      text: 'Als Steve Jobs 2007 das iPhone vorstellte, war das Gerät in seiner Hand kein fertiges iPhone, sondern „a semi-functional prototype“ – eine Requisite, die die Vision und die Story trug. Jobs ließ seine Vision und Story durch alles laufen, vom Design über die Präsentation bis zum Prototyp. Der Satz ist die kürzeste Form dieser Story: Wo ihr keinen Bogen zeichnen könnt, „you can speak a few words and see how people respond“.',
      quelle: `${LICHAW}, Kap. 7, Elevator Pitch, S. 127–128; Build and Communicate, S. 129 (die Latte-Zahl dort nicht nennen); Brücke zum Satz ist Kursformulierung`,
    },
    ueberleitung: 'Zum Schluss ein Ausblick: Die Concept Story ist die erste von drei Storys.',
  },

  'drei-storys': {
    live: [
      'Zeilen aufdecken: Frage, Höhepunkt, Kaffeebar, was daraus wird.',
      'Wert vorlesen: besser als das, was die Person heute tut.',
      'Exposition betonen: einmal schreiben, dreimal verwenden.',
      'Bei Bedarf: Lichaws Pinterest-Mail erzählen.',
      'Zeit: Sprechzeit ~1 min.',
    ],
    geschichte: {
      text: '2011 bekam Lichaw eine Einladung zu Pinterest. „The email wasn’t pretty. The copy wasn’t mind-blowing.“ Trotzdem war sie nach wenigen Minuten überzeugte Nutzerin: Die Mail kam im Namen ihrer Partnerin und versprach eigene Sammlungen zum Teilen – genau das, was Lichaw mit Rezepten und Einrichtungsideen ohnehin mühsam tat. Diese Mail war Teil ihrer Origin Story, „the story of how someone becomes your customer for the first time“ – der Brücke zwischen Concept Story und Usage Story.',
      quelle: `${LICHAW}, Kap. 4 (Einleitung) und What Is an Origin Story?, S. 44–45, Abb. 4.1`,
    },
    kern: [
      {
        text: '„In a concept story, the climax occurs when your customer understands the value of a product; in an origin story, it happens when the user sees the value of a product.“ Bei der Usage Story erlebt die Person den Wert.',
        quelle: `${LICHAW}, Kap. 4, How Origin Stories Work, Climax/Resolution, S. 50`,
      },
      {
        text: '„The material in the exposition is the same in all three stories: origin, concept, and usage.“',
        quelle: `${LICHAW}, Kap. 4, How Origin Stories Work, Note „You’re Not Seeing Double (or Triple)“, S. 48`,
      },
      {
        text: 'Usage Story vor Origin Story ist Kurslogik: Der Prototyp braucht sie zuerst; die Origin Story ist der Text für E1 am Ende des Tages.',
        quelle: 'Kursregel',
      },
    ],
    ueberleitung: 'Jetzt eure Story: 30 Minuten auf Miro, zwei Schritte.',
  },

  vorgehen: {
    live: [
      'Zeit: 30 min Übung nach der Theorie; Wozu vorlesen.',
      'Timer 25 min: sieben Stationen füllen, allein, mit IDs.',
      '1:1 ab Minute 5: einfache Lösung – was hat die Story mehr?',
      'Fertig, wenn Krise und Höhepunkt stehen – sonst eine Linie.',
      'Nach 25 min: Satz in den Brief, Station 6 als Annahme.',
    ],
    uebung: { dauer: '30 min (25 + 5)', form: 'allein auf Miro schreiben; Markus geht 1:1 von Person zu Person, keine Erzählrunde' },
    miro: {
      frame: 'T4 · 0 · Concept Story · Produkt 1',
      schritte: [
        'Frame wie hier für Produkt 1, ebenso Produkt 2 und 3 (MiroLinks auf der Folie). Jede*r arbeitet im eigenen Frame „T4 · 0 · Concept Story · Produkt n“; das Kaffeebar-Beispiel hängt daneben.',
        'Unter jeder Station („1 Exposition“ bis „7 Ende“) ein Sticky mit Leitfrage – durch die eigene Antwort mit IDs ersetzen; Station 6 als Gedanke in „…“.',
        'Feld „Flach-Probe (Kursregel)“ unten links: freiwillig, als Hilfe für den Check in Schritt 1.',
      ],
    },
    ablauf: {
      schritte: [
        'Schritt 1 (25 min, allein): die Stickies unter den sieben Stationen in „T4 · 0 · Concept Story · Produkt n“ füllen, je ein, zwei Sätze mit IDs; Markus ab Minute 5 je etwa vier Minuten bei jeder Person. Fertig, wenn Krise und Höhepunkt stehen – sonst ist die Story eine Linie (Flach-Probe, Kursregel).',
        'Schritt 2 (5 min): Satz in Abschnitt 3 des Produkt-Briefs (Werkstatt), fallende Handlung in die Annahmen-Map – beides auf der Folie verlinkt. Die Story bleibt auf Miro; geprüft wird selbst, mit der Prüfliste im Handout.',
      ],
      achten: [
        'Exposition beschreibt die Welt der Zielgruppe, nicht das Produkt.',
        'Krise nennt mindestens eine heutige Alternative mit Zitat-ID und einen inneren Widerstand.',
        'Station 6 ist ein Gedanke, keine Handlung.',
      ],
      fehler: [
        'Die Story beginnt mit dem Produkt statt mit der Person.',
        'Der Höhepunkt ist „schneller“ oder „leichter“ – dann fehlt die Krise.',
        'Die Krise ist erfunden statt aus den Interviews.',
      ],
    },
    kern: [
      {
        text: 'Die Probe: die naheliegende neben die großartige Lösung stellen (Kursregel, nach Lichaws zwei Fragen). „A concept without a conflict and a resulting climax is a flat story—literally just a line.“ „Easy to use“ trägt nur, wenn Schwierigkeit das Problem ist.',
        quelle: `${LICHAW}, Kap. 3, What Is a Concept Story?, S. 23; Climax/Resolution, S. 28; Mapping a Concept Story, S. 35`,
      },
    ],
    ueberleitung: 'Nach der Pause: wer dafür zahlt – das Geschäftsmodell.',
  },
};
