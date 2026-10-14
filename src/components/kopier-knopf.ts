// Kopier-Knopf neben Inline-Werten: <code data-kopieren> (oder <a data-kopieren>) bekommt beim Laden einen
// kleinen Knopf mit Kopier-Symbol. Ohne JavaScript bleibt der Wert les- und markierbar.
// Ein Klick-Listener am Dokument: Die Schritte-Dialoge kopieren Texte per innerHTML – Knöpfe darin gehen so trotzdem.
import { kopiereText, kopierMeldung, wertAus } from '../lib/kopieren';

const COPY = '<svg class="ico-copy" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
const CHECK = '<svg class="ico-done" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

// Ansage für Screenreader: im offenen Dialog (sonst wäre sie dort stumm), erst leeren, dann setzen –
// so wird auch das zweite „Kopiert“ hintereinander vorgelesen.
function ansagen(knopf: Element, text: string) {
  const ort = knopf.closest('dialog') ?? document.body;
  let s = ort.querySelector<HTMLElement>(':scope > .kopier-status');
  if (!s) {
    s = document.createElement('div');
    s.className = 'kopier-status sr-only';
    s.setAttribute('aria-live', 'polite');
    ort.append(s);
  }
  s.textContent = '';
  setTimeout(() => { s.textContent = text; }, 50);
}

document.querySelectorAll<HTMLElement>('[data-kopieren]').forEach((el) => {
  const wert = wertAus(el);
  const huelle = document.createElement('span');
  huelle.className = 'kopierbar';
  el.replaceWith(huelle);
  const knopf = document.createElement('button');
  knopf.type = 'button';
  knopf.className = 'kopieren-btn';
  knopf.title = 'Kopieren';
  // Lange Befehle nicht als Knopf-Namen vorlesen – der Wert steht ja direkt davor.
  knopf.setAttribute('aria-label', `${el.dataset.label ?? (wert.length <= 30 ? wert : 'Befehl')} kopieren`);
  knopf.innerHTML = COPY + CHECK;
  huelle.append(el, knopf);
});

const timer = new WeakMap<Element, number>();
document.addEventListener('click', async (e) => {
  const knopf = (e.target as Element | null)?.closest?.('.kopieren-btn');
  const el = knopf?.parentElement?.querySelector<HTMLElement>('[data-kopieren]');
  if (!knopf || !el) return;
  const ergebnis = await kopiereText(wertAus(el), el);
  const text = kopierMeldung(ergebnis, navigator.platform);
  knopf.setAttribute('title', text);
  knopf.classList.toggle('done', ergebnis === 'kopiert');
  ansagen(knopf, text);
  clearTimeout(timer.get(knopf));
  timer.set(knopf, window.setTimeout(() => { knopf.classList.remove('done'); knopf.setAttribute('title', 'Kopieren'); }, 1500));
});
