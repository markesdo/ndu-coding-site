// Auftakt der Übersicht (index.astro): Ein Auftrag wird getippt, dann landet die Seite Stück für Stück.
// Läuft nur, wenn das Inline-Skript in index.astro html[data-auftakt] gesetzt hat (erster Besuch oder ?intro).
// Web Animations API, keine Bibliothek. Jede Taste, jeder Klick, jedes Scrollen beendet ihn sofort.
import { LANDEN_MS, LINIE_MS, TAG_TEXT_MS, TAG_TEXT_VERSATZ, WECHSEL_MS, promptWahl, tokens, woerter, zeitplan } from './auftakt-zeitplan';

const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero]');

if (hero && root.hasAttribute('data-auftakt')) starten(hero);

function starten(hero: HTMLElement) {
  const h1 = hero.querySelector<HTMLElement>('h1');
  const lead = hero.querySelector<HTMLElement>('.lead');
  const eyebrow = hero.querySelector<HTMLElement>('.eyebrow');
  const tage = [...hero.querySelectorAll<HTMLElement>('.day')];
  if (!h1 || !lead || !eyebrow) return beenden();

  // Original-Markup sichern: Am Ende kommt es unverändert zurück (Screenreader, Kopieren, Cursor).
  const h1Html = h1.innerHTML;
  const leadHtml = lead.innerHTML;
  const animationen: Animation[] = [];
  const zeitgeber: number[] = [];
  let fertig = false;

  // Breite des Kopfs (nicht der Überschrift: die ist im Beamer nur so breit wie ihr Text).
  // 1,05rem wie in der CSS – mit der echten Wurzelgröße, damit der Beamer-Modus (125 %) mitwächst.
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const wunschPx = Math.min(1.05 * root, window.innerWidth * 0.042);
  const wahl = promptWahl(hero.clientWidth, wunschPx);
  const prompt = wahl.text;
  const h1Stuecke = wickeln(h1, tokens(h1.textContent ?? ''));
  const leadStuecke = wickeln(lead, woerter(lead.textContent ?? ''));
  const plan = zeitplan({ prompt, h1Tokens: h1Stuecke.length, leadWoerter: leadStuecke.length, tage: tage.length });

  // Der getippte Auftrag liegt über der Überschrift und verändert den Fluss nicht.
  const zeile = document.createElement('span');
  zeile.className = 'auftakt-prompt';
  zeile.setAttribute('aria-hidden', 'true');
  zeile.style.fontSize = `${wahl.px}px`;
  const chevron = Object.assign(document.createElement('span'), { className: 'auftakt-chevron', textContent: '›' });
  const text = Object.assign(document.createElement('span'), { className: 'auftakt-text' });
  const tippCursor = Object.assign(document.createElement('span'), { className: 'cursor' });
  zeile.append(chevron, ' ', text, tippCursor);
  h1.append(zeile);
  // Der eigene Cursor der Überschrift landet mit dem letzten Stück.
  const h1Cursor = [...h1.querySelectorAll<HTMLElement>('.cursor')].find((c) => !zeile.contains(c));
  root.setAttribute('data-auftakt-laeuft', '');

  plan.tipp.forEach((t, i) => zeitgeber.push(window.setTimeout(() => { text.textContent = prompt.slice(0, i + 1); }, t)));

  const ein = (el: Element, delay: number, dauer = LANDEN_MS, y = 6) =>
    animationen.push(el.animate(
      [{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: 'none' }],
      { delay, duration: dauer, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' },
    ));

  animationen.push(zeile.animate(
    [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }],
    { delay: plan.wechsel, duration: WECHSEL_MS, easing: 'ease-out', fill: 'both' },
  ));
  // Stücke und Wörter sind Inline-Spans: dort wirkt keine Verschiebung (inline-block würde die Umbrüche ändern) – nur einblenden.
  h1Stuecke.forEach((teile, i) => teile.forEach((el) => ein(el, plan.h1[i], LANDEN_MS, 0)));
  if (h1Cursor) ein(h1Cursor, plan.h1.at(-1) ?? plan.wechsel, LANDEN_MS, 0);
  ein(eyebrow, plan.eyebrow);
  leadStuecke.forEach((teile, i) => teile.forEach((el) => ein(el, plan.lead[i], LANDEN_MS, 0)));
  tage.forEach((tag, i) => {
    const linie = document.createElement('span');
    linie.className = 'auftakt-linie';
    linie.setAttribute('aria-hidden', 'true');
    tag.prepend(linie);
    animationen.push(linie.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { delay: plan.tage[i], duration: LINIE_MS, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'both' }));
    for (const kind of tag.children) if (kind !== linie) ein(kind, plan.tage[i] + TAG_TEXT_VERSATZ, TAG_TEXT_MS, 8);
  });

  zeitgeber.push(window.setTimeout(beendenMitAufraeumen, plan.ende + 50));
  const abbrechen = () => beendenMitAufraeumen();
  const optionen: AddEventListenerOptions = { once: true, passive: true, capture: true };
  const ereignisse = ['keydown', 'pointerdown', 'wheel', 'touchmove'] as const;
  ereignisse.forEach((e) => window.addEventListener(e, abbrechen, optionen));

  function beendenMitAufraeumen() {
    if (fertig) return;
    fertig = true;
    zeitgeber.forEach((z) => clearTimeout(z));
    animationen.forEach((a) => a.cancel());
    ereignisse.forEach((e) => window.removeEventListener(e, abbrechen, optionen));
    h1!.innerHTML = h1Html;
    lead!.innerHTML = leadHtml;
    hero.querySelectorAll('.auftakt-linie').forEach((l) => l.remove());
    beenden();
  }
}

function beenden() {
  root.removeAttribute('data-auftakt');
  root.removeAttribute('data-auftakt-laeuft');
  root.setAttribute('data-auftakt-fertig', '');
}

/**
 * Zerlegt den Text eines Elements in Stücke (Längen aus `stuecke`) und hüllt jedes in <span>, auch über
 * Elementgrenzen hinweg (z. B. „AI“ steckt in einem eigenen <span>). Liefert pro Stück die erzeugten Spans.
 */
function wickeln(el: HTMLElement, stuecke: string[]): HTMLElement[][] {
  const grenzen: number[] = [];
  let summe = 0;
  for (const s of stuecke) { summe += s.length; grenzen.push(summe); }
  const ergebnis: HTMLElement[][] = stuecke.map(() => []);
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const knoten: Text[] = [];
  while (walker.nextNode()) knoten.push(walker.currentNode as Text);
  let pos = 0;
  for (const k of knoten) {
    let rest = k.data;
    const teile: Node[] = [];
    while (rest.length) {
      const idx = grenzen.findIndex((g) => g > pos);
      if (idx < 0) { teile.push(document.createTextNode(rest)); pos += rest.length; break; }
      const n = Math.min(rest.length, grenzen[idx] - pos);
      const span = document.createElement('span');
      span.className = 'auftakt-stueck';
      span.textContent = rest.slice(0, n);
      ergebnis[idx].push(span);
      teile.push(span);
      rest = rest.slice(n);
      pos += n;
    }
    k.replaceWith(...teile);
  }
  return ergebnis.filter((t) => t.length);
}
