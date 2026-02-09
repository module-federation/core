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

// React hydration mismatch errors are recoverable (React re-renders the tree),
// but Cypress treats them as uncaught exceptions and fails the spec.
// Ignore these specific errors to stabilize CI runs.
Cypress.on('uncaught:exception', (err) => {
  const message = err?.message || '';
  if (
    message.includes('Minified React error #418') ||
    message.includes('Hydration failed because the server rendered')
  ) {
    return false;
  }
});
