import { logger } from './logger';
import { normalizeRuntimePlugins } from './runtime-plugin';
import type { ModuleFederationOptions } from './types';

export const withRstestDefaults = (
  options: ModuleFederationOptions,
): ModuleFederationOptions => {
  if (options.experiments?.asyncStartup === false) {
    logger.warn(
      'experiments.asyncStartup is false and incompatible with Rstest federation startup; it is overridden with true.',
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
 * the same script transport default. Test workers additionally require
 * `library.name` to equal the container name so the container is resolvable
 * inside the worker. ESM library types are normalized because Rstest runs
 * Node test bundles with module output disabled.
 */
export const withNodeDefaults = (
  options: ModuleFederationOptions,
  {
    warnOnConfiguredRuntimePlugin = true,
  }: {
    warnOnConfiguredRuntimePlugin?: boolean;
  } = {},
): ModuleFederationOptions => {
  const merged = withRstestDefaults(options);
  const { runtimePlugins, hasConfiguredNodeRuntimePlugin } =
    normalizeRuntimePlugins(merged.runtimePlugins);

  if (hasConfiguredNodeRuntimePlugin && warnOnConfiguredRuntimePlugin) {
    logger.warn(
      'The node runtime plugin is injected automatically; manual configuration is unnecessary.',
    );
  }

  if (merged.library?.name != null && merged.library.name !== merged.name) {
    logger.warn(
      `library.name "${String(merged.library.name)}" is incompatible with the container name "${String(merged.name)}" required by Node test workers; it is overridden.`,
    );
  }

  const userOptimizationTarget = merged.experiments?.optimization?.target;
  if (userOptimizationTarget != null && userOptimizationTarget !== 'node') {
    logger.warn(
      `experiments.optimization.target "${String(userOptimizationTarget)}" is incompatible with Node test workers; it is overridden with "node".`,
    );
  }

  const userLibraryType = merged.library?.type;
  const usesEsmLibrary =
    userLibraryType === 'module' || userLibraryType === 'modern-module';
  const libraryType = usesEsmLibrary
    ? 'commonjs-module'
    : (userLibraryType ?? 'commonjs-module');

  if (usesEsmLibrary) {
    logger.warn(
      `library.type "${userLibraryType}" is incompatible with Rstest's CommonJS federation worker; it is overridden with "commonjs-module".`,
    );
  }

  return {
    ...merged,
    remoteType: merged.remoteType ?? 'script',
    library: {
      ...merged.library,
      name: merged.name,
      type: libraryType,
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
