import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    watch: false,
    environment: 'node',
    globals: true,
    threads: false,
    include: [path.resolve(__dirname, 'test/ConfigTestCases.*.vitest.ts')],
    testTimeout: 60000,
  },
});
