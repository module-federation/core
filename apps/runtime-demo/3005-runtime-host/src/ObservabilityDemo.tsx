import React, { useCallback, useState } from 'react';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import {
  createInstance,
  getInstance,
  loadRemote,
  loadShare,
  loadShareSync,
  registerPlugins,
  registerRemotes,
} from '@module-federation/runtime';
import { observability } from './observability';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

type RemoteComponent = React.ComponentType<Record<string, never>>;

const successRequest = 'dynamic-remote/ButtonOldAnt';
const missingExposeRequest = 'dynamic-remote/__missing_expose__';
const brokenManifestEntry =
  'http://127.0.0.1:3005/observability-missing/mf-manifest.json?token=demo-secret#hash';
const brokenManifestRequest = 'observability-broken-remote/Button';
const remoteUrlErrorEntry =
  'http://127.0.0.1:3999/observability-remote-url/mf-manifest.json';
const remoteUrlErrorRequest = 'observability-remote-url/Button';
const retryRecoveryRemoteName = 'observability_retry_recovered_remote';
const retryRecoveryManifestEntry =
  'http://127.0.0.1:3005/observability-fixtures/retry-recovered/mf-manifest.json';
const retryRecoveryRequest = 'observability-retry-recovered/Button';
const fallbackRequest = 'dynamic-remote/__observability_fallback__';
const missingFieldsManifestEntry =
  'http://127.0.0.1:3005/observability-fixtures/missing-fields/mf-manifest.json';
const missingFieldsManifestRequest = 'observability-missing-fields/Button';
const wrongGlobalManifestEntry =
  'http://127.0.0.1:3005/observability-fixtures/wrong-global/mf-manifest.json';
const wrongGlobalRequest = 'observability-wrong-global/Button';
const executionErrorManifestEntry =
  'http://127.0.0.1:3005/observability-fixtures/execution-error/mf-manifest.json';
const executionErrorRequest = 'observability-execution-error/Button';
const multiProducerRemoteName = 'runtime_remote2';
const multiProducerAlias = 'dynamic-remote';
const multiProducerManifestEntry = 'http://127.0.0.1:3007/mf-manifest.json';
const snapshotMissRequest = 'observability-snapshot-miss/Button';
const unexpectedProviderSharedName = 'observability-provider-choice';
const unexpectedProviderSharedScope = 'observability-provider-scope';

type RuntimeRemote = Parameters<typeof registerRemotes>[0][number];
type RuntimeShareScope = Parameters<
  NonNullable<ReturnType<typeof getInstance>>['initShareScopeMap']
>[1];
type SharedProviderValue = {
  provider: string;
  version: string;
};

interface MultiConsumerScenario {
  consumer: string;
  request: string;
  expose: string;
  componentName: string;
  sharedName: string;
  sharedScope: string;
  requiredVersion: string;
  hostVersion: string;
  expectedProvider: string;
}

interface MultiConsumerResult {
  consumer: string;
  request: string;
  expose: string;
  sharedName: string;
  sharedProvider: string;
  sharedVersion: string;
  sharedTraceId: string;
  remoteTraceId: string;
  remoteEntryCached: boolean;
  manifestCached: boolean;
  summaryCached: boolean;
}

interface RegisteredRemoteFailureScenario {
  remote: RuntimeRemote;
  request: string;
  errorPrefix?: string;
}

const multiConsumerScenarios: MultiConsumerScenario[] = [
  {
    consumer: 'checkout-page',
    request: `${multiProducerAlias}/ProfileCard`,
    expose: './ProfileCard',
    componentName: 'ProfileCard',
    sharedName: 'observability-checkout-theme',
    sharedScope: 'observability-checkout-scope',
    requiredVersion: '^1.0.0',
    hostVersion: '1.4.0',
    expectedProvider: 'observability_consumer_checkout',
  },
  {
    consumer: 'analytics-page',
    request: `${multiProducerAlias}/AnalyticsPanel`,
    expose: './AnalyticsPanel',
    componentName: 'AnalyticsPanel',
    sharedName: 'observability-analytics-sdk',
    sharedScope: 'observability-analytics-scope',
    requiredVersion: '^1.0.0',
    hostVersion: '1.2.0',
    expectedProvider: 'observability_consumer_analytics',
  },
  {
    consumer: 'checkout-page-repeat',
    request: `${multiProducerAlias}/ProfileCard`,
    expose: './ProfileCard',
    componentName: 'ProfileCard',
    sharedName: 'observability-checkout-theme',
    sharedScope: 'observability-checkout-scope',
    requiredVersion: '^1.0.0',
    hostVersion: '1.4.0',
    expectedProvider: 'observability_consumer_checkout',
  },
];

function sanitizeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  return message
    .replace(/https?:\/\/[^\s'"<>]+/g, (url) => {
      try {
        const parsedUrl = new URL(url);
        return `${parsedUrl.origin}${parsedUrl.pathname}`;
      } catch {
        return '[redacted-url]';
      }
    })
    .replace(
      /\b(token|authorization|cookie|secret|password)=([^&\s]+)/gi,
      '$1=[redacted]',
    );
}

function resolveRemoteComponent(remoteModule: unknown): RemoteComponent | null {
  if (typeof remoteModule === 'function') {
    return remoteModule as RemoteComponent;
  }

  if (remoteModule && typeof remoteModule === 'object') {
    const candidate = (remoteModule as { default?: unknown }).default;

    if (typeof candidate === 'function') {
      return candidate as RemoteComponent;
    }
  }

  return null;
}

function createUnexpectedProviderShareScope(): RuntimeShareScope {
  return {
    [unexpectedProviderSharedName]: {
      '1.0.0': {
        version: '1.0.0',
        get: () => () => ({
          provider: 'runtime_host',
          version: '1.0.0',
        }),
        lib: () => ({
          provider: 'runtime_host',
          version: '1.0.0',
        }),
        shareConfig: {
          requiredVersion: false,
          singleton: false,
          eager: false,
          strictVersion: false,
        },
        scope: [unexpectedProviderSharedScope],
        useIn: ['runtime_host'],
        from: 'runtime_host',
        deps: [],
        strategy: 'version-first',
      },
      '2.0.0': {
        version: '2.0.0',
        get: () => () => ({
          provider: 'runtime_remote2',
          version: '2.0.0',
        }),
        lib: () => ({
          provider: 'runtime_remote2',
          version: '2.0.0',
        }),
        shareConfig: {
          requiredVersion: false,
          singleton: false,
          eager: false,
          strictVersion: false,
        },
        scope: [unexpectedProviderSharedScope],
        useIn: ['runtime_remote2'],
        from: 'runtime_remote2',
        deps: [],
        strategy: 'version-first',
      },
    },
  };
}

function ObservabilityFallbackRemote() {
  return null;
}

const observabilityRetryRecoveryPlugin: ModuleFederationRuntimePlugin = {
  name: 'observability-retry-recovery-plugin',
  async loadEntryError({
    getRemoteEntry,
    origin,
    remoteInfo,
    remoteEntryExports,
    globalLoading,
    uniqueKey,
  }) {
    if (remoteInfo.name !== retryRecoveryRemoteName) {
      return undefined;
    }

    delete globalLoading[uniqueKey];

    return getRemoteEntry({
      origin,
      remoteInfo,
      remoteEntryExports,
      getEntryUrl: (url: string) => {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}retryCount=1`;
      },
    });
  },
};

const observabilityFallbackPlugin: ModuleFederationRuntimePlugin = {
  name: 'observability-fallback-plugin',
  async errorLoadRemote({ id, lifecycle }) {
    if (id !== fallbackRequest || lifecycle !== 'onLoad') {
      return undefined;
    }

    return {
      default: ObservabilityFallbackRemote,
    };
  },
};

export default function ObservabilityDemo() {
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [remoteComponent, setRemoteComponent] =
    useState<RemoteComponent | null>(null);
  const [multiConsumerResults, setMultiConsumerResults] = useState<
    MultiConsumerResult[]
  >([]);
  const [reportText, setReportText] = useState('null');

  const refreshReport = useCallback(() => {
    setReportText(
      JSON.stringify(observability.getLatestReport() ?? null, null, 2),
    );
  }, []);

  const loadSuccessRemote = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const remoteModule = await loadRemote(successRequest);
      const component = resolveRemoteComponent(remoteModule);

      if (!component) {
        throw new Error(`Remote module ${successRequest} has no component`);
      }

      setRemoteComponent(() => component);
      setStatus('success');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadMissingExpose = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const remoteModule = await loadRemote(missingExposeRequest);

      if (!remoteModule) {
        throw new Error(`Remote module ${missingExposeRequest} returned empty`);
      }

      throw new Error(
        `Remote module ${missingExposeRequest} unexpectedly loaded`,
      );
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadRegisteredRemoteFailure = useCallback(
    async (scenario: RegisteredRemoteFailureScenario) => {
      setStatus('loading');
      setErrorMessage('');
      setRemoteComponent(null);

      registerRemotes([scenario.remote], { force: true });

      try {
        await loadRemote(scenario.request);
        throw new Error(
          `Remote module ${scenario.request} unexpectedly loaded`,
        );
      } catch (error) {
        const message = sanitizeErrorMessage(
          `${scenario.errorPrefix || ''} ${error}`,
        );
        setStatus('error');
        setErrorMessage(message);
      } finally {
        refreshReport();
      }
    },
    [refreshReport],
  );

  const loadBrokenManifest = useCallback(async () => {
    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_broken_remote',
        alias: 'observability-broken-remote',
        entry: brokenManifestEntry,
      },
      request: brokenManifestRequest,
      errorPrefix: brokenManifestEntry,
    });
  }, [loadRegisteredRemoteFailure]);

  const loadRemoteUrlError = useCallback(async () => {
    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_remote_url_remote',
        alias: 'observability-remote-url',
        entry: remoteUrlErrorEntry,
      },
      request: remoteUrlErrorRequest,
      errorPrefix: remoteUrlErrorEntry,
    });
  }, [loadRegisteredRemoteFailure]);

  const loadRetryRecoveredRemote = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    registerPlugins([observabilityRetryRecoveryPlugin]);
    registerRemotes(
      [
        {
          name: retryRecoveryRemoteName,
          alias: 'observability-retry-recovered',
          entry: retryRecoveryManifestEntry,
        },
      ],
      { force: true },
    );

    try {
      const remoteModule = await loadRemote(retryRecoveryRequest);
      const component = resolveRemoteComponent(remoteModule);

      if (!component) {
        throw new Error(
          `Remote module ${retryRecoveryRequest} has no component`,
        );
      }

      setRemoteComponent(() => component);
      setStatus('success');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadFallbackRemote = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    registerPlugins([observabilityFallbackPlugin]);

    try {
      const remoteModule = await loadRemote(fallbackRequest);
      const component = resolveRemoteComponent(remoteModule);

      if (!component) {
        throw new Error(`Remote module ${fallbackRequest} has no component`);
      }

      setRemoteComponent(() => component);
      setStatus('success');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadMissingFieldsManifest = useCallback(async () => {
    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_missing_fields_remote',
        alias: 'observability-missing-fields',
        entry: missingFieldsManifestEntry,
      },
      request: missingFieldsManifestRequest,
      errorPrefix: missingFieldsManifestEntry,
    });
  }, [loadRegisteredRemoteFailure]);

  const loadWrongGlobalName = useCallback(async () => {
    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_wrong_global_remote',
        alias: 'observability-wrong-global',
        entry: wrongGlobalManifestEntry,
      },
      request: wrongGlobalRequest,
      errorPrefix: wrongGlobalManifestEntry,
    });
  }, [loadRegisteredRemoteFailure]);

  const loadRemoteEntryExecutionError = useCallback(async () => {
    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_execution_error_remote',
        alias: 'observability-execution-error',
        entry: executionErrorManifestEntry,
      },
      request: executionErrorRequest,
      errorPrefix: executionErrorManifestEntry,
    });
  }, [loadRegisteredRemoteFailure]);

  const loadSnapshotMatchError = useCallback(async () => {
    const federation = (
      globalThis as {
        __FEDERATION__?: {
          moduleInfo?: Record<string, unknown>;
        };
      }
    ).__FEDERATION__;

    if (federation) {
      federation.moduleInfo = {
        ...federation.moduleInfo,
        'remote:observability-unrelated-snapshot': {
          publicPath:
            'http://127.0.0.1:3005/observability-fixtures/unrelated-snapshot/',
          getPublicPath:
            'function getPublicPath(){return "http://127.0.0.1:3005/observability-fixtures/unrelated-snapshot/";}',
          remoteEntry:
            'http://127.0.0.1:3005/observability-fixtures/unrelated-snapshot/remoteEntry.js',
          globalName: 'observability_unrelated_snapshot',
          modules: [{ moduleName: 'Button' }],
          shared: [{ sharedName: 'react' }],
        },
      };
    }

    await loadRegisteredRemoteFailure({
      remote: {
        name: 'observability_snapshot_miss_remote',
        alias: 'observability-snapshot-miss',
        version: '1.0.0',
      },
      request: snapshotMissRequest,
      errorPrefix: 'observability-snapshot-miss@1.0.0',
    });
  }, [loadRegisteredRemoteFailure]);

  const loadSharedMiss = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const result = await loadShare('observability-missing-shared', {
        customShareInfo: {
          version: '1.0.0',
          scope: ['observability-missing-scope'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
          },
        },
      });

      if (result === false) {
        throw new Error(
          'Shared miss: observability-missing-shared was not provided by host',
        );
      }

      throw new Error('Shared miss scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadSharedVersionMismatch = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const result = await loadShare('react', {
        customShareInfo: {
          shareConfig: {
            requiredVersion: '^99.0.0',
            singleton: false,
          },
        },
      });

      if (result === false) {
        throw new Error('Shared version mismatch: react needs ^99.0.0');
      }

      throw new Error('Shared version mismatch scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadSharedUnexpectedProvider = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      const instance = getInstance();

      if (!instance) {
        throw new Error('Runtime instance is not initialized');
      }

      instance.initShareScopeMap(
        unexpectedProviderSharedScope,
        createUnexpectedProviderShareScope(),
      );

      const result = await loadShare<SharedProviderValue>(
        unexpectedProviderSharedName,
        {
          customShareInfo: {
            scope: [unexpectedProviderSharedScope],
            shareConfig: {
              requiredVersion: '^2.0.0',
              singleton: false,
              eager: false,
              strictVersion: false,
            },
          },
        },
      );

      if (result === false) {
        throw new Error(
          'Shared provider choice: observability-provider-choice was not resolved',
        );
      }

      const sharedValue = result();

      if (!sharedValue) {
        throw new Error(
          'Shared provider choice: observability-provider-choice returned empty',
        );
      }

      setStatus('success');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const runMultiConsumerScenario = useCallback(
    async (
      runtimeInstance: ReturnType<typeof createInstance>,
      scenario: MultiConsumerScenario,
    ): Promise<MultiConsumerResult> => {
      const sharedFactory =
        await runtimeInstance.loadShare<SharedProviderValue>(
          scenario.sharedName,
          {
            customShareInfo: {
              scope: [scenario.sharedScope],
              shareConfig: {
                requiredVersion: scenario.requiredVersion,
                singleton: false,
                eager: false,
                strictVersion: false,
              },
            },
          },
        );

      if (sharedFactory === false) {
        throw new Error(
          `${scenario.consumer} could not resolve ${scenario.sharedName}`,
        );
      }

      const sharedValue = sharedFactory();
      const sharedReport = observability.getLatestReport();
      const sharedTraceId = sharedReport?.traceId || '';

      if (!sharedValue) {
        throw new Error(
          `${scenario.consumer} resolved an empty ${scenario.sharedName}`,
        );
      }

      const remoteModule = await runtimeInstance.loadRemote(scenario.request);
      const component = resolveRemoteComponent(remoteModule);

      if (!component) {
        throw new Error(`Remote module ${scenario.request} has no component`);
      }

      const remoteReportBeforeComponent = observability.getLatestReport();
      const remoteTraceId = remoteReportBeforeComponent?.traceId || '';

      observability.markComponentLoaded({
        traceId: remoteTraceId,
        requestId: scenario.request,
        componentName: scenario.componentName,
        metadata: {
          consumer: scenario.consumer,
          producer: multiProducerRemoteName,
          expose: scenario.expose,
          sharedName: scenario.sharedName,
          sharedProvider: sharedValue.provider,
          sharedVersion: sharedValue.version,
          sharedTraceId,
        },
      });

      const remoteReport = observability.getReport(remoteTraceId);

      return {
        consumer: scenario.consumer,
        request: scenario.request,
        expose: scenario.expose,
        sharedName: scenario.sharedName,
        sharedProvider: sharedValue.provider,
        sharedVersion: sharedValue.version,
        sharedTraceId,
        remoteTraceId,
        remoteEntryCached:
          remoteReport?.summary.phases.remoteEntry?.cached === true,
        manifestCached: remoteReport?.summary.phases.manifest?.cached === true,
        summaryCached: remoteReport?.summary.flags.cached === true,
      };
    },
    [],
  );

  const loadMultiConsumerChain = useCallback(async () => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);
    setMultiConsumerResults([]);
    observability.clear();

    try {
      const checkoutConsumer = createInstance({
        name: 'observability_consumer_checkout',
        version: '1.0.0',
        plugins: [observability.plugin],
        remotes: [
          {
            name: multiProducerRemoteName,
            alias: multiProducerAlias,
            entry: multiProducerManifestEntry,
          },
        ],
        shared: {
          'observability-checkout-theme': {
            version: '1.4.0',
            scope: ['observability-checkout-scope'],
            lib: () => ({
              provider: 'observability_consumer_checkout',
              version: '1.4.0',
            }),
            shareConfig: {
              requiredVersion: '^1.0.0',
              singleton: false,
              eager: false,
              strictVersion: false,
            },
          },
        },
      });
      const analyticsConsumer = createInstance({
        name: 'observability_consumer_analytics',
        version: '1.0.0',
        plugins: [observability.plugin],
        remotes: [
          {
            name: multiProducerRemoteName,
            alias: multiProducerAlias,
            entry: multiProducerManifestEntry,
          },
        ],
        shared: {
          'observability-analytics-sdk': {
            version: '1.2.0',
            scope: ['observability-analytics-scope'],
            lib: () => ({
              provider: 'observability_consumer_analytics',
              version: '1.2.0',
            }),
            shareConfig: {
              requiredVersion: '^1.0.0',
              singleton: false,
              eager: false,
              strictVersion: false,
            },
          },
        },
      });
      const consumerInstances: Record<
        string,
        ReturnType<typeof createInstance>
      > = {
        'checkout-page': checkoutConsumer,
        'analytics-page': analyticsConsumer,
        'checkout-page-repeat': checkoutConsumer,
      };

      const results: MultiConsumerResult[] = [];

      for (const scenario of multiConsumerScenarios) {
        const result = await runMultiConsumerScenario(
          consumerInstances[scenario.consumer],
          scenario,
        );

        if (result.sharedProvider !== scenario.expectedProvider) {
          throw new Error(
            `${scenario.consumer} expected ${scenario.expectedProvider} but used ${result.sharedProvider}`,
          );
        }

        results.push(result);
      }

      setMultiConsumerResults(results);
      setStatus('success');
      setReportText(
        JSON.stringify(
          {
            scenario: 'multi-consumer-loading-chain',
            results,
            reports: observability.getReports({ limit: 12 }),
          },
          null,
          2,
        ),
      );
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
      refreshReport();
    }
  }, [refreshReport, runMultiConsumerScenario]);

  const loadEagerConfigError = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      loadShareSync('observability-async-shared', {
        from: 'build',
        customShareInfo: {
          version: '1.0.0',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
            eager: false,
            strictVersion: false,
          },
          get: () =>
            Promise.resolve(() => ({
              value: 'async shared should not be consumed synchronously',
            })),
        },
      });

      throw new Error('Eager config scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);

  const loadRuntimeEagerConfigError = useCallback(() => {
    setStatus('loading');
    setErrorMessage('');
    setRemoteComponent(null);

    try {
      loadShareSync('observability-runtime-async-shared', {
        from: 'runtime',
        customShareInfo: {
          version: '1.0.0',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^1.0.0',
            singleton: false,
            eager: false,
            strictVersion: false,
          },
          get: () =>
            Promise.resolve(() => ({
              value:
                'runtime async shared should not be consumed synchronously',
            })),
        },
      });

      throw new Error('Runtime eager config scenario unexpectedly loaded');
    } catch (error) {
      const message = sanitizeErrorMessage(error);
      setStatus('error');
      setErrorMessage(message);
    } finally {
      refreshReport();
    }
  }, [refreshReport]);
  const markBusinessLoaded = useCallback(() => {
    observability.markComponentLoaded({
      requestId: successRequest,
      componentName: 'ButtonOldAnt',
      metadata: {
        route: '/observability?token=demo-secret#hash',
        rendered: true,
      },
    });
    refreshReport();
  }, [refreshReport]);

  const LoadedRemote = remoteComponent;

  return (
    <main>
      <h2>Observability Demo</h2>

      <section>
        <h3>Load Remote</h3>
        <button
          data-testid="observability-load-success"
          type="button"
          onClick={loadSuccessRemote}
        >
          Load success remote
        </button>
        <button
          data-testid="observability-load-missing-expose"
          type="button"
          onClick={loadMissingExpose}
        >
          Load missing expose
        </button>
        <button
          data-testid="observability-load-broken-manifest"
          type="button"
          onClick={loadBrokenManifest}
        >
          Load broken manifest
        </button>
        <button
          data-testid="observability-load-remote-url-error"
          type="button"
          onClick={loadRemoteUrlError}
        >
          Load remote URL error
        </button>
        <button
          data-testid="observability-load-retry-recovered"
          type="button"
          onClick={loadRetryRecoveredRemote}
        >
          Load retry recovered
        </button>
        <button
          data-testid="observability-load-fallback-success"
          type="button"
          onClick={loadFallbackRemote}
        >
          Load fallback success
        </button>
        <button
          data-testid="observability-load-missing-fields-manifest"
          type="button"
          onClick={loadMissingFieldsManifest}
        >
          Load manifest missing fields
        </button>
        <button
          data-testid="observability-load-wrong-global"
          type="button"
          onClick={loadWrongGlobalName}
        >
          Load wrong globalName
        </button>
        <button
          data-testid="observability-load-remote-entry-execution-error"
          type="button"
          onClick={loadRemoteEntryExecutionError}
        >
          Load remoteEntry execution error
        </button>
        <button
          data-testid="observability-load-snapshot-match-error"
          type="button"
          onClick={loadSnapshotMatchError}
        >
          Load snapshot match error
        </button>
        <button
          data-testid="observability-business-loaded"
          type="button"
          onClick={markBusinessLoaded}
        >
          Mark business loaded
        </button>
      </section>

      <section>
        <h3>Shared / Eager Scenarios</h3>
        <button
          data-testid="observability-shared-miss"
          type="button"
          onClick={loadSharedMiss}
        >
          Shared miss
        </button>
        <button
          data-testid="observability-shared-version-mismatch"
          type="button"
          onClick={loadSharedVersionMismatch}
        >
          Shared version mismatch
        </button>
        <button
          data-testid="observability-shared-unexpected-provider"
          type="button"
          onClick={loadSharedUnexpectedProvider}
        >
          Shared unexpected provider
        </button>
        <button
          data-testid="observability-eager-config-error"
          type="button"
          onClick={loadEagerConfigError}
        >
          Eager config error
        </button>
        <button
          data-testid="observability-runtime-eager-config-error"
          type="button"
          onClick={loadRuntimeEagerConfigError}
        >
          Runtime eager config error
        </button>
      </section>

      <section>
        <h3>Multi Consumer Loading Chain</h3>
        <button
          data-testid="observability-multi-consumer-chain"
          type="button"
          onClick={loadMultiConsumerChain}
        >
          Load multi-consumer chain
        </button>
        {multiConsumerResults.length ? (
          <ul data-testid="observability-multi-consumer-results">
            {multiConsumerResults.map((result) => (
              <li key={`${result.consumer}-${result.request}`}>
                {result.consumer} loaded {result.request} with{' '}
                {result.sharedName} from {result.sharedProvider}@
                {result.sharedVersion}; remoteTrace={result.remoteTraceId};
                sharedTrace={result.sharedTraceId}; cached=
                {String(result.summaryCached)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section>
        <h3>Status</h3>
        <p data-testid="observability-load-status">{status}</p>
        {errorMessage ? (
          <pre data-testid="observability-error-message">{errorMessage}</pre>
        ) : null}
        {LoadedRemote ? (
          <div data-testid="observability-remote-result">
            <LoadedRemote />
          </div>
        ) : null}
      </section>

      <section>
        <h3>Report Fixture</h3>
        <pre data-testid="observability-report">{reportText}</pre>
      </section>
    </main>
  );
}
