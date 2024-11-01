/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryDependency from '../ContainerEntryDependency';

import type { NormalModule as NormalModuleType } from 'webpack';
import type FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class EmbedFederationRuntimeModule extends RuntimeModule {
  private containerEntrySet: Set<
    ContainerEntryDependency | FederationRuntimeDependency
  >;

  constructor(
    containerEntrySet: Set<
      ContainerEntryDependency | FederationRuntimeDependency
    >,
  ) {
    super('embed federation', RuntimeModule.STAGE_ATTACH);
    this.containerEntrySet = containerEntrySet;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    const { compilation, chunk, chunkGraph } = this;
    if (!chunk || !chunkGraph || !compilation) {
      return null;
    }
    let found;
    if (chunk.name) {
      for (const dep of this.containerEntrySet) {
        const mod = compilation.moduleGraph.getModule(dep);
        if (mod && compilation.chunkGraph.isModuleInChunk(mod, chunk)) {
          found = mod as NormalModuleType;
          break;
        }
      }
    }
    if (!found) {
      return null;
    }
    const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
      module: found,
      chunkGraph,
      request: found.request,
      weak: false,
      runtimeRequirements: new Set(),
    });
    return Template.asString([`${initRuntimeModuleGetter}`]);
  }
}
export default EmbedFederationRuntimeModule;
