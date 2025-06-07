import { getH1, getH2, getH3 } from '../support/app.po';

describe('ssr with fetch data', () => {
  it('[ /basic ] - should render in server side and fetch data from server', () => {
    cy.visit('/basic');
    cy.wait(3000);
    cy.url().should('include', '/basic');
    getH2().contains('[ provider - server ] fetched data');

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
});
