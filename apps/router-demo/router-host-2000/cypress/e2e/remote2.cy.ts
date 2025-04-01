import { getH2, getH3, wait2s } from '../support/app.po';

describe('router-remote2-2002/', () => {
  beforeEach(() => cy.visit('http://localhost:2002/'));

  describe('visit', () => {
    it('jump to home page', () => {
      cy.verifyContent('Remote2 home page');
      cy.clickByClass('.self-remote2-detail-link');
      cy.verifyContent('Remote2 detail page');
    });
  });
});

describe('router-remote2-2002 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote2 render and destroy', () => {
    it('jump to remote2 home page', () => {
      // Use custom command to click menu item - note the capitalization "Remote2"
      cy.clickMenuItem('Remote2');

      // Click the remote2 home link
      cy.clickByClass('.menu-remote2-home-link');

      // Verify content is loaded correctly
      cy.verifyContent('Remote2 home page');

      // Click the detail page link
      cy.clickByClass('.menu-remote2-detail-link');

      // Verify detail page content is loaded correctly
      cy.verifyContent('Remote2 detail page');
    });
  });
});
