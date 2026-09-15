const frame = (id) =>
  cy.get(id).its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);
describe('SSR playground', () => {
  it('shows real SSR, keeps old hydration and loads a new release', () => {
    cy.visit('/');
    frame('#old')
      .find('[data-release="v1"]')
      .should('have.attr', 'data-hydrated', 'true');
    frame('#old').find('[aria-label="增加 BPM"]').click();
    frame('#old').find('[data-testid="bpm"]').should('contain', '125');
    cy.get('#v2').click();
    cy.get('#update-result').should('contain', '"entries"');
    cy.get('#reload').click();
    frame('#new')
      .find('[data-release="v2"]')
      .should('have.attr', 'data-hydrated', 'true');
    frame('#new').find('[aria-label="增加 BPM"]').click();
    frame('#new').find('[data-testid="bpm"]').should('contain', '125');
    frame('#old').find('[data-release="v1"]').should('exist');
    cy.intercept('POST', '/api/html*').as('rawHTML');
    cy.get('#html').should('not.be.disabled').click();
    cy.wait('@rawHTML').then(({ response }) => {
      expect(response.statusCode, JSON.stringify(response.body)).to.equal(200);
    });
    cy.get('#source').should('be.visible');
    cy.get('#source-text')
      .should('contain', 'data-release="v2"')
      .and('contain', 'Find your rhythm.');
    cy.get('#close-source').click();
    cy.scrollTo('top', { ensureScrollable: false });
    cy.screenshot('playground-desktop', { capture: 'viewport' });
  });
  it('loads a runtime remote in browser and in subsequent SSR HTML', () => {
    cy.visit('/');
    cy.get('#dynamic').click();
    cy.get('#new').should((f) =>
      expect(f[0].contentDocument.body.textContent).to.contain(
        'dynamic · ENTRY a',
      ),
    );
    frame('#new')
      .find('[data-release]')
      .should('have.attr', 'data-hydrated', 'true');
    frame('#new').contains('button', '加载配色面板').click();
    frame('#new')
      .find('.dynamic [data-testid="palette"]')
      .should('have.attr', 'data-hydrated', 'true');
    frame('#new').find('.dynamic button[aria-label="#72dac8"]').click();
    frame('#new').find('.dynamic .color-field').should('contain', '#72dac8');
    cy.get('#register').click();
    cy.get('#new').should((f) =>
      expect(f[0].contentDocument.body.textContent).to.contain(
        '服务端动态加载',
      ),
    );
    frame('#new')
      .find('.dynamic [data-testid="palette"]')
      .should('have.attr', 'data-hydrated', 'true');
    cy.intercept('POST', '/api/html*').as('rawHTML');
    cy.get('#html').should('not.be.disabled').click();
    cy.wait('@rawHTML').then(({ response }) => {
      expect(response.statusCode, JSON.stringify(response.body)).to.equal(200);
    });
    cy.get('#source').should('be.visible');
    cy.get('#source-text').should('contain', 'Choose a mood.');
    cy.get('#close-source').click();
  });
  it('starts real traffic, releases the held loader and samples the host heap', () => {
    cy.visit('/');
    cy.get('#preset').should('have.value', 'auto');
    cy.get('#run').click();
    cy.get('#release').should('not.be.disabled');
    cy.get('#counters').should('contain', '实际排队');
    cy.get('#traffic-steps .observed').should('contain', '新请求排队');
    cy.get('#run').should('not.be.disabled');
    cy.get('#requests').should('contain', '完成').and('not.contain', '503');
    cy.get('#traffic-story')
      .should('contain', '实验结束')
      .and('contain', '拒绝 0');
    cy.get('#traffic-story').scrollIntoView();
    cy.screenshot('playground-traffic', { capture: 'viewport' });
    cy.get('#preset').select('timeout');
    cy.get('#run').click();
    cy.get('#requests').should('contain', '排队超过 3 秒');
    cy.get('#run').should('not.be.disabled');
    cy.get('#traffic-story').should('contain', '拒绝 9');
    cy.visit('/memory');
    cy.get('#gc').click();
    cy.get('#samples tr')
      .should('have.length.at.least', 1)
      .and('contain', 'true');
    cy.get('#heap-chart circle').should('exist');
    cy.scrollTo('top', { ensureScrollable: false });
    cy.screenshot('playground-memory', { capture: 'viewport' });
    cy.viewport(390, 844);
    cy.screenshot('playground-mobile', { capture: 'viewport' });
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(390),
    );
  });
});
