import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import FederationRuntimeDependency from './FederationRuntimeDependency';

const NullDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/NullDependency'),
);
const InitFragment = require(normalizeWebpackPath('webpack/lib/InitFragment'));
const RuntimeGlobals = require(
  normalizeWebpackPath('webpack/lib/RuntimeGlobals'),
);

/**
 * Federation runtime dependency variant for worker async blocks.
 * Uses the null dependency template so no source code is emitted when webpack
 * renders the dependency during worker bundling.
 */
class FederationWorkerRuntimeDependency extends FederationRuntimeDependency {
  override get type() {
    return 'federation worker runtime dependency';
  }

  static override Template = class WorkerRuntimeDependencyTemplate extends NullDependency.Template {
    apply(
      dependency: FederationWorkerRuntimeDependency,
      _source: any,
      {
        runtimeTemplate,
        chunkGraph,
        moduleGraph,
        runtimeRequirements,
        chunkInitFragments,
      }: any,
    ) {
      const runtimeModule = moduleGraph.getModule(dependency);
      if (!runtimeModule) {
        return;
      }

      const ownerBlock = moduleGraph.getParentBlock(dependency);
      if (ownerBlock) {
        const chunkGroup = chunkGraph.getBlockChunkGroup(ownerBlock);
        if (chunkGroup) {
          for (const chunk of chunkGroup.chunks) {
            if (!chunkGraph.isModuleInChunk(runtimeModule, chunk)) {
              chunkGraph.connectChunkAndModule(chunk, runtimeModule);
            }
          }
        }
      }

      const moduleSource = runtimeTemplate.moduleRaw({
        module: runtimeModule,
        chunkGraph,
        request: dependency.request,
        weak: false,
        runtimeRequirements,
      });

      runtimeRequirements.add(RuntimeGlobals.require);

      const moduleId = chunkGraph.getModuleId(runtimeModule);
      const fragmentKey = `federation-worker-runtime-${moduleId}`;

      chunkInitFragments.push(
        new InitFragment(
          `${moduleSource};\n`,
          InitFragment.STAGE_ASYNC_BOUNDARY,
          0,
          fragmentKey,
        ),
      );
    }
  };

  static createTemplate() {
    return new this.Template();
  }
}

export default FederationWorkerRuntimeDependency;
