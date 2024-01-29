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
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      //@ts-ignore
      if (
        typeof module.identifier === 'function' &&
        module.identifier().includes(this.entryFilePath)
      ) {
        return module;
      }
    }
    return null;
  }

  getModuleByInstance() {
    const compilation: Compilation = this.compilation!;
    const chunks = compilation.chunks;

    for (const chunk of chunks) {
      const hasEntry = this.chunkContainsContainerEntryModule(
        chunk,
        compilation,
      ) as unknown as Module;
      if (hasEntry) {
        return {
          moduleId: compilation.chunkGraph.getModuleId(hasEntry),
          chunk,
        };
      }
    }
    return null;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    const entryModule = this.getModuleByInstance();
    if (!entryModule) return null;
    const { moduleId, chunk } = entryModule;
    const mfRuntimeModuleID =
      typeof moduleId === 'number' ? moduleId : JSON.stringify(moduleId);
    const thisChunk = this;
    console.log(thisChunk);
    debugger;
    return Template.asString([
      `const mfRuntimeModuleID = ${mfRuntimeModuleID}`,
      '__webpack_require__(mfRuntimeModuleID);',
    ]);
  }
}
export default FederationInitModule;
