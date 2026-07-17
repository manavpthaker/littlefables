import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@ds': path.resolve(__dirname, './design-system'),
      '@prompts': path.resolve(__dirname, './lib/prompts'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
});
