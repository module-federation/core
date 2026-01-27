import type {
  EnvironmentConfig,
  ModifyRspackConfigUtils,
  RsbuildPlugin,
  Rspack,
} from '@rsbuild/core';
import { createLogger } from '@module-federation/sdk';

type ModuleFederationPluginLike = {
  constructor?: {
    name?: unknown;
  };
  _options?: {
    name?: unknown;
    experiments?: {
      optimization?: {
        target?: unknown;
      };
    };
  };
};

const logger = createLogger('[ Module Federation Rstest Plugin ]');

// Note: ModuleFederationPlugin configuration should include
// experiments.optimization.target: 'node' when used with Rstest
// to ensure proper Node.js loading in JSDOM environments

export const shouldKeepBundledForFederation = (request: string): boolean => {
  // Module Federation runtimes can generate "loader-style" requests that embed
  // inline JS via a `data:` URL (e.g. `something!=!data:text/javascript,...`).
  // Externalizing those breaks because Node can't resolve them via require/import.
  if (/!=!data:text\/javascript(?:;|,)/i.test(request)) {
    return true;
  }

  // Keep MF runtime packages bundled when federation is enabled. They participate
  // in runtime bootstrapping and may be referenced through loader-style specifiers.
  if (request.startsWith('@module-federation/')) {
    return true;
  }

  return false;
};

/**
 * Enable Rstest's Module Federation compatibility mode for the current Rsbuild
 * environment.
 *
 * Add this to your `rstest.config.*`:
 *
 * ```ts
 * import { defineConfig, federation } from '@rstest/core';
 * export default defineConfig({
 *   federation: true,
 *   plugins: [federation()],
 * });
 * ```
 */
export const federation = (): RsbuildPlugin => ({
  name: 'rstest:federation',
  setup: (api) => {
    api.modifyEnvironmentConfig((config, { mergeEnvironmentConfig }) => {
      // Force Node-like output defaults and ensure the bundler emits CJS.
      // Some federation runtimes/bootstraps don't work reliably under ESM in Node/JSDOM workers.
      const merged = mergeEnvironmentConfig(config, {
        output: {
          target: 'node',
        },
      } satisfies EnvironmentConfig);

      const patchRspackConfig = (
        rspackConfig: Rspack.Configuration,
        _utils: ModifyRspackConfigUtils,
      ) => {
        rspackConfig.output ||= {};
        rspackConfig.plugins ||= [];

        // Tests run in Node workers even for DOM-like environments.
        // Use async-node target and avoid splitChunks for federation.
        rspackConfig.target = 'async-node';
        rspackConfig.optimization ??= {};
        rspackConfig.optimization.splitChunks = false;

        // Explicitly disable ESM output at the Rspack level.
        // `output.module` alone is not enough when `experiments.outputModule` is enabled.
        rspackConfig.experiments ??= {};
        rspackConfig.experiments.outputModule = false;
        rspackConfig.output.module = false;

        // Validate that ModuleFederationPlugin instances have the correct config.
        for (const plugin of rspackConfig.plugins || []) {
          if (!plugin || typeof plugin !== 'object') {
            continue;
          }

          const mf = plugin as ModuleFederationPluginLike;
          if (mf.constructor?.name !== 'ModuleFederationPlugin') {
            continue;
          }

          const options = mf._options;
          if (!options || typeof options !== 'object') {
            continue;
          }

          if (options.experiments?.optimization?.target !== 'node') {
            const pluginName =
              typeof options.name === 'string' && options.name.trim()
                ? options.name
                : 'unnamed';
            logger.warn(
              `[Rstest Federation] ModuleFederationPlugin "${pluginName}" should have experiments.optimization.target set to 'node' for JSDOM test environments.`,
            );
          }
        }
      };

      // Avoid clobbering existing tools.rspack mutations from user config or other plugins.
      merged.tools ||= {} as any;
      const existing = merged.tools.rspack;
      if (!existing) {
        merged.tools.rspack = patchRspackConfig as any;
      } else if (Array.isArray(existing)) {
        merged.tools.rspack = [...existing, patchRspackConfig as any];
      } else {
        merged.tools.rspack = [existing as any, patchRspackConfig as any];
      }

      return merged;
    });
  },
});
