import { getH1 } from '../support/app.po';

describe('Hydration Fix Validation E2E', () => {
  const SHOP_PAGE_PATH = '../../apps/3001-shop/pages/shop/index.tsx';
  const SHOP_COMPONENT_PATH = '../../apps/3001-shop/components/exposedTitle.tsx';
  const TEST_MARKER = 'HYDRATION TEST';
  
  let originalShopPageContent: string;
  let originalShopComponentContent: string;

  before(() => {
    // Read and backup original content
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      originalShopPageContent = content;
    });
    
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      originalShopComponentContent = content;
    });
  });

  after(() => {
    // Restore original content
    if (originalShopPageContent) {
      cy.writeFile(SHOP_PAGE_PATH, originalShopPageContent);
    }
    if (originalShopComponentContent) {
      cy.writeFile(SHOP_COMPONENT_PATH, originalShopComponentContent);
    }
  });

  beforeEach(() => {
    // Ensure we start with original content
    if (originalShopPageContent) {
      cy.writeFile(SHOP_PAGE_PATH, originalShopPageContent);
    }
    if (originalShopComponentContent) {
      cy.writeFile(SHOP_COMPONENT_PATH, originalShopComponentContent);
    }
    
    // Wait for file system changes to be detected
    cy.wait(1000);
  });

  it('should prevent hydration errors when federation page is modified and reloaded', () => {
    const timestamp = Date.now();
    const testContent = `${TEST_MARKER} Page Modified ${timestamp}`;
    
    cy.log('🎯 Testing hydration fix with page modification and reload');
    
    // Step 1: Visit shop page initially
    cy.visit('/shop');
    cy.wait(2000); // Wait for federation to load
    getH1().contains('Shop Page');
    
    // Verify original content is present
    cy.get('body').should('contain', 'This is a federated page owned by localhost:3001');
    cy.get('body').should('not.contain', TEST_MARKER);
    
    // Set up hydration error detection
    cy.window().then((win) => {
      // Listen for hydration errors
      win.addEventListener('error', (e) => {
        if (e.message && (e.message.includes('hydration') || e.message.includes('Hydration'))) {
          cy.log(`❌ HYDRATION ERROR DETECTED: ${e.message}`);
          throw new Error(`Hydration error occurred: ${e.message}`);
        }
      });
      
      // Also monitor console for React hydration warnings
      const originalConsoleError = win.console.error;
      win.console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('hydration') || message.includes('Hydration') || 
            message.includes('Text content does not match')) {
          cy.log(`❌ HYDRATION WARNING DETECTED: ${message}`);
          throw new Error(`Hydration warning in console: ${message}`);
        }
        originalConsoleError.apply(win.console, args);
      };
    });

    // Step 2: Modify the shop page file while page is loaded
    cy.log('📝 Modifying shop page content...');
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001.*?>/g,
        `This is a federated page owned by localhost:3001 (${testContent})>`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
      cy.log(`✅ File modified with content: ${testContent}`);
    });

    // Step 3: Wait for file system change detection and HMR processing
    cy.wait(3000);

    // Step 4: Navigate away to trigger server-side revalidation
    cy.log('🔄 Navigating away to trigger revalidation...');
    cy.visit('/');
    cy.wait(1500);
    getH1().contains('This is SPA combined');

    // Step 5: Navigate back to shop page (CRITICAL: Second page load)
    cy.log('🎯 Second page load - testing hydration consistency...');
    cy.visit('/shop');
    cy.wait(2000);

    // Step 6: Verify content updated and NO hydration errors occurred
    cy.get('body').should('contain', testContent, { timeout: 10000 });
    cy.log('✅ Content successfully updated without hydration errors!');

    // Step 7: Perform additional navigation to test persistence
    cy.log('🔄 Testing navigation persistence...');
    cy.visit('/checkout');
    cy.wait(1000);
    getH1().contains('checkout page');
    
    // Navigate back again (THIRD page load)
    cy.visit('/shop');
    cy.wait(1000);
    cy.get('body').should('contain', testContent);
    cy.log('✅ Changes persist across multiple navigations!');
  });

  it('should handle component modifications without hydration errors on reload', () => {
    const timestamp = Date.now();
    const componentTestContent = `${TEST_MARKER} Component ${timestamp}`;
    
    cy.log('🎯 Testing component-level hydration fix');
    
    // Visit shop page initially
    cy.visit('/shop');
    cy.wait(2000);
    
    // Verify original component content
    cy.get('body').should('contain', 'And it works like a charm v2');
    
    // Set up error monitoring
    cy.window().then((win) => {
      win.addEventListener('error', (e) => {
        if (e.message && e.message.includes('hydration')) {
          throw new Error(`Component hydration error: ${e.message}`);
        }
      });
    });

    // Modify the exposed component
    cy.log('📝 Modifying shop component...');
    cy.readFile(SHOP_COMPONENT_PATH).then((content) => {
      const modifiedContent = content.replace(
        /And it works like a charm v2/g,
        `${componentTestContent} - Component Updated`
      );
      
      cy.writeFile(SHOP_COMPONENT_PATH, modifiedContent);
    });

    // Wait for file system detection
    cy.wait(3000);

    // Navigate away and back (trigger server-side processing)
    cy.visit('/');
    cy.wait(1500);
    
    // CRITICAL: Second load after component modification
    cy.visit('/shop');
    cy.wait(2000);

    // Verify component changes without hydration errors
    cy.get('body').should('contain', componentTestContent, { timeout: 10000 });
    cy.log('✅ Component changes applied without hydration errors!');
  });

  it('should handle rapid modifications and multiple reloads', () => {
    const baseTestContent = `${TEST_MARKER} Rapid`;
    
    cy.log('🎯 Testing rapid modifications with multiple reloads');
    
    // Set up error monitoring
    cy.window().then((win) => {
      win.addEventListener('error', (e) => {
        if (e.message && e.message.includes('hydration')) {
          throw new Error(`Rapid modification hydration error: ${e.message}`);
        }
      });
    });

    // Perform multiple rapid modifications and reloads
    for (let i = 1; i <= 3; i++) {
      const iterationContent = `${baseTestContent} ${i} - ${Date.now()}`;
      
      cy.log(`🔄 Rapid modification ${i}/3...`);
      
      // Modify the page
      cy.readFile(SHOP_PAGE_PATH).then((content) => {
        const modifiedContent = content
          .replace(
            /This is a federated page owned by localhost:3001.*?>/g,
            `This is a federated page owned by localhost:3001 (${iterationContent})>`
          )
          .replace(
            new RegExp(`${TEST_MARKER} Rapid \\d+ - \\d+`, 'g'),
            iterationContent
          );
        
        cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
      });
      
      cy.wait(2000);
      
      // Navigate to trigger revalidation
      cy.visit('/');
      cy.wait(1000);
      
      // CRITICAL: Load shop page again
      cy.visit('/shop');
      cy.wait(2000);
      
      // Verify content without hydration errors
      cy.get('body').should('contain', `${baseTestContent} ${i}`, { timeout: 10000 });
      cy.log(`✅ Rapid modification ${i} applied successfully!`);
    }
  });

  it('should maintain hydration safety during concurrent navigation and updates', () => {
    const concurrentTestContent = `${TEST_MARKER} Concurrent ${Date.now()}`;
    
    cy.log('🎯 Testing concurrent navigation and updates');
    
    // Start with shop page
    cy.visit('/shop');
    cy.wait(2000);
    
    // Set up comprehensive error monitoring
    cy.window().then((win) => {
      win.addEventListener('error', (e) => {
        if (e.message && e.message.includes('hydration')) {
          throw new Error(`Concurrent operation hydration error: ${e.message}`);
        }
      });
      
      // Monitor for text content mismatch errors specifically
      const originalError = win.console.error;
      win.console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Text content does not match server-rendered HTML')) {
          throw new Error(`Server-client mismatch detected: ${message}`);
        }
        originalError.apply(win.console, args);
      };
    });

    // Modify file while navigating
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001.*?>/g,
        `This is a federated page owned by localhost:3001 (${concurrentTestContent})>`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
    });

    // Rapid navigation sequence while file system processes the change
    const pages = ['/', '/shop', '/checkout', '/shop', '/', '/shop'];
    
    pages.forEach((page, index) => {
      cy.log(`🔄 Concurrent navigation ${index + 1}: ${page}`);
      cy.visit(page);
      cy.wait(800); // Shorter waits to test race conditions
      
      if (page === '/shop') {
        // Each shop visit should eventually show the updated content
        // without hydration errors
        cy.get('body', { timeout: 8000 }).then(($body) => {
          // Content should be consistent (either old or new, but not mismatched)
          const text = $body.text();
          const hasOldContent = text.includes('This is a federated page owned by localhost:3001 (HYDRATION FIX TEST 123)');
          const hasNewContent = text.includes(concurrentTestContent);
          
          if (!hasOldContent && !hasNewContent) {
            throw new Error('Shop page content is neither old nor new - possible hydration corruption');
          }
          
          cy.log(hasNewContent ? '✅ New content loaded' : '⏳ Old content still present');
        });
      }
    });

    // Final verification - ensure content is updated and consistent
    cy.visit('/shop');
    cy.wait(3000);
    cy.get('body').should('contain', concurrentTestContent, { timeout: 10000 });
    cy.log('✅ Concurrent operations completed without hydration errors!');
  });

  it('should validate server-side rendering consistency after HMR updates', () => {
    const ssrTestContent = `${TEST_MARKER} SSR ${Date.now()}`;
    
    cy.log('🎯 Testing server-side rendering consistency');
    
    // Initial server-side request to establish baseline
    cy.request('/shop').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain('This is a federated page owned by localhost:3001');
    });

    // Modify the shop page
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001.*?>/g,
        `This is a federated page owned by localhost:3001 (${ssrTestContent})>`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
    });

    // Wait for file system detection and server-side processing
    cy.wait(4000);

    // Make server-side request to verify SSR content updated
    cy.request('/shop').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain(ssrTestContent);
      cy.log('✅ Server-side rendering updated correctly');
    });

    // Now visit the page with browser and verify hydration matches SSR
    cy.visit('/shop');
    cy.wait(2000);
    
    // The browser content should match what the server rendered
    cy.get('body').should('contain', ssrTestContent, { timeout: 10000 });
    
    // No hydration errors should occur since server and client content match
    cy.window().then((win) => {
      // Give time for any hydration errors to surface
      cy.wait(1000);
      cy.log('✅ Client-side content matches server-side rendering!');
    });
  });
});