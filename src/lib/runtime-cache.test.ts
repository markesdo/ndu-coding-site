import { afterEach, describe, expect, it, vi } from 'vitest';
import { ohneRuntimeCache } from './runtime-cache';

const KONTEXT = Symbol.for('@vercel/request-context');
const global_ = globalThis as Record<symbol, unknown>;

describe('ohneRuntimeCache', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    delete global_[KONTEXT];
  });
  it('lokal (kein VERCEL): nein, dort greift der Speicher pro Prozess', () => {
    vi.stubEnv('VERCEL', '');
    expect(ohneRuntimeCache()).toBe(false);
  });
  it('auf Vercel ohne Anfrage-Kontext und ohne Endpunkt: ja', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', '');
    expect(ohneRuntimeCache()).toBe(true);
  });
  it('auf Vercel mit Cache im Anfrage-Kontext: nein', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', '');
    global_[KONTEXT] = { get: () => ({ cache: {} }) };
    expect(ohneRuntimeCache()).toBe(false);
  });
  it('auf Vercel mit RUNTIME_CACHE_ENDPOINT (Build-Cache): nein', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('RUNTIME_CACHE_ENDPOINT', 'https://cache.invalid');
    expect(ohneRuntimeCache()).toBe(false);
  });
});
