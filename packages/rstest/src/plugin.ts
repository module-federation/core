import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

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

// `callerName` values rstest sets on the Rsbuild instances it creates.
const RSTEST_NODE_CALLER = 'rstest';
const RSTEST_BROWSER_CALLER = 'rstest-browser';

type RstestExposeAPI = {
  modifyRstestConfig: (
    callback: (config: { federation?: boolean }) => void,
  ) => void;
};

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
          rspackConfig.plugins as unknown[] | undefined,
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
 * Node test environments require the upcoming Rstest federation support
 * (web-infra-dev/rstest PR #1407). When available, this plugin automatically
 * enables Rstest's compatibility mode through its exposed configuration API.
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
    if (
      callerName !== RSTEST_NODE_CALLER &&
      callerName !== RSTEST_BROWSER_CALLER
    ) {
      logger.warn(
        `This plugin is designed to run under rstest, but the current caller is "${callerName}". Federation test defaults may not fit this environment.`,
      );
    }

    // Browser-mode rstest builds identify themselves via callerName; use it
    // to pick the default target. An explicit rstestOptions.target wins.
    const target =
      rstestOptions?.target ??
      (callerName === RSTEST_BROWSER_CALLER ? 'browser' : 'node');
    const isNodeTarget = target === 'node';

    if (isNodeTarget) {
      api
        .useExposed<RstestExposeAPI>('rstest')
        ?.modifyRstestConfig((config) => {
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
