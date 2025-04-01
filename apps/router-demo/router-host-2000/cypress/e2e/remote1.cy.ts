import { getH2, getH3, getH4, wait2s } from '../support/app.po';

describe('router-remote1-2001/', () => {
  beforeEach(() => cy.visit('http://localhost:2001/'));

  describe('visit', () => {
    it('jump to home page', () => {
      cy.verifyContent('Remote1 home page');
      cy.clickByClass('.self-remote1-detail-link');
      cy.verifyContent('Remote1 detail page');
    });
  });
});

describe('router-remote1-2001 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote1 render and destroy', () => {
    it('jump to remote1 home page', () => {
      // Use custom command to click menu item - note the capitalization "Remote1"
      cy.clickMenuItem('Remote1');

      // Click the remote1 home link
      cy.clickByClass('.menu-remote1-home-link');

      // Verify content is loaded correctly
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
      cy.verifyContent('12');
      cy.verifyContent('Some text');

      // Click the detail page link
      cy.clickByClass('.menu-remote1-detail-link');

      // Verify detail page content is loaded correctly
      cy.verifyContent('Remote1 detail page');
    });
  });
});
