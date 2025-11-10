/// <reference types="cypress" />

describe('disableRerender Array Mode Feature', () => {
  beforeEach(() => {
    cy.visit('/remote1-array');
    // Wait for remote app to load
    cy.get('[data-testid="host-app-counter"]', { timeout: 20000 }).should(
      'be.visible',
    );
  });

  describe('Array Mode - Watch Specific Props', () => {
    it('should display array mode test panel with correct buttons', () => {
      // Verify the test panel is displayed
      cy.contains('🎯 Array Mode Test: Watch Specific Props').should(
        'be.visible',
      );
      cy.contains("disableRerender={['userId', 'theme']}").should('be.visible');

      // Verify watched props section
      cy.contains('✅ Watched Props (Will trigger re-render)').should(
        'be.visible',
      );
      cy.contains('Change userId:').should('be.visible');
      cy.contains('Toggle theme:').should('be.visible');

      // Verify unwatched props section
      cy.contains('❌ Unwatched Props (Will NOT trigger re-render)').should(
        'be.visible',
      );
      cy.contains('Change count:').should('be.visible');
      cy.contains('Change unrelated:').should('be.visible');
    });

    it('should re-render when watched prop (userId) changes', () => {
      // Clear console and track render logs
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      // Wait a bit for initial render to complete
      cy.wait(500);

      // Clear logs after initial render
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      // Click userId button (watched prop)
      cy.contains('Change userId:').click();

      // Wait a bit for render
      cy.wait(300);

      // Verify remote app re-rendered
      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(renderLogs.length).to.be.greaterThan(
          0,
          'Remote app should re-render when userId changes',
        );
      });
    });

    it('should re-render when watched prop (theme) changes', () => {
      // Clear console and track render logs
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      // Wait a bit for initial render to complete
      cy.wait(500);

      // Clear logs after initial render
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      // Click theme button (watched prop)
      cy.contains('Toggle theme:').click();

      // Wait a bit for render
      cy.wait(300);

      // Verify remote app re-rendered
      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(renderLogs.length).to.be.greaterThan(
          0,
          'Remote app should re-render when theme changes',
        );
      });
    });

    it('should NOT re-render when unwatched prop (count) changes', () => {
      // Clear console and track render logs
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      // Wait a bit for initial render to complete
      cy.wait(500);

      // Clear logs after initial render
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      // Click count button 3 times (unwatched prop)
      cy.contains('Change count:').click();
      cy.wait(100);
      cy.contains('Change count:').click();
      cy.wait(100);
      cy.contains('Change count:').click();

      // Wait a bit
      cy.wait(300);

      // Verify remote app did NOT re-render
      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(
          renderLogs.length,
          'Remote app should NOT re-render when count changes',
        ).to.equal(0);
      });
    });

    it('should NOT re-render when unwatched prop (unrelated) changes', () => {
      // Clear console and track render logs
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      // Wait a bit for initial render to complete
      cy.wait(500);

      // Clear logs after initial render
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      // Click unrelated button multiple times (unwatched prop)
      cy.contains('Change unrelated:').click();
      cy.wait(100);
      cy.contains('Change unrelated:').click();
      cy.wait(100);

      // Wait a bit
      cy.wait(300);

      // Verify remote app did NOT re-render
      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(
          renderLogs.length,
          'Remote app should NOT re-render when unrelated state changes',
        ).to.equal(0);
      });
    });

    it('should demonstrate selective re-rendering behavior', () => {
      // Clear console and track render logs
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      // Wait for initial render
      cy.wait(500);

      // Clear logs
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      // Step 1: Click unwatched props multiple times - should NOT re-render
      cy.contains('Change count:').click();
      cy.wait(100);
      cy.contains('Change unrelated:').click();
      cy.wait(100);
      cy.contains('Change count:').click();
      cy.wait(300);

      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(
          renderLogs.length,
          'Should have 0 renders after unwatched prop changes',
        ).to.equal(0);
      });

      // Step 2: Click watched prop - SHOULD re-render
      cy.contains('Change userId:').click();
      cy.wait(300);

      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(
          renderLogs.length,
          'Should have 1 render after userId change',
        ).to.be.greaterThan(0);
      });
    });
  });

  describe('Navigation Integration', () => {
    it('should maintain array mode behavior after navigation', () => {
      // Navigate away
      cy.visit('/');
      cy.wait(500);

      // Navigate back
      cy.visit('/remote1-array');
      cy.wait(1000);

      // Verify array mode still works
      cy.contains('🎯 Array Mode Test: Watch Specific Props').should(
        'be.visible',
      );

      // Test unwatched prop doesn't trigger re-render
      cy.window().then((win) => {
        const logs: string[] = [];
        const originalLog = win.console.log;
        win.console.log = function (...args: any[]) {
          const msg = args.join(' ');
          logs.push(msg);
          originalLog.apply(win.console, args);
        };
        (win as any).__logs = logs;
      });

      cy.wait(500);
      cy.window().then((win) => {
        (win as any).__logs = [];
      });

      cy.contains('Change count:').click();
      cy.wait(300);

      cy.window().then((win) => {
        const logs = (win as any).__logs || [];
        const renderLogs = logs.filter((log: string) =>
          log.includes('🔄 [Remote1] App render'),
        );
        expect(
          renderLogs.length,
          'Array mode should still work after navigation',
        ).to.equal(0);
      });
    });
  });
});
