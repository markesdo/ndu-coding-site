import { useId } from 'react';

interface Props {
  label: string;
  wert: string;
  onChange: (neu: string) => void;
  fehler?: string;
  hilfe?: string;
  mehrzeilig?: boolean;
  zeilen?: number;
}

export default function Textfeld({ label, wert, onChange, fehler, hilfe, mehrzeilig = false, zeilen = 3 }: Props) {
  const id = useId();
  const hilfeId = `${id}-hilfe`;
  const fehlerId = `${id}-fehler`;
  const beschreibt = [hilfe ? hilfeId : null, fehler ? fehlerId : null].filter(Boolean).join(' ') || undefined;
  const gemeinsam = {
    id,
    value: wert,
    'aria-invalid': fehler ? true : undefined,
    'aria-describedby': beschreibt,
  } as const;
  return (
    <div className="wk-feld">
      <label htmlFor={id}>{label}</label>
      {hilfe && <p className="wk-hilfe" id={hilfeId}>{hilfe}</p>}
      {mehrzeilig ? (
        <textarea {...gemeinsam} rows={zeilen} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...gemeinsam} type="text" onChange={(e) => onChange(e.target.value)} />
      )}
      {fehler && <p className="wk-fehler" id={fehlerId}>{fehler}</p>}
    </div>
  );
}
