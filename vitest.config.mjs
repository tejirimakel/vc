import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url)).replace(/\/$/, '');

export default defineConfig({
  // Source files are .js with JSX in them; tell esbuild to parse them as JSX.
  esbuild: {
    jsx: 'automatic',
    loader: 'jsx',
    include: /\.(js|jsx)$/,
    exclude: /node_modules/,
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
