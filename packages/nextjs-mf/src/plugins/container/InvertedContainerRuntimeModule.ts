import type { Chunk, Compiler, Module } from 'webpack';
import { RuntimeModule } from 'webpack';

interface InvertedContainerRuntimeModuleOptions {
  runtime: string;
  remotes: Record<string, string>;
  name?: string;
  debug?: boolean;
  container?: string;
}

interface ChunkLoadingContext {
  webpack: Compiler['webpack'];
  debug?: boolean;
}

class InvertedContainerRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>;
  private options: InvertedContainerRuntimeModuleOptions;
  private chunkLoadingContext: ChunkLoadingContext;

  constructor(
    runtimeRequirements: Set<string>,
    options: InvertedContainerRuntimeModuleOptions,
    chunkLoadingContext: ChunkLoadingContext,
  ) {
    super('inverted container startup', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;
    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  private resolveContainerModule() {
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

  override generate() {
    if (!this.compilation || !this.chunk || !this.chunkGraph) {
      return '';
    }

    const { name } = this.options;
    const { chunkGraph, chunk } = this;
    const { compiler } = this.compilation;

    const { RuntimeGlobals, Template, javascript } = compiler.webpack || {};
    const chunkHasJs =
      javascript?.JavascriptModulesPlugin.chunkHasJs ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    const containerEntryModule = this.resolveContainerModule() as
      | (Module & { _name: string })
      | undefined;

    const isServer = chunk.name === 'webpack-runtime';
    const isApi = chunk.name === 'webpack-api-runtime';

    if (chunk.name !== 'webpack-runtime' && chunk.name !== 'webpack') {
      return Template.asString('');
    }

    const containerEntry = [containerEntryModule].map((module) => {
      const containerName = module?._name || name;
      const containerModuleId = module?.id || module?.debugId;

      if (!(containerName && containerName)) {
        return '';
      }
      //@ts-ignore
      const nodeGlobal = this.compilation.options?.node?.global;
      const globalObject = nodeGlobal
        ? RuntimeGlobals.global || 'global'
        : 'global';
      const containerScope =
        isServer || isApi
          ? [globalObject, "['__remote_scope__']"].join('')
          : 'window';
      const runtimeId = chunk.id;

      const browserContainerKickstart = Template.asString([
        '__webpack_require__.own_remote = new Promise(function(resolve,reject){',
        this.options.debug
          ? 'console.debug("O keys",Object.keys(__webpack_require__.O))'
          : '',
        `__webpack_require__.O(0, [${JSON.stringify(runtimeId)}], function() {`,
        this.options.debug
          ? "console.debug('runtime loaded, replaying all installed chunk requirements');"
          : '',
        'attachRemote(resolve)',
        '},0)',
        '})',
      ]);

      return Template.asString([
        'globalThis.usedChunks = globalThis.usedChunks || new Set();',
        'globalThis.backupScope = globalThis.backupScope || {};',
        '__webpack_require__.S = globalThis.backupScope;',
        '__webpack_require__.initConsumes = __webpack_require__.initConsumes || [];',
        '__webpack_require__.initRemotes = __webpack_require__.initRemotes || [];',
        '__webpack_require__.installedModules = {};',
        true ? "console.debug('share scope', __webpack_require__.S);" : '',
        `if(${containerScope} === undefined) {`,
        this.options.debug
          ? `console.debug('container scope is empty, initializing');`
          : '',
        `${containerScope} = {_config: {}}
        };`,
        Template.asString([
          'function attachRemote (resolve) {',
          Template.indent([
            `const innerRemote = __webpack_require__(${JSON.stringify(
              containerModuleId,
            )});`,
            `${containerScope}[${JSON.stringify(
              containerName,
            )}] = innerRemote;`,
            "__webpack_require__.I('default',[globalThis.backupScope]);",
            this.options.debug
              ? "console.debug('remote attached', innerRemote);"
              : '',
            'if(resolve) resolve(innerRemote)',
          ]),
          '}',
        ]),
        'try {',
        isServer ? '' : browserContainerKickstart,
        '} catch (e) {',
        "console.error('host runtime was unable to initialize its own remote', e);",
        '}',
      ]);
    });
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;
