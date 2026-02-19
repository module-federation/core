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
      // should load remote successfully
      // load manifest provider component
      cy.get('#loadManifestProvider').should('be.visible').click();
      cy.get('#3011-rspack-manifest-provider', { timeout: 60000 }).should(
        'exist',
      );

      // load js entry provider component
      cy.get('#loadJSEntryProvider').should('be.visible').click();
      cy.get('#3012-rspack-js-entry-provider', { timeout: 60000 }).should(
        'exist',
      );

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
        assert(manifestTime > 0, 'manifest time should be recorded');
        assert(jsEntryTime > 0, 'js entry time should be recorded');
        assert(
          manifestTime <= jsEntryTime + 200,
          `manifest time should not be significantly slower than js entry time (manifest: ${manifestTime}, js entry: ${jsEntryTime})`,
        );
      });
    });
  });
});
