// Notizen des Präsentator-Begleiters (/innolab/begleiter) zu einer Folie. Oben „live“ (auf einen Blick am Tablet),
// darunter Vorbereitung. Quellen: gedruckte Seite bzw. EPUB-Kapitel + Abschnitt; Zusatzfälle nur echte, nachprüfbare.
export type Notiz = {
  /** 3–5 Stichworte zum Sagen. */
  live: string[];
  /** Ein Satz Überleitung zur nächsten Folie. */
  ueberleitung?: string;
  /** Bei Übungen: Timer-Dauer und Sozialform. */
  uebung?: { dauer?: string; form?: string };
  /** Was in Miro passiert: frame = Name genau wie in <MiroFrame name> (miro-frames.ts), vorschlaege = Zettel für die Kaffeebar-Spalte. */
  miro?: { frame?: string; schritte: string[]; vorschlaege?: string[] };
  kern?: { text: string; quelle: string }[];
  geschichte?: { text: string; quelle: string };
  /** Fälle außerhalb der Kursquellen, Anzeige mit „Zusatz, nicht aus den Kursquellen“. */
  zusatz?: { titel: string; text: string; quelle: string }[];
  fragen?: { frage: string; antwort: string }[];
  ablauf?: { schritte?: string[]; achten?: string[]; fehler?: string[]; aufloesung?: string };
};
