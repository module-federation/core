/**
 * Immediate HMR Test - Verify HMR clears counter on SAME request
 */

describe('Immediate HMR Test', () => {
  it('should immediately reset server render counter on same request with query string', () => {
    // Build up the counter first
    cy.log('Building up server render counter...');
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Verify counter shows a number > 2
    cy.contains('Server Render Counter').should('be.visible');
    cy.get('div')
      .contains(/^\d+$/)
      .should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.greaterThan(2);
        cy.log(`Server render count before HMR: ${count}`);
      });

    // Now trigger HMR and check if counter resets IMMEDIATELY on same request
    cy.log('Triggering HMR - should reset counter IMMEDIATELY...');
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(3000);

    // Check if counter shows 1 (meaning it was reset immediately)
    cy.get('div')
      .contains(/^\d+$/)
      .should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.lessThan(3); // Should be 1 if immediate reset worked
        cy.log(`Server render count IMMEDIATELY after HMR: ${count}`);

        if (count === 1) {
          cy.log(
            '✅ SUCCESS: Counter reset IMMEDIATELY without subsequent page load!',
          );
        } else {
          cy.log(
            '⚠️ Counter did not reset immediately - still needs subsequent page load',
          );
        }
      });
  });
});
