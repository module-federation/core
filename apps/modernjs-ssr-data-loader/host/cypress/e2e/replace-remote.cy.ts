import { getH1, getH3 } from '../support/app.po';

describe('/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Warmup ModernJS', () => {
    it('warms pages concurrently', () => {
      const urls = ['/remote', '/dynamic-remote'];
      urls.forEach((url) => {
        cy.request(url); // This makes a GET request, not a full page visit
      });
    });
  });

  describe('/remote', () => {
    beforeEach(() => {
      cy.visit('/remote');
    });

    it('should support replace new remote', () => {
      cy.wait(2000);
      cy.get('button#remote-replace-button').should('be.visible').click();
      cy.wait(2000);

      cy.get('#new-remote-components').contains('remote');
      cy.get('#new-remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('button#new-remote-components-button')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[new-remote-components-button] Client side Javascript works!',
          );
        });
    });
  });

  describe('/dynamic-remote', () => {
    beforeEach(() => {
      cy.visit('/dynamic-remote');
    });

    it('should support replace new dynamic remote', () => {
      cy.wait(2000);

      cy.get('#dynamic-remote-replace-button').should('be.visible').click();
      cy.wait(2000);

      cy.get('#new-dynamic-remote-components').contains(
        'dynamic remote new version',
      );
      cy.get('#new-dynamic-remote-components-image').should(
        'have.attr',
        'src',
        'https://module-federation.io/module-federation-logo.svg',
      );

      const stub = cy.stub();
      cy.on('window:alert', stub);

      cy.get('#new-dynamic-remote-components-button')
        .click()
        .then(() => {
          expect(stub.getCall(0)).to.be.calledWith(
            '[new-dynamic-remote-components-button] Client side Javascript works!',
          );
        });
    });
  });
});
