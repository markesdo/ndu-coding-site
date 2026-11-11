// Mögliche Fassung der Lehrenden (NDU-42): versiegeln, Stand der Zeile, und ob die Person sie schon sehen darf.
//
// Wo was liegt: in mappe/feedback.json am Feedback-Eintrag `fassung` (versiegelt), `zeilenStand` (SHA-256 des
// normalisierten Zeilentexts beim Schreiben, fassungZeilenText in feedback.ts) und `aufgedecktAm` (vom Server gesetzt,
// sobald die Fassung offen ist). Die Person hat Lesezugriff auf ihr Repo – darum steht dort nie Klartext, auch nicht nach
// dem Aufdecken und nicht in der Versionsgeschichte.
//
// Siegel: AES-256-GCM mit einem Schlüssel, der per HKDF aus MCP_TOKEN_KEYS abgeleitet ist (eigener Zweck
// „werkstatt-fassung@1“, kein neues Geheimnis). Format `f1.<kid>.<base64url(nonce | Chiffretext | Tag)>`; versiegelt wird
// mit dem ersten Schlüssel, geöffnet mit jedem gelisteten. AAD bindet das Siegel an Repo, Artefakt und Zeile: In eine
// andere Mappe oder an eine andere Zeile kopiert, öffnet es sich nicht. Wird ein kid gestrichen, lassen sich seine
// Fassungen nicht mehr öffnen (Anzeige „nicht mehr lesbar“), die Datei bleibt gültig.
//
// Offen („frei“) ist eine Fassung, wenn aufgedecktAm gesetzt ist, die Person auf das Feedback geantwortet hat oder der
// Text der Zeile heute anders ist als beim Schreiben (auch: Zeile gelöscht). Lässt sich das Artefakt nicht lesen, bleibt
// sie zu (lieber zu als zu früh). Das rechnet nur der Server; der Browser der Studierenden bekommt vorher nie den Text,
// nur { zu: true }. Den Connector erreicht die Fassung nie (er liest nur die Felder aus mcp/feedback.ts).
import { ausB64url, b64url } from '../../lib/kurszugang.js';
import { fassungZeilenText, type Feedback, type FeedbackEintrag } from '../feedback.js';
import { artefaktParsen, type ArtefaktName } from '../schemas/index.js';
import type { FassungSicht, FeedbackSichtEintrag } from '../vertrag.js';
import { DateiUnlesbar } from './speicher-fehler.js';
import type { Abhaengigkeiten, Schluessel } from './typen.js';

const VERSION = 'f1';
const NONCE_BYTES = 12;
const TAG_BYTES = 16;
const KID = /^[A-Za-z0-9_-]{1,32}$/;
const ZWECK = 'werkstatt-fassung@1';

const enc = new TextEncoder();
const dec = new TextDecoder();

export interface FassungOrt {
  repo: string;
  artefakt: ArtefaktName;
  zeilenId: string;
}

const aad = (kid: string, o: FassungOrt) => enc.encode(`${VERSION}|${kid}|${o.repo}|${o.artefakt}|${o.zeilenId}`);

// Abgeleitete Schlüssel je Schlüssel-Objekt der Umgebung (ein Import pro kid und Prozess), wie umschlag.ts.
const abgeleitet = new WeakMap<Uint8Array, Promise<CryptoKey>>();

function fassungsSchluessel(key: Uint8Array): Promise<CryptoKey> {
  let k = abgeleitet.get(key);
  if (!k) {
    k = crypto.subtle
      .importKey('raw', new Uint8Array(key), 'HKDF', false, ['deriveKey'])
      .then((basis) => crypto.subtle.deriveKey(
        { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: enc.encode(ZWECK) },
        basis,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt'],
      ));
    abgeleitet.set(key, k);
    k.catch(() => abgeleitet.delete(key));
  }
  return k;
}

/** Versiegelt den Text einer Fassung für genau diese Stelle. */
export async function fassungVersiegeln(text: string, ort: FassungOrt, schluessel: Schluessel[]): Promise<string> {
  const erster = schluessel[0];
  if (!erster) throw new Error('fassungVersiegeln ohne Schlüssel');
  if (!KID.test(erster.kid)) throw new Error('MCP_TOKEN_KEYS: kid ungeeignet');
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_BYTES));
  const geheim = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, additionalData: aad(erster.kid, ort), tagLength: TAG_BYTES * 8 },
    await fassungsSchluessel(erster.key),
    enc.encode(text),
  );
  const roh = new Uint8Array(NONCE_BYTES + geheim.byteLength);
  roh.set(nonce);
  roh.set(new Uint8Array(geheim), NONCE_BYTES);
  return `${VERSION}.${erster.kid}.${b64url(roh)}`;
}

/** Klartext oder null (anderer Ort, unbekannter kid, manipuliert). Wirft nie. */
export async function fassungOeffnen(siegel: string, ort: FassungOrt, schluessel: Schluessel[]): Promise<string | null> {
  const teile = siegel.split('.');
  if (teile.length !== 3 || teile[0] !== VERSION) return null;
  const [, kid, rumpf] = teile;
  const s = schluessel.find((k) => k.kid === kid);
  if (!s) return null;
  try {
    const roh = ausB64url(rumpf);
    if (roh.length < NONCE_BYTES + TAG_BYTES + 1) return null;
    const klar = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: roh.subarray(0, NONCE_BYTES), additionalData: aad(kid, ort), tagLength: TAG_BYTES * 8 },
      await fassungsSchluessel(s.key),
      roh.subarray(NONCE_BYTES),
    );
    return dec.decode(klar);
  } catch {
    return null;
  }
}

/** Stand einer Zeile: `sha256:<hex>` des normalisierten Texts (fassungZeilenText); null = Zeile fehlt. */
export async function zeilenStand(text: string | null): Promise<string> {
  // Fehlt die Zeile, ein Wert, den kein Text ergibt (andere Vorsilbe als jeder Text).
  const h = await crypto.subtle.digest('SHA-256', enc.encode(text === null ? 'fehlt' : `t:${text}`));
  return `sha256:${[...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
}

// Heutiger Stand der Zeile je Artefakt: daten des Artefakts (geprüft) oder 'unbekannt' (nicht lesbar).
export type ArtefaktLage = { daten: unknown | null } | 'unbekannt';

/** Ist die Fassung an e offen? aktuell: der heutige Stand der Zeile (zeilenStand) oder 'unbekannt'. */
export function fassungFrei(e: FeedbackEintrag, eintraege: readonly FeedbackEintrag[], aktuell: string | 'unbekannt'): boolean {
  if (e.fassung === undefined) return false;
  if (e.aufgedecktAm !== undefined) return true;
  if (eintraege.some((a) => a.von === 'studierende' && a.antwortAuf === e.id)) return true;
  return aktuell !== 'unbekannt' && aktuell !== e.zeilenStand;
}

/** Zeilenstand aus einer Artefakt-Lage (für fassungFrei). */
export async function aktuellerStand(e: FeedbackEintrag, lage: ArtefaktLage | undefined): Promise<string | 'unbekannt'> {
  if (lage === undefined || lage === 'unbekannt' || e.zeilenId === undefined) return 'unbekannt';
  return zeilenStand(fassungZeilenText(e.artefakt, lage.daten, e.zeilenId));
}

/** Liest ein Artefakt für die Prüfung der Zeile: geprüfte Daten, null = nicht gespeichert, 'unbekannt' = nicht lesbar
 *  (GitHub, kaputtes JSON, falsches Schema). Wirft nie. */
export async function artefaktLage(abh: Abhaengigkeiten, repo: string, name: ArtefaktName): Promise<ArtefaktLage> {
  try {
    const { daten } = await abh.speicher.lesen(repo, name);
    if (daten === null) return { daten: null };
    const p = artefaktParsen(name, daten);
    return p.ok ? { daten: p.daten } : 'unbekannt';
  } catch (e) {
    if (!(e instanceof DateiUnlesbar)) console.error('werkstatt: Fassung – Artefakt nicht lesbar –', e instanceof Error ? `${e.name}: ${e.message}` : 'Fehler');
    return 'unbekannt';
  }
}

/** Eintrag ohne die Felder der Datei, die nie zum Browser gehen (Siegel, Zeilenstand, aufgedecktAm roh). */
function ohneFassung(e: FeedbackEintrag): FeedbackSichtEintrag {
  const { fassung: _f, zeilenStand: _z, aufgedecktAm: _a, ...rest } = e;
  return rest;
}

export interface Sicht {
  eintraege: FeedbackSichtEintrag[];
  // IDs, deren Fassung jetzt offen ist, aber noch kein aufgedecktAm trägt (zum Vermerken).
  neuFrei: string[];
}

/** Was die Person bzw. die Lehrenden vom Feedback sehen. rolle 'studierende': Text nur, wenn offen, sonst { zu: true }.
 *  rolle 'lehrende': immer der Text, dazu ob offen. lagen: Artefakte, die schon gelesen sind; fehlende liest die Sicht
 *  selbst (nur die, an denen eine noch zue Fassung hängt). */
export async function feedbackSicht(
  abh: Abhaengigkeiten,
  repo: string,
  eintraege: readonly FeedbackEintrag[],
  rolle: 'studierende' | 'lehrende',
  lagen: Partial<Record<ArtefaktName, ArtefaktLage>> = {},
): Promise<Sicht> {
  const mitFassung = eintraege.filter((e) => e.von === 'lehrende' && e.fassung !== undefined);
  const bekannt = { ...lagen };
  // Nur lesen, wo es zählt: Fassung noch ohne aufgedecktAm und ohne Antwort.
  const zuLesen = [...new Set(mitFassung.filter((e) => e.aufgedecktAm === undefined && bekannt[e.artefakt] === undefined).map((e) => e.artefakt))];
  await Promise.all(zuLesen.map(async (n) => { bekannt[n] = await artefaktLage(abh, repo, n); }));
  const neuFrei: string[] = [];
  const sichten = new Map<string, FassungSicht>();
  await Promise.all(mitFassung.map(async (e) => {
    const frei = fassungFrei(e, eintraege, await aktuellerStand(e, bekannt[e.artefakt]));
    if (frei && e.aufgedecktAm === undefined) neuFrei.push(e.id);
    if (!frei && rolle === 'studierende') {
      sichten.set(e.id, { zu: true });
      return;
    }
    const text = await fassungOeffnen(e.fassung!, { repo, artefakt: e.artefakt, zeilenId: e.zeilenId! }, abh.umgebung.tokenKeys);
    sichten.set(e.id, {
      zu: !frei,
      ...(text === null ? { unlesbar: true as const } : { text }),
      ...(e.aufgedecktAm !== undefined ? { aufgedecktAm: e.aufgedecktAm } : {}),
    });
  }));
  return {
    eintraege: eintraege.map((e) => {
      const s = sichten.get(e.id);
      return s ? { ...ohneFassung(e), fassung: s } : ohneFassung(e);
    }),
    neuFrei: neuFrei.sort(),
  };
}

/** Vermerkt aufgedecktAm an genau diesen Einträgen (nur, wo es noch fehlt). Für feedbackAendern. */
export function aufgedecktSetzen(f: Feedback, ids: readonly string[], datum: string): Feedback {
  const offen = f.eintraege.filter((e) => ids.includes(e.id) && e.fassung !== undefined && e.aufgedecktAm === undefined);
  if (offen.length === 0) return f;
  return { ...f, eintraege: f.eintraege.map((e) => (offen.includes(e) ? { ...e, aufgedecktAm: datum } : e)) };
}
