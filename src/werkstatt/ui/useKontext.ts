// Lädt den Kontext für den Zeigen-Modus (Annahmen-Map und Leitfaden einer Person): einmal, wenn Zeigen startet oder die
// Person wechselt, und wieder bei „Neu laden“ (neu zählt hoch). Kein Abfragen im Takt (GitHub-Kontingent). Beim Neuladen
// bleibt der alte Stand sichtbar und dient als Vergleich für „neu“. holen liefert die Antwort der API; übernommen
// werden nur die geprüften Daten (kontextDaten), nie Feedback oder roher Text.
import { useEffect, useRef, useState } from 'react';
import { KONTEXT_LEER, KONTEXT_NAMEN, kontextDaten, type Kontext, type KontextName } from './kontext-hilfen.js';

export function useKontext(schluessel: string | null, neu: number, holen: (name: KontextName) => Promise<{ daten: unknown }>): Kontext {
  const [k, setK] = useState<{ schluessel: string | null; kontext: Kontext }>({ schluessel: null, kontext: KONTEXT_LEER });
  const holenRef = useRef(holen);
  holenRef.current = holen;
  const letzter = useRef<string | null>(null);

  useEffect(() => {
    const gleich = schluessel !== null && letzter.current === schluessel;
    letzter.current = schluessel;
    if (schluessel === null) {
      setK({ schluessel: null, kontext: KONTEXT_LEER });
      return;
    }
    let gilt = true;
    setK((alt) => {
      const basis = gleich && alt.schluessel === schluessel ? alt.kontext : KONTEXT_LEER;
      return { schluessel, kontext: { annahmen: { ...basis.annahmen, laedt: true, fehler: false }, leitfaden: { ...basis.leitfaden, laedt: true, fehler: false } } };
    });
    for (const name of KONTEXT_NAMEN) {
      holenRef.current(name).then(
        (antwort) => {
          if (!gilt) return;
          const daten = kontextDaten(name, antwort);
          setK((alt) => {
            if (alt.schluessel !== schluessel) return alt;
            const vorher = alt.kontext[name].stand;
            return { ...alt, kontext: { ...alt.kontext, [name]: { laedt: false, fehler: false, stand: { daten, vorher: vorher ? { daten: vorher.daten } : null } } } };
          });
        },
        () => {
          if (!gilt) return;
          setK((alt) => (alt.schluessel !== schluessel ? alt : { ...alt, kontext: { ...alt.kontext, [name]: { ...alt.kontext[name], laedt: false, fehler: true } } }));
        },
      );
    }
    return () => { gilt = false; };
  }, [schluessel, neu]);

  return k.schluessel === schluessel ? k.kontext : KONTEXT_LEER;
}
