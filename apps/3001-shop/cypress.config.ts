import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

const PORTS_TO_CLEAN = [3000, 3001, 3002] as const;

async function killPorts(ports: readonly number[]) {
  try {
    const mod = await import('kill-port');
    const killPort: (port: number) => Promise<unknown> =
      (mod as any).default ?? (mod as any);
    for (const p of ports) {
      try {
        await killPort(p);
      } catch {
        // ignore if port is not in use
      }
    }
  } catch {
    // best-effort cleanup; do not fail the run if kill-port is unavailable
  }
}

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    // Please ensure you use `cy.origin()` when navigating between domains and remove this option.
    // See https://docs.cypress.io/app/references/migration-guide#Changes-to-cyorigin
    injectDocumentDomain: true,
    setupNodeEvents(on, config) {
      on('after:run', async () => {
        await killPorts(PORTS_TO_CLEAN);
      });
      return config;
    },
  },
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 3,
    openMode: 2,
  },
});
