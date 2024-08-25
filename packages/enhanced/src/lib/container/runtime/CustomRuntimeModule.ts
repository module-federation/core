import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';
import type { Chunk, Module } from 'webpack';

const { RuntimeModule, NormalModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class CustomRuntimeModule extends RuntimeModule {
  private bundlerRuntimePath: string;

  constructor(bundlerRuntimePath: string) {
    super('CustomRuntimeModule', RuntimeModule.STAGE_ATTACH);
    this.bundlerRuntimePath = bundlerRuntimePath;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    const { compilation, chunk, chunkGraph, bundlerRuntimePath } = this;
    if (!chunk || !chunkGraph || !compilation) {
      return null;
    }

    const found = this.findModule(chunk, bundlerRuntimePath);
    if (!found) return null;

    const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
      module: found,
      chunkGraph,
      request: this.bundlerRuntimePath,
      weak: false,
      runtimeRequirements: new Set(),
    });

    const exportExpr = compilation.runtimeTemplate.exportFromImport({
      moduleGraph: compilation.moduleGraph,
      module: found,
      request: this.bundlerRuntimePath,
      exportName: ['default'],
      originModule: found,
      asiSafe: true,
      isCall: false,
      callContext: false,
      defaultInterop: true,
      importVar: 'federation',
      initFragments: [],
      runtime: chunk.runtime,
      runtimeRequirements: new Set(),
    });

    return Template.asString([
      `var federation = ${initRuntimeModuleGetter};`,
      `federation = ${exportExpr}`,
      `var prevFederation = ${federationGlobal};`,
      `${federationGlobal} = {};`,
      `for (var key in federation) {`,
      Template.indent(`${federationGlobal}[key] = federation[key];`),
      `}`,
      `for (var key in prevFederation) {`,
      Template.indent(`${federationGlobal}[key] = prevFederation[key];`),
      `}`,
      'federation = undefined;',
    ]);
  }

  private findModule(chunk: Chunk, bundlerRuntimePath: string): Module | null {
    const { chunkGraph, compilation } = this;
    if (!chunk || !chunkGraph || !compilation) {
      return null;
    }
    for (const mod of chunkGraph.getChunkModulesIterable(chunk)) {
      if (mod instanceof NormalModule && mod.resource === bundlerRuntimePath) {
        return mod;
      }

      if (mod instanceof ConcatenatedModule) {
        for (const m of mod.modules) {
          if (m instanceof NormalModule && m.resource === bundlerRuntimePath) {
            return mod;
          }
        }
      }
    }
    return null;
  }
}

export default CustomRuntimeModule;
