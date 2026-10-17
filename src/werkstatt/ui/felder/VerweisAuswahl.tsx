// Verweise auf IDs der Mappe (I2-4, T1, E3): gewählte als Liste mit Entfernen, neue per Eingabe mit Vorschlägen.
import { Plus, X } from 'lucide-react';
import { useId, useState } from 'react';
import { istId } from '../../ids.js';

interface Props {
  label: string;
  werte: readonly string[];
  onChange: (neu: string[]) => void;
  /** Bekannte Ziele als Vorschläge, zum Beispiel die IDs der eigenen Interviews. */
  vorschlaege?: readonly { id: string; text: string }[];
  fehler?: string;
  hilfe?: string;
}

export default function VerweisAuswahl({ label, werte, onChange, vorschlaege = [], fehler, hilfe }: Props) {
  const id = useId();
  const [eingabe, setEingabe] = useState('');
  const [eigenerFehler, setEigenerFehler] = useState<string | null>(null);

  const hinzufuegen = () => {
    const wert = eingabe.trim().toUpperCase();
    if (wert === '') return;
    if (!istId(wert)) return setEigenerFehler('Ein Verweis muss eine ID wie I2-4 sein.');
    if (werte.includes(wert)) return setEigenerFehler(`${wert} steht schon in der Liste.`);
    setEigenerFehler(null);
    setEingabe('');
    onChange([...werte, wert]);
  };

  const zeigeFehler = eigenerFehler ?? fehler;
  const beschreibt = [hilfe ? `${id}-hilfe` : null, zeigeFehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;

  return (
    <fieldset className="wk-verweise">
      <legend>{label}</legend>
      {hilfe && <p className="wk-hilfe" id={`${id}-hilfe`}>{hilfe}</p>}
      {werte.length > 0 && (
        <ul className="wk-chips" aria-label={`${label}, gewählt`}>
          {werte.map((w) => (
            <li key={w}>
              <span>{w}</span>
              <button type="button" className="wk-knopf wk-icon" onClick={() => onChange(werte.filter((x) => x !== w))} aria-label={`${w} entfernen`}>
                <X size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="wk-verweis-neu">
        <label htmlFor={`${id}-neu`} className="wk-nur-leser">Neue ID für {label}</label>
        <input
          id={`${id}-neu`}
          type="text"
          value={eingabe}
          list={vorschlaege.length ? `${id}-liste` : undefined}
          placeholder="zum Beispiel I2-4"
          aria-invalid={zeigeFehler ? true : undefined}
          aria-describedby={beschreibt}
          onChange={(e) => { setEingabe(e.target.value); setEigenerFehler(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); hinzufuegen(); } }}
        />
        {vorschlaege.length > 0 && (
          <datalist id={`${id}-liste`}>
            {vorschlaege.map((v) => <option key={v.id} value={v.id}>{v.text}</option>)}
          </datalist>
        )}
        <button type="button" className="wk-knopf" onClick={hinzufuegen}>
          <Plus size={16} aria-hidden="true" /> Hinzufügen
        </button>
      </div>
      {zeigeFehler && <p className="wk-fehler" id={`${id}-fehler`}>{zeigeFehler}</p>}
    </fieldset>
  );
}
