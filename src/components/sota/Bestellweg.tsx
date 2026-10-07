// Szene „Eine Bestellung durchs Haus“ für Konzept 1 (Tag 1). Logik und Texte: bestellweg-steps.ts.
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft, ArrowRight, Armchair, Check, ChefHat, Circle, CircleCheck, CircleX, ClipboardList, Cloud,
  ConciergeBell, Database, Globe, MousePointerClick, ReceiptText, Search, Stamp, type LucideIcon,
} from 'lucide-react';
import Stage, { type StageNav, type StageStep } from './Stage';
import {
  PRUEFUNGEN, STATIONEN, STEPS, WERKZEUG, spalte, stateAt, strecke, type Pruefung, type StationId, type Zettel, type Zustand,
} from './bestellweg-steps';
import './stage.css';

const STATION: Record<StationId, { icon: LucideIcon; name: string; bild: string; rolle: string }> = {
  frontend: { icon: Armchair, name: 'Frontend', bild: 'Gastraum', rolle: 'zeigt an, nimmt Klicks an' },
  api: { icon: ConciergeBell, name: 'API', bild: 'Kellner', rolle: 'nimmt an, trägt weiter' },
  backend: { icon: ChefHat, name: 'Backend', bild: 'Küche', rolle: 'prüft, entscheidet, zählt' },
  db: { icon: Database, name: 'Datenbank', bild: 'Vorratskammer', rolle: 'speichert dauerhaft' },
};

const ZETTEL_ICON = { bestellung: ClipboardList, antwort: ReceiptText, fehler: CircleX } as const;

// Pro Station wandert der Zettel so lange (Sekunden).
const FAHRT = 0.6;

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

export default function Bestellweg() {
  return (
    <Stage title="Eine Bestellung durchs Haus" steps={stageSteps}>
      {(nav, reduced) => <Haus nav={nav} reduced={reduced} />}
    </Stage>
  );
}

function Haus({ nav, reduced }: { nav: StageNav; reduced: boolean }) {
  const z = stateAt(nav.index + 1);
  // Bewegung nur beim Vorwärtsblättern; zurück und mit reduzierter Bewegung steht alles sofort am Ziel.
  const bewegt = nav.direction === 1 && !reduced;
  const fahrt = bewegt ? strecke(nav.index + 1) * FAHRT : 0;

  return (
    <div className={`bw${z.aktiv ? '' : ' bw-alle'}`}>
      <div className="bw-haus">
        <div className="bw-server" aria-hidden="true" />
        {STATIONEN.map((id) => (
          <Station key={id} id={id} z={z} bewegt={bewegt} fahrt={fahrt} />
        ))}
        <div className="bw-spur" aria-hidden="true">
          <AnimatePresence initial={false}>
            {z.zettel && (
              <motion.div
                key={z.zettel.key}
                className="bw-spur-zettel"
                initial={{ left: pos(bewegt && z.zettel.von ? z.zettel.von : z.zettel.at), opacity: 0 }}
                animate={{ left: pos(z.zettel.at), opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{ left: { duration: fahrt, ease: 'easeInOut' }, opacity: { duration: bewegt ? 0.2 : 0 } }}
              >
                <ZettelKarte zettel={z.zettel} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="bw-ort bw-ort-frontend"><Globe aria-hidden="true" /> im Browser</div>
        <div className="bw-ort bw-ort-server"><Cloud aria-hidden="true" /> Server · Vercel · <code>route.ts</code></div>
        <div className="bw-ort bw-ort-db"><Cloud aria-hidden="true" /> Supabase</div>
      </div>
    </div>
  );
}

// Mitte der Station; außen etwas nach innen gerückt, damit der Zettel nicht über den Rand ragt.
const MITTE = [15, 37.5, 62.5, 84];
function pos(id: StationId): string {
  return `${MITTE[spalte(id)]}%`;
}

function Station({ id, z, bewegt, fahrt }: { id: StationId; z: Zustand; bewegt: boolean; fahrt: number }) {
  const s = STATION[id];
  const Icon = s.icon;
  const aktiv = z.aktiv === id;
  const klasse = ['bw-station', `bw-${id}`, aktiv && 'bw-aktiv', z.aktiv && !aktiv && 'bw-passiv', id === 'db' && z.unberuehrt && 'bw-unberuehrt']
    .filter(Boolean)
    .join(' ');

  return (
    <section className={klasse} aria-label={`${s.name} (${s.bild})`}>
      <div className="bw-kopf">
        <Icon className="bw-icon" aria-hidden="true" />
        <div>
          <div className="bw-name">{s.name}</div>
          <div className="bw-bild">{s.bild}</div>
        </div>
      </div>
      <div className="bw-rolle">{s.rolle}</div>
      <div className="bw-inhalt">
        {id === 'frontend' && <Gegenstandkarte z={z} bewegt={bewegt} fahrt={fahrt} />}
        {id === 'api' && <code className="bw-endpoint">/api/requests</code>}
        {id === 'backend' && <Pruefungen liste={z.pruefungen} bewegt={bewegt} fahrt={fahrt} />}
        {id === 'db' && <Tabelle z={z} bewegt={bewegt} fahrt={fahrt} />}
      </div>
      {z.zettel?.at === id && (
        <div className="bw-chip" aria-hidden="true">
          <ZettelKarte zettel={z.zettel} />
        </div>
      )}
      {z.werkzeuge && (
        <div className="bw-werkzeug">
          <Search aria-hidden="true" /> {WERKZEUG[id]}
        </div>
      )}
    </section>
  );
}

function ZettelKarte({ zettel }: { zettel: Zettel }) {
  const Icon = ZETTEL_ICON[zettel.art];
  const Pfeil = zettel.art === 'bestellung' ? ArrowRight : ArrowLeft;
  return (
    <div className={`bw-zettel bw-zettel-${zettel.art}`}>
      <Icon className="bw-zettel-icon" aria-hidden="true" />
      <div className="bw-zettel-text">
        <span>{zettel.zeilen[0]}</span>
        <span>{zettel.zeilen[1]}</span>
      </div>
      <Pfeil className="bw-zettel-pfeil" aria-hidden="true" />
      {zettel.stempel && (
        <span className="bw-stempel">
          <Stamp aria-hidden="true" /> angenommen
        </span>
      )}
    </div>
  );
}

function Gegenstandkarte({ z, bewegt, fahrt }: { z: Zustand; bewegt: boolean; fahrt: number }) {
  return (
    <div className="bw-event">
      <div className="bw-event-titel">Nr. 42 · Samtsessel</div>
      <div className="bw-event-wer">{z.angemeldet ? `angemeldet als ${z.nutzer}` : `${z.nutzer} · nicht angemeldet`}</div>
      <div className="bw-event-zahl">
        <strong>{z.angezeigt}</strong> Anfragen
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={z.button}
          className={`bw-knopf bw-knopf-${z.button}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          // Der neue Zustand erscheint erst, wenn die Antwort angekommen ist.
          transition={{ duration: bewegt ? 0.2 : 0, delay: bewegt && z.button !== 'offen' ? fahrt : 0 }}
        >
          {z.button === 'offen' && 'Anfragen'}
          {z.button === 'angefragt' && <><Check aria-hidden="true" /> Angefragt</>}
          {z.button === 'fehler' && <><CircleX aria-hidden="true" /> Bitte anmelden</>}
          {z.klick && z.button === 'offen' && (
            <motion.span
              className="bw-klick"
              initial={bewegt ? { scale: 1.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: bewegt ? 0.3 : 0 }}
            >
              <MousePointerClick aria-hidden="true" />
            </motion.span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const PRUEF_ICON: Record<Pruefung, LucideIcon> = { offen: Circle, ok: CircleCheck, fehler: CircleX };

function Pruefungen({ liste, bewegt, fahrt }: { liste: Zustand['pruefungen']; bewegt: boolean; fahrt: number }) {
  return (
    <ul className="bw-pruefungen">
      {PRUEFUNGEN.map((text, i) => {
        const status = liste[i];
        const Icon = PRUEF_ICON[status];
        return (
          <li key={text} className={`bw-pruefung-${status}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={status}
                className="bw-pruef-icon"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                // Nacheinander abhaken, sobald der Zettel in der Küche liegt.
                transition={{ duration: bewegt ? 0.25 : 0, delay: bewegt ? fahrt + i * 0.35 : 0 }}
              >
                <Icon aria-hidden="true" />
              </motion.span>
            </AnimatePresence>
            {text}
          </li>
        );
      })}
    </ul>
  );
}

function Tabelle({ z, bewegt, fahrt }: { z: Zustand; bewegt: boolean; fahrt: number }) {
  return (
    <div className="bw-tabelle">
      <div className="bw-tabelle-name"><code>requests</code></div>
      <table>
        <thead>
          <tr><th>item_id</th><th>user</th><th>created_at</th></tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {z.zeilen.map((r) => (
              <motion.tr
                key={r.id}
                className={r.id === z.neueZeile ? 'bw-neu' : undefined}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0 } }}
                transition={{ duration: bewegt ? 0.4 : 0, delay: bewegt ? fahrt : 0 }}
              >
                <td>42</td><td>{r.user}</td><td>{r.zeit}</td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <div className="bw-tabelle-summe">
        <strong>{z.anzahl}</strong> Zeilen für Gegenstand 42
      </div>
    </div>
  );
}
