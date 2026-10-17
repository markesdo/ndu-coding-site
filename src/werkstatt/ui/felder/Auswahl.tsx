import { useId } from 'react';

interface Props<W extends string> {
  label: string;
  wert: W;
  optionen: readonly { wert: W; text: string }[];
  onChange: (neu: W) => void;
  fehler?: string;
  hilfe?: string;
}

export default function Auswahl<W extends string>({ label, wert, optionen, onChange, fehler, hilfe }: Props<W>) {
  const id = useId();
  const hilfeId = `${id}-hilfe`;
  const fehlerId = `${id}-fehler`;
  const beschreibt = [hilfe ? hilfeId : null, fehler ? fehlerId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="wk-feld">
      <label htmlFor={id}>{label}</label>
      {hilfe && <p className="wk-hilfe" id={hilfeId}>{hilfe}</p>}
      <select id={id} value={wert} aria-invalid={fehler ? true : undefined} aria-describedby={beschreibt} onChange={(e) => onChange(e.target.value as W)}>
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert}>{o.text}</option>
        ))}
      </select>
      {fehler && <p className="wk-fehler" id={fehlerId}>{fehler}</p>}
    </div>
  );
}
