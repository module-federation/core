import { withExpectedError } from '../../../../tools/rstest/expected-errors';
import { page } from '@rstest/browser';
import { cleanup, render } from '@rstest/browser-react';
import { afterEach, expect, it, rstest } from '@rstest/core';
import { init } from '@module-federation/runtime';
import App from '../src/App';
import { observability } from '../src/observability';
import customPlugin from '../src/runtimePlugin';

init({
  name: 'runtime_host',
  remotes: [
    {
      name: 'runtime_remote2',
      alias: 'dynamic-remote',
      entry: 'http://127.0.0.1:3007/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});
afterEach(async () => {
  await cleanup();
  rstest.restoreAllMocks();
  window.history.replaceState({}, '', '/');
});
async function renderRoute(route: string) {
  observability.clear();
  window.history.replaceState({}, '', route);
  await render(<App />);
}
it('exposes a successful remote loading scenario', async () => {
  await renderRoute('/observability');
  await page.getByTestId('observability-load-success').click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(
      page
        .locator('[data-testid="observability-remote-result"]')
        .locator('button.test-remote2'),
    )
    .toContainText('Button from antd@4.24.15');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.runtimeLoaded).toBe(true);
    expect(latestReport.summary.loadCompleted).toBe(true);
    expect(latestReport.summary.componentLoaded).toBe(false);
    expect(latestReport.summary.outcome).toBe('runtime-loaded');
    expect(latestReport.summary.phases.loadRemote.status).toBe('complete');
    expect(latestReport.diagnosis.status).toBe('success');
    expect(latestReport.diagnosis.outcome).toBe('runtime-loaded');
    expect(latestReport.diagnosis.facts.runtimeLoaded).toBe(true);
    expect(latestReport.summary.phases.remoteEntryInit.duration).toEqual(
      expect.any(Number),
    );
  }
  await page.getByTestId('observability-business-loaded').click();
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('component:business-loaded');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"route": "/observability?token=demo-secret#hash"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('token=demo-secret');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('#hash');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.componentLoaded).toBe(true);
    expect(latestReport.summary.outcome).toBe('component-loaded');
    expect(latestReport.diagnosis.outcome).toBe('component-loaded');
    expect(latestReport.diagnosis.facts.componentLoaded).toBe(true);
    expect(observability.getReport(latestReport.traceId).traceId).toBe(
      latestReport.traceId,
    );
  }
});

it('exposes a preloadRemote observability scenario', async () => {
  await renderRoute('/observability');
  await page.getByTestId('observability-preload-success').click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"phase": "preload"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"outcome": "preloaded"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('preload:assets-ready');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.preloaded).toBe(true);
    expect(latestReport.summary.outcome).toBe('preloaded');
    expect(latestReport.diagnosis.title).toBe('Remote preloaded successfully');
  }
});

it('exposes a failed remote loading scenario', async () => {
  await renderRoute('/observability');
  const observabilityError = rstest.spyOn(console, 'error');
  await page
    .locator('[data-testid="observability-load-missing-expose"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('dynamic-remote/__missing_expose__');
  await expect
    .element(page.getByTestId('observability-error-message'))
    .not.toContainText('token=');
  expect(observabilityError.mock.calls.flat().join(' ')).toMatch(
    /Observability report generated[\s\S]*traceId: mf-/,
  );
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.traceId).toMatch(/^mf-/);
    expect(latestReport.summary.loadCompleted).toBe(true);
    expect(latestReport.summary.outcome).toBe('failed');
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-expose',
      ),
    ).toBe(true);
    expect(observability.getReport(latestReport.traceId).failedPhase).toBe(
      'expose',
    );
  }
});

it('exposes a manifest failure scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-broken-manifest"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-broken-remote/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('demo-secret');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('token=');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('#hash');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-003');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"ownerHint": "host"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"check-manifest-url"');
  await expect
    .element(page.getByTestId('observability-error-message'))
    .toContainText('/observability-missing/mf-manifest.json');
  await expect
    .element(page.getByTestId('observability-error-message'))
    .not.toContainText('demo-secret');
  await expect
    .element(page.getByTestId('observability-error-message'))
    .not.toContainText('token=');
  await expect
    .element(page.getByTestId('observability-error-message'))
    .not.toContainText('#hash');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.diagnosis.facts.url).toBe(
      'http://127.0.0.1:3005/observability-missing/mf-manifest.json?token=demo-secret#hash',
    );
  }
});

it('exposes a remote URL failure scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-remote-url-error"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-remote-url/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText(
      'http://127.0.0.1:3999/observability-remote-url/mf-manifest.json',
    );
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-003');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"check-manifest-url"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.failedPhase).toBe('manifest');
    expect(latestReport.diagnosis.facts.url).toBe(
      'http://127.0.0.1:3999/observability-remote-url/mf-manifest.json',
    );
  }
});

it('exposes a retry recovered remote scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-retry-recovered"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-retry-recovered/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('resource:remoteEntry:recovered');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"recovered": true');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.outcome).toBe('recovered');
    expect(latestReport.summary.flags.fallback).toBe(false);
    expect(latestReport.summary.phases.remoteEntry.recovered).toBe(true);
  }
});

it('exposes a fallback recovered remote scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-fallback-success"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('dynamic-remote/__observability_fallback__');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('remote:load-recovered');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"fallback": true');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"outcome": "recovered"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.failedPhase).toBe('expose');
    expect(latestReport.summary.outcome).toBe('recovered');
    expect(latestReport.summary.flags.fallback).toBe(true);
    expect(latestReport.summary.flags.recovered).toBe(true);
    expect(latestReport.summary.error.failedPhase).toBe('expose');
    expect(latestReport.diagnosis.warnings).toContain(
      'Remote loading completed through fallback recovery',
    );
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-expose',
      ),
    ).toBe(true);
  }
});

it('exposes a manifest missing fields scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-missing-fields-manifest"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-missing-fields/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-013');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('Missing required fields');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('metaData');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('exposes');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('shared');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"check-manifest-url"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.failedPhase).toBe('manifest');
    expect(latestReport.diagnosis.facts.url).toBe(
      'http://127.0.0.1:3005/observability-fixtures/missing-fields/mf-manifest.json',
    );
  }
});

it('exposes a remoteEntry globalName mismatch scenario', async () => {
  await renderRoute('/observability');
  await page.getByTestId('observability-load-wrong-global').click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-wrong-global/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-001');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability_wrong_global_expected');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"check-remote-global"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.failedPhase).toBe('remoteEntry');
    expect(latestReport.errorCode).toBe('RUNTIME-001');
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-remote-global',
      ),
    ).toBe(true);
  }
});

it('exposes a remoteEntry execution error scenario', async () => {
  await withExpectedError(
    'observability remoteEntry execution failed',
    async () => {
      await renderRoute('/observability');
      await page
        .locator(
          '[data-testid="observability-load-remote-entry-execution-error"]',
        )
        .click();
      await expect
        .element(page.getByTestId('observability-load-status'))
        .toContainText('error');
      await expect
        .element(page.getByTestId('observability-report'))
        .toContainText('observability-execution-error/Button');
      await expect
        .element(page.getByTestId('observability-report'))
        .toContainText('RUNTIME-008');
      await expect
        .element(page.getByTestId('observability-report'))
        .toContainText('ScriptExecutionError');
      await expect
        .element(page.getByTestId('observability-report'))
        .toContainText('"check-remote-entry"');
      {
        const latestReport = observability.getLatestReport();
        expect(latestReport.status).toBe('error');
        expect(latestReport.failedPhase).toBe('remoteEntry');
        expect(latestReport.errorCode).toBe('RUNTIME-008');
        expect(latestReport.diagnosis.facts.resourceErrorType).toBe(
          'script-execution',
        );
      }
    },
  );
});

it('exposes a snapshot match observability scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-load-snapshot-match-error"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-snapshot-miss/Button');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-007');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('remote-snapshot');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-unrelated-snapshot');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"check-module-info"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.errorCode).toBe('RUNTIME-007');
    expect(latestReport.ownerHint).toBe('host');
    expect(latestReport.moduleInfo.reason).toBe('remote-snapshot');
    expect(latestReport.moduleInfo.matchedCount).toBe(0);
    expect(latestReport.moduleInfo.availableNames).toContain(
      'remote:observability-unrelated-snapshot',
    );
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-module-info',
      ),
    ).toBe(true);
  }
});

it('exposes a shared miss observability scenario', async () => {
  await renderRoute('/observability');
  await page.getByTestId('observability-shared-miss').click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-missing-shared');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('custom-share-info-unmatched');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.outcome).toBe('recovered');
    expect(latestReport.summary.flags.recovered).toBe(true);
    expect(latestReport.shared.reason).toBe('custom-share-info-unmatched');
  }
});

it('exposes a shared version mismatch observability scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-shared-version-mismatch"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"name": "react"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('^99.0.0');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('custom-share-info-unmatched');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.summary.outcome).toBe('recovered');
    expect(latestReport.summary.flags.recovered).toBe(true);
    expect(latestReport.shared.reason).toBe('custom-share-info-unmatched');
    expect(latestReport.shared.availableVersions).toContain('18.3.1');
  }
});

it('exposes a shared unexpected provider observability scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-shared-unexpected-provider"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-provider-choice');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"provider": "runtime_remote2"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"selectedVersion": "2.0.0"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('shared:resolved');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('success');
    expect(latestReport.shared.name).toBe('observability-provider-choice');
    expect(latestReport.shared.provider).toBe('runtime_remote2');
    expect(latestReport.shared.selectedVersion).toBe('2.0.0');
    expect(latestReport.summary.shared.provider).toBe('runtime_remote2');
    expect(latestReport.diagnosis.facts.provider).toBe('runtime_remote2');
  }
});

it('exposes a multi-consumer loading chain scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-multi-consumer-chain"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText('checkout-page loaded');
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText('analytics-page loaded');
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText('checkout-page-repeat loaded');
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText(
      'observability-checkout-theme from observability_consumer_checkout@1.4.0',
    );
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText(
      'observability-analytics-sdk from observability_consumer_analytics@1.2.0',
    );
  await expect
    .element(page.getByTestId('observability-multi-consumer-results'))
    .toContainText('cached=true');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('multi-consumer-loading-chain');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('dynamic-remote/ProfileCard');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('dynamic-remote/AnalyticsPanel');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"consumer": "checkout-page"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"consumer": "analytics-page"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"sharedProvider": "observability_consumer_checkout"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"sharedProvider": "observability_consumer_analytics"');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"cached": true');
  {
    const reports = observability.getReports();
    const profileReports = observability.findReports({
      remote: 'runtime_remote2',
      expose: 'ProfileCard',
    });
    const analyticsReports = observability.findReports({
      remote: 'runtime_remote2',
      expose: 'AnalyticsPanel',
    });
    const checkoutSharedReports = observability.findReports({
      shared: 'observability-checkout-theme',
    });
    const analyticsSharedReports = observability.findReports({
      shared: 'observability-analytics-sdk',
    });
    const checkoutSharedReport = checkoutSharedReports.find(
      (report) => report.shared?.provider,
    );
    const analyticsSharedReport = analyticsSharedReports.find(
      (report) => report.shared?.provider,
    );
    const cachedRemoteReport = profileReports.find(
      (report) => report.summary.flags.cached === true,
    );
    const checkoutComponentReport = profileReports.find((report) =>
      report.events.some(
        (event) =>
          event.eventName === 'component:business-loaded' &&
          event.metadata?.consumer === 'checkout-page',
      ),
    );
    expect(reports.length).toBeGreaterThan(4);
    expect(profileReports.length).toBeGreaterThan(1);
    expect(analyticsReports.length).toBe(1);
    expect(checkoutSharedReport?.shared?.provider).toBe(
      'observability_consumer_checkout',
    );
    expect(analyticsSharedReport?.shared?.provider).toBe(
      'observability_consumer_analytics',
    );
    expect(cachedRemoteReport?.summary.flags.cached).toBe(true);
    expect(
      checkoutSharedReports.some((sharedReport) =>
        checkoutComponentReport?.events.some(
          (event) => event.metadata?.sharedTraceId === sharedReport.traceId,
        ),
      ),
    ).toBe(true);
  }
});

it('exposes an eager config observability scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-eager-config-error"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-async-shared');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('sync-async-boundary');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-005');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"ownerHint": "shared"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.shared.reason).toBe('sync-async-boundary');
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-eager-config',
      ),
    ).toBe(true);
  }
});

it('exposes a runtime eager config observability scenario', async () => {
  await renderRoute('/observability');
  await page
    .locator('[data-testid="observability-runtime-eager-config-error"]')
    .click();
  await expect
    .element(page.getByTestId('observability-load-status'))
    .toContainText('error');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('observability-runtime-async-shared');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('sync-async-boundary');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('RUNTIME-006');
  await expect
    .element(page.getByTestId('observability-report'))
    .toContainText('"ownerHint": "shared"');
  {
    const latestReport = observability.getLatestReport();
    expect(latestReport.status).toBe('error');
    expect(latestReport.errorCode).toBe('RUNTIME-006');
    expect(latestReport.shared.reason).toBe('sync-async-boundary');
    expect(
      latestReport.diagnosis.actions.some(
        (action: { id: string }) => action.id === 'check-eager-config',
      ),
    ).toBe(true);
  }
});

it('presents a product page route flow for AI observability', async () => {
  await renderRoute('/observability-showcase');
  await expect
    .element(page.getByText('Suggested prompt', { exact: true }))
    .toHaveCount(0);
  await expect
    .element(page.getByText('AI-ready evidence', { exact: true }))
    .toHaveCount(0);
  await expect
    .element(
      page.getByText('Show latest observability report', { exact: true }),
    )
    .toHaveCount(0);
  await expect
    .element(
      page.getByText(
        'This view is loaded by createInstance when the page opens.',
        { exact: true },
      ),
    )
    .toHaveCount(0);
  await expect
    .element(page.getByTestId('observability-showcase-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('remote2-profile-card'))
    .toContainText('ProfileCard');
  await expect
    .poll(() => {
      const reports = observability.getReports();
      const profileReport = reports.find(
        (report) =>
          report.requestId === 'dynamic-remote/ProfileCard' &&
          report.summary.componentLoaded === true,
      );
      expect(profileReport?.summary.componentLoaded).toBe(true);
      expect(profileReport?.summary.outcome).toBe('component-loaded');
      expect(
        profileReport?.events.some(
          (event) =>
            event.eventName === 'component:business-loaded' &&
            event.metadata?.producer === 'runtime_remote2',
        ),
      ).toBe(true);
      return true;
    })
    .toBe(true);
  await page.getByTestId('observability-showcase-handoff').click();
  await expect
    .element(page.getByTestId('observability-showcase-handoff-status'))
    .toContainText('success');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('Account desk');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('Expansion desk');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('Success desk');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('dynamic-remote/ProfileCard');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('dynamic-remote/AnalyticsPanel');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('renewal-account-context');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-results'))
    .toContainText('renewal-insight-context');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-report'))
    .toContainText('renewal-handoff-chain');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-report'))
    .toContainText('observability_showcase_account_desk');
  await expect
    .element(page.getByTestId('observability-showcase-handoff-report'))
    .toContainText('observability_showcase_expansion_desk');
  {
    const profileReports = observability.findReports({
      remote: 'runtime_remote2',
      expose: 'ProfileCard',
    });
    const analyticsReports = observability.findReports({
      remote: 'runtime_remote2',
      expose: 'AnalyticsPanel',
    });
    const accountSharedReports = observability.findReports({
      shared: 'renewal-account-context',
    });
    const insightSharedReports = observability.findReports({
      shared: 'renewal-insight-context',
    });
    const handoffProfileReport = profileReports.find((report) =>
      report.events.some(
        (event) =>
          event.eventName === 'component:business-loaded' &&
          event.metadata?.scenario === 'renewal-handoff-chain' &&
          event.metadata?.owner === 'Account desk',
      ),
    );
    expect(profileReports.length).toBeGreaterThan(1);
    expect(analyticsReports.length).toBeGreaterThan(0);
    expect(accountSharedReports.length).toBeGreaterThan(0);
    expect(insightSharedReports.length).toBeGreaterThan(0);
    expect(
      accountSharedReports.some(
        (report) =>
          report.shared?.provider === 'observability_showcase_account_desk' ||
          report.shared?.provider === 'observability_showcase_success_desk',
      ),
    ).toBe(true);
    expect(
      insightSharedReports.some(
        (report) =>
          report.shared?.provider === 'observability_showcase_expansion_desk',
      ),
    ).toBe(true);
    expect(handoffProfileReport?.summary.componentLoaded).toBe(true);
  }
  await page.getByTestId('observability-showcase-load').click();
  expect(window.location.pathname).toBe('/observability-showcase/analytics');
  await expect
    .element(page.getByTestId('observability-showcase-status'))
    .toContainText('degraded');
  await expect
    .element(page.getByTestId('observability-showcase-fallback'))
    .toContainText('Limited analytics view');
  await expect
    .element(page.getByTestId('observability-showcase-message'))
    .toContainText('Some analytics details are temporarily unavailable');
  await expect
    .element(page.getByTestId('observability-showcase-shared'))
    .toContainText('Detailed analytics are temporarily limited');
  {
    const reports = observability.getReports();
    const customerSdkReport = reports.find(
      (report) =>
        report.shared?.name === 'observability-customer-sdk' &&
        report.summary.outcome === 'recovered',
    );
    expect(
      reports.some(
        (report) => report.requestId === 'dynamic-remote/ProfileCard',
      ),
    ).toBe(true);
    expect(
      reports.some(
        (report) => report.requestId === 'dynamic-remote/AnalyticsPanel',
      ),
    ).toBe(true);
    expect(reports.some((report) => report.shared?.name === 'react')).toBe(
      true,
    );
    expect(
      reports.some(
        (report) => report.shared?.name === 'observability-customer-sdk',
      ),
    ).toBe(true);
    expect(customerSdkReport?.status).toBe('success');
    expect(customerSdkReport?.summary.outcome).toBe('recovered');
    expect(customerSdkReport?.shared?.reason).toBe(
      'custom-share-info-unmatched',
    );
    expect(customerSdkReport?.shared?.availableVersions).toContain('2.1.0');
  }
});
