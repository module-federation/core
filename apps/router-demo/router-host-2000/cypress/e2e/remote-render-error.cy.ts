describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote Error render and will trigger ErrorBoundary', () => {
    Cypress.on('uncaught:exception', () => false);

    it('jump to remote error page', () => {
      cy.clickMenuItem('render-error');
      cy.verifyContent('Something went wrong');
      cy.verifyContent('This is a deliberately thrown error');
    });
  });
});
