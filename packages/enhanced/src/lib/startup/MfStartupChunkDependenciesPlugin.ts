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
            if (chunkGraph.getNumberOfEntryModules(chunk) > 0) {
              set.add(federationStartup);
            }
          },
        );

        // Add additional runtime requirements at the chunk level if there are entry modules.
        let additionalChunkRuntimeRequirementsHook: any;
        try {
          additionalChunkRuntimeRequirementsHook = (compilation.hooks as any)
            .additionalChunkRuntimeRequirements;
        } catch {
          additionalChunkRuntimeRequirementsHook = null;
        }
        if (additionalChunkRuntimeRequirementsHook?.tap) {
          additionalChunkRuntimeRequirementsHook.tap(
            'MfStartupChunkDependenciesPlugin',
            (chunk: Chunk, set: Set<string>, { chunkGraph }: any) => {
              if (!this.isEnabledForChunk(chunk, compilation)) return;
              if (chunkGraph.getNumberOfEntryModules(chunk) === 0) return;
              set.add(federationStartup);
            },
          );
        }

        // When the startupEntrypoint requirement is present, add extra keys and a runtime module.
        let startupEntrypointRequirementHook: any;
        try {
          startupEntrypointRequirementHook = (
            compilation.hooks as any
          ).runtimeRequirementInTree?.for?.(RuntimeGlobals.startupEntrypoint);
        } catch {
          startupEntrypointRequirementHook = null;
        }
        if (startupEntrypointRequirementHook?.tap) {
          startupEntrypointRequirementHook.tap(
            'StartupChunkDependenciesPlugin',
            (chunk: Chunk, set: Set<string>, { chunkGraph }: any) => {
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
        }

        // Replace the generated startup with a custom version if entry modules exist.
        let renderStartupHook: any;
        try {
          const javascriptHooks =
            compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
              compilation,
            );
          renderStartupHook = javascriptHooks?.renderStartup;
        } catch {
          renderStartupHook = null;
        }

        if (renderStartupHook?.tap) {
          renderStartupHook.tap(
            'MfStartupChunkDependenciesPlugin',
            (
              startupSource: any,
              lastInlinedModule: any,
              renderContext: any,
            ) => {
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
              ) as any;

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
        }
      },
    );
  }
}

export default StartupChunkDependenciesPlugin;
