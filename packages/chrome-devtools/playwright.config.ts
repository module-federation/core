import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 90000,
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 4 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    trace: 'on-first-retry',
  },
  expect: {
    timeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // webServer: [
  //   {
  //     command: 'npx nx serve 3008-webpack-host',
  //     url: 'http://localhost:3008/index.html',
  //   },
  //   // {
  //   //   command: 'npx nx serve 3009-webpack-provider',
  //   //   url: 'http://localhost:3009/index.html',
  //   // },
  //   {
  //     command: 'npx nx serve 3010-rspack-provider',
  //     url: 'http://localhost:3010/index.html',
  //   },
  //   {
  //     command: 'npx nx serve 3011-rspack-manifest-provider',
  //     url: 'http://localhost:3011/index.html',
  //   },
  //   {
  //     command: 'npx nx serve 3012-rspack-js-entry-provider',
  //     url: 'http://localhost:3012/index.html',
  //   },
  // ],
});
