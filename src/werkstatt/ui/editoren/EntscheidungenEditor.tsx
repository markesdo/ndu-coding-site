// Editor für das Entscheidungslog: Zeilen werden angelegt und ersetzt, gespeicherte nie gelöscht.
// Die Regeln stehen in entscheidungen-hilfen.ts (rein, getestet); hier nur Anzeige und Fokus.
import { Plus, Replace, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { heuteWien } from '../../datum.js';
import { rendern } from '../../render/index.js';
import { ARTEFAKTE, BELEGSTUFEN, BELEGSTUFE_TEXT, type Entscheidung, type Entscheidungen } from '../../schemas/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Auswahl from '../felder/Auswahl.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import {
  datumAnzeigen, ersetzen, ersetztVon, gespeicherteIds, loeschen, loeschenVerboten, zeileHinzufuegen,
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
  // IDs, die auf dem Server liegen: Die sind nicht mehr löschbar.
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
    const r = zeileHinzufuegen(daten, [...vergeben.current], heuteWien());
    vergib(r.id);
    setze(r.daten);
    setMeldung(`${r.id} angelegt.`);
    setFokus(r.id);
  };

  const zeileErsetzen = (altId: string) => {
    const r = ersetzen(daten, altId, [...vergeben.current], heuteWien());
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
        Stand: {datumAnzeigen(daten.stand)}. Eine gespeicherte Entscheidung wird nie gelöscht. Hat sie sich geändert, ersetze sie: Die alte bleibt im Log und zeigt, wann sie ersetzt wurde.
      </p>
      {fehler('stand') && <p className="wk-fehler">{fehler('stand')}</p>}
      {fehler('entscheidungen') && <p className="wk-fehler">{fehler('entscheidungen')}</p>}
      {daten.entscheidungen.length === 0 && <p className="wk-hilfe">Noch keine Entscheidung eingetragen.</p>}
      <ol className="wk-entscheidungen">
        {daten.entscheidungen.map((e, i) => {
          const neue = ersetztVon(daten, e.id);
          const pfad = (feld: string) => `entscheidungen.${i}.${feld}`;
          const darfLoeschen = loeschenVerboten(daten, e.id, gespeichert) === null;
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
              {[fehler(pfad('id')), fehler(pfad('ersetzt'))].filter(Boolean).map((m) => <p key={m} className="wk-fehler">{m}</p>)}
              {neue ? (
                <>
                  <p className="wk-hilfe">Ersetzt – nicht mehr änderbar.</p>
                  <dl className="wk-zeile-daten">
                    <dt>Datum</dt><dd>{datumAnzeigen(e.datum)}</dd>
                    <dt>Entscheidung</dt><dd>{e.entscheidung || '–'}</dd>
                    <dt>Grund</dt><dd>{e.grund || '–'}</dd>
                    <dt>Beleg</dt><dd>{BELEGSTUFE_TEXT[e.beleg]}</dd>
                    <dt>Beleg-IDs</dt><dd>{e.belegIds.length ? e.belegIds.join(', ') : '–'}</dd>
                  </dl>
                </>
              ) : (
                <>
                  <Textfeld label={`Datum (${e.id})`} hilfe="JJJJ-MM-TT, zum Beispiel 2026-10-22" wert={e.datum} onChange={(datum) => setzeZeile(i, { ...e, datum })} fehler={fehler(pfad('datum'))} />
                  <Textfeld label={`Entscheidung (${e.id})`} mehrzeilig zeilen={2} wert={e.entscheidung} onChange={(entscheidung) => setzeZeile(i, { ...e, entscheidung })} fehler={fehler(pfad('entscheidung'))} />
                  <Textfeld label={`Grund (${e.id})`} mehrzeilig zeilen={2} wert={e.grund} onChange={(grund) => setzeZeile(i, { ...e, grund })} fehler={fehler(pfad('grund'))} />
                  <Auswahl label={`Beleg (${e.id})`} hilfe="Wie stark ist der Beleg: gesagt, erzählt oder getan?" wert={e.beleg} optionen={BELEG} onChange={(beleg) => setzeZeile(i, { ...e, beleg })} fehler={fehler(pfad('beleg'))} />
                  <VerweisAuswahl label={`Beleg-IDs (${e.id})`} hilfe="Worauf stützt sich die Entscheidung, zum Beispiel I2-4 oder T1?" werte={e.belegIds} onChange={(belegIds) => setzeZeile(i, { ...e, belegIds })} fehler={fehler(pfad('belegIds'))} />
                  <div className="wk-knoepfe">
                    <button type="button" className="wk-knopf" onClick={() => zeileErsetzen(e.id)} aria-label={`${e.id} ersetzen`}>
                      <Replace size={16} aria-hidden="true" /> Ersetzen
                    </button>
                    {darfLoeschen && (
                      <button type="button" className="wk-knopf" onClick={() => zeileLoeschen(e.id)} aria-label={`${e.id} löschen (noch nicht gespeichert)`}>
                        <Trash2 size={16} aria-hidden="true" /> Löschen
                      </button>
                    )}
                  </div>
                </>
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
          <tr><th scope="col">ID</th><th scope="col">Datum</th><th scope="col">Entscheidung</th><th scope="col">Grund</th><th scope="col">Beleg</th><th scope="col">Beleg-IDs</th></tr>
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
