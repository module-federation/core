import { getH1, getH2 } from '../support/app.po';

describe('3013-webpack-host/preload', () => {
  beforeEach(() => cy.visit('/preload'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH2().contains('MF runtime can preload assets with');
    });
  });

  describe('Manifest provider will load component more quickly than js entry provider', () => {
    it('manifest provider will load component more quickly than js entry provider', () => {
      // simulate browser idle time
      cy.wait(2000);

      // should load remote successfully
      // load manifest provider component
      cy.get('#loadManifestProvider').click();
      cy.wait(2000);
      cy.get('#3011-rspack-manifest-provider').should('exist');

      // load js entry provider component
      cy.get('#loadJSEntryProvider').click();
      cy.wait(2000);
      cy.get('#3012-rspack-js-entry-provider').should('exist');

      // manifest provider will load component more quickly than js entry provider
      let manifestTime = 0;
      let jsEntryTime = 0;
      cy.get('#manifest-time')
        .invoke('text')
        .then((text) => {
          manifestTime = parseFloat(text);
        });

      cy.get('#js-entry-time')
        .invoke('text')
        .then((text) => {
          jsEntryTime = parseFloat(text);
        });

      cy.then(() => {
        assert(
          manifestTime < jsEntryTime,
          'manifest time should be less than js entry time',
        );
      });
    });
  });
});
