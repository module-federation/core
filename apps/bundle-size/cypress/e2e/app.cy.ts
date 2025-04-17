import { getH1, getH3 } from '../support/app.po';

describe('3005-runtime-host/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('Runtime Demo');
    });
  });

  describe('Image checks', () => {
    it('should check that the home-webpack-png and remote1-webpack-png images are not 404', () => {
      // Get the src attribute of the home-webpack-png image
      cy.get('img.home-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          cy.log(src);
          cy.request(src).its('status').should('eq', 200);
        });

      // Get the src attribute of the shop-webpack-png image
      cy.get('img.remote1-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          // Send a GET request to the src URL
          cy.request(src).its('status').should('eq', 200);
        });
    });

    it('should check that the home-webpack-svg and remote1-webpack-svg images are not 404', () => {
      // Get the src attribute of the home-webpack-png image
      cy.get('img.home-webpack-svg')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          cy.log(src);
          cy.request(src).its('status').should('eq', 200);
        });

      // Get the src attribute of the shop-webpack-png image
      cy.get('img.remote1-webpack-svg')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          // Send a GET request to the src URL
          cy.request(src).its('status').should('eq', 200);
        });
    });
  });

  describe('Shared react hook check', () => {
    it('should display text which comes from remote1 hook', () => {
      cy.get('.remote1-text')
        .invoke('html')
        .should('equal', 'Custom hook from localhost:3006 works!');
    });
  });

  describe('dynamic remote check', () => {
    describe('dynamic-remote/ButtonOldAnt', () => {
      it('should display remote button', () => {
        cy.get('button.test-remote2').contains('Button');
      });
      it('should use host shared(antd)', () => {
        cy.get('button.test-remote2').contains('Button from antd@4.24.15');
      });
    });
  });
});
