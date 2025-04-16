describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote Resource Error render and will trigger ErrorBoundary', () => {
    Cypress.on('uncaught:exception', () => false);

    it('jump to remote error page', () => {
      cy.clickMenuItem('resource-error');
      cy.checkLoading('[data-test-id="loading"]', 'loading...', 5000);
      cy.verifyContent('Something went wrong');
      // cy.verifyContent(
      //   'The request failed three times and has now been abandoned',
      // );
    });
  });
});
