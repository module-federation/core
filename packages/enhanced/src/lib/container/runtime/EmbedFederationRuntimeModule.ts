import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';
import type { Chunk, Module, NormalModule as NormalModuleType } from 'webpack';
import ContainerEntryDependency from '../ContainerEntryDependency';
import type FederationRuntimeDependency from './FederationRuntimeDependency';

const { RuntimeModule, NormalModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimeModule extends RuntimeModule {
  private bundlerRuntimePath: string;
  private containerEntrySet: Set<
    ContainerEntryDependency | FederationRuntimeDependency
  >;

  constructor(
    bundlerRuntimePath: string,
    containerEntrySet: Set<
      ContainerEntryDependency | FederationRuntimeDependency
    >,
  ) {
    super('embed federation', RuntimeModule.STAGE_ATTACH);
    this.bundlerRuntimePath = bundlerRuntimePath;
    this.containerEntrySet = containerEntrySet;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    const { compilation, chunk, chunkGraph, bundlerRuntimePath } = this;
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
    const exportExpr = compilation.runtimeTemplate.exportFromImport({
      moduleGraph: compilation.moduleGraph,
      module: found,
      request: found.request,
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

    return Template.asString([`${initRuntimeModuleGetter}`]);
  }
}

export default EmbedFederationRuntimeModule;
