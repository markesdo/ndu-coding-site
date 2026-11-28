// Frame-Name auf dem Team-Board → Miro-Frame-ID (für den Deep Link mit moveToWidget). Die IDs sind nicht geheim:
// Ohne die Board-Adresse (MIRO_BOARD_URL, nur auf Vercel) führen sie nirgendwohin.
// Der Name steht genau so im Frame-Titel auf dem Board und in <MiroFrame name="…"> bzw. <MiroLink name="…">; ein Test
// prüft, dass jeder Name aus den Seiten hier steht und jeder Eintrag hier auf einer Seite benutzt wird (sonst raus). Neuer Frame auf dem Board → ID hier eintragen (Miro: Frame anklicken, „Copy link“,
// die Zahl hinter moveToWidget=).
// Ausnahme Frames je Person (Baum, T3 · 0, Canvas): Auf dem Board tragen sie den Namen der Person, hier und auf den Seiten
// „Produkt 1/2/3“ in der Reihenfolge der Spalten auf dem Board (von links). Das Repo ist öffentlich, Namen von
// Studierenden stehen nicht im Code (kein-name.test.ts). Die ID verbindet beides; der Titel auf dem Board bleibt.
export const MIRO_FRAMES: Readonly<Record<string, string>> = {
  'Start hier · So arbeitet ihr auf diesem Board': '3458764687728125024',
  'Baum · Beispiel Kaffeebar': '3458764690142652321',
  'Baum · Produkt 1': '3458764690142652322',
  'Baum · Produkt 2': '3458764690142652323',
  'Baum · Produkt 3': '3458764690142652324',
  'T1 · 1 · Experience Map': '3458764687728125026',
  'T1 · 2 · Problem-Rahmen & Produkt-Brief': '3458764687406008349',
  'T1 · 3 · Annahmen-Map': '3458764687406008351',
  'T1 · 4 · Interviewleitfaden': '3458764687406008350',
  'T1 · 5 · Interview-Snapshots (aus der Werkstatt)': '3458764687728446144',
  'T2 · 1 · Experience Map': '3458764687841241005',
  // Ein Frame je Person (seit 20.11.2026); der gemeinsame Frame „T3 · 0 · So entsteht eure Map“ ist vom Board gelöscht.
  // Beispiel Kaffeebar (seit 20.11.2026 spät): derselbe Weg am Material der Kaffeebar, Momentnamen wie MOMENTNAMEN.
  'T3 · 0 · So entsteht eure Map - Kaffeebar': '3458764691140169696',
  'T3 · 0 · So entsteht eure Map - Produkt 1': '3458764691108606799',
  'T3 · 0 · So entsteht eure Map - Produkt 2': '3458764691110920808',
  'T3 · 0 · So entsteht eure Map - Produkt 3': '3458764691111287267',
  'T3 · 1 · Ziel-Chance': '3458764687841534117',
  'T3 · 2 · How Might We': '3458764687841534441',
  'T3 · 3 · Ideation': '3458764687841681125',
  'T3 · 4 · Kundenprofil & Value Map': '3458764687841769171',
  // Canvas je Person: vormittags Kundenprofil (rechte Hälfte, Kreis), nachmittags Value Map (linke Hälfte, Quadrat).
  'T3 · 4 · Canvas · Produkt 1': '3458764691039197393',
  'T3 · 4 · Canvas · Produkt 2': '3458764691039197394',
  'T3 · 4 · Canvas · Produkt 3': '3458764691039197395',
  // Anleitung „Value Map füllen“ (seit 25.11.2026), je ein Frame links neben dem Canvas der Kaffeebar und jeder Person.
  'T3 · 4 · Anleitung Value Map · Kaffeebar': '3458764691611513900',
  'T3 · 4 · Anleitung Value Map · Produkt 1': '3458764691611802580',
  'T3 · 4 · Anleitung Value Map · Produkt 2': '3458764691611859842',
  'T3 · 4 · Anleitung Value Map · Produkt 3': '3458764691611859843',
  // Nummern seit 28.11.2026 in der Reihenfolge des Tages (scripts/t4-frames-umnummerieren.mjs); die IDs blieben gleich.
  // Concept Story auf Miro (seit 26.11.2026): sieben Stationen auf dem Bogen und das Feld „Flach-Probe (Kursregel)“, ein Frame
  // je Person; das ausgefüllte Beispiel der Kaffeebar daneben. Seit dem Nachtrag 26.11. abends bleibt sie auf Miro (keine Datei).
  // Anleitungen auf Miro (seit 27.11.2026), je ein Frame links neben der Übung; verlinkt von deren „So geht ihr vor“.
  'T4 · 1 · Anleitung Concept Story': '3458764691728596735',
  'T4 · 1 · Concept Story · Kaffeebar': '3458764691724565870',
  'T4 · 1 · Concept Story · Produkt 1': '3458764691724622640',
  'T4 · 1 · Concept Story · Produkt 2': '3458764691724622641',
  'T4 · 1 · Concept Story · Produkt 3': '3458764691724622642',
  // Frames je Produkt für die Arbeit ohne docs-Dateien (seit 26.11.2026 nachts), je mit dem ausgefüllten Beispiel der Kaffeebar.
  'T4 · 2 · Anleitung Geschäftsmodell': '3458764691728490336',
  'T4 · 2 · Geschäftsmodell · Kaffeebar': '3458764691726674865',
  'T4 · 2 · Geschäftsmodell · Produkt 1': '3458764691726674866',
  'T4 · 2 · Geschäftsmodell · Produkt 2': '3458764691726674867',
  'T4 · 2 · Geschäftsmodell · Produkt 3': '3458764691726674868',
  // Bis 19.11.2026 „T3 · 5 · Annahmen der Idee“; genutzt wird der Frame an Tag 4 (experiment.astro) als dritte Übung des Tages.
  'T4 · 3 · Annahmen der Idee': '3458764687894872786',
  // Anleitung links neben T4 · 3 (seit 26.11.2026), verlinkt von experiment.astro#vorgehen und #vorgehen-karte.
  'T4 · 3 · Anleitung Annahmen der Idee': '3458764691725321671',
  'T4 · 4 · Story Map': '3458764687894872787',
  'T4 · 4 · Anleitung Story Map': '3458764691728716904',
  'T4 · 4 · Anleitung Warm-up · euer Morgen': '3458764691728620654',
  // Warm-up „euer Morgen“ (seit 26.11.2026): ein Frame je Person, sechs Anleitungskarten und eine Arbeitsfläche; Farben gelb Task,
  // grün Aktivität, blau Detail · orange oder · rot geht schief (anders als „T4 · 4 · Story Map“: dort Aktivitäten hellblau, Tasks hellgelb).
  'T4 · 4 · Warm-up · euer Morgen · Produkt 1': '3458764691725906138',
  'T4 · 4 · Warm-up · euer Morgen · Produkt 2': '3458764691725906820',
  'T4 · 4 · Warm-up · euer Morgen · Produkt 3': '3458764691725906821',
  'T4 · 5 · Anleitung Usage Story': '3458764691728596797',
  'T4 · 5 · Usage Story · Kaffeebar': '3458764691726734311',
  'T4 · 5 · Usage Story · Produkt 1': '3458764691726734312',
  'T4 · 5 · Usage Story · Produkt 2': '3458764691726734313',
  'T4 · 5 · Usage Story · Produkt 3': '3458764691726734314',
  // Felder (seit 26.11.2026 nachts, Prototyp auf Papier; Feld 1 seit 27.11. „1 · Skizzen: Papier oder Figma (lo-fi)“): 1 Skizzen · 2 Abnahmekriterien · 3 Karte E2 · 4 Tests ·
  // Befunde (falls getestet) · 5 Tag 5: gebaut · Für Claude Code (Bilder für den Bau an Tag 5).
  'T4 · 6 · Anleitung Prototyp': '3458764691728716089',
  'T4 · 6 · Prototyp · Kaffeebar': '3458764691726853493',
  'T4 · 6 · Prototyp · Produkt 1': '3458764691726853494',
  'T4 · 6 · Prototyp · Produkt 2': '3458764691726853495',
  'T4 · 6 · Prototyp · Produkt 3': '3458764691726853496',
  // Übung „Kaffeebar auf der Scrum-Karte“ (seit 26.11.2026): ein Frame je Person; die Lösung ist auf dem Board bis zur
  // Auflösung versteckt und wird nur von der Folie „Am Beispiel“ verlinkt, nicht von der Übung.
  'T4 · 7 · Scrum · Kaffeebar sortieren · Produkt 1': '3458764691686327549',
  'T4 · 7 · Scrum · Kaffeebar sortieren · Produkt 2': '3458764691686327550',
  'T4 · 7 · Scrum · Kaffeebar sortieren · Produkt 3': '3458764691686327551',
  'T4 · 7 · Scrum · Kaffeebar · Lösung': '3458764691686327552',
  'T4 · 8 · Anleitung Origin Story': '3458764691728490247',
  'T4 · 8 · Anleitung Lernkarten': '3458764691728384747',
  'T4 · 8 · Origin Story · Kaffeebar': '3458764691726786504',
  'T4 · 8 · Origin Story · Produkt 1': '3458764691726786505',
  'T4 · 8 · Origin Story · Produkt 2': '3458764691726786506',
  'T4 · 8 · Origin Story · Produkt 3': '3458764691726786507',
  'T4 · 8 · Lernkarten · Kaffeebar': '3458764691726588595',
  'T4 · 8 · Lernkarten · Produkt 1': '3458764691726588596',
  'T4 · 8 · Lernkarten · Produkt 2': '3458764691726588597',
  'T4 · 8 · Lernkarten · Produkt 3': '3458764691726588598',
  'T5 · 0 · Teamaufstellung & DoD': '3458764687968670113',
  'T5 · 1 · Backlog-Reihenfolge': '3458764687968819129',
  'T5 · 2 · Wertkurve & ERRC': '3458764687968975610',
};

// PLATZHALTER: Frames, die auf dem Board noch angelegt werden und deren ID noch fehlt. Die Pille bleibt Text, bis die ID
// oben in MIRO_FRAMES steht – dann den Namen hier streichen (der Test verlangt, dass ein Name nur an einer Stelle steht).
export const MIRO_FRAMES_OHNE_ID: readonly string[] = [];
