/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import {
  getWebpackPath,
  normalizeWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import type {
  Compiler,
  Compilation,
  WebpackError as WebpackErrorType,
} from 'webpack';
import { parseOptions } from '../container/options';
import ProvideForSharedDependency from './ProvideForSharedDependency';
import ProvideSharedDependency from './ProvideSharedDependency';
import ProvideSharedModuleFactory from './ProvideSharedModuleFactory';
import type {
  ProvideSharedPluginOptions,
  ProvidesConfig,
} from '../../declarations/plugins/sharing/ProvideSharedPlugin';
import FederationRuntimePlugin from '../container/runtime/FederationRuntimePlugin';
import { createSchemaValidation } from '../../utils';
import path from 'path';
import { satisfy } from '@module-federation/runtime-tools/runtime-core';
import {
  addSingletonFilterWarning,
  testRequestFilters,
  createLookupKeyForSharing,
  extractPathAfterNodeModules,
} from './utils';
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

export type ResolvedProvideMap = Map<
  string,
  {
    config: ProvidesConfig;
    version: string | undefined | false;
    resource?: string;
  }
>;

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('../../schemas/sharing/ProvideSharedPlugin.check.js').validate,
  () => require('../../schemas/sharing/ProvideSharedPlugin').default,
  {
    name: 'Provide Shared Plugin',
    baseDataPath: 'options',
  },
);

/**
 * @typedef {Object} ProvideOptions
 * @property {string} shareKey
 * @property {string | string[]} shareScope
 * @property {string | undefined | false} version
 * @property {boolean} eager
 * @property {string} [request] The actual request to use for importing the module
 */

/** @typedef {Map<string, { config: ProvideOptions, version: string | undefined | false }>} ResolvedProvideMap */

class ProvideSharedPlugin {
  private _provides: [string, ProvidesConfig][];

  /**
   * @param {ProvideSharedPluginOptions} options options
   */
  constructor(options: ProvideSharedPluginOptions) {
    validate(options);

    this._provides = parseOptions(
      options.provides,
      (item): ProvidesConfig => {
        if (Array.isArray(item))
          throw new Error('Unexpected array of provides');
        const result: ProvidesConfig = {
          shareKey: item,
          version: undefined,
          shareScope: options.shareScope || 'default',
          eager: false,
          requiredVersion: false,
          strictVersion: false,
          singleton: false,
          layer: undefined,
          request: item,
          exclude: undefined,
          include: undefined,
        };
        return result;
      },
      (item, key): ProvidesConfig => {
        const request = item.request || key;
        return {
          shareScope: item.shareScope || options.shareScope || 'default',
          shareKey: item.shareKey || request,
          version: item.version,
          eager: !!item.eager,
          requiredVersion: item.requiredVersion,
          strictVersion: item.strictVersion,
          singleton: !!item.singleton,
          layer: item.layer,
          request,
          include: item.include,
          exclude: item.exclude,
        };
      },
    );
    this._provides.sort(([a], [b]) => {
      if (a < b) return -1;
      if (b < a) return 1;
      return 0;
    });
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    new FederationRuntimePlugin().apply(compiler);
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    const compilationData: WeakMap<Compilation, ResolvedProvideMap> =
      new WeakMap();

    compiler.hooks.compilation.tap(
      'ProvideSharedPlugin',
      (compilation: Compilation, { normalModuleFactory }) => {
        const resolvedProvideMap: ResolvedProvideMap = new Map();
        const matchProvides: Map<string, ProvidesConfig> = new Map();
        const prefixMatchProvides: Map<string, ProvidesConfig> = new Map();
        for (const [request, config] of this._provides) {
          const actualRequest = config.request || request;
          const lookupKey = createLookupKeyForSharing(
            actualRequest,
            config.layer,
          );
          if (/^(\/|[A-Za-z]:\\|\\\\|\.\.?(\/|$))/.test(actualRequest)) {
            // relative request - apply filtering if include/exclude are defined
            if (this.shouldProvideSharedModule(config)) {
              resolvedProvideMap.set(lookupKey, {
                config,
                version: config.version,
                resource: actualRequest,
              });
            }
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            // absolute path - apply filtering if include/exclude are defined
            if (this.shouldProvideSharedModule(config)) {
              resolvedProvideMap.set(lookupKey, {
                config,
                version: config.version,
                resource: actualRequest,
              });
            }
          } else if (actualRequest.endsWith('/')) {
            // module request prefix
            prefixMatchProvides.set(lookupKey, config);
          } else {
            // module request
            matchProvides.set(lookupKey, config);
          }
        }

        compilationData.set(compilation, resolvedProvideMap);
        normalModuleFactory.hooks.module.tap(
          'ProvideSharedPlugin',
          (module, { resource, resourceResolveData }, resolveData) => {
            const moduleLayer = module.layer;
            const lookupKeyForResource = createLookupKeyForSharing(
              resource || '',
              moduleLayer || undefined,
            );

            if (resource && resolvedProvideMap.has(lookupKeyForResource)) {
              return module;
            }
            const { request } = resolveData;
            {
              const requestKey = createLookupKeyForSharing(
                request,
                moduleLayer || undefined,
              );
              const config = matchProvides.get(requestKey);
              if (config !== undefined && resource) {
                // Apply request filters if defined
                if (
                  !testRequestFilters(
                    request,
                    config.include?.request,
                    config.exclude?.request,
                  )
                ) {
                  return module;
                }
                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  request,
                  config,
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
              }
            }
            for (const [prefix, config] of prefixMatchProvides) {
              const lookup = config.request || prefix;
              // Refined layer matching logic
              if (config.layer) {
                if (!moduleLayer) {
                  continue; // Option is layered, request is not: skip
                }
                if (moduleLayer !== config.layer) {
                  continue; // Both are layered but do not match: skip
                }
              }
              // If moduleLayer exists but config.layer does not, allow (non-layered option matches layered request)

              if (request.startsWith(lookup) && resource) {
                const remainder = request.slice(lookup.length);

                // Apply request filters if defined
                if (
                  !testRequestFilters(
                    remainder,
                    config.include?.request,
                    config.exclude?.request,
                  )
                ) {
                  continue; // Skip this match if filters don't pass
                }

                // For request filtering, use the original shareKey without concatenation
                const shareKey = config.shareKey || lookup;

                // Validate singleton usage with include.request
                if (config.include?.request && config.singleton) {
                  addSingletonFilterWarning(
                    compilation,
                    shareKey,
                    'include',
                    'request',
                    config.include.request,
                    request,
                    resource,
                  );
                }

                // Validate singleton usage with exclude.request
                if (config.exclude?.request && config.singleton) {
                  addSingletonFilterWarning(
                    compilation,
                    shareKey,
                    'exclude',
                    'request',
                    config.exclude.request,
                    request,
                    resource,
                  );
                }

                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  request,
                  {
                    ...config,
                    shareKey,
                    include: config.include
                      ? { ...config.include, request: undefined }
                      : undefined,
                    exclude: config.exclude
                      ? { ...config.exclude, request: undefined }
                      : undefined,
                  },
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
                break;
              }
            }
            return module;
          },
        );
      },
    );
    compiler.hooks.finishMake.tapPromise(
      'ProvideSharedPlugin',
      async (compilation: Compilation) => {
        const resolvedProvideMap = compilationData.get(compilation);
        if (!resolvedProvideMap) return;

        // Filter out modules that don't pass include/exclude conditions
        const filteredEntries = Array.from(resolvedProvideMap).filter(
          ([resourceKey, { config, version, resource }]) => {
            // Apply the same filtering logic as in provideSharedModule
            const actualResource = resource || resourceKey;

            // Check include conditions
            if (config.include) {
              let versionIncludeFailed = false;
              if (typeof config.include.version === 'string') {
                if (typeof version === 'string' && version) {
                  if (!satisfy(version, config.include.version)) {
                    versionIncludeFailed = true;
                  }
                } else {
                  versionIncludeFailed = true;
                }
              }

              // Check for fallback version if regular version include failed
              if (versionIncludeFailed) {
                if (
                  config.include.fallbackVersion &&
                  satisfy(
                    config.include.fallbackVersion,
                    config.include.version as string,
                  )
                ) {
                  // Fallback version satisfies include condition, allow
                } else {
                  return false; // Include condition not met
                }
              }
            }

            // Check exclude conditions
            if (config.exclude) {
              // Check for fallback version exclude first
              if (config.exclude.fallbackVersion && config.exclude.version) {
                if (
                  satisfy(
                    config.exclude.fallbackVersion,
                    config.exclude.version,
                  )
                ) {
                  return false; // Fallback version matches exclude, filter out
                }
                return true; // Fallback version doesn't match exclude, include
              }

              // Regular version exclude check
              if (
                typeof config.exclude.version === 'string' &&
                typeof version === 'string' &&
                version
              ) {
                if (satisfy(version, config.exclude.version)) {
                  return false; // Exclude condition met, filter out
                }
              }
            }

            return true; // Include this module
          },
        );

        await Promise.all(
          filteredEntries.map(
            ([resourceKey, { config, version, resource }]) => {
              return new Promise<void>((resolve, reject) => {
                compilation.addInclude(
                  compiler.context,
                  new ProvideSharedDependency(
                    config.shareScope!,
                    config.shareKey!,
                    version || false,
                    resource || resourceKey,
                    config.eager!,
                    config.requiredVersion!,
                    config.strictVersion!,
                    config.singleton!,
                    config.layer,
                  ),
                  {
                    name: undefined,
                  },
                  (err?: WebpackErrorType | null | undefined) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  },
                );
              });
            },
          ),
        );
      },
    );

    compiler.hooks.compilation.tap(
      'ProvideSharedPlugin',
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ProvideForSharedDependency,
          normalModuleFactory,
        );

        compilation.dependencyFactories.set(
          ProvideSharedDependency,
          new ProvideSharedModuleFactory(),
        );
      },
    );
  }

  /**
   * Check if a module should be provided based on include/exclude conditions
   * @param {ProvidesConfig} config - The provide configuration
   * @returns {boolean} - True if the module should be provided
   */
  shouldProvideSharedModule(config: ProvidesConfig): boolean {
    // If no filters are defined, always provide
    if (!config.include && !config.exclude) {
      return true;
    }

    // For relative/absolute paths, we can't filter by version at this stage
    // Version filtering is handled in finishMake hook
    return true;
  }

  /**
   * Provide a shared module
   * @param {Compilation} compilation - The webpack compilation
   * @param {ResolvedProvideMap} resolvedProvideMap - The resolved provide map
   * @param {string} request - The module request
   * @param {ProvidesConfig} config - The provide configuration
   * @param {string} resource - The resolved resource path
   * @param {any} resourceResolveData - Resource resolve data
   */
  provideSharedModule(
    compilation: Compilation,
    resolvedProvideMap: ResolvedProvideMap,
    request: string,
    config: ProvidesConfig,
    resource: string,
    resourceResolveData: any,
  ): void {
    const cacheKey = createLookupKeyForSharing(resource, config.layer);
    if (!resolvedProvideMap.has(cacheKey)) {
      resolvedProvideMap.set(cacheKey, {
        config,
        version: config.version,
        resource,
      });
    }
  }
}

export default ProvideSharedPlugin;
