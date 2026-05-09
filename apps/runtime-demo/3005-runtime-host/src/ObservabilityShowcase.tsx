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

const producerName = 'runtime_remote2';
const producerAlias = 'dynamic-remote';
const producerManifest = 'http://127.0.0.1:3007/mf-manifest.json';
const profileRequest = `${producerAlias}/ProfileCard`;
const analyticsRequest = `${producerAlias}/AnalyticsPanel`;
const analyticsConsumerName = 'observability_showcase_analytics_consumer';

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

  if (report?.traceId) {
    observability.markComponentLoaded({
      traceId: report.traceId,
      requestId: profileRequest,
      componentName: 'ProfileCard',
      metadata: {
        route: 'profile',
        consumer: 'observability_showcase_profile_consumer',
        producer: producerName,
        expose: './ProfileCard',
      },
    });
  }

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

  if (report?.traceId) {
    observability.markComponentLoaded({
      traceId: report.traceId,
      requestId: analyticsRequest,
      componentName: 'AnalyticsPanel',
      metadata: {
        route: 'analytics',
        consumer: analyticsConsumerName,
        producer: producerName,
        expose: './AnalyticsPanel',
        shared: ['react', 'observability-customer-sdk'],
        customerSdkProvider: sdk.provider,
        customerSdkVersion: sdk.version,
      },
    });
  }

  return {
    Component,
    traceId: report?.traceId || '',
    shared: [
      `react from ${analyticsConsumerName}@18.3.1`,
      `observability-customer-sdk from ${sdk.provider}@${sdk.version}`,
    ],
  } satisfies LoadResult;
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
                {isAnalytics
                  ? 'This view loads a second expose and resolves React plus the customer SDK as shared dependencies.'
                  : 'This view is loaded by createInstance when the page opens.'}
                {referenceId ? (
                  <code data-testid="observability-showcase-trace">
                    {referenceId}
                  </code>
                ) : null}
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
        </section>
      </section>
    </main>
  );
}
