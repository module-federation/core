import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';
import type { Chunk, Compilation, Module } from 'webpack';
import ContainerEntryModule from '../ContainerEntryModule';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationInitModule extends RuntimeModule {
  containerName: string;
  entryFilePath: string;

  constructor(containerName: string, entryFilePath: string) {
    super('federation runtime init', RuntimeModule.STAGE_TRIGGER);
    this.containerName = containerName;
    this.entryFilePath = entryFilePath;
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): Module | null {
    const chunkEntryModule =
      compilation.chunkGraph.getChunkEntryModulesIterable(chunk);

    const modChunks = compilation.chunkGraph.getChunkModulesIterable(chunk);
    let mod = null;

    console.log(chunkEntryModule);
    console.log(chunkEntryModule);
    console.log(chunkEntryModule);
    debugger;
    for (const module of modChunks) {
      //@ts-ignore
      if (
        typeof module.identifier === 'function' &&
        module.identifier().includes('.federation')
      ) {
        mod = module;
        break;
      }
    }
    return mod;
  }

  getModuleByInstance() {
    const compilation: Compilation = this.compilation!;
    const thisChunk = this.chunk;
    //@ts-ignore
    const federationRuntimeEntry =
      this.compilation.namedChunks.get('federation-runtime');
    const chunks = compilation.chunks;
    const currentHasEntry = this.chunkContainsContainerEntryModule(
      //@ts-ignore
      federationRuntimeEntry,
      compilation,
    ) as unknown as Module;

    if (currentHasEntry) {
      return {
        moduleId: compilation.chunkGraph.getModuleId(currentHasEntry),
        chunk: federationRuntimeEntry,
      };
    }
    return null;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    if (!this.compilation) return '';
    const entryModule = this.getModuleByInstance();
    if (!entryModule) return null;
    const { moduleId, chunk } = entryModule;
    const mfRuntimeModuleID =
      typeof moduleId === 'number' ? moduleId : JSON.stringify(moduleId);
    let wrapCall;
    // if (this.chunk && this.chunk.id) {
    //   wrapCall = chunk.id !== this.chunk.id;
    // }
    return Template.asString([
      wrapCall ? 'console.log("wrap")' : '',
      `const mfRuntimeModuleID = ${mfRuntimeModuleID}`,
      '__webpack_require__(mfRuntimeModuleID);',
    ]);
  }
}

export default FederationInitModule;
