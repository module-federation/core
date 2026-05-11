import { createObservability } from '@module-federation/observability-plugin';

export const observability = createObservability({
  level: 'verbose',
  maxEvents: 100,
  browser: {
    enabled: true,
    scope: 'runtime_host',
  },
  react: {
    enabled: true,
    timeout: 5000,
    consumerNames: [
      'observability_showcase_profile_consumer',
      'observability_showcase_analytics_consumer',
    ],
    remoteIds: [
      'dynamic-remote/ProfileCard',
      'dynamic-remote/AnalyticsPanel',
      './ProfileCard',
      './AnalyticsPanel',
    ],
    defaultExportMode: 'component',
  },
});
