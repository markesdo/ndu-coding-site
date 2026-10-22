// Mappe lesen und speichern (spec §3.3). Gemountet unter /api/werkstatt/mappe: Pfade hier relativ dazu.
// Lehrende lesen und schreiben hier ihre Demo-Mappe (NDU-37, mappeMitgliedschaft in zugang.ts), genau wie Studierende
// ihre eigene; die Mappen der Kohorte liefert /api/werkstatt/lehrende.
// CSRF (JSON + eigene Origin) für PUT prüft schon appErstellen.
import { Hono, type Context } from 'hono';
import { tagInWien } from '../../../lib/kurswahl.js';
import { antworten, erledigtSetzen, gesehenSetzen } from '../../feedback.js';
import { kohorte } from '../../kohorten/index.js';
import { dateienFuerSpeichern, readmeRendern } from '../../render/index.js';
import { ARTEFAKTE, ARTEFAKT_NAMEN, artefaktParsen, istObjekt, type ArtefaktName, type Feldfehler } from '../../schemas/index.js';
import type { ArtefaktAntwort, FeedbackAntwort, MappeStand, SpeichernAntwort } from '../../vertrag.js';
import { mappeMitgliedschaft, repoName, type Mitgliedschaft } from '../../zugang.js';
import { ApiAusnahme, fehler, json } from '../antwort.js';
import { commitAutor, kurzeNachricht } from '../commit.js';
import { feedbackAendern, feedbackHolen } from '../feedback.js';
import { GithubAusnahme } from '../github/app-token.js';
import { mitSitzung, type SitzungEnv } from '../sitzung.js';
import { DateiUnlesbar, internerFehler, wirdEingerichtet } from '../speicher-fehler.js';
import type { Abhaengigkeiten } from '../typen.js';

const KEIN_ZUGRIFF = 'Diese Mappe gehört nicht zu deiner Anmeldung. Schreib Markus.';
const UNGUELTIG = 'Das lässt sich so nicht speichern. Bitte prüfe die markierten Felder.';
const UNVOLLSTAENDIG = 'Die Anfrage ist unvollständig.';
const SCHIEF = 'Da ist etwas schiefgegangen. Sag Markus Bescheid.';
const KONFLIKT = 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.';
const NICHT_LOESCHEN = 'Gespeicherte Entscheidungen lassen sich nicht löschen – ersetze sie stattdessen.';
const NICHT_AENDERN = 'Gespeicherte Entscheidungen lassen sich nicht ändern – ersetze sie stattdessen.';
// Was an einer gespeicherten Zeile fest ist (alles außer der ID selbst).
const FESTE_FELDER = ['datum', 'entscheidung', 'grund', 'beleg', 'belegIds', 'belegNotiz', 'ersetzt'] as const;

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

function istArtefaktName(x: string): x is ArtefaktName {
  return (ARTEFAKT_NAMEN as readonly string[]).includes(x);
}

function ursache(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}\n${e.stack ?? ''}` : String(e);
}

export function mappeRouten(abh: Abhaengigkeiten): Hono<SitzungEnv> {
  const r = new Hono<SitzungEnv>();
  r.use(mitSitzung);

  // Mitgliedschaft der Mappe dieser Sitzung: Studierende ihre eigene, Lehrende ihre Demo-Mappe.
  const mappeVon = (c: Context<SitzungEnv>): Mitgliedschaft => mappeMitgliedschaft(c.get('mitgliedschaft'), c.get('sitzung').githubId);

  // Repo der Sitzung, nachdem werkstatt.json bestätigt hat, dass es dieser Person in dieser Kohorte gehört.
  // anlegen: fehlt das Repo (oder werkstatt.json), einmal erneut anlegen (idempotent) – die GET-Routen tun das (Übersicht
  // und Artefakt: der Editor kommt oft direkt vom Login), PUT nicht.
  async function eigenesRepo(c: Context<SitzungEnv>, anlegen: boolean): Promise<string> {
    const s = c.get('sitzung');
    const m = mappeVon(c);
    const repo = repoName(m);
    let wj = await abh.speicher.werkstattJson(repo);
    if (!wj && anlegen) {
      try {
        await abh.speicher.anlegen(m, s.githubId);
      } catch (e) {
        // Abgelehnt mit eigener Meldung (gehört jemand anderem 403, Name belegt 409) geht durch, mit einer Zeile im Log.
        // Vorübergehendes (jeder GitHub-Fehler, Netz/Zeitlimit, 503) heißt „wird eingerichtet“ – der Editor versucht es
        // dann von selbst noch einmal. Alles andere ist ein Fehler bei uns.
        if (e instanceof ApiAusnahme && (e.status === 403 || e.status === 409)) {
          console.error(`werkstatt: Mappe anlegen abgelehnt (${e.status} ${e.code})`);
          throw e;
        }
        console.error('werkstatt: Mappe anlegen fehlgeschlagen –', ursache(e));
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

  // Einladung zum Lesen nach bestem Bemühen: scheitert sie, bleibt es bei einer Zeile im Log. Nur nach eigenesRepo
  // aufrufen (Besitz geprüft). lesezugriff merkt sich den Stand im Cache; ein wiederholter Aufruf kostet meist nur das.
  function einladen(repo: string, githubId: number): Promise<MappeStand['lesezugriff']> {
    return abh.speicher.lesezugriff(repo, githubId).catch((e): MappeStand['lesezugriff'] => {
      console.error('werkstatt: Lesezugriff nicht prüfbar –', ursache(e));
      return 'unbekannt';
    });
  }

  r.get('/', async (c) => {
    const m = c.get('mitgliedschaft');
    const repo = await eigenesRepo(c, true);
    // Best effort: die Mappe lädt auch, wenn GitHub die Einladung nicht beantwortet.
    const [lesezugriff, artefakte] = await Promise.all([einladen(repo, c.get('sitzung').githubId), abh.speicher.uebersicht(repo)]);
    const stand: MappeStand = { kohorte: m.kohorte, repo, lesezugriff, artefakte };
    return json(c, stand);
  });

  // Gemeinsamer Anfang beider Artefakt-Routen: Name prüfen.
  function artefaktName(c: Context<SitzungEnv>): ArtefaktName | Response {
    const name = c.req.param('artefakt') ?? '';
    if (!istArtefaktName(name)) return fehler(c, 404, 'unbekannt', 'Dieses Artefakt gibt es in der Werkstatt nicht.');
    return name;
  }

  async function lesen(repo: string, name: ArtefaktName) {
    try {
      return await abh.speicher.lesen(repo, name);
    } catch (e) {
      throw e instanceof DateiUnlesbar ? unlesbar(name, e) : e;
    }
  }

  // Feedback (NDU-35): vor /:artefakt, sonst wäre „feedback“ ein unbekanntes Artefakt. Nur die eigene Mappe (eigenesRepo
  // prüft werkstatt.json; bei Lehrenden die Demo-Mappe). Feedback in die Mappen der Studierenden schreiben Lehrende über
  // /api/werkstatt/lehrende/feedback.
  r.get('/feedback', async (c) => {
    const repo = await eigenesRepo(c, false);
    const antwort: FeedbackAntwort = { eintraege: (await feedbackHolen(abh.speicher, repo)).eintraege };
    return json(c, antwort);
  });

  // Genau eine Änderung je Anfrage: antworten, erledigt setzen, gesehen. Feedback der Lehrenden ändert hier nur die
  // Felder erledigt und gesehen (feedback.ts); einen Eintrag von „lehrende“ kann diese Route nie anlegen.
  r.post('/feedback', async (c) => {
    const m = mappeVon(c);
    if (!m.kuerzel) throw internerFehler('feedback: Mappe ohne Kürzel');
    const repo = await eigenesRepo(c, false);
    let anfrage: unknown;
    try {
      anfrage = await c.req.json();
    } catch {
      return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    }
    if (!istObjekt(anfrage)) return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    const a = anfrage;
    const autor = commitAutor(c.get('sitzung'));
    const kuerzel = m.kuerzel;
    const datum = new Date(abh.jetzt()).toISOString();
    let aenderung: Parameters<typeof feedbackAendern>[2];
    let nachricht: string;
    switch (a.aktion) {
      case 'antworten':
        aenderung = (f) => antworten(f, { antwortAuf: a.antwortAuf, text: a.text, autor: kuerzel, datum });
        nachricht = `Feedback: Antwort auf ${typeof a.antwortAuf === 'string' ? a.antwortAuf : '?'}`;
        break;
      case 'erledigt':
        aenderung = (f) => erledigtSetzen(f, a.id, a.erledigt);
        nachricht = `Feedback: ${typeof a.id === 'string' ? a.id : '?'} ${a.erledigt === false ? 'wieder offen' : 'erledigt'}`;
        break;
      case 'gesehen': {
        const name = typeof a.artefakt === 'string' ? a.artefakt : '';
        if (!istArtefaktName(name)) return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
        aenderung = (f) => gesehenSetzen(f, name);
        nachricht = `Feedback: ${ARTEFAKTE[name].titel} gelesen`;
        break;
      }
      default:
        return fehler(c, 422, 'ungueltig', UNVOLLSTAENDIG);
    }
    const danach = await feedbackAendern(abh.speicher, repo, aenderung, autor, kurzeNachricht(nachricht));
    const antwort: FeedbackAntwort = { eintraege: danach.eintraege };
    return json(c, antwort);
  });

  r.get('/:artefakt', async (c) => {
    const name = artefaktName(c);
    if (name instanceof Response) return name;
    // Wie die Übersicht lädt auch der Editor zum Lesen ein (der Editor kommt oft direkt vom Login, und dort kann die
    // Einladung gescheitert sein) – erst nach der Besitzprüfung in eigenesRepo und neben dem Lesen her. allSettled:
    // Auch wenn das Lesen scheitert, läuft die Einladung zu Ende, bevor die Antwort rausgeht.
    const repo = await eigenesRepo(c, true);
    const [gelesen] = await Promise.allSettled([lesen(repo, name), einladen(repo, c.get('sitzung').githubId)]);
    if (gelesen.status === 'rejected') throw gelesen.reason;
    const { daten, basisSha } = gelesen.value;
    const antwort: ArtefaktAntwort = { name, daten, basisSha };
    return json(c, antwort);
  });

  r.put('/:artefakt', async (c) => {
    const name = artefaktName(c);
    if (name instanceof Response) return name;

    // Unabhängige Lesezugriffe parallel. Ausgewertet wird erst der Besitz, damit eine fremde Mappe nie mehr als 403 verrät.
    const [besitz, gespeichert] = await Promise.allSettled([
      eigenesRepo(c, false),
      name === 'entscheidungen' ? lesen(repoName(mappeVon(c)), name) : Promise.resolve(null),
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

    const autor = commitAutor(c.get('sitzung'));
    const kurz = typeof nachricht === 'string' ? kurzeNachricht(nachricht) : '';
    const text = `${ARTEFAKTE[name].titel}: ${kurz || 'gespeichert über die Werkstatt'}`;

    const ergebnis = await abh.speicher.speichern(repo, name, dateien, basisSha, autor, text, (vorhanden) => readmeRendern(k, vorhanden));
    if ('konflikt' in ergebnis) return fehler(c, 409, 'konflikt', KONFLIKT);
    const antwort: SpeichernAntwort = { basisSha: ergebnis.basisSha, commitUrl: ergebnis.commitUrl };
    return json(c, antwort);
  });

  return r;
}
