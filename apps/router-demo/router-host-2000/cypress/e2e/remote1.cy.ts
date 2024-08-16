import { getH2, getH3, getH4, wait2s } from '../support/app.po';

describe('router-remote1-2001/', () => {
  beforeEach(() => cy.visit('http://localhost:2001/'));

  describe('visit', () => {
    it('jump to home page', () => {
      getH2().contains('Remote1 home page');
      cy.get('.self-remote1-detail-link').click();
      getH2().contains('Remote1 detail page');
    });
  });
});

describe('router-remote1-2001 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote1 render and destroy', () => {
    it('jump to remote1 home page', () => {
      cy.get('.host-menu > li:nth-child(3)').click();
      cy.get('.menu-remote1-home-link').click();

      getH2().contains('Remote1 home page');
      getH3().contains('Ming');
      getH3().contains('12');
      getH4().contains('Some text');

      cy.get('.menu-remote1-detail-link').click();
      getH2().contains('Remote1 detail page');
    });
  });
});
