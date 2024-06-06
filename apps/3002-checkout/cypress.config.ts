import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: nxE2EPreset(__filename, { cypressDir: 'cypress' }),
  defaultCommandTimeout: 15000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
