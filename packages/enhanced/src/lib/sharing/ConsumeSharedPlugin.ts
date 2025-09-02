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
import type { ConsumeSharedPluginOptions } from '../../declarations/plugins/sharing/ConsumeSharedPlugin';
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
import type { ResolveData } from 'webpack/lib/NormalModuleFactory';
import type { ModuleFactoryCreateDataContextInfo } from 'webpack/lib/ModuleFactory';
import type { ConsumeOptions } from '../../declarations/plugins/sharing/ConsumeSharedModule';
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
import {
  resolveWithAlias,
  toShareKeyFromResolvedPath,
  getRuleResolveForIssuer,
} from './aliasResolver';

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
const { rangeToString } = require(
  normalizeWebpackPath('webpack/lib/util/semver'),
) as typeof import('webpack/lib/util/semver');

const validate = createSchemaValidation(
  // eslint-disable-next-line
  require('../../schemas/sharing/ConsumeSharedPlugin.check.js').validate,
  () => require('../../schemas/sharing/ConsumeSharedPlugin').default,
  {
    name: 'Consume Shared Plugin',
    baseDataPath: 'options',
  },
);

const BASE_RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};
const PLUGIN_NAME = 'ConsumeSharedPlugin';

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
                nodeModulesReconstructedLookup: undefined,
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
                nodeModulesReconstructedLookup: undefined,
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
          nodeModulesReconstructedLookup: item.nodeModulesReconstructedLookup,
        } as ConsumeOptions;
      },
    );
  }

  createConsumeSharedModule(
    compilation: Compilation,
    context: string,
    request: string,
    config: ConsumeOptions,
  ): Promise<ConsumeSharedModule> {
    const requiredVersionWarning = (details: string) => {
      const error = new WebpackError(
        `No required version specified and unable to automatically determine one. ${details}`,
      );
      error.file = `shared module ${request}`;
      compilation.warnings.push(error);
    };
    const directFallback =
      config.import && DIRECT_FALLBACK_REGEX.test(config.import);

    const resolver: ResolverWithOptions = compilation.resolverFactory.get(
      'normal',
      BASE_RESOLVE_OPTIONS as ResolveOptionsWithDependencyType,
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
        let packageName = config.packageName;
        if (packageName === undefined) {
          if (ABSOLUTE_PATH_REGEX.test(request)) {
            // For relative or absolute requests we don't automatically use a packageName.
            // If wished one can specify one with the packageName option.
            return resolve(undefined);
          }
          const match = PACKAGE_NAME_REGEX.exec(request);
          if (!match) {
            requiredVersionWarning(
              'Unable to extract the package name from request.',
            );
            return resolve(undefined);
          }
          packageName = match[0];
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

      // Check for include version first
      if (config.include && typeof config.include.version === 'string') {
        if (!importResolved) {
          return consumedModule;
        }

        return new Promise((resolveFilter) => {
          getDescriptionFile(
            compilation.inputFileSystem,
            path.dirname(importResolved as string),
            ['package.json'],
            (err, result) => {
              if (err) {
                return resolveFilter(consumedModule);
              }
              const { data } = result || {};
              if (!data || !data['version'] || data['name'] !== request) {
                return resolveFilter(consumedModule);
              }

              // Only include if version satisfies the include constraint
              if (
                config.include &&
                satisfy(
                  parseRange(config.include.version as string),
                  data['version'],
                )
              ) {
                // Validate singleton usage with include.version
                if (
                  config.include &&
                  config.include.version &&
                  config.singleton
                ) {
                  addSingletonFilterWarning(
                    compilation,
                    config.shareKey || request,
                    'include',
                    'version',
                    config.include.version,
                    request, // moduleRequest
                    importResolved, // moduleResource (might be undefined)
                  );
                }

                return resolveFilter(consumedModule);
              }

              // Check fallback version
              if (
                config.include &&
                typeof config.include.fallbackVersion === 'string' &&
                config.include.fallbackVersion
              ) {
                if (
                  satisfy(
                    parseRange(config.include.version as string),
                    config.include.fallbackVersion,
                  )
                ) {
                  return resolveFilter(consumedModule);
                }
                return resolveFilter(
                  undefined as unknown as ConsumeSharedModule,
                );
              }

              return resolveFilter(undefined as unknown as ConsumeSharedModule);
            },
          );
        });
      }

      // Check for exclude version (existing logic)
      if (config.exclude && typeof config.exclude.version === 'string') {
        if (!importResolved) {
          return consumedModule;
        }

        if (
          config.exclude &&
          typeof config.exclude.fallbackVersion === 'string' &&
          config.exclude.fallbackVersion
        ) {
          if (
            satisfy(
              parseRange(config.exclude.version),
              config.exclude.fallbackVersion,
            )
          ) {
            return undefined as unknown as ConsumeSharedModule;
          }
          return consumedModule;
        }

        return new Promise((resolveFilter) => {
          getDescriptionFile(
            compilation.inputFileSystem,
            path.dirname(importResolved as string),
            ['package.json'],
            (err, result) => {
              if (err) {
                return resolveFilter(consumedModule);
              }
              const { data } = result || {};
              if (!data || !data['version'] || data['name'] !== request) {
                return resolveFilter(consumedModule);
              }

              if (
                config.exclude &&
                typeof config.exclude.version === 'string' &&
                satisfy(parseRange(config.exclude.version), data['version'])
              ) {
                return resolveFilter(
                  undefined as unknown as ConsumeSharedModule,
                );
              }

              // Validate singleton usage with exclude.version
              if (
                config.exclude &&
                config.exclude.version &&
                config.singleton
              ) {
                addSingletonFilterWarning(
                  compilation,
                  config.shareKey || request,
                  'exclude',
                  'version',
                  config.exclude.version,
                  request, // moduleRequest
                  importResolved, // moduleResource (might be undefined)
                );
              }

              return resolveFilter(consumedModule);
            },
          );
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

        // Cache ConsumeSharedModule instances per (shareKey, layer, shareScope)
        const consumeModulePromises: Map<
          string,
          Promise<ConsumeSharedModule>
        > = new Map();
        const getConsumeModuleCacheKey = (cfg: ConsumeOptions) => {
          const layer = cfg.layer || '';
          const scope = Array.isArray(cfg.shareScope)
            ? cfg.shareScope.join('|')
            : cfg.shareScope || 'default';
          const required = cfg.requiredVersion
            ? typeof cfg.requiredVersion === 'string'
              ? cfg.requiredVersion
              : rangeToString(cfg.requiredVersion as any)
            : String(cfg.requiredVersion); // 'false' | 'undefined'
          const strict = String(!!cfg.strictVersion);
          const single = String(!!cfg.singleton);
          const eager = String(!!cfg.eager);
          const imp = cfg.import || '';
          return [
            cfg.shareKey,
            layer,
            scope,
            required,
            strict,
            single,
            eager,
            imp,
          ].join('|');
        };
        const getOrCreateConsumeSharedModule = (
          ctx: Compilation,
          context: string,
          request: string,
          config: ConsumeOptions,
        ): Promise<ConsumeSharedModule> => {
          const key = `${getConsumeModuleCacheKey(config)}|ctx:${context}`;
          const existing = consumeModulePromises.get(key);
          if (existing) return existing;
          const created = this.createConsumeSharedModule(
            ctx,
            context,
            request,
            config,
          );
          consumeModulePromises.set(key, created);
          return created;
        };

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

            return promise.then(async () => {
              if (
                dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                dependencies[0] instanceof ProvideForSharedDependency
              ) {
                return;
              }
              // Note: do not early-return on ProvideForSharedDependency here.
              // Even if a module is marked for providing, we still want to
              // route the import through a consume-shared module when it
              // matches a configured share.
              const { context, request, contextInfo } = resolveData;
              const factorizeContext = (contextInfo as any)?.issuer
                ? require('path').dirname((contextInfo as any).issuer as string)
                : context;

              // Attempt direct match
              let match =
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, contextInfo.issuerLayer),
                ) ||
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, undefined),
                );

              // First check direct match with original request
              if (match !== undefined) {
                // matched direct consume
                return getOrCreateConsumeSharedModule(
                  compilation,
                  factorizeContext,
                  request,
                  match,
                );
              }

              // Try resolving aliases (bare requests only) and match using normalized share keys
              // e.g. react -> next/dist/compiled/react, lib-b -> lib-b-vendor
              const isBareRequest =
                !RELATIVE_OR_ABSOLUTE_PATH_REGEX.test(request) &&
                !request.endsWith('/');
              if (isBareRequest) {
                let aliasShareKey: string | null = null;
                try {
                  const resolved = await resolveWithAlias(
                    compilation,
                    context,
                    request,
                    getRuleResolveForIssuer(
                      compilation,
                      (contextInfo as any)?.issuer,
                    ) || undefined,
                  );
                  if (typeof resolved === 'string') {
                    aliasShareKey = toShareKeyFromResolvedPath(resolved);
                    // alias factorize
                  }
                } catch {
                  // ignore alias resolution errors and continue
                }

                if (aliasShareKey) {
                  match =
                    unresolvedConsumes.get(
                      createLookupKeyForSharing(
                        aliasShareKey,
                        contextInfo.issuerLayer,
                      ),
                    ) ||
                    unresolvedConsumes.get(
                      createLookupKeyForSharing(aliasShareKey, undefined),
                    );

                  if (match !== undefined) {
                    // matched by alias share key
                    return getOrCreateConsumeSharedModule(
                      compilation,
                      factorizeContext,
                      aliasShareKey,
                      match,
                    );
                  }
                }
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
                    moduleMatch.nodeModulesReconstructedLookup
                  ) {
                    return getOrCreateConsumeSharedModule(
                      compilation,
                      factorizeContext,
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
                  return getOrCreateConsumeSharedModule(
                    compilation,
                    factorizeContext,
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
                  return getOrCreateConsumeSharedModule(
                    compilation,
                    factorizeContext,
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
                  if (!options.nodeModulesReconstructedLookup) {
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

                    return getOrCreateConsumeSharedModule(
                      compilation,
                      factorizeContext,
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
