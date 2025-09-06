describe('ModernJS SSR Dynamic Nested Remote', () => {
  it('should load the app', () => {
    cy.visit('http://localhost:8080');
    cy.contains('dynamic-nested-remote');
  });
});
