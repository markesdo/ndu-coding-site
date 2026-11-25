// Namen der Artefakte einer Mappe; Reihenfolge ist die Anzeigereihenfolge.
export type ArtefaktName = 'brief' | 'entscheidungen' | 'leitfaden' | 'annahmen' | 'interviews';

export const ARTEFAKT_NAMEN: readonly ArtefaktName[] = ['brief', 'entscheidungen', 'annahmen', 'leitfaden', 'interviews'];

/** In diesem Kursjahr nicht genutzt (Entscheidungslog seit 21.11.2026, NDU-70): Die Mappe zeigt es nicht mehr, und
 *  tag_stand, verknuepfungen_pruefen und die Tutor-Werkzeuge erwarten es nicht. Gespeicherte Daten bleiben im Repo der
 *  Mappe; ihre IDs (D…) gelten in den anderen Artefakten weiter als bekannt. */
export const STILLGELEGT: readonly ArtefaktName[] = ['entscheidungen'];

/** Die Artefakte, mit denen dieses Kursjahr arbeitet, in Anzeigereihenfolge. */
export const AKTIVE_ARTEFAKTE: readonly ArtefaktName[] = ARTEFAKT_NAMEN.filter((n) => !STILLGELEGT.includes(n));
