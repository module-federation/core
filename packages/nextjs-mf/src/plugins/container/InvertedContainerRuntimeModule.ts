import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Module } from 'webpack';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
interface InvertedContainerRuntimeModuleOptions {
  runtime: string;
  remotes: Record<string, string>;
  name?: string;
  debug?: boolean;
  container?: string;
}

class InvertedContainerRuntimeModule extends RuntimeModule {
  private options: InvertedContainerRuntimeModuleOptions;

  constructor(options: InvertedContainerRuntimeModuleOptions) {
    super('inverted container startup', RuntimeModule.STAGE_ATTACH);
    this.options = options;
  }

  private resolveContainerModule(): Module | undefined {
    if (!this.compilation) {
      return;
    }
    const container = this.compilation.entrypoints
      .get(this.options.container as string)
      ?.getRuntimeChunk();
    if (!container) {
      return;
    }
    const entryModules =
      this.compilation.chunkGraph.getChunkEntryModulesIterable(container);
    return Array.from(entryModules)[0];
  }

  override generate(): string {
    if (!this.compilation || !this.chunk || !this.chunkGraph) {
      return '';
    }

    const { name, debug } = this.options;
    const containerEntryModule = this.resolveContainerModule() as
      | (Module & { _name: string })
      | undefined;
    const containerName = containerEntryModule?._name || name;
    const chunk = this.chunk;

    const containerModuleId =
      containerEntryModule?.id || containerEntryModule?.debugId;
    const isPartialContainer = chunk.runtime === this.options.runtime;
    if (!(containerName && containerModuleId) || !isPartialContainer) {
      return '';
    }
    const globalObject = `globalThis.__remote_scope__`;
    const containerScope = `${RuntimeGlobals.global}`;

    return Template.asString([
      'var innerRemote;',
      Template.indent([
        'function attachRemote (resolve) {',
        `if(__webpack_require__.m[${JSON.stringify(containerModuleId)}]) {`,
        Template.indent(
          `innerRemote = __webpack_require__(${JSON.stringify(
            containerModuleId,
          )});`,
        ),
        `}`,
        // can likely remove this logic
        `  if(${globalObject} && !${globalObject}[${JSON.stringify(name)}]) {`,
        `    ${globalObject}[${JSON.stringify(name)}] = innerRemote;`,
        `  } else if(${containerScope} && !${containerScope}[${JSON.stringify(
          name,
        )}]) {`,
        `    ${containerScope}[${JSON.stringify(name)}] = innerRemote;`,
        '  }',
        '  if(resolve) resolve(innerRemote);',
        '}',
      ]),
      Template.indent([
        '  if (__webpack_require__.O) {',
        `  __webpack_require__.O(0, ["${this.chunk.id}"], function() {`,
        '    attachRemote();',
        '  }, 0);',
        '} else {',
        'attachRemote();',
        '}',
      ]),
    ]);
  }
}

export default InvertedContainerRuntimeModule;
