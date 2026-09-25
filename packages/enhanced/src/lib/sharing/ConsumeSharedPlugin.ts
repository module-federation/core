/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';

// Hoisted regex constants
const DIRECT_FALLBACK_REGEX = /^(\.\.?(\/|$)|\/|[A-Za-z]:|\\\\)/;
const ABSOLUTE_PATH_REGEX = /^(\/|[A-Za-z]:|\\\\)/;
const RELATIVE_OR_ABSOLUTE_PATH_REGEX = /^(?:\.{1,2}[\\/]|\/|[A-Za-z]:|\\\\)/;
const PACKAGE_NAME_REGEX = /^((?:@[^\\/]+[\\/])?[^\\/]+)/;

import {
  getWebpackPath,
  normalizeWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import { isRequiredVersion } from '@module-federation/sdk';
import type { Compiler, Compilation, Module } from 'webpack';
import { parseOptions } from '../container/options';
import type { consumeSharedPlugin } from '@module-federation/sdk';
type ConsumeSharedPluginOptions =
  consumeSharedPlugin.ConsumeSharedPluginOptions;
import { resolveMatchedConfigs } from './resolveMatchedConfigs';
import {
  getDescriptionFile,
  getRequiredVersionFromDescriptionFile,
} from './utils';
import type {
  ResolveOptionsWithDependencyType,
  ResolverWithOptions,
} from 'webpack/lib/ResolverFactory';
import ConsumeSharedFallbackDependency from './ConsumeSharedFallbackDependency';
import ConsumeSharedModule from './ConsumeSharedModule';
import ConsumeSharedRuntimeModule from './ConsumeSharedRuntimeModule';
import ProvideForSharedDependency from './ProvideForSharedDependency';
import FederationRuntimePlugin from '../container/runtime/FederationRuntimePlugin';
import ShareRuntimeModule from './ShareRuntimeModule';
import type { SemVerRange } from 'webpack/lib/util/semver';
import type { InputFileSystem } from 'webpack/lib/util/fs';
import type { ResolveData } from 'webpack/lib/NormalModuleFactory';
import type { ModuleFactoryCreateDataContextInfo } from 'webpack/lib/ModuleFactory';
import type { ConsumeOptions } from '@module-federation/sdk';
import { createSchemaValidation } from '../../utils';
import path from 'path';
const { satisfy, parseRange } = require(
  normalizeWebpackPath('webpack/lib/util/semver'),
) as typeof import('webpack/lib/util/semver');
import {
  addSingletonFilterWarning,
  testRequestFilters,
  createLookupKeyForSharing,
  extractPathAfterNodeModules,
} from './utils';

const ModuleNotFoundError = require(
  normalizeWebpackPath('webpack/lib/ModuleNotFoundError'),
) as typeof import('webpack/lib/ModuleNotFoundError');
const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const LazySet = require(
  normalizeWebpackPath('webpack/lib/util/LazySet'),
) as typeof import('webpack/lib/util/LazySet');
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

const validate = createSchemaValidation(
  // eslint-disable-next-line
  require('../../schemas/sharing/ConsumeSharedPlugin.check.js').validate,
  () => require('../../schemas/sharing/ConsumeSharedPlugin').default,
  {
    name: 'Consume Shared Plugin',
    baseDataPath: 'options',
  },
);

const RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};
const PLUGIN_NAME = 'ConsumeSharedPlugin';

function getPackageVersion(
  fs: InputFileSystem,
  resource: string,
  packageName: string,
): Promise<string | undefined> {
  return new Promise((resolve) => {
    getDescriptionFile(
      fs,
      path.dirname(resource),
      ['package.json'],
      (err, result) => resolve(err ? undefined : result?.data['version']),
      (result) =>
        !!result &&
        typeof result.data['version'] === 'string' &&
        result.data['name'] === packageName,
    );
  });
}

class ConsumeSharedPlugin {
  private _consumes: [string, ConsumeOptions][];

  constructor(options: ConsumeSharedPluginOptions) {
    if (typeof options !== 'string') {
      validate(options);
    }

    this._consumes = parseOptions(
      options.consumes,
      (item, key) => {
        if (Array.isArray(item)) throw new Error('Unexpected array in options');
        //@ts-ignore
        const result: ConsumeOptions =
          item === key || !isRequiredVersion(item)
            ? // item is a request/key
              {
                import: key,
                shareScope: options.shareScope || 'default',
                shareKey: key,
                requiredVersion: undefined,
                packageName: undefined,
                strictVersion: false,
                singleton: false,
                eager: false,
                issuerLayer: undefined,
                layer: undefined,
                request: key,
                include: undefined,
                exclude: undefined,
                allowNodeModulesSuffixMatch: undefined,
                treeShakingMode: undefined,
              }
            : // key is a request/key
              // item is a version
              {
                import: key,
                shareScope: options.shareScope || 'default',
                shareKey: key,
                // webpack internal semver has some issue, use runtime semver , related issue: https://github.com/webpack/webpack/issues/17756
                requiredVersion: item,
                strictVersion: true,
                packageName: undefined,
                singleton: false,
                eager: false,
                issuerLayer: undefined,
                layer: undefined,
                request: key,
                include: undefined,
                exclude: undefined,
                allowNodeModulesSuffixMatch: undefined,
                treeShakingMode: undefined,
              };
        return result;
      },
      (item, key) => {
        const request = item.request || key;
        return {
          import: item.import === false ? undefined : item.import || request,
          shareScope: item.shareScope || options.shareScope || 'default',
          shareKey: item.shareKey || request,
          requiredVersion:
            item.requiredVersion === false
              ? false
              : // @ts-ignore  webpack internal semver has some issue, use runtime semver , related issue: https://github.com/webpack/webpack/issues/17756
                (item.requiredVersion as SemVerRange),
          strictVersion:
            typeof item.strictVersion === 'boolean'
              ? item.strictVersion
              : item.import !== false && !item.singleton,
          packageName: item.packageName,
          singleton: !!item.singleton,
          eager: !!item.eager,
          exclude: item.exclude,
          include: item.include,
          issuerLayer: item.issuerLayer ? item.issuerLayer : undefined,
          layer: item.layer ? item.layer : undefined,
          request,
          allowNodeModulesSuffixMatch: item.allowNodeModulesSuffixMatch,
          treeShakingMode: item.treeShakingMode,
        } as ConsumeOptions;
      },
    );
  }

  createConsumeSharedModule(
    compilation: Compilation,
    context: string,
    request: string,
    config: ConsumeOptions,
  ): Promise<ConsumeSharedModule | undefined> {
    const requiredVersionWarning = (details: string) => {
      const error = new WebpackError(
        `No required version specified and unable to automatically determine one. ${details}`,
      );
      error.file = `shared module ${request}`;
      compilation.warnings.push(error);
    };
    const directFallback =
      config.import && DIRECT_FALLBACK_REGEX.test(config.import);
    const packageName =
      config.packageName ??
      (ABSOLUTE_PATH_REGEX.test(request)
        ? undefined
        : PACKAGE_NAME_REGEX.exec(request)?.[0]);

    const resolver: ResolverWithOptions = compilation.resolverFactory.get(
      'normal',
      RESOLVE_OPTIONS as ResolveOptionsWithDependencyType,
    );

    return Promise.all([
      new Promise<string | undefined>((resolve) => {
        if (!config.import) return resolve(undefined);
        const resolveContext = {
          fileDependencies: new LazySet<string>(),
          contextDependencies: new LazySet<string>(),
          missingDependencies: new LazySet<string>(),
        };
        resolver.resolve(
          {},
          directFallback ? compilation.compiler.context : context,
          config.import,
          resolveContext,
          (err, result) => {
            compilation.contextDependencies.addAll(
              resolveContext.contextDependencies,
            );
            compilation.fileDependencies.addAll(
              resolveContext.fileDependencies,
            );
            compilation.missingDependencies.addAll(
              resolveContext.missingDependencies,
            );
            if (err) {
              compilation.errors.push(
                new ModuleNotFoundError(null, err, {
                  name: `resolving fallback for shared module ${request}`,
                }),
              );
              return resolve(undefined);
            }
            //@ts-ignore
            resolve(result);
          },
        );
      }),
      new Promise<false | undefined | SemVerRange>((resolve) => {
        if (config.requiredVersion !== undefined) {
          return resolve(config.requiredVersion);
        }
        if (packageName === undefined) {
          if (!ABSOLUTE_PATH_REGEX.test(request)) {
            requiredVersionWarning(
              'Unable to extract the package name from request.',
            );
          }
          return resolve(undefined);
        }

        getDescriptionFile(
          compilation.inputFileSystem,
          context,
          ['package.json'],
          (err, result, checkedDescriptionFilePaths) => {
            if (err) {
              requiredVersionWarning(`Unable to read description file: ${err}`);
              return resolve(undefined);
            }
            const { data } = /** @type {DescriptionFile} */ result || {};
            if (!data) {
              if (checkedDescriptionFilePaths?.length) {
                requiredVersionWarning(
                  [
                    `Unable to find required version for "${packageName}" in description file/s`,
                    checkedDescriptionFilePaths.join('\n'),
                    'It need to be in dependencies, devDependencies or peerDependencies.',
                  ].join('\n'),
                );
              } else {
                requiredVersionWarning(
                  `Unable to find description file in ${context}.`,
                );
              }

              return resolve(undefined);
            }
            if (data['name'] === packageName) {
              // Package self-referencing
              return resolve(undefined);
            }
            const requiredVersion = getRequiredVersionFromDescriptionFile(
              data,
              packageName,
            );
            //TODO: align with webpck semver parser again
            // @ts-ignore  webpack internal semver has some issue, use runtime semver , related issue: https://github.com/webpack/webpack/issues/17756
            resolve(requiredVersion);
          },
          (result) => {
            if (!result) return false;
            const { data } = result;
            const maybeRequiredVersion = getRequiredVersionFromDescriptionFile(
              data,
              packageName,
            );
            return (
              data['name'] === packageName ||
              typeof maybeRequiredVersion === 'string'
            );
          },
        );
      }),
    ]).then(([importResolved, requiredVersion]) => {
      const currentConfig = {
        ...config,
        importResolved,
        import: importResolved ? config.import : undefined,
        requiredVersion,
      };
      const consumedModule = new ConsumeSharedModule(
        directFallback ? compilation.compiler.context : context,
        currentConfig,
      );

      const { include, exclude } = config;
      if (include && typeof include.version === 'string') {
        if (!importResolved || packageName === undefined) {
          return consumedModule;
        }
        const includeVersion = include.version;
        return getPackageVersion(
          compilation.inputFileSystem,
          importResolved,
          packageName,
        ).then((version) => {
          if (!version) {
            return consumedModule;
          }
          if (satisfy(parseRange(includeVersion), version)) {
            if (config.singleton) {
              addSingletonFilterWarning(
                compilation,
                config.shareKey || request,
                'include',
                'version',
                includeVersion,
                request,
                importResolved,
              );
            }
            return consumedModule;
          }
          if (
            typeof include.fallbackVersion === 'string' &&
            include.fallbackVersion &&
            satisfy(parseRange(includeVersion), include.fallbackVersion)
          ) {
            return consumedModule;
          }
          return undefined;
        });
      }

      if (exclude && typeof exclude.version === 'string') {
        if (!importResolved || packageName === undefined) {
          return consumedModule;
        }
        const excludeVersion = exclude.version;
        if (
          typeof exclude.fallbackVersion === 'string' &&
          exclude.fallbackVersion
        ) {
          return satisfy(parseRange(excludeVersion), exclude.fallbackVersion)
            ? undefined
            : consumedModule;
        }
        return getPackageVersion(
          compilation.inputFileSystem,
          importResolved,
          packageName,
        ).then((version) => {
          if (!version) {
            return consumedModule;
          }
          if (satisfy(parseRange(excludeVersion), version)) {
            return undefined;
          }
          if (config.singleton) {
            addSingletonFilterWarning(
              compilation,
              config.shareKey || request,
              'exclude',
              'version',
              excludeVersion,
              request,
              importResolved,
            );
          }
          return consumedModule;
        });
      }

      return consumedModule;
    });
  }

  apply(compiler: Compiler): void {
    new FederationRuntimePlugin().apply(compiler);
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ConsumeSharedFallbackDependency,
          normalModuleFactory,
        );

        let unresolvedConsumes: Map<string, ConsumeOptions>,
          resolvedConsumes: Map<string, ConsumeOptions>,
          prefixedConsumes: Map<string, ConsumeOptions>;
        const promise = resolveMatchedConfigs(compilation, this._consumes).then(
          ({ resolved, unresolved, prefixed }) => {
            resolvedConsumes = resolved;
            unresolvedConsumes = unresolved;
            prefixedConsumes = prefixed;
          },
        );

        normalModuleFactory.hooks.factorize.tapPromise(
          PLUGIN_NAME,
          async (resolveData: ResolveData): Promise<Module | undefined> => {
            const { context, request, dependencies, contextInfo } = resolveData;
            // wait for resolving to be complete
            // BIND `this` for createConsumeSharedModule call
            const boundCreateConsumeSharedModule =
              this.createConsumeSharedModule.bind(this);

            return promise.then(() => {
              if (
                dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                dependencies[0] instanceof ProvideForSharedDependency
              ) {
                return;
              }
              const { context, request, contextInfo } = resolveData;

              const match =
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, contextInfo.issuerLayer),
                ) ||
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, undefined),
                );

              // First check direct match with original request
              if (match !== undefined) {
                // Use the bound function
                return boundCreateConsumeSharedModule(
                  compilation,
                  context,
                  request,
                  match,
                );
              }

              // Then try relative path handling and node_modules paths
              let reconstructed: string | null = null;
              let modulePathAfterNodeModules: string | null = null;

              if (
                request &&
                !path.isAbsolute(request) &&
                RELATIVE_OR_ABSOLUTE_PATH_REGEX.test(request)
              ) {
                reconstructed = path.join(context, request);
                modulePathAfterNodeModules =
                  extractPathAfterNodeModules(reconstructed);

                // Try to match with module path after node_modules
                if (modulePathAfterNodeModules) {
                  const moduleMatch =
                    unresolvedConsumes.get(
                      createLookupKeyForSharing(
                        modulePathAfterNodeModules,
                        contextInfo.issuerLayer,
                      ),
                    ) ||
                    unresolvedConsumes.get(
                      createLookupKeyForSharing(
                        modulePathAfterNodeModules,
                        undefined,
                      ),
                    );

                  if (
                    moduleMatch !== undefined &&
                    moduleMatch.allowNodeModulesSuffixMatch
                  ) {
                    return boundCreateConsumeSharedModule(
                      compilation,
                      context,
                      modulePathAfterNodeModules,
                      moduleMatch,
                    );
                  }
                }

                // Try to match with the full reconstructed path
                const reconstructedMatch =
                  unresolvedConsumes.get(
                    createLookupKeyForSharing(
                      reconstructed,
                      contextInfo.issuerLayer,
                    ),
                  ) ||
                  unresolvedConsumes.get(
                    createLookupKeyForSharing(reconstructed, undefined),
                  );

                if (reconstructedMatch !== undefined) {
                  return boundCreateConsumeSharedModule(
                    compilation,
                    context,
                    reconstructed,
                    reconstructedMatch,
                  );
                }
              }
              // Check for prefixed consumes with original request
              for (const [prefix, options] of prefixedConsumes) {
                const lookup = options.request || prefix;
                // Refined issuerLayer matching logic
                if (options.issuerLayer) {
                  if (!contextInfo.issuerLayer) {
                    continue; // Option is layered, request is not: skip
                  }
                  if (contextInfo.issuerLayer !== options.issuerLayer) {
                    continue; // Both are layered but do not match: skip
                  }
                }
                // If contextInfo.issuerLayer exists but options.issuerLayer does not, allow (non-layered option matches layered request)
                if (request.startsWith(lookup)) {
                  const remainder = request.slice(lookup.length);
                  if (
                    !testRequestFilters(
                      remainder,
                      options.include?.request,
                      options.exclude?.request,
                    )
                  ) {
                    continue;
                  }

                  // Use the bound function
                  return boundCreateConsumeSharedModule(
                    compilation,
                    context,
                    request,
                    {
                      ...options,
                      import: options.import
                        ? options.import + remainder
                        : undefined,
                      shareKey: options.shareKey + remainder,
                      layer: options.layer,
                    },
                  );
                }
              }

              // Also check prefixed consumes with modulePathAfterNodeModules
              if (modulePathAfterNodeModules) {
                for (const [prefix, options] of prefixedConsumes) {
                  if (!options.allowNodeModulesSuffixMatch) {
                    continue;
                  }
                  // Refined issuerLayer matching logic for reconstructed path
                  if (options.issuerLayer) {
                    if (!contextInfo.issuerLayer) {
                      continue; // Option is layered, request is not: skip
                    }
                    if (contextInfo.issuerLayer !== options.issuerLayer) {
                      continue; // Both are layered but do not match: skip
                    }
                  }
                  // If contextInfo.issuerLayer exists but options.issuerLayer does not, allow (non-layered option matches layered request)
                  const lookup = options.request || prefix;
                  if (modulePathAfterNodeModules.startsWith(lookup)) {
                    const remainder = modulePathAfterNodeModules.slice(
                      lookup.length,
                    );

                    if (
                      !testRequestFilters(
                        remainder,
                        options.include?.request,
                        options.exclude?.request,
                      )
                    ) {
                      continue;
                    }

                    return boundCreateConsumeSharedModule(
                      compilation,
                      context,
                      modulePathAfterNodeModules,
                      {
                        ...options,
                        import: options.import
                          ? options.import + remainder
                          : undefined,
                        shareKey: options.shareKey + remainder,
                        layer: options.layer,
                      },
                    );
                  }
                }
              }

              return;
            });
          },
        );
        normalModuleFactory.hooks.createModule.tapPromise(
          PLUGIN_NAME,
          ({ resource }, { context, dependencies }) => {
            // BIND `this` for createConsumeSharedModule call
            const boundCreateConsumeSharedModule =
              this.createConsumeSharedModule.bind(this);
            if (
              dependencies[0] instanceof ConsumeSharedFallbackDependency ||
              dependencies[0] instanceof ProvideForSharedDependency
            ) {
              return Promise.resolve();
            }
            if (resource) {
              const options = resolvedConsumes.get(resource);
              if (options !== undefined) {
                // Use the bound function
                return boundCreateConsumeSharedModule(
                  compilation,
                  context,
                  resource,
                  options,
                );
              }
            }
            return Promise.resolve();
          },
        );

        // Add finishModules hook to copy buildMeta/buildInfo from fallback modules *after* webpack's export analysis
        // Running earlier causes failures, so we intentionally execute later than plugins like FlagDependencyExportsPlugin.
        // This still follows webpack's pattern used by FlagDependencyExportsPlugin and InferAsyncModulesPlugin, but with a
        // later stage. Based on webpack's Compilation.js: finishModules (line 2833) runs before seal (line 2920).
        compilation.hooks.finishModules.tapAsync(
          {
            name: PLUGIN_NAME,
            stage: 10, // Run after FlagDependencyExportsPlugin (default stage 0)
          },
          (modules, callback) => {
            for (const module of modules) {
              // Only process ConsumeSharedModule instances with fallback dependencies
              if (
                !(module instanceof ConsumeSharedModule) ||
                !module.options.import
              ) {
                continue;
              }

              let dependency;
              if (module.options.eager) {
                // For eager mode, get the fallback directly from dependencies
                dependency = module.dependencies[0];
              } else {
                // For async mode, get it from the async dependencies block
                dependency = module.blocks[0]?.dependencies[0];
              }

              if (dependency) {
                const fallbackModule =
                  compilation.moduleGraph.getModule(dependency);
                if (
                  fallbackModule &&
                  fallbackModule.buildMeta &&
                  fallbackModule.buildInfo
                ) {
                  // Copy buildMeta and buildInfo following webpack's DelegatedModule pattern: this.buildMeta = { ...delegateData.buildMeta };
                  // This ensures ConsumeSharedModule inherits ESM/CJS detection (exportsType) and other optimization metadata
                  module.buildMeta = { ...fallbackModule.buildMeta };
                  module.buildInfo = { ...fallbackModule.buildInfo };
                  // Mark all exports as provided, to avoid webpack's export analysis from marking them as unused since we copy buildMeta
                  compilation.moduleGraph
                    .getExportsInfo(module)
                    .setUnknownExportsProvided();
                }
              }
            }
            callback();
          },
        );

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          PLUGIN_NAME,
          (chunk, set) => {
            set.add(RuntimeGlobals.module);
            set.add(RuntimeGlobals.moduleCache);
            set.add(RuntimeGlobals.moduleFactoriesAddOnly);
            set.add(RuntimeGlobals.shareScopeMap);
            set.add(RuntimeGlobals.initializeSharing);
            set.add(RuntimeGlobals.hasOwnProperty);
            compilation.addRuntimeModule(
              chunk,
              new ConsumeSharedRuntimeModule(set),
            );
            // FIXME: need to remove webpack internal inject ShareRuntimeModule, otherwise there will be two ShareRuntimeModule
            compilation.addRuntimeModule(chunk, new ShareRuntimeModule());
          },
        );
      },
    );
  }
}

export default ConsumeSharedPlugin;
