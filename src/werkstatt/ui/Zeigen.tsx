// Zeigen-Modus im Leser der Lehrenden: die Snapshots einer Person groß, einer nach dem anderen, zum Teilen des
// Bildschirms (Teams). Eigene Komponente, die nur Snapshots kennt: Feedback der Lehrenden, Lücken, „Was noch fehlt“
// und Links ins Repo hängen hier nie im Baum und können so nicht auf dem geteilten Bildschirm landen.
// Zustand, Laden und Tasten (←/→, Esc) liegen in LehrendenAnsicht.tsx; das hier zeichnet nur.
import { ChevronLeft, ChevronRight, CloudOff, RefreshCw, X } from 'lucide-react';
import type { Ref } from 'react';
import type { Interview } from '../schemas/index.js';
import SnapshotAnsicht from './SnapshotAnsicht.js';
import { neueEintraege } from './snapshot-hilfen.js';

const UHR = new Intl.DateTimeFormat('de-AT', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Vienna' });

export interface ZeigenProps {
  personen: readonly { kuerzel: string; anzahl: number }[];
  person: string;
  // null = noch nicht geladen.
  interviews: readonly Interview[] | null;
  // Stand vor dem letzten Neuladen derselben Person (für „neu“); null = erstes Laden.
  vorher: readonly Interview[] | null;
  nr: number;
  laedt: boolean;
  fehler: string | null;
  stand: number | null;
  meldung: string;
  wurzel?: Ref<HTMLDivElement>;
  personWaehlen: (kuerzel: string) => void;
  nrWaehlen: (nr: number) => void;
  blaettern: (richtung: -1 | 1) => void;
  neuLaden: () => void;
  beenden: () => void;
}

export default function Zeigen(p: ZeigenProps) {
  const ivs = p.interviews ?? [];
  const m = ivs.length;
  const iv = m > 0 ? ivs[Math.min(p.nr, m - 1)] : null;
  return (
    <div className="zg" tabIndex={-1} ref={p.wurzel}>
      <header className="zg-kopf">
        <h2 id="lv-leser-titel" className="wk-nur-leser">Zeigen: Interviews von {p.person}</h2>
        <nav className="zg-personen" aria-label="Person wählen">
          {p.personen.map((x) => {
            const aktiv = x.kuerzel === p.person;
            const anzahl = aktiv && p.interviews ? m : x.anzahl;
            return (
              <button
                key={x.kuerzel} type="button" className="wk-knopf zg-person" aria-current={aktiv ? 'true' : undefined}
                disabled={!aktiv && anzahl === 0} onClick={() => !aktiv && p.personWaehlen(x.kuerzel)}
              >
                {x.kuerzel} ({anzahl})
              </button>
            );
          })}
        </nav>
        <div className="zg-blaettern">
          <button type="button" className="wk-knopf wk-icon" aria-label="Vorheriger Snapshot" disabled={m < 2} onClick={() => p.blaettern(-1)}>
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span className="zg-zaehler" aria-live="polite" aria-atomic="true">{m > 0 ? `Snapshot ${Math.min(p.nr, m - 1) + 1} von ${m}` : 'Kein Snapshot'}</span>
          <button type="button" className="wk-knopf wk-icon" aria-label="Nächster Snapshot" disabled={m < 2} onClick={() => p.blaettern(1)}>
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="zg-laden">
          <span className="zg-stand" role="status">
            {p.laedt ? 'lädt …' : p.meldung ? `${p.meldung} · Stand ${p.stand !== null ? UHR.format(p.stand) : '–'}` : p.stand !== null ? `Stand ${UHR.format(p.stand)}` : ''}
          </span>
          {/* aria-disabled statt disabled: ein gesperrter Knopf verlöre den Fokus, dann kämen ←/→ nicht mehr im Dialog an. */}
          <button type="button" className="wk-knopf" aria-disabled={p.laedt} onClick={() => !p.laedt && p.neuLaden()}>
            <RefreshCw size={18} aria-hidden="true" /> Neu laden
          </button>
          <button type="button" className="wk-knopf" onClick={p.beenden}>
            <X size={18} aria-hidden="true" /> Zeigen beenden
          </button>
        </div>
      </header>
      {m > 1 && (
        <ol className="zg-chips" aria-label="Snapshots">
          {ivs.map((x, i) => (
            <li key={`${x.id}-${i}`}>
              <button type="button" className="zg-chip" aria-current={iv === x ? 'true' : undefined} onClick={() => p.nrWaehlen(i)}>
                {x.id}{x.zitat.trim() ? ` · „${x.zitat.trim()}“` : ''}
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="zg-buehne" aria-busy={p.laedt}>
        {p.fehler && <p className="wk-hinweis" role="alert"><CloudOff size={18} aria-hidden="true" /> {p.fehler}</p>}
        {p.interviews === null
          ? !p.fehler && <p className="zg-leer">Lese die Interviews …</p>
          : iv ? <SnapshotAnsicht iv={iv} neu={neueEintraege(p.vorher, iv)} /> : <p className="zg-leer">Noch keine Interviews eingetragen.</p>}
      </div>
    </div>
  );
}
