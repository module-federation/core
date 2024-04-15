import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'satjfn',
  e2e: nxE2EPreset(__filename, { cypressDir: 'cypress' }),
  defaultCommandTimeout: 20000,
  chromeWebSecurity: false,
  experimentalModifyObstructiveThirdPartyCode: true,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
