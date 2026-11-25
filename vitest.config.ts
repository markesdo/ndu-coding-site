import { defineConfig } from 'vitest/config';

// Zwei Projekte: Die gewöhnlichen Tests laufen ohne Astro (schnell). Nur *.astro.test.ts rendert Komponenten über die
// Container-API und braucht dafür Astros Vite-Konfiguration (vitest.astro.config.ts).
export default defineConfig({
  test: {
    projects: [
      { test: { name: 'unit', include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'], exclude: ['**/*.astro.test.ts', '**/node_modules/**', '**/dist/**'] } },
      './vitest.astro.config.ts',
    ],
  },
});
