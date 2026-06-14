import { createObservability } from '@module-federation/observability-plugin';

const openRuntimeBridge = shouldConnectBridge()
  ? {
      autoReconnect: true,
    }
  : false;

export const observability = createObservability({
  level: 'verbose',
  maxEvents: 100,
  browser: {
    enabled: true,
    scope: 'runtime_host',
  },
  collector: true,
  react: {
    injectLoadedCallback: true,
    remoteIds: [
      'dynamic-remote/ProfileCard',
      'dynamic-remote/AnalyticsPanel',
      './ProfileCard',
      './AnalyticsPanel',
    ],
    defaultExportMode: 'component',
  },
  openRuntime: {
    bridge: openRuntimeBridge,
    source: 'mf-runtime-demo',
  },
});

function shouldConnectBridge(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return new URLSearchParams(window.location.search).has('openruntimeBridge');
}
