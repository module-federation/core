/**
 * Simple Cypress Test for HMR Functionality
 * Basic validation of counter reset via query parameters
 */

describe('HMR Simple Test', () => {
  it('should reset counter via clearCache query parameter', () => {
    cy.log('Testing basic HMR reset functionality');
    
    // Visit page multiple times to increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    
    // Verify counter is greater than 1
    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.be.greaterThan(1);
    });
    
    // Trigger HMR reset
    cy.visit('http://localhost:3000?clearCache=true');
    cy.wait(3000);
    
    // Check reset worked
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    
    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.equal(1);
    });
    
    cy.log('✅ HMR reset functionality working correctly');
  });

  it('should validate HMR API endpoint', () => {
    cy.log('Testing HMR API endpoint');
    
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/server-hmr',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'cache-info' }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.result.totalCacheSize).to.be.greaterThan(0);
      cy.log(`✅ HMR API working - ${response.body.result.totalCacheSize} modules in cache`);
    });
  });
});