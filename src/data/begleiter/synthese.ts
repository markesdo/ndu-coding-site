import type { Notiz } from './typen';
import { CHAT_NETFLIX, CHAT_SYNTHESE } from './chat';

// Begleiter-Notizen zu src/pages/innolab/methoden/synthese.astro (Tag 2, 14:15–15:15; bis 11.11. 14:05–15:10, 5 min Theorie gingen an den Rückblick auf Tag 1). Vorwissen: „teilweise“ aus Need
// Finding (vorwissen.ts) – darum zuerst fragen, was bekannt ist, und die Theorie dann knapp halten.
// Torres-Seiten = gedruckte Seiten aus quellen/torres/text.txt; Fitzpatrick wie auf der Seite zitiert.
const TORRES = 'Teresa Torres, Continuous Discovery Habits';
const MOMTEST = 'Rob Fitzpatrick, The Mom Test';

export const NOTIZEN_SYNTHESE: Record<string, Notiz> = {
  verschwimmen: {
    live: [
      'Fragen: Wer hat Interviews schon in der Werkstatt? Sonst Fallback (vorgehen).',
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
    uebung: { dauer: '1 min', form: 'allein, ein Satz auf der Seite (Rückfall: Teams-Chat)' },
    chat: CHAT_NETFLIX,
    ablauf: {
      schritte: [
        'Folie zeigen, die Geschichte vorlesen.',
        'Rollen zuteilen (nur den Namen: Produktmanagement, Design, Entwicklung). Studierende öffnen die Folie auf ihrem eigenen Gerät, wählen dort ihre Rolle. Timer 1 min: Jede*r tippt einen Satz – was ist aus der eigenen Rolle das Wichtigste? Noch nicht abschicken.',
        'Auf dein Zeichen schicken alle gleichzeitig ab; der Beamer zeigt „2 von 3 haben geantwortet“. Bis zum Aufdecken kann jede*r noch ändern. Steht auf der Seite „Antwort bitte in den Teams-Chat.“ (Server weg), geht die Runde wie bisher im Chat. Dann zur nächsten Folie.',
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
      antwort: 'Wer alle Interviews führt, kann jede Diskussion mit „Das will die Kundschaft“ beenden – das gibt einer Person zu viel Macht. Ziel ist, dass alle die Stimme der Kundschaft sind (S. 74–75). Fitzpatrick nennt das Gegenteil den Lern-Engpass (Mom Test, S. 98–99).',
      falsch: '„Weil sich eine Person verhören kann“ – es geht um Macht im Team und um verschiedene Sichten.',
    },
    ablauf: {
      schritte: [
        'Auflösung per Knopf auf dem Beamer öffnen (öffnet bei allen; sonst erst 18:00, Ende des Kurstags). Sie zeigt zuerst „Eure Sätze“ nach Rolle (über die Seite geschickt; Chat-Sätze vorlesen), dann die drei aus dem Buch. Vorlesen, ohne zu werten.',
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
        quelle: `${MOMTEST}, S. 98–99`,
      },
    ],
    ueberleitung: 'Genau das holt ihr jetzt nach: Snapshots im Team besprechen, mit vier Fragen.',
  },

  besprechen: {
    live: [
      '„Die vier Fragen sind euer Raster für jede Runde.“',
      'Fragen: Was davon kennt ihr aus Need Finding, was ist neu?',
      'Was ändert sich: Beleg sofort in die Annahmen-Map.',
      'Falle: nur Inhalt, keine Meta-Ebene – Frage 3 und 4 einfordern.',
      'Im Zeigen-Modus K drücken: Kontext mit Annahmen und Leitfaden der Person.',
    ],
    kern: [
      {
        text: 'Nach jedem Gespräch geht das Team die Notizen gemeinsam durch und passt Überzeugungen und die drei großen Fragen an: wichtigste Zitate und Aussagen, Probleme im Gespräch, die Meta-Ebene (welche Fragen gingen, welche nicht, welche Signale fehlten). Der Schritt klingt so einfach, dass man ihn gern überspringt.',
        quelle: `${MOMTEST}, S. 102`,
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
    ],
    verstaendnis: {
      frage: 'Widerlegt I2 die Annahme A1?',
      antwort: 'Nein, I2 ist ein erster Gegenbeleg – er kommt bei A1 in die Annahmen-Map, mit „spricht dagegen“ in der Beleg-Notiz. Nach links rückt eine Annahme nur mit Belegen dafür (Torres S. 129); eine Zeile im Entscheidungslog kommt erst, wenn ihr deshalb etwas ändert (bei der Kaffeebar D4 nach allen fünf).',
      falsch: '„Ja, A1 ist falsch“ – ein Interview ist ein Beleg, kein Beweis.',
    },
    ueberleitung: 'Jetzt ihr: drei Runden, jede*r zeigt einmal.',
  },

  vorgehen: {
    live: [
      'Schritte unten kopieren und in den Teams-Chat einfügen.',
      'Teile die Lehrenden-Ansicht, nicht Beamer-Modus; Leser pro Person.',
      'Reihenfolge festlegen, Timer 12 min je Runde neu starten.',
      'Zeit laut ansagen: 5 zeigen · 10 Schreibzeit · 12 Wechsel.',
      'Nach dem Schreiben: Neu laden, Vorlesen ‚Ich nehme mit …‘.',
      'Nach 36 min: weiter zur Folie Festhalten, Timer 8 min dort.',
      'Fallback: Werkstatt leer? Bis 14:50 die besten 2–3 eintragen.',
      'Werkstatt: erst Zitate, dann Chancen mit Belegen.',
    ],
    uebung: { dauer: '44 min (3 × 12 + 8)', form: 'zu dritt reihum, dann allein' },
    chat: CHAT_SYNTHESE,
    miro: {
      frame: 'T1 · 5 · Interview-Snapshots (aus der Werkstatt)',
      schritte: [
        'Miro erst in der Pause: Snapshots übertragen.',
      ],
    },
    ablauf: {
      schritte: [
        'Fallback, wenn zu Beginn (14:15) noch keine Interviews in der Werkstatt stehen: Bis 14:50 trägt jede*r die besten zwei bis drei ein – Pseudonym, Datum, Einwilligung, 3–5 wörtliche Zitate mit ID, Chancen mit Beleg-IDs; Kurzinfos, Einsichten, Notizen später. Danach Theorie nur snapshot-i2 und geschichte/warum (7 min), Runden 3 × 5 min (2 zeigen, 2 besprechen, 1 schreiben), Festhalten 3 min – Ende wie geplant 15:15.',
        'Schritte in den Teams-Chat kopieren (Kasten „Für den Teams-Chat“ hier im Begleiter; dieselbe Karte steht im Handout).',
        'Deinen Bildschirm teilen: die Lehrenden-Ansicht der Werkstatt, Interviews der Person, die zeigt (Leser). Kein Wechsel des Präsentierenden, kein Beamer-Modus.',
        'Reihenfolge festlegen. Runde 1: 5 min zeigen (Zitat, Geschichte, Chancen), 7 min besprechen mit den vier Fragen; ab Minute 10 schreibt, wer gezeigt hat, 2 min in der eigenen Werkstatt (Chance oder Einsicht in den Snapshot, der Rest als Stichwort auf Papier).',
        'Nach dem Schreiben: Ansicht neu laden, die Person liest vor („Ich nehme mit …“). Dann Runde 2 und 3 genauso, Timer jeweils neu starten.',
        'Festhalten und prüfen (8 min, Folie Festhalten): Stichworte übertragen – Annahmen-Map (Beleg, ID, „spricht dagegen“), Leitfaden (Frage ändern, Nachfrage), Log nur bei einer Entscheidung; dann Claude.',
      ],
      achten: [
        'Wer zeigt, verteidigt nicht, sondern hört zu: Was die anderen hören, ist der Grund für die Besprechung (Torres S. 75).',
        'Belege mit Zitat-ID eintragen, nicht nur „I2“. Jede Chance nennt mindestens eine Zitat-ID – ohne ID kein Beleg. Synthetische Interviews (Pseudonym „Synthetisch“) zählen nie als Beleg.',
        'Wer zeigt, verteidigt nicht – zuhören einfordern.',
        'Streuen die fünf Snapshots in alle Richtungen, über eine engere Zielgruppe im Produkt-Brief sprechen (Mom Test S. 88).',
      ],
      fehler: [
        'Nur nacherzählen statt die vier Fragen zu stellen.',
        'Ein Interview als Beweis werten und die Annahme gleich abhaken.',
      ],
    },
    kern: [
      {
        text: 'So lange Gespräche führen, bis nichts Neues mehr kommt; bei einer klar umrissenen Zielgruppe können drei bis fünf reichen. Streuen die Ergebnisse nach mehr als zehn Gesprächen noch in alle Richtungen, ist die Zielgruppe vermutlich zu unscharf.',
        quelle: `${MOMTEST}, S. 88`,
      },
    ],
    ueberleitung: 'Nach den drei Runden: festhalten, was sich ändert.',
  },

  festhalten: {
    live: [
      'Timer 8 min starten, alle arbeiten allein in der Werkstatt.',
      'Minute 1: riskanteste Annahme markieren – „sehr wichtig, kaum belegt“ (Tag 1).',
      '„Eine Zeile reicht.“',
      'Zweite Zeile nur bei neuer Zielgruppe oder neuem Problem.',
      'Falle: Gegenbeleg nur ins Log statt in die Annahmen-Map.',
      'Falle: synthetisches Zitat als Beleg oder im Grund – zählt nie.',
    ],
    uebung: { dauer: '8 min', form: 'allein, jede*r im eigenen Log' },
    verstaendnis: {
      frage: 'I2 widerspricht eurer riskantesten Annahme. Wohin damit?',
      antwort: 'In die Annahmen-Map als Beleg (I2-4). Ins Log kommt eine Zeile erst, wenn ihr deshalb etwas tut – verwerfen, ändern oder bewusst weiter prüfen.',
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
        antwort: 'Dann ist „bewusst behalten“ die Entscheidung: eine Zeile, dass Zielgruppe und Problem bleiben, mit den IDs echter Interviews als Beleg. Wer nur synthetische Interviews hat, kann nichts bewusst behalten: Die Zeile heißt „weiter prüfen“, Beleg „noch keiner“. Oder ihr fragt euch, ob die Interviews zu nett waren (Übertrag).',
      },
    ],
    ueberleitung: 'Dann reihum: jede*r liest die eigene Zeile vor.',
  },

  uebertrag: {
    live: [
      'Reihum: jede*r liest die eigene Zeile vor – Entscheidung, Grund, Beleg-Stufe.',
      '„Beleg: noch keiner“ gilt – die Zeile heißt dann „weiter prüfen“.',
      'Echte Interviews ohne Beleg: zu nett oder nach der Idee gefragt?',
    ],
    ueberleitung: 'Nach der Pause zeichnet ihr aus den Geschichten eurer Snapshots die Experience Map neu.',
  },
};
