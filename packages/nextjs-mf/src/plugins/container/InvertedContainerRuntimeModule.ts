import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Module } from 'webpack';
import { container } from '@module-federation/enhanced';
import type ContainerEntryModule from '@module-federation/enhanced/src/lib/container/ContainerEntryModule';
const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

interface InvertedContainerRuntimeModuleOptions {
  name?: string;
  containers: Set<any>; // Adjust the type as necessary
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
    let containerEntryModule;
    for (const containerDep of this.options.containers) {
      const mod = compilation.moduleGraph.getModule(containerDep);
      if (!mod) continue;
      if (chunkGraph.isModuleInChunk(mod, chunk)) {
        containerEntryModule = mod as ContainerEntryModule;
      }
    }

    if (!containerEntryModule) return '';

    if (
      compilation.chunkGraph.isEntryModuleInChunk(containerEntryModule, chunk)
    ) {
      // dont apply to remote entry itself
      return '';
    }
    const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
      module: containerEntryModule,
      chunkGraph,
      weak: false,
      runtimeRequirements: new Set(),
    });

    //@ts-ignore
    const nameJSON = JSON.stringify(containerEntryModule._name);

    return Template.asString([
      `var innerRemote;`,
      `function attachRemote () {`,
      Template.indent([
        `innerRemote = ${initRuntimeModuleGetter};`,
        `var gs = ${RuntimeGlobals.global} || globalThis`,
        `gs[${nameJSON}] = innerRemote`,
        `return innerRemote;`,
      ]),
      `};`,
      `attachRemote();`,
    ]);
  }
}

export default InvertedContainerRuntimeModule;
