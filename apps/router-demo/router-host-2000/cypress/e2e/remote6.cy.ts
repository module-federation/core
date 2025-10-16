describe('router-remote6-2006/', () => {
  beforeEach(() => cy.visit('http://localhost:2006/'));

  describe('visit', () => {
    it('should display React Router v7 content', () => {
      cy.verifyContent('Remote6 - React Router v7 Demo');
      cy.verifyContent('hello remote6 home page');
      cy.verifyContent('React Router v7 + React 18 + Module Federation');
    });

    it('should navigate between routes', () => {
      // Test navigation functionality with React Router v7
      cy.get('.self-remote6-home-link').should('exist').click();
      cy.url().should('include', '/');
      cy.verifyContent('Remote6 home page');

      cy.get('.self-remote6-about-link').should('exist').click();
      cy.url().should('include', '/about');
      cy.verifyContent('Remote6 about page');
      cy.verifyContent('This is a React Router v7 demo in Module Federation');

      cy.get('.self-remote6-detail-link').should('exist').click();
      cy.url().should('include', '/detail');
      cy.verifyContent('Remote6 detail page');
      cy.verifyContent('hello remote6 detail page with React Router v7');
    });

    it('should have working React Router v7 features', () => {
      // Verify React Router v7 specific content
      cy.verifyContent('Features: Data APIs, Type Safety, Future Flags');

      // Navigate to about page to see v7 features
      cy.get('.self-remote6-about-link').click();
      cy.verifyContent('New features in v7:');
      cy.verifyContent('Improved data loading patterns');
      cy.verifyContent('Better TypeScript support');
    });
  });
});

describe('router-remote6-2006 in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote6 render and destroy', () => {
    it('jump to remote6 home page', () => {
      cy.clickMenuItem('Remote6-ReactRouteV7');
      cy.verifyContent('Remote6 - React Router v7 Demo');
      cy.verifyContent('hello remote6 home page');
      cy.url().should('include', '/remote6');
    });

    it('should handle routing within remote6', () => {
      cy.clickMenuItem('Remote6-ReactRouteV7');

      // Test navigation within the remote app
      cy.get('.self-remote6-about-link').should('exist').click();
      cy.verifyContent('Remote6 about page');
      cy.verifyContent('This is a React Router v7 demo in Module Federation');
      cy.url().should('include', '/remote6/about');

      // Navigate to detail page
      cy.get('.self-remote6-detail-link').should('exist').click();
      cy.verifyContent('Remote6 detail page');
      cy.url().should('include', '/remote6/detail');

      // Navigate back to home
      cy.get('.self-remote6-home-link').should('exist').click();
      cy.verifyContent('hello remote6 home page');
      cy.url().should('include', '/remote6');
    });

    it('should maintain React Router v7 context and features', () => {
      cy.clickMenuItem('Remote6-ReactRouteV7');

      // Verify React Router v7 specific content is loaded
      cy.verifyContent('React Router v7 + React 18 + Module Federation');
      cy.verifyContent('Features: Data APIs, Type Safety, Future Flags');

      // Test that routing works properly within the federated context
      cy.get('.self-remote6-about-link').click();
      cy.verifyContent('New features in v7:');
      cy.verifyContent('Enhanced error boundaries');
    });

    it('should handle deep linking', () => {
      // Test direct navigation to remote6 sub-route
      cy.visit('/remote6/about');
      cy.verifyContent('Remote6 about page');
      cy.verifyContent('This is a React Router v7 demo in Module Federation');
    });

    it('should support browser navigation', () => {
      cy.clickMenuItem('Remote6-ReactRouteV7');

      // Navigate to about page
      cy.get('.self-remote6-about-link').click();
      cy.verifyContent('Remote6 about page');

      // Navigate to detail page
      cy.get('.self-remote6-detail-link').click();
      cy.verifyContent('Remote6 detail page');

      // Use browser back button
      cy.go('back');
      cy.verifyContent('Remote6 about page');

      // Use browser back button again
      cy.go('back');
      cy.verifyContent('hello remote6 home page');

      // Use browser forward button
      cy.go('forward');
      cy.verifyContent('Remote6 about page');
    });
  });
});
