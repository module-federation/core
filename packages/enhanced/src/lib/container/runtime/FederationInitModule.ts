import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { NormalizedRuntimeInitOptionsWithOutShared } from '../../../types/runtime';
import type { Chunk, Compilation, Module } from 'webpack';
import ContainerEntryModule from '../ContainerEntryModule';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationInitModule extends RuntimeModule {
  containerName: string;

  constructor(containerName: string) {
    super('federation runtime init', RuntimeModule.STAGE_ATTACH - 1);
    this.containerName = containerName;
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): ContainerEntryModule | null {
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module instanceof ContainerEntryModule) {
        return module;
      }
    }
    return null;
  }

  getModuleByInstance() {
    const compilation: Compilation = this.compilation!;
    const chunks = compilation.chunks;

    for (const chunk of chunks) {
      if (!chunk.hasRuntime()) continue;
      const hasEntry = this.chunkContainsContainerEntryModule(
        chunk,
        compilation,
      ) as unknown as Module;
      if (hasEntry) {
        return compilation.chunkGraph.getModuleId(hasEntry);
      }
    }
    return null;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    const entryModuleID = this.getModuleByInstance();
    if (!entryModuleID) return null;
    const mfRuntimeModuleID =
      typeof entryModuleID === 'number'
        ? entryModuleID
        : JSON.stringify(entryModuleID);
    return Template.asString([
      'console.log("init runtime")',
      `const mfRuntimeModuleID = ${mfRuntimeModuleID}`,
      '__webpack_require__(mfRuntimeModuleID);',
    ]);
  }
}
export default FederationInitModule;
