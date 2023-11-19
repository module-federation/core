import { getGreeting } from '../support/app.po';

describe('3000-home/', () => {
  beforeEach(() => cy.visit('/checkout'));

  it('should display welcome message', () => {
    // Existing test code...
    getGreeting().contains('checkout page');
  });
  it('should check that a .description + pre tag exists', () => {
    cy.get('.description + pre').should('exist');
  });
});
