// Feedback (NDU-35): Fäden aus Feedback der Lehrenden und Antworten der Studierenden. Lehrende schreiben im Leser der
// Lehrenden-Ansicht (LehrendenFeedback), Studierende sehen es im Editor (StudierendenFeedback), antworten kurz oder
// setzen „erledigt“. Beides trägt data-werkstatt: Im Beamer-Modus ist es weg (beamer.css). Nur React-Text, nie HTML.
import { Check, CircleCheck, CircleDot, MessageSquare, MessageSquareReply, RotateCcw, Send } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { namenHinweis } from '../eigennamen.js';
import { ANTWORT_MAX, FEEDBACK_MAX, faeden, type FeedbackEintrag, type FeedbackFaden } from '../feedback.js';
import type { ArtefaktName } from '../schemas/index.js';
import { graphemAnzahl } from '../text.js';
import { api, ApiError } from './api.js';
import { bezugText, feedbackDatum, neueIds, zeilenAuswahl } from './feedback-hilfen.js';

const TEXT = {
  fehltLehrende: 'Das Feedback lässt sich gerade nicht lesen. Schreiben geht erst wieder, wenn es lesbar ist.',
  fehlt: 'Das Feedback lässt sich gerade nicht laden.',
  speichernFehlt: 'Das hat nicht geklappt. Bitte gleich noch einmal.',
  keinsLehrende: 'Noch kein Feedback zu diesem Artefakt.',
} as const;

const fehlerText = (e: unknown) => (e instanceof ApiError && e.message) || TEXT.speichernFehlt;

// Ein Textfeld mit Zähler und dem Namenshinweis aus eigennamen.ts (nur ein Hinweis, gespeichert wird trotzdem).
function Textfeld({ label, wert, setze, max, zeilen }: { label: string; wert: string; setze: (s: string) => void; max: number; zeilen: number }) {
  const id = useId();
  const hinweis = namenHinweis(wert);
  const zuLang = graphemAnzahl(wert.trim()) > max;
  return (
    <div className="wk-feld">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} rows={zeilen} value={wert} onChange={(e) => setze(e.target.value)} aria-invalid={zuLang || undefined} aria-describedby={`${id}-z`} />
      <span id={`${id}-z`} className={zuLang ? 'wk-fehler' : 'wk-hilfe'}>{graphemAnzahl(wert.trim())}/{max}</span>
      {hinweis && <p className="wk-feldhinweis" role="status">{hinweis}</p>}
    </div>
  );
}

function Eintrag({ e, neu }: { e: FeedbackEintrag; neu?: boolean }) {
  return (
    <>
      <p className="fb-meta">
        <strong>{e.autor}</strong> <span>{bezugText(e)}</span> <span className="wk-hilfe">{feedbackDatum(e.datum)}</span>
        {neu && <span className="fb-neu">neu</span>}
      </p>
      <p className="fb-text">{e.text}</p>
    </>
  );
}

function Stand({ f }: { f: FeedbackEintrag }) {
  return f.erledigt
    ? <span className="fb-stand fb-erledigt"><CircleCheck size={14} aria-hidden="true" /> erledigt</span>
    : <span className="fb-stand fb-offen"><CircleDot size={14} aria-hidden="true" /> offen</span>;
}

function Antworten({ liste }: { liste: FeedbackEintrag[] }) {
  if (liste.length === 0) return null;
  return (
    <ul className="fb-antworten">
      {liste.map((a) => (
        <li key={a.id}>
          <p className="fb-meta"><MessageSquareReply size={14} aria-hidden="true" /> <strong>{a.autor}</strong> <span className="wk-hilfe">{feedbackDatum(a.datum)}</span></p>
          <p className="fb-text">{a.text}</p>
        </li>
      ))}
    </ul>
  );
}

// --- Lehrende ---------------------------------------------------------------------------------------------------------

/** Im Leser: alles Feedback zu diesem Artefakt und das Feld zum Schreiben (zum ganzen Artefakt oder zu einer Zeile).
 *  Zeilen kommen aus einer Auswahl neben dem Feld (zeilenAuswahl), nicht aus Knöpfen in der Vorschau: Die Vorschau ist
 *  dieselbe wie im Editor der Studierenden und bleibt unverändert. */
export function LehrendenFeedback({ kohorte, person, name, daten, eintraege, geschrieben }: {
  kohorte: string; person: string; name: ArtefaktName; daten: unknown; eintraege: FeedbackEintrag[] | null;
  geschrieben: (neu: FeedbackEintrag[]) => void;
}) {
  const [text, setText] = useState('');
  const [zeile, setZeile] = useState('');
  const [sendet, setSendet] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const zeilen = useMemo(() => zeilenAuswahl(name, daten), [name, daten]);
  const liste = eintraege ? faeden(eintraege, name) : [];
  const auswahlId = useId();
  const leer = text.trim() === '' || graphemAnzahl(text.trim()) > FEEDBACK_MAX;

  async function senden() {
    if (leer || sendet) return;
    setSendet(true);
    setMeldung(null);
    try {
      const r = await api.lehrendeFeedback(kohorte, person, { artefakt: name, ...(zeile ? { zeilenId: zeile } : {}), text });
      geschrieben(r.eintraege);
      setText('');
      setZeile('');
      setMeldung('Gespeichert. Die Person sieht es beim nächsten Öffnen als „neu“.');
    } catch (e) {
      setMeldung(fehlerText(e));
    } finally {
      setSendet(false);
    }
  }

  return (
    <section className="fb" data-werkstatt aria-labelledby={`${auswahlId}-t`}>
      <h3 id={`${auswahlId}-t`}><MessageSquare size={16} aria-hidden="true" /> Feedback</h3>
      {eintraege === null && <p className="wk-hinweis" role="alert">{TEXT.fehltLehrende}</p>}
      {eintraege !== null && liste.length === 0 && <p className="wk-hilfe">{TEXT.keinsLehrende}</p>}
      {liste.length > 0 && (
        <ul className="fb-liste">
          {liste.map(({ feedback: f, antworten }) => (
            <li key={f.id} className="fb-faden">
              <Eintrag e={f} />
              <p className="fb-zeile"><Stand f={f} /> <span className="wk-hilfe">{f.gesehen ? 'geöffnet' : 'noch nicht geöffnet'}</span></p>
              <Antworten liste={antworten} />
            </li>
          ))}
        </ul>
      )}
      {eintraege !== null && (
        <form className="fb-form" onSubmit={(e) => { e.preventDefault(); void senden(); }}>
          <div className="wk-feld">
            <label htmlFor={auswahlId}>Bezug</label>
            <select id={auswahlId} value={zeile} onChange={(e) => setZeile(e.target.value)}>
              <option value="">Zum ganzen Artefakt</option>
              {zeilen.map((z) => <option key={z.wert} value={z.wert}>zu dieser Zeile: {z.text}</option>)}
            </select>
          </div>
          <Textfeld label="Feedback" wert={text} setze={setText} max={FEEDBACK_MAX} zeilen={4} />
          <p className="wk-hilfe">Nur Feedback, keine Note; das Artefakt selbst bleibt, wie es ist.</p>
          <div className="fb-knoepfe">
            <button type="submit" className="wk-knopf wk-primaer" disabled={leer || sendet} aria-busy={sendet}>
              <Send size={16} aria-hidden="true" /> {sendet ? 'Speichert …' : 'Feedback speichern'}
            </button>
            {meldung && <span className="wk-status" role="status">{meldung}</span>}
          </div>
        </form>
      )}
    </section>
  );
}

// --- Studierende ------------------------------------------------------------------------------------------------------

function Faden({ faden, neu, aendern }: { faden: FeedbackFaden; neu: boolean; aendern: (a: Parameters<typeof api.feedbackAendern>[0]) => Promise<boolean> }) {
  const { feedback: f, antworten } = faden;
  const [offen, setOffen] = useState(false);
  const [text, setText] = useState('');
  const [sendet, setSendet] = useState(false);
  const leer = text.trim() === '' || graphemAnzahl(text.trim()) > ANTWORT_MAX;

  async function antworten_() {
    if (leer || sendet) return;
    setSendet(true);
    if (await aendern({ aktion: 'antworten', antwortAuf: f.id, text })) {
      setText('');
      setOffen(false);
    }
    setSendet(false);
  }

  return (
    <li className={neu ? 'fb-faden fb-faden-neu' : 'fb-faden'}>
      <Eintrag e={f} neu={neu} />
      <Antworten liste={antworten} />
      <div className="fb-knoepfe">
        <Stand f={f} />
        <button type="button" className="wk-knopf" disabled={sendet} onClick={() => void aendern({ aktion: 'erledigt', id: f.id, erledigt: !f.erledigt })}>
          {f.erledigt ? <><RotateCcw size={16} aria-hidden="true" /> Wieder öffnen</> : <><Check size={16} aria-hidden="true" /> Erledigt</>}
        </button>
        {!offen && (
          <button type="button" className="wk-knopf" onClick={() => setOffen(true)}>
            <MessageSquareReply size={16} aria-hidden="true" /> Antworten
          </button>
        )}
      </div>
      {offen && (
        <form className="fb-form" onSubmit={(e) => { e.preventDefault(); void antworten_(); }}>
          <Textfeld label="Kurze Antwort" wert={text} setze={setText} max={ANTWORT_MAX} zeilen={2} />
          <div className="fb-knoepfe">
            <button type="submit" className="wk-knopf wk-primaer" disabled={leer || sendet} aria-busy={sendet}><Send size={16} aria-hidden="true" /> Antwort speichern</button>
            <button type="button" className="wk-knopf" onClick={() => { setOffen(false); setText(''); }}>Abbrechen</button>
          </div>
        </form>
      )}
    </li>
  );
}

/** Im Editor über dem Formular: Feedback der Lehrenden zu diesem Artefakt. Was beim Öffnen noch nicht gesehen war, steht
 *  als „neu“ da, solange der Editor offen ist; der Server merkt sich gleich, dass es geöffnet wurde. Kein Feedback: nichts. */
export function StudierendenFeedback({ name }: { name: ArtefaktName }) {
  const [eintraege, setEintraege] = useState<FeedbackEintrag[] | null>(null);
  const [neu, setNeu] = useState<Set<string>>(new Set());
  const [meldung, setMeldung] = useState<string | null>(null);
  const titelId = useId();

  useEffect(() => {
    let gilt = true;
    api.feedback().then(
      (r) => {
        if (!gilt) return;
        const n = neueIds(r.eintraege, name);
        setEintraege(r.eintraege);
        setNeu(n);
        // Nach bestem Bemühen: scheitert es, ist es beim nächsten Öffnen eben noch einmal „neu“.
        if (n.size > 0) api.feedbackAendern({ aktion: 'gesehen', artefakt: name }).then((x) => { if (gilt) setEintraege(x.eintraege); }, () => {});
      },
      () => { if (gilt) setMeldung(TEXT.fehlt); },
    );
    return () => { gilt = false; };
  }, [name]);

  async function aendern(a: Parameters<typeof api.feedbackAendern>[0]): Promise<boolean> {
    setMeldung(null);
    try {
      setEintraege((await api.feedbackAendern(a)).eintraege);
      return true;
    } catch (e) {
      setMeldung(fehlerText(e));
      return false;
    }
  }

  const liste = eintraege ? faeden(eintraege, name) : [];
  if (liste.length === 0 && !meldung) return null;
  return (
    <section className="fb fb-editor" data-werkstatt aria-labelledby={titelId}>
      <h3 id={titelId}><MessageSquare size={16} aria-hidden="true" /> Feedback deiner Lehrenden{neu.size > 0 && <span className="fb-neu">{neu.size} neu</span>}</h3>
      {meldung && <p className="wk-status" role="status">{meldung}</p>}
      {liste.length > 0 && (
        <ul className="fb-liste">
          {liste.map((x) => <Faden key={x.feedback.id} faden={x} neu={neu.has(x.feedback.id)} aendern={aendern} />)}
        </ul>
      )}
    </section>
  );
}
