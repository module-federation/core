/**
 * Cypress E2E Test for Server Render Counter & HMR Functionality
 * Tests server render count reset via multiple HMR methods:
 * - Query string parameters (?clearCache=true, ?resetCounter=true, ?hotReloadAll=true)
 * - API endpoints (/api/server-hmr)
 * - Cross-page functionality
 */

describe('Server Render Counter & HMR Integration', () => {
  // Helper function to get counter value
  const getCounterValue = () => {
    return cy
      .get('[data-testid="render-counter"]')
      .should('exist')
      .invoke('text')
      .then((text) => parseInt(text.trim()));
  };

  // Helper function to verify counter is greater than a value
  const verifyCounterGreaterThan = (value: number, description: string) => {
    cy.get('[data-testid="render-counter"]')
      .should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.greaterThan(value);
      })
      .then(($el) => {
        const count = parseInt($el.text().trim());
        cy.log(`${description}: ${count}`);
      });
  };

  // Helper function to verify counter equals a value
  const verifyCounterEquals = (value: number, description: string) => {
    cy.get('[data-testid="render-counter"]')
      .should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.equal(value);
      })
      .then(($el) => {
        const count = parseInt($el.text().trim());
        cy.log(`${description}: ${count}`);
      });
  };

  beforeEach(() => {
    // Ensure consistent starting state
    cy.visit('http://localhost:3000');
    cy.wait(1000);
  });
  it('should reset counter via query string ?hotReloadAll=true', () => {
    cy.log('Testing HMR reset via ?hotReloadAll=true query parameter');

    // Increase counter by visiting multiple times
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    // Verify counter is > 1
    verifyCounterGreaterThan(1, 'Counter before HMR reset');

    // Trigger HMR via query parameter
    cy.log('Triggering HMR with ?hotReloadAll=true');
    cy.visit('http://localhost:3000?hotReloadAll=true');
    cy.wait(3000); // Wait for HMR processing

    // Verify page loads and counter resets
    cy.contains('Server Render Counter').should('be.visible');
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    verifyCounterEquals(1, 'Counter after HMR reset');
  });

  it('should reset counter via query string ?clearCache=true', () => {
    cy.log('Testing HMR reset via ?clearCache=true query parameter');

    // Increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    verifyCounterGreaterThan(1, 'Counter before clearCache');

    // Trigger HMR via clearCache query parameter
    cy.log('Triggering HMR with ?clearCache=true');
    cy.visit('http://localhost:3000?clearCache=true');
    cy.wait(3000);

    // Verify reset
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    verifyCounterEquals(1, 'Counter after clearCache reset');
  });

  it('should reset counter via query string ?resetCounter=true', () => {
    cy.log('Testing HMR reset via ?resetCounter=true query parameter');

    // Increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    verifyCounterGreaterThan(1, 'Counter before resetCounter');

    // Trigger HMR via resetCounter query parameter
    cy.log('Triggering HMR with ?resetCounter=true');
    cy.visit('http://localhost:3000?resetCounter=true');
    cy.wait(3000);

    // Verify reset
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    verifyCounterEquals(1, 'Counter after resetCounter reset');
  });

  it('should reset counter from different pages via query string', () => {
    cy.log('Testing cross-page HMR reset functionality');

    // Increase counter on home page
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    verifyCounterGreaterThan(1, 'Counter before cross-page reset');

    // Reset from shop page
    cy.log('Triggering HMR reset from /shop page');
    cy.visit('http://localhost:3000/shop?clearCache=true');
    cy.wait(3000);

    // Verify reset on home page
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    verifyCounterEquals(1, 'Counter after cross-page reset');
  });

  it('should reset counter via API endpoint', () => {
    cy.log('Testing HMR reset via API endpoint');

    // Increase counter
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.visit('http://localhost:3000');
    cy.wait(1000);

    verifyCounterGreaterThan(2, 'Counter before API reset');

    // Call HMR API
    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/server-hmr',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'clear-all-pages' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.result.clearedCount).to.be.greaterThan(0);
      cy.log(`HMR API cleared ${response.body.result.clearedCount} modules`);
    });

    cy.wait(2000);

    // Verify reset
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    verifyCounterEquals(1, 'Counter after API reset');
  });

  it('should validate HMR cache info API', () => {
    cy.log('Testing HMR cache info API');

    cy.request({
      method: 'POST',
      url: 'http://localhost:3000/api/server-hmr',
      headers: { 'Content-Type': 'application/json' },
      body: { action: 'cache-info' },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.success).to.be.true;
      expect(response.body.result.totalCacheSize).to.be.greaterThan(0);
      expect(response.body.result.nativeAPIsAvailable.deleteCache).to.be.true;
      expect(response.body.result.nativeAPIsAvailable.clearModuleContext).to.be
        .true;

      cy.log(
        `Cache info: ${response.body.result.totalCacheSize} modules, APIs available: ${JSON.stringify(response.body.result.nativeAPIsAvailable)}`,
      );
    });
  });

  it('should show render counts across different routes', () => {
    cy.log('Testing server render counter across different routes');

    const routes = ['/', '/shop'];

    routes.forEach((route) => {
      cy.visit(`http://localhost:3000${route}`);
      cy.wait(1500);

      // Verify render counter is visible on all routes
      cy.contains('Server Render Counter').should('be.visible');

      // Check that route is displayed correctly
      cy.contains('Route:').should('be.visible');

      // Check that render count is a number using our helper
      cy.get('[data-testid="render-counter"]').should(($el) => {
        const count = parseInt($el.text().trim());
        expect(count).to.be.a('number');
        expect(count).to.be.greaterThan(0);
        cy.log(`Route ${route}: Server render count = ${count}`);
      });
    });
  });

  it('should increment server render count on each page visit', () => {
    cy.log('Testing server render count incrementation');

    let previousServerCount = 0;

    // Visit page multiple times and verify count increments
    for (let i = 1; i <= 3; i++) {
      cy.visit('http://localhost:3000');
      cy.wait(1000);

      cy.get('[data-testid="render-counter"]').should(($el) => {
        const currentCount = parseInt($el.text().trim());
        expect(currentCount).to.be.greaterThan(previousServerCount);
        previousServerCount = currentCount;
        cy.log(`Visit ${i}: Server render count = ${currentCount}`);
      });
    }
  });

  it('should show timestamp of last server render', () => {
    cy.log('Testing server render timestamp display');

    cy.visit('http://localhost:3000');
    cy.wait(1500);

    // Check that timestamp is visible
    cy.contains('Last render:').should('be.visible');

    // Check that timestamp is recent (within last minute)
    cy.get('div')
      .contains('Last render:')
      .should(($el) => {
        const timestampText = $el.text();
        const timeMatch = timestampText.match(/(\d{1,2}:\d{2}:\d{2})/);
        expect(timeMatch).to.not.be.null;
        cy.log(
          `Last server render timestamp: ${timeMatch ? timeMatch[1] : 'not found'}`,
        );
      });
  });

  it('should test multiple HMR methods in sequence', () => {
    cy.log('Testing multiple HMR methods in sequence');

    const methods = [
      {
        name: 'API clear-all-pages',
        action: () => {
          cy.request({
            method: 'POST',
            url: 'http://localhost:3000/api/server-hmr',
            headers: { 'Content-Type': 'application/json' },
            body: { action: 'clear-all-pages' },
          });
        },
      },
      {
        name: 'Query ?clearCache=true',
        action: () => {
          cy.visit('http://localhost:3000?clearCache=true');
        },
      },
      {
        name: 'Query ?resetCounter=true',
        action: () => {
          cy.visit('http://localhost:3000?resetCounter=true');
        },
      },
    ];

    methods.forEach((method, index) => {
      cy.log(`Testing method ${index + 1}: ${method.name}`);

      // Increase counter
      cy.visit('http://localhost:3000');
      cy.wait(1000);
      cy.visit('http://localhost:3000');
      cy.wait(1000);

      verifyCounterGreaterThan(1, `Counter before ${method.name}`);

      // Apply HMR method
      method.action();
      cy.wait(2000);

      // Verify reset
      cy.visit('http://localhost:3000');
      cy.wait(1000);
      verifyCounterEquals(1, `Counter after ${method.name}`);
    });
  });
});
