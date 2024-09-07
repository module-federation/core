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
