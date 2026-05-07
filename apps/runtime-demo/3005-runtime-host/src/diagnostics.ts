import { DiagnosticsPlugin } from '@module-federation/diagnostics-plugin';

export const diagnostics = DiagnosticsPlugin({
  level: 'verbose',
  maxEvents: 100,
  browser: {
    enabled: true,
    scope: 'runtime_host',
  },
});
