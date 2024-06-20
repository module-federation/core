import { getH1, getH3 } from '../support/app.po';

describe('3001-shop/', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Warmup Next', () => {
    xit('warms pages concurrently', () => {
      const urls = [
        '/shop',
        '/checkout',
        '/checkout/test-title',
        '/checkout/test-check-button',
      ];
      urls.forEach((url) => {
        cy.request(url); // This makes a GET request, not a full page visit
      });
    });
  });

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('This is SPA combined');
    });
  });

  describe('Image checks', () => {
    it('should check that the home-webpack-png and shop-webpack-png images are not 404', () => {
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
    it('check that clicking back and forwards in client-side routing still renders the content correctly', () => {
      cy.visit('/shop');
      cy.url().should('include', '/shop');
      cy.wait(3000);
      getH1().contains('Shop Page');
      cy.wait(1000);
      cy.get('.home-menu-link').click();
      cy.wait(1000);
      cy.get('.home-menu-link').click();
      cy.wait(3000);
      cy.url().should('include', '/');
      cy.wait(1000);
      getH1().contains('This is SPA combined');
    });
  });

  describe('3001-shop/checkout', () => {
    beforeEach(() => cy.visit('/checkout'));

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

    describe('3001-shop/checkout/test-title', () => {
      beforeEach(() => cy.visit('/checkout/test-title'));

      it('should display welcome message', () => {
        getH3().contains('This title came');
      });
    });

    describe('3001-shop/checkout/test-check-button', () => {
      beforeEach(() => cy.visit('/checkout/test-check-button'));

      it('should display welcome message', () => {
        cy.get('button').contains('Button');
      });
    });
  });

  describe('3001-shop/shop', () => {
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
