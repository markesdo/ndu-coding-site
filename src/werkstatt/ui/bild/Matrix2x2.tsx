import './matrix.css';

// 2×2-Matrix wie src/components/bild/Matrix2x2.astro (gleiche Props, gleiches Markup, gleiche Klassen).
// felder: [oben links, oben rechts, unten links, unten rechts]; punkte: x und y von 0 bis 1 (y nach oben).
export type Feld = 'ol' | 'or' | 'ul' | 'ur';
export type MatrixProps = {
  label: string;
  x: { label: string; links: string; rechts: string };
  y: { label: string; unten: string; oben: string };
  felder?: [string, string, string, string];
  hervor?: Feld;
  // farbe: Klasse der Art (yellow|blue|green|purple); art: Text der Art, nur für Screenreader.
  punkte?: { id?: string; t: string; x: number; y: number; hervor?: boolean; farbe?: string; art?: string }[];
};

const NAMEN: Feld[] = ['ol', 'or', 'ul', 'ur'];
const klemme = (v: number) => Math.min(1, Math.max(0, v));
const prozent = (v: number) => `${Math.round(klemme(v) * 1000) / 10}%`;
const klassen = (...k: (string | false | undefined)[]) => k.filter(Boolean).join(' ');

export function Matrix2x2({ label, x, y, felder = ['', '', '', ''], hervor, punkte = [] }: MatrixProps) {
  return (
    <figure className="matrix" aria-label={label}>
      <div className="matrix-y" aria-hidden="true"><span>{y.oben}</span><strong>{y.label}</strong><span>{y.unten}</span></div>
      <div className="matrix-flaeche" aria-hidden="true">
        {NAMEN.map((n, i) => <div key={n} className={klassen('matrix-feld', n, hervor === n && 'hervor')}>{felder[i] && <span>{felder[i]}</span>}</div>)}
        {punkte.map((p, i) => (
          <span
            key={p.id ?? i}
            className={klassen('matrix-punkt', p.farbe, p.hervor && 'hervor')}
            style={{ left: prozent(p.x), bottom: prozent(p.y), ['--x' as string]: klemme(p.x), ['--y' as string]: klemme(p.y) }}
          >{p.t}</span>
        ))}
      </div>
      <div className="matrix-x" aria-hidden="true"><span>{x.links}</span><strong>{x.label}</strong><span>{x.rechts}</span></div>
      {/* Für Screenreader: die Fläche ist aria-hidden, hier steht dasselbe als Liste. */}
      <ul className="sr-only">
        {NAMEN.map((n, i) => felder[i] && <li key={n}>Feld {y.label} {n[0] === 'o' ? y.oben : y.unten}, {x.label} {n[1] === 'r' ? x.rechts : x.links}: {felder[i]}{hervor === n ? ' (hervorgehoben)' : ''}</li>)}
        {punkte.map((p, i) => <li key={p.id ?? i}>{p.t}{p.art ? ` (${p.art})` : ''}: {x.label} {klemme(p.x) >= .5 ? x.rechts : x.links}, {y.label} {klemme(p.y) >= .5 ? y.oben : y.unten}{p.hervor ? ' (hervorgehoben)' : ''}</li>)}
      </ul>
    </figure>
  );
}
