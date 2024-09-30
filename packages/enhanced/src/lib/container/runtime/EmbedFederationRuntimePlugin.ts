import type { Compiler, Compilation, Chunk, Module } from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
import FederationModulesPlugin from './FederationModulesPlugin';
import { getFederationGlobalScope } from './utils';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';
import { getAllReferencedModules } from '../HoistContainerReferencesPlugin';

const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimePlugin {
  experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'];

  constructor(
    experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
  ) {
    this.experiments = experiments;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbedFederationRuntimePlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containerEntrySet: Set<FederationRuntimeDependency> = new Set();

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
          const isHost =
            chunk.name === 'webpack' || chunk.name === 'webpack-runtime';
          const runtimeModule = new EmbedFederationRuntimeModule(
            this.experiments,
            containerEntrySet,
            isHost,
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
