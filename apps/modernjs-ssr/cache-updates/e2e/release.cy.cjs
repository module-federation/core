describe('release hydration', () => {
  afterEach(() => {
    cy.request({ url: '/__release-update', failOnStatusCode: false });
  });
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

  it('keeps server loaders gated when a CSR page still needs server data', () => {
    cy.request('/__update?v=v2');
    cy.request('/__hold-update').its('body.phase').should('eq', 'updating');
    cy.intercept('GET', /__loader=/).as('csrLoader');
    cy.visit('/?updatePolicy=csr');
    cy.wait('@csrLoader').then(({ response }) => {
      expect(response.statusCode).to.eq(503);
      expect(response.body).to.contain(
        'CSR fallback requires an HTML navigation',
      );
    });
    cy.get('#remote-counter').should('not.exist');
    cy.request('/__release-update').its('status').should('eq', 200);
    cy.visit('/');
    cy.get('#remote-counter').should('have.text', 'v1:0');
  });

  it('mounts a data-independent client route while SSR publication is held', () => {
    cy.request('/__update?v=v2');
    cy.request('/__hold-update').its('body.phase').should('eq', 'updating');
    cy.request('/client?updatePolicy=csr').then((response) => {
      expect(response.headers['x-modernjs-render']).to.eq('client');
      expect(response.headers['cache-control']).to.eq('no-store');
      expect(response.body).not.to.contain('id="remote-counter"');
      const release = JSON.parse(
        response.body.match(/data-modern-mf-release>(.*?)<\/script>/)[1],
      );
      expect(release.remotes[0].entry).to.contain('/v2/');
    });
    cy.visit('/client?updatePolicy=csr', {
      onBeforeLoad(win) {
        cy.spy(win.console, 'error').as('csrErrors');
      },
    });
    cy.get('#remote-counter')
      .should('have.attr', 'data-hydrated', 'true')
      .should('have.text', 'v2:0')
      .click()
      .should('have.text', 'v2:1');
    cy.get('@csrErrors').should('not.have.been.called');
    cy.request('/__release-update').its('status').should('eq', 200);
    cy.request('/').its('body').should('contain', 'v1');
  });
});
