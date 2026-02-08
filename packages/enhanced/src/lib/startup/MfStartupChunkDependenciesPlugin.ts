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
const JavascriptModulesPlugin = require(
  normalizeWebpackPath('webpack/lib/javascript/JavascriptModulesPlugin'),
) as typeof import('webpack/lib/javascript/JavascriptModulesPlugin');

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

  private getJavascriptModulesPlugin(
    compiler: Compiler,
  ): typeof import('webpack/lib/javascript/JavascriptModulesPlugin') {
    const maybePlugin = (
      compiler.webpack as Compiler['webpack'] & {
        javascript?: {
          JavascriptModulesPlugin?: typeof import('webpack/lib/javascript/JavascriptModulesPlugin');
        };
      }
    ).javascript?.JavascriptModulesPlugin;

    return maybePlugin || JavascriptModulesPlugin;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'MfStartupChunkDependenciesPlugin',
      (compilation) => {
        // Add additional runtime requirements at the tree level.
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'StartupChunkDependenciesPlugin',
          (chunk, set, { chunkGraph }) => {
            if (!this.isEnabledForChunk(chunk, compilation)) return;
            if (chunk.hasRuntime()) {
              set.add(RuntimeGlobals.startupEntrypoint);
              set.add(RuntimeGlobals.ensureChunk);
              set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            }
          },
        );

        // Add additional runtime requirements at the chunk level if there are entry modules.
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set, { chunkGraph }) => {
            if (!this.isEnabledForChunk(chunk, compilation)) return;
            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) return;
            set.add(federationStartup);
          },
        );

        // When the startupEntrypoint requirement is present, add extra keys and a runtime module.
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.startupEntrypoint)
          .tap(
            'StartupChunkDependenciesPlugin',
            (chunk, set, { chunkGraph }) => {
              if (!this.isEnabledForChunk(chunk, compilation)) return;
              set.add(RuntimeGlobals.require);
              set.add(RuntimeGlobals.ensureChunk);
              set.add(RuntimeGlobals.ensureChunkIncludeEntries);
              compilation.addRuntimeModule(
                chunk,
                new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
              );
            },
          );

        // Replace the generated startup with a custom version if entry modules exist.
        const { renderStartup } =
          this.getJavascriptModulesPlugin(compiler).getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            if (!this.isEnabledForChunk(chunk, compilation)) {
              return startupSource;
            }

            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) {
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
