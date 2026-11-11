// Ein Interview-Snapshot groß zum Zeigen (Zeigen-Modus im Leser der Lehrenden, Zeigen.tsx). Aufbau wie Torres’
// Vorlage (S. 68) und die Folie snapshot-i2 der Synthese: oben ID, Pseudonym und einprägsames Zitat, darunter
// Kurzinfos, Einsichten und Chancen (die Chancen am breitesten). Jede Chance zeigt ihre Belege mit dem Text des Zitats,
// damit man im Gespräch sieht, worauf sie sich stützt. Die Geschichte (Notizen) und alle Zitate zugeklappt darunter.
// Nur Text, nie HTML aus der Mappe.
import type { Interview } from '../schemas/index.js';
import { belegeAufloesen, istSynthetisch, type Neu } from './snapshot-hilfen.js';

const Leer = () => <span className="snap-leer">—</span>;
const NeuMarke = () => <span className="snap-neu-marke">neu</span>;

export default function SnapshotAnsicht({ iv, neu }: { iv: Interview; neu?: Neu }) {
  const einsichten = iv.einsichten.filter((e) => e.trim());
  const chancen = iv.chancen.filter((c) => c.text.trim());
  const zitate = iv.zitate.filter((z) => z.text.trim());
  const titel = `${iv.id} · ${iv.pseudonym.trim() || '—'}`;
  return (
    <section className="snap" aria-label={`Interview-Snapshot ${titel}`}>
      <div className="snap-kopf">
        <h3 className="snap-titel">
          <span className="snap-name">{titel}</span>{' '}
          <span className="snap-zitat">{iv.zitat.trim() ? `„${iv.zitat.trim()}“` : <Leer />}</span>
        </h3>
        {istSynthetisch(iv) && <p className="snap-synthetisch">Synthetisch – zählt nicht als Beleg</p>}
      </div>
      <div className="snap-spalten">
        <div className="snap-kurzinfos">
          <h4>Kurzinfos</h4>
          <p>{iv.kurzinfos.trim() || <Leer />}</p>
        </div>
        <div className="snap-einsichten">
          <h4>Einsichten</h4>
          {einsichten.length > 0
            ? <ul>{einsichten.map((e, i) => <li key={i} className={neu?.einsichten.has(e.trim()) ? 'snap-neu' : undefined}>{e}{neu?.einsichten.has(e.trim()) && <> <NeuMarke /></>}</li>)}</ul>
            : <p><Leer /></p>}
        </div>
        <div className="snap-chancen">
          <h4>Chancen</h4>
          {chancen.length > 0 ? (
            <ul>
              {chancen.map((c, i) => (
                <li key={i} className={neu?.chancen.has(c.text.trim()) ? 'snap-neu' : undefined}>
                  {c.text}{neu?.chancen.has(c.text.trim()) && <> <NeuMarke /></>}
                  {c.belege.length === 0
                    ? <span className="snap-ohne-beleg"> – noch ohne Beleg</span>
                    : (
                      <ul className="snap-belege">
                        {belegeAufloesen(c, iv.zitate).map((b, j) => (
                          <li key={j}>
                            <span className="snap-id">{b.id}</span>{' '}
                            {b.text === null ? <span className="snap-leer">(unbekannt)</span> : `„${b.text}“`}
                          </li>
                        ))}
                      </ul>
                    )}
                </li>
              ))}
            </ul>
          ) : <p><Leer /></p>}
        </div>
      </div>
      <details className="snap-mehr">
        <summary>Notizen (Geschichte)</summary>
        <p className="snap-notizen">{iv.notizen.trim() || <Leer />}</p>
      </details>
      {zitate.length > 0 && (
        <details className="snap-mehr">
          <summary>Alle Zitate ({zitate.length})</summary>
          <ul className="snap-zitate">{zitate.map((z, i) => <li key={i}><span className="snap-id">{z.id}</span> „{z.text}“</li>)}</ul>
        </details>
      )}
    </section>
  );
}
