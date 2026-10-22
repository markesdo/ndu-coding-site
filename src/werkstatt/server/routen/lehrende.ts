// Lehrenden-Ansicht (Spec §3.7): alle Mappen einer Kohorte nebeneinander. Gemountet unter /api/werkstatt/lehrende;
// nur für Lehrende genau dieser Kohorte (laut aktueller Zugangsliste), nur lesend.
// Wie zahlen.ts: Erst bestätigt werkstatt.json, dass das Repo der gelisteten Person gehört – vorher wird nichts gelesen.
// Scheitert eine Mappe (GitHub) oder gehört sie jemand anderem, steht dort `fehler`; die anderen kommen trotzdem.
// GitHub pro Mappe: werkstatt.json, dann je Artefakt eine Datei und eine Seite Commit-Liste (bei fünf Artefakten 11).
import { Hono } from 'hono';
import { ARTEFAKTE as KURS_ARTEFAKTE } from '../../../components/methoden.js';
import { tagInWien } from '../../../lib/kurswahl.js';
import { KOHORTEN, kohorte as kohorteNachId, werkstattArtefakte, type Kohorte } from '../../kohorten/index.js';
import { bezugBestimmen, verlaufZaehlen } from '../../lehrende.js';
import { rendern } from '../../render/index.js';
import { artefaktParsen, type ArtefaktName } from '../../schemas/index.js';
import { artefaktStand, faelligZuTag, kurstagBestimmen } from '../../tag-stand.js';
import { verknuepfungenPruefen, type MappeDaten } from '../../verknuepfungen.js';
import type { LehrendenAnsicht, LehrendenArtefakt, LehrendenMappe } from '../../vertrag.js';
import { mitgliedschaften, repoName } from '../../zugang.js';
import { fehler, json } from '../antwort.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import { DateiUnlesbar } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

const NUR_LEHRENDE = 'Die Mappen der ganzen Kohorte sehen nur die Lehrenden dieser Kohorte.';
// Das Repo gehört laut werkstatt.json nicht der gelisteten Person (oder Kohorte).
class FalscheZuordnung extends Error {
  constructor() {
    super('werkstatt.json passt nicht zur Zugangsliste');
    this.name = 'FalscheZuordnung';
  }
}

const TAG_UNGUELTIG = 'Diesen Kurstag gibt es nicht oder er liegt noch in der Zukunft.';

export function lehrendeRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  // Geparste Daten, null = noch nicht gespeichert, 'unlesbar' = kaputtes JSON oder falsches Format (wie im Connector).
  async function laden(repo: string, name: ArtefaktName): Promise<unknown | null | 'unlesbar'> {
    let daten: unknown;
    try {
      ({ daten } = await abh.speicher.lesen(repo, name));
    } catch (e) {
      if (e instanceof DateiUnlesbar) return 'unlesbar';
      throw e;
    }
    if (daten === null) return null;
    const p = artefaktParsen(name, daten);
    return p.ok ? p.daten : 'unlesbar';
  }

  async function artefakt(repo: string, name: ArtefaktName, seit: string | null): Promise<{ eintrag: LehrendenArtefakt; daten: unknown | null | 'unlesbar' }> {
    const [daten, verlauf] = await Promise.all([laden(repo, name), abh.speicher.verlauf(repo, name)]);
    const zaehlung = verlaufZaehlen(verlauf.zeitpunkte, verlauf.vollstaendig, seit);
    const da = daten !== null && daten !== 'unlesbar';
    // artefaktStand und rendern sind je Artefakt typisiert; die Daten hat artefaktParsen für genau dieses geprüft.
    const st = da ? artefaktStand(name, daten as never) : null;
    const eintrag: LehrendenArtefakt = {
      name,
      stand: daten === null ? 'offen' : daten === 'unlesbar' ? 'unlesbar' : 'vorhanden',
      umfang: st?.umfang ?? null,
      fehlt: st?.fehlt ?? [],
      leer: st?.stand === 'leer',
      faelligZuTag: faelligZuTag(name),
      ...zaehlung,
      markdown: da ? rendern(name, daten as never) : null,
    };
    return { eintrag, daten };
  }

  async function mappe(k: Kohorte, namen: ArtefaktName[], s: { githubId: number; kuerzel: string }, seit: string | null): Promise<LehrendenMappe> {
    const { kuerzel } = s;
    const kohorte = k.id;
    const repo = repoName({ kohorte, rolle: 'studierende', kuerzel });
    try {
      const wj = await abh.speicher.werkstattJson(repo);
      if (!wj) return { kuerzel, zustand: 'keine-mappe' };
      // Kürzel neu vergeben oder falsche Kohorte: nichts aus diesem Repo zeigen.
      if (wj.githubId !== s.githubId || wj.kohorte !== kohorte) throw new FalscheZuordnung();
      const gelesen = await Promise.all(namen.map((n) => artefakt(repo, n, seit)));
      const m: MappeDaten = { brief: null, entscheidungen: null, leitfaden: null, annahmen: null, interviews: null };
      gelesen.forEach((g, i) => { (m as Record<ArtefaktName, unknown>)[namen[i]] = g.daten; });
      const artefakte = gelesen.map((g) => g.eintrag);
      // ISO-Zeitpunkte aus derselben Quelle: als Text vergleichbar.
      const zuletzt = artefakte.map((a) => a.zuletzt).filter((z): z is string => z !== null).sort().at(-1) ?? null;
      const repoUrl = `https://github.com/${encodeURIComponent(k.org)}/${encodeURIComponent(repo)}`;
      return { kuerzel, zustand: 'bereit', repo, repoUrl, zuletzt, artefakte, luecken: verknuepfungenPruefen(m).befunde };
    } catch (e) {
      console.error('werkstatt: Lehrenden-Ansicht – Mappe nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return { kuerzel, zustand: 'fehler', grund: e instanceof FalscheZuordnung ? 'zuordnung' : 'github' };
    }
  }

  r.get('/', async (c) => {
    const s = c.get('sitzung');
    // Alle aktiven Kohorten, in denen diese GitHub-ID laut Zugangsliste lehrt – nicht nur die der Sitzung.
    const lehrt = mitgliedschaften(abh.umgebung.zugang, s.githubId, KOHORTEN).filter((m) => m.rolle === 'lehrende');
    const gewuenscht = c.req.query('kohorte') ?? (lehrt.some((m) => m.kohorte === s.kohorte) ? s.kohorte : lehrt[0]?.kohorte);
    const k = gewuenscht === undefined ? undefined : kohorteNachId(gewuenscht);
    if (!k || !lehrt.some((m) => m.kohorte === k.id)) return fehler(c, 403, 'nicht-freigeschaltet', NUR_LEHRENDE);

    const seitRoh = c.req.query('seit');
    const gewaehlt = seitRoh === undefined ? undefined : /^[1-9]\d?$/.test(seitRoh) ? Number(seitRoh) : NaN;
    const heute = tagInWien(new Date(abh.jetzt()));
    const b = Number.isNaN(gewaehlt) ? undefined : bezugBestimmen(k.termine, heute, gewaehlt);
    if (!b) return fehler(c, 422, 'ungueltig', TAG_UNGUELTIG);

    const namen = werkstattArtefakte(k);
    // Alphabetisch nach Kürzel: feste Reihenfolge, nie nach Stand umsortiert.
    const studierende = [...(abh.umgebung.zugang[k.id]?.studierende ?? [])].sort((x, y) => (x.kuerzel < y.kuerzel ? -1 : x.kuerzel > y.kuerzel ? 1 : 0));
    const personen = await Promise.all(studierende.map((p) => mappe(k, namen, p, b.bezug?.datum ?? null)));
    const kt = kurstagBestimmen(k.termine, heute);
    const antwort: LehrendenAnsicht = {
      kohorte: k.id,
      kohorten: lehrt.map((m) => ({ id: m.kohorte, titel: kohorteNachId(m.kohorte)?.titel ?? m.kohorte })),
      kurstag: { tag: kt.tag, titel: kt.titel, heute: kt.lage === 'heute' },
      spalten: namen.map((name) => ({ name, faelligZuTag: faelligZuTag(name), hausaufgabe: KURS_ARTEFAKTE.some((a) => a.werkstatt === name && a.hausaufgabe) })),
      tage: b.tage,
      bezug: b.bezug,
      personen,
    };
    return json(c, antwort);
  });

  return r;
}
