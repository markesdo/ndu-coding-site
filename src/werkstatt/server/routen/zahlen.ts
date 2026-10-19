// Zahlen für den Rückblick (Knopf auf der Abschluss-Folie). Gemountet unter /api/werkstatt/zahlen; nur Lehrende.
// Liest jede Mappe der Kohorte wie der Editor, nur lesend. Scheitert eine Mappe, stehen dort Nullen mit `fehler` –
// die anderen kommen trotzdem.
import { Hono } from 'hono';
import { BRIEF_FELDER, zaehlen } from '../../statistik.js';
import { ARTEFAKT_NAMEN, type ArtefaktName } from '../../schemas/index.js';
import type { PersonZahlen, Zahlen } from '../../vertrag.js';
import { repoName } from '../../zugang.js';
import { fehler, json } from '../antwort.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import type { Abhaengigkeiten } from '../typen.js';

const NUR_LEHRENDE = 'Die Zahlen der ganzen Gruppe sieht nur Markus.';

export function zahlenRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  async function person(kohorte: string, kuerzel: string): Promise<PersonZahlen> {
    const repo = repoName({ kohorte, rolle: 'studierende', kuerzel });
    try {
      const gelesen = await Promise.all(ARTEFAKT_NAMEN.map(async (n) => [n, (await abh.speicher.lesen(repo, n)).daten] as const));
      return zaehlen(kuerzel, Object.fromEntries(gelesen) as Record<ArtefaktName, unknown | null>);
    } catch (e) {
      console.error('werkstatt: Zahlen – Mappe nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return { ...zaehlen(kuerzel, { brief: null, entscheidungen: null, annahmen: null, leitfaden: null }), fehler: true };
    }
  }

  r.get('/', async (c) => {
    const m = c.get('mitgliedschaft');
    if (m.rolle !== 'lehrende') return fehler(c, 403, 'nicht-freigeschaltet', NUR_LEHRENDE);
    const studierende = abh.umgebung.zugang[m.kohorte]?.studierende ?? [];
    const personen = await Promise.all(studierende.map((s) => person(m.kohorte, s.kuerzel)));
    const antwort: Zahlen = { kohorte: m.kohorte, briefFelderGesamt: BRIEF_FELDER, personen };
    return json(c, antwort);
  });

  return r;
}
