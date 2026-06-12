import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

import { createFederationExternalBypass } from './externals-bypass';
import { logger } from './logger';
import { withNodeDefaults, withRstestDefaults } from './node-defaults';
import { collectRemoteNames } from './remotes';
import { appendRspackHook, applyNodeRspackDefaults } from './rspack-hook';
import type { ModuleFederationOptions, RstestFederationOptions } from './types';

/**
 * Stable, public plugin name. Rstest may detect this plugin by name to enable
 * federation-specific behavior, so treat renames as breaking changes.
 */
export const FEDERATION_PLUGIN_NAME = 'rstest:federation';

// `callerName` values rstest sets on the Rsbuild instances it creates.
const RSTEST_NODE_CALLER = 'rstest';
const RSTEST_BROWSER_CALLER = 'rstest-browser';

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

    const remoteNames = collectRemoteNames(
      moduleFederationOptions?.remotes,
      rspackConfig.plugins as unknown[] | undefined,
    );
    rspackConfig.externals = [
      createFederationExternalBypass(remoteNames),
      ...toArray(rspackConfig.externals),
    ];
  };
};

/**
 * Enable Rstest's Module Federation compatibility mode for the current Rsbuild
 * environment.
 *
 * Note: the `federation: true` config key shown below is not available in any
 * released `@rstest/core` version yet. It requires the upcoming federation
 * release (web-infra-dev/rstest PR #1407); until that ships, pair this plugin
 * with a pkg.pr.new canary of `@rstest/core` from that PR (e.g.
 * `https://pkg.pr.new/@rstest/core@40086e4`). Against released versions the
 * snippet below will not typecheck.
 *
 * Add this to your `rstest.config.*`:
 *
 * ```ts
 * import { federation } from '@module-federation/rstest';
 * import { defineConfig } from '@rstest/core';
 * export default defineConfig({
 *   federation: true,
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
        `[Rstest Federation] This plugin is designed to run under rstest, but the current caller is "${callerName}". Federation test defaults may not fit this environment.`,
      );
    }

    // Browser-mode rstest builds identify themselves via callerName; use it
    // to pick the default target. An explicit rstestOptions.target wins.
    const target =
      rstestOptions?.target ??
      (callerName === RSTEST_BROWSER_CALLER ? 'browser' : 'node');
    const isNodeTarget = target === 'node';

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

export const pluginModuleFederation = federation;
