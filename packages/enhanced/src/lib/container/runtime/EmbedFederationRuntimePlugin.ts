import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import type { Compiler, Compilation, Chunk } from 'webpack';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimePlugin {
  apply(compiler: Compiler): void {
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

        const handleRuntimeRequirements = (
          chunk: Chunk,
          runtimeRequirements: Set<string>,
        ) => {
          if (chunk.id === 'build time chunk') {
            return;
          }
          if (runtimeRequirements.has('embeddedFederationRuntime')) return;
          if (!runtimeRequirements.has(federationGlobal)) {
            return;
          }
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
