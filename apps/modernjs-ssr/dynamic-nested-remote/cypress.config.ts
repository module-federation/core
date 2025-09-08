import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    baseUrl: 'http://localhost:8080',
    injectDocumentDomain: true,
  },
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
