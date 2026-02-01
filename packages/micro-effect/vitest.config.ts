import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [],
  test: {
    environment: 'node',
    include: [path.resolve(__dirname, '__tests__/*.spec.ts')],
    globals: true,
    testTimeout: 10000,
  },
});
