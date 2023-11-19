import { getGreeting } from '../support/app.po';

describe('3000-home/', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // Existing test code...
    getGreeting().contains('This is SPA combined');
  });

  it('should check that the home-webpack-png and shop-webpack-png images are not 404', () => {
    // Get the src attribute of the home-webpack-png image
    cy.debug()
      .get('img.home-webpack-png')
      .invoke('attr', 'src')
      .then((src) => {
        cy.log(src);
        cy.request(src).its('status').should('eq', 200);
      });

    // Get the src attribute of the shop-webpack-png image
    cy.get('img.shop-webpack-png')
      .invoke('attr', 'src')
      .then((src) => {
        // Send a GET request to the src URL
        cy.request(src).its('status').should('eq', 200);
      });
  });
});
