describe('router-host-2000/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      cy.verifyContent('Router host Home page');
    });
  });
});

describe('router-host-2000/memory-router', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clickMenuItem('Memory-router');
  });

  describe('memory-router', () => {
    Cypress.on('uncaught:exception', () => false);

    it('remote1', () => {
      cy.verifyContent('Remote1 home page');
      cy.clickByClass('.self-remote1-detail-link');
      cy.verifyContent('Remote1 detail page');
    });

    it('remote2', () => {
      cy.verifyContent('Remote2 detail page');
      cy.clickByClass('.self-remote2-home-link');
      cy.verifyContent('Remote2 home page');
    });

    it('remote3', () => {
      cy.verifyContent('Remote3 home page');
      cy.clickByClass('.self-remote3-detail-link');
      cy.verifyContent('Remote3 detail page');
    });
  });
});
