/**
 * Comprehensive Cypress E2E Test for HMR Functionality
 * Tests all HMR methods: query strings, API endpoints, and cross-page functionality
 */

describe('HMR Comprehensive Test Suite', () => {
  beforeEach(() => {
    // Start with a clean state
    cy.visit('http://localhost:3000');
    cy.wait(1000);
  });

  it('should test reloadAll query string method', () => {
    cy.log('Testing reloadAll query string method');

    // Increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Verify counter increased
    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.be.greaterThan(1);
    });

    // Apply reloadAll method
    cy.visit(`http://localhost:3000?reloadAll=true`);
    cy.wait(2000);

    // Verify reset
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.equal(1);
    });

    cy.log('✅ reloadAll query method working correctly');
  });

  it('should ignore invalid query string parameters', () => {
    cy.log('Testing that invalid query parameters are ignored');

    const invalidParams = [
      'clearCache=true',
      'resetCounter=true',
      'hotReloadAll=true',
    ];

    invalidParams.forEach((queryParam, index) => {
      cy.log(`Testing invalid param ${index + 1}: ?${queryParam}`);

      // Increase counter
      cy.visit('http://localhost:3000');
      cy.wait(1000);
      cy.visit('http://localhost:3000');
      cy.wait(1000);

      // Verify counter increased
      cy.get('[data-testid="render-counter"]').should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.greaterThan(1);
      });

      const beforeCount = cy
        .get('[data-testid="render-counter"]')
        .then(($el) => {
          return parseInt($el.text().trim());
        });

      // Try invalid query parameter (should not reset)
      cy.visit(`http://localhost:3000?${queryParam}`);
      cy.wait(1000);

      // Verify counter was NOT reset
      cy.get('[data-testid="render-counter"]').should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.greaterThan(1);
      });

      cy.log(`✅ Invalid param ?${queryParam} correctly ignored`);

      // Clean up with valid reloadAll
      cy.visit('http://localhost:3000?reloadAll=true');
      cy.wait(1000);
    });
  });

  it('should test reload-all API endpoint', () => {
    cy.log('Testing reload-all API endpoint');

    // Increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Verify counter increased
    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.be.greaterThan(2);
    });

    // Test reload-all API action
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/server-hmr',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'reload-all' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.result.totalCleared).to.be.greaterThan(0);
      expect(response.body.result.method).to.eq('next-js-internal-apis');
      cy.log(
        `reload-all API cleared ${response.body.result.totalCleared} modules`,
      );
    });

    cy.wait(1000);

    // Verify reset
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.equal(1);
    });

    cy.log('✅ reload-all API working correctly');
  });

  it('should reject invalid API actions', () => {
    cy.log('Testing that invalid API actions are rejected');

    const invalidActions = ['clear-all-pages', 'reset-render-counter'];

    invalidActions.forEach((action, index) => {
      cy.log(`Testing invalid API action ${index + 1}: ${action}`);

      // Test invalid API action
      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/server-hmr',
        headers: { 'Content-Type': 'application/json' },
        body: { action },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.include('Unknown action');
        expect(response.body.availableActions).to.include('reload-all');
        cy.log(`✅ Invalid API action ${action} correctly rejected`);
      });
    });
  });

  it('should test cross-page HMR functionality', () => {
    cy.log('Testing cross-page HMR reset');

    // Increase counter on home page
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Verify counter increased
    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.be.greaterThan(1);
    });

    // Reset from shop page using unified method
    cy.visit('http://localhost:3000/shop?reloadAll=true');
    cy.wait(2000);

    // Verify reset worked on home page
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    cy.get('[data-testid="render-counter"]').should(($el) => {
      const count = parseInt($el.text().trim());
      expect(count).to.equal(1);
    });

    cy.log('✅ Cross-page HMR working correctly');
  });

  it('should validate HMR cache info', () => {
    cy.log('Validating HMR cache information');

    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/server-hmr',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'cache-info' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.result.totalCacheSize).to.be.greaterThan(1000);
      expect(response.body.result.nativeAPIsAvailable.deleteCache).to.be.true;
      expect(response.body.result.nativeAPIsAvailable.clearModuleContext).to.be
        .true;
      expect(response.body.result.workingDirectory).to.include('3000-home');
      expect(response.body.result.nodeEnv).to.eq('development');

      cy.log(
        `✅ Cache info validated: ${response.body.result.totalCacheSize} modules, Native APIs available`,
      );
    });
  });

  it('should test counter incrementation consistency', () => {
    cy.log('Testing counter incrementation behavior');

    let previousCount = 0;

    // Test multiple visits increment correctly
    for (let i = 1; i <= 3; i++) {
      cy.visit('http://localhost:3000');
      cy.wait(1000);

      cy.get('[data-testid="render-counter"]').should(($el) => {
        const currentCount = parseInt($el.text().trim());
        expect(currentCount).to.be.greaterThan(previousCount);
        previousCount = currentCount;
      });
    }

    cy.log('✅ Counter incrementation working consistently');
  });

  it('should verify UI elements are present', () => {
    cy.log('Verifying HMR UI elements');

    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Check that all UI elements are present
    cy.contains('Server Render Counter').should('be.visible');
    cy.get('[data-testid="render-counter"]').should('be.visible');
    cy.contains('Route:').should('be.visible');
    cy.contains('Last render:').should('be.visible');
    cy.contains('After HMR').should('be.visible');

    cy.log('✅ All UI elements present and visible');
  });
});
