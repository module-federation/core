import { logger } from './logger';
import { normalizeRuntimePlugins } from './runtime-plugin';
import type { ModuleFederationOptions } from './types';

export const withRstestDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  if (options.experiments?.asyncStartup === false) {
    logger.warn(
      '[Rstest Federation] experiments.asyncStartup was set to false but is forced to true: rstest bootstraps federation containers inside test workers, which requires async startup.',
    );
  }

  return {
    ...options,
    // ModuleFederationPlugin treats dts/manifest/dev as enabled unless they
    // are exactly `false`. Test builds need none of that machinery, so
    // default it off; explicit user values win.
    dts: options.dts ?? false,
    manifest: options.manifest ?? false,
    dev: options.dev ?? false,
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

  if (merged.library?.name != null && merged.library.name !== merged.name) {
    logger.warn(
      `[Rstest Federation] library.name "${String(merged.library.name)}" is overridden with the container name "${String(merged.name)}" so the container can be resolved in Node test workers.`,
    );
  }

  const userOptimizationTarget = merged.experiments?.optimization?.target;
  if (userOptimizationTarget != null && userOptimizationTarget !== 'node') {
    logger.warn(
      `[Rstest Federation] experiments.optimization.target "${String(userOptimizationTarget)}" is overridden with "node": rstest executes federation builds in Node test workers.`,
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
