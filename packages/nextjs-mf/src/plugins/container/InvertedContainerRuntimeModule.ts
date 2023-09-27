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

  constructor(options: InvertedContainerRuntimeModuleOptions) {
    super('inverted container startup', RuntimeModule.STAGE_BASIC);
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
    // const hasEnsurechunkHandlers = !this.compilation.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {
    const isPartialContainer = chunk.runtime === this.options.runtime;
    if (!(containerName && containerModuleId) || !isPartialContainer) {
      return '';
    }
    const globalObject = `globalThis.__remote_scope__`;
    const containerScope = `${RuntimeGlobals.global}`;

    return `
      function attachRemote (resolve) {
        const innerRemote = __webpack_require__(${JSON.stringify(
          containerModuleId,
        )});
        console.log({innerRemote, name: ${RuntimeGlobals.runtimeId}})
        if(${globalObject} && !${globalObject}[${JSON.stringify(name)}]) {
          ${globalObject}[${JSON.stringify(name)}] = innerRemote;
        } else if(${containerScope} && !${containerScope}[${JSON.stringify(
          name,
        )}]) {
          ${containerScope}[${JSON.stringify(name)}] = innerRemote;
        }
        __webpack_require__.S.default = new Proxy({}, {
          get: function(target, property) {
            if(typeof target[property] === 'object' && target[property] !== null) {
              for(const key in target[property]) {
                if(property.startsWith('next/') || property.startsWith('react') || property.startsWith('next-dom')) {
                  target[property][key].loaded = true
                }
              }
            }
            
            return target[property];
          },
          set: function(target, property, value) {
            if(!target[property]) {
            target[property] = value;
            }
            return true;
          }
        });
        
        if(resolve) resolve(innerRemote);
      }
      if(!(${globalObject} && ${globalObject}[${JSON.stringify(
        name,
      )}]) && !(${containerScope} && ${containerScope}[${JSON.stringify(
        name,
      )}])) {
        if (__webpack_require__.O) {
        __webpack_require__.O(0, ["${this.chunk.id}"], function() {
          attachRemote();
        }, 0);
      } else {
        attachRemote();
      }
    }
    `;
  }
}

export default InvertedContainerRuntimeModule;
