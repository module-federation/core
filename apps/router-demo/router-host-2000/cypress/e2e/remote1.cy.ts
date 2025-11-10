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
      cy.visit('/remote1');
      cy.verifyContent('Remote1 home page', 10000);
      cy.verifyContent('Ming');
      cy.verifyContent('32');
      cy.visit('/remote1/detail');
      cy.verifyContent('Remote1 detail page');
    });
  });
});
