// Belege einer Chance: die Zitate des eigenen Interviews als Liste zum Ankreuzen, mit vollem Text.
// Ersetzt im Interview-Editor das freie ID-Feld (VerweisAuswahl): Das Schema verlangt ohnehin, dass jeder Beleg ein
// Zitat desselben Interviews ist, also gibt es nur diese zur Wahl. Verweise auf gelöschte oder geleerte Zitate
// bleiben als angekreuzte Zeile stehen, damit man sie sieht und abwählen kann.
import { useId } from 'react';
import { belegUmschalten } from './interviews-hilfen.js';

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
  const mitText = zitate.filter((z) => z.text.trim() !== '');
  const zitatIds = mitText.map((z) => z.id);
  const waisen = [...new Set(werte)].filter((w) => !zitatIds.includes(w));
  const umschalten = (zitatId: string, an: boolean) => onChange(belegUmschalten(werte, zitatId, an, zitatIds));

  // Ein Fehler geht vor: dann kein weicher Hinweis daneben.
  const zeigeHinweis = fehler ? undefined : hinweis;
  const beschreibt = [hilfe ? `${id}-hilfe` : null, fehler ? `${id}-fehler` : null, zeigeHinweis ? `${id}-hinweis` : null].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className="wk-verweise wk-belegwahl" aria-describedby={beschreibt}>
      <legend>{label}</legend>
      {hilfe && <p className="wk-hilfe" id={`${id}-hilfe`}>{hilfe}</p>}
      {mitText.length === 0 && (
        <p className="wk-hilfe">Noch keine Zitate: Trag zuerst oben unter „Zitate“ ein, was die Person wörtlich gesagt hat. Dann kannst du sie hier ankreuzen.</p>
      )}
      {mitText.map((z) => (
        <label className="wk-beleg" key={z.id}>
          <input type="checkbox" checked={werte.includes(z.id)} onChange={(e) => umschalten(z.id, e.target.checked)} />
          <span className="wk-karte-nr">{z.id}</span>
          <span>„{z.text}“</span>
        </label>
      ))}
      {waisen.map((w) => (
        <label className="wk-beleg wk-beleg-waise" key={w}>
          <input type="checkbox" checked onChange={() => umschalten(w, false)} />
          <span className="wk-karte-nr">{w}</span>
          <span>– dieses Zitat gibt es nicht mehr</span>
        </label>
      ))}
      {fehler && <p className="wk-fehler" id={`${id}-fehler`}>{fehler}</p>}
      {zeigeHinweis && <p className="wk-feldhinweis" id={`${id}-hinweis`}>{zeigeHinweis}</p>}
    </fieldset>
  );
}
