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
      cy.clickMenuItem('Remote2');
      cy.clickByClass('.menu-remote2-home-link');
      cy.verifyContent('Remote2 home page');
      cy.clickByClass('.menu-remote2-detail-link');
      cy.verifyContent('Remote2 detail page');
    });
  });
});
