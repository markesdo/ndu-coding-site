// Rahmen für Schritt-Animationen: Steuerung, Tastatur, Vollbild, Beschriftung.
// Wiederverwendbar für alle animierten Szenen der Kurs-Website.
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './stage.css';

export interface StageStep {
  caption: ReactNode;
  /** Beschriftung als reiner Text für Screenreader. */
  plain: string;
}

export interface StageNav {
  index: number;
  direction: 1 | -1;
  /** Zählt jede Navigation hoch – damit Szenen erkennen, dass ein Schritt neu betreten wurde. */
  seq: number;
}

interface StageProps {
  title: string;
  steps: StageStep[];
  children: (nav: StageNav, reduced: boolean) => ReactNode;
}

export default function Stage({ title, steps, children }: StageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [nav, setNav] = useState<StageNav>({ index: 0, direction: 1, seq: 0 });
  // Server und erstes Client-Rendern: Button sichtbar; erst nach dem Mounten prüfen (keine Hydration-Abweichung).
  const [canFullscreen, setCanFullscreen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const last = steps.length - 1;

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const move = (delta: 1 | -1) =>
    setNav((n) => {
      const index = n.index + delta;
      return index < 0 || index > last ? n : { index, direction: delta, seq: n.seq + 1 };
    });
  const restart = () => setNav((n) => (n.index === 0 ? n : { index: 0, direction: -1, seq: n.seq + 1 }));
  // preventScroll: sonst springt die Seite bei jedem Button-Klick, wenn die Stage nicht ganz sichtbar ist.
  const refocus = () => ref.current?.focus({ preventScroll: true });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Nur Tasten auf der Stage selbst – ein fokussierter Button behandelt Leertaste/Enter selbst.
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      restart();
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await ref.current?.requestFullscreen();
    } catch (err) {
      console.warn('Vollbild nicht möglich:', err);
    }
    refocus();
  };

  return (
    <div
      ref={ref}
      className="stage"
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="group"
      aria-roledescription="Animation"
      aria-label={`${title} – mit den Pfeiltasten blättern`}
    >
      <div className="stage-head">
        <span className="stage-title">{title}</span>
        <span className="stage-count">
          {nav.index + 1} / {steps.length}
        </span>
      </div>
      <div className="stage-scene">{children(nav, reduced)}</div>
      <div className="stage-caption" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={nav.index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
          >
            {steps[nav.index].caption}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className="sr-only" aria-live="polite">
        {steps[nav.index].plain}
      </p>
      <div className="stage-controls">
        <button
          type="button"
          className="btn sm"
          onClick={() => { move(-1); refocus(); }}
          disabled={nav.index === 0}
          aria-label="Vorheriger Schritt"
        >
          ← Zurück
        </button>
        <button
          type="button"
          className="btn sm primary"
          onClick={() => { move(1); refocus(); }}
          disabled={nav.index === last}
          aria-label="Nächster Schritt"
        >
          Weiter →
        </button>
        <button
          type="button"
          className="btn sm"
          onClick={() => { restart(); refocus(); }}
          disabled={nav.index === 0}
          aria-label="Von vorn beginnen"
        >
          Von vorn
        </button>
        {canFullscreen && (
          <button type="button" className="btn sm" onClick={toggleFullscreen}>
            {isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
          </button>
        )}
      </div>
    </div>
  );
}
