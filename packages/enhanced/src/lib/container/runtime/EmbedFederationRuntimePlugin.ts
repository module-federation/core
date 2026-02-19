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
            PLUGIN_NAME,
            (
              startupSource: any,
              _lastInlinedModule: any,
              renderContext: any,
            ) => {
              const { chunk, chunkGraph } = renderContext;

              if (!this.isEnabledForChunk(chunk)) {
                return startupSource;
              }

              const runtimeRequirements =
                chunkGraph.getTreeRuntimeRequirements(chunk);
              const entryModuleCount =
                chunkGraph.getNumberOfEntryModules(chunk);

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
        }

        // --- Part 2: Embed Federation Runtime Module and adjust runtime requirements ---
        const federationHooks =
          FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<
          ContainerEntryDependency | FederationRuntimeDependency
        > = new Set();

        // Proactively add startupOnlyBefore target chunks.
        let additionalChunkRuntimeRequirementsHook: any;
        try {
          additionalChunkRuntimeRequirementsHook = (compilation.hooks as any)
            .additionalChunkRuntimeRequirements;
        } catch {
          additionalChunkRuntimeRequirementsHook = null;
        }
        if (additionalChunkRuntimeRequirementsHook?.tap) {
          additionalChunkRuntimeRequirementsHook.tap(
            PLUGIN_NAME,
            (chunk: Chunk, runtimeRequirements: Set<string>) => {
              if (!this.isEnabledForChunk(chunk)) {
                return;
              }
              runtimeRequirements.add(RuntimeGlobals.startupOnlyBefore);
            },
          );
        }

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

          // Mark as embedded and add the runtime module.
          runtimeRequirements.add('embeddedFederationRuntime');
          const runtimeModule = new EmbedFederationRuntimeModule(
            containerEntrySet,
          );
          compilation.addRuntimeModule(chunk, runtimeModule);
        };

        let federationRuntimeRequirementHook: any;
        try {
          federationRuntimeRequirementHook = (
            compilation.hooks as any
          ).runtimeRequirementInTree?.for?.(federationGlobal);
        } catch {
          federationRuntimeRequirementHook = null;
        }
        if (federationRuntimeRequirementHook?.tap) {
          federationRuntimeRequirementHook.tap(
            PLUGIN_NAME,
            handleRuntimeRequirements,
          );
        }
      },
    );
  }
}

export default EmbedFederationRuntimePlugin;
