// Editor-Hülle: eine Komponente für alle Artefakte. Laden, Entwurf, Speichern, Konflikt, Fehler, Anmelden.
// Die Zustandsmaschine steht in huelle.ts (rein, getestet); hier laufen nur die Effekte und die Anzeige.
import { Copy, LogIn, Pencil, RefreshCw, Save, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { kopiereText, kopierKuerzel } from '../../lib/kopieren.js';
import { METHODEN } from '../../components/methoden.js';
import { ARTEFAKTE, artefaktParsen, type ArtefaktName, type DatenVon, type Feldfehler } from '../schemas/index.js';
import { ROUTEN } from '../vertrag.js';
import { api, ApiError } from './api.js';
import { entwurfLaden, entwurfLoeschen, entwurfSichern } from './entwurf.js';
import { huelle, speichernErlaubt, statusText, type Ereignis, type HuellenZustand } from './huelle.js';
import '../../styles/werkstatt.css';

export interface EditorHuelleProps<N extends ArtefaktName> {
  name: N;
  titel: string;
  /** Live-Bild rechts. */
  bild: (daten: DatenVon<N>) => ReactNode;
  /** Formular links. `setze` ersetzt die ganzen Daten; `fehler(pfad)` liefert die Meldung zum Feld, zum Beispiel „annahmen.0.id“. */
  formular: (daten: DatenVon<N>, setze: (neu: DatenVon<N>) => void, fehler: (pfad: string) => string | undefined) => ReactNode;
  /** Markdown des Artefakts für „Für Claude kopieren“ (liefert der Renderer der Mappe). */
  alsMarkdown: (daten: DatenVon<N>) => string;
}

const TEXT = {
  abgemeldet: 'Melde dich mit GitHub an, um deine Mappe zu bearbeiten.',
  abgelaufen: 'Deine Sitzung ist abgelaufen. Melde dich neu an – dein Entwurf bleibt erhalten.',
  nichtFreigeschaltet: 'Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.',
  wirdEingerichtet: 'Deine Mappe wird eingerichtet …',
  wirdEingerichtetLang: 'Das dauert länger als gedacht. Versuch es gleich noch einmal.',
  konflikt: 'Inzwischen geändert – neu laden. Dein Entwurf bleibt erhalten.',
  speichernGesichert: 'Speichern gerade nicht möglich. Dein Entwurf ist auf diesem Gerät gesichert.',
  speichernUngesichert: 'Speichern gerade nicht möglich. Dein Entwurf konnte auf diesem Gerät nicht gesichert werden – lass diesen Tab offen.',
  ladenFehlt: 'Deine Mappe lässt sich gerade nicht laden.',
} as const;

const NEUVERSUCHE = 3; // à 3 s: höchstens ~10 s „wird eingerichtet“, dann Knopf
const heute = () => new Date().toLocaleDateString('sv-SE'); // JJJJ-MM-TT in Ortszeit

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
  const [serverFelder, setServerFelder] = useState<Feldfehler[]>([]);
  const [kopierMeldung, setKopierMeldung] = useState('');
  const [kopierText, setKopierText] = useState<string | null>(null);
  const [versuche, setVersuche] = useState(0);

  // Aktueller Stand für asynchrone Abläufe (Zustand in React-State wäre dort veraltet).
  const z = useRef<HuellenZustand>('laden');
  const datenRef = useRef<DatenVon<N> | null>(null);
  const basisSha = useRef<string | null>(null);
  const kohorte = useRef<string | null>(null);
  const lauf = useRef(0); // verwirft Antworten veralteter Ladevorgänge

  const senden = useCallback((e: Ereignis) => {
    const r = huelle(z.current, e);
    z.current = r.zustand;
    setZustand(r.zustand);
    for (const effekt of r.effekte) {
      if (effekt === 'entwurfSichern' && kohorte.current !== null) {
        setGesichert(entwurfSichern(name, kohorte.current, datenRef.current));
      } else if (effekt === 'entwurfLoeschen' && kohorte.current !== null) {
        entwurfLoeschen(name, kohorte.current);
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
    setServerFelder([]);
    try {
      const ich = await api.ich();
      if (!gueltig()) return;
      if (ich === null) return void senden({ typ: 'ladenFehlgeschlagen', status: 401, code: 'nicht-angemeldet' });
      kohorte.current = ich.kohorte;
      if (ich.repo === null) return void senden({ typ: 'ladenFehlgeschlagen', status: 503, code: 'wird-eingerichtet' });
      const antwort = await api.lesen(name);
      if (!gueltig()) return;
      basisSha.current = antwort.basisSha;
      const vomServer = artefaktParsen(name, antwort.daten ?? ARTEFAKTE[name].leer(heute()));
      if (!vomServer.ok) {
        setFehlerCode('datei');
        return void senden({ typ: 'ladenFehlgeschlagen', status: 500, code: 'unbekannt' });
      }
      // Ein Entwurf auf diesem Gerät gewinnt – auch nach „Neu laden“ nach einem Konflikt: Er trägt die eigenen Änderungen.
      const roh = entwurfLaden(name, ich.kohorte);
      const entwurf = roh === null ? null : artefaktParsen(name, roh);
      const ausEntwurf = entwurf?.ok === true;
      const start = (ausEntwurf ? entwurf.daten : vomServer.daten) as DatenVon<N>;
      datenRef.current = start;
      setDatenAnzeige(start);
      setDirty(ausEntwurf);
      setGesichert(true);
      senden({ typ: 'geladen' });
    } catch (err) {
      if (!gueltig()) return;
      const a = err instanceof ApiError ? err : new ApiError(0, 'unbekannt', TEXT.ladenFehlt);
      setFehlerCode(a.code);
      senden({ typ: 'ladenFehlgeschlagen', status: a.status, code: a.code });
    }
  }

  function oeffnen(): void {
    z.current = 'laden';
    setZustand('laden');
    setVersuche(0);
    setAbgelaufen(false);
    setKopierMeldung('');
    setKopierText(null);
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

  useEffect(() => {
    if (kopierText !== null) {
      kopierRef.current?.focus();
      kopierRef.current?.select();
    }
  }, [kopierText]);

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
    if (datenRef.current === null || !speichernErlaubt(name, datenRef.current).erlaubt) return;
    if (senden({ typ: 'speichern' }) !== 'speichert') return;
    try {
      const antwort = await api.speichern(name, { daten: datenRef.current, basisSha: basisSha.current });
      if ('konflikt' in antwort) return void senden({ typ: 'speichernFehlgeschlagen', status: 409, code: 'konflikt' });
      basisSha.current = antwort.basisSha;
      senden({ typ: 'gespeichert' });
    } catch (err) {
      const a = err instanceof ApiError ? err : new ApiError(0, 'unbekannt', TEXT.speichernGesichert);
      if (a.status === 401) setAbgelaufen(true);
      setFehlerCode(a.code);
      if (a.felder) setServerFelder(a.felder);
      senden({ typ: 'speichernFehlgeschlagen', status: a.status, code: a.code });
    }
  }

  async function fuerClaudeKopieren(): Promise<void> {
    if (daten === null) return;
    const slug = ARTEFAKTE[name].slug;
    const pruefliste = METHODEN.find((m) => m.slug === slug)?.pruefliste ?? [];
    const text =
      alsMarkdown(daten).trimEnd() +
      (pruefliste.length ? `\n\n## Prüfliste\n\n${pruefliste.map((p) => `- [ ] ${p}`).join('\n')}\n` : '\n');
    const ergebnis = await kopiereText(text);
    if (ergebnis === 'kopiert') {
      setKopierText(null);
      setKopierMeldung('Kopiert');
    } else {
      // Zwischenablage gesperrt: Text sichtbar machen und markieren, damit man selbst kopieren kann.
      setKopierText(text);
      setKopierMeldung(`Markiert – mit ${kopierKuerzel(navigator.platform)} kopieren`);
    }
  }

  const loginHref = `${ROUTEN.login.pfad}?weiter=${encodeURIComponent(typeof location === 'undefined' ? '/' : location.pathname)}`;
  const status = statusText(zustand, dirty);
  const kannSpeichern = daten !== null && pruefung.erlaubt && (zustand === 'bereit' || zustand === 'gespeichert' || zustand === 'fehler');
  const ersteMeldung = pruefung.fehler[0];

  function hinweis(): ReactNode {
    if (zustand === 'abgemeldet') {
      return (
        <div className="wk-hinweis" role="alert">
          <p>{abgelaufen ? TEXT.abgelaufen : TEXT.abgemeldet}</p>
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
    if (zustand === 'fehler') {
      const frei = fehlerCode === 'nicht-freigeschaltet';
      const text =
        frei ? TEXT.nichtFreigeschaltet
        : fehlerCode === 'datei' ? 'Die Datei in deiner Mappe passt nicht zum erwarteten Format. Sag Markus Bescheid.'
        : daten === null ? TEXT.ladenFehlt
        : gesichert ? TEXT.speichernGesichert
        : TEXT.speichernUngesichert;
      return (
        <div className="wk-hinweis" role="alert">
          <p>{text}</p>
          {!frei && fehlerCode !== 'datei' && daten === null && (
            <button type="button" className="wk-knopf" onClick={() => senden({ typ: 'neuLaden' })}>
              <RefreshCw size={16} aria-hidden="true" /> Neu versuchen
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div data-werkstatt className="wk-wurzel">
      <button type="button" className="wk-knopf wk-primaer" onClick={oeffnen}>
        <Pencil size={16} aria-hidden="true" /> Bearbeiten
      </button>
      <dialog ref={dialog} data-werkstatt className="wk-dialog" aria-labelledby={`wk-titel-${name}`} onClose={() => setOffen(false)}>
        {offen && (
          <div className="wk-huelle">
            <header className="wk-kopf">
              <h2 id={`wk-titel-${name}`} tabIndex={-1} ref={titelRef}>{titel}</h2>
              <button type="button" className="wk-knopf" onClick={() => dialog.current?.close()}>
                <X size={16} aria-hidden="true" /> Schließen
              </button>
            </header>

            {hinweis()}

            {zustand === 'laden' && <p className="wk-hilfe" role="status">Deine Mappe wird geladen …</p>}

            {daten !== null && zustand !== 'laden' && zustand !== 'abgemeldet' && zustand !== 'wird-eingerichtet' && (
              <div className="wk-inhalt">
                <fieldset className="wk-formular" disabled={zustand === 'speichert'}>
                  <legend className="wk-nur-leser">{titel} bearbeiten</legend>
                  {formular(daten, setze, fehlerAm)}
                </fieldset>
                <section className="wk-bild" aria-label="Vorschau">{bild(daten)}</section>
              </div>
            )}

            {kopierText !== null && (
              <div className="wk-kopiertext">
                <label htmlFor={`wk-kopie-${name}`}>Text für Claude</label>
                <textarea id={`wk-kopie-${name}`} ref={kopierRef} readOnly rows={6} value={kopierText} />
              </div>
            )}

            <footer className="wk-fuss">
              <p className="wk-status" aria-live="polite">
                <span>{status}</span>
                {kopierMeldung && <span> {kopierMeldung}</span>}
              </p>
              {!pruefung.erlaubt && ersteMeldung && daten !== null && (
                <p className="wk-fehler">Speichern ist gesperrt: {ersteMeldung.meldung}</p>
              )}
              <div className="wk-knoepfe">
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
