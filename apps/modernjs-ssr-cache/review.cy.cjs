const memo = () =>
  cy
    .get('iframe[title="出行备忘"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
const ready = () =>
  cy.get('[data-testid="forecast"][data-hydrated="true"]').should('exist');
const record = () => {
  memo().contains('button', '记录一次').click();
};
const state = () => cy.request('/__weather/state').its('body');
describe('One Modern host: weather SSR updates', () => {
  it('preserves host memo on selective updates and hydrates the replacement', () => {
    cy.visit('/tomorrow');
    ready();
    cy.request('/tomorrow')
      .its('body')
      .should('contain', 'data-release="v1"')
      .and('contain', '26');
    cy.contains('button', '切换到 °F').click();
    cy.get('[data-testid="temperature"]').should('contain', '78.8');
    record();
    memo().find('[data-testid="memo-count"]').should('have.text', '1');
    record();
    memo().find('[data-testid="memo-count"]').should('have.text', '2');
    cy.contains('button', '更新预报').should('not.be.disabled').click();
    cy.get('[data-testid="forecast"]').should(
      'have.attr',
      'data-release',
      'v2',
    );
    ready();
    memo().find('[data-testid="memo-count"]').should('have.text', '2');
    cy.get('[data-testid="update-result"]').should('contain', '出行备忘保留');
    cy.contains('button', '切换到 °F').click();
    cy.get('[data-testid="temperature"]').should('contain', '64.4');
    state().then((s) => {
      expect(s.result.mode).eq('entries');
      expect(s.result.beforeMemo.id).eq(s.result.afterMemo.id);
      expect(s.result.before.pid).eq(s.result.after.pid);
      expect(s.result.after.heapUsed).greaterThan(0);
      expect(s.result.after.gcMs).greaterThan(0);
    });
    cy.get('iframe').should('have.length', 1);
    cy.screenshot('weather-selective', { capture: 'viewport' });
  });
  it('loads the second remote on the server and rebuilds the same host', () => {
    cy.visit('/day-after');
    ready();
    cy.get('[data-testid="forecast"]').should(
      'have.attr',
      'data-release',
      'v1',
    );
    cy.request('/day-after')
      .its('body')
      .should('contain', '多云')
      .and('contain', 'data-release="v1"');
    cy.contains('button', '切换到 °F').click();
    cy.get('[data-testid="temperature"]').should('contain', '71.6');
    memo().find('[data-testid="memo-count"]').should('have.text', '2');
    cy.contains('button', '更新预报').should('not.be.disabled').click();
    cy.get('[data-testid="forecast"]').should(
      'have.attr',
      'data-release',
      'v2',
    );
    ready();
    memo().find('[data-testid="memo-count"]').should('have.text', '0');
    cy.get('[data-testid="update-result"]').should('contain', '重新初始化');
    cy.contains('button', '切换到 °F').click();
    cy.get('[data-testid="temperature"]').should('contain', '60.8');
    state().then((s) => {
      expect(s.result.mode).eq('application');
      expect(s.result.beforeMemo.id).not.eq(s.result.afterMemo.id);
      expect(s.result.before.pid).eq(s.result.after.pid);
    });
    cy.screenshot('weather-full', { capture: 'viewport' });
    cy.contains('a', '明天').click();
    ready();
    cy.contains('已启用服务端动态消费').should('exist');
    cy.contains('button', '重置体验').click();
    cy.contains('静态消费天气组件').should('exist');
    ready();
    record();
    memo().find('[data-testid="memo-count"]').should('have.text', '1');
    cy.contains('button', '更新预报').should('not.be.disabled').click();
    cy.get('[data-testid="update-result"]').should('contain', '出行备忘保留');
    state().then((s) => expect(s.result.mode).eq('entries'));
  });
  it('keeps main results in one desktop screen and supports mobile', () => {
    cy.visit('/tomorrow');
    ready();
    cy.get('[data-testid="memory-result"]').then(($e) => {
      expect($e[0].getBoundingClientRect().bottom).lessThan(800);
    });
    cy.document().then((d) =>
      expect(d.documentElement.scrollWidth).at.most(1280),
    );
    const updates = [];
    cy.intercept('POST', '/__weather/update', (req) =>
      req.on('response', (res) => updates.push(res)),
    ).as('weatherUpdate');
    cy.contains('summary', '高级观察').click();
    cy.contains('button', '连续更新 20 次').click();
    cy.wrap(null, { timeout: 90000 }).should(() =>
      expect(updates.length).eq(20),
    );
    cy.get('[data-testid="forecast"][data-hydrated="true"]').should('exist');
    state().then((s) => {
      expect(s.history).have.length(20);
      for (const r of s.history) {
        expect(r.mode).eq('entries');
        expect(r.beforeMemo.id).eq(r.afterMemo.id);
        expect(r.before.pid).eq(r.after.pid);
      }
    });
    cy.then(() => {
      for (const r of updates) expect(r.statusCode).eq(200);
    });
    cy.viewport(390, 844);
    cy.document().then((d) =>
      expect(d.documentElement.scrollWidth).at.most(390),
    );
    cy.screenshot('weather-mobile', { capture: 'fullPage' });
  });
});
