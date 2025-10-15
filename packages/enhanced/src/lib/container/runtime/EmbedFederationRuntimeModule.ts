/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import ContainerEntryDependency from '../ContainerEntryDependency';

import type { NormalModule as NormalModuleType } from 'webpack';
import type FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class EmbedFederationRuntimeModule extends RuntimeModule {
  private containerEntrySet: Set<
    ContainerEntryDependency | FederationRuntimeDependency
  >;
  public override _cachedGeneratedCode: string | undefined;

  constructor(
    containerEntrySet: Set<
      ContainerEntryDependency | FederationRuntimeDependency
    >,
  ) {
    // Run at STAGE_NORMAL (0) - after FederationRuntimeModule (-1) but before consumes/jsonp modules
    // This ensures bundlerRuntime is available before any chunk loading happens
    super('embed federation', RuntimeModule.STAGE_NORMAL);
    this.containerEntrySet = containerEntrySet;
    this._cachedGeneratedCode = undefined;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    if (this._cachedGeneratedCode !== undefined) {
      return this._cachedGeneratedCode;
    }
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

    const result = Template.asString([
      `console.log('[EmbedFederation] Loading federation entry for', ${RuntimeGlobals.require}.federation?.initOptions?.name || 'unknown');`,
      `${initRuntimeModuleGetter};`,
      `console.log('[EmbedFederation] Federation entry loaded, bundlerRuntime available:', !!${RuntimeGlobals.require}.federation.bundlerRuntime);`,
      `var prevStartup = ${RuntimeGlobals.startup};`,
      `var hasRun = false;`,
      `${RuntimeGlobals.startup} = ${compilation.runtimeTemplate.basicFunction(
        '',
        [
          `console.log('[EmbedFederation] Startup hook called, hasRun:', hasRun);`,
          `if (!hasRun) {`,
          `  hasRun = true;`,
          `  var result = typeof prevStartup === 'function' ? prevStartup() : undefined;`,
          `  return result;`,
          `}`,
          `return typeof prevStartup === 'function' ? prevStartup() : undefined;`,
        ],
      )};`,
      `console.log('[EmbedFederation] Startup hook installed');`,
    ]);
    this._cachedGeneratedCode = result;
    return result;
  }
}
export default EmbedFederationRuntimeModule;
