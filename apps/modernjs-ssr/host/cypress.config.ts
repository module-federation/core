import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'sa6wfn',
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    injectDocumentDomain: true,
  },
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
