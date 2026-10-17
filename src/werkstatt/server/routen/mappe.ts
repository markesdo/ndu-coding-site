// Mappe lesen und speichern (spec §3.3). Gemountet unter /api/werkstatt/mappe: Pfade hier relativ dazu.
// CSRF (JSON + eigene Origin) für PUT prüft schon appErstellen.
import { Hono, type Context } from 'hono';
import { tagInWien } from '../../../lib/kurswahl.js';
import { kohorte } from '../../kohorten/index.js';
import { dateienFuerSpeichern, readmeRendern } from '../../render/index.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, artefaktParsen, istObjekt, type ArtefaktName, type Feldfehler } from '../../schemas/index.js';
import type { ArtefaktAntwort, MappeStand, SpeichernAntwort } from '../../vertrag.js';
import { repoName } from '../../zugang.js';
import { ApiAusnahme, fehler, json } from '../antwort.js';
import { GithubAusnahme } from '../github/app-token.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import { DateiUnlesbar, internerFehler, wirdEingerichtet } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

const KEIN_ZUGRIFF = 'Diese Mappe gehört nicht zu deiner Anmeldung. Schreib Markus.';
const NUR_STUDIERENDE = 'Als Lehrende*r hast du hier noch keine eigene Mappe.';
const UNGUELTIG = 'Das lässt sich so nicht speichern. Bitte prüfe die markierten Felder.';
const UNVOLLSTAENDIG = 'Die Anfrage ist unvollständig.';
const SCHIEF = 'Da ist etwas schiefgegangen. Sag Markus Bescheid.';
const KONFLIKT = 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.';
const NICHT_LOESCHEN = 'Gespeicherte Entscheidungen lassen sich nicht löschen – ersetze sie stattdessen.';
const NICHT_AENDERN = 'Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.';
// Was an einer gespeicherten Zeile fest ist (alles außer der ID selbst).
const FESTE_FELDER = ['datum', 'entscheidung', 'grund', 'beleg', 'belegIds', 'ersetzt'] as const;
const NACHRICHT_HOECHSTENS = 100;
// Rückhalt: Grapheme können beliebig lang sein (kombinierende Zeichen); mehr UTF-16-Einheiten kommen nie in den Commit.
const NACHRICHT_EINHEITEN = 300;

// Kaputtes JSON im Repo (z. B. direkt auf GitHub bearbeitet): eigener Satz statt „GitHub nicht erreichbar“.
function unlesbar(name: ArtefaktName, e: DateiUnlesbar): ApiAusnahme {
  return new ApiAusnahme(502, e.code, `${ARTEFAKTE[name].titel}: Die gespeicherte Datei lässt sich nicht lesen (vielleicht direkt auf GitHub geändert). Stell sie auf GitHub wieder her oder schreib Markus.`);
}

// Zeilen der gespeicherten Fassung: migriert und geprüft wie beim Lesen. Passt die Datei nicht zum Schema, zählen
// zur Sicherheit die rohen Zeilen mit lesbarer ID (lieber zu streng als eine Zeile still verlieren).
function gespeicherteZeilen(alt: unknown): Record<string, unknown>[] {
  if (alt === null) return [];
  const p = artefaktParsen('entscheidungen', alt);
  if ('daten' in p) return p.daten.entscheidungen;
  return istObjekt(alt) && Array.isArray(alt.entscheidungen) ? alt.entscheidungen.filter(istObjekt) : [];
}

// Spec §3.4: Gespeicherte Zeilen des Entscheidungslogs werden nie gelöscht oder geändert; eine neue Zeile ersetzt sie
// über `ersetzt`.
function entscheidungenBleiben(alt: unknown, neu: Record<string, unknown>[]): Feldfehler[] {
  const neuNachId = new Map(neu.map((e, i) => [e.id, { e, i }]));
  const meldungen: Feldfehler[] = [];
  for (const z of gespeicherteZeilen(alt)) {
    if (typeof z.id !== 'string') continue;
    const treffer = neuNachId.get(z.id);
    if (!treffer) meldungen.push({ pfad: 'entscheidungen', meldung: `${z.id}: ${NICHT_LOESCHEN}` });
    else if (FESTE_FELDER.some((f) => JSON.stringify(z[f]) !== JSON.stringify(treffer.e[f]))) {
      meldungen.push({ pfad: `entscheidungen.${treffer.i}`, meldung: `${z.id}: ${NICHT_AENDERN}` });
    }
  }
  return meldungen;
}

// Commit-Nachricht: einzeilig, ohne Steuer- und Formatzeichen (z. B. U+202E dreht Text um), höchstens 100 Zeichen
// nach Graphemen. Der Joiner in Emoji-Folgen (Join_Control) bleibt, sonst zerfiele eine Familie in Einzelpersonen.
function kurzeNachricht(roh: string): string {
  const sauber = roh.replace(/(?!\p{Join_Control})[\p{Cc}\p{Cf}]/gu, ' ').replace(/\s+/g, ' ').trim();
  let laenge = 0;
  const behalten: string[] = [];
  // Lazy über die Grapheme und früh aufhören: lange Eingaben werden nie ganz zerlegt. Nur ganze Grapheme.
  for (const { segment } of new Intl.Segmenter('de', { granularity: 'grapheme' }).segment(sauber)) {
    if (behalten.length === NACHRICHT_HOECHSTENS || laenge + segment.length > NACHRICHT_EINHEITEN) break;
    behalten.push(segment);
    laenge += segment.length;
  }
  return behalten.join('').trim();
}

function istArtefaktName(x: string): x is ArtefaktName {
  return (ARTEFAKT_NAMEN as readonly string[]).includes(x);
}

function ursache(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}\n${e.stack ?? ''}` : String(e);
}

export function mappeRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  // Repo der Sitzung, nachdem werkstatt.json bestätigt hat, dass es dieser Person in dieser Kohorte gehört.
  // anlegen: fehlt das Repo (oder werkstatt.json), einmal erneut anlegen (idempotent) – nur GET mappe tut das.
  async function eigenesRepo(c: Context<SitzungEnv>, anlegen: boolean): Promise<string> {
    const s = c.get('sitzung');
    const m = c.get('mitgliedschaft');
    const repo = repoName(m);
    let wj = await abh.speicher.werkstattJson(repo);
    if (!wj && anlegen) {
      try {
        await abh.speicher.anlegen(m, s.githubId);
      } catch (e) {
        // „Gehört jemand anderem“ geht durch. Vorübergehendes (GitHub 5xx, Netz/Zeitlimit = Status 0, 503) heißt „wird
        // eingerichtet“ – der Editor versucht es dann von selbst noch einmal. Alles andere ist ein Fehler bei uns.
        if (e instanceof ApiAusnahme && e.status === 403) throw e;
        console.error('werkstatt: Mappe anlegen fehlgeschlagen –', ursache(e));
        // GitHub 4xx (Rechte, Vorlage fehlt …) geht nicht von selbst weg, darum nicht „wird eingerichtet“.
        // Jede GitHub-Antwort zählt als vorübergehend, auch 4xx (Rate-Limit 403/429, Verzögerung direkt nach
        // /generate, Wettlauf um werkstatt.json); der Editor hört nach drei Versuchen von selbst auf.
        const voruebergehend = e instanceof GithubAusnahme || (e instanceof ApiAusnahme && e.status === 503);
        throw voruebergehend ? wirdEingerichtet() : new ApiAusnahme(500, 'unbekannt', SCHIEF);
      }
      wj = await abh.speicher.werkstattJson(repo);
    }
    if (!wj) throw wirdEingerichtet();
    if (wj.githubId !== s.githubId || wj.kohorte !== s.kohorte) {
      console.error('werkstatt: werkstatt.json passt nicht zur Sitzung, Zugriff verweigert');
      throw new ApiAusnahme(403, 'nicht-freigeschaltet', KEIN_ZUGRIFF);
    }
    return repo;
  }

  r.get('/', async (c) => {
    const m = c.get('mitgliedschaft');
    // Lehrende haben kein eigenes Repo; ihre Ansicht auf die Mappen folgt in Phase 2.
    if (m.rolle !== 'studierende') return json(c, { kohorte: m.kohorte, repo: '', artefakte: [] } satisfies MappeStand);
    const repo = await eigenesRepo(c, true);
    const stand: MappeStand = { kohorte: m.kohorte, repo, artefakte: await abh.speicher.uebersicht(repo) };
    return json(c, stand);
  });

  // Gemeinsamer Anfang beider Artefakt-Routen: Name und Rolle prüfen.
  function artefaktName(c: Context<SitzungEnv>): ArtefaktName | Response {
    const name = c.req.param('artefakt') ?? '';
    if (!istArtefaktName(name)) return fehler(c, 404, 'unbekannt', 'Dieses Artefakt gibt es in der Werkstatt nicht.');
    if (c.get('mitgliedschaft').rolle !== 'studierende') return fehler(c, 403, 'nicht-freigeschaltet', NUR_STUDIERENDE);
    return name;
  }

  async function lesen(repo: string, name: ArtefaktName) {
    try {
      return await abh.speicher.lesen(repo, name);
    } catch (e) {
      throw e instanceof DateiUnlesbar ? unlesbar(name, e) : e;
    }
  }

  r.get('/:artefakt', async (c) => {
    const name = artefaktName(c);
    if (name instanceof Response) return name;
    const repo = await eigenesRepo(c, false);
    const { daten, basisSha } = await lesen(repo, name);
    const antwort: ArtefaktAntwort = { name, daten, basisSha };
    return json(c, antwort);
  });

  r.put('/:artefakt', async (c) => {
    const name = artefaktName(c);
    if (name instanceof Response) return name;

    // Unabhängige Lesezugriffe parallel. Ausgewertet wird erst der Besitz, damit eine fremde Mappe nie mehr als 403 verrät.
    const [besitz, gespeichert] = await Promise.allSettled([
      eigenesRepo(c, false),
      name === 'entscheidungen' ? lesen(repoName(c.get('mitgliedschaft')), name) : Promise.resolve(null),
    ]);
    if (besitz.status === 'rejected') throw besitz.reason;
    if (gespeichert.status === 'rejected') throw gespeichert.reason;
    const repo = besitz.value;

    let anfrage: unknown;
    try {
      anfrage = await c.req.json();
    } catch {
      return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    }
    if (!istObjekt(anfrage) || !('daten' in anfrage) || !('basisSha' in anfrage)) return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    const { daten: roh, nachricht } = anfrage;
    const basisSha = typeof anfrage.basisSha === 'string' ? anfrage.basisSha : null;
    if (anfrage.basisSha !== null && basisSha === null) return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    if (nachricht !== undefined && typeof nachricht !== 'string') return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);

    // Der Stand ist immer der Tag des Speicherns (Wien), egal was der Browser mitschickt.
    const geprueft = artefaktParsen(name, istObjekt(roh) ? { ...roh, stand: tagInWien(new Date(abh.jetzt())) } : roh);
    if ('fehler' in geprueft) return fehler(c, 422, 'ungueltig', UNGUELTIG, geprueft.fehler);

    if (gespeichert.value) {
      // Anderer Stand als der des Browsers: gleich Konflikt, sonst prüften wir gegen die falsche Fassung.
      if (gespeichert.value.basisSha !== basisSha) return fehler(c, 409, 'konflikt', KONFLIKT);
      const neu = (geprueft.daten as { entscheidungen: Record<string, unknown>[] }).entscheidungen;
      const verletzt = entscheidungenBleiben(gespeichert.value.daten, neu);
      if (verletzt.length > 0) return fehler(c, 422, 'ungueltig', UNGUELTIG, verletzt);
    }

    const k = kohorte(c.get('mitgliedschaft').kohorte);
    if (!k) throw internerFehler(`speichern: unbekannte Kohorte ${c.get('mitgliedschaft').kohorte}`);
    // README.md schreibt der Speicher selbst, aus dem Stand, auf dem der Commit landet.
    const { 'README.md': _ohne, ...dateien } = dateienFuerSpeichern(name, geprueft.daten, '');

    const s = c.get('sitzung');
    const autor = { name: s.login, email: `${s.githubId}+${s.login}@users.noreply.github.com` };
    const kurz = typeof nachricht === 'string' ? kurzeNachricht(nachricht) : '';
    const text = `${ARTEFAKTE[name].titel}: ${kurz || 'gespeichert über die Werkstatt'}`;

    const ergebnis = await abh.speicher.speichern(repo, name, dateien, basisSha, autor, text, (vorhanden) => readmeRendern(k, vorhanden));
    if ('konflikt' in ergebnis) return fehler(c, 409, 'konflikt', KONFLIKT);
    const antwort: SpeichernAntwort = { basisSha: ergebnis.basisSha, commitUrl: ergebnis.commitUrl };
    return json(c, antwort);
  });

  return r;
}
