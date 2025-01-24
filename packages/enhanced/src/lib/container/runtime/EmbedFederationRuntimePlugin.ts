import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Compiler, Chunk, Compilation } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';
import {
  federationStartup,
  generateEntryStartup,
  generateESMEntryStartup,
} from '../../startup/StartupHelpers';
import { ConcatSource } from 'webpack-sources';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

interface EmbedFederationRuntimePluginOptions {
  /**
   * Whether to enable runtime module embedding for all chunks
   * If false, will only embed for chunks that explicitly require it
   */
  enableForAllChunks?: boolean;
}

class EmbedFederationRuntimePlugin {
  private readonly options: EmbedFederationRuntimePluginOptions;
  private readonly processedChunks = new WeakMap<Chunk, boolean>();

  constructor(options: EmbedFederationRuntimePluginOptions = {}) {
    this.options = {
      enableForAllChunks: false,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    // Check if plugin is already applied
    const compilationTaps = compiler.hooks.thisCompilation.taps || [];
    if (
      compilationTaps.find((tap) => tap.name === 'EmbedFederationRuntimePlugin')
    ) {
      return;
    }

    compiler.hooks.thisCompilation.tap(
      'EmbedFederationRuntimePlugin',
      (compilation: Compilation) => {
        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        // Check if renderStartup hook is already tapped
        const startupTaps = renderStartup.taps || [];
        if (
          startupTaps.find(
            (tap) => tap.name === 'MfStartupChunkDependenciesPlugin',
          )
        ) {
          return;
        }

        renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph, runtimeTemplate } = renderContext;

            const isEnabledForChunk = (chunk: Chunk) => {
              if (this.options.enableForAllChunks) return true;
              if (chunk.id === 'build time chunk') return false;
              return chunk.hasRuntime();
            };

            if (!isEnabledForChunk(chunk)) {
              return startupSource;
            }

            const treeRuntimeRequirements =
              chunkGraph.getTreeRuntimeRequirements(chunk);
            const chunkRuntimeRequirements =
              chunkGraph.getChunkRuntimeRequirements(chunk);

            const federation =
              chunkRuntimeRequirements.has(federationGlobal) ||
              treeRuntimeRequirements.has(federationGlobal);

            if (!federation) {
              return startupSource;
            }

            // Check if we've already processed this chunk
            if (this.processedChunks.get(chunk)) {
              return startupSource;
            }

            const entryModules = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(chunk),
            );

            if (chunkGraph.getNumberOfEntryModules(chunk) === 0) {
              // Mark chunk as processed
              this.processedChunks.set(chunk, true);
              return new ConcatSource(
                startupSource,
                `${RuntimeGlobals.startup}();\n`,
              );
            }

            // Mark chunk as processed
            this.processedChunks.set(chunk, true);
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
    compiler.hooks.thisCompilation.tap(
      'EmbedFederationRuntimePlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<
          ContainerEntryDependency | FederationRuntimeDependency
        > = new Set();

        hooks.addFederationRuntimeModule.tap(
          'EmbedFederationRuntimePlugin',
          (dependency: FederationRuntimeDependency) => {
            containerEntrySet.add(dependency);
          },
        );

        const isEnabledForChunk = (chunk: Chunk) => {
          if (this.options.enableForAllChunks) return true;
          if (chunk.id === 'build time chunk') return false;
          return chunk.hasRuntime();
        };

        const handleRuntimeRequirements = (
          chunk: Chunk,
          runtimeRequirements: Set<string>,
        ) => {
          console.log(runtimeRequirements);
          if (!isEnabledForChunk(chunk)) {
            return;
          }
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }
          runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
          runtimeRequirements.add('embeddedFederationRuntime');
          if (runtimeRequirements.has(RuntimeGlobals.startup)) {
            // debugger;
          } else {
            // debugger
          }
          const runtimeModule = new EmbedFederationRuntimeModule(
            containerEntrySet,
          );
          compilation.addRuntimeModule(chunk, runtimeModule);
        };

        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap('EmbedFederationRuntimePlugin', handleRuntimeRequirements);

        // compilation.hooks.additionalTreeRuntimeRequirements.tap(
        //   'EmbedFederationRuntimePlugin',
        //   (chunk, runtimeRequirements) => {
        //     if(!chunk.hasRuntime()) return;
        //    runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
        //    runtimeRequirements.add(RuntimeGlobals.startup);
        //   },
        // );
      },
    );
  }
}
export default EmbedFederationRuntimePlugin;
