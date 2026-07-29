import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import type { RstestExposeAPI } from '@rstest/core';

import { createFederationExternalBypass } from './externals-bypass';
import { logger } from './logger';
import { withNodeDefaults, withRstestDefaults } from './node-defaults';
import { collectRemoteNames } from './remotes';
import { appendRspackHook, applyNodeRspackDefaults } from './rspack-hook';
import type { ModuleFederationOptions, RstestFederationOptions } from './types';

/**
 * Stable, public plugin name. The name is exported so tooling can identify the
 * plugin; treat renames as breaking changes.
 */
export const FEDERATION_PLUGIN_NAME = 'rstest:federation';

const RSTEST_CALLER = 'rstest';

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? [...value] : [value];
};

const createRspackPatcher = (
  moduleFederationOptions: ModuleFederationOptions | undefined,
  isNodeTarget: boolean,
) => {
  return (rspackConfig: Rspack.Configuration): void => {
    rspackConfig.output ||= {};
    rspackConfig.plugins ||= [];

    if (isNodeTarget) {
      applyNodeRspackDefaults(rspackConfig);
    }

    if (moduleFederationOptions) {
      const effectiveOptions = isNodeTarget
        ? withNodeDefaults(moduleFederationOptions)
        : withRstestDefaults(moduleFederationOptions);

      rspackConfig.plugins.push(new ModuleFederationPlugin(effectiveOptions));
    }

    // The Rsbuild federation plugin registers ModuleFederationPlugin in
    // onBeforeCreateCompiler, after tools.rspack hooks have run. External
    // functions run during compilation, so collect once on first use.
    let remoteNames: Set<string> | undefined;
    rspackConfig.externals = [
      createFederationExternalBypass(() => {
        remoteNames ??= collectRemoteNames(
          moduleFederationOptions?.remotes,
          rspackConfig.plugins,
        );
        return remoteNames;
      }),
      ...toArray(rspackConfig.externals),
    ];
  };
};

/**
 * Enable Rstest's Module Federation compatibility mode for the current Rsbuild
 * environment.
 *
 * Node test environments require Rstest's federation support, available in
 * @rstest/core 0.11.4 and newer. This plugin automatically enables Rstest's
 * compatibility mode through its exposed configuration API.
 *
 * Add this to your `rstest.config.*`:
 *
 * ```ts
 * import { federation } from '@module-federation/rstest';
 * import { defineConfig } from '@rstest/core';
 * export default defineConfig({
 *   plugins: [
 *     federation({
 *       name: 'host',
 *       remotes: {
 *         remote: 'remote@http://localhost:3001/remoteEntry.js',
 *       },
 *     }),
 *   ],
 * });
 * ```
 */
export const federation = (
  moduleFederationOptions?: ModuleFederationOptions,
  rstestOptions?: RstestFederationOptions,
): RsbuildPlugin => ({
  name: FEDERATION_PLUGIN_NAME,
  setup: (api) => {
    const { callerName } = api.context;
    if (callerName !== RSTEST_CALLER) {
      logger.warn(
        `This plugin is designed to run under rstest, but the current caller is "${callerName}". Federation test defaults may not fit this environment.`,
      );
    }

    const rstestApi = api.useExposed<RstestExposeAPI>('rstest');
    const isBrowserMode =
      rstestApi?.getRstestConfig().browser?.enabled === true;

    // Rstest exposes the resolved config for both Node Mode and Browser Mode.
    // An explicit rstestOptions.target wins over the detected mode.
    const target =
      rstestOptions?.target ?? (isBrowserMode ? 'browser' : 'node');
    const isNodeTarget = target === 'node';

    if (isNodeTarget) {
      rstestApi?.modifyRstestConfig((config) => {
        config.federation = true;
      });
    }

    api.modifyEnvironmentConfig({
      // Run after other plugins' hooks so the externals bypass prepended by
      // the rspack patcher stays ahead of externals added by other plugins.
      order: 'post',
      handler: (config, { mergeEnvironmentConfig }) => {
        const merged = isNodeTarget
          ? mergeEnvironmentConfig(config, {
              output: {
                target: 'node',
              },
            } satisfies EnvironmentConfig)
          : mergeEnvironmentConfig(config);

        appendRspackHook(
          merged,
          createRspackPatcher(moduleFederationOptions, isNodeTarget),
        );

        return merged;
      },
    });
  },
});
