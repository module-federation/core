import { getH2, getH3, wait2s } from '../support/app.po';

describe('router-remote3-2003/', () => {
  beforeEach(() => cy.visit('http://localhost:2003/'));

  describe('visit', () => {
    it('jump to home page', () => {
      getH2().contains('Remote3 home page');
      cy.get('.self-remote3-detail-link').click();
      getH2().contains('Remote3 detail page');
    });
  });
});

describe('router-remote3-2003 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote3 render and destroy', () => {
    it('jump to remote3 home page', () => {
      cy.get('.host-menu > li:nth-child(5)').click();
      cy.get('.menu-remote3-home-link').click();

      getH2().contains('Remote3 home page');
      cy.get('.menu-remote3-detail-link').click();
      getH2().contains('Remote3 detail page');
    });
  });
});
