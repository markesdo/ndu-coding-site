// /innolab/mappe: alle Artefakte der Person mit Stand (vorhanden/offen) und „Bearbeiten“, Rücksprünge der Anmeldung
// (?fehler=…), Abmelden. Lehrende sehen vorerst nur einen Hinweis (Phase 2).
import { CircleCheck, CircleDashed, ExternalLink, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { kohorte } from '../kohorten/index.js';
import type { Ich, MappeStand } from '../vertrag.js';
import { api, ApiError } from './api.js';
import { EDITOREN } from './editoren/index.js';
import { LEITFADEN_LINK, LEITFADEN_SPAETER, LOGIN_HREF, adresseOhneFehler, anmeldeFehler, beimOeffnenLaden, leitfadenFrei, mappeZeilen } from './mappe-hilfen.js';
import '../../styles/werkstatt.css';

const TEXT = {
  abgemeldet: 'Melde dich mit GitHub an, um deine Mappe zu bearbeiten.',
  nichtFreigeschaltet: 'Du bist für keinen Kurs freigeschaltet. Schreib Markus deinen GitHub-Namen.',
  wirdEingerichtet: 'Deine Mappe wird eingerichtet …',
  wirdEingerichtetLang: 'Das dauert länger als gedacht. Versuch es gleich noch einmal.',
  ladenFehlt: 'Deine Mappe lässt sich gerade nicht laden.',
  lehrende: 'Die Ansicht für Lehrende kommt mit Tag 2.',
  abmeldenFehlt: 'Abmelden hat nicht geklappt. Deine Entwürfe auf diesem Gerät sind trotzdem gelöscht.',
} as const;

const NEUVERSUCHE = 3; // à 3 s: höchstens ~10 s „wird eingerichtet“, dann Knopf (Spec §5)

type Zustand =
  | { typ: 'laden' }
  | { typ: 'abgemeldet' }
  | { typ: 'einrichten' }
  | { typ: 'fehler'; text: string; nochmal: boolean }
  | { typ: 'lehrende'; ich: Ich }
  | { typ: 'bereit'; ich: Ich; stand: MappeStand };

export default function MappeUebersicht() {
  const [zustand, setZustand] = useState<Zustand>({ typ: 'laden' });
  const [versuche, setVersuche] = useState(0);
  const [meldung, setMeldung] = useState('');
  const [rueckmeldung, setRueckmeldung] = useState(() => anmeldeFehler(location.search));
  // Einmal beim Öffnen festgelegt: Leert ein geglücktes Laden die Meldung, lädt die Seite nicht noch einmal.
  const startLaden = useRef(beimOeffnenLaden(rueckmeldung));
  // Leitfaden erst nach dem Mom Test (wie die Auflösungen der Interview-Seite); jede Minute nachsehen.
  const frei = () => leitfadenFrei(new Date(), document.documentElement.hasAttribute('data-ist-praesentator'));
  const [leitfadenOffen, setLeitfadenOffen] = useState(frei);
  const liste = useRef<HTMLUListElement>(null);
  const lauf = useRef(0);

  // Angemeldet und geladen: eine alte Meldung aus ?fehler gilt nicht mehr, auch nicht nach dem Neuladen der Seite.
  function meldungErledigt(): void {
    setRueckmeldung(null);
    if (new URLSearchParams(location.search).has('fehler')) history.replaceState(history.state, '', adresseOhneFehler(location.pathname, location.search, location.hash));
  }

  const laden = useCallback(async (still = false) => {
    const mein = ++lauf.current;
    if (!still) setZustand({ typ: 'laden' });
    try {
      const ich = await api.ich();
      if (mein !== lauf.current) return;
      if (ich === null) return setZustand({ typ: 'abgemeldet' });
      if (ich.rolle !== 'studierende') {
        setZustand({ typ: 'lehrende', ich });
        return meldungErledigt();
      }
      const stand = await api.mappe(); // legt die Mappe an, falls sie noch fehlt
      if (mein !== lauf.current) return;
      setVersuche(0);
      setZustand({ typ: 'bereit', ich, stand });
      meldungErledigt();
    } catch (e) {
      if (mein !== lauf.current) return;
      const a = e instanceof ApiError ? e : new ApiError(0, 'unbekannt', TEXT.ladenFehlt);
      if (a.code === 'nicht-angemeldet') return setZustand({ typ: 'abgemeldet' });
      if (a.code === 'wird-eingerichtet') return setZustand({ typ: 'einrichten' });
      if (a.code === 'nicht-freigeschaltet') return setZustand({ typ: 'fehler', text: a.message || TEXT.nichtFreigeschaltet, nochmal: false });
      setZustand({ typ: 'fehler', text: a.message || TEXT.ladenFehlt, nochmal: true });
    }
  }, []);

  useEffect(() => {
    if (startLaden.current) void laden();
  }, [laden]);

  useEffect(() => {
    if (leitfadenOffen) return;
    const uhr = setInterval(() => { if (frei()) setLeitfadenOffen(true); }, 60_000);
    return () => clearInterval(uhr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leitfadenOffen]);

  // „Wird eingerichtet“: alle 3 s neu versuchen, nach ~10 s gibt der Knopf das Heft zurück.
  useEffect(() => {
    if (zustand.typ !== 'einrichten' || versuche >= NEUVERSUCHE) return;
    const t = setTimeout(() => {
      setVersuche((v) => v + 1);
      void laden(true);
    }, 3000);
    return () => clearTimeout(t);
  }, [zustand, versuche, laden]);

  // Nach dem Schließen eines Editors den Stand neu holen („close“ steigt nicht auf, darum in der Capture-Phase).
  useEffect(() => {
    const l = liste.current;
    if (!l) return;
    const neu = () => void standNeu();
    l.addEventListener('close', neu, true);
    return () => l.removeEventListener('close', neu, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zustand.typ, laden]);

  // Nur der Stand der Mappe; die Person (ich) bleibt. Scheitert es, übernimmt das volle Laden die Fehleranzeige.
  async function standNeu(): Promise<void> {
    const mein = ++lauf.current;
    try {
      const stand = await api.mappe();
      if (mein !== lauf.current) return;
      setZustand((z) => (z.typ === 'bereit' ? { ...z, stand } : z));
    } catch {
      if (mein === lauf.current) void laden(true);
    }
  }

  async function abmelden(): Promise<void> {
    setMeldung('');
    try {
      await api.abmelden(); // löscht auch die Entwürfe auf diesem Gerät
    } catch {
      setMeldung(TEXT.abmeldenFehlt);
    }
    void laden();
  }

  const anmelden = (
    <a className="wk-knopf wk-primaer" href={LOGIN_HREF}><LogIn size={16} aria-hidden="true" /> Mit GitHub anmelden</a>
  );

  function inhalt() {
    switch (zustand.typ) {
      case 'laden':
        return <p className="wk-hilfe" role="status">Deine Mappe wird geladen …</p>;
      case 'abgemeldet':
        return (
          <div className="wk-hinweis mappe-hinweis">
            <p>{TEXT.abgemeldet}</p>
            {anmelden}
          </div>
        );
      case 'einrichten':
        return (
          <div className="wk-hinweis mappe-hinweis" role="status">
            <p>{versuche >= NEUVERSUCHE ? TEXT.wirdEingerichtetLang : TEXT.wirdEingerichtet}</p>
            {versuche >= NEUVERSUCHE && (
              <button type="button" className="wk-knopf" onClick={() => { setVersuche(0); void laden(); }}>
                <RefreshCw size={16} aria-hidden="true" /> Neu versuchen
              </button>
            )}
          </div>
        );
      case 'fehler':
        return (
          <div className="wk-hinweis mappe-hinweis" role="alert">
            <p>{zustand.text}</p>
            {zustand.nochmal && (
              <button type="button" className="wk-knopf" onClick={() => void laden()}>
                <RefreshCw size={16} aria-hidden="true" /> Neu versuchen
              </button>
            )}
          </div>
        );
      case 'lehrende':
        return <p className="mappe-person">Angemeldet als <strong>{zustand.ich.login}</strong> (Lehrende). {TEXT.lehrende}</p>;
      case 'bereit': {
        const org = kohorte(zustand.stand.kohorte)?.org;
        return (
          <>
            <p className="mappe-person">
              Angemeldet als <strong>{zustand.ich.login}</strong>.
              {org && zustand.stand.repo && (
                <> Deine Mappe liegt in <a href={`https://github.com/${org}/${zustand.stand.repo}`}>{zustand.stand.repo}<ExternalLink size={14} aria-label="auf GitHub" style={{ marginLeft: '.2em', verticalAlign: '-.1em' }} /></a>.</>
              )}
            </p>
            <ul className="mappe-liste" ref={liste}>
              {mappeZeilen(zustand.stand).map((z) => {
                const Editor = EDITOREN[z.name];
                return (
                  <li key={z.name} className="mappe-zeile">
                    <div className="mappe-titel">
                      <strong><a href={z.href}>{z.titel}</a></strong>
                      <span className={z.vorhanden ? 'mappe-stand mappe-vorhanden' : 'mappe-stand'}>
                        {z.vorhanden ? <CircleCheck size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}
                        {z.vorhanden ? 'vorhanden' : 'offen'}
                      </span>
                    </div>
                    {z.name === 'leitfaden' && !leitfadenOffen
                      ? <span className="wk-hilfe">{LEITFADEN_SPAETER} <a href={LEITFADEN_LINK}>Zur Interview-Seite</a></span>
                      : <Editor />}
                  </li>
                );
              })}
            </ul>
          </>
        );
      }
    }
  }

  const angemeldet = zustand.typ === 'bereit' || zustand.typ === 'lehrende' || zustand.typ === 'einrichten';
  return (
    <div className="wk-wurzel mappe">
      {rueckmeldung && (
        <div className="wk-hinweis mappe-hinweis" role="alert">
          <p>{rueckmeldung.text}</p>
          {/* Nicht freigeschaltet lädt die Seite nichts: Ist man inzwischen eingetragen, geht es hier weiter. */}
          {!rueckmeldung.neuAnmelden && anmelden}
        </div>
      )}
      {(rueckmeldung === null || rueckmeldung.neuAnmelden) && inhalt()}
      {angemeldet && (
        <p>
          <button type="button" className="wk-knopf" onClick={() => void abmelden()}>
            <LogOut size={16} aria-hidden="true" /> Abmelden
          </button>
          <span className="wk-hilfe mappe-abmelden-hilfe"> Löscht auch deine Entwürfe auf diesem Gerät.</span>
        </p>
      )}
      <p className="wk-status" aria-live="polite">{meldung}</p>
    </div>
  );
}
