// Editor für die Annahmen-Map: Zeilen mit Text, Art, Wichtigkeit und Beleg; Bild = Annahmen-Matrix live.
// Die Regeln stehen in annahmen-hilfen.ts (rein, getestet).
import { useId, useRef } from 'react';
import { rendern } from '../../render/index.js';
import { ANNAHME_ARTEN, ARTEFAKTE, BELEGSTUFEN, BELEGSTUFE_TEXT, WICHTIGKEITEN, belegNotizSetzen, belegNotizZaehler, type Annahme, type Annahmen } from '../../schemas/index.js';
import { AnnahmenMatrix } from '../bild/AnnahmenMatrix.js';
import EditorHuelle from '../EditorHuelle.js';
import Auswahl from '../felder/Auswahl.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import { ART_ANZEIGE, WICHTIG_TEXT, annahmeBelegNotizHilfe, annahmeNeu, belegAnzeige, annahmenSetzen, fehlendeArtenHinweis, getanOhneQuelleHinweis, riskantesteSetzen } from './annahmen-hilfen.js';
import './editoren.css';

const WICHTIG = WICHTIGKEITEN.map((w) => ({ wert: w, text: WICHTIG_TEXT[w] }));
const BELEG = BELEGSTUFEN.map((b) => ({ wert: b, text: BELEGSTUFE_TEXT[b] }));

type Fehler = (pfad: string) => string | undefined;

// Farbfeld je Art wie die Kacheln auf der Folie; der Text daneben trägt die Art, die Farbe hilft nur.
const farbe = (art: Annahme['art']) => `wk-artfarbe ${ART_ANZEIGE[art].farbe}`;

function kurz(text: string): string {
  const z = Array.from(text.trim());
  return z.length > 50 ? `${z.slice(0, 50).join('').trimEnd()}…` : z.join('');
}

function ArtWahl({ wert, onChange, fehler, id }: { wert: Annahme['art']; onChange: (a: Annahme['art']) => void; fehler?: string; id: string }) {
  const name = useId();
  return (
    <fieldset className="wk-verweise" aria-describedby={fehler ? `${name}-fehler` : undefined}>
      <legend>Art ({id})</legend>
      <div className="wk-artwahl">
        {ANNAHME_ARTEN.map((art) => (
          <label key={art} className={farbe(art)}>
            <input type="radio" name={name} value={art} checked={wert === art} onChange={() => onChange(art)} />
            <span>
              <strong>{ART_ANZEIGE[art].titel}</strong>
              <span className="wk-art-frage">{ART_ANZEIGE[art].frage}</span>
            </span>
          </label>
        ))}
      </div>
      {fehler && <p className="wk-fehler" id={`${name}-fehler`}>{fehler}</p>}
    </fieldset>
  );
}

function Formular({ daten, setze, fehler }: { daten: Annahmen; setze: (neu: Annahmen) => void; fehler: Fehler }) {
  // Alle IDs, die in dieser Sitzung je da waren: Eine gelöschte ID wird nie neu vergeben. Bekannte Grenze (wie im
  // Leitfaden): Eine gespeicherte, dann gelöschte Annahme kann in einer späteren Sitzung ihre ID wieder vergeben.
  const vergeben = useRef(new Set<string>());
  for (const a of daten.annahmen) vergeben.current.add(a.id);
  const hinweis = fehlendeArtenHinweis(daten.annahmen);
  const riskant = [
    { wert: '', text: 'noch keine gewählt' },
    ...daten.annahmen.map((a) => ({ wert: a.id, text: `${a.id} · ${kurz(a.text) || '(noch ohne Text)'}` })),
  ];

  return (
    <>
      <p className="wk-hilfe">Sammle Annahmen in allen vier Arten – und, wo es passt, zur fünften Frage: Kann es schaden? Wo eine Annahme in der Map landet, ergibt sich aus Wichtigkeit und Beleg.</p>
      <p className={hinweis ? 'wk-hilfe wk-arten-fehlen' : 'wk-hilfe'} role="status">{hinweis ?? 'Alle vier Arten sind vertreten.'}</p>
      {fehler('stand') && <p className="wk-fehler">{fehler('stand')}</p>}
      <Liste<Annahme>
        label="Annahmen"
        einzahl="Annahme"
        eintraege={daten.annahmen}
        onChange={(annahmen) => setze(annahmenSetzen(daten, annahmen))}
        neu={(vorhandene) => {
          const a = annahmeNeu(vorhandene, [...vergeben.current]);
          vergeben.current.add(a.id);
          return a;
        }}
        fehler={fehler('annahmen')}
        zeile={(a, s, i) => {
          const pfad = (feld: string) => `annahmen.${i}.${feld}`;
          return (
            <>
              <p className="wk-zeile-id"><strong>{a.id}</strong>{a.id === daten.riskanteste && ' · riskanteste'}</p>
              {fehler(pfad('id')) && <p className="wk-fehler">{fehler(pfad('id'))}</p>}
              <Textfeld label={`Annahme (${a.id})`} hilfe="Wir glauben, dass …" mehrzeilig zeilen={2} wert={a.text} onChange={(text) => s({ ...a, text })} fehler={fehler(pfad('text'))} />
              <ArtWahl id={a.id} wert={a.art} onChange={(art) => s({ ...a, art })} fehler={fehler(pfad('art'))} />
              <Auswahl label={`Wichtig (${a.id})`} hilfe="Wie schlimm wäre es, wenn die Annahme falsch ist?" wert={a.wichtig} optionen={WICHTIG} onChange={(wichtig) => s({ ...a, wichtig })} fehler={fehler(pfad('wichtig'))} />
              <Auswahl label={`Beleg (${a.id})`} wert={a.beleg} optionen={BELEG} onChange={(beleg) => s({ ...a, beleg })} fehler={fehler(pfad('beleg'))} />
              <VerweisAuswahl label={`Beleg-IDs (${a.id})`} hilfe="Zum Beispiel I2-4 für ein Zitat aus Interview 2." werte={a.belegIds} onChange={(belegIds) => s({ ...a, belegIds })} fehler={fehler(pfad('belegIds'))} />
              <Textfeld label={`Beleg (Notiz, z. B. Quelle oder Zahl) (${a.id})`} hilfe={annahmeBelegNotizHilfe} wert={a.belegNotiz ?? ''} onChange={(notiz) => s(belegNotizSetzen(a, notiz))} fehler={fehler(pfad('belegNotiz'))} hinweis={getanOhneQuelleHinweis(a) ?? undefined} />
              <p className="wk-hilfe" aria-live="off">Zeichen: {belegNotizZaehler(a.belegNotiz ?? '')}</p>
            </>
          );
        }}
      />
      <Auswahl
        label="Riskanteste Annahme"
        hilfe="Sehr wichtig und kaum belegt: Die testest du zuerst."
        wert={daten.riskanteste ?? ''}
        optionen={riskant}
        onChange={(id) => setze(riskantesteSetzen(daten, id))}
        fehler={fehler('riskanteste')}
      />
    </>
  );
}

export function Bild({ daten }: { daten: Annahmen }) {
  return (
    <>
      <AnnahmenMatrix annahmen={daten.annahmen} riskanteste={daten.riskanteste} />
      {/* Die Farbe der Zettel allein sagt die Art nicht: Legende und Liste nennen sie als Text. */}
      <ul aria-label="Legende: Farben der Arten" className="wk-legende">
        {ANNAHME_ARTEN.map((art) => (
          <li key={art} className={farbe(art)}>{ART_ANZEIGE[art].titel}</li>
        ))}
      </ul>
      {daten.annahmen.length === 0 ? (
        <p className="wk-hilfe">Noch keine Annahme eingetragen.</p>
      ) : (
        <ul className="wk-annahmen-text">
          {daten.annahmen.map((a) => (
            <li key={a.id}>
              <strong>{a.id}</strong> {ART_ANZEIGE[a.art].text} · wichtig {WICHTIG_TEXT[a.wichtig]} · Beleg {belegAnzeige(a)}
              {a.id === daten.riskanteste && <strong> · riskanteste</strong>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function AnnahmenEditor() {
  return (
    <EditorHuelle
      name="annahmen"
      titel={ARTEFAKTE.annahmen.titel}
      alsMarkdown={(d) => rendern('annahmen', d)}
      bild={(d) => <Bild daten={d} />}
      formular={(d, setze, fehler) => <Formular daten={d} setze={setze} fehler={fehler} />}
    />
  );
}
