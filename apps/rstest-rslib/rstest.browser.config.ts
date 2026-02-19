import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig({
    cwd: __dirname,
    libId: 'web',
    modifyLibConfig: (config) => ({
      ...config,
      plugins: [],
    }),
  }),
  name: 'rslib-browser',
  globalSetup: ['./scripts/rstestGlobalSetup.ts'],
  setupFiles: ['./scripts/rstest.browser.setup.ts'],
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
    port: 3135,
  },
  include: ['test/browser/**/*.test.tsx'],
});
