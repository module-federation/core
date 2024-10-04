/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import type { Module, ChunkGraph, Compilation, Chunk } from 'webpack';
import ConsumeSharedModule from './ConsumeSharedModule';
import { getFederationGlobalScope } from '../container/runtime/utils';

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ConsumeSharedRuntimeModule extends RuntimeModule {
  private _runtimeRequirements: ReadonlySet<string>;

  /**
   * @param {ReadonlySet<string>} runtimeRequirements runtime requirements
   */
  constructor(runtimeRequirements: ReadonlySet<string>) {
    super('consumes', RuntimeModule.STAGE_ATTACH);
    this._runtimeRequirements = runtimeRequirements;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    const compilation: Compilation = this.compilation!;
    const chunkGraph: ChunkGraph = this.chunkGraph!;
    const { runtimeTemplate, codeGenerationResults } = compilation;
    const chunkToModuleMapping: Record<string, any> = {};
    const moduleIdToSourceMapping: Map<string | number, string> = new Map();
    const initialConsumes: (string | number)[] = [];
    /**
     *
     * @param {Iterable<Module>} modules modules
     * @param {Chunk} chunk the chunk
     * @param {(string | number)[]} list list of ids
     */
    const addModules = (
      modules: Iterable<Module>,
      chunk: Chunk,
      list: (string | number)[],
    ) => {
      for (const m of modules) {
        const module: ConsumeSharedModule = m as unknown as ConsumeSharedModule;
        // @ts-ignore
        const id = chunkGraph.getModuleId(module);
        list.push(id);
        const moduleGetter = codeGenerationResults.getSource(
          // @ts-ignore
          module,
          chunk.runtime,
          'consume-shared',
        );
        const shareOption = codeGenerationResults.getData(
          // @ts-ignore
          module,
          chunk.runtime,
          'consume-shared',
        );
        const sharedInfoAndHandlerStr = Template.asString([
          '{',
          Template.indent([
            `getter: ${moduleGetter.source().toString()},`,
            `shareInfo: {`,
            Template.indent([
              `shareConfig: ${JSON.stringify(
                shareOption.shareConfig,
                null,
                2,
              )},`,
              `scope: [${JSON.stringify(
                shareOption.shareScope || 'default',
              )}],`,
            ]),
            '},',
            `shareKey: "${shareOption.shareKey}",`,
          ]),
          '}',
        ]);
        moduleIdToSourceMapping.set(id, sharedInfoAndHandlerStr);
      }
    };
    // const chunkReferences = this._runtimeRequirements.has(
    //   'federation-entry-startup',
    // )
    //   ? this.chunk?.getAllReferencedChunks()
    //   : this.chunk?.getAllAsyncChunks();
    //
    // const allChunks = chunkReferences || [];
    const allChunks = [...(this.chunk?.getAllReferencedChunks() || [])];
    for (const chunk of allChunks) {
      const modules = chunkGraph.getChunkModulesIterableBySourceType(
        chunk,
        'consume-shared',
      );
      if (!modules) continue;
      // chunk.id may equal 0
      if (chunk.id === null || (typeof chunk.id === 'string' && !chunk.id))
        continue;

      addModules(
        modules,
        chunk,
        (chunkToModuleMapping[chunk.id.toString()] = []),
      );
    }
    for (const chunk of [...(this.chunk?.getAllInitialChunks() || [])]) {
      const modules = chunkGraph.getChunkModulesIterableBySourceType(
        chunk,
        'consume-shared',
      );
      if (!modules) continue;
      addModules(modules, chunk, initialConsumes);
    }

    if (moduleIdToSourceMapping.size === 0) return null;

    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

    return Template.asString([
      'var installedModules = {};',
      'var moduleToHandlerMapping = {',
      Template.indent(
        Array.from(moduleIdToSourceMapping, ([key, value]) => {
          return `${JSON.stringify(key)}: ${value}`;
        }).join(',\n'),
      ),
      '};',

      initialConsumes.length > 0
        ? Template.asString([
            `var initialConsumes = ${JSON.stringify(initialConsumes)};`,
            `${federationGlobal}.installInitialConsumes = ${runtimeTemplate.returningFunction(
              Template.asString([
                `${federationGlobal}.bundlerRuntime.installInitialConsumes({`,
                Template.indent([
                  'initialConsumes: initialConsumes,',
                  'installedModules:installedModules,',
                  'moduleToHandlerMapping:moduleToHandlerMapping,',
                  `webpackRequire: ${RuntimeGlobals.require}`,
                ]),
                `})`,
              ]),
              '',
            )}`,
          ])
        : '// no consumes in initial chunks',
      this._runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)
        ? Template.asString([
            `var chunkMapping = ${JSON.stringify(
              chunkToModuleMapping,
              null,
              '\t',
            )};`,
            `${
              RuntimeGlobals.ensureChunkHandlers
            }.consumes = ${runtimeTemplate.basicFunction('chunkId, promises', [
              `${federationGlobal}.bundlerRuntime.consumes({`,
              'chunkMapping: chunkMapping,',
              'installedModules: installedModules,',
              'chunkId: chunkId,',
              'moduleToHandlerMapping: moduleToHandlerMapping,',
              'promises: promises,',
              `webpackRequire:${RuntimeGlobals.require}`,
              '});',
            ])}`,
          ])
        : '// no chunk loading of consumes',
    ]);
  }
}

export default ConsumeSharedRuntimeModule;
