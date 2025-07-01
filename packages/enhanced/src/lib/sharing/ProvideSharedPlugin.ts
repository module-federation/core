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
import {
  addSingletonFilterWarning,
  testRequestFilters,
  createLookupKeyForSharing,
  extractPathAfterNodeModules,
  getRequiredVersionFromDescriptionFile,
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
 * @property {{ version?: string; request?: string | RegExp; fallbackVersion?: string }} [exclude] Options for excluding certain versions or requests
 * @property {{ version?: string; request?: string | RegExp; fallbackVersion?: string }} [include] Options for including only certain versions or requests
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
          nodeModulesReconstructedLookup: false,
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
          exclude: item.exclude,
          include: item.include,
          nodeModulesReconstructedLookup: !!item.nodeModulesReconstructedLookup,
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
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
              resource: actualRequest,
            });
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
              resource: actualRequest,
            });
          } else if (actualRequest.endsWith('/')) {
            prefixMatchProvides.set(lookupKey, config);
          } else {
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

            const { request: originalRequestString } = resolveData;

            // --- Stage 1a: Direct match with originalRequestString ---
            const originalRequestLookupKey = createLookupKeyForSharing(
              originalRequestString,
              moduleLayer || undefined,
            );
            const configFromOriginalDirect = matchProvides.get(
              originalRequestLookupKey,
            );

            if (
              configFromOriginalDirect !== undefined &&
              resource &&
              !resolvedProvideMap.has(lookupKeyForResource)
            ) {
              this.provideSharedModule(
                compilation,
                resolvedProvideMap,
                originalRequestString,
                configFromOriginalDirect,
                resource,
                resourceResolveData,
              );
              resolveData.cacheable = false;
            }

            // --- Stage 1b: Prefix match with originalRequestString ---
            if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
              for (const [
                prefixLookupKey,
                originalPrefixConfig,
              ] of prefixMatchProvides) {
                const configuredPrefix =
                  originalPrefixConfig.request || prefixLookupKey.split('?')[0];

                // Refined layer matching logic
                if (originalPrefixConfig.layer) {
                  if (!moduleLayer) {
                    continue; // Option is layered, request is not: skip
                  }
                  if (moduleLayer !== originalPrefixConfig.layer) {
                    continue; // Both are layered but do not match: skip
                  }
                }
                // If moduleLayer exists but config.layer does not, allow (non-layered option matches layered request)

                if (originalRequestString.startsWith(configuredPrefix)) {
                  if (resolvedProvideMap.has(lookupKeyForResource)) continue;

                  const remainder = originalRequestString.slice(
                    configuredPrefix.length,
                  );
                  if (
                    !testRequestFilters(
                      remainder,
                      originalPrefixConfig.include?.request,
                      originalPrefixConfig.exclude?.request,
                    )
                  ) {
                    continue;
                  }

                  const finalShareKey =
                    (originalPrefixConfig.shareKey || configuredPrefix) +
                    remainder;

                  // Validate singleton usage when using include.request
                  if (
                    originalPrefixConfig.include?.request &&
                    originalPrefixConfig.singleton
                  ) {
                    addSingletonFilterWarning(
                      compilation,
                      finalShareKey,
                      'include',
                      'request',
                      originalPrefixConfig.include.request,
                      originalRequestString,
                      resource,
                    );
                  }

                  // Validate singleton usage when using exclude.request
                  if (
                    originalPrefixConfig.exclude?.request &&
                    originalPrefixConfig.singleton
                  ) {
                    addSingletonFilterWarning(
                      compilation,
                      finalShareKey,
                      'exclude',
                      'request',
                      originalPrefixConfig.exclude.request,
                      originalRequestString,
                      resource,
                    );
                  }
                  const configForSpecificModule: ProvidesConfig = {
                    ...originalPrefixConfig,
                    shareKey: finalShareKey,
                    request: originalRequestString,
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
                    originalRequestString,
                    configForSpecificModule,
                    resource,
                    resourceResolveData,
                  );
                  resolveData.cacheable = false;
                  break;
                }
              }
            }

            // --- Stage 2: Match using reconstructed node_modules path ---
            if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
              const modulePathAfterNodeModules =
                extractPathAfterNodeModules(resource);

              if (modulePathAfterNodeModules) {
                // 2a. Direct match with reconstructed path
                const reconstructedLookupKey = createLookupKeyForSharing(
                  modulePathAfterNodeModules,
                  moduleLayer || undefined,
                );
                const configFromReconstructedDirect = matchProvides.get(
                  reconstructedLookupKey,
                );

                if (
                  configFromReconstructedDirect !== undefined &&
                  configFromReconstructedDirect.nodeModulesReconstructedLookup &&
                  !resolvedProvideMap.has(lookupKeyForResource)
                ) {
                  this.provideSharedModule(
                    compilation,
                    resolvedProvideMap,
                    modulePathAfterNodeModules,
                    configFromReconstructedDirect,
                    resource,
                    resourceResolveData,
                  );
                  resolveData.cacheable = false;
                }

                // 2b. Prefix match with reconstructed path
                if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
                  for (const [
                    prefixLookupKey,
                    originalPrefixConfig,
                  ] of prefixMatchProvides) {
                    if (!originalPrefixConfig.nodeModulesReconstructedLookup) {
                      continue;
                    }
                    const configuredPrefix =
                      originalPrefixConfig.request ||
                      prefixLookupKey.split('?')[0];

                    // Refined layer matching logic for reconstructed path
                    if (originalPrefixConfig.layer) {
                      if (!moduleLayer) {
                        continue; // Option is layered, request is not: skip
                      }
                      if (moduleLayer !== originalPrefixConfig.layer) {
                        continue; // Both are layered but do not match: skip
                      }
                    }
                    // If moduleLayer exists but config.layer does not, allow (non-layered option matches layered request)

                    if (
                      modulePathAfterNodeModules.startsWith(configuredPrefix)
                    ) {
                      if (resolvedProvideMap.has(lookupKeyForResource))
                        continue;

                      const remainder = modulePathAfterNodeModules.slice(
                        configuredPrefix.length,
                      );
                      if (
                        !testRequestFilters(
                          remainder,
                          originalPrefixConfig.include?.request,
                          originalPrefixConfig.exclude?.request,
                        )
                      ) {
                        continue;
                      }

                      const finalShareKey =
                        (originalPrefixConfig.shareKey || configuredPrefix) +
                        remainder;

                      // Validate singleton usage when using include.request
                      if (
                        originalPrefixConfig.include?.request &&
                        originalPrefixConfig.singleton
                      ) {
                        addSingletonFilterWarning(
                          compilation,
                          finalShareKey,
                          'include',
                          'request',
                          originalPrefixConfig.include.request,
                          modulePathAfterNodeModules,
                          resource,
                        );
                      }

                      // Validate singleton usage when using exclude.request
                      if (
                        originalPrefixConfig.exclude?.request &&
                        originalPrefixConfig.singleton
                      ) {
                        addSingletonFilterWarning(
                          compilation,
                          finalShareKey,
                          'exclude',
                          'request',
                          originalPrefixConfig.exclude.request,
                          modulePathAfterNodeModules,
                          resource,
                        );
                      }
                      const configForSpecificModule: ProvidesConfig = {
                        ...originalPrefixConfig,
                        shareKey: finalShareKey,
                        request: modulePathAfterNodeModules,
                        include: originalPrefixConfig.include
                          ? {
                              ...originalPrefixConfig.include,
                              request: undefined,
                            }
                          : undefined,
                        exclude: originalPrefixConfig.exclude
                          ? {
                              ...originalPrefixConfig.exclude,
                              request: undefined,
                            }
                          : undefined,
                      };

                      this.provideSharedModule(
                        compilation,
                        resolvedProvideMap,
                        modulePathAfterNodeModules,
                        configForSpecificModule,
                        resource,
                        resourceResolveData,
                      );
                      resolveData.cacheable = false;
                      break;
                    }
                  }
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
          // Try to get version from parent package.json dependencies
          if (resourceResolveData.descriptionFilePath) {
            try {
              const fs = require('fs');
              const path = require('path');
              const parentPkgPath = path.resolve(
                path.dirname(resourceResolveData.descriptionFilePath),
                '..',
                'package.json',
              );
              if (fs.existsSync(parentPkgPath)) {
                const parentPkg = JSON.parse(
                  fs.readFileSync(parentPkgPath, 'utf8'),
                );
                const parentVersion = getRequiredVersionFromDescriptionFile(
                  parentPkg,
                  key,
                );
                if (parentVersion) {
                  version = parentVersion;
                  details = `Using version from parent package.json dependencies: ${version}`;
                } else {
                  details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
                }
              } else {
                details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
              }
            } catch (e) {
              details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
            }
          } else {
            details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
          }
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
    }

    const lookupKey = createLookupKeyForSharing(resource, config.layer);
    resolvedProvideMap.set(lookupKey, {
      config,
      version,
      resource,
    });
  }
}
export default ProvideSharedPlugin;
