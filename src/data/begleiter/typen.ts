// Notizen des Präsentator-Begleiters (/innolab/begleiter) zu einer Folie. Oben „live“ (auf einen Blick am Tablet),
// darunter Vorbereitung. Quellen: gedruckte Seite bzw. EPUB-Kapitel + Abschnitt; Zusatzfälle nur echte, nachprüfbare.
export type Notiz = {
  /**
   * 3–5 Stichworte, live auf einen Blick. Zwei Formen: Regieanweisung an Markus (Verb oder Stichwort vorn, höchstens
   * 12 Wörter, z. B. „Portland erzählen: gute Absicht, viel Geld, falsches Produkt“) oder ein Satz zum Sagen in „…“
   * (höchstens 18 Wörter, damit er am Tablet in zwei Zeilen passt), an die Studierenden mit „ihr“. Das Stichwort vor dem
   * Doppelpunkt hebt die Seite hervor; wiederkehrende heißen immer gleich: „Fragen:“, „Falle:“, „Zeit:“, „Bei Bedarf:“,
   * „Wenn hinten:“ und „Nach N min:“ (in einer Übung; die Seite zeigt dazu die Uhrzeit ab Timer-Start). In Regieanweisungen heißen die Studierenden „alle“/„jede*r“,
   * nicht „sie“ oder „ihr“; muss Markus angesprochen werden, dann mit „du“.
   */
  live: string[];
  /** Verständnisfrage an den Raum, bevor es weitergeht: erwartete Antwort und die häufigste falsche (optional). */
  verstaendnis?: { frage: string; antwort: string; falsch?: string };
  /** Ein Satz Überleitung zur nächsten Folie, zum Sagen an die Studierenden („ihr“). */
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
