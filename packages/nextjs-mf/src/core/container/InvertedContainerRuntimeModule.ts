import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

interface InvertedContainerRuntimeModuleOptions {
  containers: Set<any>;
}

class InvertedContainerRuntimeModule extends RuntimeModule {
  private options: InvertedContainerRuntimeModuleOptions;

  constructor(options: InvertedContainerRuntimeModuleOptions) {
    super('inverted container startup', RuntimeModule.STAGE_TRIGGER);
    this.options = options;
  }

  override generate(): string {
    const { compilation, chunk, chunkGraph } = this;
    if (!compilation || !chunk || !chunkGraph) {
      return '';
    }

    if (chunk.runtime === 'webpack-api-runtime') {
      return '';
    }

    let containerEntryModule: any;
    for (const containerDep of this.options.containers) {
      const mod = compilation.moduleGraph.getModule(containerDep);
      if (!mod) {
        continue;
      }
      if (chunkGraph.isModuleInChunk(mod, chunk)) {
        containerEntryModule = mod;
      }
    }

    if (!containerEntryModule) {
      return '';
    }

    if (
      compilation.chunkGraph.isEntryModuleInChunk(containerEntryModule, chunk)
    ) {
      return '';
    }

    const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
      module: containerEntryModule,
      chunkGraph,
      weak: false,
      runtimeRequirements: new Set(),
    });
    const nameJSON = JSON.stringify(containerEntryModule._name);

    return Template.asString([
      `var prevStartup = ${RuntimeGlobals.startup};`,
      'var hasRun = false;',
      'var cachedRemote;',
      `${RuntimeGlobals.startup} = ${compilation.runtimeTemplate.basicFunction(
        '',
        Template.asString([
          'if (!hasRun) {',
          Template.indent(
            Template.asString([
              'hasRun = true;',
              "if (typeof prevStartup === 'function') {",
              Template.indent('prevStartup();'),
              '}',
              `cachedRemote = ${initRuntimeModuleGetter};`,
              `var gs = ${RuntimeGlobals.global} || globalThis;`,
              `gs[${nameJSON}] = cachedRemote;`,
            ]),
          ),
          "} else if (typeof prevStartup === 'function') {",
          Template.indent('prevStartup();'),
          '}',
        ]),
      )};`,
    ]);
  }
}

export default InvertedContainerRuntimeModule;
