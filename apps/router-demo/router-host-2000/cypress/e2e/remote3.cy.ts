import { getH2, getH3, wait2s } from '../support/app.po';

describe('router-remote3-2003/', () => {
  beforeEach(() => cy.visit('http://localhost:2003/'));

  describe('visit', () => {
    it('jump to home page', () => {
      cy.verifyContent('Remote3 home page');
      cy.clickByClass('.self-remote3-detail-link');
      cy.verifyContent('Remote3 detail page');
    });
  });
});

describe('router-remote3-2003 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote3 render and destroy', () => {
    it('jump to remote3 home page', () => {
      // Use custom command to click menu item - note the capitalization "Remote3"
      cy.clickMenuItem('Remote3');

      // Click the remote3 home link
      cy.clickByClass('.menu-remote3-home-link');

      // Verify content is loaded correctly
      cy.verifyContent('Remote3 home page');

      // Click the detail page link
      cy.clickByClass('.menu-remote3-detail-link');

      // Verify detail page content is loaded correctly
      cy.verifyContent('Remote3 detail page');
    });
  });
});
