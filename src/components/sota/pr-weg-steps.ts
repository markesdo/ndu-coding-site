// Daten und Logik der Animation „Ein Pull Request von Anfang bis Ende“ (Git & GitHub, Abschnitt Pull Request). Ohne React, damit testbar.

export type Bereich = 'git' | 'github' | 'vercel' | 'linear';
export type Pruefung = 'aus' | 'laeuft' | 'ok' | 'rot';
export type Vorschau = 'aus' | 'baut' | 'fehler' | 'bereit';
export type IssueStatus = 'Todo' | 'In Progress' | 'In Review' | 'Done';

export interface Zustand {
  /** Bereich, um den es in diesem Schritt geht; null = alle gleichzeitig. */
  aktiv: Bereich | null;
  /** Der Branch existiert (oder existierte – siehe geloescht). */
  branch: boolean;
  /** Commits auf dem Branch (0–3). */
  commits: number;
  /** Davon schon auf GitHub (gepusht); die übrigen liegen nur auf eurem Mac. */
  gepusht: number;
  pr: 'keiner' | 'offen' | 'gemergt';
  /** Prüfungen am Pull Request: Lint und Build (GitHub Actions). */
  pruefung: Pruefung;
  /** Vercel baut jeden gepushten Stand des Branches unter einer eigenen Adresse. */
  vorschau: Vorschau;
  review: 'keiner' | 'freigegeben';
  /** Der Branch ist in main zusammengeführt (auf GitHub). */
  gemergt: boolean;
  /** Der Branch ist nach dem Merge gelöscht – seine Commits stecken in main. */
  geloescht: boolean;
  /** Stand der Live-App: alt = vor dem Issue, neu = mit dem Issue. */
  live: 'alt' | 'neu';
  /** main auf eurem Mac hat den neuen Stand von GitHub geholt. */
  macAktuell: boolean;
  issue: IssueStatus;
}

export interface Schritt {
  title: string;
  /** Inline-Code in Backticks. */
  text: string;
}

export const BRANCH = 'lei-5-beschreibung';
export const ISSUE = 'LEI-5';

const START: Zustand = {
  aktiv: 'git',
  branch: false,
  commits: 0,
  gepusht: 0,
  pr: 'keiner',
  pruefung: 'aus',
  vorschau: 'aus',
  review: 'keiner',
  gemergt: false,
  geloescht: false,
  live: 'alt',
  macAktuell: true,
  issue: 'Todo',
};

const BRANCH_DA: Zustand = { ...START, branch: true, issue: 'In Progress' };
const GEPUSHT: Zustand = { ...BRANCH_DA, commits: 2, gepusht: 2, vorschau: 'baut' };
const PR_OFFEN: Zustand = { ...GEPUSHT, pr: 'offen', issue: 'In Review' };
const GRUEN: Zustand = { ...PR_OFFEN, commits: 3, gepusht: 3, pruefung: 'ok', vorschau: 'bereit' };
const GEMERGT: Zustand = { ...GRUEN, review: 'freigegeben', gemergt: true, pr: 'gemergt', live: 'neu', macAktuell: false };

const ZUSTAENDE: Zustand[] = [
  START,
  BRANCH_DA,
  { ...BRANCH_DA, commits: 2 },
  GEPUSHT,
  { ...PR_OFFEN, aktiv: 'github', pruefung: 'laeuft' },
  { ...PR_OFFEN, aktiv: 'github', pruefung: 'rot', vorschau: 'fehler' },
  GRUEN,
  { ...GRUEN, aktiv: 'vercel' },
  { ...GRUEN, aktiv: 'github', review: 'freigegeben' },
  { ...GEMERGT, aktiv: 'vercel' },
  { ...GEMERGT, aktiv: null, geloescht: true, vorschau: 'aus', macAktuell: true, issue: 'Done' },
];

export const STEPS: Schritt[] = [
  { title: 'Ausgangslage.', text: '`main` ist der Stand, der live ist – Vercel zeigt ihn unter eurer Adresse. In Linear wartet das Issue LEI-5: Beschreibung beim Gegenstand anzeigen.' },
  { title: 'Branch.', text: 'Ihr sagt „Setze LEI-5 um“. Claude zweigt auf eurem Mac einen Branch ab, `lei-5-beschreibung` – eine Kopie, auf der es arbeiten darf. Das Issue steht auf In Progress. `main` und die Live-App bleiben, wie sie sind.' },
  { title: 'Commits.', text: 'Claude baut und speichert in zwei Commits. Beide liegen nur auf eurem Mac – hohle Punkte. GitHub weiß noch nichts davon.' },
  { title: 'Push.', text: 'Claude lädt den Branch zu GitHub hoch: Die Punkte füllen sich. Vercel bemerkt den neuen Branch und beginnt sofort, eine Vorschau zu bauen.' },
  { title: 'Pull Request.', text: 'Claude öffnet einen Pull Request: „Bitte übernehmt diesen Branch in main“. Die PR-Seite zeigt, was sich geändert hat und warum. Das Issue steht auf In Review. Drei Prüfungen laufen: Lint, Build und die Vercel-Vorschau.' },
  { title: 'Prüfung rot.', text: 'Der Build schlägt fehl – ein Tippfehler im Code. Auch die Vorschau ist kaputt, derselbe Fehler. Genau dafür ist der Pull Request da: Der Fehler fällt hier auf, bevor ihn jemand in der Live-App sieht.' },
  { title: 'Reparieren.', text: 'Claude liest den Fehler, repariert ihn, speichert einen dritten Commit und pusht ihn auf denselben Branch. Der Pull Request aktualisiert sich von selbst: alle Prüfungen grün, die Vorschau ist bereit.' },
  { title: 'Vorschau.', text: 'Ihr öffnet die Vorschau-Adresse, klickt durch und prüft jedes Akzeptanzkriterium – an der echten App, nicht am Code. Live ist noch immer der alte Stand.' },
  { title: 'Review.', text: 'Jemand anderes schaut drüber: im Team eine Kollegin auf GitHub, die den Pull Request freigibt (Approve). Allein lasst ihr vorher `/code-review` laufen.' },
  { title: 'Merge.', text: 'Erst jetzt klickt ihr „Merge pull request“ – oder sagt es Claude. Die Commits kommen in `main`, und Vercel stellt den neuen Stand live. Euer Mac hat davon noch nichts: Sein `main` ist alt.' },
  { title: 'Aufräumen.', text: 'Der Branch wird gelöscht, seine Commits stecken in `main`. Das Issue steht auf Done. Auf eurem Mac: zurück auf `main`, neuen Stand holen – sonst startet das nächste Issue vom alten Code.' },
];

/** Zustand der Szene in Schritt 1 … STEPS.length. */
export function stateAt(step: number): Zustand {
  const z = ZUSTAENDE[step - 1];
  if (!z) throw new Error(`Schritt ${step} gibt es nicht`);
  return z;
}

/** Kursregel: Zusammenführen erst, wenn die Prüfungen grün sind und jemand freigegeben hat. */
export function mergeBereit(z: Zustand): boolean {
  return z.pr === 'offen' && z.pruefung === 'ok' && z.vorschau === 'bereit' && z.review === 'freigegeben';
}
