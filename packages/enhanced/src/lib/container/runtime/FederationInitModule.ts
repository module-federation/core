import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Chunk, Compilation, Module } from 'webpack';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationInitModule extends RuntimeModule {
  constructor(
    public containerName: string,
    public entryFilePath: string,
  ) {
    super('federation runtime init', RuntimeModule.STAGE_ATTACH);
  }

  private chunkContainsContainerEntryModule(
    chunk: Chunk,
    compilation: Compilation,
  ): Module | null {
    let foundModule = null;
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (module.identifier?.()?.includes('.federation/federation')) {
        foundModule = module;
        break;
      }
    }
    return foundModule;
  }

  getModuleByInstance(): { moduleId: string | number; chunk: Chunk } | null {
    if (!this.compilation || !this.chunk || !this.compilation.chunkGraph)
      return null;
    const currentHasEntry =
      this.chunk.hasRuntime() &&
      this.chunkContainsContainerEntryModule(this.chunk, this.compilation);
    if (currentHasEntry) {
      const moduleId = this.compilation.chunkGraph.getModuleId(currentHasEntry);
      if (moduleId !== undefined) {
        return { moduleId, chunk: this.chunk };
      }
    }
    return null;
  }
  override generate(): string | null {
    if (!this.compilation) return '';
    const runtimePluginEntry = this.compilation.namedChunks.get(
      'mfp-runtime-plugins',
    );
    const entryModule = this.getModuleByInstance();
    if (!entryModule) return null;
    const mfRuntimeModuleID = JSON.stringify(entryModule.moduleId);
    const runtimePluginUrl = runtimePluginEntry
      ? Template.asString([
          `const runtimePluginUrl = __webpack_require__.p + __webpack_require__.u(${JSON.stringify(
            runtimePluginEntry.id,
          )});`,
        ])
      : '';
    const loadRuntimePlugin = runtimePluginUrl
      ? Template.asString([
          `__webpack_require__.l(runtimePluginUrl, function(){`,
          Template.indent(
            `console.log("runtime plugins loaded from script loader");`,
          ),
          `})`,
        ])
      : '';
    return Template.asString([
      `__webpack_require__(${mfRuntimeModuleID});`,
      runtimePluginUrl,
      loadRuntimePlugin,
    ]);
  }
}
export default FederationInitModule;
