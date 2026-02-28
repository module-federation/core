import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  name: 'browser',
  globalSetup: ['./scripts/rstestGlobalSetup.ts'],
  setupFiles: ['./scripts/rstest.browser.setup.ts'],
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
    port: 3115,
  },
  include: ['test/browser/**/*.test.tsx'],
  plugins: [pluginReact()],
  testTimeout: 30_000,
});
