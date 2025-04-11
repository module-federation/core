describe('router-remote5-2005/', () => {
  beforeEach(() => cy.visit('http://localhost:2005/'));

  describe('visit', () => {
    it('should display React 19 content', () => {
      cy.verifyContent('This is the remote app5 with React 19');
    });
  });
});

describe('router-remote5-2005 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote5 render and destroy', () => {
    it('jump to remote5 home page', () => {
      cy.clickMenuItem('remote5');
      cy.verifyContent('This is the remote app5 with React 19');
    });
  });
});
