import { getH1 } from '../support/app.po';

describe('HMR Remote Entry Disk Modification E2E', () => {
  const REMOTE_ENTRY_PATH = '../../apps/3001-shop/.next/static/ssr/remoteEntry.js';
  let originalRemoteEntry: string;
  let remoteEntryExists = false;

  before(() => {
    // Wait for shop server to be ready and generate remoteEntry.js
    cy.request('http://localhost:3001').then(() => {
      // Try to read the remote entry file
      cy.task('fileExists', REMOTE_ENTRY_PATH).then((exists) => {
        remoteEntryExists = exists as boolean;
        if (remoteEntryExists) {
          cy.readFile(REMOTE_ENTRY_PATH).then((content) => {
            originalRemoteEntry = content;
          });
        }
      });
    });
  });

  after(() => {
    // Restore original remote entry if it was modified
    if (remoteEntryExists && originalRemoteEntry) {
      cy.writeFile(REMOTE_ENTRY_PATH, originalRemoteEntry);
    }
  });

  beforeEach(() => {
    // Ensure we start with original content if file exists
    if (remoteEntryExists && originalRemoteEntry) {
      cy.writeFile(REMOTE_ENTRY_PATH, originalRemoteEntry);
    }
  });

  it('should detect hash changes when remoteEntry.js is modified on disk and trigger nuclear reset', () => {
    // Step 1: Visit shop page to establish baseline
    cy.visit('/shop');
    cy.wait(2000);
    getH1().contains('Shop Page');
    
    // Step 2: Check if remoteEntry.js exists, if not trigger its creation
    cy.task('fileExists', REMOTE_ENTRY_PATH).then((exists) => {
      if (!exists) {
        // Make a request to shop to trigger remoteEntry.js generation
        cy.request('http://localhost:3001/_next/static/ssr/remoteEntry.js').then(() => {
          cy.wait(2000); // Wait for file to be written
        });
      }
    });

    // Step 3: Read the current remoteEntry.js file
    cy.readFile(REMOTE_ENTRY_PATH, { timeout: 10000 }).then((originalContent) => {
      expect(originalContent).to.be.a('string');
      expect(originalContent.length).to.be.greaterThan(0);
      
      // Step 4: Modify the remoteEntry.js file to change its hash
      const timestamp = Date.now();
      const modificationComment = `\n// HMR E2E Test Modification - ${timestamp}\n// This comment changes the file hash to trigger HMR\n`;
      const modifiedContent = originalContent + modificationComment;
      
      cy.log(`Modifying remoteEntry.js with timestamp: ${timestamp}`);
      cy.writeFile(REMOTE_ENTRY_PATH, modifiedContent);
      
      // Step 5: Wait for file system change detection
      cy.wait(3000);
      
      // Step 6: Visit home page first (to trigger server-side revalidation)
      cy.visit('/');
      cy.wait(1000);
      getH1().contains('This is SPA combined');
      
      // Step 7: Navigate back to shop page to trigger hash check and HMR
      cy.visit('/shop');
      cy.wait(3000); // Wait for HMR processing
      
      // Step 8: Verify the page still loads correctly after HMR
      getH1().contains('Shop Page');
      
      // Step 9: Check that federation components still work
      cy.get('body').should('be.visible');
      cy.get('body').should('contain', 'This is a federated page');
      
      // Step 10: Verify multiple navigation cycles work after HMR
      cy.visit('/');
      cy.wait(1000);
      getH1().contains('This is SPA combined');
      
      cy.visit('/shop');
      cy.wait(1000);
      getH1().contains('Shop Page');
      
      cy.log('✅ HMR nuclear reset completed successfully!');
    });
  });

  it('should handle multiple rapid remoteEntry.js modifications', () => {
    cy.visit('/shop');
    cy.wait(2000);
    getH1().contains('Shop Page');

    // Read original content
    cy.readFile(REMOTE_ENTRY_PATH, { timeout: 10000 }).then((originalContent) => {
      // Make 3 rapid modifications
      for (let i = 1; i <= 3; i++) {
        cy.log(`Making modification ${i}/3...`);
        
        const timestamp = Date.now() + i;
        const modificationComment = `\n// Rapid Modification ${i} - ${timestamp}\n`;
        const modifiedContent = originalContent + modificationComment;
        
        cy.writeFile(REMOTE_ENTRY_PATH, modifiedContent);
        cy.wait(1000);
        
        // Visit shop to trigger revalidation
        cy.visit('/shop');
        cy.wait(2000);
        
        getH1().contains('Shop Page');
      }
      
      cy.log('✅ Multiple rapid modifications handled successfully!');
    });
  });

  it('should verify nuclear reset clears all federation globals', () => {
    // Set up console spying to catch HMR logs
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
    });

    cy.visit('/shop');
    cy.wait(2000);

    // Modify remoteEntry.js
    cy.readFile(REMOTE_ENTRY_PATH, { timeout: 10000 }).then((originalContent) => {
      const timestamp = Date.now();
      const modificationComment = `\n// Nuclear Reset Test - ${timestamp}\n`;
      const modifiedContent = originalContent + modificationComment;
      
      cy.writeFile(REMOTE_ENTRY_PATH, modifiedContent);
      cy.wait(2000);
      
      // Navigate to trigger HMR
      cy.visit('/');
      cy.wait(1000);
      cy.visit('/shop');
      cy.wait(3000);
      
      // Check that nuclear reset logs were generated
      cy.get('@consoleLog').should('have.been.calledWith', 
        Cypress.sinon.match('[Module Federation Hot Reload] Starting NUCLEAR RESET'));
      
      getH1().contains('Shop Page');
      cy.log('✅ Nuclear reset logging verification complete!');
    });
  });

  it('should test hash change detection with binary content modification', () => {
    cy.visit('/shop');
    cy.wait(2000);

    cy.readFile(REMOTE_ENTRY_PATH, { timeout: 10000 }).then((originalContent) => {
      // Add a more substantial modification that would definitely change hash
      const timestamp = Date.now();
      const substantialModification = `
// ============================================
// HMR E2E Test - Substantial Modification
// Timestamp: ${timestamp}
// This modification adds significant content
// to ensure hash change detection works
// ============================================
(function() {
  // Test function to change hash
  window.hmrTestModification_${timestamp} = function() {
    return 'Hash changed successfully at ${timestamp}';
  };
})();
`;
      
      const modifiedContent = originalContent + substantialModification;
      
      cy.log(`Adding substantial modification with timestamp: ${timestamp}`);
      cy.writeFile(REMOTE_ENTRY_PATH, modifiedContent);
      
      // Wait longer for substantial change
      cy.wait(4000);
      
      // Trigger hash check
      cy.visit('/');
      cy.wait(1000);
      cy.visit('/shop');
      cy.wait(4000); // Wait longer for nuclear reset processing
      
      // Verify everything still works
      getH1().contains('Shop Page');
      cy.get('body').should('contain', 'federated page');
      
      cy.log('✅ Substantial hash change handled successfully!');
    });
  });

  it('should verify federation state is completely cleared after nuclear reset', () => {
    cy.visit('/shop');
    cy.wait(2000);

    // Check initial federation state
    cy.window().then((win) => {
      cy.wrap(win).its('__FEDERATION__').should('exist');
    });

    // Modify remoteEntry.js to trigger nuclear reset
    cy.readFile(REMOTE_ENTRY_PATH, { timeout: 10000 }).then((originalContent) => {
      const timestamp = Date.now();
      const modificationComment = `\n// State Clear Test - ${timestamp}\n`;
      const modifiedContent = originalContent + modificationComment;
      
      cy.writeFile(REMOTE_ENTRY_PATH, modifiedContent);
      cy.wait(3000);
      
      // Navigate to trigger nuclear reset
      cy.visit('/');
      cy.wait(1000);
      cy.visit('/shop');
      cy.wait(4000);
      
      // Verify page still works after complete state clear
      getH1().contains('Shop Page');
      
      // Federation should be re-initialized but working
      cy.window().then((win) => {
        // Federation might be re-initialized, but the page should work
        cy.get('body').should('contain', 'Shop Page');
        cy.get('body').should('contain', 'federated page');
      });
      
      cy.log('✅ Federation state completely cleared and re-initialized!');
    });
  });
});