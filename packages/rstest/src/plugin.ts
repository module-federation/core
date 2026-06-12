import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

import { createFederationExternalBypass } from './externals-bypass';
import { withNodeDefaults, withRstestDefaults } from './node-defaults';
import { collectRemoteNames } from './remotes';
import { appendRspackHook, applyNodeRspackDefaults } from './rspack-hook';
import type { ModuleFederationOptions, RstestFederationOptions } from './types';

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
  name: 'rstest:federation',
  setup: (api) => {
    const target = rstestOptions?.target ?? 'node';
    const isNodeTarget = target === 'node';

    api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
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
    });
  },
});

export const pluginModuleFederation = federation;
