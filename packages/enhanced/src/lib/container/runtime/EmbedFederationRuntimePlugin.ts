import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import EmbedFederationRuntimeModule from './EmbedFederationRuntimeModule';
const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Compiler, Compilation, Chunk, Module, ChunkGraph } from 'webpack';
import { getFederationGlobalScope } from './utils';
const EntryDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
) as typeof import('webpack/lib/dependencies/EntryDependency');

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
          );

          compilation.addRuntimeModule(chunk, runtimeModule);
          console.log(`Custom runtime module added to chunk: ${chunk.name}`);
        };
        compilation.hooks.runtimeRequirementInTree
          .for(federationGlobal)
          .tap('EmbedFederationRuntimePlugin', handler);
      },
    );
  }
}

export default EmbedFederationRuntimePlugin;
