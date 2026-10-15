describe('router-remote6-2006 in host', () => {
  beforeEach(() => cy.visit('/'));

  it('supports a served deep link', () => {
    cy.visit('/remote6/about');
    cy.verifyContent('Remote6 about page');
    cy.verifyContent('This is a React Router v7 demo in Module Federation');
  });

  it('supports browser history', () => {
    cy.clickMenuItem('Remote6-ReactRouteV7');
    cy.get('.self-remote6-about-link').click();
    cy.verifyContent('Remote6 about page');
    cy.get('.self-remote6-detail-link').click();
    cy.verifyContent('Remote6 detail page');
    cy.go('back');
    cy.verifyContent('Remote6 about page');
    cy.go('back');
    cy.verifyContent('hello remote6 home page');
    cy.go('forward');
    cy.verifyContent('Remote6 about page');
  });
});
