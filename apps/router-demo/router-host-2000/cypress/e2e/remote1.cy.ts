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
      cy.clickMenuItem('Remote1');
      cy.clickByClass('.menu-remote1-home-link');
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
      cy.verifyContent('12');
      cy.verifyContent('Some text');
      cy.clickByClass('.menu-remote1-detail-link');
      cy.verifyContent('Remote1 detail page');
    });
  });
});
