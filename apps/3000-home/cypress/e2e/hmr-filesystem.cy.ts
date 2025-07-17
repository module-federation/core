import { getH1 } from '../support/app.po';

describe('HMR Filesystem Changes E2E', () => {
  const SHOP_COMPONENT_PATH =
    '../../apps/3001-shop/components/exposedTitle.tsx';
  const TEST_MARKER = 'CYPRESS HMR TEST';

  let originalContent: string;

  before(() => {
    // Read and backup original component content
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      originalContent = content;
    });
  });

  after(() => {
    // Restore original content
    if (originalContent) {
      cy.writeFile(SHOP_COMPONENT_PATH, originalContent);
    }
  });

  beforeEach(() => {
    // Ensure we start with original content
    if (originalContent) {
      cy.writeFile(SHOP_COMPONENT_PATH, originalContent);
    }
  });

  it('should detect and apply HMR changes when component files are modified during navigation', () => {
    // Step 1: Visit home page first
    cy.visit('/');
    getH1().contains('This is SPA combined');

    // Step 2: Navigate to shop page (triggers server-side revalidation)
    cy.visit('/shop');
    cy.wait(2000); // Wait for federation to load
    getH1().contains('Shop Page');

    // Verify original content is present
    cy.get('body').should('contain', 'And it works like a charm v2');
    cy.get('body').should('not.contain', TEST_MARKER);

    // Step 3: Modify the shop component file while the page is loaded
    cy.log('Modifying shop component file...');
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const modifiedContent = content.replace(
        /And it works like a charm v2/g,
        `${TEST_MARKER} - Modified at ${Date.now()}`,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
      cy.log('File modified, waiting for HMR detection...');
    });

    // Step 4: Wait for file system change detection
    cy.wait(3000);

    // Step 5: Navigate to trigger server-side revalidation
    cy.visit('/');
    cy.wait(1000);

    // Step 6: Navigate back to shop to see if changes were detected
    cy.visit('/shop');
    cy.wait(2000);

    // Step 7: Verify the changes are reflected
    cy.get('body').should('contain', TEST_MARKER, { timeout: 10000 });
    cy.log('✅ HMR changes detected and applied!');

    // Step 8: Verify persistence - navigate away and back
    cy.visit('/checkout');
    cy.wait(1000);
    getH1().contains('checkout page');

    cy.visit('/shop');
    cy.wait(1000);
    cy.get('body').should('contain', TEST_MARKER);
    cy.log('✅ Changes persist across navigation!');
  });

  it('should trigger HMR revalidation on multiple page visits after file changes', () => {
    // Modify component first
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const testMessage = `${TEST_MARKER} Multi-Visit Test ${Date.now()}`;
      const modifiedContent = content.replace(
        /And it works like a charm v2/g,
        testMessage,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
    });

    // Wait for file system change
    cy.wait(2000);

    // Visit multiple pages to trigger different revalidation scenarios
    const pages = ['/', '/shop', '/checkout', '/shop'];

    pages.forEach((page, index) => {
      cy.log(`Visiting page ${index + 1}: ${page}`);
      cy.visit(page);
      cy.wait(1500);

      if (page === '/shop') {
        cy.get('body').should('contain', TEST_MARKER, { timeout: 10000 });
      }
    });

    cy.log('✅ HMR works across multiple page visits!');
  });

  it('should handle rapid file changes and navigation', () => {
    // Rapid file modifications
    for (let i = 1; i <= 3; i++) {
      cy.log(`Making file change ${i}/3...`);

      cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
        const testMessage = `${TEST_MARKER} Rapid Change ${i} - ${Date.now()}`;
        const modifiedContent = content
          .replace(/And it works like a charm v2/g, testMessage)
          .replace(
            new RegExp(`${TEST_MARKER} Rapid Change \\d+ - \\d+`, 'g'),
            testMessage,
          );

        cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
      });

      cy.wait(1000);

      // Visit shop to trigger revalidation
      cy.visit('/shop');
      cy.wait(1500);

      cy.get('body').should('contain', `${TEST_MARKER} Rapid Change ${i}`, {
        timeout: 10000,
      });
    }

    cy.log('✅ Rapid file changes handled correctly!');
  });

  it('should verify HMR console logging during file changes', () => {
    // Set up console spying
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    // Make file change
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const testMessage = `${TEST_MARKER} Console Test ${Date.now()}`;
      const modifiedContent = content.replace(
        /And it works like a charm v2/g,
        testMessage,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
    });

    // Visit pages to trigger revalidation and console logging
    cy.visit('/');
    cy.wait(1000);
    cy.visit('/shop');
    cy.wait(2000);

    // Check that revalidation console logs were called
    cy.get('@consoleLog').should('have.been.called');

    // Verify content changed
    cy.get('body').should('contain', TEST_MARKER, { timeout: 10000 });

    cy.log('✅ HMR console logging verification complete!');
  });

  it('should test HMR with server-side rendering updates', () => {
    // This test focuses on server-side HMR detection
    cy.log('Testing server-side HMR detection...');

    // Initial request to establish baseline
    cy.request('/shop').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain('And it works like a charm v2');
    });

    // Modify file
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const testMessage = `${TEST_MARKER} SSR Test ${Date.now()}`;
      const modifiedContent = content.replace(
        /And it works like a charm v2/g,
        testMessage,
      );

      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
    });

    // Wait for file system detection
    cy.wait(3000);

    // Make server-side request to trigger revalidation
    cy.request('/shop').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain(TEST_MARKER);
    });

    // Verify in browser too
    cy.visit('/shop');
    cy.wait(1000);
    cy.get('body').should('contain', TEST_MARKER, { timeout: 10000 });

    cy.log('✅ Server-side HMR detection working!');
  });
});
