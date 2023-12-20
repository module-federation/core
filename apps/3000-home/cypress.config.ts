import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'sa6wfn',
  e2e: nxE2EPreset(__filename, { cypressDir: 'cypress' }),
  defaultCommandTimeout: 20000,
});
