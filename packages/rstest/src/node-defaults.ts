import { createLogger } from '@module-federation/sdk';

import { normalizeRuntimePlugins } from './runtime-plugin';
import type { ModuleFederationOptions } from './types';

const logger = createLogger('[ Module Federation Rstest Plugin ]');

export const withRstestDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  return {
    ...options,
    experiments: {
      ...options.experiments,
      asyncStartup: true,
    },
  };
};

export const withNodeDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  const merged = withRstestDefaults(options);
  const { runtimePlugins, hasConfiguredNodeRuntimePlugin } =
    normalizeRuntimePlugins(merged.runtimePlugins);

  if (hasConfiguredNodeRuntimePlugin) {
    logger.warn(
      '[Rstest Federation] The node runtime plugin is injected automatically; manual configuration is unnecessary.',
    );
  }

  return {
    ...merged,
    library: {
      ...merged.library,
      name: merged.name,
      type: merged.library?.type ?? 'commonjs-module',
    },
    runtimePlugins,
    experiments: {
      ...merged.experiments,
      optimization: {
        ...merged.experiments?.optimization,
        target: 'node',
      },
    },
  };
};
