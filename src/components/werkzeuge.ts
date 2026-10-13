// Daten der Werkzeug-Karte („Eure Werkzeuge auf einen Blick“, Unser Stack): was wo läuft und wer mit wem redet. Ohne Astro, damit testbar.

export type Zone = 'mac' | 'netz';
/** Lucide-Ikonen, die die Karte kennt – Werkzeugkarte.astro bildet genau diese Namen ab. */
export const ICON_NAMEN = [
  'Bot', 'Database', 'FileText', 'FolderGit2', 'GitPullRequest', 'KeyRound', 'ListTodo', 'Monitor', 'Palette', 'PenTool', 'Sparkles',
  'SquareTerminal', 'Triangle',
] as const;
export type IconName = (typeof ICON_NAMEN)[number];
export type Reihe = 'steuern' | 'code' | 'app' | 'daten' | 'aufgaben' | 'design';
/** code = Weg des Codes · app = eure App redet mit · claude = Claude redet mit (MCP und Kommandozeile). */
export type Ebene = 'code' | 'app' | 'claude';

export interface Werkzeug {
  id: string;
  name: string;
  icon: IconName;
  zone: Zone;
  reihe: Reihe;
  /** Ein Satz: was es für euch ist. */
  rolle: string;
  wann: string;
  konto: string;
  /** Adresse im Netz oder Seite im Kurs. */
  link?: { t: string; href: string };
}

export interface Verbindung {
  von: string;
  nach: string;
  ebene: Ebene;
  /** Kurz, steht an der Linie (nur Ebene code und app). */
  kurz: string;
  /** Ausführlich, steht im Text zum Werkzeug. */
  text: string;
}

export const REIHEN: { id: Reihe; t: string }[] = [
  { id: 'steuern', t: 'Arbeiten' },
  { id: 'code', t: 'Code' },
  { id: 'app', t: 'App' },
  { id: 'daten', t: 'Daten' },
  { id: 'aufgaben', t: 'Aufgaben' },
  { id: 'design', t: 'Design' },
];

export const EBENEN: { id: Ebene; t: string; erklaerung: string }[] = [
  { id: 'code', t: 'Weg des Codes', erklaerung: 'So kommt eine Änderung von eurem Mac ins Netz: speichern, hochladen, bauen, live.' },
  { id: 'app', t: 'Eure App redet mit', erklaerung: 'Wenn jemand eure App benutzt: Sie holt und speichert Daten bei Supabase – mit den Schlüsseln aus .env.local, live mit denselben Schlüsseln in Vercel.' },
  { id: 'claude', t: 'Claude redet mit', erklaerung: 'Was Claude Code für euch erledigt: Dateien ändern und über MCP mit den Diensten sprechen. Angemeldet wird einmal pro Dienst über /mcp.' },
];

export const WERKZEUGE: Werkzeug[] = [
  {
    id: 'vscode', name: 'VS Code', icon: 'SquareTerminal', zone: 'mac', reihe: 'steuern',
    rolle: 'Euer Fenster auf den Projektordner: Dateien ansehen, im Terminal arbeiten.',
    wann: 'Immer. Im Terminal unten startet ihr Claude (claude) und die App (npm run dev).',
    konto: 'Kein Konto nötig.',
    link: { t: 'Setup', href: '/setup' },
  },
  {
    id: 'claude-code', name: 'Claude Code', icon: 'Bot', zone: 'mac', reihe: 'steuern',
    rolle: 'Euer Agent im Terminal: ändert den Projektordner und redet für euch mit den Diensten.',
    wann: 'Immer – ihr beschreibt, Claude baut, ihr prüft.',
    konto: 'Euer Claude-Pro-Konto (Anmeldung beim ersten Start).',
    link: { t: 'Wie ein Coding-Agent arbeitet', href: '/konzepte/coding-agent' },
  },
  {
    id: 'claude-ai', name: 'claude.ai', icon: 'Sparkles', zone: 'netz', reihe: 'steuern',
    rolle: 'Euer Konto bei Anthropic: Mit Pro darf Claude Code arbeiten, und hier liegt der Chat.',
    wann: 'Wenn ihr euer Abo oder eure Nutzung sehen wollt.',
    konto: 'Euer Claude-Pro-Konto.',
    link: { t: 'claude.ai', href: 'https://claude.ai' },
  },
  {
    id: 'ordner', name: 'Projektordner · Git', icon: 'FolderGit2', zone: 'mac', reihe: 'code',
    rolle: 'Eure App als Dateien. Git ist das Gedächtnis des Ordners: jeder Commit ein Stand, zu dem ihr zurückkönnt.',
    wann: 'Liegt unter code in eurem Benutzerordner. Gespeichert wird mit /ndu-commit.',
    konto: 'Kein Konto – Name und E-Mail für Git hat das Setup-Skript eingetragen.',
    link: { t: 'Git – der Undo-Knopf', href: '/konzepte/git' },
  },
  {
    id: 'github', name: 'GitHub', icon: 'GitPullRequest', zone: 'netz', reihe: 'code',
    rolle: 'Die Kopie eures Ordners im Internet – mit Geschichte, Pull Requests und Prüfungen.',
    wann: 'Pull Requests prüfen und zusammenführen, den Repo-Link teilen, rote Prüfungen ansehen.',
    konto: 'GitHub-Konto mit eurer NDU-Adresse.',
    link: { t: 'github.com', href: 'https://github.com' },
  },
  {
    id: 'localhost', name: 'Browser · localhost', icon: 'Monitor', zone: 'mac', reihe: 'app',
    rolle: 'Eure App, wie sie gerade auf eurem Mac läuft – nur ihr seht sie.',
    wann: 'Nach npm run dev unter localhost:3000. Hier prüft ihr, bevor etwas live geht.',
    konto: 'Kein Konto. Der Login in eurer App läuft über Supabase.',
  },
  {
    id: 'vercel', name: 'Vercel', icon: 'Triangle', zone: 'netz', reihe: 'app',
    rolle: 'Baut eure App bei jedem Push: main unter eurer öffentlichen Adresse, jeden anderen Branch als Vorschau.',
    wann: 'Build rot oder live fehlt etwas, das lokal geht – fast immer eine Environment-Variable.',
    konto: 'Mit GitHub angemeldet (Continue with GitHub).',
    link: { t: 'vercel.com', href: 'https://vercel.com' },
  },
  {
    id: 'env', name: '.env.local', icon: 'KeyRound', zone: 'mac', reihe: 'daten',
    rolle: 'Die Schlüssel, mit denen eure App bei Supabase hereinkommt. Gehört nie ins Repo.',
    wann: 'Einmal beim Einrichten – und wenn die App „Invalid API key“ meldet.',
    konto: 'Kein Konto. Die Werte stammen aus Supabase; für live stehen dieselben in Vercel.',
    link: { t: 'Daten & Backend', href: '/konzepte/daten-backend' },
  },
  {
    id: 'supabase', name: 'Supabase', icon: 'Database', zone: 'netz', reihe: 'daten',
    rolle: 'Wo eure App Daten, Logins und Bilder aufbewahrt – lokal und live dieselbe Datenbank.',
    wann: 'Daten fehlen, ein Zugriff wird verweigert, der Login landet am falschen Ort.',
    konto: 'Mit GitHub angemeldet (Continue with GitHub).',
    link: { t: 'Dashboard', href: 'https://supabase.com/dashboard' },
  },
  {
    id: 'backlog', name: 'docs/BACKLOG.md', icon: 'FileText', zone: 'mac', reihe: 'aufgaben',
    rolle: 'Eure Issues als Datei im Projektordner – Tag 1, Tag 2 und Zwischenwoche.',
    wann: 'Bis ihr auf Linear umstellt; danach steht dort nur noch der Verweis.',
    konto: 'Kein Konto.',
    link: { t: 'Von der Idee zur Spezifikation', href: '/konzepte/spezifikation' },
  },
  {
    id: 'linear', name: 'Linear', icon: 'ListTodo', zone: 'netz', reihe: 'aufgaben',
    rolle: 'Eure Aufgabenliste im Team: jedes Issue mit Kennung und Status.',
    wann: 'Ab Tag 3 und im Innolab: Issues schreiben, Status sehen, abnehmen.',
    konto: 'Mit dem Google-Konto, an das die Einladung ging.',
    link: { t: 'Backlog im Team: Linear', href: '/konzepte/linear' },
  },
  {
    id: 'figma', name: 'Figma', icon: 'PenTool', zone: 'netz', reihe: 'design',
    rolle: 'Wo Entwürfe entstehen, die Claude lesen und nachbauen kann.',
    wann: 'Im Innolab: Frames bauen, den Link ins Issue legen.',
    konto: 'Euer Figma-Education-Konto.',
    link: { t: 'Figma-MCP', href: '/konzepte/ausblick#figma' },
  },
  {
    id: 'claude-design', name: 'Claude Design', icon: 'Palette', zone: 'netz', reihe: 'design',
    rolle: 'Entwürfe direkt in Claude – mit den Bausteinen aus eurem Repo.',
    wann: 'In Übung 9 und immer, wenn ihr schnell eine Variante sehen wollt.',
    konto: 'Euer Claude-Pro-Konto, in Claude unter Design.',
    link: { t: 'Übung 9', href: '/tag-3#uebung-9' },
  },
];

export const VERBINDUNGEN: Verbindung[] = [
  // Weg des Codes
  { von: 'vscode', nach: 'ordner', ebene: 'code', kurz: 'öffnet', text: 'VS Code zeigt die Dateien im Projektordner; im Terminal darin startet ihr Claude und die App.' },
  { von: 'ordner', nach: 'github', ebene: 'code', kurz: 'push', text: 'Push lädt eure Commits zu GitHub hoch – vorher liegen sie nur auf eurem Mac.' },
  { von: 'github', nach: 'vercel', ebene: 'code', kurz: 'baut', text: 'Vercel baut jeden Push; was in main landet, geht live.' },
  { von: 'github', nach: 'ordner', ebene: 'code', kurz: 'pull', text: 'Nach einem Merge holt ihr den neuen Stand auf euren Mac (pull).' },
  // Eure App redet mit
  { von: 'env', nach: 'localhost', ebene: 'app', kurz: 'Schlüssel', text: 'Die App auf eurem Mac liest ihre Schlüssel aus .env.local.' },
  { von: 'localhost', nach: 'supabase', ebene: 'app', kurz: 'Daten', text: 'Die App auf eurem Mac holt und speichert Daten bei Supabase.' },
  { von: 'vercel', nach: 'supabase', ebene: 'app', kurz: 'Daten', text: 'Die Live-App holt dieselben Daten – mit denselben Schlüsseln, in Vercel hinterlegt.' },
  // Claude redet mit
  { von: 'claude-code', nach: 'claude-ai', ebene: 'claude', kurz: 'Konto', text: 'Claude Code arbeitet mit eurem Claude-Pro-Konto.' },
  { von: 'claude-code', nach: 'ordner', ebene: 'claude', kurz: 'Dateien', text: 'Claude liest und ändert die Dateien im Projektordner und macht die Commits.' },
  { von: 'claude-code', nach: 'github', ebene: 'claude', kurz: 'PR', text: 'Claude pusht, öffnet Pull Requests und liest die Prüfungen (GitHub-Kommandozeile gh).' },
  { von: 'claude-code', nach: 'localhost', ebene: 'claude', kurz: 'Browser', text: 'Claude öffnet eure App im Browser, klickt und macht Screenshots (Playwright).' },
  { von: 'claude-code', nach: 'vercel', ebene: 'claude', kurz: 'MCP', text: 'Claude liest Deployments und Build-Logs (Vercel-MCP).' },
  { von: 'claude-code', nach: 'supabase', ebene: 'claude', kurz: 'MCP', text: 'Claude legt Tabellen und Regeln an und liest Daten und Logs (Supabase-MCP).' },
  { von: 'claude-code', nach: 'linear', ebene: 'claude', kurz: 'MCP', text: 'Claude liest Issues, setzt den Status und schreibt Kommentare (Linear-MCP).' },
  { von: 'claude-code', nach: 'figma', ebene: 'claude', kurz: 'MCP', text: 'Claude liest Frames und Variablen aus euren Entwürfen (Figma-MCP).' },
  { von: 'claude-code', nach: 'backlog', ebene: 'claude', kurz: 'Datei', text: 'Claude liest und schreibt die Issues in docs/BACKLOG.md.' },
  { von: 'claude-design', nach: 'github', ebene: 'claude', kurz: 'Repo', text: 'Claude Design liest euer Repo und entwirft mit euren Bausteinen.' },
  { von: 'claude-code', nach: 'claude-design', ebene: 'claude', kurz: 'Link', text: 'Claude Code liest einen fertigen Entwurf über seinen Link.' },
  { von: 'backlog', nach: 'linear', ebene: 'claude', kurz: 'Umzug', text: 'Mit /ndu-linear zieht der Backlog aus der Datei nach Linear um.' },
];

/** Alle Verbindungen eines Werkzeugs, in beide Richtungen. */
export function verbindungenVon(id: string): Verbindung[] {
  return VERBINDUNGEN.filter((v) => v.von === id || v.nach === id);
}
