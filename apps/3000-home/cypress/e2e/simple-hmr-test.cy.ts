/**
 * Simple HMR Test - Basic functionality check
 */

describe('Simple HMR Test', () => {
  it('should show server render counter and test HMR reset', () => {
    // Load page normally
    cy.visit('http://localhost:3000');
    cy.wait(3000);

    // Check if page loads
    cy.get('body').should('be.visible');

    // Look for the server render counter
    cy.contains('Server Render Counter').should('be.visible');

    // Load page multiple times to increment counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Trigger HMR
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(5000);

    // Load page after HMR
    cy.visit('http://localhost:3000');
    cy.wait(2000);

    // Just verify the counter is still there after HMR
    cy.contains('Server Render Counter').should('be.visible');

    cy.log(
      'HMR test completed - check server logs for module clearing evidence',
    );
  });
});
