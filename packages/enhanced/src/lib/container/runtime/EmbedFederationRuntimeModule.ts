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
    stage?: number,
  ) {
    // Use provided stage or default to STAGE_ATTACH (10)
    // Worker chunks use STAGE_NORMAL - 2 (-2) to run before RemoteRuntimeModule
    super('embed federation', stage ?? 10);
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

    // Generate different code based on stage
    // Stage 10 (STAGE_ATTACH for JSONP): Load federation entry INSIDE startup hook BEFORE prevStartup()
    // Stage 5 (STAGE_BASIC for workers): Load federation entry IMMEDIATELY to initialize bundlerRuntime early
    const result =
      this.stage === 5
        ? // Worker pattern: Load federation entry immediately
          Template.asString([`${initRuntimeModuleGetter};`])
        : // JSONP/default pattern: Load inside startup hook
          Template.asString([
            `var prevStartup = ${RuntimeGlobals.startup};`,
            `var hasRun = false;`,
            `${RuntimeGlobals.startup} = ${compilation.runtimeTemplate.basicFunction(
              '',
              [
                `if (!hasRun) {`,
                `  hasRun = true;`,
                `  ${initRuntimeModuleGetter};`,
                `}`,
                `if (typeof prevStartup === 'function') {`,
                `  return prevStartup();`,
                `} else {`,
                `  console.warn('[Module Federation] prevStartup is not a function, skipping startup execution');`,
                `}`,
              ],
            )};`,
          ]);

    this._cachedGeneratedCode = result;
    return result;
  }
}
export default EmbedFederationRuntimeModule;
