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

class ConsumeSharedPlugin {
  private _consumes: [string, ConsumeOptions][];
  private _aliasConsumption: boolean;

  constructor(options: ConsumeSharedPluginOptions) {
    if (typeof options !== 'string') {
      validate(options);
    }

    this._consumes = parseOptions(
      options.consumes,
      (item, key) => {
        if (Array.isArray(item)) throw new Error('Unexpected array in options');
        // @ts-ignore
        const result: ConsumeOptions =
          item === key || !isRequiredVersion(item)
            ? {
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
              }
            : {
                import: key,
                shareScope: options.shareScope || 'default',
                shareKey: key,
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
              : // @ts-ignore
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
          allowNodeModulesSuffixMatch: (item as any)
            .allowNodeModulesSuffixMatch,
        } as ConsumeOptions;
      },
    );

    // read experiments flag if provided via options
    const aliasConsumptionFlag = options.experiments?.aliasConsumption;
    this._aliasConsumption = Boolean(aliasConsumptionFlag);
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
            // @ts-ignore
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
              return resolve(undefined);
            }
            const requiredVersion = getRequiredVersionFromDescriptionFile(
              data,
              packageName,
            );
            // @ts-ignore
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

      // include.version
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
              // If pkg data is missing or lacks version, keep module
              if (!data || !data['version']) {
                return resolveFilter(consumedModule);
              }
              // For deep-path keys (alias consumption), the request may be a path like
              // "next/dist/compiled/react" or an absolute resource path. In that case,
              // data['name'] will be the package name (e.g., "next"). Do not require
              // strict equality with the request string; rely solely on semver check.

              if (
                config.include &&
                satisfy(
                  parseRange(config.include.version as string),
                  data['version'],
                )
              ) {
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
                    request,
                    importResolved,
                  );
                }

                return resolveFilter(consumedModule);
              }

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

      // exclude.version
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
              // If pkg data is missing or lacks version, keep module
              if (!data || !data['version']) {
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
                  request,
                  importResolved,
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
        // Dependency factories
        compilation.dependencyFactories.set(
          ConsumeSharedFallbackDependency,
          normalModuleFactory,
        );

        // Shared state
        let unresolvedConsumes: Map<string, ConsumeOptions>,
          resolvedConsumes: Map<string, ConsumeOptions>,
          prefixedConsumes: Map<string, ConsumeOptions>;

        // Caches
        const targetResolveCache = new Map<string, string | false>(); // key: resolverSig|ctx|targetReq -> resolved path or false
        const packageNameByDirCache = new Map<string, string | undefined>(); // key: dirname(resource) -> package name

        const promise = resolveMatchedConfigs(compilation, this._consumes).then(
          ({ resolved, unresolved, prefixed }) => {
            resolvedConsumes = resolved;
            unresolvedConsumes = unresolved;
            prefixedConsumes = prefixed;
          },
        );

        // util: resolve once with tracking + caching
        const resolveOnce = (
          resolver: any,
          ctx: string,
          req: string,
          resolverKey: string,
        ): Promise<string | false> => {
          const cacheKey = `${resolverKey}||${ctx}||${req}`;
          if (targetResolveCache.has(cacheKey)) {
            return Promise.resolve(targetResolveCache.get(cacheKey)!);
          }
          return new Promise((res) => {
            const resolveContext = {
              fileDependencies: new LazySet<string>(),
              contextDependencies: new LazySet<string>(),
              missingDependencies: new LazySet<string>(),
            };
            resolver.resolve(
              {},
              ctx,
              req,
              resolveContext,
              (err: any, result: string | false) => {
                // track deps for watch fidelity
                compilation.contextDependencies.addAll(
                  resolveContext.contextDependencies,
                );
                compilation.fileDependencies.addAll(
                  resolveContext.fileDependencies,
                );
                compilation.missingDependencies.addAll(
                  resolveContext.missingDependencies,
                );

                if (err || result === false) {
                  targetResolveCache.set(cacheKey, false);
                  return res(false);
                }
                targetResolveCache.set(cacheKey, result as string);
                res(result as string);
              },
            );
          });
        };

        // util: get package name for a resolved resource
        const getPackageNameForResource = (
          resource: string,
        ): Promise<string | undefined> => {
          const dir = path.dirname(resource);
          if (packageNameByDirCache.has(dir)) {
            return Promise.resolve(packageNameByDirCache.get(dir)!);
          }
          return new Promise((resolvePkg) => {
            getDescriptionFile(
              compilation.inputFileSystem,
              dir,
              ['package.json'],
              (err, result) => {
                if (err || !result || !result.data) {
                  packageNameByDirCache.set(dir, undefined);
                  return resolvePkg(undefined);
                }
                const name = (result.data as any)['name'];
                packageNameByDirCache.set(dir, name);
                resolvePkg(name);
              },
            );
          });
        };

        // FACTORIZE: direct + path-based + prefix matches (fast paths). Alias-aware path equality moved to afterResolve.
        normalModuleFactory.hooks.factorize.tapPromise(
          PLUGIN_NAME,
          async (resolveData: ResolveData): Promise<Module | undefined> => {
            const { context, request, dependencies, contextInfo } = resolveData;

            const createConsume = (
              ctx: string,
              req: string,
              cfg: ConsumeOptions,
            ) => this.createConsumeSharedModule(compilation, ctx, req, cfg);

            return promise.then(() => {
              if (
                dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                dependencies[0] instanceof ProvideForSharedDependency
              ) {
                return;
              }

              // 1) direct unresolved key
              const directMatch =
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, contextInfo.issuerLayer),
                ) ||
                unresolvedConsumes.get(
                  createLookupKeyForSharing(request, undefined),
                );
              if (directMatch) {
                return createConsume(context, request, directMatch);
              }

              // Prepare reconstructed variants
              let reconstructed: string | undefined;
              let afterNodeModules: string | undefined;
              if (
                request &&
                !path.isAbsolute(request) &&
                RELATIVE_OR_ABSOLUTE_PATH_REGEX.test(request)
              ) {
                reconstructed = path.join(context, request);
                const nm = extractPathAfterNodeModules(reconstructed);
                if (nm) afterNodeModules = nm;
              }

              // 2) unresolved match with path after node_modules (suffix match)
              if (afterNodeModules) {
                const moduleMatch =
                  unresolvedConsumes.get(
                    createLookupKeyForSharing(
                      afterNodeModules,
                      contextInfo.issuerLayer,
                    ),
                  ) ||
                  unresolvedConsumes.get(
                    createLookupKeyForSharing(afterNodeModules, undefined),
                  );

                if (moduleMatch && moduleMatch.allowNodeModulesSuffixMatch) {
                  return createConsume(context, afterNodeModules, moduleMatch);
                }
              }

              // 3) unresolved match with fully reconstructed path
              if (reconstructed) {
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
                if (reconstructedMatch) {
                  return createConsume(
                    context,
                    reconstructed,
                    reconstructedMatch,
                  );
                }
              }

              // issuerLayer normalize
              const issuerLayer: string | undefined =
                contextInfo.issuerLayer === null
                  ? undefined
                  : contextInfo.issuerLayer;

              // 4) prefixed consumes with original request
              for (const [prefix, options] of prefixedConsumes) {
                const lookup = options.request || prefix;
                if (options.issuerLayer) {
                  if (!issuerLayer) continue;
                  if (issuerLayer !== options.issuerLayer) continue;
                }
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
                  return createConsume(context, request, {
                    ...options,
                    import: options.import
                      ? options.import + remainder
                      : undefined,
                    shareKey: options.shareKey + remainder,
                    layer: options.layer,
                  });
                }
              }

              // 5) prefixed consumes with path after node_modules
              if (afterNodeModules) {
                for (const [prefix, options] of prefixedConsumes) {
                  if (!options.allowNodeModulesSuffixMatch) continue;
                  if (options.issuerLayer) {
                    if (!issuerLayer) continue;
                    if (issuerLayer !== options.issuerLayer) continue;
                  }
                  const lookup = options.request || prefix;
                  if (afterNodeModules.startsWith(lookup)) {
                    const remainder = afterNodeModules.slice(lookup.length);
                    if (
                      !testRequestFilters(
                        remainder,
                        options.include?.request,
                        options.exclude?.request,
                      )
                    ) {
                      continue;
                    }
                    return createConsume(context, afterNodeModules, {
                      ...options,
                      import: options.import
                        ? options.import + remainder
                        : undefined,
                      shareKey: options.shareKey + remainder,
                      layer: options.layer,
                    });
                  }
                }
              }

              return;
            });
          },
        );

        // AFTER RESOLVE: alias-aware equality (single-resolution per candidate via cache)
        // Guarded by experimental flag provided via options
        if (this._aliasConsumption) {
          const afterResolveHook = (normalModuleFactory as any)?.hooks
            ?.afterResolve;
          if (afterResolveHook?.tapPromise) {
            afterResolveHook.tapPromise(
              PLUGIN_NAME,
              async (data: any /* ResolveData-like */) => {
                await promise;

                const dependencies = data.dependencies as any[];
                if (
                  dependencies &&
                  (dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                    dependencies[0] instanceof ProvideForSharedDependency)
                ) {
                  return;
                }

                const createData = data.createData || data;
                const resource: string | undefined =
                  createData && createData.resource;
                if (!resource) return;
                // Skip virtual/data URI resources – let webpack handle them
                if (resource.startsWith('data:')) return;
                // Do not convert explicit relative/absolute path requests into consumes
                // e.g. "./node_modules/shared" inside a package should resolve locally
                const originalRequest: string | undefined = data.request;
                if (
                  originalRequest &&
                  RELATIVE_OR_ABSOLUTE_PATH_REGEX.test(originalRequest)
                ) {
                  return;
                }
                if (resolvedConsumes.has(resource)) return;

                const issuerLayer: string | undefined =
                  data.contextInfo && data.contextInfo.issuerLayer === null
                    ? undefined
                    : data.contextInfo?.issuerLayer;

                // Try to get the package name via resolver metadata first
                let pkgName: string | undefined =
                  createData?.resourceResolveData?.descriptionFileData?.name;

                if (!pkgName) {
                  pkgName = await getPackageNameForResource(resource);
                }
                if (!pkgName) return;

                // Candidate configs: include
                //  - exact package name keys (legacy behavior)
                //  - deep-path shares whose keys start with `${pkgName}/` (alias-aware)
                const candidates: ConsumeOptions[] = [];
                const seen = new Set<ConsumeOptions>();
                const k1 = createLookupKeyForSharing(pkgName, issuerLayer);
                const k2 = createLookupKeyForSharing(pkgName, undefined);
                const c1 = unresolvedConsumes.get(k1);
                const c2 = unresolvedConsumes.get(k2);
                if (c1 && !seen.has(c1)) {
                  candidates.push(c1);
                  seen.add(c1);
                }
                if (c2 && !seen.has(c2)) {
                  candidates.push(c2);
                  seen.add(c2);
                }

                // Also scan for deep-path keys beginning with `${pkgName}/` (both layered and unlayered)
                const prefixLayered = createLookupKeyForSharing(
                  pkgName + '/',
                  issuerLayer,
                );
                const prefixUnlayered = createLookupKeyForSharing(
                  pkgName + '/',
                  undefined,
                );
                for (const [key, cfg] of unresolvedConsumes) {
                  if (
                    (key.startsWith(prefixLayered) ||
                      key.startsWith(prefixUnlayered)) &&
                    !seen.has(cfg)
                  ) {
                    candidates.push(cfg);
                    seen.add(cfg);
                  }
                }
                if (candidates.length === 0) return;

                // Build resolver aligned with current resolve context
                const baseResolver = compilation.resolverFactory.get('normal', {
                  dependencyType: data.dependencyType || 'esm',
                } as ResolveOptionsWithDependencyType);
                const resolver =
                  data.resolveOptions &&
                  typeof (baseResolver as any).withOptions === 'function'
                    ? (baseResolver as any).withOptions(data.resolveOptions)
                    : data.resolveOptions
                      ? compilation.resolverFactory.get(
                          'normal',
                          Object.assign(
                            {
                              dependencyType: data.dependencyType || 'esm',
                            },
                            data.resolveOptions,
                          ) as ResolveOptionsWithDependencyType,
                        )
                      : (baseResolver as any);

                const resolverKey = JSON.stringify({
                  dependencyType: data.dependencyType || 'esm',
                  resolveOptions: data.resolveOptions || null,
                });
                const ctx =
                  createData?.context ||
                  data.context ||
                  compilation.compiler.context;

                // Resolve each candidate's target once, compare by absolute path
                for (const cfg of candidates) {
                  const targetReq = (cfg.request || cfg.import) as string;
                  const targetResolved = await resolveOnce(
                    resolver,
                    ctx,
                    targetReq,
                    resolverKey,
                  );
                  if (targetResolved && targetResolved === resource) {
                    resolvedConsumes.set(resource, cfg);
                    break;
                  }
                }
              },
            );
          } else if (afterResolveHook?.tap) {
            // Fallback for tests/mocks that only expose sync hooks to avoid throw
            afterResolveHook.tap(PLUGIN_NAME, (_data: any) => {
              // no-op in sync mock environments; this avoids throwing during plugin registration
            });
          }
        }

        // CREATE MODULE: swap resolved resource with ConsumeSharedModule when mapped
        normalModuleFactory.hooks.createModule.tapPromise(
          PLUGIN_NAME,
          ({ resource }, { context, dependencies }) => {
            const createConsume = (
              ctx: string,
              req: string,
              cfg: ConsumeOptions,
            ) => this.createConsumeSharedModule(compilation, ctx, req, cfg);

            if (
              dependencies[0] instanceof ConsumeSharedFallbackDependency ||
              dependencies[0] instanceof ProvideForSharedDependency
            ) {
              return Promise.resolve();
            }

            if (resource) {
              // Skip virtual/data URI resources – let webpack handle them
              if (resource.startsWith('data:')) return Promise.resolve();
              const options = resolvedConsumes.get(resource);
              if (options !== undefined) {
                return createConsume(context, resource, options);
              }
            }
            return Promise.resolve();
          },
        );

        // Add finishModules hook to copy buildMeta/buildInfo from fallback modules *after* webpack's export analysis
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
                dependency = module.dependencies[0];
              } else {
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
            // keep compatibility with existing runtime injection
            compilation.addRuntimeModule(chunk, new ShareRuntimeModule());
          },
        );
      },
    );
  }
}

export default ConsumeSharedPlugin;
