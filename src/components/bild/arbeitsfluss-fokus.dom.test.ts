// Fokus im Browser (fokusSteuern) auf dem echten HTML von Arbeitsfluss.astro: Maus, Tastatur, Tour-Schritte, ?station=…
// (NDU-74, Review zu #442). Gerendert wird in Node (Container-API), geschaltet in einem happy-dom-Fenster – die
// Umgebung happy-dom für die ganze Datei verträgt sich nicht mit dem Rendern der Lucide-Icons.
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { Window } from 'happy-dom';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Arbeitsfluss from './Arbeitsfluss.astro';
import { fokusSteuern, grundFokus } from '../arbeitsfluss-fokus';

let container: AstroContainer;
const fenster = new Window();
const vorher = (globalThis as { MutationObserver?: unknown }).MutationObserver;
beforeAll(async () => {
  container = await AstroContainer.create();
  // fokusSteuern nimmt MutationObserver aus dem globalen Bereich, wie im Browser.
  (globalThis as { MutationObserver?: unknown }).MutationObserver = fenster.MutationObserver;
});
afterAll(async () => {
  (globalThis as { MutationObserver?: unknown }).MutationObserver = vorher;
  await fenster.happyDOM.close();
});
const Event = fenster.Event;

async function figur(props: Record<string, unknown>, suche = '') {
  const document = fenster.document;
  document.body.innerHTML = await container.renderToString(Arbeitsfluss, { props });
  const fig = document.querySelector('.af') as unknown as HTMLElement;
  fokusSteuern(fig, suche);
  const station = (id: string) => fig.querySelector<HTMLElement>(`.af-station[data-id="${id}"]`)!;
  const fokus = () => fig.querySelector<HTMLElement>('.af-station.af-fokus')?.dataset.id;
  const fuss = () => [...fig.querySelectorAll<HTMLElement>('[data-fuss]')].filter((f) => !f.hidden).map((f) => f.dataset.fuss);
  const marker = [...fig.querySelectorAll<HTMLElement>('[data-tour]')];
  return { fig, station, fokus, fuss, marker };
}
/** MutationObserver meldet nach einer Mikroaufgabe. */
const gleich = () => new Promise((r) => setTimeout(r, 0));

describe('Maus und Tastatur', () => {
  it('Maus auf einer Station: Fokus mit Quellen und Zielen; Maus weg: kein Fokus', async () => {
    const { fig, station, fokus, fuss } = await figur({ id: 'p' });
    expect(fokus()).toBeUndefined();
    station('kundenprofil').dispatchEvent(new Event('mouseenter'));
    expect(fokus()).toBe('kundenprofil');
    expect(station('problem-rahmen').classList.contains('af-quelle')).toBe(true);
    expect(station('story-map').classList.contains('af-ziel')).toBe(true);
    expect(station('interview').classList.contains('af-blass')).toBe(true);
    expect(fuss()).toStrictEqual(['kundenprofil']);
    expect(fig.hasAttribute('data-fokus-an')).toBe(true);
    station('kundenprofil').dispatchEvent(new Event('mouseleave'));
    expect(fokus()).toBeUndefined();
    expect(fuss()).toStrictEqual([]);
  });

  it('Tastatur: Fokus folgt focus/blur; Maus darüber geht vor, danach wieder die Tastatur', async () => {
    const { station, fokus } = await figur({});
    station('hmw').dispatchEvent(new Event('focus'));
    expect(fokus()).toBe('hmw');
    station('scrum').dispatchEvent(new Event('mouseenter'));
    expect(fokus()).toBe('scrum');
    station('scrum').dispatchEvent(new Event('mouseleave'));
    expect(fokus()).toBe('hmw');
    station('hmw').dispatchEvent(new Event('blur'));
    expect(fokus()).toBeUndefined();
  });
});

describe('Tour: der Schritt geht vor Maus und Tastatur', () => {
  it('ein Schritt zeigt seine Station, auch bei gehaltenem Tastaturfokus und ruhender Maus; zurück zeigt die davor', async () => {
    const { station, fokus, marker } = await figur({ hier: 4, bis: 4, tour: 4, legende: false });
    expect(marker).toHaveLength(10);
    station('hmw').dispatchEvent(new Event('focus'));
    station('scrum').dispatchEvent(new Event('mouseenter'));
    expect(fokus()).toBe('scrum');
    marker[0].classList.add('gezeigt');
    await gleich();
    expect(fokus()).toBe('value-map-nachholen');
    marker[1].classList.add('gezeigt');
    await gleich();
    expect(fokus()).toBe('concept-story');
    // Danach gilt wieder die letzte Handlung: Maus auf eine Station.
    station('origin-story').dispatchEvent(new Event('mouseenter'));
    expect(fokus()).toBe('origin-story');
    station('origin-story').dispatchEvent(new Event('mouseleave'));
    expect(fokus()).toBe('concept-story');
    marker[1].classList.remove('gezeigt');
    await gleich();
    expect(fokus()).toBe('value-map-nachholen');
    marker[0].classList.remove('gezeigt');
    await gleich();
    expect(fokus()).toBeUndefined();
  });
});

describe('?station=… aus der Adresse', () => {
  it('Plan mit aufdecken={3}: Spalten bis zur Station werden aufgedeckt, Fokus steht', async () => {
    const { fig, fokus } = await figur({ aufdecken: 3, fokusAusAdresse: true }, '?tag=4&station=story-map');
    expect(fokus()).toBe('story-map');
    const gezeigt = [...fig.querySelectorAll<HTMLElement>('.af-spalte[data-schritt]')].map((s) => `${s.dataset.spalte}:${s.classList.contains('gezeigt')}`);
    expect(gezeigt).toStrictEqual(['4:true', '5:false']);
  });

  it('eine Station in einer offenen Spalte deckt nichts auf', async () => {
    const { fig, fokus } = await figur({ aufdecken: 3, fokusAusAdresse: true }, '?station=kundenprofil');
    expect(fokus()).toBe('kundenprofil');
    expect(fig.querySelectorAll('.af-spalte.gezeigt')).toHaveLength(0);
  });

  it('ohne fokusAusAdresse wird die Adresse nicht gelesen', async () => {
    const { fig, fokus } = await figur({ aufdecken: 3 }, '?station=story-map');
    expect(fokus()).toBeUndefined();
    expect(fig.querySelectorAll('.af-spalte.gezeigt')).toHaveLength(0);
  });

  it('Vorrang beim Laden wie beim Schritt: Tour vor Adresse vor Prop', async () => {
    expect(grundFokus({ tour: 'a', adresse: 'b', prop: 'c' })).toBe('a');
    expect(grundFokus({ adresse: 'b', prop: 'c' })).toBe('b');
    expect(grundFokus({ prop: 'c' })).toBe('c');
    const { fokus } = await figur({ fokus: 'hmw', fokusAusAdresse: true }, '?station=scrum');
    expect(fokus()).toBe('scrum');
  });
});
