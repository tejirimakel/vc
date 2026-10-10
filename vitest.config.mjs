import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url)).replace(/\/$/, '');

export default defineConfig({
  // Source files are .js with JSX in them; tell Vite's Oxc transform to parse
  // them as JSX with the automatic runtime.
  oxc: {
    include: /\.(js|jsx)$/,
    exclude: /node_modules/,
    lang: 'jsx',
    jsx: { runtime: 'automatic' },
  },
  resolve: {
    alias: { '@': root },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    css: false,
  },
});
