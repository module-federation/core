describe('/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Check page status', () => {
    it('should display remote content', () => {
      cy.contains('h1', 'Remote Content').should('exist');
      cy.contains('button', 'provider button', { timeout: 10000 }).should(
        'exist',
      );
      cy.contains('p', 'Start building amazing things with Rsbuild.', {
        timeout: 10000,
      }).should('exist');
      cy.get('.ant-badge', { timeout: 10000 }).should('exist');
      cy.get('.ant-badge').contains('25').should('exist');
    });
    it('should display host content', () => {
      cy.contains('h1', 'Consumer Content').should('exist');
      cy.contains('button', 'Toggle disabled').should('exist');
      cy.get('.ant-switch').should('have.class', 'ant-switch-disabled');
      cy.get('.ant-switch').should('have.class', 'ant-switch-checked');
      cy.contains('button', 'Toggle disabled').click();
      cy.get('.ant-switch').should('not.have.class', 'ant-switch-disabled');
    });
  });

  describe('Check shared treeShaking', () => {
    it('should load treeShaking shared if set strategy "infer"', () => {
      cy.window().should((win) => {
        const shared =
          win.__FEDERATION__?.__SHARE__['mf_host:0.1.34'].default.antd['6.0.1'];
        expect(shared).to.exist;
        expect(shared.treeShaking.strategy).to.equal('infer');
        expect(shared.treeShaking.loaded).to.equal(true);
        expect(Object.keys(shared.treeShaking.lib()).sort()).to.deep.equal([
          'Badge',
          'Button',
          'Divider',
          'Space',
          'Switch',
        ]);
      });
    });

    it('should has full shared fallback in shared.get"', () => {
      cy.window()
        .then((win) => {
          const shared =
            win.__FEDERATION__?.__SHARE__['mf_host:0.1.34'].default.antd[
              '6.0.1'
            ];
          expect(shared).to.exist;
          expect(Boolean(shared.loaded)).to.equal(false);
          expect(Boolean(shared.get)).to.equal(true);
          return cy.wrap(shared.get());
        })
        .then((fallbackGetter) => {
          expect(Object.keys((fallbackGetter as any)()).sort()).to.deep.equal([
            'Affix',
            'Alert',
            'Anchor',
            'App',
            'AutoComplete',
            'Avatar',
            'BackTop',
            'Badge',
            'Breadcrumb',
            'Button',
            'Calendar',
            'Card',
            'Carousel',
            'Cascader',
            'Checkbox',
            'Col',
            'Collapse',
            'ColorPicker',
            'ConfigProvider',
            'DatePicker',
            'Descriptions',
            'Divider',
            'Drawer',
            'Dropdown',
            'Empty',
            'Flex',
            'FloatButton',
            'Form',
            'Grid',
            'Image',
            'Input',
            'InputNumber',
            'Layout',
            'List',
            'Masonry',
            'Mentions',
            'Menu',
            'Modal',
            'Pagination',
            'Popconfirm',
            'Popover',
            'Progress',
            'QRCode',
            'Radio',
            'Rate',
            'Result',
            'Row',
            'Segmented',
            'Select',
            'Skeleton',
            'Slider',
            'Space',
            'Spin',
            'Splitter',
            'Statistic',
            'Steps',
            'Switch',
            'Table',
            'Tabs',
            'Tag',
            'TimePicker',
            'Timeline',
            'Tooltip',
            'Tour',
            'Transfer',
            'Tree',
            'TreeSelect',
            'Typography',
            'Upload',
            'Watermark',
            'message',
            'notification',
            'theme',
            'unstableSetRender',
            'version',
          ]);
        });
    });
  });
});
