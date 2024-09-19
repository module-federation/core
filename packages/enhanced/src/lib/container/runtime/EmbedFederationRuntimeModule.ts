import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { moduleFederationPlugin } from '@module-federation/sdk';
import { getFederationGlobalScope } from './utils';
import type { Chunk, Module, NormalModule as NormalModuleType } from 'webpack';
import ContainerEntryDependency from '../ContainerEntryDependency';
import type FederationRuntimeDependency from './FederationRuntimeDependency';
import { getAllReferencedModules } from '../HoistContainerReferencesPlugin';

const { RuntimeModule, NormalModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimeModule extends RuntimeModule {
  private experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'];
  private containerEntrySet: Set<
    ContainerEntryDependency | FederationRuntimeDependency
  >;

  constructor(
    experiments: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
    containerEntrySet: Set<
      ContainerEntryDependency | FederationRuntimeDependency
    >,
    isHost: boolean,
  ) {
    super('embed federation', RuntimeModule.STAGE_ATTACH - 1);
    this.experiments = experiments;
    this.containerEntrySet = containerEntrySet;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    const { compilation, chunk, chunkGraph, experiments } = this;
    if (!chunk || !chunkGraph || !compilation) {
      return null;
    }

    let found;
    let minimal;
    for (const dep of this.containerEntrySet) {
      const mod = compilation.moduleGraph.getModule(dep);
      if (mod && compilation.chunkGraph.isModuleInChunk(mod, chunk)) {
        //@ts-ignore
        if (dep.minimal) {
          minimal = mod as NormalModuleType;
        } else {
          found = mod as NormalModuleType;
        }
      }
    }

    if (!found && !minimal) {
      return null;
    }

    let initRuntimeModuleGetter = '';

    if (found) {
      initRuntimeModuleGetter = Template.asString([
        compilation.runtimeTemplate.moduleRaw({
          module: found,
          chunkGraph,
          request: found.request,
          weak: false,
          runtimeRequirements: new Set(),
        }),
        'const runtime = __webpack_require__.federation.runtime;',
        'if(!runtime) console.error("shared runtime is not available");',
        `globalThis.sharedRuntime = {
          FederationManager: runtime.FederationManager,
          FederationHost: runtime.FederationHost,
          loadScript: runtime.loadScript,
          loadScriptNode: runtime.loadScriptNode,
          FederationHost: runtime.FederationHost,
          registerGlobalPlugins: runtime.registerGlobalPlugins,
          getRemoteInfo: runtime.getRemoteInfo,
          getRemoteEntry: runtime.getRemoteEntry,
          isHost: true
        }`,
      ]);
    } else if (minimal) {
      initRuntimeModuleGetter = Template.asString([
        '__webpack_require__.federation.sharedRuntime = globalThis.sharedRuntime;',
        compilation.runtimeTemplate.moduleRaw({
          module: minimal,
          chunkGraph,
          request: minimal.request,
          weak: false,
          runtimeRequirements: new Set(),
        }),
      ]);
    }

    return Template.asString([
      initRuntimeModuleGetter,
      // 'console.log(__webpack_require__.federation)',
      // `federation = ${exportExpr}`,
      // `var prevFederation = ${federationGlobal};`,
      // `${federationGlobal} = {};`,
      // `for (var key in federation) {`,
      // Template.indent(`${federationGlobal}[key] = federation[key];`),
      // `}`,
      // `for (var key in prevFederation) {`,
      // Template.indent(`${federationGlobal}[key] = prevFederation[key];`),
      // `}`,
      // 'federation = undefined;'
    ]);
  }
}

export default EmbedFederationRuntimeModule;
