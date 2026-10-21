import { useId } from 'react';

interface Props {
  label: string;
  wert: string;
  onChange: (neu: string) => void;
  fehler?: string;
  hilfe?: string;
  // Hinweis, der das Speichern nicht sperrt (z. B. ein Name im Interview).
  hinweis?: string;
  mehrzeilig?: boolean;
  zeilen?: number;
}

export default function Textfeld({ label, wert, onChange, fehler, hilfe, hinweis, mehrzeilig = false, zeilen = 3 }: Props) {
  const id = useId();
  const hilfeId = `${id}-hilfe`;
  const fehlerId = `${id}-fehler`;
  const hinweisId = `${id}-hinweis`;
  const beschreibt = [hilfe ? hilfeId : null, fehler ? fehlerId : null, hinweis ? hinweisId : null].filter(Boolean).join(' ') || undefined;
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
      {hinweis && <p className="wk-feldhinweis" id={hinweisId}>{hinweis}</p>}
    </div>
  );
}
