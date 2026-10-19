// Editor für Interviews mit Snapshot (Teresa Torres, „Continuous Discovery Habits“, S. 67–70). Ein Eintrag pro
// Interview; die Skizze der Geschichte bleibt auf Miro. Nur pseudonymisiert – Rohnotizen gehören nicht hierher.
import { useId } from 'react';
import { tagInWien } from '../../../lib/kurswahl.js';
import type { Chance, Interviews } from '../../schemas/index.js';
import { rendern } from '../../render/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import { neueChance, neuesInterview, neuesZitat, type InterviewEntwurf } from './interviews-hilfen.js';
import './editoren.css';

// Im Formular darf die Einwilligung noch fehlen (Entwurf); das Schema lässt erst mit Haken speichern.
type Entwurf = Omit<Interviews, 'interviews'> & { interviews: InterviewEntwurf[] };

function Vorschau({ daten }: { daten: Entwurf }) {
  const leer = <p className="wk-offen">Noch nichts eingetragen.</p>;
  if (daten.interviews.length === 0) return <p className="wk-offen">Noch kein Interview eingetragen.</p>;
  return (
    <ul className="wk-karten">
      {daten.interviews.map((iv, i) => (
        <li className="wk-karte" key={`${iv.id}-${i}`}>
          <h3><span className="wk-karte-nr">{iv.id}</span>{iv.pseudonym.trim() || <span className="wk-offen">Pseudonym fehlt</span>}</h3>
          {iv.zitat.trim() ? <p>„{iv.zitat}“</p> : leer}
          {iv.kurzinfos.trim() && <p className="wk-hilfe">{iv.kurzinfos}</p>}
          <h3>Einsichten</h3>
          {iv.einsichten.some((e) => e.trim()) ? <ul>{iv.einsichten.filter((e) => e.trim()).map((e, j) => <li key={j}>{e}</li>)}</ul> : leer}
          <h3>Chancen</h3>
          {iv.chancen.some((c) => c.text.trim())
            ? <ul>{iv.chancen.filter((c) => c.text.trim()).map((c, j) => <li key={j}>{c.text}{c.belege.length > 0 && <span className="wk-karte-nr"> {c.belege.join(', ')}</span>}</li>)}</ul>
            : leer}
          {!iv.einwilligung && <p className="wk-offen" role="note">Einwilligung fehlt – so wird das Interview nicht gespeichert.</p>}
        </li>
      ))}
    </ul>
  );
}

function Einwilligung({ wert, onChange, fehler }: { wert: boolean; onChange: (neu: boolean) => void; fehler?: string }) {
  const id = useId();
  return (
    <div className="wk-feld">
      <label htmlFor={id}>
        <input id={id} type="checkbox" checked={wert} onChange={(e) => onChange(e.target.checked)} aria-describedby={fehler ? `${id}-fehler` : undefined} />{' '}
        Die Person hat eingewilligt: Aufnahme, Speichern der pseudonymisierten Notizen für den Kurs, Auswertung mit KI-Werkzeugen.
      </label>
      {fehler && <p className="wk-fehler" id={`${id}-fehler`}>{fehler}</p>}
    </div>
  );
}

export default function InterviewsEditor() {
  return (
    <EditorHuelle
      name="interviews"
      titel="Interviews und Snapshots"
      alsMarkdown={(d) => rendern('interviews', d)}
      bild={(d) => <Vorschau daten={d as Entwurf} />}
      formular={(roh, setzeRoh, fehler) => {
        const d = roh as Entwurf;
        const setze = (neu: Entwurf) => setzeRoh(neu as unknown as Interviews);
        return (
          <>
            <p className="wk-hilfe">Nur pseudonymisiert: keine Namen, Arbeitgeber oder Fotos. Rohnotizen und Aufnahmen bleiben bei dir. Die Skizze der Geschichte zeichnest du auf Miro.</p>
            <Liste<InterviewEntwurf>
              label="Interviews"
              einzahl="Interview"
              eintraege={d.interviews}
              onChange={(interviews) => setze({ ...d, interviews })}
              neu={(vorhandene) => neuesInterview(vorhandene, tagInWien(new Date()))}
              fehler={fehler('interviews')}
              zeile={(iv, s, i) => {
                const f = (pfad: string) => fehler(`interviews.${i}.${pfad}`);
                const zitatVorschlaege = iv.zitate.map((z) => ({ id: z.id, text: z.text }));
                return (
                  <>
                    <p className="wk-hilfe">ID: <strong>{iv.id}</strong></p>
                    {f('id') && <p className="wk-fehler">{f('id')}</p>}
                    <Textfeld label="Pseudonym" wert={iv.pseudonym} onChange={(pseudonym) => s({ ...iv, pseudonym })} fehler={f('pseudonym')} hilfe="Etwas, das dich an die Person erinnert, zum Beispiel „Pendlerin, Zug 7:42“ – kein Name." />
                    <Textfeld label="Datum" wert={iv.datum} onChange={(datum) => s({ ...iv, datum })} fehler={f('datum')} hilfe="JJJJ-MM-TT, zum Beispiel 2026-10-23." />
                    <Einwilligung wert={iv.einwilligung} onChange={(einwilligung) => s({ ...iv, einwilligung })} fehler={f('einwilligung')} />
                    <Textfeld label="Einprägsames Zitat" wert={iv.zitat} onChange={(zitat) => s({ ...iv, zitat })} fehler={f('zitat')} hilfe="Ein Satz, wörtlich, der dich an diese Geschichte erinnert." />
                    <Textfeld label="Kurzinfos" mehrzeilig zeilen={2} wert={iv.kurzinfos} onChange={(kurzinfos) => s({ ...iv, kurzinfos })} fehler={f('kurzinfos')} hilfe="Was zeigt, wie diese Person zu den anderen passt – ohne sie erkennbar zu machen." />
                    <Liste<string>
                      label="Einsichten"
                      einzahl="Einsicht"
                      eintraege={iv.einsichten}
                      onChange={(einsichten) => s({ ...iv, einsichten })}
                      neu={() => ''}
                      fehler={f('einsichten')}
                      zeile={(e, se, j) => <Textfeld label={`Einsicht ${j + 1}`} wert={e} onChange={se} fehler={f(`einsichten.${j}`)} hilfe={j === 0 ? 'Auffälliges Verhalten, das (noch) kein Bedürfnis ist.' : undefined} />}
                    />
                    <Liste<Chance>
                      label="Chancen"
                      einzahl="Chance"
                      eintraege={iv.chancen}
                      onChange={(chancen) => s({ ...iv, chancen })}
                      neu={neueChance}
                      fehler={f('chancen')}
                      zeile={(c, sc, j) => (
                        <>
                          <Textfeld label={`Chance ${j + 1}`} mehrzeilig zeilen={2} wert={c.text} onChange={(text) => sc({ ...c, text })} fehler={f(`chancen.${j}.text`)} hilfe={j === 0 ? 'Bedürfnis, Schmerzpunkt oder Wunsch in den Worten der Person – keine Lösung. Wünscht sie sich eine Funktion: „Was würde dir das bringen?“' : undefined} />
                          <VerweisAuswahl label="Belege (Zitat-IDs)" werte={c.belege} onChange={(belege) => sc({ ...c, belege })} vorschlaege={zitatVorschlaege} fehler={f(`chancen.${j}.belege`) ?? c.belege.map((_, k) => f(`chancen.${j}.belege.${k}`)).find(Boolean)} />
                        </>
                      )}
                    />
                    <Textfeld label="Notizen" mehrzeilig zeilen={6} wert={iv.notizen} onChange={(notizen) => s({ ...iv, notizen })} fehler={f('notizen')} hilfe="Pseudonymisiert: Was ist passiert, in welcher Reihenfolge?" />
                    <Liste<{ id: string; text: string }>
                      label="Zitate"
                      einzahl="Zitat"
                      eintraege={iv.zitate}
                      onChange={(zitate) => s({ ...iv, zitate })}
                      neu={(vorhandene) => neuesZitat(iv.id, vorhandene)}
                      fehler={f('zitate')}
                      zeile={(z, sz, j) => (
                        <>
                          <p className="wk-hilfe">ID: <strong>{z.id}</strong></p>
                          <Textfeld label={`Zitat ${j + 1}`} mehrzeilig zeilen={2} wert={z.text} onChange={(text) => sz({ ...z, text })} fehler={f(`zitate.${j}.text`) ?? f(`zitate.${j}.id`)} hilfe={j === 0 ? 'Wörtlich. Auf die ID verweisen Chancen und später der Baum.' : undefined} />
                        </>
                      )}
                    />
                  </>
                );
              }}
            />
          </>
        );
      }}
    />
  );
}
