describe('next-app-router-4000 federation host', () => {
  beforeEach(() => cy.visit('/'));

  it('renders app shell and remote button on the home route', () => {
    cy.contains('h1', 'Examples').should('be.visible');
    cy.contains('button', 'Button from remote').should('be.visible');
    cy.get('a[href="/layouts"]').should('exist');
    cy.get('a[href="/parallel-routes"]').should('exist');
  });

  it('keeps federated remote components working after app-router navigation', () => {
    cy.contains('a', 'Client Context').click();
    cy.url().should('include', '/context');
    cy.contains('button', 'testing').should('be.visible');
    cy.contains('button', '0 Clicks').click();
    cy.contains('button', '1 Clicks').should('be.visible');
  });

  it('can fetch the 4001 remote container from the host test run', () => {
    cy.request('http://localhost:4001/_next/static/chunks/remoteEntry.js').then(
      ({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.include('./Button');
        expect(body).to.include('./GlobalNav');
      },
    );
  });
});
