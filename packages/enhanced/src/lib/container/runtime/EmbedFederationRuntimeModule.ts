import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from './utils';
import type {
  Chunk,
  Module,
  Dependency,
  NormalModule as NormalModuleType,
} from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import { getAllReferencedModules } from '../HoistContainerReferencesPlugin';
import ContainerEntryModule from '../ContainerEntryModule';

const { RuntimeModule, NormalModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

class EmbedFederationRuntimeModule extends RuntimeModule {
  private experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'];
  private containerEntryDependencies: Set<Dependency>;

  constructor(
    containerEntryDependencies: Set<Dependency>,
    experiments?: moduleFederationPlugin.ModuleFederationPluginOptions['experiments'],
  ) {
    super('EmbedFederationRuntimeModule', RuntimeModule.STAGE_ATTACH);
    this.containerEntryDependencies = containerEntryDependencies;
    this.experiments = experiments;
  }

  override identifier() {
    return 'webpack/runtime/embed/federation';
  }

  override generate(): string | null {
    const { compilation, chunk, chunkGraph } = this;
    if (!chunk || !chunkGraph || !compilation) {
      return null;
    }

    let found: NormalModuleType | null | undefined;
    for (const dep of this.containerEntryDependencies) {
      const mod = compilation.moduleGraph.getModule(dep);
      if (mod && chunkGraph.isModuleInChunk(mod, chunk)) {
        const federationEntry = compilation.moduleGraph.getModule(
          mod.dependencies[1],
        );
        if (federationEntry) {
          //get bundler runtime .federation/entry
          found = compilation.moduleGraph.getModule(
            federationEntry.dependencies[0],
          ) as NormalModuleType;
          break;
        }
      }
    }

    if (!found) {
      return null;
    }

    const moduleReferences = new Set();
    let isRemoteChunk = false;

    const allRefs = getAllReferencedModules(compilation, found, 'initial');
    for (const refMod of allRefs) {
      moduleReferences.add(chunkGraph.getModuleId(refMod));
    }

    const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
      module: found,
      chunkGraph,
      request: found.resource,
      weak: false,
      runtimeRequirements: new Set(),
    });

    const exportExpr = compilation.runtimeTemplate.exportFromImport({
      moduleGraph: compilation.moduleGraph,
      module: found,
      request: found.resource,
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

    let runtimeFactories = '';
    let federationRuntimeGetter = '';
    if (this.experiments?.federationRuntime === 'use-host') {
      for (const mod of chunkGraph.getChunkEntryModulesIterable(chunk)) {
        if (mod instanceof ContainerEntryModule) {
          isRemoteChunk = true;
          break;
        }
      }

      if (isRemoteChunk) {
        runtimeFactories = Template.asString([
          'var factoryKeys = Object.keys(globalThis.federationRuntimeModuleFactories || {});',
          'for(var i = 0; i < factoryKeys.length; i++) {',
          Template.indent([
            `var factory = globalThis.federationRuntimeModuleFactories[factoryKeys[i]];`,
            `${RuntimeGlobals.moduleFactories}[factoryKeys[i]] = factory;`,
          ]),
          '}',
        ]);

        federationRuntimeGetter = Template.asString([
          'if(!factoryKeys[0]) { throw new Error("shared federation runtime factories missing")}',
          `var federation = __webpack_require__(factoryKeys[0]).default;`,
        ]);
      } else {
        runtimeFactories = Template.asString([
          'var runtimeFactoriesArray = ' +
            JSON.stringify(Array.from(moduleReferences)) +
            ';',
          'var runtimeFactories = runtimeFactoriesArray.reduce((acc, id) => {',
          Template.indent([
            'acc[id] = ' + RuntimeGlobals.moduleFactories + '[id];',
            'return acc;',
          ]),
          '}, {});',
          'globalThis.federationRuntimeModuleFactories = runtimeFactories;',
        ]);
        federationRuntimeGetter = Template.asString([
          `var federation = ${initRuntimeModuleGetter};`,
          `federation = ${exportExpr}`,
        ]);
      }
    } else {
      runtimeFactories = Template.asString([
        'var runtimeFactoriesArray = ' +
          JSON.stringify(Array.from(moduleReferences)) +
          ';',
        'var runtimeFactories = runtimeFactoriesArray.reduce((acc, id) => {',
        Template.indent(
          'acc[id] = ' + RuntimeGlobals.moduleFactories + '[id];',
        ),
        Template.indent('return acc;'),
        '}, {});',
        'globalThis.federationRuntimeModuleFactories = runtimeFactories;',
      ]);
      federationRuntimeGetter = Template.asString([
        `var federation = ${initRuntimeModuleGetter};`,
        `federation = ${exportExpr}`,
      ]);
    }

    return Template.asString([
      runtimeFactories,
      '\n',
      federationRuntimeGetter,
      '\n',
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
}

export default EmbedFederationRuntimeModule;
