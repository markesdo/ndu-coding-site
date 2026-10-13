// Gemeinsame Helfer der Schritt-Animationen: Beschriftungen aus { title, text } bauen, `Code` in Backticks → <code>.
import type { ReactNode } from 'react';
import type { StageStep } from './Stage';

export function inline(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

/** Dieselbe Beschriftung als reiner Text (für Screenreader) – Backticks fallen weg. */
export function plainText(text: string): string {
  return text.replaceAll('`', '');
}

/** Schritte einer Animation → Stage-Schritte: Titel fett, danach der Text. */
export function stageSteps(steps: { title: string; text: string }[]): StageStep[] {
  return steps.map((s) => ({
    caption: (
      <>
        <strong>{inline(s.title)}</strong> {inline(s.text)}
      </>
    ),
    plain: plainText(`${s.title} ${s.text}`),
  }));
}
