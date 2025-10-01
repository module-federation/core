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
    layer?: string;
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
          allowNodeModulesSuffixMatch: false,
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
          allowNodeModulesSuffixMatch: !!(item as any)
            .allowNodeModulesSuffixMatch,
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
            prefixMatchProvides.set(lookupKey, config);
          } else {
            matchProvides.set(lookupKey, config);
          }
        }

        compilationData.set(compilation, resolvedProvideMap);

        // Helpers to streamline matching while preserving behavior
        const layerMatches = (
          optionLayer: string | undefined,
          moduleLayer: string | null | undefined,
        ): boolean =>
          optionLayer ? !!moduleLayer && moduleLayer === optionLayer : true;

        const provide = (
          requestKey: string,
          cfg: ProvidesConfig,
          resource: string,
          resourceResolveData: any,
          resolveData: any,
        ) => {
          this.provideSharedModule(
            compilation,
            resolvedProvideMap,
            requestKey,
            cfg,
            resource,
            resourceResolveData,
          );
          resolveData.cacheable = false;
        };

        const handlePrefixMatch = (
          originalPrefixConfig: ProvidesConfig,
          configuredPrefix: string,
          testString: string,
          requestForConfig: string,
          moduleLayer: string | null | undefined,
          resource: string,
          resourceResolveData: any,
          lookupKeyForResource: string,
          resolveData: any,
        ): boolean => {
          if (!layerMatches(originalPrefixConfig.layer, moduleLayer))
            return false;
          if (!testString.startsWith(configuredPrefix)) return false;
          if (resolvedProvideMap.has(lookupKeyForResource)) return false;

          const remainder = testString.slice(configuredPrefix.length);
          if (
            !testRequestFilters(
              remainder,
              originalPrefixConfig.include?.request,
              originalPrefixConfig.exclude?.request,
            )
          ) {
            return false;
          }

          const finalShareKey = originalPrefixConfig.shareKey
            ? originalPrefixConfig.shareKey + remainder
            : configuredPrefix + remainder;

          if (
            originalPrefixConfig.include?.version &&
            originalPrefixConfig.singleton
          ) {
            addSingletonFilterWarning(
              compilation,
              finalShareKey,
              'include',
              'version',
              originalPrefixConfig.include.version,
              testString,
              resource,
            );
          }
          if (
            originalPrefixConfig.exclude?.version &&
            originalPrefixConfig.singleton
          ) {
            addSingletonFilterWarning(
              compilation,
              finalShareKey,
              'exclude',
              'version',
              originalPrefixConfig.exclude.version,
              testString,
              resource,
            );
          }

          const configForSpecificModule: ProvidesConfig = {
            ...originalPrefixConfig,
            shareKey: finalShareKey,
            request: requestForConfig,
            _originalPrefix: configuredPrefix,
            include: originalPrefixConfig.include
              ? { ...originalPrefixConfig.include }
              : undefined,
            exclude: originalPrefixConfig.exclude
              ? { ...originalPrefixConfig.exclude }
              : undefined,
          };

          provide(
            requestForConfig,
            configForSpecificModule,
            resource,
            resourceResolveData,
            resolveData,
          );
          return true;
        };
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
              // Apply request filters if defined (from PR5's cleaner approach)
              if (
                testRequestFilters(
                  originalRequestString,
                  configFromOriginalDirect.include?.request,
                  configFromOriginalDirect.exclude?.request,
                )
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
            }

            // --- Stage 1b: Prefix match with originalRequestString ---
            if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
              for (const [
                prefixLookupKey,
                originalPrefixConfig,
              ] of prefixMatchProvides) {
                const configuredPrefix =
                  originalPrefixConfig.request || prefixLookupKey.split('?')[0];

                const matched = handlePrefixMatch(
                  originalPrefixConfig,
                  configuredPrefix,
                  originalRequestString,
                  originalRequestString,
                  moduleLayer,
                  resource,
                  resourceResolveData,
                  lookupKeyForResource,
                  resolveData,
                );
                if (matched) break;
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
                  configFromReconstructedDirect.allowNodeModulesSuffixMatch &&
                  !resolvedProvideMap.has(lookupKeyForResource)
                ) {
                  provide(
                    modulePathAfterNodeModules,
                    configFromReconstructedDirect,
                    resource,
                    resourceResolveData,
                    resolveData,
                  );
                }

                // 2b. Prefix match with reconstructed path
                if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
                  for (const [
                    prefixLookupKey,
                    originalPrefixConfig,
                  ] of prefixMatchProvides) {
                    if (!originalPrefixConfig.allowNodeModulesSuffixMatch)
                      continue;
                    const configuredPrefix =
                      originalPrefixConfig.request ||
                      prefixLookupKey.split('?')[0];

                    const matched = handlePrefixMatch(
                      originalPrefixConfig,
                      configuredPrefix,
                      modulePathAfterNodeModules,
                      modulePathAfterNodeModules,
                      moduleLayer,
                      resource,
                      resourceResolveData,
                      lookupKeyForResource,
                      resolveData,
                    );
                    if (matched) break;
                  }
                }
              }
            }

            // --- Stage 3: Alias-aware match using resolved resource path under node_modules ---
            // For bare requests that were aliased to another package location (e.g., react -> next/dist/compiled/react),
            // compare the resolved resource's node_modules suffix against provided requests to infer a match.
            if (resource && !resolvedProvideMap.has(lookupKeyForResource)) {
              const isBareRequest =
                !/^(\/|[A-Za-z]:\\|\\\\|\.{1,2}(\/|$))/.test(
                  originalRequestString,
                );
              const modulePathAfterNodeModules =
                extractPathAfterNodeModules(resource);
              if (isBareRequest && modulePathAfterNodeModules) {
                const normalizedAfterNM = modulePathAfterNodeModules
                  .replace(/\\/g, '/')
                  .replace(/^\/(.*)/, '$1');

                // 3a. Direct provided requests (non-prefix)
                for (const [lookupKey, cfg] of matchProvides) {
                  if (!layerMatches(cfg.layer, moduleLayer)) continue;
                  const configuredRequest = (cfg.request || lookupKey).replace(
                    /\((?:[^)]+)\)/,
                    '',
                  );
                  const normalizedConfigured = configuredRequest
                    .replace(/\\/g, '/')
                    .replace(/\/$/, '');

                  if (
                    normalizedAfterNM === normalizedConfigured ||
                    normalizedAfterNM.startsWith(normalizedConfigured + '/')
                  ) {
                    if (
                      testRequestFilters(
                        originalRequestString,
                        cfg.include?.request,
                        cfg.exclude?.request,
                      )
                    ) {
                      provide(
                        originalRequestString,
                        cfg,
                        resource,
                        resourceResolveData,
                        resolveData,
                      );
                    }
                    break;
                  }
                }

                // 3b. Prefix provided requests (configured as "foo/")
                if (!resolvedProvideMap.has(lookupKeyForResource)) {
                  for (const [
                    prefixLookupKey,
                    originalPrefixConfig,
                  ] of prefixMatchProvides) {
                    if (!layerMatches(originalPrefixConfig.layer, moduleLayer))
                      continue;
                    const configuredPrefix =
                      originalPrefixConfig.request ||
                      prefixLookupKey.split('?')[0];

                    const matched = handlePrefixMatch(
                      originalPrefixConfig,
                      configuredPrefix,
                      normalizedAfterNM,
                      normalizedAfterNM,
                      moduleLayer,
                      resource,
                      resourceResolveData,
                      lookupKeyForResource,
                      resolveData,
                    );
                    if (matched) break;
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

              let requestIncludeFailed = false;
              if (config.include.request) {
                const includeRequestValue = config.include.request;
                // For prefix matches, we need to check the remainder after the prefix
                let testString = actualResource;

                // If this is a prefix match (indicated by _originalPrefix being present)
                // then we should test against the remainder
                if (
                  config._originalPrefix &&
                  actualResource.startsWith(config._originalPrefix)
                ) {
                  const remainder = actualResource.slice(
                    config._originalPrefix.length,
                  );
                  testString = remainder;
                }

                const requestActuallyMatches =
                  includeRequestValue instanceof RegExp
                    ? includeRequestValue.test(testString)
                    : testString === includeRequestValue;
                if (!requestActuallyMatches) {
                  requestIncludeFailed = true;
                }
              }

              // Skip if any specified include condition failed
              const shouldSkipVersion =
                typeof config.include.version === 'string' &&
                versionIncludeFailed;
              const shouldSkipRequest =
                config.include.request && requestIncludeFailed;

              if (shouldSkipVersion || shouldSkipRequest) {
                return false;
              }
            }

            // Check exclude conditions
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
                // For prefix matches, we need to check the remainder after the prefix
                let testString = actualResource;

                // If this is a prefix match (indicated by _originalPrefix being present)
                // then we should test against the remainder
                if (
                  config._originalPrefix &&
                  actualResource.startsWith(config._originalPrefix)
                ) {
                  const remainder = actualResource.slice(
                    config._originalPrefix.length,
                  );
                  testString = remainder;
                }

                const requestActuallyMatchesExclude =
                  excludeRequestValue instanceof RegExp
                    ? excludeRequestValue.test(testString)
                    : testString === excludeRequestValue;
                if (requestActuallyMatchesExclude) {
                  requestExcludeMatches = true;
                }
              }

              // Skip if any specified exclude condition matched
              if (versionExcludeMatches || requestExcludeMatches) {
                return false;
              }
            }

            return true;
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
          // Try to get version from parent package.json dependencies (PR7 enhanced feature)
          if (resourceResolveData.descriptionFilePath) {
            try {
              // fs is now imported at the top of the file
              const path = require('path');
              const fs = require('fs');
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
    const mapValue: any = {
      config,
      version,
      resource,
    };
    if (config.layer !== undefined) {
      mapValue.layer = config.layer;
    }
    resolvedProvideMap.set(lookupKey, mapValue);
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
