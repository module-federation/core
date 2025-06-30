import { getH1, getH2, getH3 } from '../support/app.po';

declare global {
  interface Window {
    globalThis: {
      _mfSSRDowngrade?: boolean | string[];
    };
  }
}

describe('downgrade', () => {
  beforeEach(() => {
    // the page will hydrate failed and downgrade, so catch the error, keep on testing
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  it('[ /client-downgrade ] - should downgrade load data.client.js to fetch data', () => {
    cy.visit('/client-downgrade');
    cy.wait(3000);
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
      expect(win.globalThis._mfSSRDowngrade).to.exist;
    });
  });

  it('[ /server-downgrade ] - should downgrade and fetch data from server', () => {
    cy.visit('/server-downgrade');
    cy.wait(3000);
    cy.url().should('include', '/server-downgrade');
    getH2().contains('[ provider - server - ServerDowngrade]');

    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#server-downgrade-btn')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          '[server-downgrade] Client side Javascript works!',
        );
      });
    cy.window().then((win) => {
      console.log(win);
      expect(win.globalThis._mfSSRDowngrade).to.exist;
    });
  });
});
