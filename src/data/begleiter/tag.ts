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
  bloecke: {},
  material: [],
};
