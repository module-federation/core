import { defineConfig } from 'vitest/config';

export default defineConfig({
  cacheDir: '../../node_modules/.vitest/metro-core',
  test: {
    environment: 'node',
    include: ['__tests__/**/*.spec.ts', '__tests__/**/*.test.ts'],
    globals: true,
  },
});
