// Szene „Kontextfenster“ für Konzept 2 (Tag 1). Logik und Texte: kontextfenster-steps.ts.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Stage, { type StageNav, type StageStep } from './Stage';
import { PRELUDE_MS, STEPS, blocksAt, fillOf, preludeAt, type Art } from './kontextfenster-steps';
import './stage.css';

const LEGENDE: { art: Art; text: string }[] = [
  { art: 'fest', text: 'Lädt bei jedem Start' },
  { art: 'auftrag', text: 'Ihr Auftrag' },
  { art: 'datei', text: 'Gelesene Dateien' },
  { art: 'werkzeug', text: 'Werkzeug-Ergebnisse' },
  { art: 'verlauf', text: 'Verlauf' },
  { art: 'zusammenfassung', text: 'Zusammenfassung' },
];

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

export default function Kontextfenster() {
  return (
    <Stage title="Das Kontextfenster" steps={stageSteps}>
      {(nav, reduced) => <Fenster nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Fenster({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const step = nav.index + 1;
  const prelude = preludeAt(step);
  // Auftakt nur beim Vorwärtsgehen und ohne reduzierte Bewegung; seq macht jeden Besuch einzeln.
  const [preludeDoneSeq, setPreludeDoneSeq] = useState(-1);
  const showPrelude = prelude !== null && nav.direction === 1 && !reduced && preludeDoneSeq !== nav.seq;

  useEffect(() => {
    if (!showPrelude) return;
    const t = setTimeout(() => setPreludeDoneSeq(nav.seq), PRELUDE_MS);
    return () => clearTimeout(t);
  }, [showPrelude, nav.seq]);

  const blocks = showPrelude && prelude ? prelude : blocksAt(step);
  const fill = fillOf(blocks);
  const level = fill >= 95 ? 'kf-crit' : fill >= 80 ? 'kf-warn' : '';

  // Neu hinzugekommene Blöcke nacheinander einfließen lassen.
  const shown = useRef(new Set(blocks.map((b) => b.id)));
  const fresh = blocks.filter((b) => !shown.current.has(b.id)).map((b) => b.id);
  useEffect(() => {
    shown.current = new Set(blocks.map((b) => b.id));
  });

  const duration = reduced ? 0 : 0.5;

  return (
    <div className="kf">
      <div className={`kf-gauge ${level}`}>
        <span className="kf-gauge-text">{fill} % belegt</span>
        <div className="kf-gauge-track">
          <motion.div
            className="kf-gauge-bar"
            initial={false}
            animate={{ width: `${Math.min(fill, 100)}%` }}
            transition={{ duration }}
          />
        </div>
      </div>
      <div className="kf-fenster" role="img" aria-label={`Kontextfenster, ${fill} Prozent belegt`}>
        <AnimatePresence initial={false}>
          {blocks.map((b) => {
            const order = fresh.indexOf(b.id);
            return (
              <motion.div
                key={b.id}
                className={`kf-block kf-${b.art}${b.size < 8 ? ' kf-narrow' : ''}`}
                title={b.tag ? `${b.label} – ${b.tag}` : b.label}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${b.size}%`, opacity: b.verblasst ? 0.35 : 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration, delay: reduced || order < 0 ? 0 : order * 0.2 }}
              >
                <span className="kf-label">{b.label}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="kf-footnote">Gemessen in Tokens – etwa 3–4 Zeichen pro Token.</p>
      {blocks.some((b) => b.tag) && (
        <ul className="kf-notes">
          {blocks
            .filter((b) => b.tag)
            .map((b) => (
              <li key={b.id}>
                <span className={`kf-dot kf-${b.art}`} aria-hidden="true" />
                <code>{b.label}</code> – {b.tag}
              </li>
            ))}
        </ul>
      )}
      <ul className="kf-legend" aria-label="Legende">
        {LEGENDE.map((l) => (
          <li key={l.art}>
            <span className={`kf-dot kf-${l.art}`} aria-hidden="true" />
            {l.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
