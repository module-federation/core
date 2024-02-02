import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Chunk, Compilation, Module } from 'webpack';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationInitModule extends RuntimeModule {
  containerName: string;
  entryFilePath: string;

  constructor(containerName: string, entryFilePath: string) {
    super('federation runtime init', RuntimeModule.STAGE_ATTACH);
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
      if (module.identifier && module.identifier().includes('.federation')) {
        return module;
      }
    }
    return null;
  }

  getModuleByInstance(): { moduleId: string | number; chunk: Chunk } | null {
    if (!this.compilation || !this.chunk || !this.compilation.chunkGraph)
      return null;
    const chunk = this.chunk;
    const currentHasEntry = chunk.hasRuntime()
      ? this.chunkContainsContainerEntryModule(chunk, this.compilation)
      : false;
    if (currentHasEntry) {
      const moduleId = this.compilation.chunkGraph.getModuleId(currentHasEntry);
      if (moduleId !== undefined) {
        return {
          moduleId: moduleId,
          chunk: chunk,
        };
      }
    }
    return null;
  }
  override generate(): string | null {
    if (!this.compilation) return '';
    const entryModule = this.getModuleByInstance();
    if (!entryModule) return null;
    const { moduleId } = entryModule;
    const mfRuntimeModuleID =
      typeof moduleId === 'number' ? moduleId : JSON.stringify(moduleId);
    return Template.asString([
      `const mfRuntimeModuleID = ${mfRuntimeModuleID};`,
      '__webpack_require__(mfRuntimeModuleID)',
    ]);
  }
}

export default FederationInitModule;
