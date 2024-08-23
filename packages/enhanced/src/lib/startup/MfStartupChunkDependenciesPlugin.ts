'use strict';

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { generateEntryStartup } from './StartupHelpers';
import type { Compiler, Chunk } from 'webpack';
import ContainerEntryModule from '../container/ContainerEntryModule';
import { ChunkLoadingType } from 'webpack/declarations/WebpackOptions';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const StartupChunkDependenciesRuntimeModule = require(
  normalizeWebpackPath(
    'webpack/lib/runtime/StartupChunkDependenciesRuntimeModule',
  ),
) as typeof import('webpack/lib/runtime/StartupChunkDependenciesRuntimeModule');
const StartupEntrypointRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupEntrypointRuntimeModule'),
) as typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

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
          const [entryModule] =
            compilation.chunkGraph.getChunkEntryModulesIterable(chunk) || [];
          return !(entryModule instanceof ContainerEntryModule);
        };

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set) => {
            if (!chunk.hasRuntime()) return;
            if (!isEnabledForChunk(chunk)) return;

            const runtimeRequirements = [
              RuntimeGlobals.currentRemoteGetScope,
              RuntimeGlobals.initializeSharing,
              RuntimeGlobals.shareScopeMap,
            ];

            if (!runtimeRequirements.some((req) => set.has(req))) return;

            set.add(RuntimeGlobals.startup);
            set.add(RuntimeGlobals.ensureChunk);
            set.add(RuntimeGlobals.ensureChunkIncludeEntries);

            compilation.addRuntimeModule(
              chunk,
              new StartupChunkDependenciesRuntimeModule(this.asyncChunkLoading),
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

            compilation.addRuntimeModule(
              chunk,
              new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
            );
          });

        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          //@ts-ignore
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            if (!isEnabledForChunk(chunk)) {
              return startupSource;
            }

            let federationRuntimeModule: any = null;

            const isFederationModule = (module: any) =>
              module.context?.endsWith('.federation');

            for (const module of chunkGraph.getChunkEntryModulesIterable(
              chunk,
            )) {
              if (isFederationModule(module)) {
                federationRuntimeModule = module;
                break;
              }

              if (module && '_modules' in module) {
                for (const concatModule of (
                  module as InstanceType<typeof ConcatenatedModule>
                )._modules) {
                  if (isFederationModule(concatModule)) {
                    federationRuntimeModule = module;
                    break;
                  }
                }
              }
            }

            if (!federationRuntimeModule) {
              return startupSource;
            }

            const federationModuleId = chunkGraph.getModuleId(
              federationRuntimeModule,
            );
            const entryModules = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );

            return new compiler.webpack.sources.ConcatSource(
              `${RuntimeGlobals.require}(${JSON.stringify(federationModuleId)});\n`,
              generateEntryStartup(
                chunkGraph,
                //@ts-ignore
                runtimeTemplate,
                //@ts-ignore
                entryModules,
                chunk,
                false,
              ),
            );
          },
        );
      },
    );
  }
}

export default StartupChunkDependenciesPlugin;
