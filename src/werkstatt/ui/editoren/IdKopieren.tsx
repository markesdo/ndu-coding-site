// ID-Zeile mit Kopier-Knopf: Zitat-IDs (I1-1) landen in Chancen/Belegen und in den Beleg-IDs der Annahmen-Map.
// Kopiert wird nur die ID. Klappt die Zwischenablage nicht, wird die ID markiert (⌘C/Strg+C) und die Zeile sagt das.
// Wortlaut wie überall beim Kopieren: kopierMeldung aus lib/kopieren.
import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState, type Ref } from 'react';
import { kopiereText, kopierMeldung, type KopierErgebnis } from '../../../lib/kopieren.js';

// „Kopiert“ kurz; „Markiert“ länger, damit Zeit für ⌘C bleibt.
export const ANZEIGE_MS: Record<KopierErgebnis, number> = { kopiert: 1500, markiert: 4000 };
// Erst leeren, dann setzen: So sagt der Screenreader auch ein zweites „Kopiert“ hintereinander an.
export const ANSAGE_MS = 50;

/** Ablauf eines Klicks, ohne React: kopieren, Ansage leeren und neu setzen, nach der Anzeigedauer wieder leeren.
 *  `aktiv` meldet, ob die Zeile noch steht – nach dem Löschen der Zeile wird nichts mehr gesetzt. */
export function kopierAblauf(setze: (ergebnis: KopierErgebnis | null) => void, aktiv: () => boolean) {
  let ansage: ReturnType<typeof setTimeout> | undefined;
  let ende: ReturnType<typeof setTimeout> | undefined;
  const stopp = () => { clearTimeout(ansage); clearTimeout(ende); };
  return {
    stopp,
    async kopieren(id: string, zumMarkieren: Node | null) {
      const ergebnis = await kopiereText(id, zumMarkieren);
      if (!aktiv()) return;
      stopp();
      setze(null);
      ansage = setTimeout(() => {
        if (!aktiv()) return;
        setze(ergebnis);
        ende = setTimeout(() => { if (aktiv()) setze(null); }, ANZEIGE_MS[ergebnis]);
      }, ANSAGE_MS);
    },
  };
}

/** Nur die Anzeige – getrennt, damit ein Test alle Zustände ohne DOM prüfen kann. */
export function IdZeileAnsicht({ art, id, ergebnis, plattform, onKopieren, idRef }: {
  art: 'Zitat' | 'Interview';
  id: string;
  ergebnis: KopierErgebnis | null;
  plattform: string;
  onKopieren: () => void;
  idRef?: Ref<HTMLElement>;
}) {
  return (
    <p className="wk-hilfe wk-id-zeile">
      ID: <strong ref={idRef}>{id}</strong>
      <button type="button" className="wk-id-kopieren" aria-label={`${art}-ID ${id} kopieren`} title="ID kopieren" onClick={onKopieren}>
        {ergebnis === 'kopiert' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      </button>
      <span className={`wk-id-meldung${ergebnis ? ` wk-id-${ergebnis}` : ''}`} aria-live="polite">{ergebnis ? kopierMeldung(ergebnis, plattform) : ''}</span>
    </p>
  );
}

export default function IdZeile({ art, id }: { art: 'Zitat' | 'Interview'; id: string }) {
  const [ergebnis, setErgebnis] = useState<KopierErgebnis | null>(null);
  const idRef = useRef<HTMLElement>(null);
  const steht = useRef(false);
  const ablauf = useRef<ReturnType<typeof kopierAblauf> | null>(null);
  ablauf.current ??= kopierAblauf(setErgebnis, () => steht.current);
  useEffect(() => {
    steht.current = true;
    return () => { steht.current = false; ablauf.current?.stopp(); };
  }, []);
  const plattform = typeof navigator === 'undefined' ? '' : navigator.platform;
  return <IdZeileAnsicht art={art} id={id} ergebnis={ergebnis} plattform={plattform} onKopieren={() => void ablauf.current?.kopieren(id, idRef.current)} idRef={idRef} />;
}
