describe('modernjs/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      cy.get('.title').contains('Welcome');
    });
  });
});
