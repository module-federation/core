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
    super('inverted container startup', RuntimeModule.STAGE_ATTACH + 3);
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
  private generateSharedObjectString(): string {
    const sharedObjects = [
      {
        key: 'react',
        version: require('react/package.json').version,
        path: './react',
      },
      {
        key: 'next/router',
        version: require('next/package.json').version,
        path: './next/router',
      },
      {
        key: 'react-dom',
        version: require('react-dom/package.json').version,
        path: './react-dom',
      },
    ];

    return sharedObjects.reduce((acc, obj) => {
      return (
        acc +
        `
        "${obj.key}": {
          "${obj.version}": {
            loaded: true,
            loaded: 1,
            from: "roothost",
            get() { return innerRemote.get("${obj.path}") }
          }
        },`
      );
    }, '');
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
    // const hasEnsurechunkHandlers = !this.compilation.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {
    const isPartialContainer = chunk.runtime === this.options.runtime;
    if (!(containerName && containerModuleId) || !isPartialContainer) {
      return '';
    }
    const globalObject = `globalThis.__remote_scope__`;
    const containerScope = `${RuntimeGlobals.global}`;
    const sharedObjectString = this.generateSharedObjectString();

    return Template.asString([
      'var innerRemote;',
      Template.indent([
        'function attachRemote (resolve) {',
        `  innerRemote = __webpack_require__(${JSON.stringify(
          containerModuleId,
        )});`,
        `  if(${globalObject} && !${globalObject}[${JSON.stringify(name)}]) {`,
        `    ${globalObject}[${JSON.stringify(name)}] = innerRemote;`,
        `  } else if(${containerScope} && !${containerScope}[${JSON.stringify(
          name,
        )}]) {`,
        `    ${containerScope}[${JSON.stringify(name)}] = innerRemote;`,
        '  }',
        `  __webpack_require__.S.default = new Proxy({${sharedObjectString}}`,
        ' , {',
        '    get: function(target, property) {',
        '      return target[property];',
        '    },',
        '    set: function(target, property, value) {',
        '      target[property] = value;',
        '      return true;',
        '    }',
        '  });',
        '  if(resolve) resolve(innerRemote);',
        '}',
      ]),
      `if(!(${globalObject} && ${globalObject}[${JSON.stringify(
        name,
      )}]) && !(${containerScope} && ${containerScope}[${JSON.stringify(
        name,
      )}])) {`,
      Template.indent([
        '  if (__webpack_require__.O) {',
        `  __webpack_require__.O(0, ["${this.chunk.id}"], function() {`,
        '    attachRemote();',
        '  }, 0);',
        '} else {',
        'attachRemote();',
        '}',
      ]),
      '}',
    ]);
  }
}

export default InvertedContainerRuntimeModule;
