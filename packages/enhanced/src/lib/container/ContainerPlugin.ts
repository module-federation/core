/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy, Marais Rossouw @maraisr
*/
//@ts-ignore
import createSchemaValidation from 'webpack/lib/util/create-schema-validation';
import ContainerEntryDependency from './ContainerEntryDependency';
import ContainerEntryModuleFactory from './ContainerEntryModuleFactory';
import ContainerExposedDependency from './ContainerExposedDependency';
import { parseOptions } from './options';
import type { optimize,Compiler,Compilation } from 'webpack';
import type { ContainerPluginOptions } from '../../declarations/plugins/container/ContainerPlugin';
import FederationRuntimePlugin from './runtime/FederationRuntimePlugin';
import checkOptions from '../../schemas/container/ContainerPlugin.check';
import schema from '../../schemas/container/ContainerPlugin';

type ExcludeUndefined<T> = T extends undefined ? never : T;
type NonUndefined<T> = ExcludeUndefined<T>;

type OptimizationSplitChunksOptions = NonUndefined<
  ConstructorParameters<typeof optimize.SplitChunksPlugin>[0]
>;

type CacheGroups = OptimizationSplitChunksOptions['cacheGroups'];
type CacheGroup = NonUndefined<CacheGroups>[string];

const validate = createSchemaValidation(
  checkOptions,
  () => schema,
  {
    name: 'Container Plugin',
    baseDataPath: 'options',
  },
);

const PLUGIN_NAME = 'ContainerPlugin';

class ContainerPlugin {
  _options: ContainerPluginOptions;
  name: string;
  /**
   * @param {ContainerPluginOptions} options options
   */
  constructor(options: ContainerPluginOptions) {
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
        //  cacheGroup.chunks 会继承 splitChunks.chunks ，因此只需要对单独设置了 chunks 的 做修改
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
                if (chunk.name && chunk.name === name) {
                  return false;
                }
                return prevChunks(chunk);
              };
              break;
            }

            if (cacheGroup.chunks === 'all') {
              cacheGroup.chunks = (chunk) => {
                if (chunk.name && chunk.name === name) {
                  return false;
                }
                return true;
              };
              break;
            }
            if (cacheGroup.chunks === 'initial') {
              cacheGroup.chunks = (chunk) => {
                if (chunk.name && chunk.name === name) {
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
    // 修改 splitChunk.chunks
    patchChunkSplit(splitChunks);

    const cacheGroups  = splitChunks.cacheGroups
    if (!cacheGroups) {
      return;
    }

    // 修改 splitChunk.cacheGroups[key].chunks
    Object.keys(cacheGroups).forEach((cacheGroupKey) => {
      patchChunkSplit(cacheGroups[cacheGroupKey]);
    });
  }

  apply(compiler: Compiler): void {
    const useModuleFederationPlugin = compiler.options.plugins.find(
      (p) =>{
        if(typeof p !=='object' || !p){
          return false
        }

        return p['name'] === 'ModuleFederationPlugin'
      },
    );

		if (!useModuleFederationPlugin) {
			ContainerPlugin.patchChunkSplit(compiler, this._options.name);
		}

		new FederationRuntimePlugin().apply(compiler);
		const {
			name,
			exposes,
			shareScope,
			filename,
			library,
			runtime,
			runtimePlugins
		} = this._options;


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
				runtimePlugins
			);

      dep.loc = { name };
      compilation.addEntry(
        compilation.options.context || '',
        //@ts-ignore
        dep,
        {
          name,
          filename,
          runtime,
          library,
        },
        (error: WebpackError | null | undefined) => {
          if (error) {
            return callback(error);
          }
          callback();
        },
      );
    });

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          //@ts-ignore
          ContainerEntryDependency,
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
