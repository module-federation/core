/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import * as RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import RuntimeModule = require('webpack/lib/RuntimeModule');
import Template = require('webpack/lib/Template');
import Compilation from 'webpack/lib/Compilation';
import ChunkGraph from 'webpack/lib/ChunkGraph';
import {
  compareModulesByIdentifier,
  compareStrings,
} from 'webpack/lib/util/comparators';

/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/Compilation")} Compilation */

class ShareRuntimeModule extends RuntimeModule {
  constructor() {
    super('sharing');
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
    for (const chunk of this.chunk?.getAllReferencedChunks() || []) {
      if (!chunk) {
        continue;
      }
      const modules = chunkGraph.getOrderedChunkModulesIterableBySourceType(
        chunk,
        'share-init',
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
      }
    }
    return Template.asString([
      `${RuntimeGlobals.shareScopeMap} = {};`,
      'var initPromises = {};',
      'var initTokens = {};',
      `${RuntimeGlobals.initializeSharing} = ${runtimeTemplate.basicFunction(
        'name, initScope',
        [
          'if(!initScope) initScope = [];',
          '// handling circular init calls',
          'var initToken = initTokens[name];',
          'if(!initToken) initToken = initTokens[name] = {};',
          'if(initScope.indexOf(initToken) >= 0) return;',
          'initScope.push(initToken);',
          '// only runs once',
          'if(initPromises[name]) return initPromises[name];',
          '// creates a new share scope if needed',
          `if(!${RuntimeGlobals.hasOwnProperty}(${RuntimeGlobals.shareScopeMap}, name)) ${RuntimeGlobals.shareScopeMap}[name] = {};`,
          '// runs all init snippets from all modules reachable',
          `var scope = ${RuntimeGlobals.shareScopeMap}[name];`,
          `var warn = ${
            ignoreBrowserWarnings
              ? runtimeTemplate.basicFunction('', '')
              : runtimeTemplate.basicFunction('msg', [
                  'if (typeof console !== "undefined" && console.warn) console.warn(msg);',
                ])
          };`,
          `var uniqueName = ${JSON.stringify(uniqueName || undefined)};`,
          `var register = ${runtimeTemplate.basicFunction(
            'name, version, factory, eager',
            [
              'var versions = scope[name] = scope[name] || {};',
              'var activeVersion = versions[version];',
              'if(!activeVersion || (!activeVersion.loaded && (!eager != !activeVersion.eager ? eager : uniqueName > activeVersion.from))) versions[version] = { get: factory, from: uniqueName, eager: !!eager };',
            ],
          )};`,
          `var initExternal = ${runtimeTemplate.basicFunction('id', [
            `var handleError = ${runtimeTemplate.expressionFunction(
              'warn("Initialization of sharing external failed: " + err)',
              'err',
            )};`,
            'try {',
            Template.indent([
              `var module = ${RuntimeGlobals.require}(id);`,
              'if(!module) return;',
              `var initFn = ${runtimeTemplate.returningFunction(
                `module && module.init && module.init(${RuntimeGlobals.shareScopeMap}[name], initScope)`,
                'module',
              )}`,
              'if(module.then) return promises.push(module.then(initFn, handleError));',
              'var initResult = initFn(module);',
              "if(initResult && initResult.then) return promises.push(initResult['catch'](handleError));",
            ]),
            '} catch(err) { handleError(err); }',
          ])}`,
          'var promises = [];',
          'switch(name) {',
          ...Array.from(initCodePerScope)
            .sort(([a], [b]) => compareStrings(a, b))
            .map(([name, stages]) =>
              Template.indent([
                `case ${JSON.stringify(name)}: {`,
                Template.indent(
                  Array.from(stages)
                    .sort(([a], [b]) => a - b)
                    .map(([, initCode]) =>
                      Template.asString(Array.from(initCode)),
                    ),
                ),
                '}',
                'break;',
              ]),
            ),
          '}',
          'if(!promises.length) return initPromises[name] = 1;',
          `return initPromises[name] = Promise.all(promises).then(${runtimeTemplate.returningFunction(
            'initPromises[name] = 1',
          )});`,
        ],
      )};`,
    ]);
  }
}

export default ShareRuntimeModule;
