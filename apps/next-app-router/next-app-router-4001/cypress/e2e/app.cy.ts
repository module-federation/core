describe('next-app-router-4001 federation remote', () => {
  it('renders the app-router remote home page', () => {
    cy.visit('/');
    cy.contains('h1', 'Examples').should('be.visible');
  });

  it('publishes remoteEntry with expected exposed modules', () => {
    cy.request('/_next/static/chunks/remoteEntry.js').then(
      ({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.include('./Button');
        expect(body).to.include('./Header');
        expect(body).to.include('./Footer');
        expect(body).to.include('./GlobalNav');
        expect(body).to.include('./ProductCard');
        expect(body).to.include('./TabGroup');
        expect(body).to.include('./TabNavItem');
        expect(body).to.include('./CountUp');
        expect(body).to.include('./RenderingInfo');
      },
    );
  });

  it('can self-consume exposed modules on the demo route', () => {
    cy.visit('/demo');
    cy.contains('h1', 'Remote Components Demo').should('be.visible');
    cy.contains('button', 'Primary Button').should('be.visible');
    cy.contains('h2', 'Navigation Components').should('be.visible');
  });
});
