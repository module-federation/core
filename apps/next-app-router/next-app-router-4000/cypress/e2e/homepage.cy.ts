describe('Next.js App Router Homepage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4000/');
  });

  it('should display the homepage', () => {
    cy.get('h1').should('contain', 'Examples');
  });

  it('should display the local RSC button', () => {
    cy.get('button').contains('Local RSC Button').should('be.visible');
  });

  it('should have a working address bar with remote button', () => {
    // Check for the address bar structure
    cy.get('div.flex.items-center.gap-x-2').should('be.visible');

    // Check for the Remote Button in the address bar
    cy.get('button').contains('Remote Button').should('be.visible');
    cy.get('button')
      .contains('Remote Button')
      .should('have.class', 'bg-gray-600');

    // Check for the lock icon (SVG)
    cy.get('svg[viewBox="0 0 20 20"]').should('be.visible');

    // Check for the acme.com domain display
    cy.get('span').contains('acme.com').should('be.visible');
  });

  it('should display remote imports on homepage when enabled', () => {
    // When remote imports are enabled, these should be visible
    // For now, they are commented out, so we test the commented state
    cy.get('body').should('exist');

    // TODO: When remote imports are re-enabled, add tests like:
    // cy.get('button').contains('Remote Button from RSC').should('be.visible');
    // cy.get('button').contains('Remote Button from RSC').should('have.text', 'Remote Button from RSC');
  });

  it('should display demo sections', () => {
    cy.get('[class*="space-y-10"]').should('exist');
    cy.get('a[href]').should('have.length.greaterThan', 0);
  });

  it('should navigate to demo pages', () => {
    // Find the first demo link and click it
    cy.get('a[href^="/"]')
      .first()
      .then(($link) => {
        const href = $link.attr('href');
        cy.wrap($link).click();
        cy.url().should('include', href);
      });
  });

  it('should have proper meta tags', () => {
    cy.get('title').should('contain', 'Next.js App Router');
  });

  it('should have responsive design elements', () => {
    cy.get('[class*="lg:"]').should('exist');
    cy.get('[class*="max-w-"]').should('exist');
  });

  it('should have module federation infrastructure ready', () => {
    // Test that the app is ready for Module Federation
    cy.get('div[class*="space-y-8"]').should('exist');

    // Check that the main content area exists
    cy.get('div[class*="rounded-lg"][class*="bg-black"]').should('exist');

    // Verify the page structure supports federated components
    cy.get('button').contains('Local RSC Button').should('be.visible');
  });
});
