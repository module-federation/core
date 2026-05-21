import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createInstance } from '@module-federation/runtime';
import { useLocation, useNavigate } from 'react-router-dom';
import { observability } from './observability';
import './observability-showcase.css';

type ShowcaseStatus = 'loading' | 'success' | 'degraded' | 'error';
type ShowcaseRoute = 'profile' | 'analytics';
type RemoteComponent = React.ComponentType<Record<string, unknown>>;
type CustomerSdk = {
  provider: string;
  version: string;
  feature: string;
};
type LoadResult = {
  Component: RemoteComponent;
  traceId: string;
  shared: string[];
  status?: ShowcaseStatus;
  message?: string;
};
type HandoffStatus = 'idle' | 'loading' | 'success' | 'error';
type HandoffResult = {
  owner: string;
  step: string;
  request: string;
  expose: string;
  shared: string;
  traceId: string;
};
type HandoffScenario = {
  owner: string;
  consumerName: string;
  request: string;
  expose: string;
  componentName: string;
  sharedName: string;
  sharedScope: string;
  sharedVersion: string;
  requiredVersion: string;
};

const producerName = 'runtime_remote2';
const producerAlias = 'dynamic-remote';
const producerManifest = 'http://127.0.0.1:3007/mf-manifest.json';
const profileRequest = `${producerAlias}/ProfileCard`;
const analyticsRequest = `${producerAlias}/AnalyticsPanel`;
const analyticsConsumerName = 'observability_showcase_analytics_consumer';
const renewalHandoffScenarios: HandoffScenario[] = [
  {
    owner: 'Account desk',
    consumerName: 'observability_showcase_account_desk',
    request: profileRequest,
    expose: 'ProfileCard',
    componentName: 'ProfileCard',
    sharedName: 'renewal-account-context',
    sharedScope: 'renewal-account-scope',
    sharedVersion: '1.3.0',
    requiredVersion: '^1.0.0',
  },
  {
    owner: 'Expansion desk',
    consumerName: 'observability_showcase_expansion_desk',
    request: analyticsRequest,
    expose: 'AnalyticsPanel',
    componentName: 'AnalyticsPanel',
    sharedName: 'renewal-insight-context',
    sharedScope: 'renewal-insight-scope',
    sharedVersion: '2.2.0',
    requiredVersion: '^2.0.0',
  },
  {
    owner: 'Success desk',
    consumerName: 'observability_showcase_success_desk',
    request: profileRequest,
    expose: 'ProfileCard',
    componentName: 'ProfileCard',
    sharedName: 'renewal-account-context',
    sharedScope: 'renewal-account-scope',
    sharedVersion: '1.3.0',
    requiredVersion: '^1.0.0',
  },
];

function getRoute(pathname: string): ShowcaseRoute {
  return pathname.endsWith('/analytics') ? 'analytics' : 'profile';
}

function resolveRemoteComponent(remoteModule: unknown): RemoteComponent {
  if (typeof remoteModule === 'function') {
    return remoteModule as RemoteComponent;
  }

  if (remoteModule && typeof remoteModule === 'object') {
    const candidate = (remoteModule as { default?: unknown }).default;

    if (typeof candidate === 'function') {
      return candidate as RemoteComponent;
    }
  }

  throw new Error('Remote module did not return a React component');
}

function createSharedReact() {
  return {
    version: '18.3.1',
    scope: ['default'],
    lib: () => React,
    shareConfig: {
      requiredVersion: '^18.0.0',
      singleton: true,
      eager: false,
      strictVersion: false,
    },
  };
}

function createConsumer(
  name: string,
  shared?: Parameters<typeof createInstance>[0]['shared'],
) {
  return createInstance({
    name,
    version: '1.0.0',
    plugins: [observability.plugin],
    remotes: [
      {
        name: producerName,
        alias: producerAlias,
        entry: producerManifest,
      },
    ],
    shared: {
      react: createSharedReact(),
      ...(shared || {}),
    },
  });
}

async function loadProfileWidget() {
  const consumer = createConsumer('observability_showcase_profile_consumer');
  const remoteModule = await consumer.loadRemote(profileRequest);
  const Component = resolveRemoteComponent(remoteModule);
  const report = observability.getLatestReport();

  return {
    Component,
    traceId: report?.traceId || '',
    shared: [] as string[],
  } satisfies LoadResult;
}

async function loadAnalyticsWorkspace() {
  const consumer = createConsumer(analyticsConsumerName, {
    'observability-customer-sdk': {
      version: '2.1.0',
      scope: ['default'],
      lib: () => ({
        provider: analyticsConsumerName,
        version: '2.1.0',
        feature: 'customer-insights',
      }),
      shareConfig: {
        requiredVersion: '^2.0.0',
        singleton: false,
        eager: false,
        strictVersion: false,
      },
    },
  });
  const remoteModule = await consumer.loadRemote(analyticsRequest);
  resolveRemoteComponent(remoteModule);

  const reactFactory = await consumer.loadShare<typeof React>('react', {
    customShareInfo: {
      version: '18.3.1',
      scope: ['default'],
      shareConfig: {
        requiredVersion: '^18.0.0',
        singleton: true,
        eager: false,
        strictVersion: false,
      },
    },
  });
  const sdkFactory = await consumer.loadShare<CustomerSdk>(
    'observability-customer-sdk',
    {
      customShareInfo: {
        version: '2.1.0',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^3.0.0',
          singleton: false,
          eager: false,
          strictVersion: false,
        },
      },
    },
  );

  if (reactFactory === false) {
    throw new Error('React shared dependency was not resolved');
  }

  if (sdkFactory === false) {
    throw new Error('Customer SDK shared dependency was not resolved');
  }

  const sdk = sdkFactory();
  const Component = resolveRemoteComponent(remoteModule);
  const report = observability.getLatestReport();

  return {
    Component,
    traceId: report?.traceId || '',
    shared: [
      `react from ${analyticsConsumerName}@18.3.1`,
      `observability-customer-sdk from ${sdk.provider}@${sdk.version}`,
    ],
  } satisfies LoadResult;
}

async function loadRenewalHandoffChain() {
  const results: HandoffResult[] = [];

  for (const scenario of renewalHandoffScenarios) {
    const consumer = createConsumer(scenario.consumerName, {
      [scenario.sharedName]: {
        version: scenario.sharedVersion,
        scope: [scenario.sharedScope],
        lib: () => ({
          provider: scenario.consumerName,
          version: scenario.sharedVersion,
          owner: scenario.owner,
        }),
        shareConfig: {
          requiredVersion: scenario.requiredVersion,
          singleton: false,
          eager: false,
          strictVersion: false,
        },
      },
    });
    const sharedFactory = await consumer.loadShare<{
      provider: string;
      version: string;
      owner: string;
    }>(scenario.sharedName, {
      customShareInfo: {
        version: scenario.sharedVersion,
        scope: [scenario.sharedScope],
        shareConfig: {
          requiredVersion: scenario.requiredVersion,
          singleton: false,
          eager: false,
          strictVersion: false,
        },
      },
    });

    if (sharedFactory === false) {
      throw new Error(`${scenario.sharedName} was not resolved`);
    }

    const sharedValue = sharedFactory();
    const sharedReport = observability.getLatestReport();
    const remoteModule = await consumer.loadRemote(scenario.request);
    resolveRemoteComponent(remoteModule);
    const remoteReport = observability.getLatestReport();
    const traceId = remoteReport?.traceId || '';

    observability.markComponentLoaded({
      traceId,
      requestId: scenario.request,
      componentName: scenario.componentName,
      metadata: {
        scenario: 'renewal-handoff-chain',
        consumer: scenario.consumerName,
        owner: scenario.owner,
        producer: producerName,
        expose: `./${scenario.expose}`,
        sharedName: scenario.sharedName,
        sharedTraceId: sharedReport?.traceId || '',
      },
    });

    results.push({
      owner: scenario.owner,
      step:
        scenario.expose === 'AnalyticsPanel'
          ? 'Expansion risk review'
          : 'Account owner review',
      request: scenario.request,
      expose: scenario.expose,
      shared: `${scenario.sharedName} from ${sharedValue.provider}@${sharedValue.version}`,
      traceId,
    });
  }

  return results;
}

function AnalyticsFallback() {
  return (
    <section
      className="customer-portal__remote-widget"
      data-testid="observability-showcase-fallback"
    >
      <h3>Limited analytics view</h3>
      <p>
        Key account metrics are still available while detailed insights are
        temporarily limited.
      </p>
      <div className="customer-portal__remote-meta">
        <span>summary available</span>
        <span>details limited</span>
        <span>support reference ready</span>
      </div>
    </section>
  );
}

function getLatestTraceId(): string {
  return observability.getLatestReport()?.traceId ?? 'pending';
}

export default function ObservabilityShowcase() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = useMemo(() => getRoute(location.pathname), [location.pathname]);
  const [status, setStatus] = useState<ShowcaseStatus>('loading');
  const [referenceId, setReferenceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [remoteComponent, setRemoteComponent] =
    useState<RemoteComponent | null>(null);
  const [sharedEvidence, setSharedEvidence] = useState<string[]>([]);
  const [handoffStatus, setHandoffStatus] = useState<HandoffStatus>('idle');
  const [handoffResults, setHandoffResults] = useState<HandoffResult[]>([]);
  const [handoffError, setHandoffError] = useState('');

  useEffect(() => {
    let disposed = false;

    setStatus('loading');
    setReferenceId('');
    setErrorMessage('');
    setRemoteComponent(null);
    setSharedEvidence([]);

    const load =
      route === 'analytics' ? loadAnalyticsWorkspace : loadProfileWidget;

    load()
      .then((result) => {
        if (disposed) {
          return;
        }

        setRemoteComponent(() => result.Component);
        setSharedEvidence(result.shared);
        setReferenceId(result.traceId || getLatestTraceId());
        setErrorMessage(result.message || '');
        setStatus(result.status || 'success');
      })
      .catch((error) => {
        if (disposed) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);

        if (route === 'analytics') {
          setRemoteComponent(() => AnalyticsFallback);
          setSharedEvidence([
            'Core account page is available',
            'Detailed analytics are temporarily limited',
          ]);
          setErrorMessage(
            'Some analytics details are temporarily unavailable.',
          );
          setReferenceId(getLatestTraceId());
          setStatus('degraded');
          return;
        }

        setErrorMessage(message);
        setReferenceId(getLatestTraceId());
        setStatus('error');
      });

    return () => {
      disposed = true;
    };
  }, [route]);

  const openAnalyticsWorkspace = useCallback(() => {
    navigate('/observability-showcase/analytics');
  }, [navigate]);
  const runRenewalHandoff = useCallback(async () => {
    setHandoffStatus('loading');
    setHandoffError('');
    setHandoffResults([]);

    try {
      const results = await loadRenewalHandoffChain();
      setHandoffResults(results);
      setHandoffStatus('success');
    } catch (error) {
      setHandoffError(error instanceof Error ? error.message : String(error));
      setHandoffStatus('error');
    }
  }, []);

  const isAnalytics = route === 'analytics';
  const RemoteComponent = remoteComponent;

  return (
    <main className="customer-portal">
      <aside className="customer-portal__sidebar">
        <div className="customer-portal__brand">Customer Portal</div>
        <nav className="customer-portal__nav" aria-label="Main navigation">
          <a
            className={`customer-portal__nav-item ${
              !isAnalytics ? 'customer-portal__nav-item--active' : ''
            }`}
          >
            Overview
          </a>
          <a className="customer-portal__nav-item">Accounts</a>
          <a
            className={`customer-portal__nav-item ${
              isAnalytics ? 'customer-portal__nav-item--active' : ''
            }`}
          >
            Insights
          </a>
          <a className="customer-portal__nav-item">Settings</a>
        </nav>
      </aside>

      <section className="customer-portal__content">
        <header className="customer-portal__header">
          <div>
            <p className="customer-portal__eyebrow">Enterprise account</p>
            <h1>Acme Retail Group</h1>
          </div>
          <button type="button" className="customer-portal__secondary-button">
            Export
          </button>
        </header>

        <section
          className="customer-portal__metrics"
          aria-label="Account metrics"
        >
          <div>
            <span>Contract value</span>
            <strong>$1.42M</strong>
          </div>
          <div>
            <span>Open requests</span>
            <strong>18</strong>
          </div>
          <div>
            <span>Health score</span>
            <strong>82</strong>
          </div>
        </section>

        <section className="customer-portal__workspace">
          <div className="customer-portal__card customer-portal__card--profile">
            <div className="customer-portal__card-header">
              <div>
                <p className="customer-portal__eyebrow">
                  {isAnalytics ? 'Route: insights' : 'Route: overview'}
                </p>
                <h2>{isAnalytics ? 'Account analytics' : 'User profile'}</h2>
              </div>
              <span
                className={`customer-portal__status customer-portal__status--${status}`}
                data-testid="observability-showcase-status"
              >
                {status}
              </span>
            </div>

            <div className="customer-portal__profile-shell">
              {RemoteComponent ? (
                <RemoteComponent />
              ) : (
                <>
                  <div className="customer-portal__avatar">AR</div>
                  <div>
                    <strong>
                      {status === 'loading'
                        ? 'Loading remote component'
                        : 'Remote component unavailable'}
                    </strong>
                    <span>
                      {isAnalytics
                        ? 'Loading the analytics expose from the producer.'
                        : 'Loading the profile expose from the producer.'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {status === 'error' ? (
              <div
                className="customer-portal__error"
                data-testid="observability-showcase-message"
              >
                <strong>Remote widget is temporarily unavailable.</strong>
                <span>
                  {errorMessage || 'Share this reference with support:'}
                  <code data-testid="observability-showcase-trace">
                    {referenceId}
                  </code>
                </span>
              </div>
            ) : status === 'degraded' ? (
              <div
                className="customer-portal__fallback"
                data-testid="observability-showcase-message"
              >
                <strong>Limited analytics view is active.</strong>
                <span>
                  {errorMessage}
                  <code data-testid="observability-showcase-trace">
                    {referenceId}
                  </code>
                </span>
              </div>
            ) : (
              <div
                className="customer-portal__hint"
                data-testid="observability-showcase-message"
              >
                {/* {isAnalytics
                  ? 'This view loads a second expose and resolves React plus the customer SDK as shared dependencies.'
                  : 'The owner profile is ready for the renewal workspace.'}
                {referenceId ? (
                  <code data-testid="observability-showcase-trace">
                    {referenceId}
                  </code>
                ) : null} */}
              </div>
            )}

            <button
              type="button"
              className="customer-portal__primary-button"
              data-testid="observability-showcase-load"
              onClick={openAnalyticsWorkspace}
              disabled={status !== 'success' || isAnalytics}
            >
              Open Analytics Workspace
            </button>

            {sharedEvidence.length ? (
              <ul
                className="customer-portal__shared-list"
                data-testid="observability-showcase-shared"
              >
                {sharedEvidence.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="customer-portal__side-stack">
            <div className="customer-portal__card">
              <div className="customer-portal__card-header">
                <div>
                  <p className="customer-portal__eyebrow">Renewal handoff</p>
                  <h2>Prepare account review</h2>
                </div>
                <span
                  className={`customer-portal__status customer-portal__status--${handoffStatus}`}
                  data-testid="observability-showcase-handoff-status"
                >
                  {handoffStatus}
                </span>
              </div>
              <p className="customer-portal__handoff-copy">
                Pull the owner card, expansion insight, and success desk context
                before the renewal meeting starts.
              </p>
              <button
                type="button"
                className="customer-portal__secondary-button customer-portal__handoff-button"
                data-testid="observability-showcase-handoff"
                onClick={runRenewalHandoff}
                disabled={handoffStatus === 'loading'}
              >
                Prepare renewal handoff
              </button>
              {handoffError ? (
                <div
                  className="customer-portal__error customer-portal__handoff-error"
                  data-testid="observability-showcase-handoff-error"
                >
                  {handoffError}
                </div>
              ) : null}
              {handoffResults.length ? (
                <ul
                  className="customer-portal__handoff-list"
                  data-testid="observability-showcase-handoff-results"
                >
                  {handoffResults.map((result) => (
                    <li key={`${result.owner}-${result.traceId}`}>
                      <div>
                        <strong>{result.owner}</strong>
                        <span>{result.step}</span>
                      </div>
                      <code>{result.request}</code>
                      <span>{result.shared}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div hidden data-testid="observability-showcase-handoff-report">
                {JSON.stringify({
                  scenario: 'renewal-handoff-chain',
                  results: handoffResults,
                })}
              </div>
            </div>

            <div className="customer-portal__card">
              <p className="customer-portal__eyebrow">Recent activity</p>
              <ul className="customer-portal__activity">
                <li>
                  <span>Profile expose loaded on overview route</span>
                  <time>09:12</time>
                </li>
                <li>
                  <span>Analytics expose waits for route navigation</span>
                  <time>Yesterday</time>
                </li>
                <li>
                  <span>Shared dependency evidence is kept in reports</span>
                  <time>May 6</time>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
