import { getH1, getH2, getH3 } from '../support/app.po';

declare global {
  interface Window {
    globalThis: {
      _mfSSRDowngrade?: boolean | string[];
    };
  }
}

describe('/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('Welcome message from host');
    });
  });

  // check that clicking back and forwards in client side routeing still renders the content correctly
  describe('Routing checks', () => {
    it('[ /basic ] - should render in client side and fetch data from server side', () => {
      // wait nav hydration
      cy.wait(3000);
      cy.get('.basic').parent().click();
      cy.url().should('include', '/basic');
      getH2().contains('[ provider - client ] fetched data');

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#provider-btn')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[provider] Client side Javascript works!',
          );
        });

      cy.window().then((win) => {
        expect(win.globalThis._mfSSRDowngrade).to.not.exist;
      });
    });

    it('[ /client-downgrade ] - should render in client side and load data.client.js to fetch data', () => {
      cy.wait(3000);
      cy.get('.client-downgrade').parent().click();
      cy.url().should('include', '/client-downgrade');
      getH2().contains('fetch data from provider client');

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#client-downgrade-btn')
        .should('be.visible')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[client-downgrade] Client side Javascript works!',
          );
        });
      cy.window().then((win) => {
        expect(win.globalThis._mfSSRDowngrade).to.not.exist;
      });
    });
  });
});
