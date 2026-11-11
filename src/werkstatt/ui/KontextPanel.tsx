// Kontext im Zeigen-Modus (Zeigen.tsx, Taste K): Annahmen-Map und Interviewleitfaden der Person neben dem Snapshot,
// damit die Gruppe Frage 2 („Welche Annahme bekommt einen Beleg?“) und 3/4 („Welche Fragen haben funktioniert, was
// haben wir überhört?“) am selben Bildschirm beantwortet. Liegt außerhalb des Snapshots (Torres’ Vorlage bleibt, wie
// sie ist). Bekommt nur die geprüften Daten der Person (kontext-hilfen.ts): kein Feedback, keine Lücken, keine Zahlen,
// keine Warnungen. Nur Text, nie HTML oder rohe Dateien aus der Mappe.
import { CloudOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { ART_TEXT } from '../render/annahmen.js';
import { BELEGSTUFE_TEXT, quadrant, type Annahmen, type Interview, type Leitfaden } from '../schemas/index.js';
import { belegtImInterview, idAusInterview, interviewIds, neueAnnahmen, neuerLeitfaden, QUADRANT_TEXT, type Kontext, type KontextName, type KontextTeil } from './kontext-hilfen.js';
import { NeuMarke } from './SnapshotAnsicht.js';

export interface KontextPanelProps {
  kontext: Kontext;
  reiter: KontextName;
  reiterWaehlen: (r: KontextName) => void;
  // Der gezeigte Snapshot: Annahmen mit Belegen daraus werden hervorgehoben.
  iv: Interview | null;
}

const REITER: { name: KontextName; titel: string }[] = [
  { name: 'annahmen', titel: 'Annahmen' },
  { name: 'leitfaden', titel: 'Leitfaden' },
];

export default function KontextPanel({ kontext, reiter, reiterWaehlen, iv }: KontextPanelProps) {
  return (
    <aside className="zg-kontext" id="zg-kontext" aria-label="Kontext: Annahmen und Leitfaden">
      <div className="zg-reiter" role="group" aria-label="Kontext wählen">
        {REITER.map((r) => (
          <button key={r.name} type="button" className="zg-reiter-knopf" aria-pressed={reiter === r.name} onClick={() => reiterWaehlen(r.name)}>
            {r.titel}
          </button>
        ))}
      </div>
      <div className="zg-kontext-inhalt">
        {reiter === 'annahmen'
          ? <Teil teil={kontext.annahmen} leer="Noch keine Annahmen eingetragen.">{(d, s) => <AnnahmenListe d={d} neu={neueAnnahmen(s)} iv={iv} />}</Teil>
          : <Teil teil={kontext.leitfaden} leer="Noch kein Leitfaden.">{(d, s) => <LeitfadenListe d={d} neu={neuerLeitfaden(s)} />}</Teil>}
      </div>
    </aside>
  );
}

function Teil<T extends Annahmen | Leitfaden>({ teil, leer, children }: {
  teil: KontextTeil<T>; leer: string; children: (d: T, s: NonNullable<KontextTeil<T>['stand']>) => ReactNode;
}) {
  const s = teil.stand;
  // Noch nichts geladen: „lädt …“ (auch im ersten Bild nach Start oder Personenwechsel, bevor das Laden beginnt) –
  // „Noch keine …“ erst, wenn feststeht, dass nichts da ist; sonst blitzt es beim Wechsel auf dem geteilten Bildschirm.
  if (!s) {
    if (teil.fehler) return <p className="zg-kontext-hinweis"><CloudOff size={16} aria-hidden="true" /> Lässt sich gerade nicht laden.</p>;
    return <p className="zg-kontext-hinweis">lädt …</p>;
  }
  const istLeer = !s.daten || ('annahmen' in s.daten ? s.daten.annahmen.length === 0 : !s.daten.ziel.trim() && s.daten.fragen.length === 0);
  return (
    <>
      {teil.fehler && <p className="zg-kontext-hinweis"><CloudOff size={16} aria-hidden="true" /> Neu laden hat nicht geklappt.</p>}
      {istLeer || !s.daten ? <p className="zg-kontext-hinweis">{leer}</p> : children(s.daten, s)}
    </>
  );
}

function AnnahmenListe({ d, neu, iv }: { d: Annahmen; neu: ReadonlySet<string>; iv: Interview | null }) {
  const hier = interviewIds(iv);
  return (
    <ul className="zg-annahmen">
      {d.annahmen.map((a) => {
        const belegt = belegtImInterview(a, hier);
        const klassen = ['zg-annahme', belegt && 'zg-belegt', neu.has(a.id) && 'snap-neu'].filter(Boolean).join(' ');
        return (
          <li key={a.id} className={klassen}>
            <p className="zg-annahme-kopf">
              <strong className="zg-annahme-id">{a.id}</strong>
              {a.id === d.riskanteste && <span className="zg-marke">riskanteste</span>}
              {belegt && <span className="zg-marke zg-marke-beleg">Beleg aus diesem Interview</span>}
              {neu.has(a.id) && <NeuMarke />}
            </p>
            <p className="zg-annahme-text">{a.text}</p>
            <p className="zg-annahme-meta">
              {ART_TEXT[a.art]} · wichtig: {a.wichtig} · Beleg: {BELEGSTUFE_TEXT[a.beleg]} · {QUADRANT_TEXT[quadrant(a)]}
            </p>
            {(a.belegIds.some((b) => b.trim()) || a.belegNotiz?.trim()) && (
              <p className="zg-annahme-belege">
                {a.belegIds.filter((b) => b.trim()).map((b, i) => (
                  <span key={i} className={idAusInterview(b, hier) ? 'zg-id zg-id-hier' : 'zg-id'}>{b}</span>
                ))}
                {a.belegNotiz?.trim() && <span className="zg-notiz">{a.belegNotiz}</span>}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LeitfadenListe({ d, neu }: { d: Leitfaden; neu: { fragen: ReadonlySet<string>; ziel: boolean } }) {
  const gruppen = [
    { titel: 'Kernfragen', fragen: d.fragen.filter((f) => f.art === 'kern') },
    { titel: 'Nachfragen', fragen: d.fragen.filter((f) => f.art === 'nachfrage') },
  ].filter((g) => g.fragen.length > 0);
  return (
    <>
      {d.ziel.trim() && (
        <div className={neu.ziel ? 'zg-ziel snap-neu' : 'zg-ziel'}>
          <h4>Ziel{neu.ziel && <> <NeuMarke /></>}</h4>
          <p>{d.ziel}</p>
        </div>
      )}
      {gruppen.map((g) => (
        <div key={g.titel} className="zg-fragen">
          <h4>{g.titel}</h4>
          <ul>
            {g.fragen.map((f) => (
              <li key={f.id} className={neu.fragen.has(f.id) ? 'snap-neu' : undefined}>
                <strong className="zg-annahme-id">{f.id}</strong> {f.text}{neu.fragen.has(f.id) && <> <NeuMarke /></>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
