describe('React remote input routing parity', () => {
  it('identifies the provider through manifest rendering metadata', () => {
    cy.request('http://localhost:2006/mf-manifest.json').then(({ body }) => {
      const expose = body.exposes.find(
        (item: { path: string }) => item.path === './export-app',
      );
      expect(expose, 'remote6/export-app metadata').to.exist;
      expect(expose.render).to.equal('bridge');
    });
  });

  for (const variant of [
    'loader-auto',
    'loader-explicit',
    'string-auto',
    'string-explicit',
  ]) {
    it(`${variant} preserves deep links, host updates, remote links and history`, () => {
      const basename = `/router-parity/${variant}`;
      const assertLocation = (remote: string, host = true) => {
        cy.location().should((location) => {
          expect(location.pathname + location.search + location.hash).to.equal(
            basename + remote,
          );
        });
        cy.get('[data-testid="remote6-location"]').should('have.text', remote);
        if (host) {
          cy.get('[data-testid="parity-host-location"]').should(
            'have.text',
            basename + remote,
          );
        }
      };

      cy.visit(`${basename}/about?from=direct#initial`);
      cy.contains('Remote6 about page').should('be.visible');
      assertLocation('/about?from=direct#initial');

      cy.get('[data-testid="parity-host-detail"]').click();
      cy.contains('Remote6 detail page').should('be.visible');
      assertLocation('/detail?from=host#first');

      // A query/hash-only update must reach the existing remote Router too.
      cy.get('[data-testid="parity-host-query"]').click();
      assertLocation('/detail?from=host-query#second');

      cy.get('[data-testid="parity-remote-about"]')
        .should('have.attr', 'href', `${basename}/about?from=remote#third`)
        .click();
      cy.contains('Remote6 about page').should('be.visible');
      // The legacy browser-history bridge does not promise an immediate host
      // Router notification for a push initiated by the remote Router.
      assertLocation('/about?from=remote#third', false);

      cy.go('back');
      cy.contains('Remote6 detail page').should('be.visible');
      assertLocation('/detail?from=host-query#second');
      cy.go('forward');
      cy.contains('Remote6 about page').should('be.visible');
      assertLocation('/about?from=remote#third');
    });
  }
});
