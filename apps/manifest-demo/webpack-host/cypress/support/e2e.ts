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
// With webpack-cli serve (even with --no-hot), some HMR runtime modules
// may still be injected and attempt to communicate with unavailable endpoints.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Problem communicating active modules')) {
    return false;
  }
  return undefined;
});
