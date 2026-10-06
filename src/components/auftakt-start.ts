// „Der Cursor läuft“ – die Eröffnung auf /start (start.astro). GSAP mit SplitText und ScrambleText, nur auf dieser Seite.
// Ablauf (Zeiten in REGIE, auftakt-zeitplan.ts): Ein großer Block-Cursor wartet → ein Auftrag wird getippt → „Enter“ →
// die Buchstaben des Auftrags fliegen in die Überschrift „Programmieren mit AI“ → der Cursor landet dahinter →
// ein Druckkopf läuft, die Einleitung erscheint Wort für Wort → die drei Tage werden gedruckt → „› weiter▮“ wartet.
// Nie automatisch weiter. Jede Taste, jeder Klick, jedes Scrollen springt ans Ende (Enter vor dem „Enter“ schickt ab);
// diese Geste löst nicht zugleich „Weiter“ aus (Sperre WEITER_SPERRE_MS). Endet immer im statischen HTML der Seite.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import {
  AUSGANG_MS, REGIE, WEITER_SPERRE_MS,
  flugZuordnung, istWeiterTaste, promptWahl, tastenAktion, tippZeiten, weiterZiel,
} from './auftakt-zeitplan';

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const root = document.documentElement;
const buehne = document.querySelector<HTMLElement>('#auftakt-buehne');
const weiter = document.querySelector<HTMLAnchorElement>('[data-weiter]');
const blitz = document.querySelector<HTMLElement>('.start-blitz');
const start = document.querySelector<HTMLElement>('.start');

/** Zu spät geladen: Das CSS-Sicherheitsnetz hat nach 5 s schon alles gezeigt – dann nicht noch einmal von vorn. */
const ZU_SPAET_MS = 4500;
const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

let weiterFrei = false;
let imAusgang = false;
let beendet = false;
let aufraeumen: (() => void) | null = null;

weiterEinrichten();
if (buehne && root.hasAttribute('data-auftakt') && performance.now() < ZU_SPAET_MS) {
  starten(buehne).catch(() => beenden());
} else {
  beenden();
}

async function starten(buehne: HTMLElement) {
  // Erst messen, wenn die Mono-Schrift da ist – sonst landen die Buchstaben an falschen Stellen (höchstens 800 ms warten).
  await Promise.race([
    Promise.all([
      document.fonts.load('700 1em "JetBrains Mono Variable"'),
      document.fonts.load('400 1em "JetBrains Mono Variable"'),
    ]),
    pause(800),
  ]).catch(() => undefined);
  if (performance.now() > ZU_SPAET_MS || beendet) return beenden();

  const h1 = buehne.querySelector<HTMLElement>('h1');
  const lead = buehne.querySelector<HTMLElement>('.lead');
  const eyebrow = buehne.querySelector<HTMLElement>('.eyebrow');
  const tage = [...buehne.querySelectorAll<HTMLElement>('.day')];
  if (!h1 || !lead || !eyebrow) return beenden();
  const h1Html = h1.innerHTML;
  const leadHtml = lead.innerHTML;

  // Überschrift in Buchstaben (Wörter bleiben beisammen, damit nichts mitten im Wort umbricht), Einleitung in Wörter.
  // aria: 'auto' – Screenreader lesen weiter den ganzen Text.
  const titelSplit = new SplitText(h1, { type: 'words,chars', tag: 'span', charsClass: 'auftakt-tz', aria: 'auto' });
  const leadSplit = new SplitText(lead, { type: 'words', tag: 'span', aria: 'auto' });
  const titelText = (h1.textContent ?? '').replace(/\s+/g, ' ').trim();
  const titelIndizes = [...titelText].map((c, j) => (c.trim() ? j : -1)).filter((j) => j >= 0);
  const titelZeichen = titelSplit.chars as HTMLElement[];
  const titelCursor = h1.querySelector<HTMLElement>('.cursor');
  // Passt die Zerlegung nicht zum Text (andere Überschrift, andere Schrift), lieber gleich der Endzustand als ein Fehlflug.
  if (titelZeichen.length !== titelIndizes.length || !titelCursor) {
    titelSplit.revert(); leadSplit.revert();
    return beenden();
  }
  const zeichenFuer = new Map<number, HTMLElement>(titelIndizes.map((j, k) => [j, titelZeichen[k]]));

  // Der Auftrag: eine Zeile in der Bildmitte, so groß wie möglich, ohne umzubrechen.
  const wunschPx = Math.min(44, Math.max(18, Math.min(innerWidth * 0.026, innerHeight * 0.045)));
  const wahl = promptWahl(Math.min(innerWidth * 0.92, 1500) - 8, wunschPx);
  const overlay = Object.assign(document.createElement('div'), { className: 'auftakt-overlay' });
  overlay.setAttribute('aria-hidden', 'true');
  const zeile = Object.assign(document.createElement('div'), { className: 'auftakt-zeile' });
  zeile.style.fontSize = `${wahl.px}px`;
  zeile.style.width = `${(wahl.text.length + 3.5) * 0.6}em`;
  const chevron = Object.assign(document.createElement('span'), { className: 'auftakt-chev', textContent: '›' });
  const promptZeichen = [...wahl.text].map((c) => Object.assign(document.createElement('span'), { className: 'auftakt-z', textContent: c }));
  const promptCursor = Object.assign(document.createElement('span'), { className: 'auftakt-cursor' });
  zeile.append(chevron, ...promptZeichen, promptCursor);
  overlay.append(zeile);
  document.body.append(overlay);

  // Druckkopf unter der Einleitung, Linien über den Tagen.
  const druckkopf = Object.assign(document.createElement('span'), { className: 'auftakt-druckkopf' });
  druckkopf.setAttribute('aria-hidden', 'true');
  lead.append(druckkopf);
  const linien = tage.map((tag) => {
    const l = Object.assign(document.createElement('span'), { className: 'auftakt-linie' });
    l.setAttribute('aria-hidden', 'true');
    tag.prepend(l);
    return l;
  });

  // Anfangszustand setzen, BEVOR die Zeitleiste übernimmt (sonst blitzt der Endzustand kurz auf).
  const tagKinder = tage.flatMap((t) => [...t.children].filter((k) => !k.classList.contains('auftakt-linie')) as HTMLElement[]);
  gsap.set([eyebrow, ...titelZeichen, titelCursor, ...leadSplit.words, ...tagKinder], { opacity: 0 });
  gsap.set([...linien, druckkopf], { scaleX: 0 });
  gsap.set(promptZeichen, { display: 'none', transformOrigin: '0 0' });
  gsap.set(chevron, { opacity: 0 });
  root.setAttribute('data-auftakt-laeuft', '');

  // Der große Cursor steht zuerst allein in der Bildmitte (12 % der Höhe), dann rutscht er an den Zeilenanfang.
  const cursorRect = promptCursor.getBoundingClientRect();
  const gross = Math.max(1.5, (innerHeight * 0.12) / Math.max(1, cursorRect.height));
  const zurMitte = innerWidth / 2 - (cursorRect.left + cursorRect.width / 2);
  gsap.set(promptCursor, { x: zurMitte, scale: gross, transformOrigin: '50% 50%' });

  const R = REGIE;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.addLabel('chevron', R.chevron).addLabel('tippen', R.tippen).addLabel('enter', R.enter)
    .addLabel('flug', R.flug).addLabel('landung', R.landung).addLabel('druck', R.druck)
    .addLabel('tage', R.tage).addLabel('ende', R.ende);

  // 0,6 s: „›“ erscheint, der Cursor schrumpft auf Texthöhe und rutscht an den Zeilenanfang.
  tl.fromTo(chevron, { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, duration: 0.25 }, 'chevron');
  tl.to(promptCursor, { x: 0, scale: 1, duration: 0.3, ease: 'power3.inOut' }, 'chevron');

  // 0,9–2,4 s: Tippen – unregelmäßig wie ein Mensch, mit Pause nach dem Komma.
  tippZeiten(wahl.text).forEach((t, i) => tl.set(promptZeichen[i], { display: 'inline-block' }, t));

  // 2,9 s: „Enter“ – einmal Licht, die Zeile wird abgeschickt.
  if (blitz) tl.to(blitz, { opacity: 1, duration: 0.14, ease: 'power2.out' }, 'enter').to(blitz, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 'enter+=0.14');
  tl.to(zeile, { y: () => -0.3 * wahl.px, duration: 0.15, ease: 'power2.out' }, 'enter');

  // 3,0–3,95 s: Der große Moment – die Buchstaben fliegen an ihre Stellen in der Überschrift.
  const zuordnung = flugZuordnung(wahl.text, titelText);
  const ziele = new Set<number>();
  const versatz = (i: number) => (((i * 37) % 11) / 11) * R.flugStreuung; // deterministische Streuung
  promptZeichen.forEach((el, i) => {
    const j = zuordnung[i];
    const ziel = j === null ? undefined : zeichenFuer.get(j);
    if (j === null || !ziel) {
      // Was nicht gebraucht wird, verweht nach oben.
      tl.to(el, { y: -0.6 * wahl.px, opacity: 0, duration: 0.45, ease: 'power2.out' }, `flug+=${versatz(i) * 0.6}`);
      return;
    }
    ziele.add(j);
    const dx = () => ziel.getBoundingClientRect().left - el.getBoundingClientRect().left;
    const dy = () => ziel.getBoundingClientRect().top - el.getBoundingClientRect().top;
    const massstab = () => parseFloat(getComputedStyle(h1).fontSize) / wahl.px;
    const ab = R.flug + versatz(i);
    tl.to(el, { x: dx, y: dy, scale: massstab, color: '#ececf1', fontWeight: 700, duration: R.flugDauer, ease: 'expo.inOut' }, ab);
    tl.to(ziel, { opacity: 1, duration: 0.1, ease: 'none' }, ab + R.flugDauer - 0.06);
    tl.set(el, { opacity: 0 }, ab + R.flugDauer + 0.04);
  });
  tl.to(chevron, { opacity: 0, duration: 0.3 }, 'flug');
  // Stellen ohne passenden Buchstaben: kurz rauschen, dann stimmt der Buchstabe (nur Kleinbuchstaben, kein „Matrix“).
  titelIndizes.filter((j) => !ziele.has(j)).forEach((j, k) => {
    const el = zeichenFuer.get(j)!;
    const t = R.flug + 0.4 + k * 0.05;
    tl.set(el, { opacity: 1 }, t);
    tl.to(el, { duration: 0.4, ease: 'none', scrambleText: { text: el.textContent ?? '', chars: 'abcdefghijklmnopqrstuvwxyz', speed: 0.5 } }, t);
  });

  // 3,4–3,9 s: Der Cursor fliegt hinter „AI“ und wird zum Cursor der Seite. Die Dachzeile rastet ein.
  tl.set(promptCursor, { transformOrigin: '0 0' }, 'landung-=0.52');
  tl.to(promptCursor, {
    x: () => titelCursor.getBoundingClientRect().left - promptCursor.getBoundingClientRect().left,
    y: () => titelCursor.getBoundingClientRect().top - promptCursor.getBoundingClientRect().top,
    scaleX: () => titelCursor.getBoundingClientRect().width / Math.max(1, promptCursor.getBoundingClientRect().width),
    scaleY: () => titelCursor.getBoundingClientRect().height / Math.max(1, promptCursor.getBoundingClientRect().height),
    duration: 0.5, ease: 'expo.inOut',
  }, 'landung-=0.5');
  tl.set(titelCursor, { opacity: 1 }, 'landung');
  tl.set(overlay, { display: 'none' }, 'landung+=0.02');
  tl.fromTo(eyebrow, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22 }, 'landung');

  // 4,0–5,0 s: Der Druckkopf läuft, die Einleitung erscheint Wort für Wort, wo er vorbeikommt.
  const woerter = leadSplit.words as HTMLElement[];
  const schritt = woerter.length > 1 ? (R.druckEnde - R.druck - 0.18) / (woerter.length - 1) : 0;
  tl.to(druckkopf, { scaleX: 1, duration: R.druckEnde - R.druck, ease: 'none' }, 'druck');
  woerter.forEach((w, k) => tl.fromTo(w, { opacity: 0, y: '0.15em' }, { opacity: 1, y: 0, duration: 0.18 }, R.druck + k * schritt));
  tl.to(druckkopf, { opacity: 0, duration: 0.3 }, R.druckEnde);

  // 5,0–6,2 s: Die drei Tage werden gedruckt: Linie von links nach rechts, dann der Text.
  tage.forEach((tag, k) => {
    const t = R.tage + k * R.tageAbstand;
    tl.to(linien[k], { scaleX: 1, duration: R.linie, ease: 'power3.out' }, t);
    const kinder = [...tag.children].filter((c) => c !== linien[k]);
    tl.fromTo(kinder, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: R.tagTextDauer, stagger: 0.04 }, t + R.tagTextVersatz);
  });

  tl.call(beenden, [], 'ende');

  // Überspringen: jede Taste (außer Tab/Umschalt), jeder Klick, jedes Scrollen, Größenänderung.
  const optionen: AddEventListenerOptions = { capture: true, passive: false };
  const beiTaste = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const aktion = tastenAktion(e.key, tl.time());
    if (aktion === 'ignorieren') return;
    e.preventDefault(); // die Geste löst nichts anderes aus (auch kein Klick auf den später fokussierten Link)
    e.stopImmediatePropagation();
    if (aktion === 'abschicken') tl.seek('enter', false);
    else beenden();
  };
  const beiZeiger = () => beenden();
  // Größenänderung nur, wenn sie die gemessenen Flugziele verschiebt: Handys feuern „resize“ auch, wenn die
  // Adressleiste ein- oder ausfährt – das soll die Eröffnung nicht abbrechen.
  const startBreite = innerWidth;
  const startHoehe = innerHeight;
  const beiGroesse = () => {
    if (Math.abs(innerWidth - startBreite) > 2 || Math.abs(innerHeight - startHoehe) > 140) beenden();
  };
  window.addEventListener('keydown', beiTaste, optionen);
  window.addEventListener('pointerdown', beiZeiger, optionen);
  window.addEventListener('wheel', beiZeiger, { capture: true, passive: true });
  window.addEventListener('touchmove', beiZeiger, { capture: true, passive: true });
  window.addEventListener('resize', beiGroesse);
  window.addEventListener('orientationchange', beiZeiger);
  // Wächter: Hängt die Zeitleiste (Tab im Hintergrund, Fehler), steht der Endzustand trotzdem.
  const waechter = window.setTimeout(beenden, (R.ende + 1.5) * 1000);

  aufraeumen = () => {
    window.clearTimeout(waechter);
    window.removeEventListener('keydown', beiTaste, optionen);
    window.removeEventListener('pointerdown', beiZeiger, optionen);
    window.removeEventListener('wheel', beiZeiger, { capture: true });
    window.removeEventListener('touchmove', beiZeiger, { capture: true });
    window.removeEventListener('resize', beiGroesse);
    window.removeEventListener('orientationchange', beiZeiger);
    tl.kill();
    titelSplit.revert();
    leadSplit.revert();
    // Original-Markup zurück (frische Elemente ohne Inline-Stile): Screenreader, Kopieren, Cursor wie auf jeder Seite.
    h1.innerHTML = h1Html;
    lead.innerHTML = leadHtml;
    overlay.remove();
    linien.forEach((l) => l.remove());
    gsap.set([eyebrow, ...tagKinder], { clearProps: 'all' });
    if (blitz) gsap.set(blitz, { clearProps: 'opacity' });
  };

  tl.play(0);
}

/** Endzustand: statisches HTML, „› weiter“ sichtbar und fokussiert – navigiert wird nie von selbst. */
function beenden() {
  if (beendet) return;
  beendet = true;
  aufraeumen?.();
  aufraeumen = null;
  root.removeAttribute('data-auftakt');
  root.removeAttribute('data-auftakt-laeuft');
  root.setAttribute('data-auftakt-fertig', '');
  // Erst nach dem laufenden Ereignis fokussieren und erst nach der Sperre freigeben: Die Geste, die übersprungen hat,
  // darf nicht zugleich „Weiter“ auslösen.
  setTimeout(() => weiter?.focus({ preventScroll: true }), 0);
  setTimeout(() => { weiterFrei = true; }, WEITER_SPERRE_MS);
}

/** „Weiter“: Enter, Leertaste, Pfeil rechts oder Klick/Tippen auf „› weiter“. Dann ein kurzer Ausgang, dann Tag 1. */
function weiterEinrichten() {
  if (!weiter) return;
  const los = () => {
    if (!weiterFrei || imAusgang) return;
    imAusgang = true;
    const ziel = weiterZiel(location.search);
    const gehen = () => location.assign(ziel);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return gehen();
    window.setTimeout(gehen, AUSGANG_MS); // Obergrenze, auch wenn eine Animation hängt
    try {
      if (blitz) gsap.fromTo(blitz, { opacity: 0 }, { opacity: 1, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' });
      if (start) gsap.to([...start.children].filter((k) => !k.classList.contains('start-aktion')), { opacity: 0, y: '-2vh', duration: 0.22, ease: 'power2.in' });
      gsap.to(weiter.querySelectorAll(':scope > :not(.cursor)'), { opacity: 0, duration: 0.18, delay: 0.1 });
    } catch {
      gehen();
    }
  };
  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !istWeiterTaste(e.key)) return;
    if (!weiterFrei) return;
    e.preventDefault();
    los();
  });
  weiter.addEventListener('click', (e) => {
    e.preventDefault();
    // Auch Klicks warten die Sperre ab: Ein Tippen, das die Animation überspringt, macht den Link sichtbar –
    // der Klick desselben Fingers darf ihn nicht gleich auslösen.
    los();
  });
  // Zurück-Taste (bfcache): Die Seite kommt im ausgeblendeten Zustand zurück – wieder herstellen.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    imAusgang = false;
    if (start) gsap.set([...start.children], { clearProps: 'opacity,transform' });
    gsap.set(weiter.querySelectorAll('*'), { clearProps: 'opacity' });
  });
}
