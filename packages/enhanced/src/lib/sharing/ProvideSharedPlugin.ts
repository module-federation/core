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
import { satisfy } from '@module-federation/runtime-tools/runtime-core';
import { addSingletonFilterWarning, testRequestFilters } from './utils';
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
 * @property {{ version?: string; request?: string | RegExp; fallbackVersion?: string }} [exclude] Options for excluding certain versions or requests
 * @property {{ version?: string; request?: string | RegExp; fallbackVersion?: string }} [include] Options for including only certain versions or requests
 */

/** @typedef {Map<string, { config: ProvideOptions, version: string | undefined | false }>} ResolvedProvideMap */

// Helper function to create composite key
function createLookupKey(
  request: string,
  config: { layer?: string | null },
): string {
  if (config.layer) {
    return `(${config.layer})${request}`;
  }
  return request;
}

class ProvideSharedPlugin {
  private _provides: [string, ProvidesConfig][];
  private _experiments: NonNullable<ProvideSharedPluginOptions['experiments']>;

  /**
   * @param {ProvideSharedPluginOptions} options options
   */
  constructor(options: ProvideSharedPluginOptions) {
    validate(options);

    this._experiments = options.experiments || {};

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
          exclude: undefined,
          include: undefined,
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
          exclude: item.exclude,
          include: item.include,
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
            // relative request
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
            });
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            // absolute path
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
            });
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
                // Check for request filters with singleton here
                if (
                  config.exclude &&
                  config.exclude.request &&
                  config.singleton
                ) {
                  addSingletonFilterWarning(
                    compilation,
                    config.shareKey || request,
                    'exclude',
                    'request',
                    config.exclude.request,
                    request, // moduleRequest
                    resource, // moduleResource
                  );
                }

                if (
                  config.include &&
                  config.include.request &&
                  config.singleton
                ) {
                  addSingletonFilterWarning(
                    compilation,
                    config.shareKey || request,
                    'include',
                    'request',
                    config.include.request,
                    request, // moduleRequest
                    resource, // moduleResource
                  );
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

            // Process normal prefix matches
            for (const [
              prefixKey,
              originalPrefixConfig,
            ] of prefixMatchProvides) {
              const lookupPrefix = originalPrefixConfig.request || prefixKey;

              if (request.startsWith(lookupPrefix) && resource) {
                const remainder = request.slice(lookupPrefix.length);
                if (
                  !testRequestFilters(
                    remainder,
                    originalPrefixConfig.include?.request,
                    originalPrefixConfig.exclude?.request,
                  )
                ) {
                  continue;
                }

                // Check for prefix request filters with singleton
                if (
                  originalPrefixConfig.exclude &&
                  originalPrefixConfig.exclude.request &&
                  originalPrefixConfig.singleton
                ) {
                  addSingletonFilterWarning(
                    compilation,
                    originalPrefixConfig.shareKey || lookupPrefix,
                    'exclude',
                    'request',
                    originalPrefixConfig.exclude.request,
                    request, // moduleRequest (full request)
                    resource, // moduleResource
                  );
                }

                if (
                  originalPrefixConfig.include &&
                  originalPrefixConfig.include.request &&
                  originalPrefixConfig.singleton
                ) {
                  addSingletonFilterWarning(
                    compilation,
                    originalPrefixConfig.shareKey || lookupPrefix,
                    'include',
                    'request',
                    originalPrefixConfig.include.request,
                    request, // moduleRequest (full request)
                    resource, // moduleResource
                  );
                }

                const finalShareKey = originalPrefixConfig.shareKey + remainder;
                const configForSpecificModule: ProvidesConfig = {
                  ...originalPrefixConfig,
                  shareKey: finalShareKey,
                  request: request, // Full matched request
                  // Clear request-based include/exclude as they were for the remainder
                  include: originalPrefixConfig.include
                    ? { ...originalPrefixConfig.include, request: undefined }
                    : undefined,
                  exclude: originalPrefixConfig.exclude
                    ? { ...originalPrefixConfig.exclude, request: undefined }
                    : undefined,
                };

                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  request, // key for error reporting
                  configForSpecificModule,
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
              }
            }

            // Handle paths through node_modules as fallback
            if (
              this._experiments.nodeModulesReconstructedLookup &&
              resource &&
              resource.includes('node_modules') &&
              !resolvedProvideMap.has(lookupKey)
            ) {
              const nodeModulesIndex = resource.lastIndexOf('node_modules');
              const modulePathAfterNodeModules = resource.substring(
                nodeModulesIndex + 'node_modules/'.length,
              );

              // Try direct match with module path after node_modules
              const modulePathKey = createLookupKey(
                modulePathAfterNodeModules,
                {
                  layer: moduleLayer || undefined,
                },
              );
              const moduleConfig = matchProvides.get(modulePathKey);

              if (moduleConfig !== undefined) {
                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  modulePathAfterNodeModules,
                  moduleConfig,
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
              }

              // Also check for prefix matches with the module path after node_modules
              for (const [
                prefixKeyPM,
                originalPrefixConfigPM,
              ] of prefixMatchProvides) {
                const lookupPM = originalPrefixConfigPM.request || prefixKeyPM;
                if (modulePathAfterNodeModules.startsWith(lookupPM)) {
                  const remainderPM = modulePathAfterNodeModules.slice(
                    lookupPM.length,
                  );

                  // Apply include/exclude filters based on remainderPM
                  if (
                    !testRequestFilters(
                      remainderPM,
                      originalPrefixConfigPM.include?.request,
                      originalPrefixConfigPM.exclude?.request,
                    )
                  ) {
                    continue;
                  }

                  this.provideSharedModule(
                    compilation,
                    resolvedProvideMap,
                    modulePathAfterNodeModules,
                    {
                      ...originalPrefixConfigPM,
                      shareKey: originalPrefixConfigPM.shareKey + remainderPM,
                    },
                    resource,
                    resourceResolveData,
                  );
                  resolveData.cacheable = false;
                }
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

      let requestIncludeFailed = false;
      if (config.include.request) {
        const includeRequestValue = config.include.request;
        const requestActuallyMatches =
          includeRequestValue instanceof RegExp
            ? includeRequestValue.test(resource)
            : resource === includeRequestValue;
        if (!requestActuallyMatches) {
          requestIncludeFailed = true;
        }
      }

      // Skip if any specified include condition failed
      const shouldSkipVersion =
        typeof config.include.version === 'string' && versionIncludeFailed;
      const shouldSkipRequest = config.include.request && requestIncludeFailed;

      if (shouldSkipVersion || shouldSkipRequest) {
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
          key, // moduleRequest
          resource, // moduleResource
        );
      }

      // Validate singleton usage when using include.request
      if (config.include.request && config.singleton) {
        addSingletonFilterWarning(
          compilation,
          config.shareKey || key,
          'include',
          'request',
          config.include.request,
          key, // moduleRequest
          resource, // moduleResource
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

      let requestExcludeMatches = false;
      if (config.exclude.request) {
        const excludeRequestValue = config.exclude.request;
        const requestActuallyMatchesExclude =
          excludeRequestValue instanceof RegExp
            ? excludeRequestValue.test(resource)
            : resource === excludeRequestValue;
        if (requestActuallyMatchesExclude) {
          requestExcludeMatches = true;
        }
      }

      // Skip if any specified exclude condition matched
      if (versionExcludeMatches || requestExcludeMatches) {
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
          key, // moduleRequest
          resource, // moduleResource
        );
      }

      // Validate singleton usage when using exclude.request
      if (config.exclude.request && config.singleton) {
        addSingletonFilterWarning(
          compilation,
          config.shareKey || key,
          'exclude',
          'request',
          config.exclude.request,
          key, // moduleRequest
          resource, // moduleResource
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
}
export default ProvideSharedPlugin;
