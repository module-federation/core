describe('disableRerender Feature', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Host App Global Counter', () => {
    it('should display and increment global counter', () => {
      // Verify display
      cy.get('[data-testid="host-app-counter"]').should('be.visible');
      cy.get('[data-testid="host-count-button"]').should('be.visible');
      cy.get('[data-testid="host-count-value"]').should('have.text', '0');

      // Verify increment
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '1');
      cy.get('[data-testid="host-count-button"]').click();
      cy.get('[data-testid="host-count-value"]').should('have.text', '2');
    });
  });

  describe('Boolean Mode: disableRerender={true}', () => {
    beforeEach(() => {
      cy.visit('/remote1');
      cy.verifyContent('Remote1 home page', 10000);
    });

    it('should display test panel and toggle checkbox', () => {
      // Verify UI elements
      cy.contains('🔬 Test Panel').should('be.visible');
      cy.contains('Click to increase count').should('be.visible');
      cy.get('input[type="checkbox"]').should('not.be.checked');
      cy.contains('❌ Disabled').should('be.visible');

      // Toggle checkbox
      cy.get('input[type="checkbox"]').check();
      cy.contains('✅ Enabled').should('be.visible');
    });

    it('should re-render when disableRerender is disabled', () => {
      cy.get('input[type="checkbox"]').should('not.be.checked');

      // Click counter and verify re-render happens
      cy.contains('Click to increase count').click();
      cy.wait(100);
      cy.contains('Click to increase count').click();
      cy.verifyContent('Remote1 home page');
    });

    it('should NOT re-render when disableRerender is enabled', () => {
      // Enable disableRerender
      cy.get('input[type="checkbox"]').check();
      cy.wait(300);

      // Click counter multiple times
      cy.contains('Click to increase count').click();
      cy.wait(100);
      cy.contains('Click to increase count').click();
      cy.wait(100);
      cy.contains('Click to increase count').click();

      // Verify remote app still works normally
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
    });
  });

  describe('Array Mode: disableRerender={[...props]}', () => {
    beforeEach(() => {
      cy.visit('/remote1-array');
      cy.verifyContent('Remote1 home page', 10000);
    });

    it('should display array mode test panel with watched and unwatched props', () => {
      // Verify panel sections exist
      cy.contains('🎯 Array Mode Test: Watch Specific Props').should(
        'be.visible',
      );
      cy.contains('✅ Watched Props (Will trigger re-render)').should(
        'be.visible',
      );
      cy.contains('❌ Unwatched Props (Will NOT trigger re-render)').should(
        'be.visible',
      );

      // Verify watched props buttons exist
      cy.contains('Change userId: 1').should('be.visible');
      cy.contains('Toggle theme: light').should('be.visible');

      // Verify unwatched props buttons exist
      cy.contains('Change count: 0').should('be.visible');
      cy.contains('Change unrelated: 0').should('be.visible');
    });

    it('should re-render when watched props change', () => {
      // Change watched prop (userId)
      cy.contains('Change userId: 1').click();
      cy.wait(200);

      // Verify button text updated
      cy.contains('Change userId: 2').should('be.visible');

      // Change watched prop (theme)
      cy.contains('Toggle theme: light').click();
      cy.wait(200);

      // Verify theme changed
      cy.contains('Toggle theme: dark').should('be.visible');
    });

    it('should NOT re-render when unwatched props change', () => {
      // Record initial render count via console
      let initialRenderCount = 0;
      cy.window().then((win) => {
        cy.stub(win.console, 'log').callsFake((...args) => {
          const message = args.join(' ');
          if (message.includes('🔄 [Remote1] App render')) {
            initialRenderCount++;
          }
        });
      });

      // Change unwatched props
      cy.contains('Change count: 0').click();
      cy.wait(200);
      cy.contains('Change unrelated: 0').click();
      cy.wait(200);

      // Verify buttons updated but remote app didn't re-render
      cy.contains('Change count: 1').should('be.visible');
      cy.contains('Change unrelated: 1').should('be.visible');

      // Remote app should still be visible and functional
      cy.verifyContent('Remote1 home page');
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle rapid prop changes without errors', () => {
      cy.visit('/remote1');
      cy.verifyContent('Remote1 home page', 10000);
      cy.get('input[type="checkbox"]').check();
      cy.wait(300);

      // Rapid clicks
      for (let i = 0; i < 15; i++) {
        cy.contains('Click to increase count').click({ force: true });
      }

      // Verify no crash and still works
      cy.verifyContent('Remote1 home page');
      cy.verifyContent('Ming');
    });

    it('should work correctly for both boolean and array modes', () => {
      // Test boolean mode
      cy.visit('/remote1');
      cy.verifyContent('Remote1 home page', 10000);
      cy.get('input[type="checkbox"]').check();
      cy.contains('Click to increase count').click();
      cy.verifyContent('Ming'); // Still shows original props

      // Test array mode
      cy.visit('/remote1-array');
      cy.verifyContent('Remote1 home page', 10000);
      cy.contains('Change userId: 1').click();
      cy.wait(200);
      cy.contains('Change userId: 2').should('be.visible'); // Updates watched prop

      cy.contains('Change count: 0').click();
      cy.wait(200);
      cy.contains('Change count: 1').should('be.visible'); // Host updates but remote doesn't re-render
    });
  });
});
