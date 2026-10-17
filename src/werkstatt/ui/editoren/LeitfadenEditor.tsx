// Editor für den Interview-Leitfaden. Der Einstieg kommt aus der Vorlage; Fragen beginnen immer leer.
import type { Frage, Leitfaden } from '../../schemas/index.js';
import { FRAGE_ARTEN } from '../../schemas/index.js';
import { rendern } from '../../render/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Auswahl from '../felder/Auswahl.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import { hatPlatzhalter, neueFrage, PLATZHALTER_HINWEIS } from './leitfaden-hilfen.js';
import './editoren.css';

const ARTEN = FRAGE_ARTEN.map((a) => ({ wert: a, text: a === 'kern' ? 'Kernfrage' : 'Nachfrage' }));
const ART_TEXT = Object.fromEntries(ARTEN.map((a) => [a.wert, a.text]));

function Vorschau({ daten }: { daten: Leitfaden }) {
  const leer = <p className="wk-offen">Noch nichts eingetragen.</p>;
  const karte = (titel: string, text: string) => (
    <li className="wk-karte">
      <h3>{titel}</h3>
      {text.trim() === '' ? leer : <p>{text}</p>}
    </li>
  );
  return (
    <ul className="wk-karten">
      {karte('Ziel', daten.ziel)}
      {karte('Wen', daten.wen)}
      {karte('Einstieg', daten.einstieg)}
      {hatPlatzhalter(daten.einstieg) && <li className="wk-karte"><p className="wk-offen" role="status">{PLATZHALTER_HINWEIS}</p></li>}
      <li className="wk-karte">
        <h3>Fragen</h3>
        {daten.fragen.length === 0 && leer}
        {daten.fragen.map((f) => (
          <p key={f.id}>
            <span className="wk-karte-nr">{f.id}</span>
            {f.text.trim() === '' ? <span className="wk-offen">noch leer</span> : f.text}
            <span className="wk-art">{ART_TEXT[f.art]}</span>
          </p>
        ))}
      </li>
      {karte('Abschluss', daten.abschluss)}
    </ul>
  );
}

export default function LeitfadenEditor() {
  return (
    <EditorHuelle
      name="leitfaden"
      titel="Interview-Leitfaden"
      alsMarkdown={(d) => rendern('leitfaden', d)}
      bild={(d) => <Vorschau daten={d} />}
      formular={(d, setze, fehler) => (
        <>
          <Textfeld label="Stand" wert={d.stand} onChange={(stand) => setze({ ...d, stand })} fehler={fehler('stand')} hilfe="Datum als JJJJ-MM-TT, zum Beispiel 2026-10-22." />
          <Textfeld label="Ziel" mehrzeilig wert={d.ziel} onChange={(ziel) => setze({ ...d, ziel })} fehler={fehler('ziel')} hilfe="Welche offene Frage aus dem Brief soll das Interview klären?" />
          <Textfeld label="Wen" mehrzeilig zeilen={2} wert={d.wen} onChange={(wen) => setze({ ...d, wen })} fehler={fehler('wen')} hilfe="Die Zielgruppe aus Abschnitt 1 des Briefs und wie du sie findest." />
          <Textfeld label="Einstieg" mehrzeilig zeilen={5} wert={d.einstieg} onChange={(einstieg) => setze({ ...d, einstieg })} fehler={fehler('einstieg')} hilfe="Ersetze [Situation] durch deine eigene. Du kannst den Text umformulieren." />
          <Liste<Frage>
            label="Fragen"
            einzahl="Frage"
            eintraege={d.fragen}
            onChange={(fragen) => setze({ ...d, fragen })}
            neu={neueFrage}
            fehler={fehler('fragen')}
            zeile={(f, s, i) => (
              <>
                <p className="wk-hilfe">ID: <strong>{f.id}</strong></p>
                <Textfeld
                  label={`Frage ${i + 1}`}
                  mehrzeilig
                  zeilen={2}
                  wert={f.text}
                  onChange={(text) => s({ ...f, text })}
                  fehler={fehler(`fragen.${i}.text`)}
                  hilfe={i === 0 ? 'Frag nach dem, was die Person wirklich getan hat, nicht nach dem, was sie tun würde.' : undefined}
                />
                <Auswahl label="Art" wert={f.art} optionen={ARTEN} onChange={(art) => s({ ...f, art })} fehler={fehler(`fragen.${i}.art`)} />
              </>
            )}
          />
          <Textfeld label="Abschluss" mehrzeilig zeilen={2} wert={d.abschluss} onChange={(abschluss) => setze({ ...d, abschluss })} fehler={fehler('abschluss')} />
        </>
      )}
    />
  );
}
