// Zahlen für den Rückblick (Knopf auf der Abschluss-Folie). Gemountet unter /api/werkstatt/zahlen; nur Lehrende.
// Liest jede Mappe der Kohorte wie der Editor, nur lesend. Kaputtes JSON trifft nur dieses Artefakt (`unlesbar`).
// Scheitert sonst ein Lesen (GitHub) oder gehört das Repo nicht der gelisteten Person, stehen dort Nullen mit `fehler` –
// die anderen kommen trotzdem.
import { Hono } from 'hono';
import { BRIEF_FELDER, UNLESBAR, zaehlen } from '../../statistik.js';
import { AKTIVE_ARTEFAKTE, ARTEFAKT_NAMEN, type ArtefaktName } from '../../schemas/index.js';
import type { PersonZahlen, Zahlen } from '../../vertrag.js';
import { repoName } from '../../zugang.js';
import { fehler, json } from '../antwort.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import { DateiUnlesbar } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

const NUR_LEHRENDE = 'Die Zahlen der ganzen Gruppe sieht nur Markus.';
// Alle Artefakte als „gibt es nicht“; gelesen werden nur die aktiven.
const LEER = Object.fromEntries(ARTEFAKT_NAMEN.map((n) => [n, null])) as Record<ArtefaktName, unknown | null>;

export function zahlenRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  const lesen = (repo: string, n: ArtefaktName) =>
    abh.speicher.lesen(repo, n).then((r) => r.daten, (e) => { if (e instanceof DateiUnlesbar) return UNLESBAR; throw e; });

  async function person(kohorte: string, s: { githubId: number; kuerzel: string }): Promise<PersonZahlen> {
    const { kuerzel } = s;
    const repo = repoName({ kohorte, rolle: 'studierende', kuerzel });
    try {
      const [wj, ...gelesen] = await Promise.all([
        abh.speicher.werkstattJson(repo),
        // Nur die Artefakte dieses Kursjahrs: Das stillgelegte Entscheidungslog (NDU-70) wird weder gelesen noch gezählt –
        // weder „nicht lesbar“ noch ein GitHub-Fehler auf dieser Datei darf die Person betreffen.
        ...AKTIVE_ARTEFAKTE.map(async (n) => [n, await lesen(repo, n)] as const),
      ]);
      // Noch keine Mappe: Nullen. Gehört das Repo jemand anderem (wie eigenesRepo in mappe.ts): nicht mitzählen.
      if (wj && (wj.githubId !== s.githubId || wj.kohorte !== kohorte)) throw new Error('werkstatt.json passt nicht zur Zugangsliste');
      return zaehlen(kuerzel, { ...LEER, ...Object.fromEntries(gelesen as (readonly [ArtefaktName, unknown])[]) } as Record<ArtefaktName, unknown | null>);
    } catch (e) {
      console.error('werkstatt: Zahlen – Mappe nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return { ...zaehlen(kuerzel, LEER), fehler: true };
    }
  }

  r.get('/', async (c) => {
    const m = c.get('mitgliedschaft');
    if (m.rolle !== 'lehrende') return fehler(c, 403, 'nicht-freigeschaltet', NUR_LEHRENDE);
    const studierende = abh.umgebung.zugang[m.kohorte]?.studierende ?? [];
    const personen = await Promise.all(studierende.map((s) => person(m.kohorte, s)));
    const antwort: Zahlen = { kohorte: m.kohorte, briefFelderGesamt: BRIEF_FELDER, personen };
    return json(c, antwort);
  });

  return r;
}
