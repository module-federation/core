import { createObservability } from '@module-federation/observability-plugin';

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
});
