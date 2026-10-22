// Lehrenden-Ansicht auf /innolab/mappe (Spec §3.7): Matrix Person × Artefakt, nur lesend. Eine Anfrage holt alles
// (GET /api/werkstatt/lehrende); der Leser zeigt nur, was schon geladen ist. Kein Abfragen im Takt (GitHub-Kontingent):
// Neu laden per Knopf, still beim Zurückkommen in den Tab, wenn die Daten älter als zwei Minuten sind.
// Beamer: data-werkstatt blendet alles aus (beamer.css); der Leser schließt sich beim Wechsel in den Beamer.
import {
  CalendarClock, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleCheck, CircleDashed, CloudOff, ExternalLink, FileWarning, Link2Off, PencilLine, RefreshCw, UserRound, X,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ARTEFAKTE, type ArtefaktName } from '../schemas/index.js';
import type { LehrendenAnsicht as Ansicht, LehrendenArtefakt, LehrendenMappe } from '../vertrag.js';
import { api, ApiError } from './api.js';
import {
  STILL_NEU_AB_MS, adresseMitLeser, alleGithubFehler, dateiVerlaufUrl, kurstagText, leserAusAdresse, leserKopf, lueckenJeArtefakt, nachbar, personText,
  spaltenHinweis, standText, tagText, zelle, zellenLabel, zuerstAnsehen, type BereiteMappe, type Leser, type Zelle, type ZellenArt,
} from './lehrenden-hilfen.js';
import { rueckkehrBeobachten } from './mappe-hilfen.js';

const TEXT = {
  laden: 'Lese die Mappen der Kohorte …',
  aktualisieren: 'aktualisiere …',
  ladenFehlt: 'Die Mappen lassen sich gerade nicht laden.',
  leer: 'In dieser Kohorte ist noch niemand eingetragen.',
  alleGithub: 'GitHub antwortet gerade nicht. In ein paar Minuten neu laden.',
  ohneBezug: 'Noch kein Kurstag vorbei – gezählt wird alles.',
  tagWeg: 'Diesen Kurstag gibt es nicht mehr; die Änderungen zählen wieder seit dem letzten Kurstag.',
  nurLesen: 'Nur lesen: Ändern können die Studierenden ihre Mappe nur selbst.',
} as const;

const ICON: Record<ZellenArt, typeof CircleCheck> = { vorhanden: CircleCheck, 'faellig-offen': CalendarClock, offen: CircleDashed, unlesbar: FileWarning };
const titel = (n: ArtefaktName) => ARTEFAKTE[n].titel;
// Kurz für Spaltenköpfe und Reiter (fünf Spalten passen so in die Seitenbreite).
const KURZ: Record<ArtefaktName, string> = { brief: 'Brief', entscheidungen: 'Entscheidungen', annahmen: 'Annahmen', leitfaden: 'Leitfaden', interviews: 'Interviews' };
const kurztitel = (n: ArtefaktName) => KURZ[n];

function ZellenInhalt({ z }: { z: Zelle }) {
  const Icon = ICON[z.art];
  return (
    <>
      <span className="lv-stand"><Icon size={16} aria-hidden="true" /> {z.wort}</span>
      {z.umfang && <span className="lv-umfang">{z.umfang}</span>}
      {z.geaendert && <span className="lv-geaendert"><PencilLine size={14} aria-hidden="true" /> {z.geaendert}</span>}
    </>
  );
}

function PersonKopf({ p, jetzt }: { p: LehrendenMappe; jetzt: number }) {
  const Icon = p.zustand === 'keine-mappe' ? UserRound : p.zustand === 'fehler' ? CloudOff : null;
  return (
    <>
      <strong className="lv-kuerzel">{p.kuerzel}</strong>
      <span className="lv-person-text">{Icon && <Icon size={14} aria-hidden="true" />} {personText(p, jetzt)}</span>
    </>
  );
}

function Luecken({ p }: { p: BereiteMappe }) {
  return (
    <div className="lv-luecken-liste">
      {lueckenJeArtefakt(p.luecken, p.artefakte.map((a) => a.name)).map((g) => (
        <Fragment key={g.name}>
          <h4>{titel(g.name)}</h4>
          <ul>{g.befunde.map((b, i) => <li key={i}>{b.text}</li>)}</ul>
        </Fragment>
      ))}
    </div>
  );
}

export default function LehrendenAnsicht() {
  const [ansicht, setAnsicht] = useState<Ansicht | null>(null);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [meldung, setMeldung] = useState('');
  const [geladen, setGeladen] = useState<number | null>(null);
  const [jetzt, setJetzt] = useState(() => Date.now());
  const [wahl, setWahl] = useState<{ kohorte?: string; seit?: number }>({});
  const [offeneLuecken, setOffeneLuecken] = useState<Set<string>>(new Set());
  const [leser, setLeser] = useState<Leser | null>(() => leserAusAdresse(location.search));
  const dialog = useRef<HTMLDialogElement>(null);
  const lauf = useRef(0);
  const wahlRef = useRef(wahl);
  wahlRef.current = wahl;
  const geladenRef = useRef<number | null>(null);

  const laden = useCallback(async (w: { kohorte?: string; seit?: number }) => {
    const mein = ++lauf.current;
    setLaedt(true);
    try {
      const a = await api.lehrende(w.kohorte, w.seit);
      if (mein !== lauf.current) return;
      setAnsicht(a);
      setFehler(null);
      const t = Date.now();
      geladenRef.current = t;
      setGeladen(t);
      setJetzt(t);
    } catch (e) {
      if (mein !== lauf.current) return;
      // Gewählter Kurstag ungültig (Termin verschoben): zurück auf den Standard derselben Kohorte.
      if (e instanceof ApiError && e.code === 'ungueltig' && w.seit !== undefined) {
        setMeldung(TEXT.tagWeg);
        setWahl({ kohorte: w.kohorte });
        return;
      }
      setFehler((e instanceof ApiError && e.message) || TEXT.ladenFehlt);
    } finally {
      if (mein === lauf.current) setLaedt(false);
    }
  }, []);

  useEffect(() => { void laden(wahl); }, [laden, wahl]);

  // Zurück im Tab: still neu, wenn die Daten älter als zwei Minuten sind.
  useEffect(() => rueckkehrBeobachten(document, window, () => {
    const g = geladenRef.current;
    if (g !== null && Date.now() - g > STILL_NEU_AB_MS) void laden(wahlRef.current);
  }), [laden]);

  // Nur die Anzeige „Stand vor N Min.“ weiterzählen, nichts laden.
  useEffect(() => {
    const t = setInterval(() => setJetzt(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Beamer: Leser zu, sonst bliebe die Seite hinter einem unsichtbaren Dialog gesperrt.
  useEffect(() => {
    const beobachter = new MutationObserver(() => {
      if (document.documentElement.hasAttribute('data-beamer')) dialog.current?.close();
    });
    beobachter.observe(document.documentElement, { attributes: true, attributeFilter: ['data-beamer'] });
    return () => beobachter.disconnect();
  }, []);

  // Leser öffnen, sobald es die Mappe gibt (auch aus der Adresse); die Adresse folgt dem Leser.
  const leserMappe = leser && ansicht?.personen.find((p): p is BereiteMappe => p.kuerzel === leser.person && p.zustand === 'bereit');
  const leserArtefakt = leserMappe?.artefakte.find((a) => a.name === leser?.artefakt);
  useEffect(() => {
    history.replaceState(history.state, '', adresseMitLeser(location.pathname, location.search, location.hash, leserArtefakt ? leser : null));
    const d = dialog.current;
    if (leserArtefakt && d && !d.open && !document.documentElement.hasAttribute('data-beamer')) d.showModal();
  }, [leser, leserArtefakt]);

  function oeffnen(person: string, artefakt: ArtefaktName) {
    setLeser({ person, artefakt });
  }

  function leserTaste(e: KeyboardEvent<HTMLDialogElement>) {
    if (!ansicht || !leser || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    const ziel = nachbar(ansicht.personen, leser.person, e.key === 'ArrowLeft' ? -1 : 1);
    if (ziel) {
      e.preventDefault();
      setLeser({ person: ziel, artefakt: leser.artefakt });
    }
  }

  const umschalten = (k: string) => setOffeneLuecken((alt) => {
    const neu = new Set(alt);
    if (neu.has(k)) neu.delete(k); else neu.add(k);
    return neu;
  });

  const kopf = (
    <div className="lv-kopf">
      <h2 id="lv-titel">Mappen{ansicht && ansicht.kohorten.length <= 1 && <span className="lv-kohorte"> · {ansicht.kohorten[0]?.titel ?? ansicht.kohorte}</span>}</h2>
      {ansicht && ansicht.kohorten.length > 1 && (
        <label className="lv-wahl">
          Kohorte
          <select value={ansicht.kohorte} onChange={(e) => { setMeldung(''); setLeser(null); setWahl({ kohorte: e.target.value }); }}>
            {ansicht.kohorten.map((k) => <option key={k.id} value={k.id}>{k.titel}</option>)}
          </select>
        </label>
      )}
      {ansicht && (
        <span className="lv-tag">
          <span>{kurstagText(ansicht.kurstag)}</span>
          {ansicht.bezug && (
            <label className="lv-wahl">
              Änderungen seit
              <select value={ansicht.bezug.tag} onChange={(e) => { setMeldung(''); setWahl({ kohorte: ansicht.kohorte, seit: Number(e.target.value) }); }}>
                {ansicht.tage.map((t) => <option key={t.tag} value={t.tag}>{tagText(t)}</option>)}
              </select>
            </label>
          )}
        </span>
      )}
      <span className="lv-stand-zeit">
        {laedt && ansicht ? <span role="status">{TEXT.aktualisieren}</span> : geladen !== null && <span>{standText(geladen, jetzt)}</span>}
        <button type="button" className="wk-knopf" onClick={() => void laden(wahl)} disabled={laedt}>
          <RefreshCw size={16} aria-hidden="true" /> Neu laden
        </button>
      </span>
    </div>
  );

  if (!ansicht) {
    return (
      <section className="lv" data-werkstatt aria-labelledby="lv-titel">
        {kopf}
        {laedt && <p className="wk-hilfe" role="status">{TEXT.laden}</p>}
        {fehler && !laedt && <div className="wk-hinweis mappe-hinweis" role="alert"><p>{fehler}</p></div>}
      </section>
    );
  }

  const hinweise = zuerstAnsehen(ansicht);
  const allesWeg = alleGithubFehler(ansicht);
  const spalten = ansicht.spalten;

  return (
    <section className="lv" data-werkstatt aria-labelledby="lv-titel">
      {kopf}
      <p className="wk-hilfe">{TEXT.nurLesen}</p>
      {meldung && <p className="wk-status" role="status">{meldung}</p>}
      {fehler && <div className="wk-hinweis mappe-hinweis" role="alert"><p>{fehler}</p></div>}
      {!ansicht.bezug && <p className="lv-info">{TEXT.ohneBezug}</p>}
      {allesWeg && <div className="wk-hinweis mappe-hinweis" role="alert"><p><CloudOff size={16} aria-hidden="true" /> {TEXT.alleGithub}</p></div>}
      {ansicht.personen.length === 0 && <p>{TEXT.leer}</p>}

      {hinweise.length > 0 && (
        <div className="lv-zuerst" aria-label="Zuerst ansehen">
          <strong>Zuerst ansehen</strong>
          <ul>
            {hinweise.map((h) => (
              <li key={h.art} className={`lv-zuerst-${h.art}`}>
                {h.art === 'faellig-offen' ? <CalendarClock size={16} aria-hidden="true" /> : h.art === 'luecken' ? <Link2Off size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}
                {' '}{h.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ansicht.personen.length > 0 && !allesWeg && (
        <div className={laedt ? 'lv-daten lv-alt' : 'lv-daten'} aria-busy={laedt}>
          <div className="lv-tabelle-rahmen">
            <table className="lv-tabelle">
              <caption className="wk-nur-leser">Mappen der Kohorte {ansicht.kohorte}: Stand je Artefakt{ansicht.bezug ? `, Änderungen seit Tag ${ansicht.bezug.tag}` : ''}</caption>
              <thead>
                <tr>
                  <th scope="col" className="lv-spalte-person">Person</th>
                  {spalten.map((s) => (
                    <th key={s.name} scope="col">{kurztitel(s.name)}<span className="lv-faellig">{spaltenHinweis(s)}</span></th>
                  ))}
                  <th scope="col" className="lv-spalte-luecken">Lücken</th>
                </tr>
              </thead>
              <tbody>
                {ansicht.personen.map((p) => (
                  <Fragment key={p.kuerzel}>
                    <tr className={`lv-zeile lv-${p.zustand}`}>
                      <th scope="row"><PersonKopf p={p} jetzt={jetzt} /></th>
                      {p.zustand === 'bereit'
                        ? spalten.map((s) => {
                          const a = p.artefakte.find((x) => x.name === s.name)!;
                          const z = zelle(a, ansicht.kurstag, ansicht.bezug);
                          return (
                            <td key={s.name} className={`lv-zelle lv-${z.art}`}>
                              <button type="button" className="lv-zelle-knopf" aria-label={zellenLabel(p.kuerzel, s.name, z)} onClick={() => oeffnen(p.kuerzel, s.name)}>
                                <ZellenInhalt z={z} />
                              </button>
                            </td>
                          );
                        })
                        : <td colSpan={spalten.length} className="lv-leer-zeile" />}
                      <td className="lv-luecken">
                        {p.zustand === 'bereit' && (p.luecken.length === 0
                          ? <span className="lv-keine">keine</span>
                          : (
                            <button type="button" className="lv-luecken-knopf" aria-expanded={offeneLuecken.has(p.kuerzel)} aria-controls={`lv-luecken-${p.kuerzel}`} onClick={() => umschalten(p.kuerzel)}>
                              <Link2Off size={16} aria-hidden="true" /> {p.luecken.length}<span className="wk-nur-leser"> Lücken bei {p.kuerzel}</span>
                              {offeneLuecken.has(p.kuerzel) ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
                            </button>
                          ))}
                      </td>
                    </tr>
                    {p.zustand === 'bereit' && offeneLuecken.has(p.kuerzel) && (
                      <tr className="lv-luecken-zeile" id={`lv-luecken-${p.kuerzel}`}>
                        <td colSpan={spalten.length + 2}><Luecken p={p} /></td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Schmal (unter ~640 px): eine Karte pro Person statt der Tabelle. */}
          <ul className="lv-karten">
            {ansicht.personen.map((p) => (
              <li key={p.kuerzel} className={`lv-karte lv-${p.zustand}`}>
                <div className="lv-karte-kopf"><PersonKopf p={p} jetzt={jetzt} /></div>
                {p.zustand === 'bereit' && (
                  <>
                    <ul className="lv-karte-artefakte">
                      {spalten.map((s) => {
                        const a = p.artefakte.find((x) => x.name === s.name)!;
                        const z = zelle(a, ansicht.kurstag, ansicht.bezug);
                        return (
                          <li key={s.name} className={`lv-zelle lv-${z.art}`}>
                            <button type="button" className="lv-zelle-knopf" aria-label={zellenLabel(p.kuerzel, s.name, z)} onClick={() => oeffnen(p.kuerzel, s.name)}>
                              <span className="lv-karte-titel">{kurztitel(s.name)} <span className="lv-faellig">{spaltenHinweis(s)}</span></span>
                              <ZellenInhalt z={z} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    {p.luecken.length > 0 && (
                      <details className="lv-karte-luecken">
                        <summary><Link2Off size={16} aria-hidden="true" /> Lücken ({p.luecken.length})</summary>
                        <Luecken p={p} />
                      </details>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <dialog ref={dialog} className="wk-dialog lv-leser" aria-labelledby="lv-leser-titel" onClose={() => setLeser(null)} onKeyDown={leserTaste}>
        {leserMappe && leserArtefakt && (
          <LeserInhalt ansicht={ansicht} p={leserMappe} a={leserArtefakt} wechseln={setLeser} schliessen={() => dialog.current?.close()} />
        )}
      </dialog>
    </section>
  );
}

function LeserInhalt({ ansicht, p, a, wechseln, schliessen }: { ansicht: Ansicht; p: BereiteMappe; a: LehrendenArtefakt; wechseln: (l: Leser) => void; schliessen: () => void }) {
  const zurueck = nachbar(ansicht.personen, p.kuerzel, -1);
  const weiter = nachbar(ansicht.personen, p.kuerzel, 1);
  const befunde = p.luecken.filter((b) => b.artefakt === a.name);
  return (
    <div className="wk-huelle">
      <header className="wk-kopf lv-leser-kopf">
        <div>
          <h2 id="lv-leser-titel">{p.kuerzel} · {titel(a.name)}</h2>
          <p className="wk-hilfe">{leserKopf(a, ansicht.kurstag, ansicht.bezug)}</p>
        </div>
        <button type="button" className="wk-knopf" onClick={schliessen}><X size={16} aria-hidden="true" /> Schließen</button>
      </header>
      <nav className="lv-leser-nav" aria-label="Andere Mappe oder anderes Artefakt">
        <span className="lv-leser-personen">
          <button type="button" className="wk-knopf" disabled={!zurueck} onClick={() => zurueck && wechseln({ person: zurueck, artefakt: a.name })}>
            <ChevronLeft size={16} aria-hidden="true" /> {zurueck ?? 'Anfang'}
          </button>
          <button type="button" className="wk-knopf" disabled={!weiter} onClick={() => weiter && wechseln({ person: weiter, artefakt: a.name })}>
            {weiter ?? 'Ende'} <ChevronRight size={16} aria-hidden="true" />
          </button>
        </span>
        <span className="lv-leser-tabs">
          {p.artefakte.map((x) => (
            <button key={x.name} type="button" className="wk-knopf lv-tab" aria-current={x.name === a.name ? 'true' : undefined} onClick={() => wechseln({ person: p.kuerzel, artefakt: x.name })}>
              {kurztitel(x.name)}
            </button>
          ))}
        </span>
      </nav>
      <div className="lv-leser-inhalt">
        {befunde.length > 0 && (
          <div className="lv-leser-befunde">
            <h3><Link2Off size={16} aria-hidden="true" /> Lücken in den Verknüpfungen</h3>
            <ul>{befunde.map((b, i) => <li key={i}>{b.text}</li>)}</ul>
          </div>
        )}
        {a.fehlt.length > 0 && (
          <div className="lv-leser-fehlt">
            <h3>Was noch fehlt</h3>
            <ul>{a.fehlt.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        )}
        <p className="lv-links">
          <a href={p.repoUrl} target="_blank" rel="noreferrer">Repo {p.repo}<ExternalLink size={14} aria-label="öffnet GitHub in einem neuen Tab" /></a>
          {a.zuletzt && <a href={dateiVerlaufUrl(p.repoUrl, a.name)} target="_blank" rel="noreferrer">Verlauf der Datei<ExternalLink size={14} aria-label="öffnet GitHub in einem neuen Tab" /></a>}
        </p>
        {a.markdown !== null
          ? <pre className="lv-text">{a.markdown}</pre>
          : <p className="wk-hilfe">{a.stand === 'unlesbar' ? 'Die Datei passt nicht zum Format der Werkstatt; im Repo steht sie, wie sie ist.' : 'Noch nicht gespeichert.'}</p>}
      </div>
    </div>
  );
}
