import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import {
  ModuleFederationPlugin,
  PLUGIN_NAME,
} from '@module-federation/enhanced/rspack';
import type { RstestExposeAPI } from '@rstest/core';
import type { ExposedAPIType as RsbuildFederationExposeAPI } from '@module-federation/rsbuild-plugin';

import { createFederationExternalBypass } from './externals-bypass';
import { logger } from './logger';
import { withNodeDefaults, withRstestDefaults } from './node-defaults';
import { collectRemoteNames } from './remotes';
import { applyNodeRspackDefaults } from './rspack-hook';
import type { ModuleFederationOptions, RstestFederationOptions } from './types';

/**
 * Stable, public plugin name. The name is exported so tooling can identify the
 * plugin; treat renames as breaking changes.
 */
export const FEDERATION_PLUGIN_NAME = 'rstest:federation';

const RSTEST_CALLER = 'rstest';
const RSBUILD_FEDERATION_PLUGIN_NAME = 'rsbuild:module-federation-enhanced';

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

const createRspackPatcher = (
  getModuleFederationOptions: () => ModuleFederationOptions,
  isNodeTarget: boolean,
) => {
  return (rspackConfig: Rspack.Configuration): void => {
    rspackConfig.output ||= {};
    rspackConfig.plugins ||= [];

    if (isNodeTarget) {
      applyNodeRspackDefaults(rspackConfig);
    }

    if (
      rspackConfig.plugins.some(
        (plugin) =>
          plugin !== null &&
          typeof plugin === 'object' &&
          'name' in plugin &&
          plugin.name === PLUGIN_NAME,
      )
    ) {
      throw new Error(
        'Federation is configured by both @module-federation/rsbuild-plugin and federation(options). Use a single federation configuration owner.',
      );
    }

    const moduleFederationOptions = getModuleFederationOptions();
    rspackConfig.plugins.push(
      new ModuleFederationPlugin(moduleFederationOptions),
    );

    let remoteNames: Set<string> | undefined;
    rspackConfig.externals = [
      createFederationExternalBypass(() => {
        remoteNames ??= collectRemoteNames(moduleFederationOptions.remotes);
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

    if (callerName === RSTEST_CALLER && isNodeTarget && !rstestApi) {
      throw new Error(
        '@module-federation/rstest requires @rstest/core 0.11.4 or newer so it can enable federation compatibility.',
      );
    }

    if (isNodeTarget) {
      rstestApi?.modifyRstestConfig((config) => {
        config.federation = true;
      });
    }

    const rsbuildFederationApi = api.useExposed<RsbuildFederationExposeAPI>(
      RSBUILD_FEDERATION_PLUGIN_NAME,
    );
    const normalizeOptions = isNodeTarget
      ? (options: ModuleFederationOptions) =>
          withNodeDefaults(options, {
            warnOnConfiguredRuntimePlugin:
              moduleFederationOptions !== undefined,
          })
      : withRstestDefaults;
    let getEffectiveOptions: () => ModuleFederationOptions;

    if (moduleFederationOptions) {
      if (rsbuildFederationApi) {
        throw new Error(
          'Federation is configured by both @module-federation/rsbuild-plugin and federation(options). Pass no options to federation() when using the Rsbuild plugin.',
        );
      }

      const directOptions = normalizeOptions(moduleFederationOptions);
      getEffectiveOptions = () => directOptions;
    } else {
      if (!rsbuildFederationApi) {
        throw new Error(
          'federation() without options requires @module-federation/rsbuild-plugin to be registered first.',
        );
      }

      rsbuildFederationApi.registerOptionsTransformer(normalizeOptions);
      getEffectiveOptions = rsbuildFederationApi.getOptions;
    }

    api.modifyEnvironmentConfig({
      order: 'post',
      handler: (config, { mergeEnvironmentConfig }) => {
        const pluginConfig: EnvironmentConfig = {
          tools: {
            rspack: createRspackPatcher(getEffectiveOptions, isNodeTarget),
          },
        };

        if (isNodeTarget) {
          pluginConfig.output = {
            target: 'node',
          };
        }

        return mergeEnvironmentConfig(config, pluginConfig);
      },
    });
  },
});
