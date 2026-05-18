import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getObservabilityReportScopeLabel,
  mergeObservabilityReports,
  readObservabilitySnapshot,
} from '../src/utils/chrome/observability';
import {
  createObservabilityPluginOptions,
  DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
  normalizeObservabilityDevtoolsConfig,
} from '../src/utils/chrome/observability-shared';

describe('observability devtools config', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'chrome');
    Reflect.deleteProperty(window, '__FEDERATION__');
    Reflect.deleteProperty(window, '__VMOK__');
    window.targetTab = undefined as any;
    window.localStorage.clear();
  });

  it('defaults to development mode with verbose events', () => {
    expect(normalizeObservabilityDevtoolsConfig()).toMatchObject({
      enabled: true,
      level: 'verbose',
      browser: {
        enabled: true,
        scope: 'chrome_extension',
        mode: 'development',
      },
      trace: {
        printStart: true,
      },
    });
  });

  it('normalizes unsafe values and keeps valid production overrides', () => {
    expect(
      normalizeObservabilityDevtoolsConfig({
        ...DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
        level: 'summary',
        maxEvents: 5000,
        browser: {
          enabled: true,
          mode: 'production',
          scope: 'runtime host!',
        },
        react: {
          injectLoadedCallback: true,
          remoteIds: 'remote/Button, remote/Card',
        },
      }),
    ).toMatchObject({
      level: 'summary',
      maxEvents: 1000,
      browser: {
        mode: 'production',
        scope: 'runtime-host-',
      },
      react: {
        injectLoadedCallback: false,
        remoteIds: [],
      },
    });
  });

  it('merges reports by trace id and keeps newest first', () => {
    const reports = mergeObservabilityReports(
      [
        {
          traceId: 'a',
          status: 'pending',
          startedAt: 1,
          updatedAt: 1,
          duration: 0,
          events: [],
        },
      ],
      [
        {
          traceId: 'a',
          status: 'success',
          startedAt: 1,
          updatedAt: 3,
          duration: 2,
          events: [],
        },
        {
          traceId: 'b',
          status: 'pending',
          startedAt: 2,
          updatedAt: 2,
          duration: 0,
          events: [],
        },
      ],
    );

    expect(reports.map((report) => report.traceId)).toEqual(['a', 'b']);
    expect(reports[0].status).toBe('success');
  });

  it('only labels application-owned observability scopes', () => {
    expect(
      getObservabilityReportScopeLabel({ __scope: 'chrome_extension' }),
    ).toBeUndefined();
    expect(getObservabilityReportScopeLabel({})).toBeUndefined();
    expect(getObservabilityReportScopeLabel({ __scope: 'runtime_host' })).toBe(
      'custom: runtime_host',
    );
  });

  it('keeps reports without runtime version as basic observability regardless of scope', async () => {
    window.targetTab = { id: 8080 } as chrome.tabs.Tab;
    window.__FEDERATION__ = {
      __OBSERVABILITY__: {
        runtime_host: {
          getReports: () => [
            {
              traceId: 'trace-unknown-version',
              status: 'pending',
              startedAt: 1,
              updatedAt: 2,
              duration: 1,
              events: [],
            },
          ],
        },
      },
    } as any;

    const executeScript = vi.fn(async ({ func, args }) => [
      { result: func(...args) },
    ]);

    vi.stubGlobal('chrome', {
      scripting: {
        executeScript,
      },
    });

    const snapshot = await readObservabilitySnapshot();

    expect(snapshot.reports[0]).toMatchObject({
      traceId: 'trace-unknown-version',
      __scope: 'runtime_host',
    });
    expect(snapshot.reports[0]).not.toHaveProperty('runtimeVersion');
  });

  it('does not pass React callback injection to the injected observability plugin', () => {
    const config = normalizeObservabilityDevtoolsConfig({
      ...DEFAULT_OBSERVABILITY_DEVTOOLS_CONFIG,
      react: {
        injectLoadedCallback: true,
        remoteIds: 'remote/Button',
      },
    });

    expect(config.react).toEqual({
      injectLoadedCallback: false,
      remoteIds: [],
    });
    expect(createObservabilityPluginOptions(config)).not.toHaveProperty(
      'react',
    );
  });

  it('reads application observability reports from the inspected page', async () => {
    window.targetTab = { id: 8080 } as chrome.tabs.Tab;
    window.__FEDERATION__ = {
      __INSTANCES__: [
        {
          options: {
            plugins: [{ name: 'observability-plugin' }],
          },
        },
      ],
      __OBSERVABILITY__: {
        runtime_host: {
          getReports: () => [
            {
              traceId: 'trace-1',
              status: 'success',
              startedAt: 1,
              updatedAt: 2,
              duration: 1,
              events: [],
            },
          ],
        },
      },
    } as any;

    const executeScript = vi.fn(async ({ func, args }) => [
      { result: func(...args) },
    ]);

    vi.stubGlobal('chrome', {
      scripting: {
        executeScript,
      },
    });

    const snapshot = await readObservabilitySnapshot();

    expect(snapshot.hasUserObservabilityPlugin).toBe(true);
    expect(snapshot.reports).toHaveLength(1);
    expect(snapshot.reports[0]).toMatchObject({
      traceId: 'trace-1',
      __scope: 'runtime_host',
    });
    expect(executeScript.mock.calls[0]?.[0].args[1]).toMatchObject({
      userPluginName: 'observability-plugin',
      chromeScope: 'chrome_extension',
    });
  });
});
