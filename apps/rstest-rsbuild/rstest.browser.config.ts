import { withRsbuildConfig } from '@rstest/adapter-rsbuild';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRsbuildConfig({ cwd: __dirname }),
  name: 'rsbuild-browser',
  globalSetup: ['./scripts/rstestGlobalSetup.ts'],
  setupFiles: ['./scripts/rstest.browser.setup.ts'],
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
    port: 3125,
  },
  include: ['test/browser/**/*.test.tsx'],
});
