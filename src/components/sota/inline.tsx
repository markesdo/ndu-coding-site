// Gemeinsamer Helfer der Schritt-Animationen: `Code` in Backticks → <code>.
import type { ReactNode } from 'react';

export function inline(text: string): ReactNode[] {
  return text.split('`').map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}
