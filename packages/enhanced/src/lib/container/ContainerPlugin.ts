/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryDependency from './ContainerEntryDependency';
import ContainerEntryModuleFactory from './ContainerEntryModuleFactory';
import ContainerExposedDependency from './ContainerExposedDependency';
import { parseOptions } from './options';
import type { optimize, Compiler, Compilation } from 'webpack';
import type { containerPlugin } from '@module-federation/sdk';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import checkOptions from '../../schemas/container/ContainerPlugin.check';
import schema from '../../schemas/container/ContainerPlugin';
import HoistContainerReferencesPlugin from './HoistContainerReferencesPlugin';

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
  /**
   * @param {containerPlugin.ContainerPluginOptions} options options
   */
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
    const useModuleFederationPlugin = compiler.options.plugins.find((p) => {
      if (typeof p !== 'object' || !p) {
        return false;
      }

      return p['name'] === 'ModuleFederationPlugin';
    });

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

    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const dep = new ContainerEntryDependency(
        name,
        //@ts-ignore
        exposes,
        shareScope,
        federationRuntimePluginInstance.entryFilePath,
      );
      const hasSingleRuntimeChunk =
        compilation.options?.optimization?.runtimeChunk;
      dep.loc = { name };
      compilation.addEntry(
        compilation.options.context || '',
        //@ts-ignore
        dep,
        {
          name,
          filename,
          runtime: hasSingleRuntimeChunk ? false : runtime,
          library,
        },
        (error: WebpackError | null | undefined) => {
          if (error) return callback(error);
          if (hasSingleRuntimeChunk) {
            // Add to single runtime chunk as well.
            // Allows for singleton runtime graph with all needed runtime modules for federation
            addEntryToSingleRuntimeChunk();
          } else {
            callback();
          }
        },
      );

      // Function to add entry for undefined runtime
      const addEntryToSingleRuntimeChunk = () => {
        compilation.addEntry(
          compilation.options.context || '',
          //@ts-ignore
          dep,
          {
            name: name ? name + '_partial' : undefined, // give unique name name
            runtime: undefined,
            library,
          },
          (error: WebpackError | null | undefined) => {
            if (error) return callback(error);
            callback();
          },
        );
      };
    });

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ContainerEntryDependency,
          //@ts-ignore
          new ContainerEntryModuleFactory(),
        );

        compilation.dependencyFactories.set(
          //@ts-ignore
          ContainerExposedDependency,
          normalModuleFactory,
        );
      },
    );
  }
}

export default ContainerPlugin;
