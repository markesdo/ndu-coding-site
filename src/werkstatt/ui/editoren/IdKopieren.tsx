// ID-Zeile mit Kopier-Knopf: Zitat-IDs (I1-1) landen in Chancen/Belegen und in den Beleg-IDs der Annahmen-Map.
// Kopiert wird nur die ID. Klappt die Zwischenablage nicht, wird die ID markiert (⌘C/Strg+C) und die Zeile sagt das.
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState, type Ref } from 'react';
import { kopiereText } from '../../../lib/kopieren.js';

export const ID_KOPIERT = 'kopiert';
export const ID_MARKIERT = 'Zum Kopieren markiert';
// „kopiert“ kurz; „markiert“ länger, damit Zeit für ⌘C bleibt.
const ANZEIGE_MS = { [ID_KOPIERT]: 1500, [ID_MARKIERT]: 4000 } as Record<string, number>;

/** Kopiert genau die ID; gibt die Meldung für die Zeile zurück. */
export async function idKopieren(id: string, zumMarkieren: Node | null): Promise<string> {
  return (await kopiereText(id, zumMarkieren)) === 'kopiert' ? ID_KOPIERT : ID_MARKIERT;
}

/** Nur die Anzeige – getrennt, damit ein Test beide Zustände ohne DOM prüfen kann. */
export function IdZeileAnsicht({ art, id, meldung, onKopieren, idRef }: {
  art: 'Zitat' | 'Interview';
  id: string;
  meldung: string;
  onKopieren: () => void;
  idRef?: Ref<HTMLElement>;
}) {
  return (
    <p className="wk-hilfe wk-id-zeile">
      ID: <strong ref={idRef}>{id}</strong>
      <button type="button" className="wk-id-kopieren" aria-label={`${art}-ID ${id} kopieren`} title="ID kopieren" onClick={onKopieren}>
        {meldung === ID_KOPIERT ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
      <span className="wk-id-meldung" aria-live="polite">{meldung}</span>
    </p>
  );
}

export default function IdZeile({ art, id }: { art: 'Zitat' | 'Interview'; id: string }) {
  const [meldung, setMeldung] = useState('');
  const idRef = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const kopieren = async () => {
    const m = await idKopieren(id, idRef.current);
    setMeldung(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMeldung(''), ANZEIGE_MS[m]);
  };
  return <IdZeileAnsicht art={art} id={id} meldung={meldung} onKopieren={() => void kopieren()} idRef={idRef} />;
}
