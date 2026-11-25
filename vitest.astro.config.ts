/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Komponenten-Tests (*.astro.test.ts): rendern .astro-Dateien über die Container-API von Astro.
export default getViteConfig({ test: { name: 'astro', include: ['**/*.astro.test.ts'], exclude: ['**/node_modules/**', '**/dist/**'] } });
