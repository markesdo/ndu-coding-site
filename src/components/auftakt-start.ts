// „Der Cursor läuft“ – die Eröffnung auf /start (start.astro). GSAP mit SplitText, nur auf dieser Seite.
// Ablauf (Zeiten in REGIE, auftakt-zeitplan.ts): Ein großer Block-Cursor wartet → ein Auftrag wird getippt → „Enter“ →
// die Buchstaben des Auftrags fliegen in die Überschrift „Programmieren mit AI“ → der Cursor landet dahinter →
// klein angekommene Buchstaben („p“, „i“) werden gemeinsam groß →
// ein Druckkopf läuft, die Einleitung erscheint Wort für Wort → die drei Tage werden gedruckt → „› weiter▮“ wartet.
// Nie automatisch weiter. Jede Taste, jeder Klick, jedes Scrollen springt ans Ende (Enter vor dem „Enter“ schickt ab);
// diese Geste löst nicht zugleich „Weiter“ aus (Sperre WEITER_SPERRE_MS). Endet immer im statischen HTML der Seite.
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import {
  AUSGANG_MS, REGIE, WEITER_SPERRE_MS,
  flugZuordnung, istWeiterTaste, promptWahl, schreibungWechselt, tastenAktion, tippZeiten, weiterZiel,
} from './auftakt-zeitplan';

gsap.registerPlugin(SplitText);

const root = document.documentElement;
const buehne = document.querySelector<HTMLElement>('#auftakt-buehne');
const weiter = document.querySelector<HTMLAnchorElement>('[data-weiter]');
const blitz = document.querySelector<HTMLElement>('.start-blitz');
const start = document.querySelector<HTMLElement>('.start');

/** Zu spät geladen: Das CSS-Sicherheitsnetz hat nach 5 s schon alles gezeigt – dann nicht noch einmal von vorn. */
const ZU_SPAET_MS = 4500;
const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
/**
 * Lage der Grundlinie eines Elements (Bildschirm-y): ein unsichtbarer 0-px-Messpunkt auf der Grundlinie.
 * Genauer als die Oberkante der Box – die Box wird auf ganze Pixel gerundet, und der Flug vergrößert den Fehler.
 */
function grundlinie(el: HTMLElement): number {
  const messpunkt = document.createElement('span');
  messpunkt.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
  el.append(messpunkt);
  const y = messpunkt.getBoundingClientRect().top;
  messpunkt.remove();
  return y;
}

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

  // Der Auftrag: eine Zeile in der Bildmitte, so groß wie möglich, ohne umzubrechen (720p ≈ 35 px, 1080p ≈ 53 px).
  const wunschPx = Math.min(56, Math.max(18, Math.min(innerWidth * 0.0275, innerHeight * 0.05)));
  const wahl = promptWahl(Math.min(innerWidth * 0.92, 1800) - 8, wunschPx);
  const overlay = Object.assign(document.createElement('div'), { className: 'auftakt-overlay' });
  overlay.setAttribute('aria-hidden', 'true');
  const zeile = Object.assign(document.createElement('div'), { className: 'auftakt-zeile' });
  zeile.style.fontSize = `${wahl.px}px`;
  zeile.style.width = `${(wahl.text.length + 3.5) * 0.6}em`;
  const chevron = Object.assign(document.createElement('span'), { className: 'auftakt-chev', textContent: '›' });
  const promptZeichen = [...wahl.text].map((c) => Object.assign(document.createElement('span'), { className: 'auftakt-z', textContent: c }));
  const promptCursor = Object.assign(document.createElement('span'), { className: 'auftakt-cursor' });
  zeile.append(chevron, ...promptZeichen, promptCursor);
  // Flugschicht: ohne Transformation, deckungsgleich mit dem Bildschirm. Fliegende Buchstaben wechseln beim Abflug
  // hierher – ihre Lage hängt dann nicht mehr an der zentrierten, angehobenen Zeile mit Bruchteil-Pixeln.
  const flugschicht = Object.assign(document.createElement('div'), { className: 'auftakt-zeile auftakt-flugschicht' });
  overlay.append(zeile, flugschicht);
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

  // 2,9 s: „Enter“ – einmal Licht, die Zeile wird abgeschickt. Ab hier steht der Cursor still (wie ein Terminal,
  // das arbeitet) – er blinkt nicht mehr, auch nicht im Flug.
  if (blitz) tl.to(blitz, { opacity: 1, duration: 0.14, ease: 'power2.out' }, 'enter').to(blitz, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 'enter+=0.14');
  tl.to(zeile, { y: () => -0.3 * wahl.px, duration: 0.15, ease: 'power2.out' }, 'enter');
  tl.call(() => { promptCursor.style.animation = 'none'; }, [], 'enter');

  // 3,05–3,9 s: Der große Moment – die Buchstaben fliegen an ihre Stellen in der Überschrift.
  // Ziel ist die Grundlinie, nicht die Oberkante: dy setzt die skalierte Grundlinie des Abfliegers genau auf die des
  // Titelzeichens (transformOrigin 0 0). Dazu line-height: normal (auftakt.css), damit die Boxen nicht mit
  // Durchschuss rechnen. Die Übergabe an der Landung passiert in einem einzigen Bild.
  const zuordnung = flugZuordnung(wahl.text, titelText);
  const ziele = new Set<number>();
  const versatz = (i: number) => (((i * 37) % 11) / 11) * R.flugStreuung; // deterministische Streuung
  const titelFarbe = getComputedStyle(h1).color;
  // Ziele, deren Buchstabe in anderer Schreibung ankommt („p“ → „P“): zeigen zuerst den ankommenden Buchstaben,
  // damit die Übergabe pixelgleich ist; groß werden sie danach gemeinsam (siehe unten).
  const grossWerden = schreibungWechselt(wahl.text, zuordnung, titelText)
    .map((j) => ({ el: zeichenFuer.get(j)!, original: titelText[j] }))
    .filter((g) => g.el);
  zuordnung.forEach((j, i) => { if (j !== null && grossWerden.some((g) => g.el === zeichenFuer.get(j))) zeichenFuer.get(j)!.textContent = wahl.text[i]; });
  // FLIP beim Abflug: Alle Zeichen und der Cursor werden an ihrer Stelle festgehalten (absolut in der Zeile), damit
  // nichts nachrutscht. Die fliegenden bekommen sofort die Schriftgröße des Titels und werden auf Promptgröße
  // herunterskaliert – bei der Landung ist der Maßstab genau 1. So rastert der Browser den fliegenden Buchstaben wie
  // das Titelzeichen; klein gerastert und hochskaliert lag er wegen der Schrift-Hinting-Rundung 1 px daneben.
  const titelPx = () => parseFloat(getComputedStyle(h1).fontSize);
  const fliegt = new Set(promptZeichen.filter((_, i) => zuordnung[i] !== null && zeichenFuer.get(zuordnung[i]!)));
  const raster = () => window.devicePixelRatio || 1;
  const aufRaster = (v: number) => Math.round(v * raster()) / raster();
  tl.call(() => {
    const zr = zeile.getBoundingClientRect();
    const fest = [...promptZeichen, promptCursor]
      .filter((el) => getComputedStyle(el).display !== 'none')
      .map((el) => ({ el, r: el.getBoundingClientRect(), farbe: getComputedStyle(el).color }));
    zeile.style.position = 'relative';
    for (const { el, r, farbe } of fest) {
      if (fliegt.has(el)) {
        // In die Flugschicht, auf das Gerätepixel-Raster gelegt (Versatz < ½ Gerätepixel, im Abflug unsichtbar).
        // Titelgröße und Titelgewicht schon jetzt (nicht getweent): 699,99 statt 700 rendert eine andere Instanz
        // der variablen Schrift – an der Landung sichtbar als Sprung. Der Wechsel geht im Abflug unter.
        flugschicht.append(el);
        Object.assign(el.style, {
          position: 'absolute', left: `${aufRaster(r.left)}px`, top: `${aufRaster(r.top)}px`, margin: '0',
          color: farbe, fontSize: `${titelPx()}px`, fontWeight: '700',
        });
        gsap.set(el, { scale: wahl.px / titelPx(), transformOrigin: '0 0' });
      } else {
        Object.assign(el.style, { position: 'absolute', left: `${r.left - zr.left}px`, top: `${r.top - zr.top}px`, margin: '0' });
      }
    }
  }, [], 'flug');
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
    // Grundlinie nach dem Flug = Oberkante + Grundlinienabstand bei Maßstab 1 (jetzt: herunterskaliert, Ursprung oben links).
    const dy = () => {
      const oben = el.getBoundingClientRect().top;
      const jetzt = Number(gsap.getProperty(el, 'scale')) || 1;
      return grundlinie(ziel) - (oben + (grundlinie(el) - oben) / jetzt);
    };
    const ab = R.flug + versatz(i);
    tl.to(el, { x: dx, y: dy, scale: 1, color: titelFarbe, force3D: false, duration: R.flugDauer, ease: 'expo.inOut' }, ab);
    // Übergabe in einem Bild: gleiche Glyphe, gleiche Stelle – nichts zum Überblenden.
    tl.set(ziel, { opacity: 1 }, ab + R.flugDauer);
    tl.set(el, { opacity: 0 }, ab + R.flugDauer);
  });
  tl.to(chevron, { opacity: 0, duration: 0.3 }, 'flug');
  // Stellen ohne passenden Buchstaben tippen sich nacheinander ein (kein Rauschen mitten im Wort).
  // Die Zeichen sind inline – bewegt wird über position/top, nicht transform.
  titelIndizes.filter((j) => !ziele.has(j)).forEach((j, k) => {
    const el = zeichenFuer.get(j)!;
    gsap.set(el, { position: 'relative' });
    tl.fromTo(el, { opacity: 0, top: '0.12em' }, { opacity: 1, top: 0, duration: 0.16, ease: 'power2.out' }, R.flug + R.flugDauer + k * R.eintippenAbstand);
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
  // Kurz nach dem Cursor: Die klein angekommenen Buchstaben werden gemeinsam groß – „das System korrigiert die Schreibung“.
  grossWerden.forEach(({ el, original }) => {
    gsap.set(el, { position: 'relative' });
    tl.call(() => { el.textContent = original; }, [], `landung+=${R.grossVersatz}`);
    tl.fromTo(el, { top: '0.08em' }, { top: 0, duration: R.grossDauer, ease: 'power2.out', immediateRender: false }, `landung+=${R.grossVersatz}`);
  });
  tl.fromTo(eyebrow, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.22, immediateRender: false }, `landung+=${R.dachzeileVersatz}`);

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
  // Jede Größenänderung verschiebt die gemessenen Flugziele (Größen hängen an vw und vh) → ans Ende springen.
  // Ausnahme nur auf Touch-Geräten: Dort feuert „resize“ auch, wenn die Adressleiste ein- oder ausfährt
  // (nur die Höhe, um wenige Dutzend Pixel) – das soll die Eröffnung nicht abbrechen. Am Laptop bricht auch F11 ab.
  const startBreite = innerWidth;
  const startHoehe = innerHeight;
  const touch = matchMedia('(pointer: coarse)').matches;
  const beiGroesse = () => {
    const dB = Math.abs(innerWidth - startBreite);
    const dH = Math.abs(innerHeight - startHoehe);
    if (dB > 2 || dH > (touch ? 140 : 2)) beenden();
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

/** „Weiter“: Enter, Leertaste, Pfeil rechts oder Klick/Tippen auf „› weiter“. Dann ein kurzer Ausgang, dann die Übersicht. */
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
    // Neuer Tab/neues Fenster (Strg/Cmd/Umschalt, mittlere Taste): dem Browser überlassen.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
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
