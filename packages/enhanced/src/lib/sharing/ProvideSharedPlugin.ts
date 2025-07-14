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

// Helper function to create composite key
function createLookupKey(
  request: string,
  config: { layer?: string | null },
): string {
  return createLookupKeyForSharing(request, config.layer);
}

class ProvideSharedPlugin {
  private _provides: [string, ProvidesConfig][];

  /**
   * @param {ProvideSharedPluginOptions} options options
   */
  constructor(options: ProvideSharedPluginOptions) {
    validate(options);

    this._provides = parseOptions(
      options.provides,
      (item) => {
        if (Array.isArray(item))
          throw new Error('Unexpected array of provides');
        /** @type {ProvidesConfig} */
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
        };
        return result;
      },
      (item, key) => {
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
          const lookupKey = createLookupKey(actualRequest, config);
          if (/^(\/|[A-Za-z]:\\|\\\\|\.\.?(\/|$))/.test(actualRequest)) {
            // relative request - apply filtering if include/exclude are defined
            if (this.shouldProvideSharedModule(config)) {
              resolvedProvideMap.set(lookupKey, {
                config,
                version: config.version,
              });
            }
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            // absolute path - apply filtering if include/exclude are defined
            if (this.shouldProvideSharedModule(config)) {
              resolvedProvideMap.set(lookupKey, {
                config,
                version: config.version,
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
            const lookupKey = createLookupKey(resource || '', {
              layer: moduleLayer || undefined,
            });

            if (resource && resolvedProvideMap.has(lookupKey)) {
              return module;
            }
            const { request } = resolveData;
            {
              const requestKey = createLookupKey(request, {
                layer: moduleLayer || undefined,
              });
              const config = matchProvides.get(requestKey);
              if (config !== undefined && resource) {
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

                const shareKey = config.shareKey + remainder;

                // Check singleton warning for request filters
                if (config.singleton) {
                  if (config.include?.request) {
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
                  if (config.exclude?.request) {
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
                }

                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  resource,
                  {
                    ...config,
                    shareKey,
                  },
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
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

        await Promise.all(
          Array.from(
            resolvedProvideMap,
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

  private provideSharedModule(
    compilation: Compilation,
    resolvedProvideMap: ResolvedProvideMap,
    key: string,
    config: ProvidesConfig,
    resource: string,
    resourceResolveData: any,
  ): void {
    let version = config.version;
    if (version === undefined) {
      let details = '';
      if (!resourceResolveData) {
        details = `No resolve data provided from resolver.`;
      } else {
        const descriptionFileData = resourceResolveData.descriptionFileData;
        if (!descriptionFileData) {
          details =
            'No description file (usually package.json) found. Add description file with name and version, or manually specify version in shared config.';
        } else if (!descriptionFileData.version) {
          details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
        } else {
          version = descriptionFileData.version;
        }
      }
      if (!version) {
        const error = new WebpackError(
          `No version specified and unable to automatically determine one. ${details}`,
        );
        error.file = `shared module ${key} -> ${resource}`;
        compilation.warnings.push(error);
      }
    }

    // Check include/exclude conditions
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

      // Skip if any specified include condition failed
      const shouldSkipVersion =
        typeof config.include.version === 'string' && versionIncludeFailed;

      if (shouldSkipVersion) {
        const error = new WebpackError(
          `Provided module "${key}" version "${version}" does not satisfy include filter "${config.include.version}"`,
        );
        error.file = `shared module ${key} -> ${resource}`;
        compilation.warnings.push(error);
        return;
      }

      // Validate singleton usage when using include.version
      if (config.include.version && config.singleton) {
        addSingletonFilterWarning(
          compilation,
          config.shareKey || key,
          'include',
          'version',
          config.include.version,
          key,
          resource,
        );
      }
    }

    if (config.exclude) {
      let versionExcludeMatches = false;
      if (
        typeof config.exclude.version === 'string' &&
        typeof version === 'string' &&
        version
      ) {
        if (satisfy(version, config.exclude.version)) {
          versionExcludeMatches = true;
        }
      }

      // Skip if any specified exclude condition matched
      if (versionExcludeMatches) {
        const error = new WebpackError(
          `Provided module "${key}" version "${version}" matches exclude filter "${config.exclude.version}"`,
        );
        error.file = `shared module ${key} -> ${resource}`;
        compilation.warnings.push(error);
        return;
      }

      // Validate singleton usage when using exclude.version
      if (config.exclude.version && config.singleton) {
        addSingletonFilterWarning(
          compilation,
          config.shareKey || key,
          'exclude',
          'version',
          config.exclude.version,
          key,
          resource,
        );
      }
    }

    const lookupKey = createLookupKey(resource, config);
    resolvedProvideMap.set(lookupKey, {
      config,
      version,
      resource,
    });
  }

  private shouldProvideSharedModule(config: ProvidesConfig): boolean {
    // For static (relative/absolute path) modules, we can only check version filters
    // if the version is explicitly provided in the config
    if (!config.version) {
      // If no version is provided and there are version filters,
      // we'll defer to runtime filtering
      return true;
    }

    const version = config.version;
    if (typeof version !== 'string') {
      return true;
    }

    // Check include version filter
    if (config.include?.version) {
      const includeVersion = config.include.version;
      if (typeof includeVersion === 'string') {
        if (!satisfy(version, includeVersion)) {
          return false; // Skip providing this module
        }
      }
    }

    // Check exclude version filter
    if (config.exclude?.version) {
      const excludeVersion = config.exclude.version;
      if (typeof excludeVersion === 'string') {
        if (satisfy(version, excludeVersion)) {
          return false; // Skip providing this module
        }
      }
    }

    return true; // All filters pass
  }
}
export default ProvideSharedPlugin;
