import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useId, useRef, type ReactNode } from 'react';
import { schluesselAbgleichen, schluesselSchieben } from './schluessel.js';

interface Props<T> {
  /** Überschrift der ganzen Liste, zum Beispiel „Annahmen“. */
  label: string;
  /** Einzahl für die Knöpfe, zum Beispiel „Annahme“ → „Annahme hinzufügen“. */
  einzahl: string;
  eintraege: readonly T[];
  onChange: (neu: T[]) => void;
  /** Neuer Eintrag; bekommt die vorhandenen, damit er eine freie ID wählen kann. */
  neu: (vorhandene: readonly T[]) => T;
  /** Felder einer Zeile. `setze` ersetzt den Eintrag. */
  zeile: (eintrag: T, setze: (neu: T) => void, index: number) => ReactNode;
  fehler?: string;
}

export default function Liste<T>({ label, einzahl, eintraege, onChange, neu, zeile, fehler }: Props<T>) {
  const id = useId();
  // Eigene, vom Inhalt unabhängige Schlüssel (nicht die editierbare ID): Beim Tippen in ein ID-Feld bleibt die Zeile dieselbe.
  const zaehler = useRef({ n: 0 });
  const schluessel = useRef<string[]>([]);
  schluessel.current = schluesselAbgleichen(schluessel.current, eintraege.length, zaehler.current);

  const ersetze = (i: number, e: T) => onChange(eintraege.map((alt, j) => (j === i ? e : alt)));
  const entferne = (i: number) => {
    schluessel.current = schluessel.current.filter((_, j) => j !== i);
    onChange(eintraege.filter((_, j) => j !== i));
  };
  const schiebe = (i: number, d: -1 | 1) => {
    schluessel.current = schluesselSchieben(schluessel.current, i, d);
    const kopie = [...eintraege];
    [kopie[i], kopie[i + d]] = [kopie[i + d], kopie[i]];
    onChange(kopie);
  };
  return (
    <fieldset className="wk-liste" aria-describedby={fehler ? `${id}-fehler` : undefined}>
      <legend>{label}</legend>
      {eintraege.length === 0 && <p className="wk-hilfe">Noch kein Eintrag.</p>}
      <ol>
        {eintraege.map((e, i) => (
          <li key={schluessel.current[i]} className="wk-zeile">
            <div className="wk-zeile-felder">{zeile(e, (n) => ersetze(i, n), i)}</div>
            <div className="wk-zeile-knoepfe">
              <button type="button" className="wk-knopf wk-icon" onClick={() => schiebe(i, -1)} disabled={i === 0} aria-label={`${einzahl} ${i + 1} nach oben`}>
                <ArrowUp size={16} aria-hidden="true" />
              </button>
              <button type="button" className="wk-knopf wk-icon" onClick={() => schiebe(i, 1)} disabled={i === eintraege.length - 1} aria-label={`${einzahl} ${i + 1} nach unten`}>
                <ArrowDown size={16} aria-hidden="true" />
              </button>
              <button type="button" className="wk-knopf wk-icon" onClick={() => entferne(i)} aria-label={`${einzahl} ${i + 1} entfernen`}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ol>
      {fehler && <p className="wk-fehler" id={`${id}-fehler`}>{fehler}</p>}
      <button type="button" className="wk-knopf" onClick={() => onChange([...eintraege, neu(eintraege)])}>
        <Plus size={16} aria-hidden="true" /> {einzahl} hinzufügen
      </button>
    </fieldset>
  );
}
