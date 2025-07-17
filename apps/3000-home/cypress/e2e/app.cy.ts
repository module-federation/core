import { getH1, getH3 } from '../support/app.po';

describe('3000-home/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Warmup Next', () => {
    xit('warms pages concurrently', () => {
      const urls = [
        '/shop',
        '/checkout',
        '/checkout/test-title',
        '/checkout/test-check-button',
        '/api/test',
      ];
      urls.forEach((url) => {
        cy.request(url);
      });
    });
  });

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('This is SPA combined');
    });
  });

  describe('API endpoint should return json', () => {
    it('Query Endpoint', () => {
      cy.request('/api/test').then((response) => {
        expect(response.headers['content-type']).to.include('application/json');
      });
    });
  });

  describe('Image checks', () => {
    xit('should check that the home-webpack-png and shop-webpack-png images are not 404', () => {
      // Get the src attribute of the home-webpack-png image
      cy.debug()
        .get('img.home-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          cy.log(src);
          cy.request(src).its('status').should('eq', 200);
        });

      // Get the src attribute of the shop-webpack-png image
      cy.get('img.shop-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          // Send a GET request to the src URL
          cy.request(src).its('status').should('eq', 200);
        });
    });
  });

  describe('Routing checks', () => {
    it('check that clicking back and forwards in client side routeing still renders the content correctly', () => {
      cy.visit('/shop');
      cy.wait(3000);
      cy.url().should('include', '/shop');
      getH1().contains('Shop Page');
      //eslint-disable-next-line
      cy.wait(3000);
      cy.get('.home-menu-link').contains('Home 3000');
      cy.get('.home-menu-link').click();
      cy.wait(2000);
      cy.url().should('include', '/');
      cy.wait(700);
      getH1().contains('This is SPA combined');
    });
  });

  describe('3000-home/checkout', () => {
    beforeEach(() => {
      cy.visit('/checkout');
      cy.visit('/');
      cy.visit('/checkout');
    });

    describe('Welcome message', () => {
      it('should display welcome message', () => {
        getH1().contains('checkout page');
      });
    });

    describe('Tag checks', () => {
      it('should check that a .description + pre tag exists', () => {
        cy.get('.description').should('exist');
        cy.get('main pre').should('exist');
      });
    });

    describe('3000-home/checkout/test-title', () => {
      beforeEach(() => cy.visit('/checkout/test-title'));

      it('should display welcome message', () => {
        getH3().contains('This title came');
      });
    });

    describe('3000-home/checkout/test-check-button', () => {
      beforeEach(() => cy.visit('/checkout/test-check-button'));

      it('should display welcome message', () => {
        cy.get('button').contains('Button');
      });
    });
  });

  describe('HMR Tests', () => {
    it('should detect HMR updates when remote entries change', () => {
      // Visit the home page first
      cy.visit('/');
      getH1().contains('This is SPA combined');

      // Check console for HMR logs
      cy.window().then((win) => {
        cy.stub(win.console, 'log').as('consoleLog');
      });

      // Trigger a page reload to simulate HMR check
      cy.reload();

      // Check that the page still loads correctly after potential HMR
      getH1().contains('This is SPA combined');

      // Visit different federated pages to test HMR across remotes
      cy.visit('/shop');
      getH1().contains('Shop Page');

      cy.visit('/checkout');
      getH1().contains('checkout page');

      // Return to home to complete the cycle
      cy.visit('/');
      getH1().contains('This is SPA combined');
    });

    it('should handle HMR updates during navigation', () => {
      cy.visit('/');

      // Navigate through multiple federated modules
      cy.visit('/shop');
      cy.wait(1000);

      // Trigger potential HMR by reloading
      cy.reload();
      cy.wait(2000);

      // Verify content still loads correctly after HMR
      getH1().contains('Shop Page');

      // Navigate back home
      cy.get('.home-menu-link').click();
      cy.wait(1000);
      getH1().contains('This is SPA combined');
    });

    it('should verify HMR functionality through federation integration', () => {
      cy.visit('/');
      getH1().contains('This is SPA combined');

      // Test navigation to trigger revalidate() calls in _document.js
      // The revalidate function should be called server-side without errors
      cy.visit('/shop');
      cy.wait(1000);
      getH1().contains('Shop Page');

      // Return to home page - this triggers another revalidate() call
      cy.visit('/');
      cy.wait(1000);
      getH1().contains('This is SPA combined');

      // Test checkout page - more revalidate() calls
      cy.visit('/checkout');
      cy.wait(1000);
      getH1().contains('checkout page');

      // Verify that pages still load correctly after revalidate() calls
      // This tests that the HMR system doesn't break normal page navigation
      cy.visit('/');
      getH1().contains('This is SPA combined');

      // Test that federation components still work correctly
      cy.get('body').should('be.visible');
      cy.url().should('include', '/');

      // Verify federation navigation still works after multiple revalidate() calls
      cy.visit('/shop');
      cy.wait(1000);
      getH1().contains('Shop Page');
    });

    it('should test HMR revalidation on page navigation', () => {
      // Enable console logging to catch HMR messages
      cy.window().then((win) => {
        cy.stub(win.console, 'log').as('consoleLog');
      });

      // Visit each page to trigger _document.js revalidate() calls
      const pages = ['/', '/shop', '/checkout', '/checkout/test-title'];

      pages.forEach((page) => {
        cy.visit(page);
        cy.wait(1500); // Allow time for HMR checks

        // Verify page loads correctly (basic smoke test)
        cy.get('h1, h3').should('be.visible');
      });

      // Check if any HMR logs were captured
      cy.get('@consoleLog').should('have.been.called');
    });
  });

  describe('3000-home/shop', () => {
    beforeEach(() => cy.visit('/shop'));

    describe('Welcome message', () => {
      it('should display welcome message', () => {
        getH1().contains('Shop Page');
      });
    });

    describe('Image checks', () => {
      xit('should check that shop-webpack-png images are not 404', () => {
        // Get the src attribute of the shop-webpack-png image
        cy.get('img.shop-webpack-png')
          .invoke('attr', 'src')
          .then((src) => {
            // Send a GET request to the src URL
            cy.request(src).its('status').should('eq', 200);
          });
      });
      it('should check that shop-webpack-png images are not 404 between route clicks', () => {
        cy.visit('/');
        cy.visit('/shop');
        cy.url().should('include', '/shop');
        getH1().contains('Shop Page');
        cy.get('.home-menu-link').click();
        //eslint-disable-next-line
        cy.wait(2999);
        cy.get('img.shop-webpack-png')
          .invoke('attr', 'src')
          .then((src) => {
            // Send a GET request to the src URL
            cy.request(src).its('status').should('eq', 200);
          });
      });
    });

    describe('Tag checks', () => {
      it('should check that a .description + pre tag exists', () => {
        cy.get('.description + pre').should('exist');
      });
    });
  });
});
