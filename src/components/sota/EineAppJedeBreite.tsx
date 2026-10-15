// Szene „Eine App, jede Breite“ für /konzepte/responsive. Logik und Texte: breite-steps.ts.
// Lineal und Rahmen rechnen in „simulierten Pixeln“: 1 px der App = 1/1440 der Szenenbreite (Container-Einheit cqw),
// so passen 375 und 1440 px maßstabsgetreu nebeneinander. Schrift bleibt lesbar groß und wird nicht mitskaliert.
import { useEffect, useState, type CSSProperties } from 'react';
import { Menu, Search, TriangleAlert } from 'lucide-react';
import Stage, { type StageNav } from './Stage';
import { stageSteps } from './inline';
import {
  BREAKPOINTS, CODE, CODE_FEHLER, FEST_BREIT, INNENABSTAND, MAX_BREITE, MIN_BREITE,
  aktiveKlassen, aufLineal, layoutBei, zustandAt, STEPS, type Layout,
} from './breite-steps';
import './stage.css';

const schritte = stageSteps(STEPS);
const KARTEN = ['Bohrmaschine', 'Zelt', 'Samtsessel', 'Lastenrad', 'Beamer', 'Leiter'];

export default function EineAppJedeBreite() {
  return (
    <Stage title="Eine App, jede Breite" steps={schritte}>
      {(nav, reduced) => <Szene nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Szene({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const z = zustandAt(nav.index + 1);
  const [frei, setFrei] = useState(z.breite);
  // Wer den Schritt neu betritt, beginnt wieder bei der Breite des Schritts.
  useEffect(() => setFrei(z.breite), [nav.seq]);
  const breite = z.frei ? frei : z.breite;
  const l = layoutBei(breite, { fehler: z.fehler });
  const aktiv = aktiveKlassen(breite);

  return (
    <div className={`rb${reduced ? ' rb-ruhig' : ''}`}>
      <div className="rb-kopf">
        <span className="rb-wert">{breite} px</span>
        <span className="rb-wert-neben">· {l.spalten} {l.spalten === 1 ? 'Spalte' : 'Spalten'}</span>
      </div>
      <Lineal breite={breite} figma={z.figma} />
      <Rahmen l={l} reihenfolge={z.reihenfolge} fehler={z.fehler} />
      {z.frei && (
        <label className="rb-regler">
          <span>Breite</span>
          <input
            type="range"
            min={MIN_BREITE}
            max={MAX_BREITE}
            step={1}
            value={frei}
            onChange={(e) => setFrei(Number(e.currentTarget.value))}
            aria-valuetext={`${frei} px, ${l.spalten} ${l.spalten === 1 ? 'Spalte' : 'Spalten'}`}
          />
        </label>
      )}
      <Code sichtbar={z.code} fehler={z.fehler} aktiv={aktiv} />
    </div>
  );
}

function Lineal({ breite, figma }: { breite: number; figma: boolean }) {
  return (
    <div className="rb-lineal" aria-hidden="true">
      <span className="rb-ohne" style={{ width: `${aufLineal(BREAKPOINTS[0].px)}%` }}>ohne Präfix: gilt überall</span>
      {BREAKPOINTS.map((b) => (
        <span key={b.name} className={`rb-marke${breite >= b.px ? ' rb-marke-aktiv' : ''}`} style={{ left: `${aufLineal(b.px)}%` }}>
          <b>{b.name}</b> <span className="rb-px">{b.px}</span>
        </span>
      ))}
      {figma && [375, MAX_BREITE].map((px) => (
        <span key={px} className={`rb-figma${px === MAX_BREITE ? ' rb-figma-rechts' : ''}`} style={{ left: `${aufLineal(px)}%` }}>Figma</span>
      ))}
      <span className="rb-zeiger" style={{ left: `${aufLineal(breite)}%` }} />
    </div>
  );
}

function Rahmen({ l, reihenfolge, fehler }: { l: Layout; reihenfolge: boolean; fehler: boolean }) {
  const stil = {
    '--b': l.breite,
    '--rand': l.rand,
    '--innen': INNENABSTAND,
    '--spalten': l.spalten,
    '--fest': FEST_BREIT,
  } as CSSProperties;
  const beschreibung = `Leihbar bei ${l.breite} px: ${l.spalten} ${l.spalten === 1 ? 'Spalte' : 'Spalten'}, `
    + `${l.navigation === 'voll' ? 'volle Navigation' : 'Menü-Knopf'}`
    + `${l.rand > 0 ? `, Inhalt ${l.inhalt} px breit mit Rand` : ''}`
    + `${l.ueberlauf > 0 ? `, ein Hinweis ragt ${l.ueberlauf} px über den Rand` : ''}.`;

  return (
    <div className="rb-buehne">
      <div className={`rb-app${l.ueberlauf > 0 ? ' rb-app-scrollt' : ''}`} style={stil} role="img" aria-label={beschreibung}>
        <div className="rb-app-kopf">
          <span className="rb-marke-app">Leihbar</span>
          {l.navigation === 'voll' ? (
            <span className="rb-nav"><span>Gegenstände</span><span>Anfragen</span><span>Profil</span></span>
          ) : (
            <span className="rb-menue"><Menu aria-hidden="true" /></span>
          )}
        </div>
        <div className="rb-inhalt">
          {fehler && (
            <div className="rb-hinweis">
              <TriangleAlert aria-hidden="true" /> Neu: Gegenstände teilen
            </div>
          )}
          <div className="rb-suche">
            {reihenfolge && <span className="rb-nr">1</span>}
            <Search aria-hidden="true" /> Suchen …
          </div>
          <ul className="rb-raster">
            {KARTEN.map((k, i) => (
              <li key={k} className="rb-karte">
                {reihenfolge && i === 0 && <span className="rb-nr">2</span>}
                <span className="rb-bild" />
                <span className="rb-titel">{k}</span>
                <span className="rb-zeile" />
              </li>
            ))}
          </ul>
        </div>
      </div>
      {l.ueberlauf > 0 && (
        <span className="rb-ueberlauf-text" style={{ left: `${aufLineal(l.breite)}%` }}>
          ragt {l.ueberlauf} px hinaus
        </span>
      )}
    </div>
  );
}

function Code({ sichtbar, fehler, aktiv }: { sichtbar: boolean; fehler: boolean; aktiv: string[] }) {
  const zeilen = fehler ? [...CODE, CODE_FEHLER] : CODE;
  return (
    <ul className={`rb-code${sichtbar ? '' : ' rb-versteckt'}`} aria-label="Code" aria-hidden={!sichtbar}>
      {zeilen.map((z) => (
        <li key={z.id} className={z.id === 'hinweis' ? 'rb-code-fehler' : undefined}>
          <span className="rb-was">{z.was}</span>
          <code>
            &lt;{z.tag} className="
            {z.klassen.map((k, i) => (
              <span key={k}>
                {i > 0 && ' '}
                <span className={aktiv.includes(k) ? 'rb-klasse-aktiv' : z.id === 'hinweis' ? 'rb-klasse-fehler' : undefined}>{k}</span>
              </span>
            ))}
            "&gt;
          </code>
        </li>
      ))}
      {/* Platz für die Fehler-Zeile reservieren, damit die Szene beim Blättern nicht springt. */}
      {!fehler && <li className="rb-versteckt" aria-hidden="true"><span className="rb-was">Hinweis</span><code>w-[600px]</code></li>}
    </ul>
  );
}
