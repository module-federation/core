import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Chunk, Compilation, Module } from 'webpack';

const { RuntimeModule, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationInitModule extends RuntimeModule {
  constructor(
    public containerName: string,
    public entryFilePath: string,
    public chunksRuntimePluginsDependsOn: Set<Chunk> | undefined,
  ) {
    super('federation runtime init', RuntimeModule.STAGE_ATTACH);
  }

  private chunkContainsFederationRuntime(
    chunk: Chunk,
    compilation: Compilation,
  ): {
    federationRuntimeModule: Module | null;
    federationRuntimePluginModule: Module | null;
  } {
    let federationRuntimeModule: Module | null = null;
    let federationRuntimePluginModule: Module | null = null;
    for (const module of compilation.chunkGraph.getChunkModulesIterable(
      chunk,
    )) {
      if (
        !federationRuntimeModule &&
        module.identifier?.()?.includes('.federation/federation')
      ) {
        federationRuntimeModule = module;
      } else if (
        !federationRuntimePluginModule &&
        module.identifier?.()?.includes('.federation/plugin')
      ) {
        federationRuntimePluginModule = module;
      }
      if (federationRuntimeModule && federationRuntimePluginModule) break;
    }
    return { federationRuntimeModule, federationRuntimePluginModule };
  }
  getModuleByInstance(): {
    federationRuntimeModuleId: string | number | undefined;
    runtimePluginModuleId: string | number | undefined;
    chunk: Chunk;
  } | null {
    if (
      !this.compilation ||
      !this.chunk ||
      !this.compilation.chunkGraph ||
      !this.chunk.hasRuntime()
    )
      return null;

    const { federationRuntimeModule, federationRuntimePluginModule } =
      this.chunkContainsFederationRuntime(this.chunk, this.compilation);
    let runtimePluginModuleId: string | number | undefined;
    let federationRuntimeModuleId: string | number | undefined;

    if (federationRuntimeModule) {
      federationRuntimeModuleId = this.compilation.chunkGraph.getModuleId(
        federationRuntimeModule,
      );
    }

    if (federationRuntimePluginModule) {
      runtimePluginModuleId = this.compilation.chunkGraph.getModuleId(
        federationRuntimePluginModule,
      );
    }

    return {
      federationRuntimeModuleId,
      runtimePluginModuleId,
      chunk: this.chunk,
    };
  }
  override generate(): string | null {
    if (!this.compilation || !this.chunk) return '';
    const moduleInstance = this.getModuleByInstance();

    const federationRuntimeModuleId = moduleInstance?.federationRuntimeModuleId;
    const runtimePluginModuleId = moduleInstance?.runtimePluginModuleId;

    const requireStatements = [];

    if (federationRuntimeModuleId) {
      requireStatements.push(
        `__webpack_require__(${JSON.stringify(federationRuntimeModuleId)});`,
      );
    }
    const boundaryChunks = this.chunksRuntimePluginsDependsOn;

    if (runtimePluginModuleId && boundaryChunks) {
      const chunkConsumesStatements = Array.from(boundaryChunks)
        .map(
          (chunk) =>
            `__webpack_require__.f.consumes(${JSON.stringify(
              chunk.id || chunk.name,
            )}, consumes);`,
        )
        .join('\n');

      console.log(chunkConsumesStatements);
      requireStatements.push(
        Template.asString([
          `var consumes = [];`,
          `if(__webpack_require__.f && __webpack_require__.f.consumes){`,
          Template.indent(chunkConsumesStatements),
          `}`,
          `Promise.all(consumes).then(function() {`,
          Template.indent([
            `__webpack_require__(${JSON.stringify(runtimePluginModuleId)});`,
          ]),
          `});`,
        ]),
      );
    }

    return Template.asString(requireStatements);
  }
}

export default FederationInitModule;
