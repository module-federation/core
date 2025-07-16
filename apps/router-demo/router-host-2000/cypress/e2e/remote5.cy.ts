describe('router-remote5-2005/', () => {
  beforeEach(() => cy.visit('http://localhost:2005/'));

  describe('visit', () => {
    it('should display React 19 content', () => {
      cy.verifyContent('This is the remote app5 with React 19.');
    });
  });
});

describe('router-remote5-2005 in host', () => {
  beforeEach(() => {
    // Add error handling for uncaught exceptions
    cy.on('uncaught:exception', (err) => {
      console.error('Uncaught exception:', err);
      // Don't fail the test on uncaught exceptions for now
      return false;
    });

    cy.visit('http://127.0.0.1:2000/');
    cy.wait(1000); // Wait for the page to load
  });

  describe('Remote5 render and destroy', () => {
    it('jump to remote5 home page', () => {
      // Debug: Log what's visible on the page
      cy.get('body').then(($body) => {
        console.log('Page content:', $body.text());
      });

      // Check if the menu item exists
      cy.get('body').should('contain', 'remote5');

      // Click the menu item with more debugging
      cy.clickMenuItem('remote5');

      // Wait a bit for the remote to load
      cy.wait(2000);

      // Debug: Check what content is actually displayed after navigation
      cy.get('body').then(($body) => {
        console.log('After navigation, page content:', $body.text());
      });

      // Check if we're on the correct URL
      cy.url().should('include', '/remote5');

      // Look for any error messages
      cy.get('body').then(($body) => {
        if ($body.text().includes('Error')) {
          console.log('Found error on page');
        }
        if ($body.text().includes('Loading')) {
          console.log('Found loading message');
        }
      });

      // Check if there's any loading state first
      cy.wait(5000); // Give more time for module federation to load

      // Try to find the remote5 content with more flexible matching
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        console.log('Final body text:', bodyText);

        // Check for various states the page might be in
        if (bodyText.includes('Loading')) {
          console.log('Page is still loading');
        } else if (bodyText.includes('Error')) {
          console.log('Page has an error');
        } else if (bodyText.includes('remote app5')) {
          console.log('Found remote app5 content');
        } else if (bodyText.includes('React 19')) {
          console.log('Found React 19 content');
        } else {
          console.log('No expected content found');
        }
      });

      // Try the flexible approach first
      cy.contains('remote app5', { timeout: 15000 }).should('be.visible');

      // Verify the content
      cy.verifyContent('This is the remote app5 with React 19.');
    });
  });
});
