// Szene „Ein Stück nach dem anderen“ für /konzepte/llm (Tag 1). Logik und Texte: naechstes-stueck-steps.ts.
import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Dices } from 'lucide-react';
import Stage, { type StageNav, type StageStep } from './Stage';
import { STEPS, zustandAt, type Stueck, type Verteilung } from './naechstes-stueck-steps';
import './stage.css';

// `Code` in Backticks → <code>.
function inline(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

const stageSteps: StageStep[] = STEPS.map((s) => ({
  caption: (
    <>
      <strong>{inline(s.title)}</strong> {inline(s.text)}
    </>
  ),
  plain: `${s.title} ${s.text}`.replaceAll('`', ''),
}));

const alsText = (stuecke: Stueck[]) => stuecke.map((s) => s.text).join('').trim();

export default function NaechstesStueck() {
  return (
    <Stage title="Ein Stück nach dem anderen" steps={stageSteps}>
      {(nav, reduced) => <Szene nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Szene({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const z = zustandAt(nav.index + 1);
  const duration = reduced ? 0 : 0.4;

  return (
    <div className="ns">
      {z.vergleich ? (
        <div className="ns-vergleich">
          {z.vergleich.map((e) => (
            <div key={e.session} className="ns-feld">
              <div className="ns-kopf">
                <span className="ns-label">Ergebnis</span>
                <span className="ns-session">Session {e.session}</span>
              </div>
              <Kette stuecke={e.stuecke} reduced={reduced} />
            </div>
          ))}
        </div>
      ) : (
        <div className="ns-feld">
          <div className="ns-kopf">
            <span className="ns-label">Kontext</span>
            {z.session && <span className="ns-session">Session {z.session}</span>}
          </div>
          <Kette stuecke={z.kontext} reduced={reduced} cursor />
        </div>
      )}
      {/* Ohne Balken kein Platzhalter: Die Stage reserviert die Höhe des höchsten Schritts selbst. */}
      {z.verteilung && <Balken verteilung={z.verteilung} gewaehlt={z.gewaehlt} duration={duration} />}
      <p className="ns-fussnote">Zerlegung in Stücke (Tokens) und Prozentzahlen sind vereinfacht und zur Veranschaulichung gewählt.</p>
    </div>
  );
}

function Kette({ stuecke, reduced, cursor = false }: { stuecke: Stueck[]; reduced: boolean; cursor?: boolean }) {
  // Neu hinzugekommene Stücke nacheinander erscheinen lassen.
  const shown = useRef(new Set(stuecke.map((s) => s.id)));
  const fresh = stuecke.filter((s) => !shown.current.has(s.id)).map((s) => s.id);
  useEffect(() => {
    shown.current = new Set(stuecke.map((s) => s.id));
  });

  return (
    <div className="ns-kette" role="img" aria-label={alsText(stuecke)}>
      <AnimatePresence initial={false}>
        {stuecke.map((s) => {
          const order = fresh.indexOf(s.id);
          return (
            <motion.span
              key={s.id}
              className={`ns-stueck ns-${s.art}${s.text.startsWith(' ') ? ' ns-luecke' : ''}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.3, delay: reduced || order < 0 ? 0 : order * 0.25 }}
            >
              {s.text.trim()}
            </motion.span>
          );
        })}
      </AnimatePresence>
      {cursor && <span className="ns-cursor" aria-hidden="true" />}
    </div>
  );
}

function Balken({ verteilung, gewaehlt, duration }: {
  verteilung: Verteilung;
  gewaehlt?: string;
  duration: number;
}) {
  const zeilen = [
    ...verteilung.kandidaten.map((k) => ({ key: k.text, label: k.text.trim(), p: k.p, gewaehlt: k.text === gewaehlt })),
    { key: '…', label: 'andere', p: verteilung.andere, gewaehlt: false },
  ];
  const beschreibung = zeilen.map((r) => `${r.label} ${r.p} %`).join(', ');
  const wahl = zeilen.find((r) => r.gewaehlt);

  return (
    <div
      className="ns-balken"
      role="img"
      aria-label={`Nächstes Stück: ${beschreibung}${wahl ? `. Gewählt: ${wahl.label}` : ''}`}
    >
      <div className="ns-kopf">
        <span className="ns-label">Nächstes Stück</span>
      </div>
      {zeilen.map((r) => (
        <div key={`${verteilung.id}-${r.key}`} className={`ns-zeile${r.gewaehlt ? ' ns-gewaehlt' : ''}${r.key === '…' ? ' ns-andere' : ''}`}>
          <span className="ns-kandidat">
            {r.label}
            {r.gewaehlt && <Dices className="ns-wuerfel" aria-hidden="true" />}
          </span>
          <span className="ns-spur">
            <motion.span
              className="ns-balken-fuellung"
              initial={{ width: 0 }}
              animate={{ width: `${r.p}%` }}
              transition={{ duration }}
            />
          </span>
          <span className="ns-prozent">{r.p}&nbsp;%</span>
        </div>
      ))}
    </div>
  );
}
