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

class ShareRuntimeModule extends RuntimeModule {
  constructor() {
    // must after FederationRuntimeModule
    super('sharing', RuntimeModule.STAGE_NORMAL + 2);
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
    let sharedInitOptionsStr = '';

    for (const chunk of this.chunk?.getAllReferencedChunks() || []) {
      if (!chunk) {
        continue;
      }
      const modules = chunkGraph.getOrderedChunkModulesIterableBySourceType(
        chunk,
        'share-init',
        // @ts-ignore
        compareModulesByIdentifier,
      );
      if (!modules) continue;
      for (const m of modules) {
        const data = codeGenerationResults.getData(
          m,
          chunk.runtime,
          'share-init',
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
          'share-init-option',
        );
        if (sharedOption) {
          sharedInitOptionsStr += `
					"${sharedOption.name}" : {
						version: ${sharedOption.version},
						get: ${sharedOption.getter},
						scope: ${JSON.stringify(sharedOption.shareScope)},
            shareConfig: ${JSON.stringify(sharedOption.shareConfig)}
					},
					`;
        }
      }
    }
    const federationGlobal = getFederationGlobalScope(
      RuntimeGlobals || ({} as typeof RuntimeGlobals),
    );
    return Template.asString([
      `${getFederationGlobalScope(
        RuntimeGlobals,
      )}.initOptions.shared = {${sharedInitOptionsStr}}`,
      `${RuntimeGlobals.shareScopeMap} = {};`,
      'var initPromises = {};',
      'var initTokens = {};',
      `${RuntimeGlobals.initializeSharing} = ${runtimeTemplate.basicFunction(
        'name, initScope',
        [
          `return ${federationGlobal}.bundlerRuntime.I({${Template.indent([
            `shareScopeName: name,`,
            `webpackRequire: ${RuntimeGlobals.require},`,
            `initPromises: initPromises,`,
            `initTokens: initTokens,`,
            `initScope: initScope,`,
          ])}`,
          '})',
        ],
      )};`,
    ]);
  }
}

export default ShareRuntimeModule;
