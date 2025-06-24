import { getH1 } from '../support/app.po';

describe('Second Load Hydration Validation', () => {
  const SHOP_PAGE_PATH = '../../apps/3001-shop/pages/shop/index.tsx';
  const TEST_MARKER = 'SECOND_LOAD_TEST';
  
  let originalContent: string;

  before(() => {
    // Backup original content
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      originalContent = content;
    });
  });

  after(() => {
    // Restore original content
    if (originalContent) {
      cy.writeFile(SHOP_PAGE_PATH, originalContent);
    }
  });

  beforeEach(() => {
    // Reset to original content before each test
    if (originalContent) {
      cy.writeFile(SHOP_PAGE_PATH, originalContent);
      cy.wait(1000);
    }
  });

  it('should prevent hydration errors on second page load after content modification', () => {
    const testId = Date.now();
    const newContent = `${TEST_MARKER}_${testId}`;
    
    cy.log('🎯 CRITICAL TEST: Second page load after modification');
    
    // Step 1: First page load (baseline)
    cy.log('📍 Step 1: Initial page load');
    cy.visit('/shop');
    cy.wait(2000);
    getH1().contains('Shop Page');
    
    // Verify we have the original content (noting the current content from user modification)
    cy.get('body').should('contain', 'HYDRATION FIX TEST 123');
    cy.get('body').should('not.contain', TEST_MARKER);
    
    // Step 2: Modify the content while page is loaded
    cy.log('📍 Step 2: Modifying content during page session');
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      // Replace the current content that includes "HYDRATION FIX TEST 123"
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001 \(HYDRATION FIX TEST 123\)/g,
        `This is a federated page owned by localhost:3001 (${newContent})`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
      cy.log(`✏️ Content modified to include: ${newContent}`);
    });

    // Step 3: Wait for HMR detection and processing
    cy.log('📍 Step 3: Waiting for HMR processing');
    cy.wait(3000);

    // Step 4: Navigate away to trigger server-side revalidation
    cy.log('📍 Step 4: Triggering server-side revalidation');
    cy.visit('/');
    cy.wait(2000);
    getH1().contains('This is SPA combined');

    // Step 5: CRITICAL - Second page load (this is where hydration errors typically occur)
    cy.log('🚨 CRITICAL STEP 5: Second page load - hydration validation');
    
    // Set up strict hydration error monitoring
    cy.window().then((win) => {
      let hydrationErrorDetected = false;
      
      // Monitor for hydration errors
      win.addEventListener('error', (e) => {
        if (e.message && (
          e.message.includes('hydration') || 
          e.message.includes('Hydration') ||
          e.message.includes('Text content does not match server-rendered HTML')
        )) {
          hydrationErrorDetected = true;
          cy.log(`❌ HYDRATION ERROR ON SECOND LOAD: ${e.message}`);
          throw new Error(`CRITICAL: Hydration error on second load: ${e.message}`);
        }
      });
      
      // Monitor console for React hydration warnings
      const originalConsoleError = win.console.error;
      const originalConsoleWarn = win.console.warn;
      
      win.console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('hydration') || 
            message.includes('Text content does not match') ||
            message.includes('server-rendered HTML')) {
          hydrationErrorDetected = true;
          cy.log(`❌ CONSOLE ERROR - HYDRATION: ${message}`);
          throw new Error(`CRITICAL: Console hydration error: ${message}`);
        }
        originalConsoleError.apply(win.console, args);
      };
      
      win.console.warn = (...args) => {
        const message = args.join(' ');
        if (message.includes('hydration') || message.includes('Hydration')) {
          cy.log(`⚠️ CONSOLE WARNING - HYDRATION: ${message}`);
          // Warnings are logged but don't fail the test
        }
        originalConsoleWarn.apply(win.console, args);
      };
    });

    // Perform the critical second load
    cy.visit('/shop');
    cy.wait(3000); // Give extra time for any hydration issues to surface

    // Step 6: Verify content updated correctly without hydration errors
    cy.log('📍 Step 6: Verifying content consistency');
    cy.get('body').should('contain', newContent, { timeout: 10000 });
    cy.get('body').should('not.contain', 'HYDRATION FIX TEST 123'); // Old content should be gone
    
    // Step 7: Additional validation - third load to ensure persistence
    cy.log('📍 Step 7: Third load validation');
    cy.visit('/checkout');
    cy.wait(1000);
    
    cy.visit('/shop'); // Third load
    cy.wait(2000);
    cy.get('body').should('contain', newContent);
    
    cy.log('✅ SUCCESS: Second load completed without hydration errors!');
  });

  it('should handle server-client content synchronization on second load', () => {
    const syncTestId = Date.now();
    const syncContent = `SYNC_TEST_${syncTestId}`;
    
    cy.log('🎯 Testing server-client synchronization on second load');
    
    // First load
    cy.visit('/shop');
    cy.wait(2000);
    
    // Modify content
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001 \(HYDRATION FIX TEST 123\)/g,
        `This is a federated page owned by localhost:3001 (${syncContent})`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
    });

    // Wait for server-side processing
    cy.wait(4000);

    // Verify server-side content updated
    cy.request('/shop').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.contain(syncContent);
      cy.log('✅ Server-side content updated');
    });

    // Second load - critical hydration test
    cy.visit('/shop');
    
    // Monitor for the specific "Text content does not match" error
    cy.window().then((win) => {
      win.addEventListener('error', (e) => {
        if (e.message && e.message.includes('Text content does not match server-rendered HTML')) {
          const serverContent = e.message.match(/Server: "(.*?)"/)?.[1] || 'unknown';
          const clientContent = e.message.match(/Client: "(.*?)"/)?.[1] || 'unknown';
          
          cy.log(`❌ HYDRATION MISMATCH DETECTED:`);
          cy.log(`   Server rendered: ${serverContent}`);
          cy.log(`   Client expected: ${clientContent}`);
          
          throw new Error(`CRITICAL: Server-client content mismatch detected`);
        }
      });
    });

    cy.wait(3000);
    
    // Verify client content matches server content
    cy.get('body').should('contain', syncContent, { timeout: 10000 });
    
    cy.log('✅ Server-client synchronization successful on second load!');
  });

  it('should validate DOM consistency across multiple second loads', () => {
    const consistencyTestId = Date.now();
    const consistencyContent = `CONSISTENCY_${consistencyTestId}`;
    
    cy.log('🎯 Testing DOM consistency across multiple second loads');
    
    // Modify content first
    cy.readFile(SHOP_PAGE_PATH).then((content) => {
      const modifiedContent = content.replace(
        /This is a federated page owned by localhost:3001 \(HYDRATION FIX TEST 123\)/g,
        `This is a federated page owned by localhost:3001 (${consistencyContent})`
      );
      
      cy.writeFile(SHOP_PAGE_PATH, modifiedContent);
    });

    cy.wait(3000);

    // Perform multiple second loads to test consistency
    for (let i = 1; i <= 3; i++) {
      cy.log(`🔄 Second load iteration ${i}/3`);
      
      // Navigate away
      cy.visit('/');
      cy.wait(1000);
      
      // Second load of shop page
      cy.visit('/shop');
      
      // Set up error monitoring for this iteration
      cy.window().then((win) => {
        win.addEventListener('error', (e) => {
          if (e.message && e.message.includes('hydration')) {
            throw new Error(`Hydration error on iteration ${i}: ${e.message}`);
          }
        });
      });
      
      cy.wait(2000);
      
      // Verify consistent content
      cy.get('body').should('contain', consistencyContent, { timeout: 8000 });
      
      // Capture and log DOM state for debugging
      cy.get('h3.title').then(($el) => {
        const titleText = $el.text().trim();
        cy.log(`Iteration ${i} title: ${titleText}`);
        expect(titleText).to.contain(consistencyContent);
      });
    }
    
    cy.log('✅ DOM consistency maintained across multiple second loads!');
  });
});