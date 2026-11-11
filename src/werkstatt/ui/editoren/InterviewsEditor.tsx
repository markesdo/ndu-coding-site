// Editor für Interviews mit Snapshot (Teresa Torres, „Continuous Discovery Habits“, S. 67–70). Ein Eintrag pro
// Interview; die Skizze der Geschichte entsteht auf Papier und kommt an Tag 2 mit. Nur pseudonymisiert – Rohnotizen gehören nicht hierher.
// Das Formular folgt der Arbeitsreihenfolge (Zitate zuerst, weil Chancen auf ihre IDs verweisen); Vorschau und Markdown
// behalten Torres’ Anordnung des Snapshots (S. 68).
import { useId } from 'react';
import { tagInWien } from '../../../lib/kurswahl.js';
import { namenHinweis } from '../../eigennamen.js';
import type { Chance, Interviews } from '../../schemas/index.js';
import { rendern } from '../../render/index.js';
import EditorHuelle from '../EditorHuelle.js';
import Liste from '../felder/Liste.js';
import Textfeld from '../felder/Textfeld.js';
import VerweisAuswahl from '../felder/VerweisAuswahl.js';
import { belegHilfe, neueChance, neuesInterview, neuesZitat, type InterviewEntwurf } from './interviews-hilfen.js';
import './editoren.css';

// Im Formular darf die Einwilligung noch fehlen (Entwurf); das Schema lässt erst mit Haken speichern.
type Entwurf = Omit<Interviews, 'interviews'> & { interviews: InterviewEntwurf[] };

// Nur lesend; auch der Leser der Lehrenden-Ansicht zeigt sie (vorschauen.tsx).
export function Vorschau({ daten }: { daten: Entwurf }) {
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
            <p className="wk-hilfe">Nur pseudonymisiert: keine Namen, Arbeitgeber oder Fotos. Rohnotizen und Aufnahmen bleiben bei dir. Die Skizze der Geschichte zeichnest du gleich nach dem Gespräch auf Papier und bringst sie an Tag 2 mit.</p>
            <p className="wk-hilfe"><strong>Reihenfolge beim Ausfüllen:</strong> zuerst die Zitate (so entstehen die IDs), dann die Geschichte, Chancen mit Belegen und Einsichten – das einprägsame Zitat und die Kurzinfos zuletzt. Die fertige Ansicht ordnet alles wie bei Torres.</p>
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
                    <Textfeld label="Pseudonym" wert={iv.pseudonym} onChange={(pseudonym) => s({ ...iv, pseudonym })} fehler={f('pseudonym')} hinweis={namenHinweis(iv.pseudonym)} hilfe="Etwas, das dich an die Person erinnert, zum Beispiel „Pendlerin, Zug 7:42“ – kein Name." />
                    <Textfeld label="Datum" wert={iv.datum} onChange={(datum) => s({ ...iv, datum })} fehler={f('datum')} hilfe="JJJJ-MM-TT, zum Beispiel 2026-10-23." />
                    <Einwilligung wert={iv.einwilligung} onChange={(einwilligung) => s({ ...iv, einwilligung })} fehler={f('einwilligung')} />
                    <Liste<{ id: string; text: string }>
                      label="Zitate"
                      hilfe="Drei bis fünf Sätze wörtlich aus deinen Notizen. Jedes Zitat bekommt eine ID – darauf verweisen deine Chancen und später der Baum."
                      einzahl="Zitat"
                      eintraege={iv.zitate}
                      onChange={(zitate) => s({ ...iv, zitate })}
                      neu={(vorhandene) => neuesZitat(iv.id, vorhandene)}
                      fehler={f('zitate')}
                      zeile={(z, sz, j) => (
                        <>
                          <p className="wk-hilfe">ID: <strong>{z.id}</strong></p>
                          <Textfeld label={`Zitat ${j + 1}`} mehrzeilig zeilen={2} wert={z.text} onChange={(text) => sz({ ...z, text })} fehler={f(`zitate.${j}.text`) ?? f(`zitate.${j}.id`)} hinweis={namenHinweis(z.text)}  />
                        </>
                      )}
                    />
                    <Textfeld label="Notizen zur Geschichte" mehrzeilig zeilen={6} wert={iv.notizen} onChange={(notizen) => s({ ...iv, notizen })} fehler={f('notizen')} hinweis={namenHinweis(iv.notizen)} hilfe="Was ist passiert, in welcher Reihenfolge? Kurz, mit Kommas zwischen den Schritten, zum Beispiel „Halle 7:29, sechs Leute in der Schlange, angestellt, gezahlt, gewartet, Zug erreicht“. Daraus werden deine Skizze und später die Experience Map." />
                    <Liste<Chance>
                      label="Chancen"
                      einzahl="Chance"
                      eintraege={iv.chancen}
                      onChange={(chancen) => s({ ...iv, chancen })}
                      neu={neueChance}
                      fehler={f('chancen')}
                      zeile={(c, sc, j) => (
                        <>
                          <Textfeld label={`Chance ${j + 1}`} mehrzeilig zeilen={2} wert={c.text} onChange={(text) => sc({ ...c, text })} fehler={f(`chancen.${j}.text`)} hinweis={namenHinweis(c.text)} hilfe={j === 0 ? 'Bedürfnis, Schmerzpunkt oder Wunsch in den Worten der Person – keine Lösung. Wünscht sie sich eine Funktion: „Was würde dir das bringen?“ Muss kein wörtliches Zitat sein, aber in ihren Worten.' : undefined} />
                          <VerweisAuswahl label="Belege (Zitat-IDs)" werte={c.belege} onChange={(belege) => sc({ ...c, belege })} vorschlaege={zitatVorschlaege} hilfe={belegHilfe(iv.zitate)} fehler={f(`chancen.${j}.belege`) ?? c.belege.map((_, k) => f(`chancen.${j}.belege.${k}`)).find(Boolean)} />
                        </>
                      )}
                    />
                    <Liste<string>
                      label="Einsichten"
                      hilfe="Was dir auffällt, aber kein Bedürfnis ist – etwa ein ungewöhnliches Verhalten. Halte auch fest, was nur diese Person erzählt."
                      einzahl="Einsicht"
                      eintraege={iv.einsichten}
                      onChange={(einsichten) => s({ ...iv, einsichten })}
                      neu={() => ''}
                      fehler={f('einsichten')}
                      zeile={(e, se, j) => <Textfeld label={`Einsicht ${j + 1}`} wert={e} onChange={se} fehler={f(`einsichten.${j}`)} hinweis={namenHinweis(e)}  />}
                    />
                    <Textfeld label="Einprägsames Zitat" wert={iv.zitat} onChange={(zitat) => s({ ...iv, zitat })} fehler={f('zitat')} hinweis={namenHinweis(iv.zitat)} hilfe="Wähle eines deiner Zitate oben: den Satz, der dich an genau diese Geschichte erinnert." />
                    <Textfeld label="Kurzinfos" mehrzeilig zeilen={2} wert={iv.kurzinfos} onChange={(kurzinfos) => s({ ...iv, kurzinfos })} fehler={f('kurzinfos')} hinweis={namenHinweis(iv.kurzinfos)} hilfe="Zwei, drei Fakten: Welche Art Kund*in war das? Bei jedem Interview dieselben – ohne die Person erkennbar zu machen." />
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
