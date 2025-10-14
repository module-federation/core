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
    super('embed federation', 30); // Run after STAGE_TRIGGER (20) but before runtime handlers are used
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
      `console.log('[EmbedFederation] Setting up startup hook, chunk:', ${JSON.stringify(chunk.name || chunk.id)});`,
      `var prevStartup = ${RuntimeGlobals.startup};`,
      `console.log('[EmbedFederation] prevStartup type:', typeof prevStartup);`,
      `var hasRun = false;`,
      `${RuntimeGlobals.startup} = ${compilation.runtimeTemplate.basicFunction(
        '',
        [
          `console.log('[EmbedFederation] Startup hook called, hasRun:', hasRun);`,
          `if (!hasRun) {`,
          `  hasRun = true;`,
          `  // Call prevStartup FIRST to initialize webpack runtime handlers`,
          `  console.log('[EmbedFederation] Calling prevStartup to initialize runtime');`,
          `  var result = typeof prevStartup === 'function' ? prevStartup() : undefined;`,
          `  // THEN require federation entry after runtime is fully initialized`,
          `  console.log('[EmbedFederation] About to require federation entry:', ${JSON.stringify(found.request)});`,
          `  ${initRuntimeModuleGetter};`,
          `  console.log('[EmbedFederation] Federation entry require() completed');`,
          `  return result;`,
          `}`,
          `return typeof prevStartup === 'function' ? prevStartup() : undefined;`,
        ],
      )};`,
      `console.log('[EmbedFederation] Startup hook installed, new type:', typeof ${RuntimeGlobals.startup});`,
    ]);
    this._cachedGeneratedCode = result;
    return result;
  }
}
export default EmbedFederationRuntimeModule;
