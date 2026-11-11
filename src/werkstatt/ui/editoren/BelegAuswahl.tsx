// Belege einer Chance: die Zitate des eigenen Interviews als Liste zum Ankreuzen, mit vollem Text.
// Ersetzt im Interview-Editor das freie ID-Feld (VerweisAuswahl): Das Schema verlangt ohnehin, dass jeder Beleg ein
// Zitat desselben Interviews ist, also gibt es nur diese zur Wahl. Ein gewähltes Zitat, dessen Text inzwischen leer
// ist, bleibt als Zeile stehen; ein Beleg auf ein gelöschtes Zitat (Waise) auch – so sieht man beide und kann abwählen.
import { useId } from 'react';
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

export default function BelegAuswahl({ label, zitate, werte, onChange, hilfe, fehler, hinweis }: Props) {
  const id = useId();
  const leer = zitateMitText(zitate).length === 0;
  // Zeilen: Zitate mit Text und gewählte, deren Text leer ist – in der Reihenfolge der Zitate.
  const zeilen = zitate.filter((z) => z.text.trim() !== '' || werte.includes(z.id));
  const waisen = waisenVon(werte, zitate);
  const umschalten = (zitatId: string, an: boolean) => onChange(belegUmschalten(werte, zitatId, an, zitate));

  // Ein Fehler geht vor: dann kein weicher Hinweis daneben.
  const zeigeHinweis = fehler ? undefined : hinweis;
  const beschreibt = [hilfe ? `${id}-hilfe` : null, leer ? `${id}-leer` : null, fehler ? `${id}-fehler` : null, zeigeHinweis ? `${id}-hinweis` : null].filter(Boolean).join(' ') || undefined;
  const kaestchen = { 'aria-invalid': fehler ? true : undefined, 'aria-describedby': fehler ? `${id}-fehler` : undefined } as const;

  return (
    <fieldset className="wk-verweise wk-belegwahl" aria-describedby={beschreibt}>
      <legend>{label}</legend>
      {hilfe && <p className="wk-hilfe" id={`${id}-hilfe`}>{hilfe}</p>}
      {leer && (
        <p className="wk-hilfe" id={`${id}-leer`}>Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du sie hier ankreuzen.</p>
      )}
      {zeilen.map((z, i) => (
        // Index im Schlüssel: Ein Entwurf kann doppelte IDs haben (das Schema meldet sie), React braucht trotzdem eindeutige.
        <label className="wk-beleg" key={`${z.id}-${i}`}>
          <input type="checkbox" checked={werte.includes(z.id)} onChange={(e) => umschalten(z.id, e.target.checked)} {...kaestchen} />
          <span className="wk-karte-nr">{z.id}</span>
          {z.text.trim() !== ''
            ? <span className="wk-beleg-text">„{z.text}“</span>
            : <span className="wk-beleg-text wk-beleg-leer">(Zitat noch leer)</span>}
        </label>
      ))}
      {waisen.map((w) => (
        <label className="wk-beleg wk-beleg-waise" key={`waise-${w}`}>
          <input type="checkbox" checked onChange={() => umschalten(w, false)} {...kaestchen} />
          <span className="wk-karte-nr">{w}</span>
          <span className="wk-beleg-text">– dieses Zitat gibt es nicht mehr</span>
        </label>
      ))}
      {fehler && <p className="wk-fehler" id={`${id}-fehler`}>{fehler}</p>}
      {zeigeHinweis && <p className="wk-feldhinweis" id={`${id}-hinweis`}>{zeigeHinweis}</p>}
    </fieldset>
  );
}
