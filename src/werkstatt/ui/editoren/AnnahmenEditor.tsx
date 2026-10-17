// Editor für die Annahmen-Map: Zeilen mit Text, Art, Wichtigkeit und Beleg; Bild = Annahmen-Matrix live.
// Die Regeln stehen in annahmen-hilfen.ts (rein, getestet).
import { useId, useRef } from 'react';
import { rendern } from '../../render/index.js';
import { ANNAHME_ARTEN, ARTEFAKTE, BELEGSTUFEN, BELEGSTUFE_TEXT, WICHTIGKEITEN, type Annahme, type Annahmen } from '../../schemas/index.js';
import { AnnahmenMatrix } from '../bild/AnnahmenMatrix.js';
import EditorHuelle from '../EditorHuelle.js';
import Auswahl from '../felder/Auswahl.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import { ART_ANZEIGE, WICHTIG_TEXT, annahmeNeu, annahmenSetzen, fehlendeArtenHinweis, riskantesteSetzen } from './annahmen-hilfen.js';
import { heuteWien, mitStand } from './entscheidungen-hilfen.js';

const WICHTIG = WICHTIGKEITEN.map((w) => ({ wert: w, text: WICHTIG_TEXT[w] }));
const BELEG = BELEGSTUFEN.map((b) => ({ wert: b, text: BELEGSTUFE_TEXT[b] }));

type Fehler = (pfad: string) => string | undefined;

// Farbfeld je Art wie die Kacheln auf der Folie; der Text daneben trägt die Art, die Farbe hilft nur.
function farbe(art: Annahme['art']) {
  const f = ART_ANZEIGE[art].farbe;
  return { borderLeft: `5px solid var(--${f})`, background: `var(--${f}-soft)` };
}

function kurz(text: string): string {
  const z = Array.from(text.trim());
  return z.length > 50 ? `${z.slice(0, 50).join('').trimEnd()}…` : z.join('');
}

function ArtWahl({ wert, onChange, fehler, id }: { wert: Annahme['art']; onChange: (a: Annahme['art']) => void; fehler?: string; id: string }) {
  const name = useId();
  return (
    <fieldset className="wk-verweise" aria-describedby={fehler ? `${name}-fehler` : undefined}>
      <legend>Art ({id})</legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))', gap: '.4rem', marginTop: '.3rem' }}>
        {ANNAHME_ARTEN.map((art) => (
          <label key={art} style={{ ...farbe(art), display: 'flex', gap: '.5rem', alignItems: 'flex-start', padding: '.4rem .6rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
            <input type="radio" name={name} value={art} checked={wert === art} onChange={() => onChange(art)} style={{ marginTop: '.2rem' }} />
            <span>
              <strong>{ART_ANZEIGE[art].titel}</strong>
              <br />
              <span style={{ fontSize: '.85rem' }}>{ART_ANZEIGE[art].frage}</span>
            </span>
          </label>
        ))}
      </div>
      {fehler && <p className="wk-fehler" id={`${name}-fehler`}>{fehler}</p>}
    </fieldset>
  );
}

function Formular({ daten, setze, fehler }: { daten: Annahmen; setze: (neu: Annahmen) => void; fehler: Fehler }) {
  // Alle IDs, die in dieser Sitzung je da waren: Eine gelöschte ID wird nie neu vergeben.
  const vergeben = useRef(new Set<string>());
  for (const a of daten.annahmen) vergeben.current.add(a.id);
  const aendern = (neu: Annahmen) => setze(mitStand(neu, heuteWien()));
  const hinweis = fehlendeArtenHinweis(daten.annahmen);
  const riskant = [
    { wert: '', text: 'noch keine gewählt' },
    ...daten.annahmen.map((a) => ({ wert: a.id, text: `${a.id} · ${kurz(a.text) || '(noch ohne Text)'}` })),
  ];

  return (
    <>
      <p className="wk-hilfe">Sammle Annahmen in allen vier Arten. Wo eine Annahme in der Map landet, ergibt sich aus Wichtigkeit und Beleg.</p>
      <p className="wk-hilfe" role="status" style={hinweis ? { color: 'var(--fg)', fontWeight: 600 } : undefined}>{hinweis ?? 'Alle vier Arten sind vertreten.'}</p>
      {fehler('stand') && <p className="wk-fehler">{fehler('stand')}</p>}
      <Liste<Annahme>
        label="Annahmen"
        einzahl="Annahme"
        eintraege={daten.annahmen}
        onChange={(annahmen) => aendern(annahmenSetzen(daten, annahmen))}
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
              <p style={{ margin: '0 0 .5rem' }}><strong>{a.id}</strong>{a.id === daten.riskanteste && ' · riskanteste'}</p>
              {fehler(pfad('id')) && <p className="wk-fehler">{fehler(pfad('id'))}</p>}
              <Textfeld label={`Annahme (${a.id})`} hilfe="Wir glauben, dass …" mehrzeilig zeilen={2} wert={a.text} onChange={(text) => s({ ...a, text })} fehler={fehler(pfad('text'))} />
              <ArtWahl id={a.id} wert={a.art} onChange={(art) => s({ ...a, art })} fehler={fehler(pfad('art'))} />
              <Auswahl label={`Wichtig (${a.id})`} hilfe="Wie schlimm wäre es, wenn die Annahme falsch ist?" wert={a.wichtig} optionen={WICHTIG} onChange={(wichtig) => s({ ...a, wichtig })} fehler={fehler(pfad('wichtig'))} />
              <Auswahl label={`Beleg (${a.id})`} wert={a.beleg} optionen={BELEG} onChange={(beleg) => s({ ...a, beleg })} fehler={fehler(pfad('beleg'))} />
              <VerweisAuswahl label={`Beleg-IDs (${a.id})`} hilfe="Zum Beispiel I2-4 für ein Zitat aus Interview 2." werte={a.belegIds} onChange={(belegIds) => s({ ...a, belegIds })} fehler={fehler(pfad('belegIds'))} />
            </>
          );
        }}
      />
      <Auswahl
        label="Riskanteste Annahme"
        hilfe="Sehr wichtig und kaum belegt: Die testest du zuerst."
        wert={daten.riskanteste ?? ''}
        optionen={riskant}
        onChange={(id) => aendern(riskantesteSetzen(daten, id))}
        fehler={fehler('riskanteste')}
      />
    </>
  );
}

function Bild({ daten }: { daten: Annahmen }) {
  return (
    <>
      <AnnahmenMatrix annahmen={daten.annahmen} riskanteste={daten.riskanteste} />
      {/* Die Farbe der Zettel allein sagt die Art nicht: Legende und Liste nennen sie als Text. */}
      <ul aria-label="Legende: Farben der Arten" style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem', display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
        {ANNAHME_ARTEN.map((art) => (
          <li key={art} style={{ ...farbe(art), padding: '.2rem .6rem', borderRadius: 'var(--radius)', fontSize: '.85rem' }}>{ART_ANZEIGE[art].titel}</li>
        ))}
      </ul>
      {daten.annahmen.length === 0 ? (
        <p className="wk-hilfe">Noch keine Annahme eingetragen.</p>
      ) : (
        <ul style={{ paddingLeft: '1.1rem', fontSize: '.9rem' }}>
          {daten.annahmen.map((a) => (
            <li key={a.id}>
              <strong>{a.id}</strong> {ART_ANZEIGE[a.art].text} · wichtig {WICHTIG_TEXT[a.wichtig]} · Beleg {BELEGSTUFE_TEXT[a.beleg]}
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
