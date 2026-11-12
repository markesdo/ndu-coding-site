// Zeigen-Modus im Leser der Lehrenden: die Snapshots einer Person groß, einer nach dem anderen, zum Teilen des
// Bildschirms (Teams). Eigene Komponente, die nur Snapshots kennt: Feedback der Lehrenden, Lücken, „Was noch fehlt“
// und Links ins Repo hängen hier nie im Baum und können so nicht auf dem geteilten Bildschirm landen.
// Zustand, Laden und Tasten (←/→, Esc, K, 1–4, F) liegen in LehrendenAnsicht.tsx bzw. DemoZeigen.tsx; das hier zeichnet nur.
// Der Kontext (K, KontextPanel) bekommt nur die geprüften Daten von Annahmen-Map und Leitfaden, nie Feedback.
// Unten die Fragen-Leiste (1–4, F): fester Kursinhalt aus fragen-leiste.ts, nie Daten aus der Mappe.
import { ChevronLeft, ChevronRight, CloudOff, EyeOff, MessageCircleQuestion, PanelRight, RefreshCw, X } from 'lucide-react';
import type { Ref } from 'react';
import type { Interview } from '../schemas/index.js';
import { FRAGEN, frageText } from './fragen-leiste.js';
import { kontextNeuIds, meldungMitKontext, type Kontext, type KontextName } from './kontext-hilfen.js';
import KontextPanel from './KontextPanel.js';
import { standText } from './lehrenden-hilfen.js';
import SnapshotAnsicht from './SnapshotAnsicht.js';
import { neueEintraege } from './snapshot-hilfen.js';

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
  // Uhr der Lehrendenansicht (zählt jede Minute weiter) für „Stand HH:MM“ bzw. „Stand vor N Min.“.
  jetzt: number;
  meldung: string;
  // Kontext neben dem Snapshot (Taste K); zu, solange kontextOffen false.
  kontext: Kontext;
  kontextOffen: boolean;
  kontextReiter: KontextName;
  kontextUmschalten: () => void;
  reiterWaehlen: (r: KontextName) => void;
  // Fragen-Leiste unten (Tasten 1–4 und F): welche Frage (ab 0) und ob eingeblendet.
  frage: number;
  fragenOffen: boolean;
  frageWaehlen: (nr: number) => void;
  fragenUmschalten: () => void;
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
  // Nach „Neu laden“ nennt die Meldung auch, was im offenen Kontext neu ist (zu: wird er nicht mitgeladen).
  const meldung = p.kontextOffen ? meldungMitKontext(p.meldung, kontextNeuIds(p.kontext)) : p.meldung;
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
            {p.laedt ? 'lädt …' : [meldung, p.stand !== null ? standText(p.stand, p.jetzt) : ''].filter(Boolean).join(' · ')}
          </span>
          {/* aria-disabled statt disabled: ein gesperrter Knopf verlöre den Fokus, dann kämen ←/→ nicht mehr im Dialog an. */}
          <button type="button" className="wk-knopf" aria-disabled={p.laedt} onClick={() => !p.laedt && p.neuLaden()}>
            <RefreshCw size={18} aria-hidden="true" /> Neu laden
          </button>
          <button type="button" className="wk-knopf" aria-expanded={p.kontextOffen} aria-controls={p.kontextOffen ? 'zg-kontext' : undefined} aria-keyshortcuts="K" onClick={p.kontextUmschalten}>
            <PanelRight size={18} aria-hidden="true" /> Kontext (K)
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
      <div className={p.kontextOffen ? 'zg-flaeche zg-mit-kontext' : 'zg-flaeche'}>
        <div className="zg-buehne" aria-busy={p.laedt}>
          {p.fehler && <p className="wk-hinweis" role="alert"><CloudOff size={18} aria-hidden="true" /> {p.fehler}</p>}
          {p.interviews === null
            ? !p.fehler && <p className="zg-leer">Lese die Interviews …</p>
            : iv ? <SnapshotAnsicht iv={iv} neu={neueEintraege(p.vorher, iv)} /> : <p className="zg-leer">Noch keine Interviews eingetragen.</p>}
        </div>
        {p.kontextOffen && <KontextPanel kontext={p.kontext} reiter={p.kontextReiter} reiterWaehlen={p.reiterWaehlen} iv={iv} />}
      </div>
      <FragenLeiste frage={p.frage} offen={p.fragenOffen} waehlen={p.frageWaehlen} umschalten={p.fragenUmschalten} />
    </div>
  );
}

// Eine Zeile unter Snapshot und Kontext. Der Knopf zum Aus- und Einblenden bleibt dasselbe Element (letztes Kind),
// damit der Fokus beim Umschalten nicht auf body fällt (sonst kämen ←/→, Esc, K, 1–4 und F nicht mehr im Dialog an).
function FragenLeiste({ frage, offen, waehlen, umschalten }: { frage: number; offen: boolean; waehlen: (nr: number) => void; umschalten: () => void }) {
  const t = frageText(frage);
  return (
    <footer className={offen ? 'zg-leiste' : 'zg-leiste zg-leiste-zu'} aria-label="Frage der Besprechung">
      {offen && (
        <div className="zg-leiste-nr" role="group" aria-label="Frage wählen (Tasten 1 bis 4)">
          {FRAGEN.map((_, i) => (
            <button key={i} type="button" className="zg-leiste-knopf" aria-pressed={frage === i} aria-label={`Frage ${i + 1}`} aria-keyshortcuts={String(i + 1)} onClick={() => waehlen(i)}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {offen && <p className="zg-leiste-text" title={t}>{t}</p>}
      <button
        type="button" className={offen ? 'wk-knopf wk-icon zg-leiste-schalter' : 'wk-knopf zg-leiste-schalter'} aria-expanded={offen} aria-keyshortcuts="F"
        aria-label={offen ? 'Fragen ausblenden (F)' : undefined} title={offen ? 'Fragen ausblenden (F)' : undefined} onClick={umschalten}
      >
        {offen ? <EyeOff size={18} aria-hidden="true" /> : <><MessageCircleQuestion size={18} aria-hidden="true" /> Fragen (F)</>}
      </button>
    </footer>
  );
}
