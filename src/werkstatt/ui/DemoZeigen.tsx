// Zeigen-Modus für die eigene Demo-Mappe der Lehrenden (MappeUebersicht, ?ansicht=demo): dieselbe große Ansicht wie
// im Leser der Lehrenden (Zeigen.tsx), hier für die eigenen Interviews – etwa um ein Beispiel im Kurs groß zu zeigen.
// Nur lesen: holt mappe/interviews.json über die eigene Mappe (api.lesen), schreibt nichts. ←/→ blättern, Esc schließt.
import { Presentation } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Interview } from '../schemas/index.js';
import { api, ApiError } from './api.js';
import { blaettern, neuMeldung, stelleNachId, tastenZiel, zeigbareInterviews } from './snapshot-hilfen.js';
import Zeigen from './Zeigen.js';

type Stand = { interviews: Interview[]; zeit: number; vorher: Interview[] | null };

export default function DemoZeigen({ person }: { person: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const wurzel = useRef<HTMLDivElement>(null);
  const knopf = useRef<HTMLButtonElement>(null);
  const [offen, setOffen] = useState(false);
  const [stand, setStand] = useState<Stand | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [jetzt, setJetzt] = useState(() => Date.now());
  const lauf = useRef(0);

  async function laden() {
    const mein = ++lauf.current;
    setLaedt(true);
    setFehler(null);
    try {
      const a = await api.lesen('interviews');
      if (mein !== lauf.current) return;
      const interviews = zeigbareInterviews(a.daten);
      setStand((alt) => ({ interviews, zeit: Date.now(), vorher: alt ? alt.interviews : null }));
    } catch (e) {
      if (mein === lauf.current) setFehler((e instanceof ApiError && e.message) || 'Die Interviews lassen sich gerade nicht laden.');
    } finally {
      if (mein === lauf.current) setLaedt(false);
    }
  }

  function oeffnen() {
    setStand(null);
    setId(null);
    setOffen(true);
    void laden();
  }

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (offen && !d.open) { d.showModal(); wurzel.current?.focus(); }
    if (!offen && d.open) d.close();
  }, [offen]);

  // „Stand vor N Min.“ weiterzählen, solange offen.
  useEffect(() => {
    if (!offen) return;
    const t = setInterval(() => setJetzt(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [offen]);

  const ivs = stand?.interviews ?? [];
  const nr = stelleNachId(ivs, id);

  function taste(e: KeyboardEvent<HTMLDialogElement>) {
    const ziel = tastenZiel(e.key, { zeigen: true, personen: [], person, nr, anzahl: ivs.length });
    if (ziel?.art !== 'snapshot') return;
    e.preventDefault();
    setId(ivs[ziel.nr].id);
  }

  return (
    <>
      <button type="button" ref={knopf} className="wk-knopf" data-werkstatt onClick={oeffnen}>
        <Presentation size={16} aria-hidden="true" /> Zeigen
      </button>
      <dialog
        ref={dialog} className="wk-dialog lv-leser lv-zeigen" aria-labelledby="lv-leser-titel" onKeyDown={taste}
        onClose={() => { setOffen(false); knopf.current?.focus(); }}
      >
        {offen && (
          <Zeigen
            personen={[{ kuerzel: person, anzahl: ivs.length }]} person={person} interviews={stand?.interviews ?? null} vorher={stand?.vorher ?? null}
            nr={nr} laedt={laedt} fehler={fehler} stand={stand?.zeit ?? null} jetzt={jetzt}
            meldung={neuMeldung(stand?.vorher ?? null, ivs)} wurzel={wurzel}
            personWaehlen={() => {}} nrWaehlen={(i) => ivs[i] && setId(ivs[i].id)}
            blaettern={(r) => ivs.length > 0 && setId(ivs[blaettern(nr, ivs.length, r)].id)}
            neuLaden={() => void laden()} beenden={() => setOffen(false)}
          />
        )}
      </dialog>
    </>
  );
}
