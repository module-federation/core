import { logger } from './logger';
import { normalizeRuntimePlugins } from './runtime-plugin';
import type { ModuleFederationOptions } from './types';

export const withRstestDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  if (options.experiments?.asyncStartup === false) {
    logger.warn(
      'experiments.asyncStartup was set to false but is forced to true: rstest bootstraps federation containers inside test workers, which requires async startup.',
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

/**
 * Node-target MF defaults for rstest test workers.
 *
 * `@module-federation/rsbuild-plugin` has a sibling helper
 * (`patchNodeMFConfig` in packages/rsbuild-plugin/src/utils/ssr.ts) with
 * deliberately different policy: SSR bundles fetch remotes as scripts
 * (`remoteType: 'script'`) and keep the bundler-derived library name. Test
 * workers instead infer the transport from each remote declaration (so
 * `remoteType` is never forced) and require `library.name` to equal the
 * container name so the container is resolvable inside the worker. Keep
 * divergence between the two intentional and documented.
 */
export const withNodeDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  const merged = withRstestDefaults(options);
  const { runtimePlugins, hasConfiguredNodeRuntimePlugin } =
    normalizeRuntimePlugins(merged.runtimePlugins);

  if (hasConfiguredNodeRuntimePlugin) {
    logger.warn(
      'The node runtime plugin is injected automatically; manual configuration is unnecessary.',
    );
  }

  if (merged.library?.name != null && merged.library.name !== merged.name) {
    logger.warn(
      `library.name "${String(merged.library.name)}" is overridden with the container name "${String(merged.name)}" so the container can be resolved in Node test workers.`,
    );
  }

  const userOptimizationTarget = merged.experiments?.optimization?.target;
  if (userOptimizationTarget != null && userOptimizationTarget !== 'node') {
    logger.warn(
      `experiments.optimization.target "${String(userOptimizationTarget)}" is overridden with "node": rstest executes federation builds in Node test workers.`,
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
