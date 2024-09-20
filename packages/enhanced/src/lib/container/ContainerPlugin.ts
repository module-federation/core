/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryDependency from './ContainerEntryDependency';
import ContainerEntryModuleFactory from './ContainerEntryModuleFactory';
import ContainerExposedDependency from './ContainerExposedDependency';
import { parseOptions } from './options';
import type {
  optimize,
  Compiler,
  Compilation,
  WebpackError,
  WebpackPluginInstance,
} from 'webpack';
import type { containerPlugin } from '@module-federation/sdk';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import FederationModulesPlugin from './runtime/FederationModulesPlugin';
import checkOptions from '../../schemas/container/ContainerPlugin.check';
import schema from '../../schemas/container/ContainerPlugin';
import FederationRuntimeDependency from './runtime/FederationRuntimeDependency';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');

type ExcludeUndefined<T> = T extends undefined ? never : T;
type NonUndefined<T> = ExcludeUndefined<T>;

type OptimizationSplitChunksOptions = NonUndefined<
  ConstructorParameters<typeof optimize.SplitChunksPlugin>[0]
>;

type CacheGroups = OptimizationSplitChunksOptions['cacheGroups'];
type CacheGroup = NonUndefined<CacheGroups>[string];

const createSchemaValidation = require(
  normalizeWebpackPath('webpack/lib/util/create-schema-validation'),
) as typeof import('webpack/lib/util/create-schema-validation');

const validate = createSchemaValidation(checkOptions, () => schema, {
  name: 'Container Plugin',
  baseDataPath: 'options',
});

const PLUGIN_NAME = 'ContainerPlugin';

class ContainerPlugin {
  _options: containerPlugin.ContainerPluginOptions;
  name: string;

  constructor(options: containerPlugin.ContainerPluginOptions) {
    validate(options);
    this.name = PLUGIN_NAME;

    this._options = {
      name: options.name,
      shareScope: options.shareScope || 'default',
      library: options.library || {
        type: 'var',
        name: options.name,
      },
      runtime: options.runtime,
      filename: options.filename || undefined,
      //@ts-ignore
      exposes: parseOptions(
        options.exposes,
        (item) => ({
          import: Array.isArray(item) ? item : [item],
          name: undefined,
        }),
        (item) => ({
          import: Array.isArray(item.import) ? item.import : [item.import],
          name: item.name || undefined,
        }),
      ),
      runtimePlugins: options.runtimePlugins,
      experiments: options.experiments,
    };
  }

  // container should not be affected by splitChunks
  static patchChunkSplit(compiler: Compiler, name: string): void {
    const { splitChunks } = compiler.options.optimization;
    const patchChunkSplit = (cacheGroup: CacheGroup) => {
      switch (typeof cacheGroup) {
        case 'boolean':
        case 'string':
        case 'function':
          break;
        //  cacheGroup.chunks will inherit splitChunks.chunks, so you only need to modify the chunks that are set separately
        case 'object':
          {
            if (cacheGroup instanceof RegExp) {
              break;
            }
            if (!cacheGroup.chunks) {
              break;
            }
            if (typeof cacheGroup.chunks === 'function') {
              const prevChunks = cacheGroup.chunks;
              cacheGroup.chunks = (chunk) => {
                if (
                  chunk.name &&
                  (chunk.name === name || chunk.name === name + '_partial')
                ) {
                  return false;
                }
                return prevChunks(chunk);
              };
              break;
            }

            if (cacheGroup.chunks === 'all') {
              cacheGroup.chunks = (chunk) => {
                if (
                  chunk.name &&
                  (chunk.name === name || chunk.name === name + '_partial')
                ) {
                  return false;
                }
                return true;
              };
              break;
            }
            if (cacheGroup.chunks === 'initial') {
              cacheGroup.chunks = (chunk) => {
                if (
                  chunk.name &&
                  (chunk.name === name || chunk.name === name + '_partial')
                ) {
                  return false;
                }
                return chunk.isOnlyInitial();
              };
              break;
            }
          }
          break;
      }
    };

    if (!splitChunks) {
      return;
    }
    // patch splitChunk.chunks
    patchChunkSplit(splitChunks);

    const cacheGroups = splitChunks.cacheGroups;
    if (!cacheGroups) {
      return;
    }

    // patch splitChunk.cacheGroups[key].chunks
    Object.keys(cacheGroups).forEach((cacheGroupKey) => {
      patchChunkSplit(cacheGroups[cacheGroupKey]);
    });
  }

  apply(compiler: Compiler): void {
    const useModuleFederationPlugin = compiler.options.plugins.find(
      (p: WebpackPluginInstance) => {
        if (typeof p !== 'object' || !p) {
          return false;
        }

        return p['name'] === 'ModuleFederationPlugin';
      },
    );

    if (!useModuleFederationPlugin) {
      ContainerPlugin.patchChunkSplit(compiler, this._options.name);
    }

    const federationRuntimePluginInstance = new FederationRuntimePlugin();
    federationRuntimePluginInstance.apply(compiler);

    const { name, exposes, shareScope, filename, library, runtime } =
      this._options;

    if (
      library &&
      compiler.options.output &&
      compiler.options.output.enabledLibraryTypes &&
      !compiler.options.output.enabledLibraryTypes.includes(library.type)
    ) {
      compiler.options.output.enabledLibraryTypes.push(library.type);
    }

    compiler.hooks.make.tapAsync(
      PLUGIN_NAME,
      (
        compilation: Compilation,
        callback: (error?: WebpackError | null | undefined) => void,
      ) => {
        const hasSingleRuntimeChunk =
          compilation.options?.optimization?.runtimeChunk;
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const dep = new ContainerEntryDependency(
          name,
          //@ts-ignore
          exposes,
          shareScope,
          federationRuntimePluginInstance.entryFilePath,
          this._options.experiments,
        );
        dep.loc = { name };
        compilation.addEntry(
          compilation.options.context || '',
          dep,
          {
            name,
            filename,
            runtime: hasSingleRuntimeChunk ? false : runtime,
            library,
          },
          (error: WebpackError | null | undefined) => {
            if (error) return callback(error);
            hooks.addContainerEntryModule.call(dep);
            callback();
          },
        );
      },
    );

    // this will still be copied into child compiler, so it needs a check to avoid running hook on child
    // we have to use finishMake in order to check the entries created and see if there are multiple runtime chunks
    compiler.hooks.finishMake.tapAsync(
      PLUGIN_NAME,
      async (compilation, callback) => {
        // its a child compiler
        if (
          compilation.compiler.parentCompilation &&
          compilation.compiler.parentCompilation !== compilation
        ) {
          // dont include dependencies on child compilations
          return callback();
        }

        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const createdRuntimes = new Set();
        for (const entry of compilation.entries.values()) {
          if (entry.options.runtime) {
            if (createdRuntimes.has(entry.options.runtime)) {
              continue;
            }

            createdRuntimes.add(entry.options.runtime);
          }
        }

        // if it has multiple runtime chunks - make another with no name or runtime assigned
        if (
          createdRuntimes.size !== 0 ||
          compilation.options?.optimization?.runtimeChunk
        ) {
          const dep = new ContainerEntryDependency(
            name,
            //@ts-ignore
            exposes,
            shareScope,
            federationRuntimePluginInstance.entryFilePath,
            this._options.experiments,
          );

          dep.loc = { name };

          compilation.addInclude(
            compilation.options.context || '',
            dep,
            {
              name: undefined,
            },
            (error: WebpackError | null | undefined) => {
              if (error) return callback(error);
              hooks.addContainerEntryModule.call(dep);
              callback();
            },
          );
        } else {
          callback();
        }
      },
    );

    // add the container entry module
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ContainerEntryDependency,
          new ContainerEntryModuleFactory(),
        );

        compilation.dependencyFactories.set(
          ContainerExposedDependency,
          normalModuleFactory,
        );
      },
    );

    // add include of federation runtime
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        const federationRuntimeDependency =
          federationRuntimePluginInstance.getDependency(compiler); // Pass compiler here

        const logger = compilation.getLogger('ContainerPlugin');
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        compilation.dependencyFactories.set(
          FederationRuntimeDependency,
          normalModuleFactory,
        );
        compilation.dependencyTemplates.set(
          FederationRuntimeDependency,
          new ModuleDependency.Template(),
        );

        compilation.addInclude(
          compiler.context,
          federationRuntimeDependency,
          { name: undefined },
          (err, module) => {
            if (err) {
              return logger.error(
                'Error adding federation runtime module:',
                err,
              );
            }
            hooks.addFederationRuntimeModule.call(federationRuntimeDependency);
          },
        );
      },
    );
  }
}

export default ContainerPlugin;
