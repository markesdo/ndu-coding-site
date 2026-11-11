// Feedback (NDU-35): Fäden aus Feedback der Lehrenden und Antworten der Studierenden. Lehrende schreiben im Leser der
// Lehrenden-Ansicht (LehrendenFeedback), Studierende sehen es im Editor (StudierendenFeedback), antworten kurz oder
// setzen „erledigt“. Beides trägt data-werkstatt: Im Beamer-Modus ist es weg (beamer.css). Nur React-Text, nie HTML.
// NDU-41: Lehrende wählen optional ein Kriterium aus dem Katalog (nur die, die zu Artefakt und Abschnitt passen); am
// Feedback steht es als Etikett, aufklappbar das Kaffeebar-Paar.
// NDU-42: An Outcome/Problem im Brief, einer Annahme oder Leitfaden-Frage können Lehrende eine „mögliche Fassung“ für den
// Fall der Person hinterlegen. Die Person sieht sie erst, wenn der Server sie freigibt (Zeile selbst überarbeitet oder
// geantwortet); vorher kommt nur { zu: true } an, nie der Text. Kein Kopierknopf, kein Übernehmen, kein Diff.
import { Check, ChevronRight, CircleCheck, CircleDot, Coffee, ExternalLink, Lock, LockOpen, MessageSquare, MessageSquareReply, RotateCcw, Send, Tag } from 'lucide-react';
import { useEffect, useId, useMemo, useState } from 'react';
import { namenHinweis } from '../eigennamen.js';
import { ANTWORT_MAX, FASSUNG_MAX, FEEDBACK_MAX, faeden, fassungErlaubt, offeneFassung, zeilenAuswahl, type FeedbackFaden } from '../feedback.js';
import { kriterienFuer, kriteriumBehalten, kriterium as kriteriumAusKatalog, type Fassung, type Kriterium } from '../kriterien.js';
import type { ArtefaktName } from '../schemas/index.js';
import { graphemAnzahl } from '../text.js';
import { api, ApiError } from './api.js';
import type { FassungSicht, FeedbackSichtEintrag } from '../vertrag.js';
import { bezugText, einzeln, fassungStandText, fassungStuecke, feedbackAenderungen, feedbackDatum, geordnet, neueIds } from './feedback-hilfen.js';

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

function FassungZeile({ titel, f }: { titel: string; f: Fassung }) {
  return (
    <>
      <dt>{titel}</dt>
      <dd>
        „{f.text}“{f.zusatz && <> · {f.zusatz}</>}
        {f.formuliert && <span className="wk-hilfe"> (für den Katalog formuliert)</span>}
      </dd>
    </>
  );
}

/** Kaffeebar-Paar eines Kriteriums zum Aufklappen: schwächer, stärker, warum, Quelle. Die Links öffnen einen neuen Tab,
 *  damit Editor und Entwurf offen bleiben. Der Pfeil zeigt auf/zu (summary mit flex verliert das Dreieck). */
function KaffeebarPaar({ k }: { k: Kriterium }) {
  return (
    <details className="fb-paar">
      <summary><ChevronRight size={14} className="fb-paar-pfeil" aria-hidden="true" /><Coffee size={14} aria-hidden="true" /> Am Beispiel Kaffeebar: schwächer und stärker</summary>
      <dl>
        <FassungZeile titel="Schwächer" f={k.paar.schwach} />
        <FassungZeile titel="Stärker" f={k.paar.stark} />
        <dt>Warum stärker</dt>
        <dd>{k.paar.warum}</dd>
        <dt>Quelle</dt>
        <dd>
          <ul className="fb-quelle">
            {k.quelle.seiten.map((l) => (
              <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer">{l.titel}<ExternalLink size={12} aria-label="öffnet in einem neuen Tab" /></a></li>
            ))}
          </ul>
          {k.quelle.buch}
          {k.quelle.kursregel && <span className="fb-kursregel">Kursregel: {k.quelle.kursregel}</span>}
        </dd>
      </dl>
    </details>
  );
}

/** Etikett und Paar am Feedback. Eine ID, die es im Katalog nicht (mehr) gibt, zeigt nichts. */
function KriteriumAnzeige({ id }: { id: string | undefined }) {
  const k = id === undefined ? undefined : kriteriumAusKatalog(id);
  if (!k) return null;
  return (
    <div className="fb-kriterium">
      <span className="fb-etikett"><Tag size={14} aria-hidden="true" /> Kriterium: {k.name}</span>
      <KaffeebarPaar k={k} />
    </div>
  );
}

// Text der Fassung mit hervorgehobenen Lücken („[Zahl aus deinen Interviews]“).
function FassungText({ text }: { text: string }) {
  return (
    <p className="fb-fassung-text">
      {fassungStuecke(text).map((x, i) => (x.luecke ? <mark key={i} className="fb-luecke">{x.text}</mark> : <span key={i}>{x.text}</span>))}
    </p>
  );
}

const FASSUNG_UNLESBAR = 'Diese Fassung lässt sich nicht mehr lesen.';

/** Mögliche Fassung am Feedback (NDU-42). Studierende: zu nur ein Satz (der Text ist nie im Browser), offen ein Kasten.
 *  Lehrende: immer der Text und der Stand (zu, frei, aufgedeckt am …). */
function FassungAnzeige({ f, lehrende }: { f: FassungSicht; lehrende: boolean }) {
  if (lehrende) {
    return (
      <div className="fb-fassung fb-fassung-lehrende">
        <p className="fb-fassung-titel">Mögliche Fassung</p>
        {f.text !== undefined ? <FassungText text={f.text} /> : <p className="wk-hilfe">{FASSUNG_UNLESBAR}</p>}
        <p className="fb-fassung-stand wk-hilfe">{f.zu ? <Lock size={14} aria-hidden="true" /> : <LockOpen size={14} aria-hidden="true" />} {fassungStandText(f)}</p>
      </div>
    );
  }
  if (f.zu) return <p className="fb-fassung-zu"><Lock size={14} aria-hidden="true" /> Überarbeite zuerst selbst – danach siehst du hier eine mögliche Fassung.</p>;
  return (
    <div className="fb-fassung" role="note">
      <p className="fb-fassung-titel"><LockOpen size={14} aria-hidden="true" /> Eine mögliche Fassung, nicht die richtige</p>
      {f.text !== undefined ? <FassungText text={f.text} /> : <p className="wk-hilfe">{FASSUNG_UNLESBAR}</p>}
    </div>
  );
}

function Eintrag({ e, neu, lehrende = false }: { e: FeedbackSichtEintrag; neu?: boolean; lehrende?: boolean }) {
  return (
    <>
      <p className="fb-meta">
        <strong>{e.autor}</strong> <span>{bezugText(e)}</span> <span className="wk-hilfe">{feedbackDatum(e.datum)}</span>
        {neu && <span className="fb-neu">neu</span>}
      </p>
      <p className="fb-text">{e.text}</p>
      <KriteriumAnzeige id={e.kriterium} />
      {e.fassung && <FassungAnzeige f={e.fassung} lehrende={lehrende} />}
    </>
  );
}

function Stand({ f }: { f: FeedbackSichtEintrag }) {
  return f.erledigt
    ? <span className="fb-stand fb-erledigt"><CircleCheck size={14} aria-hidden="true" /> erledigt</span>
    : <span className="fb-stand fb-offen"><CircleDot size={14} aria-hidden="true" /> offen</span>;
}

function Antworten({ liste }: { liste: FeedbackSichtEintrag[] }) {
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
  kohorte: string; person: string; name: ArtefaktName; daten: unknown; eintraege: FeedbackSichtEintrag[] | null;
  geschrieben: (neu: FeedbackSichtEintrag[]) => void;
}) {
  const [text, setText] = useState('');
  const [fassung, setFassung] = useState('');
  const [zeile, setZeile] = useState('');
  const [krit, setKrit] = useState('');
  const [sendet, setSendet] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const zeilen = useMemo(() => zeilenAuswahl(name, daten), [name, daten]);
  // Nur Kriterien, die zu Artefakt und gewähltem Abschnitt passen. Beim Wechsel der Zeile fällt ein Kriterium weg, das
  // nicht mehr passt (kriteriumBehalten) – es kommt auch beim Zurückwechseln nicht wieder (der Server lehnte es ab).
  const kriterien = useMemo(() => kriterienFuer(name, zeile || undefined), [name, zeile]);
  const gewaehlt = kriterien.find((k) => k.id === krit);
  const liste = eintraege ? faeden(eintraege, name) : [];
  const auswahlId = useId();
  const kriteriumId = useId();
  // Mögliche Fassung (NDU-42): nur an erlaubten Zeilen und solange zu diesem Artefakt keine offene da ist (der Server
  // prüft beides noch einmal). Text an einer anderen Zeile bleibt im Feld, geht aber nicht mit.
  const fassungOrt = fassungErlaubt(name, zeile || undefined);
  const schonOffen = eintraege ? offeneFassung(eintraege, name) : undefined;
  const fassungMit = fassungOrt && !schonOffen && fassung.trim() !== '';
  const fassungId = useId();
  const leer = text.trim() === '' || graphemAnzahl(text.trim()) > FEEDBACK_MAX || (fassungMit && graphemAnzahl(fassung.replace(/\s+/g, ' ').trim()) > FASSUNG_MAX);

  async function senden() {
    if (leer || sendet) return;
    setSendet(true);
    setMeldung(null);
    try {
      const r = await api.lehrendeFeedback(kohorte, person, { artefakt: name, ...(zeile ? { zeilenId: zeile } : {}), ...(gewaehlt ? { kriterium: gewaehlt.id } : {}), text, ...(fassungMit ? { fassung } : {}) });
      geschrieben(r.eintraege);
      setText('');
      setFassung('');
      setZeile('');
      setKrit('');
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
              <Eintrag e={f} lehrende />
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
            <select id={auswahlId} value={zeile} onChange={(e) => {
              const z = e.target.value;
              setZeile(z);
              setKrit((alt) => kriteriumBehalten(name, z || undefined, alt));
            }}>
              <option value="">Zum ganzen Artefakt</option>
              {zeilen.map((z) => <option key={z.wert} value={z.wert}>zu dieser Zeile: {z.text}</option>)}
            </select>
          </div>
          {kriterien.length > 0 && (
            <div className="wk-feld">
              <label htmlFor={kriteriumId}>Kriterium (optional)</label>
              <select id={kriteriumId} value={gewaehlt ? gewaehlt.id : ''} onChange={(e) => setKrit(e.target.value)} aria-describedby={`${kriteriumId}-h`}>
                <option value="">Ohne Kriterium</option>
                {kriterien.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <span id={`${kriteriumId}-h`} className="wk-hilfe">Die Person sieht dazu das Kaffeebar-Paar, keine Fassung für ihren Fall.</span>
              {gewaehlt && <KaffeebarPaar k={gewaehlt} />}
            </div>
          )}
          <Textfeld label="Feedback" wert={text} setze={setText} max={FEEDBACK_MAX} zeilen={4} />
          {fassungOrt && (schonOffen
            ? <p className="wk-hilfe" id={fassungId}><Lock size={14} aria-hidden="true" /> Zu diesem Artefakt gibt es schon eine offene mögliche Fassung ({schonOffen.id}). Eine neue geht erst, wenn sie erledigt ist.</p>
            : (
              <div className="fb-fassung-feld">
                <Textfeld label="Mögliche Fassung (optional, erst sichtbar nach Überarbeitung)" wert={fassung} setze={setFassung} max={FASSUNG_MAX} zeilen={2} />
                <p className="wk-hilfe">Eine Zeile, Form statt Inhalt. Wo du Fakten raten müsstest, setz eine Lücke wie [Zahl aus deinen Interviews]. Die Person sieht sie erst, wenn sie die Zeile selbst überarbeitet oder geantwortet hat; Claude bekommt sie nie.</p>
              </div>
            ))}
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

export function Faden({ faden, neu, aendern }: { faden: FeedbackFaden<FeedbackSichtEintrag>; neu: boolean; aendern: (a: Parameters<typeof api.feedbackAendern>[0]) => Promise<boolean> }) {
  const { feedback: f, antworten } = faden;
  const [offen, setOffen] = useState(false);
  const [text, setText] = useState('');
  const [sendet, setSendet] = useState(false);
  // „Erledigt“/„Wieder öffnen“: gesperrt, solange die eigene Anfrage läuft (sonst kippte ein Doppelklick es zurück).
  const [setzt, setSetzt] = useState(false);
  const [erledigtEinzeln] = useState(() => einzeln(setSetzt));
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
        <button type="button" className="wk-knopf" disabled={sendet || setzt} aria-busy={setzt} onClick={() => void erledigtEinzeln(() => aendern({ aktion: 'erledigt', id: f.id, erledigt: !f.erledigt }))}>
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
  const [eintraege, setEintraege] = useState<FeedbackSichtEintrag[] | null>(null);
  const [neu, setNeu] = useState<Set<string>>(new Set());
  const [meldung, setMeldung] = useState<string | null>(null);
  const titelId = useId();
  // Antworten in der Reihenfolge des Starts: Eine späte Antwort auf „gesehen“ überschreibt kein späteres „erledigt“.
  const [anwenden] = useState(() => geordnet(setEintraege));

  useEffect(() => {
    let gilt = true;
    // Laden und „gesehen“ zählen zusammen als laufende Änderung: Schließt die Person den Editor gleich wieder, lädt
    // „Meine Mappe“ erst danach neu und zeigt nicht mehr „neu“.
    void feedbackAenderungen.merken(anwenden(api.feedback()).then(
      (r) => {
        if (!gilt) return;
        const n = neueIds(r.eintraege, name);
        setNeu(n);
        // Nach bestem Bemühen: scheitert es, ist es beim nächsten Öffnen eben noch einmal „neu“.
        if (n.size > 0) return anwenden(api.feedbackAendern({ aktion: 'gesehen', artefakt: name })).then(() => {}, () => {});
      },
      () => { if (gilt) setMeldung(TEXT.fehlt); },
    ));
    return () => { gilt = false; };
  }, [name, anwenden]);

  async function aendern(a: Parameters<typeof api.feedbackAendern>[0]): Promise<boolean> {
    setMeldung(null);
    try {
      await anwenden(api.feedbackAendern(a));
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
