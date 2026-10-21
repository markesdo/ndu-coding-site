// Editor für das Entscheidungslog: Neue Zeilen sind frei änderbar; gespeicherte nur noch lesbar und ersetzbar, nie gelöscht.
// Die Regeln stehen in entscheidungen-hilfen.ts (rein, getestet); hier nur Anzeige und Fokus.
import { Plus, Replace, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { tagInWien } from '../../../lib/kurswahl.js';
import { rendern } from '../../render/index.js';
import { ARTEFAKTE, BELEGSTUFEN, BELEGSTUFE_TEXT, belegNotizSetzen, belegNotizZaehler, type Entscheidung, type Entscheidungen } from '../../schemas/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Auswahl from '../felder/Auswahl.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import {
  belegNotizHilfe, datumAnzeigen, ersetzen, ersetztVon, gespeicherteIds, loeschen, sperrHinweis, zeileHinzufuegen, zeilenModus,
} from './entscheidungen-hilfen.js';
import './editoren.css';

const BELEG = BELEGSTUFEN.map((b) => ({ wert: b, text: BELEGSTUFE_TEXT[b] }));

type Fehler = (pfad: string) => string | undefined;

interface FormularProps {
  daten: Entscheidungen;
  setze: (neu: Entscheidungen) => void;
  fehler: Fehler;
  /** Stand des Servers aus der Editor-Hülle (null = noch keine Datei). */
  serverStand: Entscheidungen | null;
}

function Formular({ daten, setze, fehler, serverStand }: FormularProps) {
  // Alle IDs, die in dieser Sitzung je da waren: Eine gelöschte ID wird nie neu vergeben.
  const vergeben = useRef(new Set<string>());
  for (const e of daten.entscheidungen) vergeben.current.add(e.id);
  // IDs, die auf dem Server liegen: Die sind nur noch lesbar und ersetzbar.
  const gespeichert = gespeicherteIds(serverStand);
  const [meldung, setMeldung] = useState('');
  const [fokus, setFokus] = useState<string | null>(null);
  const zeilen = useRef(new Map<string, HTMLElement>());
  const neuKnopf = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (fokus === null) return;
    if (fokus === '') neuKnopf.current?.focus();
    else zeilen.current.get(fokus)?.querySelector<HTMLElement>('textarea, input, select')?.focus();
    setFokus(null);
  }, [fokus]);

  const vergib = (id: string) => vergeben.current.add(id);

  const neueZeile = () => {
    const r = zeileHinzufuegen(daten, [...vergeben.current], tagInWien(new Date()));
    vergib(r.id);
    setze(r.daten);
    setMeldung(`${r.id} angelegt.`);
    setFokus(r.id);
  };

  const zeileErsetzen = (altId: string, fehlerfrei: boolean) => {
    const r = ersetzen(daten, altId, [...vergeben.current], tagInWien(new Date()), gespeichert, fehlerfrei);
    if ('grund' in r) return setMeldung(r.grund);
    vergib(r.id);
    setze(r.daten);
    setMeldung(`${r.id} ersetzt ${altId}. ${altId} bleibt im Log.`);
    setFokus(r.id);
  };

  const zeileLoeschen = (id: string) => {
    const r = loeschen(daten, id, gespeichert);
    if ('grund' in r) return setMeldung(r.grund);
    setze(r.daten);
    setMeldung(`${id} gelöscht.`);
    setFokus('');
  };

  const setzeZeile = (i: number, e: Entscheidung) => setze({ ...daten, entscheidungen: daten.entscheidungen.map((alt, j) => (j === i ? e : alt)) });

  return (
    <>
      <p className="wk-hilfe">
        Stand: {datumAnzeigen(daten.stand)}. Eine gespeicherte Entscheidung wird nicht mehr geändert oder gelöscht. Hat sie sich geändert, ersetze sie: Die alte bleibt im Log und zeigt, wann sie ersetzt wurde.
      </p>
      {fehler('stand') && <p className="wk-fehler">{fehler('stand')}</p>}
      {fehler('entscheidungen') && <p className="wk-fehler">{fehler('entscheidungen')}</p>}
      {daten.entscheidungen.length === 0 && <p className="wk-hilfe">Noch keine Entscheidung eingetragen.</p>}
      <ol className="wk-entscheidungen">
        {daten.entscheidungen.map((e, i) => {
          const neue = ersetztVon(daten, e.id);
          const pfad = (feld: string) => `entscheidungen.${i}.${feld}`;
          const modus = zeilenModus(daten, i, gespeichert, fehler);
          const kopfId = `wk-d-${e.id}`;
          return (
            <li
              key={e.id}
              className={neue ? 'wk-zeile wk-ersetzt' : 'wk-zeile'}
              ref={(el) => { if (el) zeilen.current.set(e.id, el); else zeilen.current.delete(e.id); }}
              aria-labelledby={kopfId}
            >
              <h3 id={kopfId} className="wk-zeile-kopf">
                {e.id}
                {e.ersetzt !== undefined && <span> · ersetzt {e.ersetzt}</span>}
                {neue && <span> · ersetzt am {datumAnzeigen(neue.datum)} durch {neue.id}</span>}
              </h3>
              {modus.bearbeitbar ? (
                <>
                  {[fehler(pfad('id')), fehler(pfad('ersetzt'))].filter(Boolean).map((m) => <p key={m} className="wk-fehler">{m}</p>)}
                  <Textfeld label={`Datum (${e.id})`} hilfe="JJJJ-MM-TT, zum Beispiel 2026-10-22" wert={e.datum} onChange={(datum) => setzeZeile(i, { ...e, datum })} fehler={fehler(pfad('datum'))} />
                  <Textfeld label={`Entscheidung (${e.id})`} mehrzeilig zeilen={2} wert={e.entscheidung} onChange={(entscheidung) => setzeZeile(i, { ...e, entscheidung })} fehler={fehler(pfad('entscheidung'))} />
                  <Textfeld label={`Grund (${e.id})`} mehrzeilig zeilen={2} wert={e.grund} onChange={(grund) => setzeZeile(i, { ...e, grund })} fehler={fehler(pfad('grund'))} />
                  <Auswahl label={`Beleg (${e.id})`} hilfe="Wie stark ist der Beleg: gesagt, erzählt oder getan?" wert={e.beleg} optionen={BELEG} onChange={(beleg) => setzeZeile(i, { ...e, beleg })} fehler={fehler(pfad('beleg'))} />
                  <VerweisAuswahl label={`Beleg-IDs (${e.id})`} hilfe="Worauf stützt sich die Entscheidung, zum Beispiel I2-4 oder A3?" werte={e.belegIds} onChange={(belegIds) => setzeZeile(i, { ...e, belegIds })} fehler={fehler(pfad('belegIds'))} />
                  <Textfeld label={`Beleg (Notiz, z. B. Quelle oder Zahl) (${e.id})`} hilfe={belegNotizHilfe} wert={e.belegNotiz ?? ''} onChange={(notiz) => setzeZeile(i, belegNotizSetzen(e, notiz))} fehler={fehler(pfad('belegNotiz'))} />
                  <p className="wk-hilfe" aria-live="off">Zeichen: {belegNotizZaehler(e.belegNotiz ?? '')}</p>
                </>
              ) : (
                <>
                  <p className="wk-hilfe">{neue ? 'Ersetzt – nicht mehr änderbar.' : 'Gespeichert – nicht mehr änderbar. Hat sie sich geändert, ersetze sie.'}</p>
                  <dl className="wk-zeile-daten">
                    <dt>Datum</dt><dd>{datumAnzeigen(e.datum)}</dd>
                    <dt>Entscheidung</dt><dd>{e.entscheidung || '–'}</dd>
                    <dt>Grund</dt><dd>{e.grund || '–'}</dd>
                    <dt>Beleg</dt><dd>{BELEGSTUFE_TEXT[e.beleg]}</dd>
                    <dt>Beleg-IDs</dt><dd>{e.belegIds.length ? e.belegIds.join(', ') : '–'}</dd>
                    <dt>Beleg (Notiz)</dt><dd>{e.belegNotiz || '–'}</dd>
                  </dl>
                  {modus.fehler.length > 0 && (
                    <div role="alert">
                      {modus.fehler.map((m) => <p key={m} className="wk-fehler">{m}</p>)}
                      <p className="wk-hilfe">{sperrHinweis(daten, e.id, gespeichert)}</p>
                    </div>
                  )}
                </>
              )}
              {(modus.ersetzbar || modus.loeschbar) && (
                <div className="wk-knoepfe">
                  {modus.ersetzbar && (
                    <button type="button" className="wk-knopf" onClick={() => zeileErsetzen(e.id, modus.fehler.length === 0)} aria-label={`${e.id} ersetzen`}>
                      <Replace size={16} aria-hidden="true" /> Ersetzen
                    </button>
                  )}
                  {modus.loeschbar && (
                    <button type="button" className="wk-knopf" onClick={() => zeileLoeschen(e.id)} aria-label={`${e.id} löschen (noch nicht gespeichert)`}>
                      <Trash2 size={16} aria-hidden="true" /> Löschen
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button type="button" ref={neuKnopf} className="wk-knopf" onClick={neueZeile}>
        <Plus size={16} aria-hidden="true" /> Neue Entscheidung
      </button>
      <p className="wk-hilfe wk-meldung" role="status" aria-live="polite">{meldung}</p>
    </>
  );
}

function Tabelle({ daten }: { daten: Entscheidungen }) {
  if (daten.entscheidungen.length === 0) return <p className="wk-hilfe">Noch keine Entscheidung eingetragen.</p>;
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">Entscheidungslog, Stand {datumAnzeigen(daten.stand)}</caption>
        <thead>
          <tr><th scope="col">ID</th><th scope="col">Datum</th><th scope="col">Entscheidung</th><th scope="col">Grund</th><th scope="col">Beleg</th><th scope="col">Beleg-IDs</th><th scope="col">Beleg (Notiz)</th></tr>
        </thead>
        <tbody>
          {daten.entscheidungen.map((e) => {
            const neue = ersetztVon(daten, e.id);
            return (
              <tr key={e.id} className={neue ? 'wk-ersetzt' : undefined}>
                <th scope="row">{e.id}</th>
                <td>{datumAnzeigen(e.datum)}</td>
                <td>
                  {neue ? <s>{e.entscheidung}</s> : e.entscheidung}
                  {e.ersetzt !== undefined && <><br /><small>ersetzt {e.ersetzt}</small></>}
                  {neue && <><br /><small>ersetzt am {datumAnzeigen(neue.datum)} durch {neue.id}</small></>}
                </td>
                <td>{e.grund}</td>
                <td>{BELEGSTUFE_TEXT[e.beleg]}</td>
                <td>{e.belegIds.join(', ')}</td>
                <td>{e.belegNotiz}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function EntscheidungenEditor() {
  return (
    <EditorHuelle
      name="entscheidungen"
      titel={ARTEFAKTE.entscheidungen.titel}
      alsMarkdown={(d) => rendern('entscheidungen', d)}
      bild={(d) => <Tabelle daten={d} />}
      formular={(d, setze, fehler, gespeichert) => <Formular daten={d} setze={setze} fehler={fehler} serverStand={gespeichert} />}
    />
  );
}
