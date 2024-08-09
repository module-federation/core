import { getPre, getP } from '../support/app.po';

describe('router-remote-error in host', () => {
  beforeEach(() => cy.visit('/'));
  describe('Remote Error render and will trigger ErrorBoundary', () => {
    Cypress.on('uncaught:exception', () => false);
    it('jump to remote error page', () => {
      cy.get('.host-menu > li:nth-child(7)').click();
      getP().contains('Something went wrong');
      getPre().contains('This is a deliberately thrown error');
    });
  });
});
