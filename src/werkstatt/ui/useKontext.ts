// Lädt den Kontext für den Zeigen-Modus (Annahmen-Map und Leitfaden einer Person), sparsam (GitHub-Kontingent): erst,
// wenn der Kontext für diese Person offen ist, und wieder, wenn sich neu ändert („Neu laden“, neu geladene Matrix) –
// bei zugeklapptem Kontext erst beim nächsten Öffnen (mussKontextLaden). Kein Abfragen im Takt. Beim Neuladen bleibt
// der alte Stand sichtbar und dient als Vergleich für „neu“; das erste Laden einer Person markiert nichts.
// holen liefert die Antwort der API; übernommen werden nur die geprüften Daten (kontextDaten), nie Feedback oder roher
// Text. beiFehler bekommt jeden Fehler (etwa 401/403: abgemeldet).
import { useEffect, useRef, useState } from 'react';
import { KONTEXT_LEER, KONTEXT_NAMEN, kontextDaten, mussKontextLaden, type Kontext, type KontextName } from './kontext-hilfen.js';

export function useKontext(
  schluessel: string | null, offen: boolean, neu: string,
  holen: (name: KontextName) => Promise<{ daten: unknown }>, beiFehler?: (e: unknown) => void,
): Kontext {
  const [k, setK] = useState<{ schluessel: string | null; kontext: Kontext }>({ schluessel: null, kontext: KONTEXT_LEER });
  const holenRef = useRef({ holen, beiFehler });
  holenRef.current = { holen, beiFehler };
  const person = useRef<string | null>(null);
  const geladenMit = useRef<string | null>(null);
  // Jede neue Ladung und jeder Personenwechsel zählt hoch; nur die letzte Ladung schreibt (Zuklappen bricht nicht ab).
  const lauf = useRef(0);

  useEffect(() => {
    if (person.current !== schluessel) {
      person.current = schluessel;
      geladenMit.current = null;
      lauf.current++;
      setK({ schluessel, kontext: KONTEXT_LEER });
    }
    if (schluessel === null || !mussKontextLaden(offen, geladenMit.current, neu)) return;
    geladenMit.current = neu;
    const mein = ++lauf.current;
    setK((alt) => {
      const basis = alt.schluessel === schluessel ? alt.kontext : KONTEXT_LEER;
      return { schluessel, kontext: { annahmen: { ...basis.annahmen, laedt: true, fehler: false }, leitfaden: { ...basis.leitfaden, laedt: true, fehler: false } } };
    });
    for (const name of KONTEXT_NAMEN) {
      holenRef.current.holen(name).then(
        (antwort) => {
          if (mein !== lauf.current) return;
          const daten = kontextDaten(name, antwort);
          setK((alt) => {
            if (alt.schluessel !== schluessel) return alt;
            const vorher = alt.kontext[name].stand;
            return { ...alt, kontext: { ...alt.kontext, [name]: { laedt: false, fehler: false, stand: { daten, vorher: vorher ? { daten: vorher.daten } : null } } } };
          });
        },
        (e) => {
          if (mein !== lauf.current) return;
          holenRef.current.beiFehler?.(e);
          // Beim nächsten Öffnen noch einmal versuchen.
          if (geladenMit.current === neu) geladenMit.current = null;
          setK((alt) => (alt.schluessel !== schluessel ? alt : { ...alt, kontext: { ...alt.kontext, [name]: { ...alt.kontext[name], laedt: false, fehler: true } } }));
        },
      );
    }
  }, [schluessel, offen, neu]);

  return k.schluessel === schluessel ? k.kontext : KONTEXT_LEER;
}
