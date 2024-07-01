import { getH2, getH3, wait2s } from '../support/app.po';

describe('router-remote2-2002/', () => {
  beforeEach(() => cy.visit('http://localhost:2002/'));

  describe('visit', () => {
    it('jump to home page', () => {
      getH2().contains('Remote2 home page');
      cy.get('.self-remote2-detail-link').click();
      getH2().contains('Remote2 detail page');
    });
  });
});

describe('router-remote2-2002 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote2 render and destroy', () => {
    it('jump to remote2 home page', () => {
      cy.get('.host-menu > li:nth-child(4)').click();
      cy.get('.menu-remote2-home-link').click();

      getH2().contains('Remote2 home page');
      cy.get('.menu-remote2-detail-link').click();
      getH2().contains('Remote2 detail page');
    });
  });
});
