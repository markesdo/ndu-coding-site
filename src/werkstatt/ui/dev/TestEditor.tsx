// Nur für die Dev-Testseite: ein kleiner Annahmen-Editor, um die Hülle und die Felder von Hand zu prüfen.
// Der echte Editor (Task 13) ersetzt ihn.
import { useEffect, useState } from 'react';
import { ANNAHME_ARTEN, BELEGSTUFEN, BELEGSTUFE_TEXT, WICHTIGKEITEN, type Annahme, type Annahmen } from '../../schemas/index.js';
import Auswahl from '../felder/Auswahl.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import EditorHuelle from '../EditorHuelle.js';
import { fakeApiEinschalten } from './fake-api.js';

const ARTEN = ANNAHME_ARTEN.map((a) => ({ wert: a, text: a }));
const WICHTIG = WICHTIGKEITEN.map((w) => ({ wert: w, text: w }));
const BELEG = BELEGSTUFEN.map((b) => ({ wert: b, text: BELEGSTUFE_TEXT[b] }));

export default function TestEditor() {
  const [bereit, setBereit] = useState(false);
  useEffect(() => {
    const fake = new URLSearchParams(location.search).get('fake');
    if (fake) fakeApiEinschalten(fake);
    setBereit(true);
  }, []);
  if (!bereit) return null;
  return (
    <EditorHuelle
      name="annahmen"
      titel="Annahmen-Map"
      alsMarkdown={(d) => `# Annahmen\n\n${d.annahmen.map((a) => `- ${a.id}: ${a.text}`).join('\n')}`}
      bild={(d) => (
        <ul>
          {d.annahmen.map((a) => <li key={a.id}><strong>{a.id}</strong> {a.text} ({a.wichtig}, {BELEGSTUFE_TEXT[a.beleg]})</li>)}
        </ul>
      )}
      formular={(d: Annahmen, setze, fehler) => (
        <>
          <Textfeld label="Stand" wert={d.stand} onChange={(stand) => setze({ ...d, stand })} fehler={fehler('stand')} hilfe="JJJJ-MM-TT" />
          <Liste<Annahme>
            label="Annahmen"
            einzahl="Annahme"
            eintraege={d.annahmen}
            onChange={(annahmen) => setze({ ...d, annahmen })}
            schluessel={(a, i) => `${i}-${a.id}`}
            neu={(v) => ({ id: `A${v.length + 1}`, text: '', art: 'wuenschenswert', wichtig: 'mittel', beleg: 'keiner', belegIds: [] })}
            zeile={(a, s, i) => (
              <>
                <Textfeld label="ID" wert={a.id} onChange={(id) => s({ ...a, id })} fehler={fehler(`annahmen.${i}.id`)} />
                <Textfeld label="Annahme" mehrzeilig wert={a.text} onChange={(text) => s({ ...a, text })} fehler={fehler(`annahmen.${i}.text`)} />
                <Auswahl label="Art" wert={a.art} optionen={ARTEN} onChange={(art) => s({ ...a, art })} />
                <Auswahl label="Wichtigkeit" wert={a.wichtig} optionen={WICHTIG} onChange={(wichtig) => s({ ...a, wichtig })} />
                <Auswahl label="Beleg" wert={a.beleg} optionen={BELEG} onChange={(beleg) => s({ ...a, beleg })} />
                <VerweisAuswahl label="Belege" werte={a.belegIds} onChange={(belegIds) => s({ ...a, belegIds })} fehler={fehler(`annahmen.${i}.belegIds`)} />
              </>
            )}
          />
        </>
      )}
    />
  );
}
