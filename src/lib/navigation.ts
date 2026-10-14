// Seitenleiste pro Kurs: Die Website trägt zwei Kurse – „Programmieren mit AI“ (Oktober) und das Innolab (November/Dezember).
// Welcher Kurs gilt, folgt aus dem Pfad (ohne Schrägstrich am Ende, wie bei „Wo ist Markus?“); Layout.astro zeigt nur dessen Menü und blättert im Beamer-Modus nur darin.

import { pfadOhneSchraegstrich } from '../components/abschnitt';

export type Bereich = 'coding' | 'innolab';

export interface NavEintrag { href: string; t: string }
export interface NavGruppe { h: string; items: NavEintrag[] }

export interface BereichInfo {
  /** Startseite des Kurses – Ziel des Logos in der Seitenleiste. */
  start: string;
  /** Name im Logo; ohne Angabe der des Coding-Kurses (Marke.astro). Umgebrochen wird nach dem ersten Unterstrich. */
  marke?: string;
  /** Anhang am Seitentitel: „Tag 1 · … · NDU Coding 2026“. */
  titel: string;
  beschreibung: string;
  /** Zweite Zeile unten in der Seitenleiste. */
  termine: string;
  /** Kurzer Name für den Wechsel-Link zum jeweils anderen Kurs. */
  kurz: string;
}

export const BEREICHE: Record<Bereich, BereichInfo> = {
  coding: {
    start: '/',
    titel: 'NDU Coding 2026',
    beschreibung: 'Programmieren mit AI – Kurs für den MSc Management by Innovation, NDU, Oktober 2026',
    termine: '8. / 9. / 15. Oktober 2026',
    kurz: 'Programmieren mit AI',
  },
  innolab: {
    start: '/innolab',
    marke: 'innolab_2026',
    titel: 'NDU Innolab 2026',
    beschreibung: 'Innolab – ein digitales Produkt entwickeln und organisieren. MSc Management by Innovation, NDU, 2026',
    termine: 'November / Dezember 2026',
    kurz: 'Innolab',
  },
};

export const NAV: Record<Bereich, NavGruppe[]> = {
  coding: [
    { h: 'Start', items: [
      { href: '/', t: 'Übersicht' },
      { href: '/setup', t: 'Setup & Accounts' },
      { href: '/hilfe', t: 'Hilfe holen' },
    ]},
    { h: 'Kurstage', items: [
      { href: '/tag-1', t: 'Tag 1 · Verstehen & Starten' },
      { href: '/tag-2', t: 'Tag 2 · Bauen wie ein Profi' },
      { href: '/zwischenwoche', t: 'Zwischenwoche' },
      { href: '/neues-projekt', t: 'Neues Projekt starten' },
      { href: '/tag-3', t: 'Tag 3 · Shippen' },
    ]},
    { h: 'Konzepte', items: [
      { href: '/konzepte/app-anatomie', t: 'Anatomie einer App' },
      { href: '/konzepte/git', t: 'Git – der Undo-Knopf' },
      { href: '/konzepte/llm', t: 'Was ein Sprachmodell tut' },
      { href: '/konzepte/coding-agent', t: 'Wie ein Coding-Agent arbeitet' },
      { href: '/konzepte/prompting', t: 'Prompt Engineering' },
      { href: '/konzepte/spezifikation', t: 'Von der Idee zur Spezifikation' },
      { href: '/konzepte/daten-backend', t: 'Daten & Backend' },
      { href: '/konzepte/mcp', t: 'MCP-Server' },
      { href: '/konzepte/verifizieren', t: 'Verifizieren & Debuggen' },
      { href: '/konzepte/agenten-steuern', t: 'Agenten steuern' },
      { href: '/konzepte/qualitaet', t: 'Vom Prototyp zum Produkt' },
      { href: '/konzepte/design-system', t: 'Design-System' },
      { href: '/konzepte/ausblick', t: 'So wird 2026 gearbeitet' },
      { href: '/konzepte/linear', t: 'Backlog im Team: Linear' },
    ]},
    { h: 'Werkzeuge', items: [
      { href: '/prompts', t: 'Prompt-Bibliothek' },
      { href: '/ideen', t: 'Projektideen' },
      { href: '/bekannte-probleme', t: 'Bekannte Probleme' },
      { href: '/unser-stack', t: 'Unser Stack' },
      { href: '/bewertung', t: 'Bewertung' },
    ]},
  ],
  innolab: [
    { h: 'Start', items: [
      { href: '/innolab', t: 'Übersicht' },
      { href: '/innolab/methoden', t: 'Toolbox: alle Methoden' },
    ]},
    { h: 'Kurstage', items: [
      { href: '/innolab/tag-1', t: 'Tag 1 · Rahmen & Verstehen' },
    ]},
  ],
};

/** Welcher Kurs gehört zu diesem Pfad? Alles unter /innolab ist Innolab, der Rest der Coding-Kurs. */
export function bereichVon(pfad: string): Bereich {
  const p = pfadOhneSchraegstrich(pfad);
  return p === '/innolab' || p.startsWith('/innolab/') ? 'innolab' : 'coding';
}

/** Blätter-Reihenfolge im Beamer-Modus (wenn eine Seite keinen FooterNav hat): die Menü-Reihenfolge des eigenen Kurses. */
export function nachbarn(pfad: string): { vorher?: NavEintrag; danach?: NavEintrag } {
  const p = pfadOhneSchraegstrich(pfad);
  const flach = NAV[bereichVon(p)].flatMap((g) => g.items);
  const hier = flach.findIndex((i) => i.href === p);
  return {
    vorher: hier > 0 ? flach[hier - 1] : undefined,
    danach: hier >= 0 && hier < flach.length - 1 ? flach[hier + 1] : undefined,
  };
}
