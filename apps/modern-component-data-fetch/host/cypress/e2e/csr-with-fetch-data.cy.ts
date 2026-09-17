import { getH2 } from '../support/app.po';

describe('csr with fetch data', () => {
  it('[ /csr ] - should render in client side and fetch data from server', () => {
    cy.visit('/csr');
    cy.wait(3000);
    cy.url().should('include', '/csr');
    getH2().contains('[ csr provider - server ] fetched data');

    const stub = cy.stub();
    cy.on('window:alert', stub);

    cy.get('#provider-csr-btn')
      .should('be.visible')
      .click()
      .then(() => {
        expect(stub.getCall(0)).to.be.calledWith(
          '[provider-csr-btn] Client side Javascript works!',
        );
      });

    // it only render in client side, so it not have downgrade identifier
    cy.window().then((win) => {
      expect(win.globalThis._mfSSRDowngrade).to.not.exist;
    });
  });

  it('[ /csr ] - should load a CSR component without a data loader once', () => {
    cy.visit('/csr');

    cy.get('#provider-csr-without-data-loader').should('be.visible');
    cy.window().then((win) => {
      const metrics = (
        win as typeof win & {
          __MF_NO_DATA_METRICS__: {
            loaderCalls: number;
          };
        }
      ).__MF_NO_DATA_METRICS__;

      expect(metrics.loaderCalls).to.equal(1);
    });
  });
});
