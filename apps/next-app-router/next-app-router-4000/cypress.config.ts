import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import { execSync } from 'child_process';

export default defineConfig({
  projectId: 'next-app-router-4000',
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true,
    setupNodeEvents(on, config) {
      // Kill servers when ALL tests are done (not after each test file)
      on('after:run', (results) => {
        console.log('🧹 All tests completed, cleaning up servers...');
        console.log(
          `📊 Test results: ${results.totalPassed} passed, ${results.totalFailed} failed`,
        );

        try {
          console.log('🔪 Killing servers on ports 4000 and 4001...');
          execSync('npx kill-port 4000 4001', { stdio: 'inherit' });
          console.log('✅ Server cleanup completed successfully');
        } catch (error) {
          console.log(
            '⚠️ Error during server cleanup (servers may already be closed):',
            error.message,
          );
        }
      });

      // Log when each spec starts (but don't kill servers)
      on('before:spec', (spec) => {
        console.log(`🚀 Starting spec: ${spec.name}`);
      });

      // Log when each spec ends (but don't kill servers)
      on('after:spec', (spec, results) => {
        console.log(
          `✨ Completed spec: ${spec.name} - ${results.stats.passes} passed, ${results.stats.failures} failed`,
        );
      });
    },
  },
  defaultCommandTimeout: 20000,
  retries: {
    runMode: 2,
    openMode: 1,
  },
});
