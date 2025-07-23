import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import * as fs from 'fs';
import * as path from 'path';

export default defineConfig({
  projectId: 'sa6wfn',
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    baseUrl: 'http://localhost:3000',
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true,
    setupNodeEvents(on, config) {
      // Custom task for checking file existence
      on('task', {
        fileExists(filePath: string) {
          const absolutePath = path.resolve(__dirname, filePath);
          return fs.existsSync(absolutePath);
        },
        log(message: string) {
          console.log(message);
          return null;
        },
        // Task for hydration error detection
        checkHydrationErrors() {
          return null;
        },
      });
    },
  },
  defaultCommandTimeout: 25000,
  pageLoadTimeout: 30000,
  requestTimeout: 15000,
  responseTimeout: 15000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
  // Extended timeouts for HMR operations
  env: {
    hmr_timeout: 5000,
    file_change_timeout: 3000,
  },
});
