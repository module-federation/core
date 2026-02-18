// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.ts using ES2015 syntax:
import './commands';
import '../../../../../tools/testing/cypress/browser-error-logging';

// Suppress webpack-dev-server HMR errors that are not application bugs.
// The old @nx/webpack executor started the dev-server programmatically
// with hmr:false. With vanilla webpack-cli serve, even with --no-hot,
// some HMR runtime modules may still be injected that attempt to
// communicate with endpoints not available in the vanilla serve setup.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Problem communicating active modules')) {
    return false;
  }
});
