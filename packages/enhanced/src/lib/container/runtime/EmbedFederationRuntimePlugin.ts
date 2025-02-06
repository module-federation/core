import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Compiler, Chunk, Compilation } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';
import { ConcatSource } from 'webpack-sources';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const PLUGIN_NAME = 'EmbedFederationRuntimePlugin';

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

interface EmbedFederationRuntimePluginOptions {
  /**
   * Whether to enable runtime module embedding for all chunks
   * If false, will only embed for chunks that explicitly require it
   */
  enableForAllChunks?: boolean;
}

/**
 * Plugin that handles embedding of Module Federation runtime code into chunks.
 * It ensures proper initialization of federated modules and manages runtime requirements.
 */
class EmbedFederationRuntimePlugin {
  private readonly options: EmbedFederationRuntimePluginOptions;
  private readonly processedChunks = new WeakMap<Chunk, boolean>();

  constructor(options: EmbedFederationRuntimePluginOptions = {}) {
    this.options = {
      enableForAllChunks: false,
      ...options,
    };
  }

  /**
   * Determines if runtime embedding should be enabled for a given chunk
   */
  private isEnabledForChunk(chunk: Chunk): boolean {
    if (this.options.enableForAllChunks) return true;
    if (chunk.id === 'build time chunk') return false;
    return chunk.hasRuntime();
  }

  /**
   * Checks if a compilation hook has already been tapped by this plugin
   */
  private isHookAlreadyTapped(
    taps: Array<{ name: string }>,
    hookName: string,
  ): boolean {
    return taps.some((tap) => tap.name === hookName);
  }

  apply(compiler: Compiler): void {
    // Prevent double application of plugin
    const compilationTaps = compiler.hooks.thisCompilation.taps || [];
    if (this.isHookAlreadyTapped(compilationTaps, PLUGIN_NAME)) {
      return;
    }

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation /*: Compilation */) => {
        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          PLUGIN_NAME,
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph } = renderContext;

            if (!this.isEnabledForChunk(chunk)) {
              return startupSource;
            }

            const runtimeRequirements =
              chunkGraph.getTreeRuntimeRequirements(chunk);
            const entryModuleCount = chunkGraph.getNumberOfEntryModules(chunk);

            // The original renderBootstrap pushes a startup call automatically when either:
            //   - There is at least one entry module, OR
            //   - runtimeRequirements.has(RuntimeGlobals.startupNoDefault) is true.
            // (In all other cases—even if one of the startup keys is set—the startup function is defined
            // but not called.)
            if (
              entryModuleCount > 0 ||
              runtimeRequirements.has(RuntimeGlobals.startupNoDefault)
            ) {
              return startupSource;
            }

            // Otherwise, append a startup call.
            return new ConcatSource(
              startupSource,
              '\n// Custom hook: appended startup call because none was added automatically\n',
              `${RuntimeGlobals.startup}();\n`,
            );
          },
        );
      },
    );

    //     compiler.hooks.thisCompilation.tap(
    //       PLUGIN_NAME,
    //       (compilation: Compilation) => {
    //         const { renderStartup } =
    //           compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
    //             compilation,
    //           );
    //
    //         // Prevent double tapping of renderStartup hook
    //         const startupTaps = renderStartup.taps || [];
    //         if (this.isHookAlreadyTapped(startupTaps, PLUGIN_NAME)) {
    //           return;
    //         }
    //
    //         renderStartup.tap(
    //           PLUGIN_NAME,
    //           (startupSource, lastInlinedModule, renderContext) => {
    //             const { chunk, chunkGraph } = renderContext;
    //
    //             if (!this.isEnabledForChunk(chunk)) {
    //               return startupSource;
    //             }
    //
    //             const treeRuntimeRequirements =
    //               chunkGraph.getTreeRuntimeRequirements(chunk);
    //             const chunkRuntimeRequirements =
    //               chunkGraph.getChunkRuntimeRequirements(chunk);
    //
    //             const federation =
    //               chunkRuntimeRequirements.has(federationGlobal) ||
    //               treeRuntimeRequirements.has(federationGlobal);
    //
    //             if (!federation) {
    //               return startupSource;
    //             }
    //
    //             // Skip if chunk was already processed
    //             if (this.processedChunks.get(chunk)) {
    //               return startupSource;
    //             }
    //
    //             // Mark chunk as processed
    //             this.processedChunks.set(chunk, true);
    // debugger;
    //             // Add basic startup call
    //             return new ConcatSource(
    //               startupSource,
    //               // add only when not added already
    //               `${RuntimeGlobals.startup}();\n`,
    //             );
    //           },
    //         );
    //       },
    //     );

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<
          ContainerEntryDependency | FederationRuntimeDependency
        > = new Set();

        // Proactively add startupOnlyBefore to all chunks
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          PLUGIN_NAME,
          (chunk: Chunk, runtimeRequirements: Set<string>) => {
            runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
          },
        );

        hooks.addFederationRuntimeModule.tap(
          PLUGIN_NAME,
          (dependency: FederationRuntimeDependency) => {
            containerEntrySet.add(dependency);
          },
        );

        const handleRuntimeRequirements = (
          chunk: Chunk,
          runtimeRequirements: Set<string>,
        ) => {
          runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);

          if (!this.isEnabledForChunk(chunk)) {
            return;
          }
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }

          runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
          runtimeRequirements.add('embeddedFederationRuntime');

          const runtimeModule = new EmbedFederationRuntimeModule(
            containerEntrySet,
          );
          compilation.addRuntimeModule(chunk, runtimeModule);
        };

        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap(PLUGIN_NAME, handleRuntimeRequirements);
      },
    );
  }
}

export default EmbedFederationRuntimePlugin;
