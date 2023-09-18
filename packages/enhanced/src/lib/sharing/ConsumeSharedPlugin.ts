/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import ModuleNotFoundError from 'webpack/lib/ModuleNotFoundError';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import WebpackError from 'webpack/lib/WebpackError';
import { parseOptions } from '../container/options';
import LazySet from 'webpack/lib/util/LazySet';
import createSchemaValidation from 'webpack/lib/util/create-schema-validation';
import { parseRange } from 'webpack/lib/util/semver';
import ConsumeSharedFallbackDependency from './ConsumeSharedFallbackDependency';
import ConsumeSharedModule from './ConsumeSharedModule';
import ConsumeSharedRuntimeModule from './ConsumeSharedRuntimeModule';
import ProvideForSharedDependency from './ProvideForSharedDependency';
import { resolveMatchedConfigs } from './resolveMatchedConfigs';
import {
  isRequiredVersion,
  getDescriptionFile,
  getRequiredVersionFromDescriptionFile,
} from './utils';
import { ConsumeOptions } from './ConsumeSharedModule';
import { ConsumeSharedPluginOptions } from '../../declarations/plugins/sharing/ConsumeSharedPlugin';
import Compiler from 'webpack/lib/Compiler';

/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumeSharedPluginOptions} ConsumeSharedPluginOptions */
/** @typedef {import("../../declarations/plugins/sharing/ConsumeSharedPlugin").ConsumesConfig} ConsumesConfig */
/** @typedef {import("webpack/lib/Compiler")} Compiler */
/** @typedef {import("webpack/lib/ResolverFactory").ResolveOptionsWithDependencyType} ResolveOptionsWithDependencyType */
/** @typedef {import("./ConsumeSharedModule").ConsumeOptions} ConsumeOptions */

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('webpack/schemas/plugins/sharing/ConsumeSharedPlugin.check.js'),
  () => require('webpack/schemas/plugins/sharing/ConsumeSharedPlugin.json'),
  {
    name: 'Consume Shared Plugin',
    baseDataPath: 'options',
  },
);

/** @type {ResolveOptionsWithDependencyType} */
const RESOLVE_OPTIONS = { dependencyType: 'esm' };
const PLUGIN_NAME = 'ConsumeSharedPlugin';
class ConsumeSharedPlugin {
  private _consumes: [string, ConsumeOptions][];

  /**
   * @param {ConsumeSharedPluginOptions} options options
   */
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
              }
            : // key is a request/key
              // item is a version
              {
                import: key,
                shareScope: options.shareScope || 'default',
                shareKey: key,
                requiredVersion: parseRange(item),
                strictVersion: true,
                packageName: undefined,
                singleton: false,
                eager: false,
              };
        return result;
      },
      (item, key) => ({
        import: item.import === false ? undefined : item.import || key,
        shareScope: item.shareScope || options.shareScope || 'default',
        shareKey: item.shareKey || key,
        requiredVersion:
          typeof item.requiredVersion === 'string'
            ? parseRange(item.requiredVersion)
            : item.requiredVersion,
        strictVersion:
          typeof item.strictVersion === 'boolean'
            ? item.strictVersion
            : item.import !== false && !item.singleton,
        //@ts-ignore
        packageName: item.packageName,
        singleton: !!item.singleton,
        eager: !!item.eager,
      }),
    );
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation, { normalModuleFactory }) => {
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

        const resolver = compilation.resolverFactory.get(
          'normal',
          RESOLVE_OPTIONS,
        );

        /**
         * @param {string} context issuer directory
         * @param {string} request request
         * @param {ConsumeOptions} config options
         * @returns {Promise<ConsumeSharedModule>} create module
         */
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
              if (!config.import) {
                return resolve(undefined);
              }
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
            new Promise<string | undefined>((resolve) => {
              if (config.requiredVersion !== undefined) {
                return resolve(`${config.requiredVersion}`);
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
                (err, result) => {
                  if (err) {
                    requiredVersionWarning(
                      `Unable to read description file: ${err}`,
                    );
                    return resolve(undefined);
                  }
                  const { data, path: descriptionPath } = result || {
                    data: undefined,
                    path: undefined,
                  };
                  if (!data) {
                    requiredVersionWarning(
                      `Unable to find description file in ${context}.`,
                    );
                    return resolve(undefined);
                  }
                  //@ts-ignore
                  if (data.name === packageName) {
                    // Package self-referencing
                    return resolve(undefined);
                  }
                  const requiredVersion = getRequiredVersionFromDescriptionFile(
                    data,
                    packageName,
                  );
                  if (typeof requiredVersion !== 'string') {
                    requiredVersionWarning(
                      `Unable to find required version for "${packageName}" in description file (${descriptionPath}). It need to be in dependencies, devDependencies or peerDependencies.`,
                    );
                    return resolve(undefined);
                  }
                  resolve(
                    parseRange(requiredVersion)?.toString() ||
                      JSON.stringify(parseRange(requiredVersion)),
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
                requiredVersion: requiredVersion
                  ? parseRange(requiredVersion)
                  : undefined,
              },
            );
          });
        };

        normalModuleFactory.hooks.factorize.tapPromise(
          PLUGIN_NAME,
          ({ context, request, dependencies }) =>
            // wait for resolving to be complete
            // @ts-ignore
            promise.then((): Promise<Module | undefined> => {
              if (
                dependencies[0] instanceof ConsumeSharedFallbackDependency ||
                dependencies[0] instanceof ProvideForSharedDependency
              ) {
                //@ts-ignore
                return;
              }
              const match = unresolvedConsumes.get(request);
              if (match !== undefined) {
                return createConsumeSharedModule(context, request, match);
              }
              for (const [prefix, options] of prefixedConsumes) {
                if (request.startsWith(prefix)) {
                  const remainder = request.slice(prefix.length);
                  return createConsumeSharedModule(context, request, {
                    ...options,
                    import: options.import
                      ? options.import + remainder
                      : undefined,
                    shareKey: options.shareKey + remainder,
                  });
                }
              }
            }),
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
                return createConsumeSharedModule(
                  context,
                  resource || '',
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
          },
        );
      },
    );
  }
}

export default ConsumeSharedPlugin;
