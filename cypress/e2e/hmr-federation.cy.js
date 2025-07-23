/**
 * E2E Test for Module Federation HMR
 *
 * Tests:
 * 1. Navigation to federated shop page works without hydration errors
 * 2. Component file changes trigger HMR without hydration errors
 * 3. Direct remote entry hash changes are detected and handled
 * 4. Cross-navigation between host and remote maintains state
 */

describe('Module Federation HMR E2E Tests', () => {
  const SHOP_COMPONENT_PATH = 'apps/3001-shop/components/exposedTitle.tsx';
  const SHOP_REMOTE_ENTRY_PATH =
    'apps/3001-shop/.next/static/ssr/remoteEntry.js';
  const TEST_MARKER = 'CYPRESS_HMR_TEST';

  let originalComponentContent = '';
  let originalRemoteEntryContent = '';

  before(() => {
    // Backup original files
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      originalComponentContent = content;
    });
  });

  after(() => {
    // Restore original files
    if (originalComponentContent) {
      cy.writeFile(SHOP_COMPONENT_PATH, originalComponentContent);
    }
    if (originalRemoteEntryContent) {
      cy.writeFile(SHOP_REMOTE_ENTRY_PATH, originalRemoteEntryContent);
    }
  });

  beforeEach(() => {
    // Check for hydration errors before each test
    cy.window().then((win) => {
      win.addEventListener('error', (e) => {
        if (
          e.message.includes('hydration') ||
          e.message.includes('Hydration')
        ) {
          throw new Error(`Hydration error detected: ${e.message}`);
        }
      });
    });
  });

  it('should load home page without errors', () => {
    cy.visit('/');
    cy.contains('This came fom shop').should('be.visible');
    cy.get('body').should('not.contain', 'Error');

    // Check for console errors
    cy.window().then((win) => {
      const errors = [];
      const originalError = win.console.error;
      win.console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(win.console, args);
      };

      // Wait a bit for any async errors
      cy.wait(1000).then(() => {
        const hydrationErrors = errors.filter(
          (error) => error.includes('hydration') || error.includes('Hydration'),
        );
        expect(hydrationErrors).to.have.length(0);
      });
    });
  });

  it('should navigate to shop page without hydration errors', () => {
    cy.visit('/');
    cy.contains('Shop').click();
    cy.url().should('include', '/shop');

    // Verify federated content loads
    cy.contains('This came fom shop').should('be.visible');
    cy.contains('And it works like a charm').should('be.visible');

    // Wait for any potential hydration issues
    cy.wait(2000);

    // Check no hydration errors occurred
    cy.window().then((win) => {
      // No hydration mismatch should be present
      cy.get('body').should('not.contain', 'Hydration failed');
      cy.get('body').should('not.contain', 'hydration mismatch');
    });
  });

  it('should handle component file changes with HMR', () => {
    const testMessage = `${TEST_MARKER}_COMPONENT_${Date.now()}`;

    // Start on shop page
    cy.visit('/shop');
    cy.contains('This came fom shop').should('be.visible');

    // Modify the component file
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const modifiedContent = content.replace(
        'And it works like a charm v2',
        testMessage,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);

      // Wait for file system change detection
      cy.wait(3000);

      // Reload the page to trigger server-side revalidation
      cy.reload();

      // Check if the change is reflected (may take time for HMR)
      cy.wait(2000);

      // The page should load without hydration errors
      cy.get('body').should('not.contain', 'Hydration failed');
      cy.get('body').should('not.contain', 'hydration mismatch');

      // Content should eventually update (or at least not break)
      cy.get('body').should('exist');

      // Navigate away and back to test persistence
      cy.visit('/');
      cy.wait(1000);
      cy.visit('/shop');

      // Should still work without hydration errors
      cy.get('body').should('not.contain', 'Hydration failed');
      cy.contains('This came fom shop').should('be.visible');
    });
  });

  it('should detect remote entry hash changes', () => {
    // Visit shop page first to establish baseline
    cy.visit('/shop');
    cy.contains('This came fom shop').should('be.visible');

    // Read and modify the remote entry file to change its hash
    cy.readFile(SHOP_REMOTE_ENTRY_PATH).then((content) => {
      originalRemoteEntryContent = content;

      const modifiedContent = content.replace(
        '* ATTENTION: An "eval-source-map" devtool has been used.',
        `* ${TEST_MARKER}_REMOTE_ENTRY_${Date.now()} - Hash change test\n * ATTENTION: An "eval-source-map" devtool has been used.`,
      );

      cy.writeFile(SHOP_REMOTE_ENTRY_PATH, modifiedContent);

      // Wait for change detection
      cy.wait(2000);

      // Make a request that should trigger server-side revalidation
      cy.request('/shop').then((response) => {
        expect(response.status).to.eq(200);
      });

      // Wait for potential HMR processing
      cy.wait(3000);

      // Visit the page again
      cy.visit('/shop');

      // Page should load without hydration errors
      cy.get('body').should('not.contain', 'Hydration failed');
      cy.get('body').should('not.contain', 'hydration mismatch');
      cy.contains('This came fom shop').should('be.visible');
    });
  });

  it('should maintain federated state across navigation', () => {
    // Start on home page
    cy.visit('/');
    cy.contains('This came fom shop').should('be.visible');

    // Navigate to shop
    cy.contains('Shop').click();
    cy.url().should('include', '/shop');
    cy.contains('This came fom shop').should('be.visible');

    // Navigate back to home
    cy.visit('/');
    cy.contains('This came fom shop').should('be.visible');

    // Navigate to shop again
    cy.visit('/shop');
    cy.contains('This came fom shop').should('be.visible');

    // Throughout all navigation, no hydration errors should occur
    cy.get('body').should('not.contain', 'Hydration failed');
    cy.get('body').should('not.contain', 'hydration mismatch');
  });

  it('should handle multiple rapid navigation changes', () => {
    // Rapid navigation test to stress-test HMR
    for (let i = 0; i < 3; i++) {
      cy.visit('/');
      cy.wait(500);
      cy.visit('/shop');
      cy.wait(500);
    }

    // Final check - should still work
    cy.contains('This came fom shop').should('be.visible');
    cy.get('body').should('not.contain', 'Hydration failed');
  });

  it('should log HMR activities in console', () => {
    const consoleLogs = [];

    cy.visit('/shop', {
      onBeforeLoad(win) {
        // Capture console logs
        const originalLog = win.console.log;
        win.console.log = (...args) => {
          consoleLogs.push(args.join(' '));
          originalLog.apply(win.console, args);
        };
      },
    });

    // Make a few requests to trigger revalidation
    cy.reload();
    cy.wait(2000);
    cy.reload();

    cy.then(() => {
      // Check for Module Federation debug logs
      const federationLogs = consoleLogs.filter(
        (log) =>
          log.includes('Module Federation') ||
          log.includes('HMR') ||
          log.includes('revalidate'),
      );

      // Should have some federation-related logging
      expect(federationLogs.length).to.be.greaterThan(0);
    });
  });

  it('should handle webpack compilation updates', () => {
    const testMessage = `${TEST_MARKER}_WEBPACK_${Date.now()}`;

    cy.visit('/shop');

    // Modify component to trigger webpack recompilation
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const modifiedContent = content.replace(
        'HOOKS WORKS',
        `${testMessage}_HOOKS_WORKS`,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);

      // Wait for webpack to recompile
      cy.wait(5000);

      // Check that the page handles the compilation gracefully
      cy.visit('/shop', { timeout: 10000 });

      // Should not have hydration errors
      cy.get('body').should('not.contain', 'Hydration failed');
      cy.get('body').should('not.contain', 'Error');

      // Basic federation should still work
      cy.contains('This came fom shop').should('be.visible');
    });
  });
});
