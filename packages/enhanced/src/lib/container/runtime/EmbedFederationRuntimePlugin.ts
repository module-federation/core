import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Dependency } from 'webpack';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Compiler, Compilation, Chunk, Module, ChunkGraph } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimePlugin {
  private bundlerRuntimePath: string;

  constructor(path: string) {
    this.bundlerRuntimePath = path;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbedFederationRuntimePlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<ContainerEntryDependency> = new Set();
        hooks.getContainerEntryModules.tap(
          'EmbedFederationRuntimePlugin',
          (dependency: ContainerEntryDependency) => {
            containerEntrySet.add(dependency);
          },
        );
        const handler = (chunk: Chunk, runtimeRequirements: Set<string>) => {
          if (chunk.id === 'build time chunk') {
            return;
          }
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }

          runtimeRequirements.add('embeddedFederationRuntime');
          const runtimeModule = new EmbedFederationRuntimeModule(
            this.bundlerRuntimePath,
            containerEntrySet,
          );

          compilation.addRuntimeModule(chunk, runtimeModule);
        };
        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap('EmbedFederationRuntimePlugin', handler);
      },
    );
  }
}

export default EmbedFederationRuntimePlugin;
