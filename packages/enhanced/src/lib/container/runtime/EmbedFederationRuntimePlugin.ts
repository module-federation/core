import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Compiler, Chunk } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeGlobals, Compilation } = require(
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

  constructor(options: EmbedFederationRuntimePluginOptions = {}) {
    this.options = {
      enableForAllChunks: false,
      ...options,
    };
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbedFederationRuntimePlugin',
      (compilation: InstanceType<typeof Compilation>) => {
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
          if (!isEnabledForChunk(chunk)) {
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
          .tap('EmbedFederationRuntimePlugin', handleRuntimeRequirements);
      },
    );
  }
}
export default EmbedFederationRuntimePlugin;
