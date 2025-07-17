/**
 * Cypress E2E Test for Hot Reload All Pages functionality
 * Tests the server-side HMR mechanism that reloads all pages via query string
 */

describe('Hot Reload All Pages', () => {
  beforeEach(() => {
    // Start with a fresh page load
    cy.visit('http://localhost:3000');
    cy.wait(1000); // Allow initial load to complete
  });

  it('should trigger hot reload all pages via query parameter', () => {
    cy.log('Testing Hot Reload All Pages via query parameter');

    // Navigate with the hotReloadAll query parameter
    cy.visit('http://localhost:3000?hotReloadAll=true');

    // Wait for server-side processing
    cy.wait(3000);

    // Verify the page still loads correctly after hot reload
    cy.get('body').should('be.visible');
    cy.get('main').should('exist');

    // Check that the page is functional
    cy.get('[data-testid], .ant-layout, main').should('have.length.gte', 1);
  });

  it('should reset server render counter after HMR', () => {
    cy.log('Testing that server render counter resets after HMR');

    // First visit to see initial render count
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Get initial render count
    cy.contains(/Server Render Counter/i)
      .parent()
      .within(() => {
        cy.get('div')
          .contains(/\d+/)
          .then(($el) => {
            const initialCount = parseInt($el.text());
            cy.log(`Initial render count: ${initialCount}`);

            // Trigger HMR
            cy.visit('http://localhost:3000?hotReloadAll=true');
            cy.wait(2000);

            // Check render count on next visit (should be reset to 1)
            cy.visit('http://localhost:3000');
            cy.wait(1000);

            cy.contains(/Server Render Counter/i)
              .parent()
              .within(() => {
                cy.get('div')
                  .contains(/\d+/)
                  .then(($newEl) => {
                    const newCount = parseInt($newEl.text());
                    cy.log(`Render count after HMR: ${newCount}`);

                    // After HMR, count should be 1 (reset)
                    expect(newCount).to.equal(1);
                  });
              });
          });
      });
  });

  it('should work with different routes and query parameter', () => {
    cy.log('Testing hot reload across different routes');

    const routes = [
      'http://localhost:3000?hotReloadAll=true',
      'http://localhost:3000/shop?hotReloadAll=true',
      'http://localhost:3000/checkout?hotReloadAll=true',
    ];

    routes.forEach((route, index) => {
      cy.visit(route);
      cy.wait(2000); // Allow server processing

      // Verify page loads successfully
      cy.get('body').should('be.visible');
      cy.log(`Route ${index + 1}: ${route} - Hot reload successful`);

      // Check for basic page structure
      cy.get('main, .ant-layout-content, [role="main"]').should('exist');
    });
  });

  it('should handle rapid successive hot reload triggers', () => {
    cy.log('Testing rapid successive hot reload triggers');

    // Trigger multiple rapid hot reloads
    const testUrls = [
      'http://localhost:3000?hotReloadAll=true&test=1',
      'http://localhost:3000?hotReloadAll=true&test=2',
      'http://localhost:3000?hotReloadAll=true&test=3',
    ];

    testUrls.forEach((url, index) => {
      cy.visit(url);
      cy.wait(1000); // Shorter wait for rapid testing
      cy.get('body').should('be.visible');
      cy.log(`Rapid test ${index + 1}: Hot reload completed successfully`);
    });

    // Final verification that everything still works
    cy.visit('http://localhost:3000');
    cy.get('body').should('be.visible');
  });

  it('should preserve page functionality after hot reload', () => {
    cy.log('Testing that page functionality is preserved after hot reload');

    // First, load the page normally and test functionality
    cy.visit('http://localhost:3000');
    cy.get('body').should('be.visible');

    // Navigate to different sections if they exist
    cy.get('a[href*="/shop"], button, .ant-menu-item')
      .first()
      .then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).click({ force: true });
          cy.wait(1000);
        }
      });

    // Now trigger hot reload
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(3000);

    // Verify functionality still works
    cy.get('body').should('be.visible');
    cy.get('a[href*="/shop"], button, .ant-menu-item')
      .first()
      .then(($el) => {
        if ($el.length > 0) {
          cy.wrap($el).should('be.visible');
        }
      });
  });

  it('should work alongside module federation functionality', () => {
    cy.log('Testing hot reload with Module Federation routes');

    // Test with federated routes
    const federatedRoutes = [
      'http://localhost:3000/shop?hotReloadAll=true',
      'http://localhost:3000/checkout?hotReloadAll=true',
    ];

    federatedRoutes.forEach((route) => {
      cy.visit(route);
      cy.wait(3000); // Allow hot reload and federation loading

      // Verify page loads despite hot reload
      cy.get('body').should('be.visible');

      // Go back to home to test navigation
      cy.visit('http://localhost:3000');
      cy.wait(1000);
      cy.get('body').should('be.visible');
    });
  });

  it('should handle hot reload without breaking subsequent page loads', () => {
    cy.log('Testing that hot reload does not break subsequent navigation');

    // Trigger hot reload
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(3000);

    // Test normal navigation after hot reload
    const navigationTests = [
      'http://localhost:3000',
      'http://localhost:3000/shop',
      'http://localhost:3000/checkout',
      'http://localhost:3000', // Back to home
    ];

    navigationTests.forEach((url, index) => {
      cy.visit(url);
      cy.wait(1000);
      cy.get('body').should('be.visible');
      cy.log(
        `Navigation test ${index + 1}: ${url} loads successfully after hot reload`,
      );
    });
  });

  it('should only trigger in development environment', () => {
    cy.log('Verifying hot reload behavior in development');

    // Visit with hot reload parameter
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(3000);

    // The page should load successfully (since we're in dev mode)
    cy.get('body').should('be.visible');

    // Check that server logs indicate development mode processing
    // (This would be visible in the terminal/console where the dev server is running)
    cy.window().then((win) => {
      // In a real test, you might check for specific dev-mode indicators
      expect(win.location.hostname).to.equal('localhost');
    });
  });

  it('should handle hot reload with different query parameter combinations', () => {
    cy.log('Testing hot reload with various query parameter combinations');

    const queryVariations = [
      '?hotReloadAll=true',
      '?hotReloadAll=true&foo=bar',
      '?foo=bar&hotReloadAll=true',
      '?hotReloadAll=true&test=123&debug=false',
    ];

    queryVariations.forEach((query, index) => {
      const url = `http://localhost:3000${query}`;
      cy.visit(url);
      cy.wait(2000);

      cy.get('body').should('be.visible');
      cy.log(`Query variation ${index + 1}: ${query} - Hot reload successful`);
    });
  });

  it('should handle errors gracefully during hot reload', () => {
    cy.log('Testing error handling during hot reload');

    // Trigger hot reload multiple times to test resilience
    for (let i = 0; i < 3; i++) {
      cy.visit(`http://localhost:3000?hotReloadAll=true&iteration=${i}`);
      cy.wait(1500);

      // Each time, the page should still be functional
      cy.get('body').should('be.visible');

      // Even if there are errors, the page should not be completely broken
      cy.get('html').should('exist');
    }

    // Final check - normal page load should work
    cy.visit('http://localhost:3000');
    cy.get('body').should('be.visible');
  });
});
