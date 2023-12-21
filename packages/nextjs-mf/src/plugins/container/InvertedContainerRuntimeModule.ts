import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Module } from 'webpack';
import { ContainerEntryModule } from '@module-federation/enhanced';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

interface InvertedContainerRuntimeModuleOptions {
  name?: string;
}

class InvertedContainerRuntimeModule extends RuntimeModule {
  private options: InvertedContainerRuntimeModuleOptions;

  constructor(options: InvertedContainerRuntimeModuleOptions) {
    super('inverted container startup', RuntimeModule.STAGE_TRIGGER);
    this.options = options;
  }

  private findEntryModuleOfContainer(): Module | undefined {
    if (!this.chunk || !this.chunkGraph) return undefined;
    const modules = this.chunkGraph.getChunkModules(this.chunk);
    return Array.from(modules).find(
      (module) => module instanceof ContainerEntryModule,
    );
  }

  override generate(): string {
    if (!this.compilation || !this.chunk || !this.compilation.chunkGraph) {
      return '';
    }

    const { name } = this.options;
    const containerEntryModule = this.findEntryModuleOfContainer() as
      | Module
      | undefined;

    const containerModuleId = containerEntryModule
      ? this.compilation.chunkGraph.getModuleId(containerEntryModule)
      : false;

    if (!containerModuleId) {
      return '';
    }

    const containerModuleIdJSON = JSON.stringify(containerModuleId);
    const nameJSON = JSON.stringify(name);

    return Template.asString([
      `var innerRemote;`,
      `function attachRemote (resolve) {`,
      Template.indent([
        `if(__webpack_require__.m[${containerModuleIdJSON}]) {`,
        Template.indent(
          `innerRemote = __webpack_require__(${containerModuleIdJSON});`,
        ),
        `}`,
        `var gs = ${RuntimeGlobals.global} || globalThis`,
        `gs[${nameJSON}] = innerRemote`,
        `if(resolve) resolve(innerRemote);`,
        `return innerRemote;`,
      ]),
      `};`,
      `${RuntimeGlobals.require}.federation.attachRemote = attachRemote;`,
      `attachRemote();`,
    ]);
  }
}

export default InvertedContainerRuntimeModule;
