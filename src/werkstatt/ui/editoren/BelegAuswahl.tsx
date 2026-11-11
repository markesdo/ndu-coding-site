// Belege einer Chance: die Zitate des eigenen Interviews als Liste zum Ankreuzen, mit vollem Text.
// Ersetzt im Interview-Editor das freie ID-Feld (VerweisAuswahl): Das Schema verlangt ohnehin, dass jeder Beleg ein
// Zitat desselben Interviews ist, also gibt es nur diese zur Wahl. Ein gewähltes Zitat, dessen Text inzwischen leer
// ist, bleibt als Zeile stehen; ein Beleg auf ein gelöschtes Zitat (Waise) auch – so sieht man beide und kann abwählen.
// Die Kästchen stecken in einem einklappbaren <details>. Ist es zu, steht darüber die Liste der gewählten Zitate (auch
// leere und Waisen), damit nichts Angekreuztes verborgen ist; ist es offen, zeigen die Haken dasselbe.
import { useEffect, useId, useState } from 'react';
import { belegUmschalten, waisen as waisenVon, zitateMitText } from './interviews-hilfen.js';

interface Props {
  label: string;
  zitate: readonly { id: string; text: string }[];
  werte: readonly string[];
  onChange: (neu: string[]) => void;
  hilfe?: string;
  fehler?: string;
  // Hinweis, der das Speichern nicht sperrt (z. B. eine Chance ohne Beleg).
  hinweis?: string;
}

function ZitatText({ zitat }: { zitat: { id: string; text: string } }) {
  return (
    <>
      <span className="wk-karte-nr">{zitat.id}</span>
      {zitat.text.trim() !== ''
        ? <span className="wk-beleg-text">„{zitat.text}“</span>
        : <span className="wk-beleg-text wk-beleg-leer">(Zitat noch leer)</span>}
    </>
  );
}

function WaiseText({ id }: { id: string }) {
  return (
    <>
      <span className="wk-karte-nr">{id}</span>
      <span className="wk-beleg-text">– dieses Zitat gibt es nicht mehr</span>
    </>
  );
}

export default function BelegAuswahl({ label, zitate, werte, onChange, hilfe, fehler, hinweis }: Props) {
  const id = useId();
  const mitText = zitateMitText(zitate);
  const leer = mitText.length === 0;
  // Zeilen: Zitate mit Text und gewählte, deren Text leer ist – in der Reihenfolge der Zitate.
  const zeilen = zitate.filter((z) => z.text.trim() !== '' || werte.includes(z.id));
  const waisen = waisenVon(werte, zitate);
  const umschalten = (zitatId: string, an: boolean) => onChange(belegUmschalten(werte, zitatId, an, zitate));
  // Gewählte für die Liste über der zugeklappten Auswahl: je ID einmal, auch bei doppelten IDs im Entwurf.
  const gewaehlt = zeilen.filter((z, i) => werte.includes(z.id) && zeilen.findIndex((y) => y.id === z.id) === i);
  // Zähler: beide Zahlen auf derselben Grundlage, den Zitaten mit Text.
  const anzahlGewaehlt = new Set(werte.filter((w) => mitText.some((z) => z.id === w))).size;

  // Ein Fehler geht vor: dann kein weicher Hinweis daneben.
  const zeigeHinweis = fehler ? undefined : hinweis;

  // Anfangs offen, wenn nichts gewählt ist oder ein Fehler anliegt. Danach bestimmt die Person (onToggle); nur wenn ein
  // Fehler oder Hinweis neu auftaucht, geht die Auswahl auf, damit beide nicht auf verborgene Kästchen zeigen.
  const [offen, setOffen] = useState(() => werte.length === 0 || !!fehler);
  const meldung = !!fehler || !!zeigeHinweis;
  useEffect(() => {
    if (meldung) setOffen(true);
  }, [meldung]);

  const beschreibt = [hilfe ? `${id}-hilfe` : null, leer ? `${id}-leer` : null, fehler ? `${id}-fehler` : null, zeigeHinweis ? `${id}-hinweis` : null].filter(Boolean).join(' ') || undefined;
  const kaestchen = { 'aria-invalid': fehler ? true : undefined, 'aria-describedby': fehler ? `${id}-fehler` : undefined } as const;
  const hatZeilen = zeilen.length > 0 || waisen.length > 0;

  return (
    <fieldset className="wk-verweise wk-belegwahl" aria-describedby={beschreibt}>
      <legend>{label}</legend>
      {hilfe && <p className="wk-hilfe" id={`${id}-hilfe`}>{hilfe}</p>}
      {leer && (
        <p className="wk-hilfe" id={`${id}-leer`}>Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du sie hier ankreuzen.</p>
      )}
      {hatZeilen && !offen && (gewaehlt.length > 0 || waisen.length > 0) && (
        <ul className="wk-belege-gewaehlt" aria-label="Gewählte Zitate">
          {gewaehlt.map((z) => <li key={z.id}><ZitatText zitat={z} /></li>)}
          {waisen.map((w) => <li className="wk-beleg-waise" key={`waise-${w}`}><WaiseText id={w} /></li>)}
        </ul>
      )}
      {hatZeilen && (
        <details className="wk-belege-auswahl" open={offen} onToggle={(e) => setOffen(e.currentTarget.open)}>
          <summary className="wk-knopf">Zitate auswählen ({anzahlGewaehlt} von {mitText.length} gewählt)</summary>
          <div className="wk-belege-zeilen">
            {zeilen.map((z, i) => (
              // Index im Schlüssel: Ein Entwurf kann doppelte IDs haben (das Schema meldet sie), React braucht trotzdem eindeutige.
              <label className="wk-beleg" key={`${z.id}-${i}`}>
                <input type="checkbox" checked={werte.includes(z.id)} onChange={(e) => umschalten(z.id, e.target.checked)} {...kaestchen} />
                <ZitatText zitat={z} />
              </label>
            ))}
            {waisen.map((w) => (
              <label className="wk-beleg wk-beleg-waise" key={`waise-${w}`}>
                <input type="checkbox" checked onChange={() => umschalten(w, false)} {...kaestchen} />
                <WaiseText id={w} />
              </label>
            ))}
          </div>
        </details>
      )}
      {fehler && <p className="wk-fehler" id={`${id}-fehler`}>{fehler}</p>}
      {zeigeHinweis && <p className="wk-feldhinweis" id={`${id}-hinweis`}>{zeigeHinweis}</p>}
    </fieldset>
  );
}
