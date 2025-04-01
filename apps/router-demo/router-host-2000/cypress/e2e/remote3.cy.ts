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
      cy.clickMenuItem('Remote3');
      cy.clickByClass('.menu-remote3-home-link');
      cy.verifyContent('Remote3 home page');
      cy.clickByClass('.menu-remote3-detail-link');
      cy.verifyContent('Remote3 detail page');
    });
  });
});
