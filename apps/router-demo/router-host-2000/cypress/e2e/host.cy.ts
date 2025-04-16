describe('router-host-2000/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      cy.verifyContent('Router host Home page');
    });
  });
});
