import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { darfKopierbarSein, kopiereText, kopierKuerzel, kopierMeldung, wertAus } from './kopieren';

const el = (text: string | null, wert: string | null = null) => ({
  textContent: text,
  getAttribute: (n: string) => (n === 'data-wert' ? wert : null),
});

describe('wertAus', () => {
  it('nimmt data-wert vor dem sichtbaren Text', () => {
    expect(wertAus(el('github.com/x', 'https://github.com/x'))).toBe('https://github.com/x');
  });
  it('schneidet Leerraum am Rand ab', () => {
    expect(wertAus(el('  npm install \n'))).toBe('npm install');
  });
});

describe('darfKopierbarSein', () => {
  it('lässt echte Werte zu', () => {
    for (const w of ['npm install', 'http://localhost:*/**', 'https://github.com/markusd-ndu/leihbar-team', "echo 'x' >> ~/.zshrc"]) {
      expect(darfKopierbarSein(w)).toBe(true);
    }
  });
  it('sperrt Vorlagen und Warnungen', () => {
    for (const w of ['https://leihbar-….vercel.app/**', 'https://github.com/euer-name/euer-repo', 'curl "ADRESSE"', '[Link]', 'npm audit fix --force', 'rm -rf node_modules', '']) {
      expect(darfKopierbarSein(w)).toBe(false);
    }
  });
});

describe('kopiereText', () => {
  it('meldet „markiert“, wenn die Zwischenablage fehlt', async () => {
    expect(await kopiereText('x')).toBe('markiert');
  });
});

describe('kopierMeldung', () => {
  it('ehrlich bei Erfolg und Fehler', () => {
    expect(kopierMeldung('kopiert', 'MacIntel')).toBe('Kopiert');
    expect(kopierMeldung('markiert', 'Win32')).toBe('Markiert – mit Strg+C kopieren');
  });
});

describe('kopierKuerzel', () => {
  it('Mac und Windows', () => {
    expect(kopierKuerzel('MacIntel')).toBe('⌘C');
    expect(kopierKuerzel('Win32')).toBe('Strg+C');
  });
});

// Jeder als kopierbar markierte Wert auf den Seiten muss wörtlich stimmen – keine Vorlage, keine Warnung.
describe('kopierbare Werte auf den Seiten', () => {
  const seiten: string[] = [];
  const sammeln = (dir: string) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) sammeln(p);
      else if (p.endsWith('.astro')) seiten.push(p);
    }
  };
  sammeln(fileURLToPath(new URL('../pages', import.meta.url)));
  const werte = seiten.flatMap((p) =>
    // Jedes Element mit data-kopieren, egal in welcher Reihenfolge die Attribute stehen.
    [...readFileSync(p, 'utf8').matchAll(/<(\w+)\b([^>]*\bdata-kopieren\b[^>]*)>([^<]*)<\/\1>/g)].map((m) => ({
      p,
      w: (m[2].match(/data-wert="([^"]*)"/)?.[1] ?? m[3]).replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\\'/g, "'"),
    })),
  );

  it('es gibt kopierbare Werte', () => {
    expect(werte.length).toBeGreaterThan(20);
  });

  it('kein kopierbarer Wert ist eine Vorlage oder Warnung', () => {
    expect(werte.filter(({ w }) => !w.includes('{') && !darfKopierbarSein(w))).toStrictEqual([]);
  });

  it('die Team-Repo-Adresse zum Klonen beginnt mit https://github.com/', () => {
    const tag3 = readFileSync(new URL('../pages/tag-3.astro', import.meta.url), 'utf8');
    expect(tag3.match(/const TEAM_REPO = '([^']+)'/)?.[1]).toMatch(/^https:\/\/github\.com\/[\w-]+\/[\w-]+$/);
  });
});
