import { wait5s, getP, getPre } from '../support/app.po';

describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote Resource Error render and will trigger ErrorBoundary', () => {
    // Ignore uncaught exceptions since this test is specifically testing error scenarios
    Cypress.on('uncaught:exception', () => false);

    it('jump to remote error page', () => {
      // Use custom command to click menu item - with the correct menu text "resource-error"
      cy.clickMenuItem('resource-error');

      // Check loading state
      cy.checkLoading('[data-test-id="loading"]', 'loading...', 5000);

      // Verify error content is displayed correctly
      cy.verifyContent('Something went wrong');
      cy.verifyContent(
        'The request failed three times and has now been abandoned',
      );
    });
  });
});
