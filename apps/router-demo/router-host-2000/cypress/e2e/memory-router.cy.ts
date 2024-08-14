import { getH2, getP, getPre } from '../support/app.po';

describe('router-host-2000/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH2().contains('Router host Home page');
    });
  });
});

describe('router-host-2000/memory-router', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('.host-menu > li:nth-child(6)').click();
  });

  describe('memory-router', () => {
    Cypress.on('uncaught:exception', () => false);
    it('remote1', () => {
      getH2().contains('Remote1 home page');
      cy.get('.self-remote1-detail-link').click();
      getH2().contains('Remote1 detail page');
    });
    it('remote2', () => {
      getH2().contains('Remote2 detail page');
      cy.get('.self-remote2-home-link').click();
      getH2().contains('Remote2 home page');
    });
    it('remote3', () => {
      getH2().contains('Remote3 home page');
      cy.get('.self-remote3-detail-link').click();
      getH2().contains('Remote3 detail page');
    });
  });
});
