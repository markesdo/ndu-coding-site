// Editor für den Produkt-Brief: Formular in der Reihenfolge der Vorlage (1–7), rechts eine Karte je Abschnitt.
import type { Brief } from '../../schemas/index.js';
import { rendern } from '../../render/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import { briefKarten, produktSatzSetzen } from './brief-hilfen.js';
import './editoren.css';

// Nur lesend; auch der Leser der Lehrenden-Ansicht zeigt sie (vorschauen.tsx).
export function Vorschau({ daten }: { daten: Brief }) {
  return (
    <ol className="wk-karten">
      {briefKarten(daten).map((k) => {
        const leer = k.absaetze.length === 0 && (k.punkte?.length ?? 0) === 0;
        return (
          <li key={k.nr} className="wk-karte">
            <h3><span className="wk-karte-nr">{k.nr}</span>{k.titel}</h3>
            {leer && <p className="wk-offen">{k.leerText ?? ''}</p>}
            {k.absaetze.map((a, i) => <p key={i}>{a}</p>)}
            {k.punkte && k.punkte.length > 0 && <ul>{k.punkte.map((p, i) => <li key={i}>{p}</li>)}</ul>}
          </li>
        );
      })}
    </ol>
  );
}

export default function BriefEditor() {
  return (
    <EditorHuelle
      name="brief"
      titel="Produkt-Brief"
      alsMarkdown={(d) => rendern('brief', d)}
      bild={(d) => <Vorschau daten={d} />}
      formular={(d, setze, fehler) => (
        <>
          <Textfeld label="Stand" wert={d.stand} onChange={(stand) => setze({ ...d, stand })} fehler={fehler('stand')} hilfe="Datum als JJJJ-MM-TT, zum Beispiel 2026-10-22." />
          <Textfeld label="1. Für wen?" mehrzeilig wert={d.fuerWen} onChange={(fuerWen) => setze({ ...d, fuerWen })} fehler={fehler('fuerWen')} hilfe="Eine konkrete Person in einer konkreten Situation." />
          <Textfeld label="2. Welches Problem?" mehrzeilig wert={d.problem} onChange={(problem) => setze({ ...d, problem })} fehler={fehler('problem')} hilfe="Was ist heute mühsam, langsam oder frustrierend? Formuliere es ohne Lösung." />
          <Textfeld label="Heute gelöst durch" mehrzeilig zeilen={2} wert={d.heuteGeloestDurch} onChange={(heuteGeloestDurch) => setze({ ...d, heuteGeloestDurch })} fehler={fehler('heuteGeloestDurch')} hilfe="Was die Person jetzt tut, auch „gar nicht“." />
          <Textfeld label="3. Produkt in einem Satz" wert={d.produktSatz ?? ''} onChange={(w) => setze(produktSatzSetzen(d, w))} fehler={fehler('produktSatz')} hilfe="Lass das Feld heute leer. Es steht nach Tag 3 fest." />
          <Liste<string>
            label="4. Was macht es NICHT?"
            einzahl="Eintrag"
            eintraege={d.nicht}
            onChange={(nicht) => setze({ ...d, nicht })}
            neu={() => ''}
            fehler={fehler('nicht')}
            zeile={(t, s, i) => (
              <Textfeld label={`Was es nicht macht ${i + 1}`} wert={t} onChange={s} fehler={fehler(`nicht.${i}`)} hilfe={i === 0 ? 'Drei Dinge, die naheliegen und die du bewusst nicht machst.' : undefined} />
            )}
          />
          <Textfeld label="6. Woran merken wir es? – Wir glauben, dass …" mehrzeilig wert={d.outcome.wirGlauben} onChange={(wirGlauben) => setze({ ...d, outcome: { ...d.outcome, wirGlauben } })} fehler={fehler('outcome.wirGlauben')} hilfe="Zielgruppe und Veränderung." />
          <Textfeld label="Wir merken es, wenn …" mehrzeilig wert={d.outcome.wirMerkenEs} onChange={(wirMerkenEs) => setze({ ...d, outcome: { ...d.outcome, wirMerkenEs } })} fehler={fehler('outcome.wirMerkenEs')} hilfe="Was Menschen anders tun (Product Outcome) – schon an wenigen beobachtbar. Keine Funktion, noch keine Zielzahl." />
          <Liste<string>
            label="7. Offene Fragen"
            einzahl="Frage"
            eintraege={d.offeneFragen}
            onChange={(offeneFragen) => setze({ ...d, offeneFragen })}
            neu={() => ''}
            fehler={fehler('offeneFragen')}
            zeile={(t, s, i) => (
              <Textfeld label={`Offene Frage ${i + 1}`} mehrzeilig zeilen={2} wert={t} onChange={s} fehler={fehler(`offeneFragen.${i}`)} hilfe={i === 0 ? 'Was du in den Interviews herausfinden willst.' : undefined} />
            )}
          />
        </>
      )}
    />
  );
}
