import { getH1, getH3 } from '../support/app.po';

const getDiagnosticsReader = (win: Cypress.AUTWindow) =>
  (win as any).__FEDERATION__?.__DIAGNOSTICS__?.runtime_host;

describe('3005-runtime-host/', () => {
  beforeEach(() => cy.visit('/'));

  describe('Welcome message', () => {
    it('should display welcome message', () => {
      getH1().contains('Runtime Demo');
    });
  });

  describe('Image checks', () => {
    it('should check that the home-webpack-png and remote1-webpack-png images are not 404', () => {
      // Get the src attribute of the home-webpack-png image
      cy.get('img.home-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          cy.log(src);
          cy.request(src).its('status').should('eq', 200);
        });

      // Get the src attribute of the shop-webpack-png image
      cy.get('img.remote1-webpack-png')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          // Send a GET request to the src URL
          cy.request(src).its('status').should('eq', 200);
        });
    });

    it('should check that the home-webpack-svg and remote1-webpack-svg images are not 404', () => {
      // Get the src attribute of the home-webpack-png image
      cy.get('img.home-webpack-svg')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          cy.log(src);
          cy.request(src).its('status').should('eq', 200);
        });

      // Get the src attribute of the shop-webpack-png image
      cy.get('img.remote1-webpack-svg')
        .invoke('attr', 'src')
        .then((src) => {
          if (!src) {
            throw new Error('src must not be empty');
          }
          // Send a GET request to the src URL
          cy.request(src).its('status').should('eq', 200);
        });
    });
  });

  describe('Shared react hook check', () => {
    it('should display text which comes from remote1 hook', () => {
      cy.get('.remote1-text')
        .invoke('html')
        .should('equal', 'Custom hook from localhost:3006 works!');
    });
  });

  describe('dynamic remote check', () => {
    describe('dynamic-remote/ButtonOldAnt', () => {
      it('should display remote button', () => {
        cy.get('button.test-remote2').contains('Button');
      });
      it('should use host shared(antd)', () => {
        cy.get('button.test-remote2').contains('Button from antd@4.24.15');
      });
    });
  });

  describe('diagnostics demo fixture', () => {
    beforeEach(() => cy.visit('/diagnostics'));

    it('should expose a successful remote loading scenario', () => {
      cy.get('[data-testid="diagnostics-load-success"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('success');
      cy.get('[data-testid="diagnostics-remote-result"]')
        .find('button.test-remote2')
        .contains('Button from antd@4.24.15');
      cy.window().then((win) => {
        const reader = getDiagnosticsReader(win);
        expect(reader).to.exist;

        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.summary.runtimeLoaded).to.equal(true);
        expect(latestReport.summary.loadCompleted).to.equal(true);
        expect(latestReport.summary.componentLoaded).to.equal(false);
        expect(latestReport.summary.outcome).to.equal('runtime-loaded');
      });
      cy.get('[data-testid="diagnostics-business-loaded"]').click();
      cy.get('[data-testid="diagnostics-report"]').contains(
        'component:business-loaded',
      );
      cy.window().then((win) => {
        const reader = getDiagnosticsReader(win);
        expect(reader).to.exist;

        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.summary.componentLoaded).to.equal(true);
        expect(latestReport.summary.outcome).to.equal('component-loaded');
        expect(reader.getReport(latestReport.traceId).traceId).to.equal(
          latestReport.traceId,
        );
      });
    });

    it('should expose a failed remote loading scenario', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'warn').as('diagnosticsWarn');
      });
      cy.get('[data-testid="diagnostics-load-missing-expose"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('error');
      cy.get('[data-testid="diagnostics-report"]').contains(
        'dynamic-remote/__missing_expose__',
      );
      cy.get('[data-testid="diagnostics-error-message"]').should(
        'not.contain',
        'token=',
      );
      cy.get('@diagnosticsWarn').should(
        'have.been.calledWithMatch',
        /Diagnostic report generated[\s\S]*traceId: mf-/,
      );
      cy.window().then((win) => {
        const reader = getDiagnosticsReader(win);
        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.traceId).to.match(/^mf-/);
        expect(latestReport.summary.loadCompleted).to.equal(true);
        expect(latestReport.summary.outcome).to.equal('failed');
        expect(reader.getReport(latestReport.traceId).failedPhase).to.exist;
      });
    });

    it('should expose a sanitized manifest failure scenario', () => {
      cy.get('[data-testid="diagnostics-load-broken-manifest"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('error');
      cy.get('[data-testid="diagnostics-report"]').contains(
        'diagnostics-broken-remote/Button',
      );
      cy.get('[data-testid="diagnostics-report"]')
        .should('not.contain', 'demo-secret')
        .should('not.contain', 'token=')
        .should('not.contain', '#hash');
      cy.get('[data-testid="diagnostics-error-message"]')
        .contains('/diagnostics-missing/mf-manifest.json')
        .should('not.contain', 'demo-secret')
        .should('not.contain', 'token=')
        .should('not.contain', '#hash');
    });

    it('should expose a shared miss diagnostic scenario', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'warn').as('diagnosticsWarn');
      });
      cy.get('[data-testid="diagnostics-shared-miss"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('error');
      cy.get('[data-testid="diagnostics-report"]')
        .should('contain', 'diagnostics-missing-shared')
        .should('contain', 'missing-provider');
      cy.get('@diagnosticsWarn').should(
        'have.been.calledWithMatch',
        /Diagnostic report generated[\s\S]*traceId: mf-/,
      );
      cy.window().then((win) => {
        const latestReport = getDiagnosticsReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('missing-provider');
      });
    });

    it('should expose a shared version mismatch diagnostic scenario', () => {
      cy.get('[data-testid="diagnostics-shared-version-mismatch"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('error');
      cy.get('[data-testid="diagnostics-report"]')
        .should('contain', '"name": "react"')
        .should('contain', '^99.0.0')
        .should('contain', 'version-mismatch');
      cy.window().then((win) => {
        const latestReport = getDiagnosticsReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('version-mismatch');
        expect(latestReport.shared.availableVersions).to.include('18.3.1');
      });
    });

    it('should expose an eager config diagnostic scenario', () => {
      cy.get('[data-testid="diagnostics-eager-config-error"]').click();
      cy.get('[data-testid="diagnostics-load-status"]').contains('error');
      cy.get('[data-testid="diagnostics-report"]')
        .should('contain', 'diagnostics-async-shared')
        .should('contain', 'sync-async-boundary')
        .should('contain', 'RUNTIME-005');
      cy.window().then((win) => {
        const latestReport = getDiagnosticsReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('sync-async-boundary');
      });
    });
  });
});
