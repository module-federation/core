import { wait5s, getP, getPre } from '../support/app.po';

describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));

  describe('Remote Resource Error render and will trigger ErrorBoundary', () => {
    Cypress.on('uncaught:exception', () => false);
    it('jump to remote error page', async () => {
      cy.get('.host-menu > li:nth-child(8)').click({ force: true });

      cy.get('[data-test-id="loading"]').should('have.length', 1);
      cy.get('[data-test-id="loading"]')
        .first()
        .should('have.text', 'loading...');

      await wait5s();
      getP().contains('Something went wrong');
      getPre().contains(
        'The request failed three times and has now been abandoned',
      );
    });
  });
});
