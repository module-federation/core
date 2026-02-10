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

// Ignore known transient bootstrap/runtime errors so tests can assert on UI state.
Cypress.on('uncaught:exception', (err) => {
  const message = err?.message || '';
  if (
    message.includes('Failed to get manifest') ||
    message.includes('$Refresh') ||
    message.includes("reading 'consumes'")
  ) {
    return false;
  }
  return true;
});
