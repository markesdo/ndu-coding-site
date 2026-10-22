// Lehrenden-Ansicht (Spec §3.7): alle Mappen einer Kohorte nebeneinander. Gemountet unter /api/werkstatt/lehrende;
// nur für Lehrende genau dieser Kohorte (laut aktueller Zugangsliste). Die Artefakte nur lesend; schreiben dürfen
// Lehrende nur Feedback in mappe/feedback.json (NDU-35, POST /feedback), nie in ein Artefakt.
// Wie zahlen.ts: Erst bestätigt werkstatt.json, dass das Repo der gelisteten Person gehört – vorher wird nichts gelesen.
// Scheitert eine Mappe (GitHub) oder gehört sie jemand anderem, steht dort `fehler`; die anderen kommen trotzdem.
// Die Matrix trägt nur Stand, Umfang, Verlauf und Lücken; den Inhalt holt der Leser erst beim Öffnen (GET /artefakt).
// GitHub pro Mappe in der Matrix: werkstatt.json, alle fünf Artefakt-Dateien (Lücken wie verknuepfungen_pruefen im
// Connector), feedback.json und je Spalte der Kohorte eine Seite Commit-Liste (bei fünf Artefakten 12).
// Leser: werkstatt.json + Artefakt + feedback.json. Feedback schreiben: werkstatt.json, bei einer Zeile das Artefakt,
// dann feedback.json.
import { Hono, type Context } from 'hono';
import { ARTEFAKTE as KURS_ARTEFAKTE } from '../../../components/methoden.js';
import { tagInWien } from '../../../lib/kurswahl.js';
import { KOHORTEN, kohorte as kohorteNachId, werkstattArtefakte, type Kohorte } from '../../kohorten/index.js';
import { feedbackSchreiben, feedbackZaehlen, zeilenAuswahl, zeilePasst, type Feedback } from '../../feedback.js';
import { bezugBestimmen, verlaufZaehlen } from '../../lehrende.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, artefaktParsen, istObjekt, type ArtefaktName } from '../../schemas/index.js';
import { artefaktStand, faelligBis, faelligZuTag, kurstagBestimmen } from '../../tag-stand.js';
import { verknuepfungenPruefen, type MappeDaten } from '../../verknuepfungen.js';
import type { FeedbackAntwort, LehrendenAnsicht, LehrendenArtefakt, LehrendenInhalt, LehrendenMappe } from '../../vertrag.js';
import { mitgliedschaften, repoName } from '../../zugang.js';
import { fehler, json } from '../antwort.js';
import { commitAutor, kurzeNachricht } from '../commit.js';
import { feedbackAendern, feedbackHolen } from '../feedback.js';
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
const UNBEKANNT = 'Diese Person oder dieses Artefakt gibt es in der Kohorte nicht.';
const NICHT_LESBAR = 'Diese Mappe lässt sich gerade nicht lesen. Später neu laden.';
const ZUORDNUNG = 'Das Repo passt nicht zur Zugangsliste. Zugangsliste prüfen.';
const KEINE_MAPPE = 'Diese Person hat sich noch nicht angemeldet.';
const UNVOLLSTAENDIG = 'Die Anfrage ist unvollständig.';

const nachKuerzel = <T extends { kuerzel: string }>(x: T, y: T) => (x.kuerzel < y.kuerzel ? -1 : x.kuerzel > y.kuerzel ? 1 : 0);

export function lehrendeRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  // Geparste Daten, null = noch nicht gespeichert, 'unlesbar' = kaputtes JSON oder falsches Format (wie im Connector).
  // roh: das JSON, das nicht zum Schema passt (Rückfall im Leser); bei kaputtem JSON gibt es nichts.
  async function laden(repo: string, name: ArtefaktName): Promise<{ daten: unknown | null | 'unlesbar'; roh: string | null }> {
    let daten: unknown;
    try {
      ({ daten } = await abh.speicher.lesen(repo, name));
    } catch (e) {
      if (e instanceof DateiUnlesbar) return { daten: 'unlesbar', roh: null };
      throw e;
    }
    if (daten === null) return { daten: null, roh: null };
    const p = artefaktParsen(name, daten);
    return p.ok ? { daten: p.daten, roh: null } : { daten: 'unlesbar', roh: JSON.stringify(daten, null, 2) };
  }

  // Nur Lehrende genau dieser Kohorte (laut aktueller Zugangsliste, alle aktiven Kohorten der GitHub-ID); sonst null.
  // Ohne ?kohorte die der Sitzung, wenn die Person dort lehrt, sonst ihre neueste.
  function kohorteDerAnfrage(c: Context<SitzungEnv>) {
    const s = c.get('sitzung');
    const lehrt = mitgliedschaften(abh.umgebung.zugang, s.githubId, KOHORTEN).filter((m) => m.rolle === 'lehrende');
    const gewuenscht = c.req.query('kohorte') ?? (lehrt.some((m) => m.kohorte === s.kohorte) ? s.kohorte : lehrt[0]?.kohorte);
    const k = gewuenscht === undefined ? undefined : kohorteNachId(gewuenscht);
    return k && lehrt.some((m) => m.kohorte === k.id) ? { k, lehrt } : null;
  }

  // werkstatt.json bestätigt, dass das Repo dieser Person in dieser Kohorte gehört; null = noch kein Repo.
  async function eigenesRepo(k: Kohorte, s: { githubId: number; kuerzel: string }): Promise<string | null> {
    const repo = repoName({ kohorte: k.id, rolle: 'studierende', kuerzel: s.kuerzel });
    const wj = await abh.speicher.werkstattJson(repo);
    if (!wj) return null;
    // Kürzel neu vergeben oder falsche Kohorte: nichts aus diesem Repo zeigen.
    if (wj.githubId !== s.githubId || wj.kohorte !== k.id) throw new FalscheZuordnung();
    return repo;
  }

  // Feedback nach bestem Bemühen: Scheitert es, fehlen nur die Zahlen (null), die Mappe kommt trotzdem.
  async function feedbackOderNull(repo: string): Promise<Feedback | null> {
    try {
      return await feedbackHolen(abh.speicher, repo);
    } catch (e) {
      console.error('werkstatt: Lehrenden-Ansicht – Feedback nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return null;
    }
  }

  function eintrag(name: ArtefaktName, daten: unknown | null | 'unlesbar', verlauf: { zeitpunkte: string[]; vollstaendig: boolean }, seit: string | null, kurstag: number, fb: Feedback | null): LehrendenArtefakt {
    const zaehlung = verlaufZaehlen(verlauf.zeitpunkte, verlauf.vollstaendig, seit);
    const da = daten !== null && daten !== 'unlesbar';
    // artefaktStand ist je Artefakt typisiert; die Daten hat artefaktParsen für genau dieses geprüft.
    const st = da ? artefaktStand(name, daten as never) : null;
    return {
      name,
      stand: daten === null ? 'offen' : daten === 'unlesbar' ? 'unlesbar' : 'vorhanden',
      umfang: st?.umfang ?? null,
      fehlt: st?.fehlt ?? [],
      leer: st?.stand === 'leer',
      faelligZuTag: faelligZuTag(name),
      faellig: faelligBis(kurstag, [name]).length > 0,
      ...zaehlung,
      feedback: fb ? feedbackZaehlen(fb.eintraege, name) : null,
    };
  }

  async function mappe(k: Kohorte, namen: ArtefaktName[], s: { githubId: number; kuerzel: string }, seit: string | null, kurstag: number): Promise<LehrendenMappe> {
    const { kuerzel } = s;
    try {
      const repo = await eigenesRepo(k, s);
      if (!repo) return { kuerzel, zustand: 'keine-mappe' };
      // Alle fünf Artefakte wie verknuepfungen_pruefen im Connector; Verlauf nur für die Spalten der Kohorte.
      const [daten, verlaeufe, fb] = await Promise.all([
        Promise.all(ARTEFAKT_NAMEN.map(async (n) => [n, (await laden(repo, n)).daten] as const)),
        Promise.all(namen.map((n) => abh.speicher.verlauf(repo, n))),
        feedbackOderNull(repo),
      ]);
      const m = Object.fromEntries(daten) as unknown as MappeDaten;
      const artefakte = namen.map((n, i) => eintrag(n, m[n], verlaeufe[i], seit, kurstag, fb));
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
    const erlaubt = kohorteDerAnfrage(c);
    if (!erlaubt) return fehler(c, 403, 'nicht-freigeschaltet', NUR_LEHRENDE);
    const { k, lehrt } = erlaubt;

    const seitRoh = c.req.query('seit');
    const gewaehlt = seitRoh === undefined ? undefined : /^[1-9]\d?$/.test(seitRoh) ? Number(seitRoh) : NaN;
    const heute = tagInWien(new Date(abh.jetzt()));
    const b = Number.isNaN(gewaehlt) ? undefined : bezugBestimmen(k.termine, heute, gewaehlt);
    if (!b) return fehler(c, 422, 'ungueltig', TAG_UNGUELTIG);

    const namen = werkstattArtefakte(k);
    // Alphabetisch nach Kürzel: feste Reihenfolge, nie nach Stand umsortiert.
    const studierende = [...(abh.umgebung.zugang[k.id]?.studierende ?? [])].sort(nachKuerzel);
    const kt = kurstagBestimmen(k.termine, heute);
    const personen = await Promise.all(studierende.map((p) => mappe(k, namen, p, b.bezug?.datum ?? null, kt.tag)));
    const antwort: LehrendenAnsicht = {
      kohorte: k.id,
      kohorten: lehrt.map((m) => ({ id: m.kohorte, titel: kohorteNachId(m.kohorte)?.titel ?? m.kohorte })),
      // Ohne gewählten Tag gibt kurstagBestimmen nie 'gewaehlt'.
      kurstag: { tag: kt.tag, titel: kt.titel, lage: kt.lage === 'gewaehlt' ? 'naechster' : kt.lage },
      spalten: namen.map((name) => ({ name, faelligZuTag: faelligZuTag(name), hausaufgabe: KURS_ARTEFAKTE.some((a) => a.werkstatt === name && a.hausaufgabe) })),
      tage: b.tage,
      bezug: b.bezug,
      personen,
    };
    return json(c, antwort);
  });

  // Inhalt eines Artefakts für den Leser: dieselben Prüfungen (Lehrende der Kohorte, Person laut Zugangsliste,
  // werkstatt.json), dann genau eine Datei.
  // Gemeinsamer Anfang von Leser und Feedback: Lehrende der Kohorte, Person laut Zugangsliste, Artefakt der Kohorte,
  // werkstatt.json bestätigt das Repo. Sonst die fertige Fehlerantwort.
  async function personUndRepo(c: Context<SitzungEnv>, name: string): Promise<Response | { repo: string; n: ArtefaktName }> {
    const erlaubt = kohorteDerAnfrage(c);
    if (!erlaubt) return fehler(c, 403, 'nicht-freigeschaltet', NUR_LEHRENDE);
    const { k } = erlaubt;
    const person = (abh.umgebung.zugang[k.id]?.studierende ?? []).find((p) => p.kuerzel === c.req.query('person'));
    if (!person || !werkstattArtefakte(k).includes(name as ArtefaktName)) return fehler(c, 404, 'unbekannt', UNBEKANNT);
    let repo: string | null;
    try {
      repo = await eigenesRepo(k, person);
    } catch (e) {
      console.error('werkstatt: Lehrenden-Ansicht – Mappe nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return e instanceof FalscheZuordnung ? fehler(c, 409, 'konflikt', ZUORDNUNG) : fehler(c, 502, 'github-fehler', NICHT_LESBAR);
    }
    if (!repo) return fehler(c, 404, 'unbekannt', KEINE_MAPPE);
    return { repo, n: name as ArtefaktName };
  }

  r.get('/artefakt', async (c) => {
    const ziel = await personUndRepo(c, c.req.query('artefakt') ?? '');
    if (ziel instanceof Response) return ziel;
    const { repo, n } = ziel;
    let gelesen: Awaited<ReturnType<typeof laden>>;
    let fb: Feedback | null;
    try {
      [gelesen, fb] = await Promise.all([laden(repo, n), feedbackOderNull(repo)]);
    } catch (e) {
      console.error('werkstatt: Lehrenden-Ansicht – Artefakt nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
      return fehler(c, 502, 'github-fehler', NICHT_LESBAR);
    }
    const { daten, roh } = gelesen;
    const antwort: LehrendenInhalt = {
      name: n,
      stand: daten === null ? 'offen' : daten === 'unlesbar' ? 'unlesbar' : 'vorhanden',
      daten: daten === 'unlesbar' ? null : daten,
      roh,
      feedback: fb ? fb.eintraege.filter((e) => e.artefakt === n) : null,
    };
    return json(c, antwort);
  });

  // Feedback schreiben (NDU-35): dieselben Prüfungen wie der Leser, dann ein Commit nur an mappe/feedback.json.
  // Autor*in im Eintrag und im Commit ist die angemeldete Lehrperson (GitHub-Login aus der Sitzung).
  r.post('/feedback', async (c) => {
    let anfrage: unknown;
    try {
      anfrage = await c.req.json();
    } catch {
      anfrage = null;
    }
    // Kaputtes JSON oder kein Objekt: gleich ablehnen, vor jedem Lesen auf GitHub.
    if (!istObjekt(anfrage)) return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    const a = anfrage;
    const ziel = await personUndRepo(c, typeof a.artefakt === 'string' ? a.artefakt : '');
    if (ziel instanceof Response) return ziel;
    const { repo, n } = ziel;
    // Zeile mit passender Form (D3, A2 …): Gibt es sie im Artefakt gerade? Geprüft gegen dieselbe Liste wie die Auswahl
    // im Leser (zeilenAuswahl). Falsche Form lehnt feedbackSchreiben mit eigenem Satz ab.
    const zeilenId = typeof a.zeilenId === 'string' && a.zeilenId !== '' ? a.zeilenId : undefined;
    if (zeilenId !== undefined && zeilePasst(n, zeilenId)) {
      let daten: unknown;
      try {
        // Beim Brief stehen die Abschnitte fest: nichts zu lesen.
        daten = n === 'brief' ? null : (await laden(repo, n)).daten;
      } catch (e) {
        console.error('werkstatt: Lehrenden-Feedback – Artefakt nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
        return fehler(c, 502, 'github-fehler', NICHT_LESBAR);
      }
      if (!zeilenAuswahl(n, daten === 'unlesbar' ? null : daten).some((z) => z.wert === zeilenId)) {
        return fehler(c, 422, 'ungueltig', `${zeilenId} gibt es in ${ARTEFAKTE[n].titel} gerade nicht (vielleicht inzwischen gelöscht). Neu laden.`);
      }
    }
    const s = c.get('sitzung');
    const zeile = zeilenId !== undefined ? ` (${zeilenId.slice(0, 20)})` : '';
    const danach = await feedbackAendern(
      abh.speicher,
      repo,
      (f) => feedbackSchreiben(f, { artefakt: n, zeilenId: a.zeilenId, text: a.text, autor: s.login, datum: new Date(abh.jetzt()).toISOString() }),
      commitAutor(s),
      kurzeNachricht(`Feedback von ${s.login}: ${ARTEFAKTE[n].titel}${zeile}`),
    );
    const antwort: FeedbackAntwort = { eintraege: danach.eintraege.filter((e) => e.artefakt === n) };
    return json(c, antwort);
  });

  return r;
}
