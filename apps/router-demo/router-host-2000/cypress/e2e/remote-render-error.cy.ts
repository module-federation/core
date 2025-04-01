describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote Error render and will trigger ErrorBoundary', () => {
    // Ignore uncaught exceptions since this test is specifically testing error scenarios
    Cypress.on('uncaught:exception', () => false);

    it('jump to remote error page', () => {
      // Use custom command to click menu item - with the correct menu text "render-error"
      cy.clickMenuItem('render-error');

      // Verify error content is displayed correctly
      cy.verifyContent('Something went wrong');
      cy.verifyContent('This is a deliberately thrown error');
    });
  });
});
