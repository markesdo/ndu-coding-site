// Projektideen für die Zwischenwoche (/ideen). s: die Issues in Reihenfolge.
// ki: ruft ein Sprachmodell über eine API auf – braucht einen eigenen, kostenpflichtigen API-Key (Hinweis oben auf der Seite).
export type Idee = { t: string; p: string; s: string[]; ki?: boolean };

export const ideen: Idee[] = [
  { t: 'Tisch-Feedback', p: 'QR-Code am Tisch, der Gast gibt in zehn Sekunden Feedback, das Lokal sieht auf einen Blick, was auffällt.', s: ['Fragen anlegen', 'Feedback-Seite ohne Login', 'QR-Code pro Tisch', 'Dashboard mit Diagramm'] },
  { t: 'Beleg-Scanner', ki: true, p: 'Belege fotografieren und sammeln, Spesen pro Monat im Blick. Zum Schluss liest die KI Betrag, Datum und Händler aus – kein Abtippen mehr.', s: ['Belege mit Foto, Betrag und Datum erfassen', 'Monatsdiagramm', 'CSV-Export', 'Betrag, Datum und Händler per KI auslesen'] },
  { t: 'Digitaler Produktpass', p: 'Kleine Hersteller*innen zeigen Material, Herkunft und Reparatur auf einer öffentlichen Seite, erreichbar per QR-Code auf dem Etikett. Die EU führt solche Pässe ab 2027 schrittweise ein.', s: ['Produkt anlegen', 'öffentliche Pass-Seite', 'QR-Code als Druckansicht', 'Übersicht aller Produkte'] },
  { t: 'Schnell-Umfrage', p: 'Wie Mentimeter: Frage stellen, QR-Code zeigen, die Balken wachsen. Testbar mit dem Publikum eurer Demo.', s: ['Umfrage anlegen', 'Abstimmseite ohne Login', 'QR-Code', 'Ergebnis-Balken, die sich alle paar Sekunden aktualisieren'] },
  { t: 'Interview-Insights', ki: true, p: 'Kundeninterviews festhalten, Zitate als Pain oder Gain markieren. Zum Schluss fasst die KI die wichtigsten Muster zusammen. Direkt nutzbar im Innolab.', s: ['Interview anlegen', 'Zitate markieren', 'Übersicht nach Pain und Gain', 'KI-Zusammenfassung über alle Interviews'] },
  { t: 'Event-Check-in', p: 'Anmeldung, Ticket mit QR-Code, Einlass per Handykamera: Die Kamera-App öffnet den Ticket-Link – eine eigene Scanner-Funktion braucht ihr nicht.', s: ['Event mit Anmeldeformular', 'Ticket-Seite mit QR-Code', 'Check-in: Die Kamera öffnet den Link im Standard-Browser des Handys, dort eingeloggt bestätigt ihr den Gast', 'Zähler und Gästeliste'] },
  { t: 'Visitenkarten-CRM', ki: true, p: 'Kontakte von Messen und Networking-Abenden festhalten, mit Foto der Visitenkarte, und sehen, wem ihr noch schreiben wolltet. Zum Schluss liest die KI die Karte vom Foto aus.', s: ['Kontakte mit Foto der Visitenkarte erfassen', 'Follow-up-Datum', 'Liste „fällig“', 'Name, Firma und E-Mail per KI aus dem Foto auslesen'] },
  { t: 'Schichtplan fürs Lokal', p: 'Kleine Gastronomie: Wer das Lokal führt, plant die Woche, das Team sieht den Plan über einen Link – statt Zettel an der Kühlschranktür.', s: ['Team anlegen', 'Woche planen', 'Plan-Link fürs Team', 'Stunden pro Person'] },
  { t: 'Bewerbungs-Board', p: 'Bewerbungen als Board mit Spalten – beworben, Gespräch, Zusage, Absage – und Fristen im Blick, statt Excel-Chaos.', s: ['Bewerbung anlegen', 'Status-Spalten', 'Fristen-Hinweis', 'Trichter-Diagramm'] },
  { t: 'Semester-Budget', p: 'Einnahmen, Fixkosten, was bleibt pro Woche? Für Studierende, nicht für Buchhalter*innen.', s: ['Posten erfassen', 'Wochenbudget', 'Warnung', 'Monatsdiagramm'] },
];
