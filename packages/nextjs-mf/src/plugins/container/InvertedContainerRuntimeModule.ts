import type Compiler from 'webpack/lib/Compiler';
import type Module from 'webpack/lib/Module';
import RuntimeModule from 'webpack/lib/RuntimeModule';
import { RuntimeGlobals } from 'webpack';

interface InvertedContainerRuntimeModuleOptions {
  runtime: string;
  remotes: Record<string, string>;
  name?: string;
  debug?: boolean;
  container?: string;
}

class InvertedContainerRuntimeModule extends RuntimeModule {
  private options: InvertedContainerRuntimeModuleOptions;

  constructor(
    options: InvertedContainerRuntimeModuleOptions,
  ) {
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
    const entryModules = this.compilation.chunkGraph.getChunkEntryModulesIterable(container);
    return Array.from(entryModules)[0];
  }

  override generate(): string {
    if (!this.compilation || !this.chunk || !this.chunkGraph) {
      return '';
    }



    const { name, debug } = this.options;
    const containerEntryModule = this.resolveContainerModule() as (Module & { _name: string }) | undefined;
    const containerName = containerEntryModule?._name || name;
    const containerModuleId = containerEntryModule?.id || containerEntryModule?.debugId;
    // const hasEnsurechunkHandlers = !this.compilation.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {

    if (!(containerName && containerModuleId)) {
      return '';
    }

    const globalObject = 'global';
    const containerScope = 'window';

    return `
      function attachRemote (resolve) {
        const innerRemote = __webpack_require__(${JSON.stringify(containerModuleId)});
        ${containerScope}[${JSON.stringify(containerName)}] = innerRemote;
        __webpack_require__.I('default',[globalThis.backupScope]);
        if(resolve) resolve(innerRemote);
      }

      try {
        __webpack_require__.own_remote = new Promise(function(resolve, reject){
          __webpack_require__.O(0, ["${this.chunk.id}"], function() {
            attachRemote(resolve);
          }, 0);
        });
      } catch (e) {
        attachRemote(resolve);
        console.error('host runtime was unable to initialize its own remote', e);
      }
    `;
  }
}

export default InvertedContainerRuntimeModule;
