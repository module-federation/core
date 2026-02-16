import type { EnvironmentConfig, RsbuildPlugin, Rspack } from '@rsbuild/core';
import { createLogger } from '@module-federation/sdk';

type ModuleFederationPluginLike = {
  constructor?: {
    name?: unknown;
  };
  _options?: {
    remotes?: unknown;
    name?: unknown;
    experiments?: {
      optimization?: {
        target?: unknown;
      };
    };
  };
  options?: {
    remotes?: unknown;
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

const addRemoteNameFromString = (entry: string, target: Set<string>): void => {
  const normalized = entry.trim();
  if (!normalized) {
    return;
  }

  // String remotes commonly use: "<name>@<entry-url>".
  // This is used by remoteEntry and mf-manifest protocols.
  const atIndex = normalized.indexOf('@');
  if (atIndex > 0) {
    target.add(normalized.slice(0, atIndex));
    return;
  }

  target.add(normalized);
};

const addRemoteNames = (remotes: unknown, target: Set<string>): void => {
  if (!remotes) return;

  if (Array.isArray(remotes)) {
    for (const entry of remotes) {
      if (!entry) continue;

      if (typeof entry === 'string') {
        addRemoteNameFromString(entry, target);
        continue;
      }

      if (Array.isArray(entry)) {
        const [name] = entry;
        if (typeof name === 'string') {
          target.add(name);
        }
        continue;
      }

      if (typeof entry === 'object') {
        const maybeName = (entry as { name?: unknown; alias?: unknown }).name;
        const maybeAlias = (entry as { alias?: unknown }).alias;
        if (typeof maybeName === 'string') {
          target.add(maybeName);
        }
        if (typeof maybeAlias === 'string') {
          target.add(maybeAlias);
        }
      }
    }
    return;
  }

  if (typeof remotes === 'object') {
    for (const key of Object.keys(remotes as Record<string, unknown>)) {
      target.add(key);
    }
  }
};

const collectFederationRemoteNames = (
  plugins: unknown[] | undefined,
  target: Set<string>,
): void => {
  target.clear();
  if (!plugins) return;

  for (const plugin of plugins) {
    if (!plugin || typeof plugin !== 'object') {
      continue;
    }
    const mf = plugin as ModuleFederationPluginLike;
    if (mf.constructor?.name !== 'ModuleFederationPlugin') {
      continue;
    }

    const options = mf._options ?? mf.options;
    if (!options || typeof options !== 'object') {
      continue;
    }

    addRemoteNames(options.remotes, target);
  }
};

const isFederationRemoteRequest = (
  request: string,
  remoteNames: Set<string>,
): boolean => {
  if (!remoteNames.size) {
    return false;
  }

  for (const remoteName of remoteNames) {
    if (
      request === remoteName ||
      request.startsWith(`${remoteName}/`) ||
      request.startsWith(`${remoteName}@`)
    ) {
      return true;
    }
  }

  return false;
};

export const shouldKeepBundledForFederation = (
  request: string,
  remoteNames?: Set<string>,
): boolean => {
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

  // Webpack/Rspack Module Federation container reference request.
  if (request.startsWith('webpack/container/reference/')) {
    return true;
  }

  if (remoteNames && isFederationRemoteRequest(request, remoteNames)) {
    return true;
  }

  return false;
};

const toArray = <T>(value: T | T[] | undefined): T[] => {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? [...value] : [value];
};

const createFederationExternalBypass = (
  remoteNames: Set<string>,
): ((
  data: Rspack.ExternalItemFunctionData,
  callback: (
    err?: Error,
    result?: Rspack.ExternalItemValue,
    type?: Rspack.ExternalsType,
  ) => void,
) => void) => {
  return function federationExternalBypass({ request }, callback) {
    if (!request || !shouldKeepBundledForFederation(request, remoteNames)) {
      return callback();
    }

    // `false` means: stop evaluating remaining externals and keep bundled.
    return callback(undefined, false);
  };
};

/**
 * Enable Rstest's Module Federation compatibility mode for the current Rsbuild
 * environment.
 *
 * Add this to your `rstest.config.*`:
 *
 * ```ts
 * import { federation } from '@module-federation/rstest-plugin';
 * import { defineConfig } from '@rstest/core';
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

      const patchRspackConfig = (rspackConfig: Rspack.Configuration) => {
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
        const federationRemoteNames = new Set<string>();
        collectFederationRemoteNames(
          rspackConfig.plugins as unknown[] | undefined,
          federationRemoteNames,
        );
        const externals = toArray(rspackConfig.externals);
        externals.unshift(
          createFederationExternalBypass(federationRemoteNames),
        );
        rspackConfig.externals = externals;

        // Validate that ModuleFederationPlugin instances have the correct config.
        for (const plugin of rspackConfig.plugins || []) {
          if (!plugin || typeof plugin !== 'object') {
            continue;
          }

          const mf = plugin as ModuleFederationPluginLike;
          if (mf.constructor?.name !== 'ModuleFederationPlugin') {
            continue;
          }

          const options = mf._options ?? mf.options;
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
        merged.tools.rspack = patchRspackConfig;
      } else if (Array.isArray(existing)) {
        merged.tools.rspack = [...existing, patchRspackConfig];
      } else {
        merged.tools.rspack = [existing, patchRspackConfig];
      }

      return merged;
    });
  },
});
