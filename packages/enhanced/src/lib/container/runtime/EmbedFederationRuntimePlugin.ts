import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Compiler, Chunk, Compilation } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const PLUGIN_NAME = 'EmbedFederationRuntimePlugin';

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

interface EmbedFederationRuntimePluginOptions {
  /**
   * Whether to enable runtime module embedding for all chunks.
   * If false, only chunks that explicitly require it will be embedded.
   */
  enableForAllChunks?: boolean;
}

/**
 * Plugin that embeds Module Federation runtime code into chunks.
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
   * Determines if runtime embedding should be enabled for a given chunk.
   */
  private isEnabledForChunk(chunk: Chunk): boolean {
    // Disable for our special "build time chunk"
    if (chunk.id === 'build time chunk') return false;
    return this.options.enableForAllChunks || chunk.hasRuntime();
  }

  /**
   * Checks if a hook has already been tapped by this plugin.
   */
  private isHookAlreadyTapped(
    taps: Array<{ name: string }>,
    hookName: string,
  ): boolean {
    return taps.some((tap) => tap.name === hookName);
  }

  apply(compiler: Compiler): void {
    // Prevent double application of the plugin.
    const compilationTaps = compiler.hooks.thisCompilation.taps || [];
    if (this.isHookAlreadyTapped(compilationTaps, PLUGIN_NAME)) {
      return;
    }

    // Tap into the compilation to modify renderStartup and runtime requirements.
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        // --- Part 1: Modify renderStartup to append a startup call when none is added automatically ---
        const { renderStartup } =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        renderStartup.tap(
          PLUGIN_NAME,
          (startupSource, _lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph } = renderContext;

            if (!this.isEnabledForChunk(chunk)) {
              return startupSource;
            }

            const runtimeRequirements =
              chunkGraph.getTreeRuntimeRequirements(chunk);
            const entryModuleCount = chunkGraph.getNumberOfEntryModules(chunk);

            // The default renderBootstrap automatically pushes a startup call when either:
            //   - There is at least one entry module, OR
            //   - runtimeRequirements.has(RuntimeGlobals.startupNoDefault) is true.
            if (
              entryModuleCount > 0 ||
              runtimeRequirements.has(RuntimeGlobals.startupNoDefault)
            ) {
              return startupSource;
            }

            // Otherwise, append a startup call.
            return new compiler.webpack.sources.ConcatSource(
              startupSource,
              '\n// Custom hook: appended startup call because none was added automatically\n',
              `${RuntimeGlobals.startup}();\n`,
            );
          },
        );

        // --- Part 2: Embed Federation Runtime Module and adjust runtime requirements ---
        const federationHooks =
          FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<
          ContainerEntryDependency | FederationRuntimeDependency
        > = new Set();

        // Proactively add startupOnlyBefore target chunks.
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          PLUGIN_NAME,
          (chunk: Chunk, runtimeRequirements: Set<string>) => {
            if (!this.isEnabledForChunk(chunk)) {
              return;
            }
            runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
          },
        );

        // Collect federation runtime dependencies.
        federationHooks.addFederationRuntimeDependency.tap(
          PLUGIN_NAME,
          (dependency: FederationRuntimeDependency) => {
            containerEntrySet.add(dependency);
          },
        );

        // Handle additional runtime requirements when federation is enabled.
        const handleRuntimeRequirements = (
          chunk: Chunk,
          runtimeRequirements: Set<string>,
        ) => {
          if (!this.isEnabledForChunk(chunk)) {
            return;
          }
          // Skip if already processed or if not a federation chunk.
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }

          const { moduleGraph, chunkGraph } = compilation;
          for (const dep of containerEntrySet) {
            const runtimeModule = moduleGraph.getModule(dep);
            if (!runtimeModule) continue;
            if (!chunkGraph.isModuleInChunk(runtimeModule, chunk)) {
              chunkGraph.connectChunkAndModule(chunk, runtimeModule);
            }
          }

          // Mark as embedded and add the runtime module.
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
