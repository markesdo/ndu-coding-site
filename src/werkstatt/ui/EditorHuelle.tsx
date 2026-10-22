// Editor-Hülle: eine Komponente für alle Artefakte. Laden, Entwurf, Speichern, Konflikt, Fehler, Anmelden.
// Die Zustandsmaschine steht in huelle.ts (rein, getestet); hier laufen nur die Effekte und die Anzeige.
import { flushSync } from 'react-dom';
import { Copy, LogIn, Pencil, RefreshCw, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { kopiereText, kopierMeldung } from '../../lib/kopieren.js';
import { tagInWien } from '../../lib/kurswahl.js';
import { aufgedecktHolen } from '../../lib/aufgedeckt.js';
import { rendern } from '../render/index.js';
import { ARTEFAKTE, artefaktParsen, type ArtefaktName, type DatenVon, type Feldfehler } from '../schemas/index.js';
import { DEMO_HREF, MAPPE_DEMO } from '../../lib/nav-rolle.js';
import { ROUTEN } from '../vertrag.js';
import { api, ApiError } from './api.js';
import { StudierendenFeedback } from './Feedback.js';
import Fehlergrenze, { Ausfuehren } from './Fehlergrenze.js';
import { entwurfLaden, entwurfLoeschen, entwurfNachCommitLoeschen, entwurfNormalisieren, entwurfSichern, startStand } from './entwurf.js';
import { MITKOPIEREN_SCHLUESSEL, kopierText, pruefMethode, pruefPromptFrei, vorarbeitNamen } from './kopiertext.js';
import { darfSpeichern, demoHinweis, huelle, ladefehlerHinweis, leererStand, mappeLaden, speicherfehlerHinweis, serverStandNachLaden, serverStandNachSpeichern, speichernErlaubt, versucheNach, statusText, type Ereignis, type HuellenZustand } from './huelle.js';
import '../../styles/werkstatt.css';

export interface EditorHuelleProps<N extends ArtefaktName> {
  name: N;
  titel: string;
  /** Live-Bild rechts. */
  bild: (daten: DatenVon<N>) => ReactNode;
  /**
   * Formular links. `setze` ersetzt die ganzen Daten; `fehler(pfad)` liefert die Meldung zum Feld, zum Beispiel „annahmen.0.id“.
   * `gespeichert`: was gerade auf dem Server liegt (nie ein Entwurf; null, solange die Datei fehlt), nach jedem Speichern aktuell.
   */
  formular: (
    daten: DatenVon<N>,
    setze: (neu: DatenVon<N>) => void,
    fehler: (pfad: string) => string | undefined,
    gespeichert: DatenVon<N> | null,
  ) => ReactNode;
  /** Markdown des Artefakts für „Für Claude kopieren“ (liefert der Renderer der Mappe). */
  alsMarkdown: (daten: DatenVon<N>) => string;
}

const TEXT = {
  abgemeldet: 'Melde dich mit GitHub an, um deine Mappe zu bearbeiten.',
  abgelaufen: 'Deine Sitzung ist abgelaufen. Melde dich neu an – dein Entwurf bleibt erhalten.',
  abgelaufenUngesichert: 'Deine Sitzung ist abgelaufen. Melde dich neu an. Dein Entwurf konnte auf diesem Gerät nicht gesichert werden – lass diesen Tab offen.',
  aelterEntwurf: 'Auf diesem Gerät liegt ein älterer Entwurf.',
  wirdEingerichtet: 'Deine Mappe wird eingerichtet …',
  wirdEingerichtetLang: 'Das dauert länger als gedacht. Versuch es gleich noch einmal.',
  konflikt: 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.',
} as const;

const NEUVERSUCHE = 3; // à 3 s: höchstens ~10 s „wird eingerichtet“, dann Knopf
const heute = () => tagInWien(new Date()); // JJJJ-MM-TT in Wien, wie der Kurs

// Schalter „Prüf-Prompt mitkopieren“ je Browser; ohne localStorage (privates Fenster, gesperrt) einfach an.
function mitkopierenLesen(): boolean {
  try { return localStorage.getItem(MITKOPIEREN_SCHLUESSEL) !== '0'; } catch { return true; }
}
function mitkopierenSichern(an: boolean): void {
  try { localStorage.setItem(MITKOPIEREN_SCHLUESSEL, an ? '1' : '0'); } catch { /* bleibt nur für diesen Aufruf */ }
}
const istPraesentator = () => typeof document !== 'undefined' && document.documentElement.hasAttribute('data-ist-praesentator');

export default function EditorHuelle<N extends ArtefaktName>({ name, titel, bild, formular, alsMarkdown }: EditorHuelleProps<N>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titelRef = useRef<HTMLHeadingElement>(null);
  const kopierRef = useRef<HTMLTextAreaElement>(null);

  const [offen, setOffen] = useState(false);
  const [zustand, setZustand] = useState<HuellenZustand>('laden');
  const [daten, setDatenAnzeige] = useState<DatenVon<N> | null>(null);
  const [dirty, setDirty] = useState(false);
  const [gesichert, setGesichert] = useState(true);
  const [abgelaufen, setAbgelaufen] = useState(false);
  const [fehlerCode, setFehlerCode] = useState<string | null>(null);
  // Meldung des Servers zum letzten Fehler (Lehrende, fremde Mappe, abgelehntes Speichern …), sonst null.
  const [meldung, setMeldung] = useState<string | null>(null);
  // Lehrende bearbeiten ihre Demo-Mappe (NDU-37): eine Zeile über dem Editor sagt das.
  const [demo, setDemo] = useState<string | null>(null);
  const [serverFelder, setServerFelder] = useState<Feldfehler[]>([]);
  const [kopieStatus, setKopieStatus] = useState('');
  // Text für „Für Claude kopieren“: sichtbar nur, wenn die Zwischenablage nicht ging; zum Kopieren kurz verborgen im DOM.
  const [kopierFeld, setKopierFeld] = useState<{ text: string; sichtbar: boolean } | null>(null);
  // „Prüf-Prompt mitkopieren“ (kopiertext.ts): Schalter, aufgedeckte Gruppe (Mom Test) und die Vorarbeit für den Prompt.
  const [mitPrompt, setMitPrompt] = useState(mitkopierenLesen);
  const [aufgedeckt, setAufgedeckt] = useState<string[]>([]);
  const [vorarbeit, setVorarbeit] = useState<Partial<Record<ArtefaktName, string>>>({});
  const [vorarbeitLaedt, setVorarbeitLaedt] = useState(false);
  // Formular oder Vorschau sind abgestürzt (falsch geformter Entwurf): Speichern bleibt gesperrt.
  const [anzeigeKaputt, setAnzeigeKaputt] = useState(false);
  const [grenzeNr, setGrenzeNr] = useState(0);
  const [versuche, setVersuche] = useState(0);
  // Entwurf auf einem anderen Stand als dem des Servers: wartet auf die ausdrückliche Wahl.
  const [aelterEntwurf, setAelterEntwurf] = useState<DatenVon<N> | null>(null);
  // Stand des Servers (ohne Entwurf) für das Formular.
  const [gespeichert, setGespeichert] = useState<DatenVon<N> | null>(null);

  // Aktueller Stand für asynchrone Abläufe (Zustand in React-State wäre dort veraltet).
  const z = useRef<HuellenZustand>('laden');
  const datenRef = useRef<DatenVon<N> | null>(null);
  const basisSha = useRef<string | null>(null);
  const person = useRef<{ githubId: number; kohorte: string } | null>(null);
  const lauf = useRef(0); // verwirft Antworten veralteter Ladevorgänge

  const senden = useCallback((e: Ereignis) => {
    const r = huelle(z.current, e);
    z.current = r.zustand;
    setZustand(r.zustand);
    for (const effekt of r.effekte) {
      if (effekt === 'entwurfSichern' && person.current !== null) {
        setGesichert(entwurfSichern(name, person.current.githubId, person.current.kohorte, basisSha.current, datenRef.current));
      } else if (effekt === 'entwurfLoeschen' && person.current !== null) {
        entwurfLoeschen(name, person.current.githubId, person.current.kohorte);
        setDirty(false);
        setGesichert(true);
      } else if (effekt === 'neuLaden') {
        void laden();
      }
    }
    return r.zustand;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function laden(): Promise<void> {
    const mein = ++lauf.current;
    const gueltig = () => mein === lauf.current;
    setFehlerCode(null);
    setMeldung(null);
    setServerFelder([]);
    setAelterEntwurf(null);
    const r = await mappeLaden({ ich: () => api.ich(), lesen: () => api.lesen(name) });
    if (!gueltig()) return;
    if (r.typ === 'abgemeldet') return void senden({ typ: 'ladenFehlgeschlagen', status: 401, code: 'nicht-angemeldet' });
    if (r.ich !== null) person.current = { githubId: r.ich.githubId, kohorte: r.ich.kohorte };
    setDemo(demoHinweis(r.ich));
    if (r.typ === 'fehler') {
      setFehlerCode(r.code);
      setMeldung(r.meldung);
      return void senden({ typ: 'ladenFehlgeschlagen', status: r.status, code: r.code });
    }
    // Was nach dem Laden kommt (Schema, Migration, Entwurf), darf die Hülle nie auf „laden“ hängen lassen.
    try {
      const { ich, antwort } = r;
      const vomServer = artefaktParsen(name, antwort.daten ?? ARTEFAKTE[name].leer(heute()));
      if (!vomServer.ok) {
        console.error('werkstatt: gespeicherte Datei passt nicht zum Schema –', vomServer.fehler);
        setFehlerCode('datei');
        return void senden({ typ: 'ladenFehlgeschlagen', status: 500, code: 'unbekannt' });
      }
      // Nur ein Entwurf auf dem Stand des Servers kommt still zurück; ein älterer wird zur Wahl angeboten.
      // Auch ein unvollständiger Entwurf kommt zurück (Schema scheitert → Feldfehler, Speichern gesperrt); nur Müll nicht.
      const roh = entwurfLaden(name, ich.githubId, ich.kohorte);
      const start = startStand(
        { daten: vomServer.daten as DatenVon<N>, basisSha: antwort.basisSha },
        roh === null ? null : { basisSha: roh.basisSha, daten: entwurfNormalisieren(name, ARTEFAKTE[name].leer(heute()), roh.daten) as DatenVon<N> },
      );
      basisSha.current = start.basisSha;
      setGespeichert(serverStandNachLaden(antwort.daten, vomServer.daten as DatenVon<N>));
      datenRef.current = start.daten;
      setDatenAnzeige(start.daten);
      setDirty(start.alsEntwurf);
      setAelterEntwurf(start.aelterEntwurf);
      setGesichert(true);
      senden({ typ: 'geladen' });
    } catch (err) {
      console.error('werkstatt: geladene Daten oder Entwurf ließen sich nicht verarbeiten –', err);
      if (!gueltig()) return;
      senden({ typ: 'ladenFehlgeschlagen', status: 0, code: 'unbekannt' });
    }
  }

  function oeffnen(): void {
    // Jedes Öffnen beginnt leer: Ein Ladefehler zeigt nie die Daten vom letzten Mal.
    const leer = leererStand();
    datenRef.current = leer.daten;
    basisSha.current = leer.basisSha;
    setDatenAnzeige(leer.daten);
    setGespeichert(null);
    setDirty(leer.dirty);
    setAelterEntwurf(leer.aelterEntwurf);
    setGesichert(leer.gesichert);
    setFehlerCode(null);
    setMeldung(null);
    setServerFelder([]);
    senden({ typ: 'oeffnen' });
    setVersuche(0);
    setAbgelaufen(false);
    setKopieStatus('');
    setKopierFeld(null);
    setMitPrompt(mitkopierenLesen()); // ein anderer Editor kann den Schalter inzwischen umgestellt haben
    setAnzeigeKaputt(false);
    setOffen(true);
    void laden();
  }

  useEffect(() => {
    const d = dialog.current;
    if (offen && d && !d.open) {
      d.showModal();
      titelRef.current?.focus();
    }
  }, [offen]);

  // „Wird eingerichtet“: alle 3 s neu versuchen, nach ~10 s gibt der Knopf das Heft zurück.
  useEffect(() => {
    if (!offen || zustand !== 'wird-eingerichtet' || versuche >= NEUVERSUCHE) return;
    const t = setTimeout(() => {
      setVersuche((v) => v + 1);
      senden({ typ: 'neuLaden' });
    }, 3000);
    return () => clearTimeout(t);
  }, [offen, zustand, versuche, senden]);

  // Neuversuche zählen nur innerhalb einer Einrichtungsphase.
  useEffect(() => setVersuche((v) => versucheNach(zustand, v)), [zustand]);

  // Beamer: Panel zu (der Entwurf bleibt), sonst bliebe die Seite hinter einem unsichtbaren Dialog gesperrt.
  useEffect(() => {
    const beobachter = new MutationObserver(() => {
      if (document.documentElement.hasAttribute('data-beamer')) dialog.current?.close();
    });
    beobachter.observe(document.documentElement, { attributes: true, attributeFilter: ['data-beamer'] });
    return () => beobachter.disconnect();
  }, []);

  useEffect(() => {
    if (kopierFeld?.sichtbar) {
      kopierRef.current?.focus();
      kopierRef.current?.select();
    }
  }, [kopierFeld]);

  // Verrät die Prüfliste eine Übung (Leitfaden: Mom Test), fragt der Editor beim Öffnen, ob Markus sie aufgedeckt hat.
  // Scheitert die Frage, bleibt es bei Uhrzeit und Präsentator – der Prompt bleibt dann eher zu als zu früh offen.
  const methode = pruefMethode(name);
  useEffect(() => {
    if (!offen || !methode?.prueflisteNach || pruefPromptFrei(methode, new Date(), istPraesentator())) return;
    let aktiv = true;
    aufgedecktHolen([methode.prueflisteNach.gruppe]).then((a) => { if (aktiv) setAufgedeckt(a); }, () => {});
    return () => { aktiv = false; };
  }, [offen, methode]);

  // Vorarbeit, die der Prüf-Prompt nennt (Brief, Annahmen-Map …): gespeicherter Stand, einmal je Öffnen, nur mit Schalter an.
  useEffect(() => {
    const namen = vorarbeitNamen(name);
    if (!offen || !mitPrompt || namen.length === 0) return;
    let aktiv = true;
    setVorarbeit({});
    setVorarbeitLaedt(true);
    void Promise.all(
      namen.map(async (n) => {
        try {
          const antwort = await api.lesen(n);
          const p = artefaktParsen(n, antwort.daten ?? ARTEFAKTE[n].leer(heute()));
          return p.ok ? ([n, rendern(n, p.daten as never)] as const) : null;
        } catch {
          return null;
        }
      }),
    ).then((r) => {
      if (!aktiv) return;
      setVorarbeit(Object.fromEntries(r.filter((x) => x !== null)));
      setVorarbeitLaedt(false);
    });
    return () => { aktiv = false; };
  }, [offen, mitPrompt, name]);

  function mitPromptUmschalten(an: boolean): void {
    setMitPrompt(an);
    mitkopierenSichern(an);
    setKopieStatus('');
  }

  const promptFrei = methode !== undefined && pruefPromptFrei(methode, new Date(), istPraesentator(), aufgedeckt);
  // Was „Für Claude kopieren“ jetzt kopiert – dieselbe Funktion für den Knopf und die Anzeige „Was kopiert wird“.
  const kopie = useMemo(() => {
    if (daten === null) return null;
    try {
      return kopierText({ name, markdown: alsMarkdown(daten), mitPrompt, frei: promptFrei, vorarbeit });
    } catch {
      return null;
    }
  }, [name, daten, alsMarkdown, mitPrompt, promptFrei, vorarbeit]);

  const setze = (neu: DatenVon<N>) => {
    datenRef.current = neu;
    setDatenAnzeige(neu);
    setDirty(true);
    setServerFelder([]);
    senden({ typ: 'geaendert' });
  };

  const pruefung = useMemo(() => (daten === null ? { erlaubt: false, fehler: [] as Feldfehler[] } : speichernErlaubt(name, daten)), [name, daten]);
  const alleFehler = useMemo(() => [...pruefung.fehler, ...serverFelder], [pruefung, serverFelder]);
  const fehlerAm = useCallback((pfad: string) => alleFehler.find((f) => f.pfad === pfad)?.meldung, [alleFehler]);

  async function speichern(): Promise<void> {
    // kannSpeichern: Schema ok, kein älterer Entwurf offen, Zustand erlaubt es. Der Ref-Test fängt den Doppelklick im selben Takt.
    if (!kannSpeichern || !darfSpeichern(z.current)) return;
    if (senden({ typ: 'speichern' }) !== 'speichert') return;
    setVersuche(0);
    const mein = lauf.current;
    const gesendeterStand = basisSha.current;
    const gesendeteDaten = datenRef.current;
    const wer = person.current;
    try {
      const antwort = await api.speichern(name, { daten: gesendeteDaten, basisSha: gesendeterStand });
      if (mein !== lauf.current) {
        // Antwort aus einer früheren Öffnung: Zustand und Stand nicht anfassen. Ein geglückter Commit macht aber den
        // zugehörigen Entwurf überflüssig.
        if (!('konflikt' in antwort) && wer !== null) entwurfNachCommitLoeschen(name, wer.githubId, wer.kohorte, gesendeterStand, gesendeteDaten);
        return;
      }
      setGespeichert((vorher) => serverStandNachSpeichern(vorher, antwort, gesendeteDaten as DatenVon<N>));
      if ('konflikt' in antwort) return void senden({ typ: 'speichernFehlgeschlagen', status: 409, code: 'konflikt' });
      basisSha.current = antwort.basisSha;
      senden({ typ: 'gespeichert' });
    } catch (err) {
      if (mein !== lauf.current) return;
      const a = err instanceof ApiError ? err : new ApiError(0, 'unbekannt', '');
      if (a.status === 401) setAbgelaufen(true);
      setFehlerCode(a.code);
      setMeldung(a.message || null);
      if (a.felder) setServerFelder(a.felder);
      senden({ typ: 'speichernFehlgeschlagen', status: a.status, code: a.code });
    }
  }

  async function fuerClaudeKopieren(): Promise<void> {
    if (daten === null) return;
    if (kopie === null) return setKopieStatus('Dieser Entwurf lässt sich nicht kopieren.');
    const { text } = kopie;
    // Die Textarea wird nur fürs Kopieren eingehängt: Scheitert die Zwischenablage, markiert kopiereText dort den Text.
    flushSync(() => setKopierFeld({ text, sichtbar: false }));
    const ergebnis = await kopiereText(text, kopierRef.current);
    setKopieStatus(kopierMeldung(ergebnis, navigator.platform));
    setKopierFeld(ergebnis === 'kopiert' ? null : { text, sichtbar: true }); // nicht kopiert: sichtbar, damit man selbst kopieren kann
  }

  const zurueck = typeof location === 'undefined' ? '/' : location.pathname + location.search + location.hash;
  const loginHref = `${ROUTEN.login.pfad}?weiter=${encodeURIComponent(zurueck)}`;

  function entwurfUebernehmen(): void {
    if (aelterEntwurf === null) return;
    setAelterEntwurf(null);
    setze(aelterEntwurf); // ab jetzt auf dem aktuellen Stand (basisSha), gesichert als Entwurf
  }

  function entwurfVerwerfen(): void {
    if (person.current !== null) entwurfLoeschen(name, person.current.githubId, person.current.kohorte);
    setAelterEntwurf(null);
  }

  // Kaputter Entwurf: weg damit und frisch vom Server laden.
  function kaputtenEntwurfVerwerfen(): void {
    entwurfVerwerfen();
    setAnzeigeKaputt(false);
    setGrenzeNr((n) => n + 1);
    senden({ typ: 'oeffnen' });
    void laden();
  }
  const status = statusText(zustand, dirty);
  // Formular und Feedback erst, wenn die eigene Mappe geladen ist (nicht beim Laden, abgemeldet, im Einrichten, Ladefehler).
  const inhaltSichtbar = daten !== null && zustand !== 'laden' && zustand !== 'abgemeldet' && zustand !== 'wird-eingerichtet' && zustand !== 'ladefehler';
  const kannSpeichern = daten !== null && !anzeigeKaputt && pruefung.erlaubt && aelterEntwurf === null && darfSpeichern(zustand);
  const ersteMeldung = pruefung.fehler[0];

  function hinweis(): ReactNode {
    if (zustand === 'abgemeldet') {
      return (
        <div className="wk-hinweis" role="alert">
          <p>{abgelaufen ? (gesichert ? TEXT.abgelaufen : TEXT.abgelaufenUngesichert) : TEXT.abgemeldet}</p>
          <a className="wk-knopf wk-primaer" href={loginHref}><LogIn size={16} aria-hidden="true" /> Mit GitHub anmelden</a>
        </div>
      );
    }
    if (zustand === 'wird-eingerichtet') {
      return (
        <div className="wk-hinweis" role="status">
          <p>{versuche >= NEUVERSUCHE ? TEXT.wirdEingerichtetLang : TEXT.wirdEingerichtet}</p>
          {versuche >= NEUVERSUCHE && (
            <button type="button" className="wk-knopf" onClick={() => { setVersuche(0); senden({ typ: 'neuLaden' }); }}>
              <RefreshCw size={16} aria-hidden="true" /> Neu versuchen
            </button>
          )}
        </div>
      );
    }
    if (zustand === 'konflikt') {
      return (
        <div className="wk-hinweis" role="alert">
          <p>{TEXT.konflikt}</p>
          <button type="button" className="wk-knopf wk-primaer" onClick={() => senden({ typ: 'neuLaden' })}>
            <RefreshCw size={16} aria-hidden="true" /> Neu laden
          </button>
        </div>
      );
    }
    if (zustand === 'ladefehler') {
      const { text, nochmal } = ladefehlerHinweis(fehlerCode, meldung);
      return (
        <div className="wk-hinweis" role="alert">
          <p>{text}</p>
          {nochmal && (
            <button type="button" className="wk-knopf" onClick={() => { setVersuche(0); senden({ typ: 'neuLaden' }); }}>
              <RefreshCw size={16} aria-hidden="true" /> Neu versuchen
            </button>
          )}
        </div>
      );
    }
    if (zustand === 'fehler') {
      const { text, details } = speicherfehlerHinweis(meldung, serverFelder, gesichert);
      return (
        <div className="wk-hinweis" role="alert">
          <p>{text}</p>
          {details.length > 0 && (
            <ul>
              {details.map((d) => <li key={d}>{d}</li>)}
            </ul>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    // data-werkstatt nur am Einstieg: Der Beamer blendet ihn aus. Am Panel hinge sonst ein offener Dialog unsichtbar über der Seite.
    <div className="wk-wurzel">
      <button type="button" data-werkstatt className="wk-knopf wk-primaer" onClick={oeffnen}>
        <Pencil size={16} aria-hidden="true" /> Bearbeiten
      </button>
      <dialog ref={dialog} className="wk-dialog" aria-labelledby={`wk-titel-${name}`} onClose={() => setOffen(false)}>
        {offen && (
          <div className="wk-huelle">
            <header className="wk-kopf">
              <h2 id={`wk-titel-${name}`} tabIndex={-1} ref={titelRef}>{titel}</h2>
              <button type="button" className="wk-knopf" onClick={() => dialog.current?.close()}>
                <X size={16} aria-hidden="true" /> Schließen
              </button>
            </header>

            {demo && <p className="wk-hilfe">{demo} <a href={DEMO_HREF}>{MAPPE_DEMO}</a></p>}

            {hinweis()}

            {zustand === 'laden' && <p className="wk-hilfe" role="status">Deine Mappe wird geladen …</p>}

            {aelterEntwurf !== null && zustand !== 'laden' && (
              <div className="wk-hinweis" role="alert">
                <p>{TEXT.aelterEntwurf}</p>
                <button type="button" className="wk-knopf wk-primaer" onClick={entwurfUebernehmen}>Entwurf übernehmen</button>
                <button type="button" className="wk-knopf" onClick={entwurfVerwerfen}>Entwurf verwerfen</button>
              </div>
            )}

            {/* Feedback der Lehrenden (NDU-35): erst, wenn die eigene Mappe geladen ist; ohne Feedback nichts. */}
            {inhaltSichtbar && <StudierendenFeedback name={name} />}

            {inhaltSichtbar && (
              <div className="wk-inhalt">
                <fieldset className="wk-formular" disabled={zustand === 'speichert' || aelterEntwurf !== null}>
                  <legend className="wk-nur-leser">{titel} bearbeiten</legend>
                  <Fehlergrenze key={`f${grenzeNr}`} onFehler={() => setAnzeigeKaputt(true)} onVerwerfen={kaputtenEntwurfVerwerfen}>
                    <Ausfuehren was={() => formular(daten, setze, fehlerAm, gespeichert)} />
                  </Fehlergrenze>
                </fieldset>
                <section className="wk-bild" aria-label="Vorschau">
                  <Fehlergrenze key={`b${grenzeNr}`} onFehler={() => setAnzeigeKaputt(true)} onVerwerfen={kaputtenEntwurfVerwerfen}>
                    <Ausfuehren was={() => bild(daten)} />
                  </Fehlergrenze>
                </section>
              </div>
            )}

            {kopierFeld !== null && (
              <div className={kopierFeld.sichtbar ? 'wk-kopiertext' : 'wk-nur-leser'}>
                <label htmlFor={`wk-kopie-${name}`}>Text für Claude</label>
                <textarea id={`wk-kopie-${name}`} ref={kopierRef} readOnly rows={6} value={kopierFeld.text} tabIndex={kopierFeld.sichtbar ? 0 : -1} />
              </div>
            )}

            {inhaltSichtbar && kopie !== null && (
              <details className="wk-was-kopiert">
                <summary>Was kopiert wird</summary>
                <p className="wk-hilfe">
                  {kopie.mitPrompt
                    ? 'Oben der Prüf-Prompt wie unter „Prüfen“ auf der Methodenseite, darunter euer Text. Ohne Connector reicht es, das in ein neues Gespräch mit Claude einzufügen.'
                    : 'Nur euer Text. Zum Prüfen gehört der Prüf-Prompt der Methode davor, sonst schreibt Claude euren Text um, statt ihn zu prüfen.'}
                  {kopie.mitPrompt && vorarbeitLaedt && ' Die weiteren Texte, die der Prompt nennt, werden noch geladen …'}
                  {kopie.mitPrompt && !vorarbeitLaedt && kopie.fehlt.length > 0 && ` Nicht geladen: ${kopie.fehlt.map((n) => ARTEFAKTE[n].titel).join(', ')} – fügt es selbst darunter ein.`}
                </p>
                <pre>{kopie.text}</pre>
              </details>
            )}

            <footer className="wk-fuss">
              <p className="wk-status" aria-live="polite">
                <span>{status}</span>
                {kopieStatus && <span> {kopieStatus}</span>}
              </p>
              {!pruefung.erlaubt && ersteMeldung && daten !== null && (
                <p className="wk-fehler">Speichern ist gesperrt: {ersteMeldung.meldung}</p>
              )}
              <div className="wk-knoepfe">
                {methode !== undefined && promptFrei && (
                  <label className="wk-schalter">
                    <input type="checkbox" checked={mitPrompt} onChange={(e) => mitPromptUmschalten(e.currentTarget.checked)} />
                    Prüf-Prompt mitkopieren
                  </label>
                )}
                <button type="button" className="wk-knopf" onClick={() => void fuerClaudeKopieren()} disabled={daten === null}>
                  <Copy size={16} aria-hidden="true" /> Für Claude kopieren
                </button>
                <button type="button" className="wk-knopf wk-primaer" onClick={() => void speichern()} disabled={!kannSpeichern && zustand !== 'speichert'} aria-busy={zustand === 'speichert'}>
                  <Save size={16} aria-hidden="true" /> {zustand === 'speichert' ? 'Speichert …' : 'Speichern'}
                </button>
              </div>
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
}
