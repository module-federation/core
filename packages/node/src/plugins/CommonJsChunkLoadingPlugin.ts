import type { Chunk, Compiler, Compilation, ChunkGraph } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import ChunkLoadingRuntimeModule from './DynamicFilesystemChunkLoadingRuntimeModule';
import FederationModuleInfoRuntimeModule from './FederationModuleInfoRuntimeModule';
import AutoPublicPathRuntimeModule from './RemotePublicPathRuntimeModule';
//@ts-ignore
import PublicPathRuntimeModule from "webpack/lib/runtime/PublicPathRuntimeModule";


interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  debug?: boolean;
}

class CommonJsChunkLoadingPlugin {
  private options: CommonJsChunkLoadingOptions;
  private _asyncChunkLoading: boolean;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    this._asyncChunkLoading = this.options.asyncChunkLoading;
  }

  apply(compiler: Compiler) {
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';

    new StartupChunkDependenciesPlugin({
      chunkLoading: chunkLoadingValue,
      asyncChunkLoading: this._asyncChunkLoading,
    }).apply(compiler);

    compiler.hooks.thisCompilation.tap(
      'CommonJsChunkLoadingPlugin',
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
            })
          );
        };
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.baseURI)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.externalInstallChunk)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.onChunksLoaded)
          .tap('CommonJsChunkLoadingPlugin', handler);
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap(
            'CommonJsChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getChunkScriptFilename);
            }
          );
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap(
            'CommonJsChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
              set.add(RuntimeGlobals.moduleCache);
              set.add(RuntimeGlobals.hmrModuleData);
              set.add(RuntimeGlobals.moduleFactoriesAddOnly);
            }
          );
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap(
            'CommonJsChunkLoadingPlugin',
            (chunk: Chunk, set: Set<string>) => {
              if (!isEnabledForChunk(chunk)) {
                return;
              }
              set.add(RuntimeGlobals.getUpdateManifestFilename);
            }
          );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.publicPath)
          .tap("RuntimePlugin", (chunk, set) => {
            const { outputOptions } = compilation;
            const { publicPath: globalPublicPath, scriptType } = outputOptions;
            const entryOptions = chunk.getEntryOptions();
            const publicPath =
              entryOptions && entryOptions.publicPath !== undefined
                ? entryOptions.publicPath
                : globalPublicPath;

            if (publicPath === "auto") {
              const module = new AutoPublicPathRuntimeModule(this.options);
              if (scriptType !== "module") set.add(RuntimeGlobals.global);
              compilation.addRuntimeModule(chunk, module);
            } else {
              const module = new AutoPublicPathRuntimeModule(this.options);

              if (
                typeof publicPath !== "string" ||
                /\[(full)?hash\]/.test(publicPath)
              ) {
                module.fullHash = true;
              }

              compilation.addRuntimeModule(chunk, module);
            }
            return true;
          });



        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'StartupChunkDependenciesPlugin',
          (
            chunk: Chunk,
            set: Set<string>,
            { chunkGraph }: { chunkGraph: ChunkGraph }
          ) => {
            compilation.addRuntimeModule(
              chunk,
              //@ts-ignore
              new FederationModuleInfoRuntimeModule()
            );
          }
        );
      }
    );
  }
}

export default CommonJsChunkLoadingPlugin;


