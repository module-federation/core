'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { generateEntryStartup } from './StartupHelpers';
const { RuntimeGlobals } = require(normalizeWebpackPath('webpack'));
import type { Compiler, Chunk } from 'webpack';
const StartupChunkDependenciesRuntimeModule = require(
  normalizeWebpackPath(
    'webpack/lib/runtime/StartupChunkDependenciesRuntimeModule',
  ),
);
const StartupEntrypointRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupEntrypointRuntimeModule'),
);
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
);
import type { ChunkLoadingType } from 'webpack/declarations/WebpackOptions';
import ContainerEntryModule from '../container/ContainerEntryModule';
interface Options {
  chunkLoading: ChunkLoadingType;
  asyncChunkLoading?: boolean;
}

class StartupChunkDependenciesPlugin {
  asyncChunkLoading: boolean;

  constructor(options: Options) {
    this.asyncChunkLoading = options.asyncChunkLoading ?? true;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'MfStartupChunkDependenciesPlugin',
      (compilation) => {
        const isEnabledForChunk = (chunk: Chunk): boolean => {
          const chunkGraph = compilation.chunkGraph;
          const entryModule = Array.from(
            chunkGraph.getChunkEntryModulesIterable(chunk),
          )[0];
          return !(entryModule instanceof ContainerEntryModule);
        };

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set) => {
            if (!chunk.hasRuntime()) return;
            if (!isEnabledForChunk(chunk)) return;

            const hasRemoteScope = set.has(
              RuntimeGlobals.currentRemoteGetScope,
            );
            const hasSharingInit = set.has(RuntimeGlobals.initializeSharing);
            const hasShareMap = set.has(RuntimeGlobals.shareScopeMap);

            if (!hasRemoteScope && !hasSharingInit && !hasShareMap) {
              return;
            }

            set.add(RuntimeGlobals.startup);
            set.add(RuntimeGlobals.ensureChunk);
            set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            // starts up runtime chunks
            compilation.addRuntimeModule(
              chunk,
              new StartupChunkDependenciesRuntimeModule(
                this.asyncChunkLoading,
                true,
              ),
            );
          },
        );

        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set) => {
            if (chunk.hasRuntime()) return;
            if (compilation.chunkGraph.getNumberOfEntryModules(chunk) <= 0)
              return;
            set.add(RuntimeGlobals.startup);
            set.add('federation-entry-startup');
            set.add(RuntimeGlobals.startupEntrypoint);
          },
        );

        compilation.hooks.runtimeRequirementInChunk
          .for(RuntimeGlobals.startupEntrypoint)
          .tap('MfStartupChunkDependenciesPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.require);
            set.add(RuntimeGlobals.ensureChunk);
            set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            // starts up entrypoints
            compilation.addRuntimeModule(
              chunk,
              new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
            );
          });

        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        hooks.renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            if (!isEnabledForChunk(chunk)) {
              return startupSource;
            }

            let federationRuntimeModule: any = null;
            for (const module of chunkGraph.getChunkEntryModulesIterable(
              chunk,
            )) {
              if (module.context && module.context.endsWith('.federation')) {
                federationRuntimeModule = module;
                break;
              }

              if (module && 'modules' in module) {
                for (const concatModule of (module as typeof ConcatenatedModule)
                  .modules) {
                  if (
                    concatModule.context &&
                    concatModule.context.endsWith('.federation')
                  ) {
                    federationRuntimeModule = module;
                    break;
                  }
                }
              }
            }
            debugger;
            if (!federationRuntimeModule) {
              return startupSource;
            }

            return new compiler.webpack.sources.ConcatSource(
              `${RuntimeGlobals.require}(${JSON.stringify(
                chunkGraph.getModuleId(federationRuntimeModule),
              )});\n`,
              generateEntryStartup(
                //@ts-ignore
                chunkGraph,
                runtimeTemplate,
                Array.from(
                  chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
                ),
                chunk,
                false, // passive set to false for active startup
              ),
            );
          },
        );
      },
    );
  }
}

export default StartupChunkDependenciesPlugin;
