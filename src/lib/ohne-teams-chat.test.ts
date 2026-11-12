import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOTIZEN } from '../data/begleiter';

// Tag 2 (online, 12.11.) läuft ohne Teams-Chat: Die Seiten sind auf den eigenen Geräten offen, die Aufgaben stehen auf
// den Folien, Antwortrunden gehen reihum laut. Weder Folien noch Begleiter schicken jemanden in einen Chat.
const quelle = (pfad: string) => readFileSync(new URL(pfad, import.meta.url), 'utf8');
const SEITEN = ['/innolab/tag-2', '/innolab/methoden/synthese', '/innolab/methoden/journey-map', '/innolab/methoden/baum', '/innolab/tag-2/abschluss'];
const DATEIEN = [
  '../pages/innolab/tag-2.astro', '../pages/innolab/tag-2/abschluss.astro', '../pages/innolab/methoden/synthese.astro',
  '../pages/innolab/methoden/journey-map.astro', '../pages/innolab/methoden/baum.astro', '../components/Antwortrunde.astro',
  '../pages/innolab/begleiter.astro',
];
const CHAT = /Teams-Chat|Kurs-Chat|(in den|im) Chat|Chat-Sätze/g;

describe('Tag 2 ohne Teams-Chat', () => {
  it.each(SEITEN)('Begleiter %s: keine Chat-Anweisung, kein Chat-Text', (seite) => {
    const s = JSON.stringify(NOTIZEN[seite]);
    expect(s.match(CHAT) ?? []).toStrictEqual([]);
    expect(Object.values(NOTIZEN[seite]).filter((n) => 'chat' in n)).toStrictEqual([]);
  });

  it.each(DATEIEN)('%s nennt keinen Chat', (datei) => {
    expect(quelle(datei).match(CHAT) ?? []).toStrictEqual([]);
  });
});
