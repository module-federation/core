import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '27e40c91-5ac3-4433-8a87-651d10f51cf6',
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    baseUrl: 'http://localhost:4000',
  },
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
