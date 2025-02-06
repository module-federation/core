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
        // Add additional runtime requirements on the tree level.
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

        // Add additional runtime requirements on the chunk level if there are entry modules.
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set, { chunkGraph }) => {
            if (!this.isEnabledForChunk(chunk, compilation)) return;
            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) return;
            set.add(federationStartup);
          },
        );

        // When the startupEntrypoint runtime requirement is in the tree, add additional keys and runtime module.
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

        // Replace the generated startup with our custom version when there are entry modules.
        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            // Only modify chunks that are enabled.
            if (!this.isEnabledForChunk(chunk, compilation)) {
              return startupSource;
            }

            // If no entry modules, do nothing.
            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) {
              return startupSource;
            }

            // Check the runtime requirements for federation.
            const treeRuntimeRequirements =
              chunkGraph.getTreeRuntimeRequirements(chunk);
            const chunkRuntimeRequirements =
              chunkGraph.getChunkRuntimeRequirements(chunk);

            const federation =
              chunkRuntimeRequirements.has(federationStartup) ||
              treeRuntimeRequirements.has(federationStartup);

            // If the federation requirement is not present, leave the startup as-is.
            if (!federation) {
              return startupSource;
            }

            // Otherwise, get the entry modules and generate a custom startup.
            const entryModules = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );

            // Choose between ESM and non-ESM startup generation based on the runtimeTemplate.
            const entryGeneration = runtimeTemplate.outputOptions.module
              ? generateESMEntryStartup
              : generateEntryStartup;

            // Replace the startup by returning a new ConcatSource.
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

  // apply(compiler: Compiler): void {
  //   compiler.hooks.thisCompilation.tap(
  //     'MfStartupChunkDependenciesPlugin',
  //     (compilation) => {
  //       compilation.hooks.additionalTreeRuntimeRequirements.tap(
  //         'StartupChunkDependenciesPlugin',
  //         (chunk, set, { chunkGraph }) => {
  //           if (!this.isEnabledForChunk(chunk, compilation)) return;
  //           if (chunk.hasRuntime()) {
  //             set.add(RuntimeGlobals.startupEntrypoint);
  //             set.add(RuntimeGlobals.ensureChunk);
  //             set.add(RuntimeGlobals.ensureChunkIncludeEntries);
  //           }
  //         },
  //       );
  //
  //       compilation.hooks.additionalChunkRuntimeRequirements.tap(
  //         'MfStartupChunkDependenciesPlugin',
  //         (chunk, set, { chunkGraph }) => {
  //           if (!this.isEnabledForChunk(chunk, compilation)) return;
  //           if (chunkGraph.getNumberOfEntryModules(chunk) === 0) return;
  //           set.add(federationStartup);
  //         },
  //       );
  //
  //       compilation.hooks.runtimeRequirementInTree
  //         .for(RuntimeGlobals.startupEntrypoint)
  //         .tap(
  //           'StartupChunkDependenciesPlugin',
  //           (chunk, set, { chunkGraph }) => {
  //             if (!this.isEnabledForChunk(chunk, compilation)) return;
  //             set.add(RuntimeGlobals.require);
  //             set.add(RuntimeGlobals.ensureChunk);
  //             set.add(RuntimeGlobals.ensureChunkIncludeEntries);
  //             compilation.addRuntimeModule(
  //               chunk,
  //               new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
  //             );
  //           },
  //         );
  //
  //       const { renderStartup } =
  //         compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
  //           compilation,
  //         );
  //
  //       renderStartup.tap(
  //         'MfStartupChunkDependenciesPlugin',
  //         (startupSource, lastInlinedModule, renderContext) => {
  //           const { chunk, chunkGraph, runtimeTemplate } = renderContext;
  //
  //
  //           if (!this.isEnabledForChunk(chunk, compilation)) {
  //             return startupSource;
  //           }
  //
  //           if (chunkGraph.getNumberOfEntryModules(chunk) === 0) {
  //             return startupSource;
  //           }
  //
  //           const treeRuntimeRequirements =
  //             chunkGraph.getTreeRuntimeRequirements(chunk);
  //           const chunkRuntimeRequirements =
  //             chunkGraph.getChunkRuntimeRequirements(chunk);
  //
  //           const federation =
  //             chunkRuntimeRequirements.has(federationStartup) ||
  //             treeRuntimeRequirements.has(federationStartup);
  //
  //           if (!federation) {
  //             return startupSource;
  //           }
  //
  //           const entryModules = Array.from(
  //             chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
  //           );
  //
  //           const entryGeneration = runtimeTemplate.outputOptions.module
  //             ? generateESMEntryStartup
  //             : generateEntryStartup;
  //
  //           return new compiler.webpack.sources.ConcatSource(
  //             entryGeneration(
  //               compilation,
  //               chunkGraph,
  //               runtimeTemplate,
  //               entryModules,
  //               chunk,
  //               false,
  //             ),
  //           );
  //         },
  //       );
  //     },
  //   );
  // }
}

export default StartupChunkDependenciesPlugin;
