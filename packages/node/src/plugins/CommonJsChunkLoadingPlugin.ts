import type { Chunk, Compiler, Compilation, ChunkGraph } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { ModuleFederationPluginOptions } from '../types';
const StartupChunkDependenciesPlugin = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupChunkDependenciesPlugin'),
) as typeof import('webpack/lib/runtime/StartupChunkDependenciesPlugin');
import ChunkLoadingRuntimeModule from './DynamicFilesystemChunkLoadingRuntimeModule';
import AutoPublicPathRuntimeModule from './RemotePublicPathRuntimeModule';

interface DynamicFilesystemChunkLoadingOptions
  extends ModuleFederationPluginOptions {
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
    const { RuntimeGlobals } = compiler.webpack;
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';

    new StartupChunkDependenciesPlugin({
      chunkLoading: chunkLoadingValue,
      asyncChunkLoading: this._asyncChunkLoading,
      //@ts-ignore
    }).apply(compiler);

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
