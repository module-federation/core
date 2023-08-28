'use strict';

const { RuntimeGlobals } = require('webpack');
const { RuntimeModule } = require('webpack');
const { Template } = require('webpack');

/** @typedef {import("./VmokRemoteModule")} VmokRemoteModule */

class EnsureRemoteRuntimeModule extends RuntimeModule {
  constructor() {
    super('ensure remotes module', RuntimeModule.STAGE_TRIGGER - 1);
  }

  /**
   * @returns {string} runtime code
   */
  // eslint-disable-next-line max-lines-per-function
  generate() {
    const { compilation, chunkGraph, _targetType } = this;
    const { runtimeTemplate, moduleGraph } = compilation;
    const chunkToRemotesMapping = {};
    const idToExternalAndNameMapping = {};
    const syncChunks = [];
    const recordChunkMaping = (type, chunks) => {
      for (const chunk of chunks) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'remote',
        );
        if (!modules) {
          continue;
        }
        // eslint-disable-next-line no-multi-assign
        const remotes = (chunkToRemotesMapping[chunk.id] = []);
        for (const m of modules) {
          const module = /** @type {VmokRemoteModule} */ (m);
          const name = module.internalRequest;
          const id = chunkGraph.getModuleId(module);
          const { shareScope } = module;
          const dep = module.dependencies[0];
          const externalModule = moduleGraph.getModule(dep);
          const externalModuleId =
            externalModule && chunkGraph.getModuleId(externalModule);
          remotes.push(id);
          syncChunks.push(id);
          idToExternalAndNameMapping[id] = [
            shareScope,
            module.remoteName,
            name,
            externalModuleId,
          ];
          // if (type === 'sync') {
          //   syncChunkToRemotesMapping[id] = syncChunkToRemotesMapping[id] || [];
          //   syncChunkToRemotesMapping[id].push(id);
          // }
        }
      }
    };
    const runtimeRequirements = new Set([
      RuntimeGlobals.definePropertyGetters,
      RuntimeGlobals.hasOwnProperty,
      RuntimeGlobals.exports,
    ]);
    recordChunkMaping('sync', this.chunk.getAllInitialChunks());

    const findTagetModuleAndChunk = (chunks, type) => {
      let targetModule, targetChunk;
      for (const chunk of chunks) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'javascript',
        );
        if (!modules) {
          continue;
        }
        for (const m of modules) {

          console.log(m);
          if (
            m.resourceResolveData?.descriptionFileData?.name ===
              '@vmok/entry-kit' &&
            !m.request.includes('remote-entry-template')
          ) {
            targetModule = m;
            targetChunk = chunk;
            break;
          }
        }
        if (targetModule) {
          break;
        }
      }
      if (targetModule) {
        return [targetModule, targetChunk, type];
      }
      return undefined;
    };
    // TODO: TOBE optiomized
    const initialTemplateModuleAndChunk =
      findTagetModuleAndChunk(this.chunk.getAllInitialChunks(), 'initial') ||
      findTagetModuleAndChunk(this.chunk.getAllAsyncChunks(), 'async');

    const [
      initialTemplateModule,
      initialTemplateModuleChunk,
      initialTemplateModuleType,
    ] = initialTemplateModuleAndChunk || [];

    // let requireInitialTemplateModule = '';
    // if(initialTemplateModule){

    // }

    // chunkGraph.getChunkEntryModulesWithChunkGroupIterable(this.chunk)
    const requireInitialTemplateModule = `${RuntimeGlobals.ensureChunk}(${
      Number.isNaN(Number(initialTemplateModuleChunk.id)) ?
        `'${initialTemplateModuleChunk.id}'` :
        initialTemplateModuleChunk.id
    })`;
    const initialTemplateModuleId = runtimeTemplate.moduleId({
      module: initialTemplateModule,
      chunkGraph,
      request: initialTemplateModule.request,
      weak: false,
    });
    // if (_targetType === TargetType.NODE) {
    //   recordChunkMaping('sync', this.chunk.getAllInitialChunks());
    // }
    // const nodeTemplate =
    //   _targetType === TargetType.NODE ?
    //       [
    //         `Object.keys(${syncChunks.join(',\n')}).forEach(id=>{`,
    //         Template.indent([
    //           `if(!${RuntimeGlobals.hasOwnProperty}(__webpack_modules__, id)) {`,
    //           Template.indent([
    //             `__webpack_modules__[id] = ${runtimeTemplate.basicFunction(
    //               'module',
    //               [
    //                 'var remoteModuleName =  idToExternalAndNameMapping[id][1] + idToExternalAndNameMapping[id][2].slice(1)',
    //                 `module.exports = ${RuntimeGlobals.require}.vmok.instance.loadRemote(remoteModuleName);`,
    //               ],
    //             )}`,
    //           ]),
    //           '}',
    //         ]),
    //         '})',
    //       ] :
    //       [];

    return Template.asString([
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        '\t',
      )};`,
      `var next = ${RuntimeGlobals.startup};`,
      `${RuntimeGlobals.startup} = ${runtimeTemplate.basicFunction('', [
        `return ${requireInitialTemplateModule}.then(()=>{`,
        Template.indent([
          // `__webpack_require__(${initialTemplateModuleId})`,
          'return Promise.all([',
          Template.indent(syncChunks.map((id) => `'${id}'`).join(',\n')),
          '].map(async id=>{',
          Template.indent([
            `if(!${RuntimeGlobals.hasOwnProperty}(__webpack_modules__, id)) {`,
            Template.indent([
              'var remoteModuleName =  idToExternalAndNameMapping[id][1] + idToExternalAndNameMapping[id][2].slice(1);',
              //`const factory = await ${RuntimeGlobals.require}.vmok.instance.loadRemote(remoteModuleName);`,
              `__webpack_modules__[id] = ${runtimeTemplate.basicFunction(
                'module',
                // ['module.exports = factory;'],
                ['module.exports = {};'],
              )}`,
            ]),
            '}',
          ]),
          '})',
        ]),
        ').then(next)});',
      ])};`,
    ]);
  }
}

module.exports = EnsureRemoteRuntimeModule;
