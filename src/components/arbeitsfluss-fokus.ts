// Fokus im Arbeitsfluss (NDU-74): Was eine Station im Fokus mit den anderen macht. Ohne Importe, damit das Skript klein
// bleibt; rollen gilt beim Bauen (Prop fokus) und im Browser, fokusSteuern schaltet im Browser um (getestet mit happy-dom).

/** fokus: die Station selbst; quelle: gibt ihr etwas; ziel: nimmt etwas von ihr; blass: unbeteiligt. */
export type Rolle = 'fokus' | 'quelle' | 'ziel' | 'blass';

/** Rolle jeder Station bei einem Fokus; ohne Fokus hat keine eine Rolle. */
export function rollen(alle: string[], fokus: string | undefined, kanten: { quellen: string[]; ziele: string[] }): Record<string, Rolle | undefined> {
  const r: Record<string, Rolle | undefined> = {};
  for (const id of alle) {
    r[id] = !fokus ? undefined : id === fokus ? 'fokus' : kanten.quellen.includes(id) ? 'quelle' : kanten.ziele.includes(id) ? 'ziel' : 'blass';
  }
  return r;
}

/** Tour: Fokus auf der zuletzt aufgedeckten Station (Schritte werden der Reihe nach aufgedeckt); keine: kein Fokus. */
export const tourFokus = (schritte: { id: string; gezeigt: boolean }[]): string | undefined =>
  schritte.filter((s) => s.gezeigt).at(-1)?.id;

/** ?station=… aus der Adresse, nur wenn es die Station gibt. */
export function stationAusAdresse(suche: string, bekannt: string[]): string | undefined {
  const id = new URLSearchParams(suche).get('station') ?? undefined;
  return id && bekannt.includes(id) ? id : undefined;
}

/** Ruhender Fokus, eine Regel für Laden und Tour-Schritt: Tour-Schritt vor ?station=… vor Prop fokus. */
export const grundFokus = (z: { tour?: string; adresse?: string; prop?: string }): string | undefined => z.tour ?? z.adresse ?? z.prop;

const ROLLEN: Rolle[] = ['fokus', 'quelle', 'ziel', 'blass'];

/**
 * Fokus im Browser für eine Figur (.af aus Arbeitsfluss.astro). Kanten (data-quellen, data-ziele), Pfade und Fußzeilen
 * stehen schon im HTML; hier wird nur umgeschaltet. Vorrang: Die letzte Handlung gilt – Maus oder Tastatur auf einer
 * Station überlagern den ruhenden Fokus (grundFokus), ein Tour-Schritt (← / →) setzt beide zurück und zeigt seine Station.
 * Kommt der Fokus aus der Adresse und ist seine Spalte noch zugedeckt (aufdecken), wird sie bis dorthin aufgedeckt.
 */
export function fokusSteuern(fig: HTMLElement, suche: string): void {
  const stationen = [...fig.querySelectorAll<HTMLElement>('.af-station[data-id]')];
  const ids = stationen.map((s) => s.dataset.id!);
  const liste = (v?: string) => (v ?? '').split(' ').filter(Boolean);
  const zeige = (fokus: string | undefined) => {
    const el = stationen.find((s) => s.dataset.id === fokus);
    const r = rollen(ids, el ? fokus : undefined, { quellen: liste(el?.dataset.quellen), ziele: liste(el?.dataset.ziele) });
    fig.toggleAttribute('data-fokus-an', !!el);
    for (const s of stationen) for (const x of ROLLEN) s.classList.toggle(`af-${x}`, r[s.dataset.id!] === x);
    for (const p of fig.querySelectorAll<SVGElement>('[data-fokus-pfad]')) p.classList.toggle('af-an', !!el && p.dataset.fokusPfad === fokus);
    for (const f of fig.querySelectorAll<HTMLElement>('[data-fuss]')) f.hidden = !el || f.dataset.fuss !== fokus;
    const legende = fig.querySelector<HTMLElement>('.af-fuss-legende');
    if (legende) legende.hidden = !!el;
  };

  const prop = fig.dataset.fokus || undefined;
  const adresse = fig.hasAttribute('data-adresse') ? stationAusAdresse(suche, ids) : undefined;
  const marker = [...fig.querySelectorAll<HTMLElement>('[data-tour]')];
  const ausTour = () => tourFokus(marker.map((m) => ({ id: m.dataset.tour!, gezeigt: m.classList.contains('gezeigt') })));
  let ueber: string | undefined; // Station unter der Maus
  let fokussiert: string | undefined; // Station mit Tastaturfokus
  const jetzt = () => ueber ?? fokussiert ?? grundFokus({ tour: ausTour(), adresse, prop });

  // ?station=… im Beamer: Spalten bis zur Station aufdecken, sonst stünde der Fokus in einer verdeckten Spalte.
  if (adresse) {
    const sp = Number(stationen.find((s) => s.dataset.id === adresse)?.dataset.spalte);
    for (const sch of fig.querySelectorAll<HTMLElement>('.af-spalte[data-schritt]')) {
      if (Number(sch.dataset.spalte) <= sp) sch.classList.add('gezeigt');
    }
  }

  if (marker.length) {
    // ← / → in Layout.astro setzen und nehmen .gezeigt; darauf hört die Tour (auch beim Zurückblättern).
    const beobachter = new MutationObserver(() => { ueber = undefined; fokussiert = undefined; zeige(jetzt()); });
    for (const m of marker) beobachter.observe(m, { attributes: true, attributeFilter: ['class'] });
  }
  zeige(jetzt());

  for (const s of stationen) {
    s.addEventListener('mouseenter', () => { ueber = s.dataset.id; zeige(jetzt()); });
    s.addEventListener('mouseleave', () => { if (ueber === s.dataset.id) ueber = undefined; zeige(jetzt()); });
    s.addEventListener('focus', () => { fokussiert = s.dataset.id; zeige(jetzt()); });
    s.addEventListener('blur', () => { if (fokussiert === s.dataset.id) fokussiert = undefined; zeige(jetzt()); });
  }

  // Legende: eine Linie allein zeigen; derselbe Knopf noch einmal zeigt wieder alle.
  const knoepfe = [...fig.querySelectorAll<HTMLButtonElement>('[data-faden-knopf]')];
  for (const k of knoepfe) {
    k.addEventListener('click', () => {
      const l = k.dataset.fadenKnopf!;
      if (fig.dataset.faden === l) delete fig.dataset.faden;
      else fig.dataset.faden = l;
      for (const x of knoepfe) x.setAttribute('aria-pressed', String(fig.dataset.faden === x.dataset.fadenKnopf));
    });
  }
}
