import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: process.env.BRIDGE_SSR_BASE_URL ?? 'http://localhost:2300',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'react-host-nojs',
      testMatch: /bridge-ssr-nojs\.spec\.ts/,
      use: { javaScriptEnabled: false },
    },
    {
      name: 'react-host-browser',
      testMatch: /bridge-ssr-browser\.spec\.ts/,
    },
  ],
});
