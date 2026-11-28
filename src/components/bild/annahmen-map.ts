// Annahmen-Map wie im Miro-Frame „T4 · 3 · Annahmen der Idee“: Feldnamen und Achsen (AnnahmenMap.astro, experiment.astro).
export const FELDER = [
  { name: 'Beleg prüfen, darauf bauen', klasse: 'ol' },
  { name: 'Zuerst testen', klasse: 'or' },
  { name: 'Abhaken', klasse: 'ul' },
  { name: 'Später prüfen', klasse: 'ur' },
] as const;
export const ACHSE_Y = { titel: 'Wichtigkeit: fällt die Idee um, wenn es falsch ist?', oben: 'wichtig', unten: 'weniger wichtig' } as const;
export const ACHSE_X = { titel: 'Beleg: was wissen wir schon?', links: 'viel Beleg', rechts: 'kein Beleg' } as const;
