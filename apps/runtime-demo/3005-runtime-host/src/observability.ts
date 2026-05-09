import { ObservabilityPlugin } from '@module-federation/observability-plugin';

export const observability = ObservabilityPlugin({
  level: 'verbose',
  maxEvents: 100,
  browser: {
    enabled: true,
    scope: 'runtime_host',
  },
});
