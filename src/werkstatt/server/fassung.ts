// Mögliche Fassung der Lehrenden (NDU-42): versiegeln, Stand der Zeile, und ob die Person sie schon sehen darf.
//
// Wo was liegt: in mappe/feedback.json am Feedback-Eintrag `fassung` (versiegelt), `zeilenStand` (SHA-256 des
// normalisierten Zeilentexts beim Schreiben, fassungZeilenText in feedback.ts) und `freiSeit` (vom Server gesetzt,
// sobald die Fassung offen ist). Die Person hat Lesezugriff auf ihr Repo – darum steht dort nie Klartext, auch nicht nach
// dem Freigeben und nicht in der Versionsgeschichte.
//
// Siegel: AES-256-GCM mit einem Schlüssel, der per HKDF aus MCP_TOKEN_KEYS abgeleitet ist (eigener Zweck
// „werkstatt-fassung@1“, kein neues Geheimnis). Format `f1.<kid>.<base64url(nonce | Chiffretext | Tag)>`; versiegelt wird
// mit dem ersten Schlüssel, geöffnet mit jedem gelisteten. AAD bindet das Siegel an Repo, Artefakt und Zeile: In eine
// andere Mappe oder an eine andere Zeile kopiert, öffnet es sich nicht. Wird ein kid gestrichen, lassen sich seine
// Fassungen nicht mehr öffnen (Anzeige „nicht mehr lesbar“), die Datei bleibt gültig.
//
// Offen („frei“) ist eine Fassung, wenn freiSeit gesetzt ist, die Person auf das Feedback geantwortet hat oder der
// Text der Zeile heute anders ist als beim Schreiben (auch: Zeile gelöscht). Lässt sich das Artefakt nicht lesen, bleibt
// sie zu (lieber zu als zu früh). Das rechnet nur der Server; der Browser der Studierenden bekommt vorher nie den Text,
// nur { zu: true }. Den Connector erreicht die Fassung nie (er liest nur die Felder aus mcp/feedback.ts).
import { fassungZeilenText, type Feedback, type FeedbackEintrag } from '../feedback.js';
import { artefaktParsen, type ArtefaktName } from '../schemas/index.js';
import type { FassungSicht, FeedbackSichtEintrag } from '../vertrag.js';
import { kurzeNachricht } from './commit.js';
import { feedbackAendern, feedbackHolen } from './feedback.js';
import { entsiegeln, siegeln, type SiegelArt } from './siegel.js';
import { DateiUnlesbar } from './speicher-fehler.js';
import type { Abhaengigkeiten, Schluessel } from './typen.js';

const ZWECK = 'werkstatt-fassung@1';

const enc = new TextEncoder();
const dec = new TextDecoder();

export interface FassungOrt {
  repo: string;
  artefakt: ArtefaktName;
  zeilenId: string;
}

// Siegel wie die Umschläge des Connectors (siegel.ts), aber mit eigenem, per HKDF abgeleitetem Schlüssel (ZWECK) und
// eigener Version; AAD bindet an Repo, Artefakt und Zeile.
const art = (ort: FassungOrt): SiegelArt => ({ version: 'f1', zweck: ZWECK, aad: (kid) => enc.encode(`f1|${kid}|${ort.repo}|${ort.artefakt}|${ort.zeilenId}`) });

/** Versiegelt den Text einer Fassung für genau diese Stelle. */
export function fassungVersiegeln(text: string, ort: FassungOrt, schluessel: Schluessel[]): Promise<string> {
  return siegeln(art(ort), enc.encode(text), schluessel);
}

/** Klartext oder null (anderer Ort, unbekannter kid, manipuliert). Wirft nie. */
export async function fassungOeffnen(siegel: string, ort: FassungOrt, schluessel: Schluessel[]): Promise<string | null> {
  const klar = await entsiegeln(art(ort), siegel, schluessel);
  return klar === null ? null : dec.decode(klar);
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
  if (e.freiSeit !== undefined) return true;
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

/** Eintrag ohne die Felder der Datei, die nie zum Browser gehen (Siegel, Zeilenstand, freiSeit roh). */
function ohneFassung(e: FeedbackEintrag): FeedbackSichtEintrag {
  const { fassung: _f, zeilenStand: _z, freiSeit: _a, ...rest } = e;
  return rest;
}

export interface Sicht {
  eintraege: FeedbackSichtEintrag[];
  // IDs, deren Fassung jetzt offen ist, aber noch kein freiSeit trägt (zum Vermerken).
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
  // Nur lesen, wo es zählt: Fassung weder vermerkt (freiSeit) noch durch eine Antwort offen, Artefakt noch nicht gelesen.
  const beantwortet = new Set(eintraege.filter((a) => a.von === 'studierende').map((a) => a.antwortAuf));
  const zuLesen = [...new Set(mitFassung.filter((e) => e.freiSeit === undefined && !beantwortet.has(e.id) && bekannt[e.artefakt] === undefined).map((e) => e.artefakt))];
  await Promise.all(zuLesen.map(async (n) => { bekannt[n] = await artefaktLage(abh, repo, n); }));
  const neuFrei: string[] = [];
  const sichten = new Map<string, FassungSicht>();
  await Promise.all(mitFassung.map(async (e) => {
    const frei = fassungFrei(e, eintraege, await aktuellerStand(e, bekannt[e.artefakt]));
    if (frei && e.freiSeit === undefined) neuFrei.push(e.id);
    if (!frei && rolle === 'studierende') {
      sichten.set(e.id, { zu: true });
      return;
    }
    const text = await fassungOeffnen(e.fassung!, { repo, artefakt: e.artefakt, zeilenId: e.zeilenId! }, abh.umgebung.tokenKeys);
    sichten.set(e.id, {
      zu: !frei,
      ...(text === null ? { unlesbar: true as const } : { text }),
      ...(e.freiSeit !== undefined ? { freiSeit: e.freiSeit } : {}),
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

/** Nach dem Speichern eines Artefakts (Route PUT /mappe/:artefakt): Fassungen dieses Artefakts, deren Zeile sich gegenüber
 *  dem Stand beim Schreiben geändert hat, sind ab jetzt offen – freiSeit wird gleich hier vermerkt (ein Commit an
 *  feedback.json), mit den Daten, die eben gespeichert wurden. So hängt das Freigeben nicht davon ab, dass ein späteres
 *  Lesen den neuen Stand schon sieht; die Prüfung beim Lesen (feedbackSicht) bleibt nur Rückfall (Commit gescheitert,
 *  Artefakt außerhalb der Werkstatt geändert). Nichts zu tun: kein Commit. Gibt die IDs zurück, die vermerkt wurden. */
export async function freigebenNachSpeichern(
  abh: Abhaengigkeiten,
  repo: string,
  name: ArtefaktName,
  daten: unknown,
  aenderung: { autor: { name: string; email: string }; datum: string },
): Promise<string[]> {
  if (name !== 'brief' && name !== 'annahmen' && name !== 'leitfaden') return [];
  const fb = await feedbackHolen(abh.speicher, repo);
  const kandidaten = fb.eintraege.filter((e) => e.von === 'lehrende' && e.artefakt === name && e.fassung !== undefined && e.freiSeit === undefined && e.zeilenId !== undefined);
  const ids: string[] = [];
  for (const e of kandidaten) if ((await zeilenStand(fassungZeilenText(name, daten, e.zeilenId!))) !== e.zeilenStand) ids.push(e.id);
  if (ids.length === 0) return [];
  await feedbackAendern(abh.speicher, repo, (f) => freiSeitSetzen(f, ids, aenderung.datum), aenderung.autor, kurzeNachricht(`Feedback: mögliche Fassung zu ${ids.join(', ')} frei`));
  return ids;
}

/** Vermerkt freiSeit an genau diesen Einträgen (nur, wo es noch fehlt). Für feedbackAendern. */
export function freiSeitSetzen(f: Feedback, ids: readonly string[], datum: string): Feedback {
  const offen = f.eintraege.filter((e) => ids.includes(e.id) && e.fassung !== undefined && e.freiSeit === undefined);
  if (offen.length === 0) return f;
  return { ...f, eintraege: f.eintraege.map((e) => (offen.includes(e) ? { ...e, freiSeit: datum } : e)) };
}
