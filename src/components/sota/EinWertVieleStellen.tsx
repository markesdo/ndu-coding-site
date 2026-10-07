// Szene „Ein Wert, viele Stellen“ für /konzepte/design-system (Tag 3). Logik und Texte: design-token-steps.ts.
import type { CSSProperties, ReactNode } from 'react';
import { Check, Plus, X } from 'lucide-react';
import Stage, { type StageNav, type StageStep } from './Stage';
import { STEPS, farbe, farben, zustandAt, type Art, type Seite, type StelleId, type Zustand } from './design-token-steps';
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

const FARBNAMEN: Record<string, string> = { '#e8472b': 'Rot', '#e8603f': 'ein etwas anderes Rot', '#2457d6': 'Blau' };
const farbname = (hex: string) => FARBNAMEN[hex] ?? hex;

export default function EinWertVieleStellen() {
  return (
    <Stage title="Ein Wert, viele Stellen" steps={stageSteps}>
      {(nav, reduced) => <Szene nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Szene({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const z = zustandAt(nav.index + 1);
  return (
    <div className={`dt${reduced ? ' dt-ruhig' : ''}`}>
      <Spalte z={z} art="token" titel="Mit Token" />
      <Spalte z={z} art="hex" titel="Mit festen Farbwerten" />
    </div>
  );
}

function Spalte({ z, art, titel }: { z: Zustand; art: Art; titel: string }) {
  const seite = z[art];
  const anzahl = farben(seite).length;
  // Markierungen und Fehlschläge betreffen nur die Seite mit festen Werten – außer beim neuen Button.
  const markiert = z.markiert.filter((id) => art === 'hex' || id === 'teilen');
  return (
    <div className="dt-seite">
      <div className="dt-kopf">
        <span className="dt-label">{titel}</span>
        <span className={`dt-zahl${z.code ? '' : ' dt-versteckt'}`}>
          {anzahl} {anzahl === 1 ? 'Farbe' : 'Farben'}
        </span>
      </div>
      <MiniApp seite={seite} markiert={markiert} />
      <Code z={z} seite={seite} art={art} markiert={markiert} />
    </div>
  );
}

function MiniApp({ seite, markiert }: { seite: Seite; markiert: StelleId[] }) {
  const f = (id: StelleId) => {
    const s = seite.stellen.find((x) => x.id === id);
    return s ? farbe(seite, s) : undefined;
  };
  const m = (id: StelleId) => (markiert.includes(id) ? ' dt-markiert' : '');
  const teilen = f('teilen');
  const beschreibung = seite.stellen.map((s) => `${s.name}: ${farbname(farbe(seite, s))}`).join(', ');

  return (
    <div className="dt-app" role="img" aria-label={`Leihbar – ${beschreibung}`}>
      <div className="dt-app-kopf">
        <span className="dt-marke">Leihbar</span>
        <span className={`dt-link${m('link')}`} style={{ color: f('link') }}>Alle Gegenstände</span>
      </div>
      <span className={`dt-suche${m('fokus')}`} style={{ outlineColor: f('fokus') } as CSSProperties}>Suchen …</span>
      <div className={`dt-karte${m('rand')}`} style={{ borderLeftColor: f('rand') }}>
        <div className="dt-karte-titel">
          Lauftreff <span className={`dt-badge${m('badge')}`} style={{ background: f('badge') }}>Neu</span>
        </div>
        <div className="dt-meta">21.10. · 07:30 · Sportplatz</div>
        <div className="dt-knoepfe">
          <span className={`dt-knopf${m('button')}`} style={{ background: f('button') }}>Ich komme</span>
          {/* Platz für den späteren Button reservieren, damit die Szene nicht springt. */}
          <span className={`dt-knopf${m('teilen')}${teilen ? '' : ' dt-versteckt'}`} style={{ background: teilen ?? f('badge') }}>Teilen</span>
        </div>
      </div>
    </div>
  );
}

function Code({ z, seite, art, markiert }: { z: Zustand; seite: Seite; art: Art; markiert: StelleId[] }) {
  const teilenFehlt = !seite.stellen.some((s) => s.id === 'teilen');
  // Links ändert sich beim Farbwechsel nur die Token-Zeile; die Stellen behalten ihren Code und folgen trotzdem.
  const tokenGeaendert = art === 'token' && z.geaendert.token.length > 1;
  return (
    <ul className={`dt-code${z.code ? '' : ' dt-versteckt'}`} aria-label={`Code: ${art === 'token' ? 'mit Token' : 'mit festen Farbwerten'}`}>
      <li className={tokenGeaendert ? 'dt-neu' : undefined}>
        <span className="dt-datei">globals.css</span>
        {art === 'token' ? (
          <>
            <code>--accent: {seite.accent}</code>
            <Swatch hex={seite.accent!} />
            <Status neu={tokenGeaendert} />
          </>
        ) : (
          <span className="dt-leer">kein Token</span>
        )}
      </li>
      {seite.stellen.map((s) => {
        const neu = z.geaendert[art].includes(s.id) && !(art === 'token' && s.id !== 'teilen');
        const verfehlt = art === 'hex' && z.verfehlt.includes(s.id);
        return (
          <li key={s.id} className={`${markiert.includes(s.id) ? 'dt-zeile-markiert' : ''}${neu ? ' dt-neu' : ''}`.trim() || undefined}>
            <span className="dt-datei">{s.datei}</span>
            <code>{s.code}</code>
            <Swatch hex={farbe(seite, s)} />
            <Status neu={neu} verfehlt={verfehlt} hinzu={neu && s.id === 'teilen'} />
          </li>
        );
      })}
      {teilenFehlt && (
        <li className="dt-versteckt" aria-hidden="true">
          <span className="dt-datei">Teilen.tsx</span>
          <code>bg-accent</code>
        </li>
      )}
    </ul>
  );
}

function Swatch({ hex }: { hex: string }) {
  return <span className="dt-swatch" style={{ background: hex }} aria-hidden="true" />;
}

function Status({ neu = false, verfehlt = false, hinzu = false }: { neu?: boolean; verfehlt?: boolean; hinzu?: boolean }) {
  if (hinzu) return <Plus className="dt-status dt-status-hinzu" aria-label="neu hinzugekommen" />;
  if (verfehlt) return <X className="dt-status dt-status-verfehlt" aria-label="nicht ersetzt" />;
  if (neu) return <Check className="dt-status dt-status-neu" aria-label="geändert" />;
  return <span className="dt-status" aria-hidden="true" />;
}
