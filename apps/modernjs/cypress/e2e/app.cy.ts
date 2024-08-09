describe('modernjs/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      cy.get('.container-box').contains('Resend request with parameters');
    });
  });
});
