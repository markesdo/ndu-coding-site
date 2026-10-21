// Tageskarte des Präsentator-Begleiters (/innolab/begleiter, Knopf „Tag“): je Block des Ablaufs in tag-1.astro das
// Lernziel und was bei Verzug gestrichen wird, dazu das Material. Schlüssel = Block-Titel genau wie im Ablauf
// (<Block title="…">); ein Test prüft, dass jeder Block mit Link einen Eintrag hat und kein Eintrag ins Leere zeigt.

export type TagBlock = {
  /** „Nach dem Block können alle …“ */
  lernziel: string;
  /** Wenn hinten: was zuerst wegfällt, Folien-id in Klammern. */
  streichen?: string[];
};

export type TagKarte = {
  bloecke: Record<string, TagBlock>;
  /** Vor dem Start bereitlegen bzw. prüfen; wann = Block-Titel oder „Vor dem Start“. */
  material: { wann: string; was: string }[];
};

export const TAG_1: TagKarte = {
  bloecke: {
    'Kick-off': {
      lernziel: 'Nach dem Block können alle die vier Ebenen des Opportunity Solution Tree nennen und eine Lösung in Verkleidung von einer Chance unterscheiden.',
      streichen: [
        'Die vier Gegner nach Heath weglassen (was-noch).',
        'Nur den Folien-Satz, ohne Nigel Cross (problem-loesung).',
        'Miro: nur Spalte wählen und „Alle zu mir holen“, den Rest erklärt der Frame „Start hier“ (miro).',
      ],
    },
    'Warm-up · Wie macht man Toast?': {
      lernziel: 'Nach dem Block können alle in Knoten und Verbindungen zeichnen, wie ihre Zielgruppe ihr Problem heute löst, und unsichere Verbindungen mit „?“ markieren.',
      streichen: [
        'TED-Video (9 min) nur erwähnen statt zeigen (toast).',
        'Nicht sammeln, gleich die drei Punkte zeigen (toast-aufloesung).',
        'Beim Zeigen nur eine Frage je Map (toast-uebertrag).',
      ],
    },
    'Outcome statt Output': {
      lernziel: 'Nach dem Block können alle Output, Outcome und Impact unterscheiden, ein Product Outcome als Wurzel formulieren und ein Skateboard-MVP für die erste Annahme benennen.',
      streichen: [
        'Lego/Minecraft und das Busticket weglassen (skateboard).',
        'Zappos weglassen (mvp).',
        'Wells Fargo in einem Satz, ohne Geschichte (outcome-filter).',
      ],
    },
    'Problem-Rahmen & Produkt-Brief': {
      lernziel: 'Nach dem Block können alle für ihr Produkt einen Problem-Rahmen schreiben (für wen, Problem ohne Lösung, heute gelöst durch, macht es nicht, Outcome als beobachtbares Verhalten) und ihn als Produkt-Brief in der Werkstatt speichern.',
      streichen: [
        'Die Übung allein braucht 60 min, so lang wie der Block: Theorie-Folien sehr knapp halten.',
        'Tierheim-Geschichte und Zusatzfälle weglassen, nur Aufzug und Spiegel plus Kaffeebar (reframing).',
        'Charlotte-Geschichte weglassen, nur „gleiche Sicht“ nennen (loesungsraum).',
        'Schritt 5: Claude-Prüfung in die Hausaufgabe, im Raum nur die Prüfliste (vorgehen).',
      ],
    },
    'Entscheidungslog': {
      lernziel: 'Nach dem Block können alle eine Produktentscheidung als Zeile ins Log eintragen und ehrlich angeben, wie stark der Beleg ist, auch wenn er „noch keiner“ lautet.',
      streichen: [
        'Ganz weglassen, kommt in der Annahmen-Map wieder (beleg-staerke).',
        'Nur D1 → D3 erzählen, D4 weglassen (beispiel).',
        'Nicht reihum: die Frage einmal stellen, Antworten in die Annahmen-Map mitnehmen (uebertrag).',
      ],
    },
    'Annahmen-Map': {
      lernziel: 'Nach dem Block können alle die Annahmen hinter ihrem Produkt-Brief als „Wir glauben, dass …“-Sätze aus allen vier Arten aufschreiben, nach Wichtigkeit und Beleg einordnen und die riskanteste als Forschungsfrage benennen.',
      streichen: [
        'Kein New Coke, keine Beispielrunde, nur die Skala nennen (beleg).',
        'Herkunft der Arten und Zeitungs-Test weglassen (arten).',
        'Dreierrunde 10 → 5 min, Red-Team-Prompt als Hausaufgabe; die Prüfliste bleibt (vorgehen).',
      ],
    },
    'Jobs to be Done & Mom Test': {
      lernziel: 'Nach dem Block können alle eine Frage nach Meinung oder Zukunft in eine Frage nach dem letzten konkreten Mal umschreiben und eine Ein-Satz-Antwort mit Nachfragen zur Geschichte ausgraben.',
      streichen: [
        'Kein Jeans-Experiment live, Gazzaniga und Kahneman weglassen (warum-geschichten).',
        'Nur eine Frage von links unten besprechen (fragen-matrix).',
        'Streaming-Beispiel weglassen, nur die Kaffeebar-Zeile (forschungsfrage).',
      ],
    },
    'Interviewleitfaden': {
      lernziel: 'Nach dem Block können alle einen eigenen Leitfaden aus der Forschungsfrage ableiten und ihn in einem Interview mit einer schwierigen Person einsetzen, ohne zu pitchen.',
      streichen: [
        'Schritt 2 (Prüfliste und Claude) kürzen oder streichen; die Live-Runden starten spätestens 15:30 (vorgehen).',
        'Claude-Probe 15 → 5 min (vorgehen, Schritt 3).',
        'Nur eine Runde im Plenum statt reihum (uebertrag).',
      ],
    },
    'Hausaufgabe & Abschluss': {
      lernziel: 'Nach dem Block können alle fünf Interviews mit Einwilligung und Pseudonym planen und nach jedem Gespräch einen Snapshot in Miro (T1 · 5) anlegen.',
      streichen: [
        'Kochbuch-Geschichte weglassen, wenn sie beim Mom Test schon kam (hausaufgabe).',
        'Streaming-Beispiel weglassen, nur die Kaffeebar-Karte I2 (snapshot).',
        'Kein Zoom über das Board, nur den Satz zu Tag 2 (rueckblick).',
      ],
    },
  },
  material: [
    { wann: 'Vor dem Start', was: 'Beamer-Tab mit Präsentator-Schlüssel, Begleiter auf dem Tablet folgt' },
    { wann: 'Vor dem Start', was: 'Miro-Team-Board offen, Link im Teams-Kanal (Passwort = Website-Passwort)' },
    { wann: 'Vor dem Start', was: 'In der Werkstatt angemeldet (für „Zahlen aus der Werkstatt holen“ am Ende)' },
    { wann: 'Toast', was: 'Je Person ein Blatt und ein dicker Stift' },
    { wann: 'Toast', was: 'Ton für das TED-Video getestet' },
    { wann: 'Problem-Rahmen', was: 'Alle in der Werkstatt angemeldet; wer aus dem Coding-Kurs kommt, hat den alten Brief griffbereit' },
    { wann: 'Annahmen-Map', was: 'Stickies in vier Farben im Frame T1 · 3 (gelb, blau, grün, lila)' },
    { wann: 'Annahmen-Map', was: 'Claude-Connector der Werkstatt funktioniert (Prüfliste, Red Team)' },
    { wann: 'Interviewleitfaden', was: 'Prompt „Probe mit Claude“ griffbereit; du spielst in den drei Live-Runden die schwierige Person' },
    { wann: 'Abschluss', was: 'Teams-Post zur Ankündigung des Interview-Editors vorbereitet' },
  ],
};
