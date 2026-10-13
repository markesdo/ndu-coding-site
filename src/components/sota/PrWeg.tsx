// Szene „Ein Pull Request von Anfang bis Ende“ für Git & GitHub (#pull-request). Logik und Texte: pr-weg-steps.ts.
import { motion } from 'motion/react';
import {
  Circle, CircleCheck, CircleX, GitMerge, GitPullRequest, Globe, ListTodo, LoaderCircle, Triangle, type LucideIcon,
} from 'lucide-react';
import Stage, { type StageNav } from './Stage';
import { stageSteps } from './inline';
import { BRANCH, ISSUE, STEPS, mergeBereit, stateAt, type Bereich, type Pruefung, type Vorschau, type Zustand } from './pr-weg-steps';
import './stage.css';

const schritte = stageSteps(STEPS);

export default function PrWeg() {
  return (
    <Stage title="Ein Pull Request von Anfang bis Ende" steps={schritte}>
      {(nav, reduced) => <Szene nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function klasse(z: Zustand, b: Bereich, basis: string): string {
  return [basis, z.aktiv === b && 'pw-aktiv', z.aktiv && z.aktiv !== b && 'pw-passiv'].filter(Boolean).join(' ');
}

function Szene({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const z = stateAt(nav.index + 1);
  // Bewegung nur beim Vorwärtsblättern; zurück und mit reduzierter Bewegung steht alles sofort am Ziel.
  const bewegt = nav.direction === 1 && !reduced;
  return (
    <div className="pw">
      <section className={klasse(z, 'git', 'pw-feld pw-git')} aria-label="Git: main und Branch">
        <Graph z={z} bewegt={bewegt} />
        <p className="pw-legende">
          <span><span className="pw-punkt pw-hohl" /> nur auf eurem Mac</span>
          <span><span className="pw-punkt" /> auf GitHub</span>
        </p>
      </section>
      <div className="pw-karten">
        <GitHubKarte z={z} />
        <VercelKarte z={z} />
        <LinearKarte z={z} />
      </div>
    </div>
  );
}

// Koordinaten im viewBox 0 0 480 146: main unten, Branch oben – knapp gehalten, damit die ganze Szene samt Weiter-Knopf
// auf einen Laptop-Bildschirm passt.
const MAIN_Y = 84;
const BRANCH_Y = 36;
const ALT = [30, 80];
const BRANCH_X = [150, 205, 260];
const MERGE_X = 330;

function Graph({ z, bewegt }: { z: Zustand; bewegt: boolean }) {
  const dauer = bewegt ? 0.6 : 0;
  const liveX = z.live === 'neu' ? MERGE_X : ALT[1];
  const macX = z.gemergt && z.macAktuell ? MERGE_X : ALT[1];
  return (
    <svg className="pw-graph" viewBox="0 0 480 146" role="img" aria-label={beschreibung(z)}>
      <line x1="10" y1={MAIN_Y} x2="470" y2={MAIN_Y} className="pw-linie-main" />
      <text x="470" y={MAIN_Y - 10} textAnchor="end" className="pw-label">main</text>
      {z.branch && (
        <g className={z.geloescht ? 'pw-geloescht' : undefined}>
          <motion.path
            d={`M ${ALT[1]} ${MAIN_Y} C ${ALT[1] + 40} ${MAIN_Y}, ${BRANCH_X[0] - 40} ${BRANCH_Y}, ${BRANCH_X[0]} ${BRANCH_Y} L ${BRANCH_X[2]} ${BRANCH_Y}`}
            className="pw-linie-branch"
            initial={{ pathLength: bewegt ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: dauer }}
          />
          <text x={BRANCH_X[0] - 6} y={BRANCH_Y - 16} className="pw-label pw-label-branch">
            {BRANCH}{z.geloescht ? ' · gelöscht' : ''}
          </text>
        </g>
      )}
      {z.gemergt && (
        <motion.path
          d={`M ${BRANCH_X[2]} ${BRANCH_Y} C ${BRANCH_X[2] + 40} ${BRANCH_Y}, ${MERGE_X - 40} ${MAIN_Y}, ${MERGE_X} ${MAIN_Y}`}
          className="pw-linie-branch"
          initial={{ pathLength: bewegt ? 0 : 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: dauer }}
        />
      )}
      {ALT.map((x) => <circle key={x} cx={x} cy={MAIN_Y} r="7" className="pw-commit-main" />)}
      {BRANCH_X.slice(0, z.commits).map((x, i) => (
        <motion.circle
          key={x}
          cx={x}
          cy={BRANCH_Y}
          r="7"
          className={i < z.gepusht ? 'pw-commit pw-commit-gepusht' : 'pw-commit'}
          initial={{ scale: bewegt ? 0 : 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: bewegt ? 0.3 : 0, delay: bewegt ? i * 0.15 : 0 }}
        />
      ))}
      {z.gemergt && (
        <motion.rect
          x={MERGE_X - 8} y={MAIN_Y - 8} width="16" height="16" rx="2"
          transform={`rotate(45 ${MERGE_X} ${MAIN_Y})`}
          className="pw-commit-merge"
          initial={{ opacity: bewegt ? 0 : 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: dauer }}
        />
      )}
      <Marke x={liveX} y={MAIN_Y + 24} text="live" klasse="pw-marke-live" bewegt={bewegt} />
      <Marke x={macX} y={MAIN_Y + 48} text="euer Mac" klasse={z.macAktuell ? 'pw-marke-mac' : 'pw-marke-mac pw-marke-alt'} bewegt={bewegt} />
    </svg>
  );
}

function Marke({ x, y, text, klasse, bewegt }: { x: number; y: number; text: string; klasse: string; bewegt: boolean }) {
  // Zwei Breiten: Am Handy ist die Schrift in der Grafik größer (stage.css), dort gilt die breite Pille.
  const schmal = text.length * 7.5 + 16;
  const breit = text.length * 10 + 18;
  return (
    <motion.g
      className={klasse}
      initial={false}
      animate={{ x }}
      transition={{ duration: bewegt ? 0.6 : 0, ease: 'easeInOut' }}
    >
      <rect className="pw-pille-schmal" x={-schmal / 2} y={y - 11} width={schmal} height="20" rx="10" />
      <rect className="pw-pille-breit" x={-breit / 2} y={y - 11} width={breit} height="20" rx="10" />
      <text x="0" y={y + 3} textAnchor="middle">{text}</text>
    </motion.g>
  );
}

function beschreibung(z: Zustand): string {
  const teile = ['main mit zwei Commits'];
  if (z.branch) teile.push(`Branch ${BRANCH} mit ${z.commits} Commits, davon ${z.gepusht} auf GitHub`);
  if (z.gemergt) teile.push('in main zusammengeführt');
  if (z.geloescht) teile.push('Branch gelöscht');
  teile.push(`live ist der ${z.live === 'neu' ? 'neue' : 'alte'} Stand`);
  return teile.join(', ');
}

const PRUEF: Record<Pruefung, { icon: LucideIcon; text: string }> = {
  aus: { icon: Circle, text: 'wartet' },
  laeuft: { icon: LoaderCircle, text: 'läuft' },
  ok: { icon: CircleCheck, text: 'ok' },
  rot: { icon: CircleX, text: 'Fehler' },
};
const VORSCHAU_PRUEF: Record<Vorschau, Pruefung> = { aus: 'aus', baut: 'laeuft', fehler: 'rot', bereit: 'ok' };

function Check({ name, status }: { name: string; status: Pruefung }) {
  const { icon: Icon, text } = PRUEF[status];
  return (
    <li className={`pw-check pw-check-${status}`}>
      <Icon aria-hidden="true" /> {name} <span className="pw-check-text">{text}</span>
    </li>
  );
}

function GitHubKarte({ z }: { z: Zustand }) {
  return (
    <section className={klasse(z, 'github', 'pw-feld pw-karte')} aria-label="GitHub">
      <div className="pw-kopf"><GitPullRequest aria-hidden="true" /> GitHub</div>
      {z.pr === 'keiner' ? (
        <p className="pw-leer">
          {z.gepusht > 0 ? <>Branch <code>{BRANCH}</code> ist da – noch kein Pull Request</> : 'Noch nichts von diesem Issue'}
        </p>
      ) : (
        <>
          <div className="pw-pr-titel">PR #12 · {ISSUE} Beschreibung anzeigen</div>
          <div className="pw-klein">{z.commits} Commits · 3 Dateien geändert</div>
          <ul className="pw-checks">
            <Check name="Lint" status={z.lint} />
            <Check name="Build" status={z.build} />
            <Check name="Vercel" status={VORSCHAU_PRUEF[z.vorschau]} />
            {/* Review als vierter Chip in derselben Zeile – spart eine Zeile Höhe. */}
            <li className={`pw-check pw-check-${z.review === 'freigegeben' ? 'ok' : 'aus'}`}>
              {z.review === 'freigegeben' ? <CircleCheck aria-hidden="true" /> : <Circle aria-hidden="true" />} Review{' '}
              <span className="pw-check-text">{z.review === 'freigegeben' ? 'frei' : '–'}</span>
            </li>
          </ul>
          <div className={`pw-merge ${z.pr === 'gemergt' ? 'pw-merge-fertig' : mergeBereit(z) ? 'pw-merge-bereit' : ''}`}>
            <GitMerge aria-hidden="true" /> {z.pr === 'gemergt' ? 'Merged' : 'Merge pull request'}
          </div>
        </>
      )}
    </section>
  );
}

const VORSCHAU_TEXT: Record<Vorschau, string> = { aus: '–', baut: 'baut …', fehler: 'Fehler', bereit: 'bereit' };

function VercelKarte({ z }: { z: Zustand }) {
  return (
    <section className={klasse(z, 'vercel', 'pw-feld pw-karte')} aria-label="Vercel">
      <div className="pw-kopf"><Triangle aria-hidden="true" /> Vercel</div>
      <div className="pw-zeile">
        <Globe aria-hidden="true" /> <span>Live</span>
        <span className={`pw-stand ${z.live === 'neu' ? 'pw-stand-neu' : ''}`}>{z.live === 'neu' ? 'neuer Stand' : 'alter Stand'}</span>
      </div>
      <div className="pw-zeile">
        <Globe aria-hidden="true" /> <span>Vorschau</span>
        <span className={`pw-stand pw-vorschau-${z.vorschau}`}>{VORSCHAU_TEXT[z.vorschau]}</span>
      </div>
    </section>
  );
}

function LinearKarte({ z }: { z: Zustand }) {
  const css = z.issue.toLowerCase().replace(' ', '-');
  return (
    <section className={klasse(z, 'linear', 'pw-feld pw-karte')} aria-label="Linear">
      <div className="pw-kopf"><ListTodo aria-hidden="true" /> Linear</div>
      <div className="pw-pr-titel">{ISSUE} Beschreibung anzeigen</div>
      <span className={`pw-status pw-status-${css}`}>{z.issue}</span>
    </section>
  );
}
