// Prompts aus /konzepte/responsive – stehen dort und in der Prompt-Bibliothek.
export const MOBILE_FIRST_PROMPT =
  'Bau die Seite [z. B. die Startseite] mobile first. Am Handy (375 px) steht alles untereinander, in dieser Reihenfolge: [z. B. Suche, neueste Gegenstände, Button „Gegenstand anbieten“]. ' +
  'Ab 768 px zwei Spalten für die Gegenstände, ab 1024 px drei. Der Inhalt wird höchstens 1024 px breit und steht in der Mitte. ' +
  'Alle Buttons und Links sind mindestens 44 px hoch, nichts darf waagrecht scrollen, lange Wörter dürfen umbrechen. ' +
  'Prüf die Seite danach bei 375, 768 und 1280 px und zeig mir, was du gesehen hast.';

export const BREITEN_KRITERIEN_PROMPT =
  'Ergänze in [Issue] Akzeptanzkriterien für die Breiten: was bei 375 px untereinander steht und in welcher Reihenfolge, ab welcher Breite sich der Aufbau ändert und wie, ' +
  'und dass bei keiner Breite zwischen 320 und 1440 px etwas waagrecht scrollt. Frag mich bei der Reihenfolge, statt sie selbst festzulegen.';
