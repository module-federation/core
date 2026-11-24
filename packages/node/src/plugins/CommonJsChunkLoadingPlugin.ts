import type { Chunk, Compiler, Compilation, ChunkGraph } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { ModuleFederationPluginOptions } from '../types';
import ChunkLoadingRuntimeModule from './DynamicFilesystemChunkLoadingRuntimeModule';
import AutoPublicPathRuntimeModule from './RemotePublicPathRuntimeModule';

type StartupChunkDependenciesPluginCtor =
  typeof import('webpack/lib/runtime/StartupChunkDependenciesPlugin');
type StartupEntrypointRuntimeModuleCtor =
  typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');

function applyStartupChunkDependenciesWithPublicApi(
  compiler: Compiler,
  chunkLoading: string,
  asyncChunkLoading: boolean,
  StartupEntrypointRuntimeModule: StartupEntrypointRuntimeModuleCtor,
): void {
  const { webpack } = compiler;
  const RuntimeGlobals =
    webpack.runtime?.RuntimeGlobals ?? webpack.RuntimeGlobals;
  const RuntimeModule = webpack.runtime?.RuntimeModule ?? webpack.RuntimeModule;
  const { Template } = webpack;

  class LocalStartupChunkDependenciesRuntimeModule extends RuntimeModule {
    private _asyncChunkLoading: boolean;

    constructor(isAsync: boolean) {
      super('startup chunk dependencies', RuntimeModule.STAGE_TRIGGER);
      this._asyncChunkLoading = isAsync;
    }

    override generate(): string | null {
      const chunkGraph = this.chunkGraph as ChunkGraph;
      const chunk = this.chunk as Chunk;
      const compilation = this.compilation as Compilation;
      const chunkIds = [
        ...chunkGraph.getChunkEntryDependentChunksIterable(chunk),
      ].map((c) => c.id);
      const { runtimeTemplate } = compilation;
      return Template.asString([
        `var next = ${RuntimeGlobals.startup};`,
        `${RuntimeGlobals.startup} = ${runtimeTemplate.basicFunction(
          '',
          !this._asyncChunkLoading
            ? [
                ...chunkIds.map(
                  (id) =>
                    `${RuntimeGlobals.ensureChunk}(${JSON.stringify(id)});`,
                ),
                'return next();',
              ]
            : chunkIds.length === 1
              ? `return ${RuntimeGlobals.ensureChunk}(${JSON.stringify(
                  chunkIds[0],
                )}).then(next);`
              : chunkIds.length > 2
                ? [
                    `return Promise.all(${JSON.stringify(chunkIds)}.map(${
                      RuntimeGlobals.ensureChunk
                    }, ${RuntimeGlobals.require})).then(next);`,
                  ]
                : [
                    'return Promise.all([',
                    Template.indent(
                      chunkIds
                        .map(
                          (id) =>
                            `${RuntimeGlobals.ensureChunk}(${JSON.stringify(id)})`,
                        )
                        .join(',\n'),
                    ),
                    ']).then(next);',
                  ],
        )};`,
      ]);
    }
  }

  const PLUGIN_NAME = 'StartupChunkDependenciesPlugin';
  compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
    const globalChunkLoading = compilation.outputOptions.chunkLoading;
    const isEnabledForChunk = (chunk: Chunk) => {
      const options = chunk.getEntryOptions();
      const currentChunkLoading =
        options && options.chunkLoading !== undefined
          ? options.chunkLoading
          : globalChunkLoading;
      return currentChunkLoading === chunkLoading;
    };
    compilation.hooks.additionalTreeRuntimeRequirements.tap(
      PLUGIN_NAME,
      (chunk, set, { chunkGraph }) => {
        if (!isEnabledForChunk(chunk)) return;
        if (chunkGraph.hasChunkEntryDependentChunks(chunk)) {
          set.add(RuntimeGlobals.startup);
          set.add(RuntimeGlobals.ensureChunk);
          set.add(RuntimeGlobals.ensureChunkIncludeEntries);
          compilation.addRuntimeModule(
            chunk,
            new LocalStartupChunkDependenciesRuntimeModule(asyncChunkLoading),
          );
        }
      },
    );
    compilation.hooks.runtimeRequirementInTree
      .for(RuntimeGlobals.startupEntrypoint)
      .tap(PLUGIN_NAME, (chunk, set) => {
        if (!isEnabledForChunk(chunk)) return;
        set.add(RuntimeGlobals.require);
        set.add(RuntimeGlobals.ensureChunk);
        set.add(RuntimeGlobals.ensureChunkIncludeEntries);
        compilation.addRuntimeModule(
          chunk,
          new StartupEntrypointRuntimeModule(asyncChunkLoading),
        );
      });
  });
}

interface DynamicFilesystemChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  debug?: boolean;
}

class DynamicFilesystemChunkLoadingPlugin {
  private options: DynamicFilesystemChunkLoadingOptions;
  private _asyncChunkLoading: boolean;

  constructor(options: DynamicFilesystemChunkLoadingOptions) {
    this.options = options || ({} as DynamicFilesystemChunkLoadingOptions);
    this._asyncChunkLoading = this.options.asyncChunkLoading;
  }

  apply(compiler: Compiler) {
    const RuntimeGlobals =
      compiler.webpack.runtime?.RuntimeGlobals ??
      compiler.webpack.RuntimeGlobals;
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';

    const runtimeNamespace = compiler.webpack.runtime as
      | (typeof compiler.webpack.runtime & {
          StartupChunkDependenciesPlugin?: StartupChunkDependenciesPluginCtor;
          StartupEntrypointRuntimeModule?: StartupEntrypointRuntimeModuleCtor;
        })
      | undefined;

    if (runtimeNamespace?.StartupChunkDependenciesPlugin) {
      new runtimeNamespace.StartupChunkDependenciesPlugin({
        chunkLoading: chunkLoadingValue,
        asyncChunkLoading: this._asyncChunkLoading,
      }).apply(compiler);
    } else if (runtimeNamespace?.StartupEntrypointRuntimeModule) {
      applyStartupChunkDependenciesWithPublicApi(
        compiler,
        chunkLoadingValue,
        this._asyncChunkLoading,
        runtimeNamespace.StartupEntrypointRuntimeModule,
      );
    } else {
      const StartupChunkDependenciesPlugin = require(
        normalizeWebpackPath(
          'webpack/lib/runtime/StartupChunkDependenciesPlugin',
        ),
      ) as StartupChunkDependenciesPluginCtor;
      new StartupChunkDependenciesPlugin({
        chunkLoading: chunkLoadingValue,
        asyncChunkLoading: this._asyncChunkLoading,
        //@ts-ignore
      }).apply(compiler);
    }

    compiler.hooks.thisCompilation.tap(
      'DynamicFilesystemChunkLoadingPlugin',
      (compilation: Compilation) => {
        // Always enabled
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isEnabledForChunk = (_: Chunk) => true;
        const onceForChunkSet = new WeakSet();

        const handler = (chunk: Chunk, set: Set<string>) => {
          if (onceForChunkSet.has(chunk)) {
            return;
          }

          onceForChunkSet.add(chunk);
          if (!isEnabledForChunk(chunk)) {
            return;
          }
          set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          set.add(RuntimeGlobals.hasOwnProperty);

          set.add(RuntimeGlobals.publicPath); // this breaks things
          compilation.addRuntimeModule(
            chunk,
            new ChunkLoadingRuntimeModule(set, this.options, {
              webpack: compiler.webpack,
            }),
          );
        };
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.baseURI)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.externalInstallChunk)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.onChunksLoaded)
          .tap('DynamicFilesystemChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap(
            'DynamicFilesystemChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getChunkScriptFilename);
            },
          );
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap(
            'DynamicFilesystemChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
              set.add(RuntimeGlobals.moduleCache);
              set.add(RuntimeGlobals.hmrModuleData);
              set.add(RuntimeGlobals.moduleFactoriesAddOnly);
            },
          );
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap(
            'DynamicFilesystemChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getUpdateManifestFilename);
            },
          );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.publicPath)
          .tap('RuntimePlugin', (chunk, set) => {
            const { outputOptions } = compilation;
            const { publicPath: globalPublicPath, scriptType } = outputOptions;
            const entryOptions = chunk.getEntryOptions();
            const publicPath =
              entryOptions && entryOptions.publicPath !== undefined
                ? entryOptions.publicPath
                : globalPublicPath;

            const module = new AutoPublicPathRuntimeModule(this.options);
            if (publicPath === 'auto' && scriptType !== 'module') {
              set.add(RuntimeGlobals.global);
            } else if (
              typeof publicPath !== 'string' ||
              /\[(full)?hash\]/.test(publicPath)
            ) {
              module.fullHash = true;
            }

            compilation.addRuntimeModule(chunk, module);
            return true;
          });

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'StartupChunkDependenciesPlugin',
          (
            chunk: Chunk,
            set: Set<string>,
            { chunkGraph }: { chunkGraph: ChunkGraph },
          ) => {
            // compilation.addRuntimeModule(
            //   chunk,
            //   //@ts-ignore
            //   new FederationModuleInfoRuntimeModule(),
            // );
          },
        );
      },
    );
  }
}

export default DynamicFilesystemChunkLoadingPlugin;
