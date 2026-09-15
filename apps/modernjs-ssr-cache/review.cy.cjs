function frame(title) {
  return cy
    .get('iframe[title="' + title + '"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
}
function checkBModuleUpdate(update, rebuilt) {
  frame('B 入口 · 新请求的页面').find('[data-hydrated="true"]').should('exist');
  frame('B 入口 · 新请求的页面')
    .find('[data-testid="evidence"]')
    .invoke('text')
    .then((text) => {
      const before = JSON.parse(text);
      cy.get('iframe[title="B 入口 · 新请求的页面"]')
        .invoke('attr', 'src')
        .then((src) => {
          update();
          cy.get('iframe[title="B 入口 · 新请求的页面"]').should(
            'not.have.attr',
            'src',
            src,
          );
          frame('B 入口 · 新请求的页面')
            .find('[data-testid="evidence"]')
            .should(($data) => {
              const after = JSON.parse($data.text());
              expect(after.requestId).not.to.equal(before.requestId);
              expect(after.pid).to.equal(before.pid);
              if (rebuilt)
                expect(after.loaderModuleInstance).not.to.equal(
                  before.loaderModuleInstance,
                );
              else {
                expect(after.loaderModuleInstance).to.equal(
                  before.loaderModuleInstance,
                );
                expect(after.loaderCalls).to.be.greaterThan(before.loaderCalls);
              }
            });
        });
    });
}
describe('Modern-native SSR review demo', () => {
  it('renders the console itself with Modern SSR, then updates real host hydration', () => {
    cy.request('/').its('body').should('contain', '此控制台由 Modern SSR 渲染');
    cy.visit('/');
    frame('保留的旧页面').find('[data-hydrated="true"]').should('exist');
    frame('保留的旧页面').find('[aria-label="增加 BPM"]').click();
    frame('保留的旧页面').find('[data-testid="bpm"]').should('contain', '125');
    checkBModuleUpdate(
      () =>
        cy.contains('button', '更新到 v2').should('not.be.disabled').click(),
      false,
    );
    cy.get('iframe[title="新请求的页面"]').should((f) =>
      expect(
        f[0].contentDocument.body.querySelector('[data-release="v2"]'),
      ).not.to.equal(null),
    );
    frame('新请求的页面').find('[data-hydrated="true"]').should('exist');
    frame('保留的旧页面').find('[data-testid="bpm"]').should('contain', '125');
    cy.contains('button', '查看真实 HTML').click();
    cy.get('[role="dialog"]').should('contain', 'data-release="v2"');
    cy.contains('button', '关闭').click();
    cy.screenshot('modern-console', { capture: 'fullPage' });
  });
  it('loads a dynamic remote in the browser and then includes it in SSR', () => {
    cy.visit('/');
    cy.contains('button', '动态 Host').click();
    frame('新请求的页面').find('[data-hydrated="true"]').should('exist');
    frame('新请求的页面').contains('button', '加载配色面板').click();
    frame('新请求的页面').should('contain', 'Choose a mood.');
    checkBModuleUpdate(
      () => cy.contains('button', '注册动态 Remote 并 SSR').click(),
      true,
    );
    cy.contains('button', '查看真实 HTML').should('not.be.disabled').click();
    cy.get('[role="dialog"]').should('contain', 'Choose a mood.');
    cy.contains('button', '关闭').click();
    cy.get('[data-testid="experiment"]').click();
    cy.get('[data-testid="traffic-window"] .waiting').should('have.length', 4);
    cy.get('[data-testid="experiment"]').should('not.be.disabled');
    for (const title of ['A1 · /', 'A2 · /', 'A3 · /', 'B1 · /b'])
      frame(title).find('[data-hydrated="true"]').should('exist');
    cy.contains('.metrics span', '拒绝').find('b').should('have.text', '0');
  });
  it('opens a real iframe during update, allows unaffected B, and samples memory', () => {
    cy.visit('/');
    cy.contains('button', '静态 Host').click();
    cy.get('[data-testid="experiment"]').click();
    cy.get('[data-testid="traffic-window"] .waiting').should('be.visible');
    cy.get('[data-testid="experiment"]').should('not.be.disabled');
    cy.get('[data-testid="traffic-window"] iframe').should('have.length', 4);
    for (const label of ['A1', 'A2', 'A3'])
      frame(label + ' · /')
        .find('[data-hydrated="true"]')
        .should('exist');
    frame('B1 · /b').should('contain', 'Choose a mood.');
    frame('A1 · /').should('contain', 'Find your rhythm.');
    frame('A1 · /').find('[data-hydrated="true"]').should('exist');
    frame('A1 · /').find('[aria-label="增加 BPM"]').click();
    frame('A1 · /').find('[data-testid="bpm"]').should('contain', '125');
    cy.get('[data-testid="traffic-window"]').screenshot('modern-update-window');
    cy.contains('label', '模式').find('select').select('manual');
    cy.get('[data-testid="experiment"]').click();
    frame('B1 · /b').find('[data-hydrated="true"]').should('exist');
    cy.get('[data-testid="traffic-window"] .waiting').should('have.length', 3);
    cy.get('[data-testid="phase"]').should('contain', 'draining');
    cy.contains('button', '释放旧请求').click();
    cy.get('[data-testid="experiment"]').should('not.be.disabled');
    cy.contains('button', '内存观察').click();
    frame('手动内存对比的 SSR 页面')
      .find('[data-hydrated="true"]')
      .should('exist');
    cy.get('[data-testid="memory-update"]').then(($button) => {
      const target = $button.text().includes('v2') ? 'v2' : 'v1';
      cy.wrap($button).click();
      frame('手动内存对比的 SSR 页面')
        .find('[data-release="' + target + '"][data-hydrated="true"]')
        .should('exist');
      cy.get('[data-testid="memory-update"]')
        .should('not.be.disabled')
        .and('contain', target === 'v2' ? 'v1' : 'v2');
    });
    cy.contains('button', 'GC 后采样').click();
    cy.get('tbody').should('contain', 'true');
    const pages = [];
    cy.intercept('GET', '**/?id=memory-*', (req) => {
      req.on('response', (res) =>
        pages.push({
          url: req.url,
          status: res.statusCode,
          html: String(res.body),
        }),
      );
    });
    cy.contains('button', '运行 20 次更新').click();
    cy.get('[data-testid="memory-window"] iframe').should('exist');
    cy.get('[data-testid="memory-progress"]', { timeout: 60000 }).should(
      'contain',
      '已完成 20 / 20',
    );
    cy.contains('button', '运行 20 次更新').should('not.be.disabled');
    cy.get('[data-testid="memory-cycles"] tbody tr').should('have.length', 20);
    cy.then(() => {
      expect(pages).to.have.length(20);
      expect(new Set(pages.map((page) => page.url)).size).to.equal(20);
      pages.forEach((page, index) => {
        expect(page.status).to.equal(200);
        expect(page.html).to.contain(
          'data-release="' + (index % 2 ? 'v1' : 'v2') + '"',
        );
      });
    });
    frame('本轮内存实验的 SSR 页面')
      .find('[data-hydrated="true"]')
      .should('exist');
    cy.get('[data-testid="memory-window"]').screenshot('memory-update-window');
    cy.viewport(390, 844);
    cy.document().then((doc) =>
      expect(doc.documentElement.scrollWidth).to.be.at.most(390),
    );
    cy.screenshot('modern-memory-mobile', { capture: 'viewport' });
  });
});
