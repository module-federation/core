import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '27e40c91-5ac3-4433-8a87-651d10f51cf6',
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    baseUrl: 'http://localhost:4000',
  },
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
