import { defineConfig } from '@rstest/core';
export default defineConfig({
  testEnvironment: 'node',
  include: ['__tests__/*.spec.ts'],
  source: { define: { __VERSION__: '"0.0.0"' } },
  testTimeout: 15000,
});
