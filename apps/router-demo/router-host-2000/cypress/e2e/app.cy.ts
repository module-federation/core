import { getH2, getH3 } from '../support/app.po';

describe('router-host-2000/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH2().contains('Router host Home page');
    });
  });

  describe('Remote1 render and destroy', () => {
    it('jump to remote1 home page', () => {
      cy.get('.host-menu > li:nth-child(3)').click();
      cy.get('.remote1-home-link').click();

      getH2().contains('Remote1 home page');
      cy.get('.remote1-detail-link').click();
      getH2().contains('Remote1 detail page');
    });
  });
});
