import { getH2, getH3 } from '../support/app.po';

describe('router-host-2000/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH2().contains('Router host Home page');
    });
  });
});
