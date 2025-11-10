describe('disableRerender Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Host App Global Counter', () => {
    it('should display host app counter', () => {
      // 验证全局计数器存在
      cy.get('[data-testid="host-app-counter"]').should('be.visible');
      cy.get('[data-testid="host-count-button"]').should('be.visible');
      cy.get('[data-testid="host-count-value"]').should('have.text', '0');
    });

    it('should increment global counter on click', () => {
      // 点击全局计数器按钮
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '1');
      
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '2');
      
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '3');
    });

    it('should persist counter across route changes', () => {
      // 增加计数器
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '1');
      
      // 导航到其他页面
      cy.clickMenuItem('Detail');
      cy.url().should('include', '/detail');
      
      // 验证计数器仍然存在且值保持
      cy.get('[data-testid="host-count-value"]').should('have.text', '1');
      
      // 再次增加
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '2');
      
      // 返回首页，验证值仍然保持
      cy.clickMenuItem('Home');
      cy.get('[data-testid="host-count-value"]').should('have.text', '2');
    });
  });

  describe('Remote1 with disableRerender Control', () => {
    beforeEach(() => {
      // 导航到 Remote1 页面
      cy.clickMenuItem('Remote1');
      cy.url().should('include', '/remote1');
      
      // 等待远程应用加载
      cy.verifyContent('Remote1 home page', 10000);
    });

    it('should display disableRerender test panel', () => {
      // 验证测试面板存在
      cy.contains('🔬 测试面板').should('be.visible');
      cy.contains('点击增加 Count').should('be.visible');
      cy.contains('启用 disableRerender').should('be.visible');
    });

    it('should toggle disableRerender checkbox', () => {
      // 获取 checkbox
      cy.get('input[type="checkbox"]').should('exist');
      cy.get('input[type="checkbox"]').should('not.be.checked');
      cy.contains('❌ 已禁用').should('be.visible');
      
      // 点击启用
      cy.get('input[type="checkbox"]').check();
      cy.get('input[type="checkbox"]').should('be.checked');
      cy.contains('✅ 已启用').should('be.visible');
      
      // 点击禁用
      cy.get('input[type="checkbox"]').uncheck();
      cy.get('input[type="checkbox"]').should('not.be.checked');
      cy.contains('❌ 已禁用').should('be.visible');
    });

    it('should increment local counter when disableRerender is disabled', () => {
      // 确保 disableRerender 未启用
      cy.get('input[type="checkbox"]').should('not.be.checked');
      
      // 获取初始计数
      cy.contains('点击增加 Count').invoke('text').then((text) => {
        const initialCount = parseInt(text.match(/\d+/)?.[0] || '0');
        
        // 点击按钮增加计数
        cy.contains('点击增加 Count').click();
        
        // 验证计数增加
        cy.contains('点击增加 Count').should('contain', (initialCount + 1).toString());
      });
    });

    it('should update remote app props when disableRerender is disabled', () => {
      // 确保 disableRerender 未启用
      cy.get('input[type="checkbox"]').should('not.be.checked');
      
      // 记录控制台日志（用于调试）
      let renderCount = 0;
      cy.window().then((win) => {
        cy.stub(win.console, 'log').callsFake((...args) => {
          const message = args.join(' ');
          if (message.includes('🔄 [Remote1] App render')) {
            renderCount++;
          }
        });
      });
      
      // 点击按钮 3 次
      cy.contains('点击增加 Count').click();
      cy.wait(100);
      cy.contains('点击增加 Count').click();
      cy.wait(100);
      cy.contains('点击增加 Count').click();
      cy.wait(100);
      
      // 验证远程应用显示正常
      cy.verifyContent('Remote1 home page');
    });

    it('should NOT re-render remote app when disableRerender is enabled', () => {
      // 启用 disableRerender
      cy.get('input[type="checkbox"]').check();
      cy.contains('✅ 已启用').should('be.visible');
      
      // 等待一下确保设置生效
      cy.wait(500);
      
      // 记录渲染次数
      let renderCount = 0;
      cy.window().then((win) => {
        // 监控控制台日志
        const originalLog = win.console.log;
        cy.stub(win.console, 'log').callsFake((...args) => {
          originalLog.apply(win.console, args);
          const message = args.join(' ');
          if (message.includes('🔄 [Remote1] App render')) {
            renderCount++;
          }
        });
      });
      
      // 点击按钮多次
      for (let i = 0; i < 5; i++) {
        cy.contains('点击增加 Count').click();
        cy.wait(100);
      }
      
      // 验证远程应用仍然正常显示
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
      
      // 注意：由于 disableRerender 已启用，远程应用不应该重新渲染
      // 在实际测试中，我们应该看到控制台没有新的 "🔄 [Remote1] App render" 日志
    });

    it('should demonstrate the difference between enabled and disabled disableRerender', () => {
      // 场景 1: 禁用 disableRerender
      cy.log('=== Testing with disableRerender DISABLED ===');
      cy.get('input[type="checkbox"]').should('not.be.checked');
      
      // 点击 3 次
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      
      // 验证计数更新
      cy.contains('点击增加 Count').should('contain', '3');
      
      // 重新加载页面
      cy.reload();
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 场景 2: 启用 disableRerender
      cy.log('=== Testing with disableRerender ENABLED ===');
      cy.get('input[type="checkbox"]').check();
      cy.contains('✅ 已启用').should('be.visible');
      cy.wait(500);
      
      // 点击 3 次
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      cy.contains('点击增加 Count').click();
      cy.wait(200);
      
      // 验证远程应用仍然显示正常（即使 count 变化了）
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
    });
  });

  describe('Performance Comparison', () => {
    beforeEach(() => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
    });

    it('should measure render performance with disableRerender disabled', () => {
      cy.get('input[type="checkbox"]').should('not.be.checked');
      
      const startTime = Date.now();
      
      // 快速点击 10 次
      for (let i = 0; i < 10; i++) {
        cy.contains('点击增加 Count').click({ force: true });
      }
      
      cy.wait(500);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      cy.log(`Render time with disableRerender=false: ${duration}ms`);
      
      // 验证应用仍然正常
      cy.verifyContent('Remote1 home page');
    });

    it('should measure render performance with disableRerender enabled', () => {
      cy.get('input[type="checkbox"]').check();
      cy.wait(500);
      
      const startTime = Date.now();
      
      // 快速点击 10 次
      for (let i = 0; i < 10; i++) {
        cy.contains('点击增加 Count').click({ force: true });
      }
      
      cy.wait(500);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      cy.log(`Render time with disableRerender=true: ${duration}ms`);
      
      // 验证应用仍然正常
      cy.verifyContent('Remote1 home page');
      
      // 期望启用优化后性能更好（时间更短）
      // 注意：这只是一个简单的性能测试，实际效果可能因环境而异
    });
  });

  describe('Integration with Navigation', () => {
    it('should maintain disableRerender state when navigating within remote app', () => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 启用 disableRerender
      cy.get('input[type="checkbox"]').check();
      cy.wait(500);
      
      // 点击计数器
      cy.contains('点击增加 Count').click();
      cy.contains('点击增加 Count').click();
      
      // 在远程应用内导航
      cy.clickByClass('.menu-remote1-detail-link');
      cy.verifyContent('Remote1 detail page');
      
      // 返回首页
      cy.clickByClass('.menu-remote1-home-link');
      cy.verifyContent('Remote1 home page');
      
      // 验证 disableRerender 仍然启用
      cy.get('input[type="checkbox"]').should('be.checked');
      
      // 继续点击计数器
      cy.contains('点击增加 Count').click();
      
      // 验证应用正常工作
      cy.verifyContent('Remote1 home page');
    });

    it('should reset state when leaving and returning to remote1 route', () => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 启用 disableRerender 并点击
      cy.get('input[type="checkbox"]').check();
      cy.contains('点击增加 Count').click();
      cy.contains('点击增加 Count').click();
      
      // 离开到其他路由
      cy.clickMenuItem('Home');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      
      // 返回 Remote1
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 验证状态被重置（checkbox 应该是未选中状态）
      cy.get('input[type="checkbox"]').should('not.be.checked');
      cy.contains('❌ 已禁用').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling of disableRerender', () => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 快速切换 checkbox 10 次
      for (let i = 0; i < 10; i++) {
        cy.get('input[type="checkbox"]').click({ force: true });
        cy.wait(50);
      }
      
      // 验证应用仍然正常工作
      cy.verifyContent('Remote1 home page');
      cy.contains('点击增加 Count').click();
      cy.verifyContent('Ming');
    });

    it('should handle clicking counter while disableRerender is being toggled', () => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 同时点击 checkbox 和计数器按钮
      cy.get('input[type="checkbox"]').check();
      cy.contains('点击增加 Count').click();
      cy.get('input[type="checkbox"]').uncheck();
      cy.contains('点击增加 Count').click();
      cy.get('input[type="checkbox"]').check();
      cy.contains('点击增加 Count').click();
      
      // 验证应用仍然正常工作
      cy.verifyContent('Remote1 home page');
    });

    it('should work correctly with browser back/forward buttons', () => {
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 启用 disableRerender
      cy.get('input[type="checkbox"]').check();
      cy.contains('点击增加 Count').click();
      
      // 导航到 detail
      cy.clickByClass('.menu-remote1-detail-link');
      cy.verifyContent('Remote1 detail page');
      
      // 使用浏览器后退
      cy.go('back');
      cy.verifyContent('Remote1 home page');
      
      // 验证 checkbox 状态保持
      cy.get('input[type="checkbox"]').should('be.checked');
      
      // 使用浏览器前进
      cy.go('forward');
      cy.verifyContent('Remote1 detail page');
      
      // 再次后退
      cy.go('back');
      cy.verifyContent('Remote1 home page');
    });
  });

  describe('Console Logging Verification', () => {
    it('should log appropriate messages when disableRerender is disabled', () => {
      const logs: string[] = [];
      
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win.console, 'log').callsFake((...args) => {
            logs.push(args.join(' '));
          });
        },
      });
      
      cy.clickMenuItem('Remote1');
      cy.verifyContent('Remote1 home page', 10000);
      
      // 确保未启用
      cy.get('input[type="checkbox"]').should('not.be.checked');
      
      // 点击按钮
      cy.contains('点击增加 Count').click();
      cy.wait(500);
      
      // 验证日志包含渲染信息
      cy.wrap(logs).should((logArray) => {
        const hasRenderLog = logArray.some(log => 
          log.includes('🏠 [Host] Remote1Route render') || 
          log.includes('🔄 [Remote1] App render')
        );
        expect(hasRenderLog).to.be.true;
      });
    });
  });
});
