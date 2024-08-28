'use strict';

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { generateEntryStartup } from './StartupHelpers';
import type { Compiler, Chunk } from 'webpack';
import ContainerEntryModule from '../container/ContainerEntryModule';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const StartupEntrypointRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupEntrypointRuntimeModule'),
) as typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

interface Options {
  asyncChunkLoading?: boolean;
}

class StartupChunkDependenciesPlugin {
  asyncChunkLoading: boolean;

  constructor(options: Options) {
    this.asyncChunkLoading = options.asyncChunkLoading ?? true;
  }

  private isEnabledForChunk(chunk: Chunk, compilation: any): boolean {
    if (chunk.id === 'build time chunk') return false;
    const [finalEntry] =
      compilation.chunkGraph.getChunkEntryModulesIterable(chunk) || [];
    return !(finalEntry instanceof ContainerEntryModule);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'MfStartupChunkDependenciesPlugin',
      (compilation) => {
        const isEnabledForChunk = (chunk: Chunk) =>
          this.isEnabledForChunk(chunk, compilation);

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'StartupChunkDependenciesPlugin',
          (chunk, set, { chunkGraph }) => {
            if (!isEnabledForChunk(chunk)) return;
            if (chunk.hasRuntime()) {
              set.add(RuntimeGlobals.startupEntrypoint);
              set.add(RuntimeGlobals.ensureChunk);
              set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            }
          },
        );

        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set, { chunkGraph }) => {
            if (!isEnabledForChunk(chunk)) return;
            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) return;
            set.add('federation-entry-startup');
          },
        );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.startupEntrypoint)
          .tap(
            'StartupChunkDependenciesPlugin',
            (chunk, set, { chunkGraph }) => {
              if (!isEnabledForChunk(chunk)) return;
              set.add(RuntimeGlobals.require);
              set.add(RuntimeGlobals.ensureChunk);
              set.add(RuntimeGlobals.ensureChunkIncludeEntries);
              compilation.addRuntimeModule(
                chunk,
                new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
              );
            },
          );

        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
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
                runtimeTemplate,
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
