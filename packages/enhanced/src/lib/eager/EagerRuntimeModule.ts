/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation, ChunkGraph } from 'webpack';
import { getFederationGlobalScope } from '../container/runtime/utils';

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { compareModulesByIdentifier, compareStrings } = require(
  normalizeWebpackPath('webpack/lib/util/comparators'),
) as typeof import('webpack/lib/util/comparators');

class EagerRuntimeModule extends RuntimeModule {
  constructor() {
    // must after FederationRuntimeModule
    super('eager', RuntimeModule.STAGE_ATTACH);
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    const compilation: Compilation | undefined = this.compilation;
    if (!compilation) {
      throw new Error('Compilation is undefined');
    }
    const {
      runtimeTemplate,
      codeGenerationResults,
      outputOptions: { uniqueName, ignoreBrowserWarnings },
    } = compilation;
    const chunkGraph: ChunkGraph | undefined = this.chunkGraph;
    if (!chunkGraph) {
      throw new Error('ChunkGraph is undefined');
    }
    const initCodePerScope: Map<string, Map<number, Set<string>>> = new Map();
    const sharedInitOptionsStr = [];

    for (const chunk of this.chunk?.getAllReferencedChunks() || []) {
      if (!chunk) {
        continue;
      }
      const modules = chunkGraph.getOrderedChunkModulesIterableBySourceType(
        chunk,
        'eager-init',
        // @ts-ignore
        compareModulesByIdentifier,
      );

      if (!modules) continue;
      for (const m of modules) {
        const data = codeGenerationResults.getData(
          m,
          chunk.runtime,
          'eager-init',
        );
        if (!data) continue;
        for (const item of data) {
          const { shareScope, initStage, init } = item;
          let stages = initCodePerScope.get(shareScope);
          if (stages === undefined) {
            initCodePerScope.set(shareScope, (stages = new Map()));
          }
          let list = stages.get(initStage || 0);
          if (list === undefined) {
            stages.set(initStage || 0, (list = new Set()));
          }
          list.add(init);
        }
        const sharedOption = codeGenerationResults.getData(
          m,
          chunk.runtime,
          'eager-init-option',
        );
        if (sharedOption) {
          sharedInitOptionsStr.push(sharedOption.getter);
        }
      }
    }
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );
    const currentChunk = this.chunk;
    const hasShared =
      currentChunk &&
      compilation.chunkGraph.getChunkModulesIterableBySourceType(
        currentChunk,
        'consume-shared',
      );

    const chunkEnsure =
      hasShared && currentChunk?.id
        ? `if(${RuntimeGlobals.ensureChunkHandlers} && ${
            RuntimeGlobals.ensureChunkHandlers
          }.consumes){ ${
            RuntimeGlobals.ensureChunkHandlers
          }.consumes(${JSON.stringify(currentChunk.id)}, promises);}`
        : '';

    return Template.asString([
      `
  // Define eagerBoot with initialization options and initialize promises with a resolved promise
  var eagerBoot = [${sharedInitOptionsStr.join(',')}];
  var promises = [];

  eagerBoot.forEach(function(initFunctionFactory, index) {
    // Invoke the factory function to get the initialization function
    const initFunction = initFunctionFactory();

    if (index === 0) {
      // Immediately execute the first initialization function
      initFunction();
      // If there's chunkEnsure logic for the first item, include it here
       ${chunkEnsure}
    } else {
      // For subsequent items, ensure all existing promises are resolved before execution
      if(promises.length > 0) {
         Promise.all(promises).then(function(){initFunction()});
      } else {
        initFunction();
      }
    }
  });
  `,
    ]);
  }
}

export default EagerRuntimeModule;
