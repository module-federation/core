/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import {
  getWebpackPath,
  normalizeWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import { isRequiredVersion } from '@module-federation/sdk';
import type { Compiler, Compilation, Module } from 'webpack';
import { parseOptions } from '../container/options';
import { ConsumeSharedPluginOptions } from '../../declarations/plugins/sharing/ConsumeSharedPlugin';
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
  //eslint-disable-next-line
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

// Helper function to create composite key
function createLookupKey(
  request: string,
  contextInfo: ModuleFactoryCreateDataContextInfo,
): string {
  return contextInfo.issuerLayer
    ? `(${contextInfo.issuerLayer})${request}`
    : request;
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
          issuerLayer: item.issuerLayer ? item.issuerLayer : undefined,
          layer: item.layer ? item.layer : undefined,
          request,
        } as ConsumeOptions;
      },
    );
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
        const resolver: ResolverWithOptions = compilation.resolverFactory.get(
          'normal',
          RESOLVE_OPTIONS as ResolveOptionsWithDependencyType,
        );

        const createConsumeSharedModule = (
          context: string,
          request: string,
          config: ConsumeOptions,
        ): Promise<ConsumeSharedModule> => {
          const requiredVersionWarning = (details: string) => {
            const error = new WebpackError(
              `No required version specified and unable to automatically determine one. ${details}`,
            );
            error.file = `shared module ${request}`;
            compilation.warnings.push(error);
          };
          const directFallback =
            config.import &&
            /^(\.\.?(\/|$)|\/|[A-Za-z]:|\\\\)/.test(config.import);
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
                directFallback ? compiler.context : context,
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
                if (/^(\/|[A-Za-z]:|\\\\)/.test(request)) {
                  // For relative or absolute requests we don't automatically use a packageName.
                  // If wished one can specify one with the packageName option.
                  return resolve(undefined);
                }
                const match = /^((?:@[^\\/]+[\\/])?[^\\/]+)/.exec(request);
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
                    requiredVersionWarning(
                      `Unable to read description file: ${err}`,
                    );
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
                  const maybeRequiredVersion =
                    getRequiredVersionFromDescriptionFile(data, packageName);
                  return (
                    data['name'] === packageName ||
                    typeof maybeRequiredVersion === 'string'
                  );
                },
              );
            }),
          ]).then(([importResolved, requiredVersion]) => {
            return new ConsumeSharedModule(
              directFallback ? compiler.context : context,
              {
                ...config,
                importResolved,
                import: importResolved ? config.import : undefined,
                requiredVersion,
              },
            );
          });
        };

        normalModuleFactory.hooks.factorize.tapPromise(
          PLUGIN_NAME,
          async (resolveData: ResolveData): Promise<Module | undefined> => {
            const { context, request, dependencies, contextInfo } = resolveData;
            // wait for resolving to be complete
            return promise.then(() => {
              if (
                dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                dependencies[0] instanceof ProvideForSharedDependency
              ) {
                return;
              }
              const match = unresolvedConsumes.get(
                createLookupKey(request, contextInfo),
              );

              if (match !== undefined) {
                return createConsumeSharedModule(context, request, match);
              }
              for (const [prefix, options] of prefixedConsumes) {
                const lookup = options.request || prefix;
                if (request.startsWith(lookup)) {
                  const remainder = request.slice(lookup.length);
                  return createConsumeSharedModule(context, request, {
                    ...options,
                    import: options.import
                      ? options.import + remainder
                      : undefined,
                    shareKey: options.shareKey + remainder,
                    layer: options.layer || contextInfo.issuerLayer,
                  });
                }
              }
              return;
            });
          },
        );
        normalModuleFactory.hooks.createModule.tapPromise(
          PLUGIN_NAME,
          ({ resource }, { context, dependencies }) => {
            if (
              dependencies[0] instanceof ConsumeSharedFallbackDependency ||
              dependencies[0] instanceof ProvideForSharedDependency
            ) {
              return Promise.resolve();
            }
            if (resource) {
              const options = resolvedConsumes.get(resource);
              if (options !== undefined) {
                return createConsumeSharedModule(context, resource, options);
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
