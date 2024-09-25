'use strict';

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import {
  federationStartup,
  generateEntryStartup,
  generateESMEntryStartup,
} from './StartupHelpers';
import type { Compiler, Chunk } from 'webpack';
import ContainerEntryModule from '../container/ContainerEntryModule';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const StartupEntrypointRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupEntrypointRuntimeModule'),
) as typeof import('webpack/lib/runtime/StartupEntrypointRuntimeModule');

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
      Array.from(
        compilation.chunkGraph.getChunkEntryModulesIterable(chunk),
      ).reverse() || [];

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
            set.add(federationStartup);
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

            const treeRuntimeRequirements =
              chunkGraph.getTreeRuntimeRequirements(chunk);
            const chunkRuntimeRequirements =
              chunkGraph.getChunkRuntimeRequirements(chunk);

            const federation =
              chunkRuntimeRequirements.has(federationStartup) ||
              treeRuntimeRequirements.has(federationStartup);

            if (!federation) {
              return startupSource;
            }

            const entryModules = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );

            const entryGeneration = runtimeTemplate.outputOptions.module
              ? generateESMEntryStartup
              : generateEntryStartup;

            return new compiler.webpack.sources.ConcatSource(
              entryGeneration(
                compilation,
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
