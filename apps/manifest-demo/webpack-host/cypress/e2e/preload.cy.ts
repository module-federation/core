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
      cy.wait(4000);
      cy.document().then((doc) => {
        const html = doc.body ? doc.body.innerHTML : 'NO BODY';
        // eslint-disable-next-line no-console
        console.log('DEBUG_PRELOAD_HTML: ' + html.substring(0, 1000));
        const suspense =
          doc.querySelector('[data-testid]') || doc.body.textContent;
        // eslint-disable-next-line no-console
        console.log(
          'DEBUG_PRELOAD_TEXT: ' +
            (doc.body.textContent || '').substring(0, 500),
        );
      });
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
