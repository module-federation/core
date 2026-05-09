import { getH1, getH3 } from '../support/app.po';

const getObservabilityReader = (win: Cypress.AUTWindow) =>
  (win as any).__FEDERATION__?.__OBSERVABILITY__?.runtime_host;

type ObservabilityTestReport = {
  traceId: string;
  status?: string;
  errorCode?: string;
  requestId?: string;
  summary: {
    flags: {
      cached?: boolean;
    };
    phases: {
      remoteEntry?: {
        cached?: boolean;
      };
    };
  };
  shared?: {
    name?: string;
    provider?: string;
    reason?: string;
    availableVersions?: string[];
  };
  events: Array<{
    eventName?: string;
    metadata?: Record<string, string>;
  }>;
};

const ignoreExpectedObservabilityException = (expectedMessages: string[]) => {
  cy.on('uncaught:exception', (error) => {
    if (expectedMessages.some((message) => error.message.includes(message))) {
      return false;
    }

    return undefined;
  });
};

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

  describe('observability demo fixture', () => {
    beforeEach(() => {
      cy.visit('/observability');
    });

    it('should emit build observability for the host config', () => {
      cy.readFile('.mf/observability/build-info.json').then((buildInfo) => {
        expect(buildInfo.source).to.equal('manifest');
        expect(buildInfo.moduleFederation.name).to.equal('runtime_host');
        expect(
          buildInfo.moduleFederation.remotes.some(
            (remote: { entry?: string; alias?: string }) =>
              remote.alias === 'remote1' &&
              remote.entry === 'http://127.0.0.1:3006/mf-manifest.json',
          ),
        ).to.equal(true);
        expect(buildInfo.moduleFederation.exposes).to.deep.include({
          name: 'Button',
        });
        expect(
          buildInfo.moduleFederation.shared.some(
            (shared: { name: string }) => shared.name === 'react',
          ),
        ).to.equal(true);
        const reactShared = buildInfo.moduleFederation.shared.find(
          (shared: { name: string }) => shared.name === 'react',
        );
        expect(reactShared).to.include({
          name: 'react',
          requiredVersion: '^18.2.0',
          singleton: true,
        });
        expect(JSON.stringify(buildInfo)).not.to.contain('/Users/bytedance');
        expect(JSON.stringify(buildInfo)).not.to.contain('token=');
      });
    });

    it('should expose a successful remote loading scenario', () => {
      cy.get('[data-testid="observability-load-success"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('success');
      cy.get('[data-testid="observability-remote-result"]')
        .find('button.test-remote2')
        .contains('Button from antd@4.24.15');
      cy.window().then((win) => {
        const reader = getObservabilityReader(win);
        expect(reader).to.exist;

        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.summary.runtimeLoaded).to.equal(true);
        expect(latestReport.summary.loadCompleted).to.equal(true);
        expect(latestReport.summary.componentLoaded).to.equal(false);
        expect(latestReport.summary.outcome).to.equal('runtime-loaded');
        expect(latestReport.summary.phases.loadRemote.status).to.equal(
          'complete',
        );
        expect(latestReport.diagnosis.status).to.equal('success');
        expect(latestReport.diagnosis.outcome).to.equal('runtime-loaded');
        expect(latestReport.diagnosis.facts.runtimeLoaded).to.equal(true);
        expect(latestReport.summary.phases.remoteEntryInit.duration).to.be.a(
          'number',
        );
      });
      cy.get('[data-testid="observability-business-loaded"]').click();
      cy.get('[data-testid="observability-report"]').contains(
        'component:business-loaded',
      );
      cy.get('[data-testid="observability-report"]')
        .should('contain', '"route": "/observability?token=demo-secret#hash"')
        .should('contain', 'token=demo-secret')
        .should('contain', '#hash');
      cy.window().then((win) => {
        const reader = getObservabilityReader(win);
        expect(reader).to.exist;

        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.summary.componentLoaded).to.equal(true);
        expect(latestReport.summary.outcome).to.equal('component-loaded');
        expect(latestReport.diagnosis.outcome).to.equal('component-loaded');
        expect(latestReport.diagnosis.facts.componentLoaded).to.equal(true);
        expect(reader.getReport(latestReport.traceId).traceId).to.equal(
          latestReport.traceId,
        );
      });
    });

    it('should expose a failed remote loading scenario', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error').as('observabilityError');
      });
      cy.get('[data-testid="observability-load-missing-expose"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]').contains(
        'dynamic-remote/__missing_expose__',
      );
      cy.get('[data-testid="observability-error-message"]').should(
        'not.contain',
        'token=',
      );
      cy.get('@observabilityError').should(
        'have.been.calledWithMatch',
        /Observability report generated[\s\S]*traceId: mf-/,
      );
      cy.window().then((win) => {
        const reader = getObservabilityReader(win);
        const latestReport = reader.getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.traceId).to.match(/^mf-/);
        expect(latestReport.summary.loadCompleted).to.equal(true);
        expect(latestReport.summary.outcome).to.equal('failed');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-expose',
          ),
        ).to.equal(true);
        expect(reader.getReport(latestReport.traceId).failedPhase).to.equal(
          'expose',
        );
      });
    });

    it('should expose a manifest failure scenario', () => {
      cy.get('[data-testid="observability-load-broken-manifest"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]').contains(
        'observability-broken-remote/Button',
      );
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'demo-secret')
        .should('contain', 'token=')
        .should('contain', '#hash')
        .should('contain', 'RUNTIME-003')
        .should('contain', '"ownerHint": "host"')
        .should('contain', '"check-manifest-url"');
      cy.get('[data-testid="observability-error-message"]')
        .contains('/observability-missing/mf-manifest.json')
        .should('not.contain', 'demo-secret')
        .should('not.contain', 'token=')
        .should('not.contain', '#hash');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.diagnosis.facts.url).to.equal(
          'http://127.0.0.1:3005/observability-missing/mf-manifest.json?token=demo-secret#hash',
        );
      });
    });

    it('should expose a remote URL failure scenario', () => {
      cy.get('[data-testid="observability-load-remote-url-error"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-remote-url/Button')
        .should(
          'contain',
          'http://127.0.0.1:3999/observability-remote-url/mf-manifest.json',
        )
        .should('contain', 'RUNTIME-003')
        .should('contain', '"check-manifest-url"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.failedPhase).to.equal('manifest');
        expect(latestReport.diagnosis.facts.url).to.equal(
          'http://127.0.0.1:3999/observability-remote-url/mf-manifest.json',
        );
      });
    });

    it('should expose a retry recovered remote scenario', () => {
      cy.get('[data-testid="observability-load-retry-recovered"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('success');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-retry-recovered/Button')
        .should('contain', 'remoteEntry:load-recovered')
        .should('contain', '"retried": true')
        .should('contain', '"recovered": true');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.summary.outcome).to.equal('recovered');
        expect(latestReport.summary.flags.retried).to.equal(true);
        expect(latestReport.summary.flags.fallback).to.equal(false);
        expect(latestReport.summary.phases.remoteEntry.recovered).to.equal(
          true,
        );
        expect(latestReport.diagnosis.warnings).to.include(
          'Remote entry loading recovered after retry',
        );
      });
    });

    it('should expose a fallback recovered remote scenario', () => {
      cy.get('[data-testid="observability-load-fallback-success"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('success');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'dynamic-remote/__observability_fallback__')
        .should('contain', 'remote:load-recovered')
        .should('contain', '"fallback": true')
        .should('contain', '"outcome": "recovered"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.failedPhase).to.equal('expose');
        expect(latestReport.summary.outcome).to.equal('recovered');
        expect(latestReport.summary.flags.fallback).to.equal(true);
        expect(latestReport.summary.flags.recovered).to.equal(true);
        expect(latestReport.summary.error.failedPhase).to.equal('expose');
        expect(latestReport.diagnosis.warnings).to.include(
          'Remote loading completed through fallback recovery',
        );
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-expose',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a manifest missing fields scenario', () => {
      ignoreExpectedObservabilityException(['RUNTIME-013']);
      cy.get(
        '[data-testid="observability-load-missing-fields-manifest"]',
      ).click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-missing-fields/Button')
        .should('contain', 'RUNTIME-013')
        .should('contain', 'Missing required fields')
        .should('contain', 'metaData')
        .should('contain', 'exposes')
        .should('contain', 'shared')
        .should('contain', '"check-manifest-url"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.failedPhase).to.equal('manifest');
        expect(latestReport.diagnosis.facts.url).to.equal(
          'http://127.0.0.1:3005/observability-fixtures/missing-fields/mf-manifest.json',
        );
      });
    });

    it('should expose a remoteEntry globalName mismatch scenario', () => {
      ignoreExpectedObservabilityException(['RUNTIME-001']);
      cy.get('[data-testid="observability-load-wrong-global"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-wrong-global/Button')
        .should('contain', 'RUNTIME-001')
        .should('contain', 'observability_wrong_global_expected')
        .should('contain', '"check-remote-global"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.failedPhase).to.equal('remoteEntry');
        expect(latestReport.errorCode).to.equal('RUNTIME-001');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-remote-global',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a remoteEntry execution error scenario', () => {
      ignoreExpectedObservabilityException([
        'observability remoteEntry execution failed',
        'ScriptExecutionError',
      ]);
      cy.get(
        '[data-testid="observability-load-remote-entry-execution-error"]',
      ).click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-execution-error/Button')
        .should('contain', 'RUNTIME-008')
        .should('contain', 'ScriptExecutionError')
        .should('contain', '"check-remote-entry"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.failedPhase).to.equal('remoteEntry');
        expect(latestReport.errorCode).to.equal('RUNTIME-008');
        expect(latestReport.diagnosis.facts.resourceErrorType).to.equal(
          'script-execution',
        );
      });
    });

    it('should expose a snapshot match observability scenario', () => {
      ignoreExpectedObservabilityException(['RUNTIME-007']);
      cy.get('[data-testid="observability-load-snapshot-match-error"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-snapshot-miss/Button')
        .should('contain', 'RUNTIME-007')
        .should('contain', 'remote-snapshot')
        .should('contain', 'observability-unrelated-snapshot')
        .should('contain', '"check-module-info"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.errorCode).to.equal('RUNTIME-007');
        expect(latestReport.ownerHint).to.equal('host');
        expect(latestReport.moduleInfo.reason).to.equal('remote-snapshot');
        expect(latestReport.moduleInfo.matchedCount).to.equal(0);
        expect(latestReport.moduleInfo.availableNames).to.include(
          'remote:observability-unrelated-snapshot',
        );
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-module-info',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a shared miss observability scenario', () => {
      cy.window().then((win) => {
        cy.spy(win.console, 'error').as('observabilityError');
      });
      cy.get('[data-testid="observability-shared-miss"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-missing-shared')
        .should('contain', 'missing-provider');
      cy.get('@observabilityError').should(
        'have.been.calledWithMatch',
        /Observability report generated[\s\S]*traceId: mf-/,
      );
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('missing-provider');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-shared-provider',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a shared version mismatch observability scenario', () => {
      cy.get('[data-testid="observability-shared-version-mismatch"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', '"name": "react"')
        .should('contain', '^99.0.0')
        .should('contain', 'version-mismatch');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('version-mismatch');
        expect(latestReport.shared.availableVersions).to.include('18.3.1');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-shared-version',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a shared unexpected provider observability scenario', () => {
      cy.get(
        '[data-testid="observability-shared-unexpected-provider"]',
      ).click();
      cy.get('[data-testid="observability-load-status"]').contains('success');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-provider-choice')
        .should('contain', '"provider": "runtime_remote2"')
        .should('contain', '"selectedVersion": "2.0.0"')
        .should('contain', 'shared:resolved');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('success');
        expect(latestReport.shared.name).to.equal(
          'observability-provider-choice',
        );
        expect(latestReport.shared.provider).to.equal('runtime_remote2');
        expect(latestReport.shared.selectedVersion).to.equal('2.0.0');
        expect(latestReport.summary.shared.provider).to.equal(
          'runtime_remote2',
        );
        expect(latestReport.diagnosis.facts.provider).to.equal(
          'runtime_remote2',
        );
      });
    });

    it('should expose a multi-consumer loading chain scenario', () => {
      cy.get('[data-testid="observability-multi-consumer-chain"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('success');
      cy.get('[data-testid="observability-multi-consumer-results"]')
        .should('contain', 'checkout-page loaded')
        .should('contain', 'analytics-page loaded')
        .should('contain', 'checkout-page-repeat loaded')
        .should(
          'contain',
          'observability-checkout-theme from observability_consumer_checkout@1.4.0',
        )
        .should(
          'contain',
          'observability-analytics-sdk from observability_consumer_analytics@1.2.0',
        )
        .should('contain', 'cached=true');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'multi-consumer-loading-chain')
        .should('contain', 'dynamic-remote/ProfileCard')
        .should('contain', 'dynamic-remote/AnalyticsPanel')
        .should('contain', '"consumer": "checkout-page"')
        .should('contain', '"consumer": "analytics-page"')
        .should(
          'contain',
          '"sharedProvider": "observability_consumer_checkout"',
        )
        .should(
          'contain',
          '"sharedProvider": "observability_consumer_analytics"',
        )
        .should('contain', '"cached": true');
      cy.window().then((win) => {
        const reader = getObservabilityReader(win);
        const reports = reader.getReports();
        const profileReports = reader.findReports({
          remote: 'runtime_remote2',
          expose: 'ProfileCard',
        });
        const analyticsReports = reader.findReports({
          remote: 'runtime_remote2',
          expose: 'AnalyticsPanel',
        });
        const checkoutSharedReports = reader.findReports({
          shared: 'observability-checkout-theme',
        });
        const analyticsSharedReports = reader.findReports({
          shared: 'observability-analytics-sdk',
        });
        const cachedRemoteReport = (
          profileReports as ObservabilityTestReport[]
        ).find((report) => report.summary.flags.cached === true);
        const checkoutComponentReport = (
          profileReports as ObservabilityTestReport[]
        ).find((report) =>
          report.events.some(
            (event) =>
              event.eventName === 'component:business-loaded' &&
              event.metadata?.consumer === 'checkout-page',
          ),
        );

        expect(reports.length).to.be.greaterThan(4);
        expect(profileReports.length).to.be.greaterThan(1);
        expect(analyticsReports.length).to.equal(1);
        expect(
          (checkoutSharedReports[0] as ObservabilityTestReport).shared
            ?.provider,
        ).to.equal('observability_consumer_checkout');
        expect(
          (analyticsSharedReports[0] as ObservabilityTestReport).shared
            ?.provider,
        ).to.equal('observability_consumer_analytics');
        expect(cachedRemoteReport?.summary.flags.cached).to.equal(true);
        expect(
          checkoutComponentReport?.events.some(
            (event) =>
              event.metadata?.sharedTraceId ===
              (checkoutSharedReports[0] as ObservabilityTestReport).traceId,
          ),
        ).to.equal(true);
      });
    });

    it('should expose an eager config observability scenario', () => {
      cy.get('[data-testid="observability-eager-config-error"]').click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-async-shared')
        .should('contain', 'sync-async-boundary')
        .should('contain', 'RUNTIME-005')
        .should('contain', '"ownerHint": "shared"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.shared.reason).to.equal('sync-async-boundary');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-eager-config',
          ),
        ).to.equal(true);
      });
    });

    it('should expose a runtime eager config observability scenario', () => {
      cy.get(
        '[data-testid="observability-runtime-eager-config-error"]',
      ).click();
      cy.get('[data-testid="observability-load-status"]').contains('error');
      cy.get('[data-testid="observability-report"]')
        .should('contain', 'observability-runtime-async-shared')
        .should('contain', 'sync-async-boundary')
        .should('contain', 'RUNTIME-006')
        .should('contain', '"ownerHint": "shared"');
      cy.window().then((win) => {
        const latestReport = getObservabilityReader(win).getLatestReport();
        expect(latestReport.status).to.equal('error');
        expect(latestReport.errorCode).to.equal('RUNTIME-006');
        expect(latestReport.shared.reason).to.equal('sync-async-boundary');
        expect(
          latestReport.diagnosis.actions.some(
            (action: { id: string }) => action.id === 'check-eager-config',
          ),
        ).to.equal(true);
      });
    });
  });

  describe('observability showcase fixture', () => {
    beforeEach(() => {
      cy.visit('/observability-showcase');
    });

    it('should present a product page route flow for AI observability', () => {
      cy.contains('Suggested prompt').should('not.exist');
      cy.contains('AI-ready evidence').should('not.exist');
      cy.contains('Show latest observability report').should('not.exist');
      cy.get('[data-testid="observability-showcase-status"]').contains(
        'success',
      );
      cy.get('[data-testid="remote2-profile-card"]').should(
        'contain',
        'ProfileCard',
      );
      cy.get('[data-testid="observability-showcase-load"]').click();
      cy.location('pathname').should(
        'equal',
        '/observability-showcase/analytics',
      );
      cy.get('[data-testid="observability-showcase-status"]').contains(
        'degraded',
      );
      cy.get('[data-testid="observability-showcase-fallback"]').should(
        'contain',
        'Limited analytics view',
      );
      cy.get('[data-testid="observability-showcase-message"]').should(
        'contain',
        'Some analytics details are temporarily unavailable',
      );
      cy.get('[data-testid="observability-showcase-shared"]').should(
        'contain',
        'Detailed analytics are temporarily limited',
      );

      cy.window().then((win) => {
        const reports = getObservabilityReader(win).getReports();
        const customerSdkReport = reports.find(
          (report: ObservabilityTestReport) =>
            report.shared?.name === 'observability-customer-sdk',
        );

        expect(
          reports.some(
            (report: ObservabilityTestReport) =>
              report.requestId === 'dynamic-remote/ProfileCard',
          ),
        ).to.equal(true);
        expect(
          reports.some(
            (report: ObservabilityTestReport) =>
              report.requestId === 'dynamic-remote/AnalyticsPanel',
          ),
        ).to.equal(true);
        expect(
          reports.some(
            (report: ObservabilityTestReport) =>
              report.shared?.name === 'react',
          ),
        ).to.equal(true);
        expect(
          reports.some(
            (report: ObservabilityTestReport) =>
              report.shared?.name === 'observability-customer-sdk',
          ),
        ).to.equal(true);
        expect(customerSdkReport?.status).to.equal('error');
        expect(customerSdkReport?.shared?.reason).to.equal('version-mismatch');
        expect(customerSdkReport?.shared?.availableVersions).to.include(
          '2.1.0',
        );
      });
    });
  });
});
