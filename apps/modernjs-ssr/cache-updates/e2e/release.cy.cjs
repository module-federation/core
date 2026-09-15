describe('release hydration', () => {
  it('pins old and new HTML', () => {
    let old;
    cy.request('/').then((r) => {
      old = r.body;
      expect(old).to.contain('v1');
    });
    cy.visit('/');
    cy.get('body').should((b) => expect(b.text()).to.contain('v1:0'));
    cy.get('#remote-counter')
      .should('have.attr', 'data-hydrated', 'true')
      .should('have.text', 'v1:0')
      .click()
      .should('have.text', 'v1:1');
    cy.request('/__update?v=v2').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.mode).to.eq('application');
    });
    cy.request('/').its('body').should('contain', 'v2');
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'error').as('errors');
      },
    });
    cy.get('#remote-counter')
      .should('have.attr', 'data-hydrated', 'true')
      .should('have.text', 'v2:0')
      .click()
      .should('have.text', 'v2:1');
    cy.get('@errors').should('not.have.been.called');
    cy.then(() =>
      cy.intercept('GET', Cypress.config('baseUrl') + '/', {
        statusCode: 200,
        headers: { 'content-type': 'text/html' },
        body: old,
      }),
    );
    cy.visit('/', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'error').as('oldErrors');
      },
    });
    cy.get('#remote-counter')
      .should('have.attr', 'data-hydrated', 'true')
      .should('have.text', 'v1:0')
      .click()
      .should('have.text', 'v1:1');
    cy.get('@oldErrors').should('not.have.been.called');
  });
});
