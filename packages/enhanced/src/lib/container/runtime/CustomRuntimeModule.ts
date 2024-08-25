import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';

const { RuntimeModule, NormalModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class CustomRuntimeModule extends RuntimeModule {
  private bundlerRuntimePath: string;

  constructor(
    private readonly bundledCode: string | null,
    bundlerRuntimePath: string,
  ) {
    super('CustomRuntimeModule', RuntimeModule.STAGE_BASIC);
    this.bundledCode = bundledCode;
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

    return Template.asString([
      `var federation = ${initRuntimeModuleGetter};`,
      `federation = federation.default || federation;`,
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

  private findModule(chunk: any, bundlerRuntimePath: string) {
    for (const mod of chunk.modulesIterable) {
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
