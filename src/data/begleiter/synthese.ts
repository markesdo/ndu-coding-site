import type { Notiz } from './typen';

// Begleiter-Notizen zu src/pages/innolab/methoden/synthese.astro (Tag 2, 14:15–15:15; bis 11.11. 14:05–15:10, 5 min Theorie gingen an den Rückblick auf Tag 1). Vorwissen: „teilweise“ aus Need
// Finding (vorwissen.ts) – darum zuerst fragen, was bekannt ist, und die Theorie dann knapp halten.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt; Fitzpatrick wie auf der Seite zitiert.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const MOMTEST = 'Rob Fitzpatrick, The Mom Test';

export const NOTIZEN_SYNTHESE: Record<string, Notiz> = {
  verschwimmen: {
    live: [
      'Fragen: Wer hat Interviews schon in der Werkstatt? Sonst Folie noch-keine.',
      'Fragen: Wer hat in Need Finding schon Snapshots oder Affinitätsdiagramme gemacht?',
      'Obere Reihe: So laufen Projekte – sammeln, anhalten, Bericht.',
      'Untere Reihe erst nach der Frage aufdecken.',
      '„Nach einer Handvoll Interviews verschwimmen die Geschichten – verlasst euch nicht aufs Gedächtnis.“',
      'Wenn bekannt: Folie kurz, Affinitätsdiagramm nur als Gegenbild.',
    ],
    verstaendnis: {
      frage: 'Was ist an „erst alle Interviews führen, dann auswerten“ das Problem?',
      antwort: 'Nach ein paar Interviews verschwimmen die Geschichten, und man verlässt sich aufs Gedächtnis (S. 68). Außerdem setzt es voraus, dass Interviews einen Anfang und ein Ende haben; wer kontinuierlich interviewt, hat keinen Punkt zum Anhalten (S. 67, 77).',
      falsch: '„Es dauert länger“ – Torres argumentiert mit dem Erinnern und dem kontinuierlichen Interviewen, nicht mit Zeit.',
    },
    kern: [
      {
        text: '„After you’ve conducted even a handful of interviews, let alone the dozens you will conduct each year, interviews will start to blur together. You don’t want to rely on your memory to keep your research straight. That’s the job of an interview snapshot.“',
        quelle: `${TORRES}, S. 68`,
      },
      {
        text: 'Wer kontinuierlich interviewt, hat keinen klaren Punkt, an dem er anhält und auswertet – darum „synthesize as you go“.',
        quelle: `${TORRES}, S. 67–68`,
      },
      {
        text: 'Anti-Muster „Stopping to synthesize a set of interviews“: Im Projekt 6 bis 12 Interviews, dann Stickies, vielleicht ein Affinitätsdiagramm, am Ende ein Bericht. Das setzt einen Anfang und ein Ende voraus; stattdessen nach jedem Interview mit Snapshots verdichten.',
        quelle: `${TORRES}, S. 77`,
      },
    ],
    ueberleitung: 'Darum der Snapshot: eine Seite pro Interview, gleich danach.',
  },

  snapshot: {
    live: [
      'Fragen: Wie sahen eure Snapshots aus – alle Felder gefüllt?',
      'Miro T1 · 5 öffnen, einen echten Snapshot zeigen lassen.',
      '„Bild und Zitat sind Schlüssel – damit erinnert ihr euch an diese eine Geschichte.“',
      'Vor jedem I2-Beispiel fragen: Was stünde bei I2 da?',
      'Falle: Einsichten und Chancen vermischt.',
    ],
    kern: [
      {
        text: 'Bild und einprägsames Zitat sind Schlüssel, die die Erinnerung an die Geschichten dieses Interviews öffnen; die Kurzinfos halten fest, welche Art Kund*in das war, und stellen die Geschichten in den richtigen Zusammenhang. Dann das Herz: Einsichten und Chancen.',
        quelle: `${TORRES}, S. 68–69`,
      },
      {
        text: 'Einsichten: Interessantes, das kein Bedürfnis, Schmerzpunkt oder Wunsch ist, etwa ein ungewöhnliches Verhalten – „Over time, insights often turn into opportunities.“ Auch Einzelfälle festhalten: Oft wird daraus ein Muster aus mehreren Interviews.',
        quelle: `${TORRES}, S. 70`,
      },
      {
        text: 'Die Skizze der Geschichte (Knoten und Verbindungen) hilft, sie zu erinnern und zu verstehen, und später, Muster über scheinbar einzigartige Geschichten hinweg zu finden.',
        quelle: `${TORRES}, S. 70`,
      },
    ],
    ueberleitung: 'Am schwierigsten ist die Spalte Chancen: Ist das ein Wunsch oder ein Bedürfnis?',
  },

  wunsch: {
    live: [
      'Fragen: Steht in euren Snapshots eine Funktion in der Spalte Chancen?',
      'Fluss von links nach rechts: Wunsch, Nachfrage, Bedürfnis, Lösungen.',
      'Nicht nachgefragt: Test S. 94 – mehr als ein Weg?',
      '„Das Bedürfnis lässt mehr Lösungen zu als der Wunsch.“',
      'Brücke: „per App vorbestellen“ kommt am Baum wieder.',
    ],
    verstaendnis: {
      frage: 'Eine Interviewte sagt: „Ich will per App vorbestellen.“ Was schreibt ihr in die Spalte Chancen?',
      antwort: 'Nicht den Wunsch, sondern das Bedürfnis dahinter. Nachfragen: „Was würde dir das bringen?“ Bei der Kaffeebar etwa „Ich will den Zug nicht verpassen“ (so steht es im Handout des Baums). Das Bedürfnis öffnet mehr vom Lösungsraum (S. 69).',
      falsch: '„Vorbestellen per App“ – das ist eine Lösung.',
    },
    kern: [
      {
        text: 'Eine Chance ist ein Bedürfnis, ein Schmerzpunkt oder ein Wunsch aus dem Interview – als Bedürfnis, nicht als Lösung. Bei einem Funktionswunsch fragen: „If you had that feature, what would that do for you?“ Beispiel: „I wish I could just say the name of the movie“ → „I don’t want to have to type out a long movie title.“ Lösungen: Sprachsuche oder Titel beim Tippen vervollständigen.',
        quelle: `${TORRES}, S. 69`,
      },
      {
        text: 'Chancen müssen keine wörtlichen Zitate sein, aber in den Worten der Kundschaft stehen – so bleiben sie aus ihrer Sicht und nicht aus Sicht der Firma.',
        quelle: `${TORRES}, S. 70`,
      },
    ],
    ueberleitung: 'So sieht ein ausgefüllter Snapshot aus – I2 von der Kaffeebar.',
  },

  'snapshot-i2': {
    live: [
      'Oben von links nach rechts: Pseudonym, Bild, Zitat, Skizze.',
      '„Statt Foto die Uhr – sie erinnert an genau diese Geschichte.“',
      'Fragen: Was ist hier Einsicht, was Chance – und warum?',
      'Zitat-IDs zeigen: Jede Chance verweist auf ihren Beleg.',
    ],
    verstaendnis: {
      frage: '„Entscheidet erst beim Ankommen“ steht bei Einsichten, nicht bei Chancen. Warum?',
      antwort: 'Es ist ein auffälliges Verhalten, aber kein Bedürfnis, Schmerzpunkt oder Wunsch. Einsichten halten fest, was auffällt; mit der Zeit werden sie oft zu Chancen (Torres S. 70). Für A1 ist es trotzdem ein Beleg.',
    },
    kern: [
      {
        text: 'Wenn Interviews anonym bleiben müssen: das Foto weglassen und durch ein Bild ersetzen, das an die Geschichte erinnert – ein Firmenlogo, das Auto, sogar ein Katzen-Meme.',
        quelle: `${TORRES}, S. 68–69`,
      },
      {
        text: 'Kurzinfos helfen einzuordnen, wie die Geschichten dieses Interviews denen anderer Kund*innen ähneln oder sich unterscheiden.',
        quelle: `${TORRES}, S. 69`,
      },
    ],
    ueberleitung: 'Euren Snapshot habt ihr allein geschrieben. Was hätten die anderen in derselben Geschichte gehört?',
  },

  geschichte: {
    live: [
      'Vor dem Vorlesen Rollen zuteilen: Produktmanagement, Design, Entwicklung.',
      'Geschichte vorlesen, langsam, ohne einzelne Stellen zu betonen.',
      'Studierende öffnen die Seite selbst; Antwort dort eingeben – Aufdecken zeigt alle Sätze.',
      'Timer 1 min: jede*r tippt einen Satz, noch nicht abschicken.',
      '„Noch nicht abschicken – erst auf mein Zeichen, alle gleichzeitig.“',
      'Falle: Lesart vorgeben oder erklären, worauf eine Rolle achtet.',
    ],
    uebung: { dauer: '1 min', form: 'allein, ein Satz auf der Seite (Rückfall: laut)' },
    ablauf: {
      schritte: [
        'Folie zeigen, die Geschichte vorlesen.',
        'Rollen zuteilen (nur den Namen: Produktmanagement, Design, Entwicklung). Studierende öffnen die Folie auf ihrem eigenen Gerät, wählen dort ihre Rolle. Timer 1 min: Jede*r tippt einen Satz – was ist aus der eigenen Rolle das Wichtigste? Noch nicht abschicken.',
        'Auf dein Zeichen schicken alle gleichzeitig ab; der Beamer zeigt „2 von 3 haben geantwortet“. Bis zum Aufdecken kann jede*r noch ändern. Steht auf der Seite „Antwort bitte laut sagen.“ (Server weg), sagt jede*r den Satz reihum laut. Dann zur nächsten Folie.',
      ],
      achten: [
        'Gleichzeitig abschicken, sonst schreiben die anderen den ersten Satz ab.',
        'Trifft jemand nicht den Satz aus dem Buch: kein Fehler – Torres schreibt „might“.',
        'Pro Rolle ein Platz: Wer dieselbe Rolle wählt, überschreibt die Antwort davor (die Seite warnt vorher). Testantworten, Unsinn oder eine Probe mit Aufdecken: auf der Seite ohne Beamer „Runde leeren“. Das löscht die Sätze und nimmt auch das Aufdecken der Buch-Sätze zurück (später einfach erneut aufdecken); danach kann jede*r wieder abschicken, der Text steht noch im Feld. Schon geöffnete Seiten (Beamer) neu laden.',
      ],
    },
    ueberleitung: 'Jetzt abschicken – dann seht ihr, was drei Rollen bei Torres gehört haben.',
  },

  warum: {
    live: [
      'Aufdecken zeigt eure Sätze und die drei aus dem Buch.',
      'Fragen: Hat eure Rolle dasselbe gehört wie im Buch?',
      '„Jede Sicht ist berechtigt – und jede kann zu einer Verbesserung führen.“',
      '„Ihr habt allein interviewt – heute hört das Team nachträglich mit.“',
      '„Jede*r kennt ein anderes Produkt – darum hört ihr Verschiedenes.“',
    ],
    verstaendnis: {
      frage: 'Warum will Torres keine einzelne „Stimme der Kundschaft“ im Team?',
      antwort: 'Wer alle Interviews führt, kann jede Diskussion mit „Das will die Kundschaft“ beenden – das gibt einer Person zu viel Macht. Ziel ist, dass alle die Stimme der Kundschaft sind (S. 74–75). Fitzpatrick nennt das Gegenteil den Lern-Engpass (Mom Test, S. 99–100).',
      falsch: '„Weil sich eine Person verhören kann“ – es geht um Macht im Team und um verschiedene Sichten.',
    },
    ablauf: {
      schritte: [
        'Auflösung per Knopf auf dem Beamer öffnen (öffnet bei allen; sonst erst 18:00, Ende des Kurstags). Sie zeigt zuerst „Eure Sätze“ nach Rolle (über die Seite geschickt; fehlt einer, reihum laut), dann die drei aus dem Buch. Vorlesen, ohne zu werten.',
        'Jede*r vergleicht den eigenen Satz mit dem der eigenen Rolle, dann den Schritt „Jede Sicht ist berechtigt. Darum gleich reihum“ aufdecken – Überleitung zur Besprechung der Snapshots: Die anderen hören, was ihr überhört.',
      ],
      aufloesung: 'Produktmanagement hört „Unter ‚Beliebt‘ nur Serien“ (Sorge ums Angebot), Design „Wir fanden nicht heraus, wie man nach einem Titel sucht“ (Bedienung), Entwicklung „Fast nur Kinderfilme“ (technischer Weg, verschiedene Nutzer*innen zu erkennen). Jede Sicht ist berechtigt; je unterschiedlicher das Team, desto mehr holt es aus einem Interview.',
    },
    kern: [
      {
        text: 'Interview Together, Act Together: Ist eine Rolle die „voice of the customer“, sticht sie jede andere Rolle; bei Uneinigkeit hat die andere Person keine Antwort auf „This is what the customer wants“. „The goal is for all team members to be the voice of the customer.“',
        quelle: `${TORRES}, S. 74–75`,
      },
      {
        text: 'Netflix-Geschichte: Die Produktmanagerin hört „Most popular was all TV shows“ (Angebot), der Designer „We couldn’t figure out how to search for a specific movie title“ (Bedienung), die Entwicklerin „Most of the recommendations were for kids’ movies“ (Nutzer*innen technisch erkennen). „Each perspective is valid and can lead to an important product improvement.“',
        quelle: `${TORRES}, S. 75`,
      },
      {
        text: 'Lern-Engpass: Eine Person führt die Gespräche und sagt dem Team, was die Kundschaft will; „Die Kund*innen haben es gesagt“ sticht dann jedes Argument.',
        quelle: `${MOMTEST}, S. 99–100`,
      },
    ],
    ueberleitung: 'Genau das holt ihr jetzt nach: Snapshots im Team besprechen, mit vier Fragen.',
  },

  besprechen: {
    live: [
      '„Die vier Fragen sind euer Raster für jede Runde.“',
      'Fragen: Was davon kennt ihr aus Need Finding, was ist neu?',
      'Was ändert sich: gestützt, wackelt oder noch offen? Mit Zitat-ID notieren.',
      'Falle: nur Inhalt, keine Meta-Ebene – Frage 3 und 4 einfordern.',
      'Im Zeigen-Modus K drücken: Kontext mit Annahmen und Leitfaden der Person.',
    ],
    kern: [
      {
        text: 'Nach jedem Gespräch geht das Team die Notizen gemeinsam durch und passt Überzeugungen und die drei großen Fragen an: wichtigste Zitate und Aussagen, Probleme im Gespräch, die Meta-Ebene (welche Fragen gingen, welche nicht, welche Signale fehlten). Der Schritt klingt so einfach, dass man ihn gern überspringt.',
        quelle: `${MOMTEST}, S. 103`,
      },
    ],
    ueberleitung: 'Einmal vorgemacht an I2.',
  },

  beispiel: {
    live: [
      'Vier Fragen an I2, Schritt für Schritt aufdecken.',
      'Erst fragen: Wohin schreibt ihr das? Dann aufdecken.',
      '„Ein Snapshot ist ein Beleg, kein Beweis – A1 rückt erst mit weiteren.“',
      'Fragen: Was hättet ihr I2 noch gefragt?',
      'Proberunde (ca. 4 min): Demo zeigen, I2 – Fragen 1–4, Eintrag vorführen.',
    ],
    verstaendnis: {
      frage: 'Widerlegt I2 die Annahme A1?',
      antwort: 'Nein, I2 ist ein erster Gegenbeleg – er kommt bei A1 in die Annahmen-Map, mit „spricht dagegen“ in der Beleg-Notiz. Nach links rückt eine Annahme nur mit Belegen dafür (Torres S. 129); eine Zeile im Entscheidungslog kommt erst, wenn ihr deshalb etwas ändert (bei der Kaffeebar D4 nach allen fünf).',
      falsch: '„Ja, A1 ist falsch“ – ein Interview ist ein Beleg, kein Beweis.',
    },
    ablauf: {
      schritte: [
        'Proberunde (ca. 4 min), live mit der Demo-Mappe der Kaffeebar: „Demo zeigen ↗“ auf der Folie (nur in deiner Ansicht) öffnet /innolab/mappe?ansicht=demo; dort in der Zeile Interviews auf „Zeigen“ (kein direkter Link in den Zeigen-Modus). „I2, bitte“ – Zitat, Geschichte, Chancen (falls die Fragenleiste da ist: Taste 1).',
        'K → Reiter Annahmen; Frage 2: eine Person sagt „I2-4 spricht gegen A1“.',
        'Frage 3 und 4 kurz: Reiter Leitfaden, dann „Alle Zitate“ öffnen.',
        'Eintrag vorführen: zweiter Tab, Demo-Mappe → Annahmen-Map → A1: Beleg-ID I2-4, Notiz „spricht dagegen“, Speichern. Zurück in Zeigen „Neu laden“ → A1 steht als „neu“ und hervorgehoben.',
        'Bei Zeitnot (Interviews erst heute eingetragen): die Proberunde ersetzt das Vorlesen dieser Folie.',
      ],
      achten: [
        'Lösung Frage 1 – Was wurde gesagt? Merkzitat I2-2 „Wenn ich auf die Uhr schauen muss, geh ich.“; I2-1 „Acht Leute vor mir, da hab ich gleich gewusst, das wird nix.“; I2-4 „Ich schau auf die Tafel, dann auf die Schlange, und dann entscheid ich.“ → Im Snapshot steht schon die Einsicht „Entscheidet erst beim Ankommen.“',
        'Lösung Frage 2 – Was ändert sich? A1, die riskanteste („… schon vor der Ankunft am Bahnhof entscheiden …“), wackelt: I2-4 spricht dagegen. Noch herausfinden: Entscheiden die anderen auch erst in der Halle? → nächste Interviews (bei der Kaffeebar kam das mit I3-1 und I5-3, daraus später D4). Ein Interview ist ein Beleg, kein Beweis.',
        'Lösung Frage 3 – Wie war das Gespräch? F1 „Erzähl mir vom letzten Morgen …“ brachte die Geschichte (Ankunft 7:31, acht Leute, Blick auf die Uhr, Automat, Zug 7:42). Nicht funktioniert: beim Automaten (I2-3) nicht nachgefragt, obwohl die Nachfrage F6 „Warum?“ im Leitfaden steht. → Leitfaden: F1 bleibt.',
        'Lösung Frage 4 – Was haben wir überhört? I2-3 „Ich hab dann am Automaten gedrückt, ohne nachzudenken.“ – Warum der Automat? Notlösung oder gut genug? → Leitfaden, Nachfrage „Warum der Automat?“',
        'Lösung Eintrag (Schreibzeit): Annahmen-Map → A1: Beleg „gesagt“, Beleg-ID I2-4, Notiz „spricht dagegen“ → Speichern; im Zeigen-Modus „Neu laden“.',
        'Warum I2 und nicht I1: Bei I1 steht der Widerspruch zu A1 nur in den Notizen („Schaut erst auf die Schlange, dann auf die Uhr“), ohne Zitat-ID – kein Beleg zum Eintragen.',
        'Vorbereitung: vor dem Kurs in der Demo-Mappe anmelden und Speichern testen; A1 hat noch keine Beleg-ID (Ausgangslage). Nach dem Kurs den Eintrag entfernen oder als Beispiel lassen.',
      ],
    },
    ueberleitung: 'Jetzt ihr: drei Runden, jede*r zeigt einmal.',
  },

  'noch-keine': {
    live: [
      'Zeit: 14:15 noch keine Interviews in der Werkstatt? Dann diese Folie.',
      'Timer 35 min starten: Eintragen bis 14:50.',
      '„Der Link öffnet euren Interviews-Editor direkt – speichern nicht vergessen.“',
      'Wer schon Interviews hat: Pause bis 14:50, dann alle gemeinsam.',
      'Ab 14:50 Runden à 5 min: zeigen, Frage 2, schreiben.',
    ],
    uebung: { dauer: 'bis 14:50 (35 min ab 14:15)', form: 'allein, jede*r in den eigenen Interviews' },
    ablauf: {
      schritte: [
        'Nur zeigen, wenn um 14:15 noch keine Interviews in der Werkstatt stehen (Frage auf verschwimmen). Ablauf und Ansagen der kurzen Runden: Begleiter vorgehen, Fallback 1.',
        'Der Link „Interviews ↗“ öffnet /innolab/mappe?bearbeiten=interviews in einem neuen Tab: Nach dem Laden der Mappe geht der Editor der Interviews von selbst auf. Wer nicht angemeldet ist, meldet sich an und landet danach im Editor.',
      ],
    },
    ueberleitung: 'Um 14:50 geht es mit den Runden weiter – erst die Kaffeebar, dann ihr.',
  },

  vorgehen: {
    live: [
      'Reihenfolge: Sofie → Joachim → Hewen. Timer 12 min je Runde.',
      'Minute 0: „[Name] zeigt – welche ID? Frage 1, fünf Minuten.“',
      'Minute 5: „Stopp. Frage 2 – die anderen zuerst.“',
      'Minute 7: „Frage 3 – [Name] zuerst.“',
      'Minute 8,5: „Frage 4 – die anderen.“ Zum Schluss: „Noch etwas für [Name]?“',
      'Minute 10: „Ein Beleg in die Map – speichern bis Minute 11:30.“',
      'Minute 12: „Wechsel. [Nächste], welche ID?“',
      'Fallback: 0 ID, Chance · 2 Frage 2 · 4 Eintrag · 5 Wechsel.',
      'Kontext ab Minute 5 offen lassen; Minute 11:30 einmal Neu laden.',
      'Wer zuhört: laut sagen, wer zeigt, schreibt mit.',
      'Hewen: in der Runde A2; A1 oder A2 erst beim Festhalten.',
      'Falle: wer zeigt, verteidigt – bei Frage 2 und 4 zuhören.',
      'Nach drei Runden: weiter zu Festhalten, Timer 8 min dort.',
    ],
    uebung: { dauer: '44 min (3 × 12 + 8)', form: 'zu dritt reihum, dann allein' },
    miro: {
      frame: 'T1 · 5 · Interview-Snapshots (aus der Werkstatt)',
      schritte: [
        'Miro erst in der Pause: Snapshots übertragen.',
      ],
    },
    ablauf: {
      schritte: [
        'Fallback 1 – Interviews erst heute eingetragen (gilt immer, wenn zu Beginn, 14:15, noch keine Interviews in der Werkstatt stehen; dafür die Folie noch-keine davor): Bis 14:50 trägt jede*r die besten zwei bis drei ein – Pseudonym, Datum, Einwilligung, 3–5 wörtliche Zitate mit ID, Chancen mit Beleg-IDs; Kurzinfos, Einsichten, Notizen später. Danach Theorie nur snapshot-i2 und geschichte/warum (7 min), Runden 3 × 5 min (2 zeigen · 2 Frage 2, Frage 3 nur kurz, Frage 4 entfällt · 1 schreiben), Festhalten 3 min, Übertrag ein Satz je Person – Ende wie geplant 15:15. Ansagen je Runde: 0:00 „ID, Zitat, eine Chance“ · 2:00 „Frage 2, die anderen zuerst“ (Frage 3 kurz) · 4:00 „Schreiben“ (derselbe eine Eintrag in der Annahmen-Map, ca. 1 min, sonst beim Festhalten) · 5:00 „Wechsel“.',
        'Fallback 2 – nur synthetische Interviews (Pseudonym „Synthetisch“): Frage 3 entfällt, weil es kein echtes Gespräch gab; nichts zählt als Beleg, also kein Eintrag in der Annahmen-Map. Stattdessen in der Schreibzeit eine Frage im Leitfaden ändern oder ergänzen – sie erscheint im Kontext (Reiter Leitfaden) als „neu“. Das ist unabhängig vom Zeitplan: Echte Interviews, die erst heute eingetragen wurden, streifen Frage 3 kurz.',
        'Bildschirm teilen: Werkstatt im Zeigen-Modus, Interviews der Person, die zeigt („Snapshots zeigen ↗“ auf der Folie, nur in deiner Ansicht). Kein Beamer-Modus, kein Wechsel des Präsentierenden. Die Studierenden haben die Synthese-Seite auf dem eigenen Gerät offen (wie in der Antwortrunde); die Links auf den Folien (Annahmen-Map ↗, Leitfaden ↗, Interviews ↗, Log ↗) öffnen in einem neuen Tab direkt den Editor in der eigenen Mappe.',
        'Reihenfolge Sofie → Joachim → Hewen. Hewen bleibt in der Runde bei A2; A1 oder A2 erst beim Festhalten.',
        '0:00–5:00 Zeigen (Frage 1): Ansage „[Name] zeigt – welche ID? Frage 1, fünf Minuten.“ Timer 12 min starten, ID hören, den Chip (I1 … In) anklicken – der Snapshot steht. Falls die Fragenleiste da ist: Taste 1.',
        '5:00 Frage 2: „Stopp. Frage 2 – die anderen zuerst.“ K drücken, Kontext, Reiter Annahmen – und das Panel ab jetzt offen lassen: „neu“ vergleicht mit dem letzten Laden; wer es erst bei Minute 11:30 zum ersten Mal öffnet, sieht nichts markiert. Falls die Fragenleiste da ist: Taste 2.',
        '7:00 Frage 3: „Frage 3 – [Name] zuerst.“ Im Kontext Reiter Leitfaden. Falls die Fragenleiste da ist: Taste 3.',
        '8:30 Frage 4: „Frage 4 – die anderen.“ „Alle Zitate“ (und Notizen) öffnen. Falls die Fragenleiste da ist: Taste 4; F blendet die Leiste ein oder aus. Die Besprechung schließen mit „Noch etwas für [Name]?“',
        '10:00–11:30 Schreiben: „Ein Beleg in die Map – speichern bis Minute 11:30.“ (Die Werkstatt speichert nicht von selbst.) Bei Minute 11:30 (Timer-Minute, nicht Uhrzeit) einmal „Neu laden“ – im Kontext, Reiter Annahmen, steht der Eintrag dann als „neu“. Zeigt nichts „neu“: „kommt in Festhalten“ sagen und weitergeben, nicht suchen.',
        '12:00 Wechsel: „Wechsel. [Nächste], welche ID?“ Timer neu starten. Nach drei Runden (36 min) zur Folie Festhalten, Timer 8 min dort: erst die eigenen Notizen übertragen – Chance oder Einsicht in den Snapshot, Leitfaden (Frage ändern, Nachfrage), Beleg in der Annahmen-Map prüfen –, dann eine Zeile ins Log zur riskantesten Annahme: verworfen, geändert oder bewusst behalten, mit Grund.',
      ],
      achten: [
        'Rollenkarte – wer zeigt: Vorher den Snapshot wählen, ID laut sagen. 0–5 durch den Snapshot führen (Frage 1). 5–10 bei Frage 2 und 4 erst zuhören, nicht verteidigen (Kursregel, abgeleitet aus Torres S. 74–75); bei Frage 3 zuerst antworten. 5–10 schreibt in die eigenen Notizen mit, was die anderen laut sagen. 10–11:30 genau ein Eintrag: in der Annahmen-Map bei der Annahme aus Frage 2 die Zitat-ID und „stützt“ oder „spricht dagegen“ – speichern bis Minute 11:30. Alles andere in die eigenen Notizen, fürs Festhalten. Nur synthetisch: stattdessen eine Frage im Leitfaden ändern.',
        'Rollenkarte – wer fragt: 0–5 Mikro aus, zuhören, Fragen für die Besprechung notieren: Was höre ich, welche Annahme berührt das? 5–10 laut sagen; Fragen notieren ja, Mitschrift für ein fremdes Produkt nein – Frage 2: welche Annahme gestützt wird oder wackelt, mit Zitat-ID; Frage 4: ein Zitat nennen, das im Snapshot fehlt. 10–12 still in die eigenen Notizen, was man fürs eigene Produkt mitnimmt; wer als Nächstes zeigt, hält die ID bereit.',
        'Welcher Snapshot: Kursregel, nicht aus Torres oder Fitzpatrick – der, der am meisten für oder gegen die riskanteste Annahme spricht (speist Frage 2 und den einen Eintrag in der Annahmen-Map); bei Gleichstand die überraschendste Geschichte. Ein Snapshot pro Runde, nicht blättern.',
        'Belege mit Zitat-ID eintragen, nicht nur „I2“. Jede Chance nennt mindestens eine Zitat-ID – ohne ID kein Beleg. Synthetische Interviews (Pseudonym „Synthetisch“) zählen nie als Beleg.',
        'Streuen die fünf Snapshots in alle Richtungen, über eine engere Zielgruppe im Produkt-Brief sprechen (Mom Test S. 89).',
      ],
      fehler: [
        'Nur nacherzählen statt die Fragen 2–4 zu stellen.',
        'Wer zeigt, verteidigt den Snapshot, statt zuzuhören.',
        'Ein Interview als Beweis werten und die Annahme gleich abhaken.',
      ],
    },
    kern: [
      {
        text: 'Interview Together, Act Together: Verschiedene Rollen hören in derselben Geschichte Verschiedenes; „Each perspective is valid“ – das Team gewinnt, wenn viele zuhören. Wer bei welcher Frage beginnt, ist eine daraus abgeleitete Kursregel, nicht Torres.',
        quelle: `${TORRES}, S. 74–75`,
      },
      {
        text: 'So lange Gespräche führen, bis nichts Neues mehr kommt; bei einer klar umrissenen Zielgruppe können drei bis fünf reichen. Streuen die Ergebnisse nach mehr als zehn Gesprächen noch in alle Richtungen, ist die Zielgruppe vermutlich zu unscharf.',
        quelle: `${MOMTEST}, S. 89`,
      },
    ],
    ueberleitung: 'Nach den drei Runden: festhalten, was sich ändert.',
  },

  festhalten: {
    live: [
      'Timer 8 min starten, alle arbeiten allein in der Werkstatt.',
      'Tabelle von oben: übertragen, prüfen, eine Zeile ins Log.',
      'Vorführen (ca. 1 min): Demo-Log, D5 „behalten“ live schreiben.',
      '„Drei Arten: verworfen (D4), geändert (D3), bewusst behalten (D5).“',
      'Links öffnen den Editor direkt; in jedem Editor speichern.',
      'Nur synthetisch: geänderte Leitfaden-Frage prüfen, nie synthetisches Zitat als Beleg.',
      'Riskanteste ist vorgemerkt (aus der Forschungsfrage) – passt sie noch?',
      'Hewen: A1 oder A2?',
      '„Eine Zeile reicht.“',
      'Zweite Zeile nur bei neuer Zielgruppe oder neuem Problem.',
      'Falle: Gegenbeleg nur ins Log statt in die Annahmen-Map.',
      'Falle: synthetisches Zitat als Beleg oder im Grund – zählt nie.',
    ],
    uebung: { dauer: '8 min', form: 'allein, jede*r im eigenen Log' },
    ablauf: {
      schritte: [
        'Vorführen: eine Log-Zeile (ca. 1 min), vor dem Timer. Zuerst zeigen, was im Log der Demo-Mappe schon steht: D4 verworfen – „Vorbestellen vor der Ankunft verworfen“, Grund „3 von 5 sagen, sie entscheiden erst in der Halle“, Beleg gesagt (I2-4, I3-1, I5-3). D3 geändert – „Zielgruppe: Pendler*innen mit festem Morgenzug, 7:15–7:45, egal wohin“, ersetzt D1, Beleg gesagt (I1–I5).',
        'Dann live die dritte Art, bewusst behalten: /innolab/mappe?ansicht=demo&bearbeiten=entscheidungen öffnet den Log-Editor deiner Demo-Mappe direkt. „Neue Entscheidung“ → neue Zeile D5, Datum steht schon auf heute. Entscheidung (D5): „A3 bewusst behalten: Bestellen im Gehen bleibt als Annahme“. Grund (D5): „Kein Interview sagt etwas dazu; wir prüfen es mit einem Test, nicht mit Interviews.“ Beleg (D5): „noch keiner“ (voreingestellt), Beleg-IDs leer lassen. Speichern.',
        'Warum A3: „Wir glauben, dass Pendler*innen im Gehen innerhalb von 20 Sekunden bestellen können“ (bedienbar, mittel, Beleg noch keiner) – kein Zitat der Kaffeebar berührt das Bestellen im Gehen; „behalten“ ist darum ehrlich.',
      ],
      achten: [
        'Das Log hängt nur an: Gespeichert bleibt D5 in der Demo-Mappe stehen und lässt sich nicht mehr löschen (nur ersetzen). Vorher genau so eintippen; D5 bleibt dann als Beispiel für „behalten“. Steht schon eine D5 im Demo-Log, heißt die neue Zeile anders – dann die ID im Satz anpassen.',
      ],
    },
    verstaendnis: {
      frage: 'I2 widerspricht eurer riskantesten Annahme. Wohin damit?',
      antwort: 'In die Annahmen-Map als Beleg (I2-4). Ins Log kommt eine Zeile erst, wenn ihr deshalb etwas entscheidet – verworfen, geändert oder bewusst behalten.',
      falsch: '„Eine Zeile ‚A1 hat Gegenbeleg‘ ins Log“ – das ist ein Stand, er gehört in die Map; das Log hält fest, was ihr darum tut.',
    },
    kern: [
      {
        text: 'Fitzpatrick, nach einer Reihe von Gesprächen: Notizen und wichtige Zitate mit dem Team durchgehen, „Update your beliefs and plans“, die nächsten drei großen Fragen festlegen. Nach jedem Gespräch soll das Gelernte „on paper and in everyone’s head“ sein; das „leads to better decisions, prevents arguments“.',
        quelle: `${MOMTEST}, S. 103, 110`,
      },
      {
        text: 'Bland, Learning Card: „We believed that …“, „We observed …“, „From that we learned that …“, „Therefore, we will …“ – die Zeile im Log ist das „Therefore“. Gelerntes hat ein Ablaufdatum, darum wird es in Handlung übersetzt: aufgeben, ändern oder weiter testen.',
        quelle: 'David J. Bland & Alexander Osterwalder, Testing Business Ideas, S. 55, 62',
      },
      {
        text: 'Kaffeebar nach den Interviews: D3 „Zielgruppe: Pendler*innen mit festem Morgenzug, 7:15–7:45, egal wohin“ ersetzt D1 (Beleg gesagt, I1–I5); D4 „Vorbestellen vor der Ankunft verworfen“ (gesagt, I2-4, I3-1, I5-3; bei I1 nur in der Notiz).',
        quelle: 'Werkstatt, Beispiel Kaffeebar, entscheidungen.json',
      },
    ],
    fragen: [
      {
        frage: 'Und wenn sich nichts geändert hat?',
        antwort: 'Dann ist „bewusst behalten“ die Entscheidung: eine Zeile, dass Zielgruppe und Problem bleiben, mit den IDs echter Interviews als Beleg. Wer nur synthetische Interviews hat, behält ebenfalls bewusst, aber mit Beleg „noch keiner“ und dem nächsten Schritt im Grund: in echten Interviews prüfen. Oder ihr fragt euch, ob die Interviews zu nett waren (Übertrag).',
      },
    ],
    ueberleitung: 'Dann reihum: jede*r liest die eigene Zeile vor.',
  },

  uebertrag: {
    live: [
      'Reihum: jede*r liest die eigene Zeile vor – Entscheidung, Grund, Beleg-Stufe.',
      '„Beleg: noch keiner“ gilt – im Grund steht dann: in echten Interviews prüfen.',
      'Echte Interviews ohne Beleg: zu nett oder nach der Idee gefragt?',
      'Pause: Claude ‚Übertrag die Snapshots‘ – vor der Experience Map.',
    ],
    miro: {
      frame: 'T1 · 5 · Interview-Snapshots (aus der Werkstatt)',
      schritte: [
        'In der Pause: Snapshots übertragen, vor der Experience Map.',
      ],
    },
    ueberleitung: 'Nach der Pause zeichnet ihr aus den Geschichten eurer Snapshots die Experience Map neu.',
  },
};
