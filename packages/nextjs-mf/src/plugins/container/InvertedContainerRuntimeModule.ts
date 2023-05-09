/* eslint-disable @typescript-eslint/no-var-requires */
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/

'use strict';

import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeModule, Template } from 'webpack';
// @ts-ignore
import { getUndoPath } from 'webpack/lib/util/identifier';
// @ts-ignore
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';
/**
 * Interface for InvertedContainerRuntimeModuleOptions, containing
 * options for the InvertedContainerRuntimeModule class.
 */
interface InvertedContainerRuntimeModuleOptions {
  runtime: string;
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  name?: string; // The name of the current module.
  verbose?: boolean; // A flag to enable verbose logging.
  container?: string; // The name of the container module.
}

/**
 * Interface for ChunkLoadingContext, containing Webpack-related properties.
 */
interface ChunkLoadingContext {
  webpack: Compiler['webpack'];
}

/**
 * InvertedContainerRuntimeModule is a Webpack runtime module that generates
 * the runtime code needed for loading federated modules in an inverted container.
 */
class InvertedContainerRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>;
  private options: InvertedContainerRuntimeModuleOptions;
  private chunkLoadingContext: ChunkLoadingContext;

  /**
   * Constructor for the InvertedContainerRuntimeModule.
   * @param {Set<string>} runtimeRequirements - A set of runtime requirement strings.
   * @param {InvertedContainerRuntimeModuleOptions} options - Runtime module options.
   * @param {ChunkLoadingContext} chunkLoadingContext - Chunk loading context.
   */
  constructor(
    runtimeRequirements: Set<string>,
    options: InvertedContainerRuntimeModuleOptions,
    chunkLoadingContext: ChunkLoadingContext
  ) {
    super('inverted container startup', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;

    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  resolveContainerModule() {
    const container = this.compilation.entrypoints
      .get(this.options.container as string)
      ?.getRuntimeChunk?.();
    const entryModule = container?.entryModule;
    return entryModule;
  }
  /**
   * Generate method for the runtime module, producing the runtime code.
   * @returns {string} runtime code
   */
  override generate() {
    const { name } = this.options;

    const { webpack } = this.chunkLoadingContext;
    const chunkHasJs =
      (webpack && webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;

    const containerEntryModule = this.resolveContainerModule();
    const { chunkGraph, chunk } = this;

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    // const hasJsMatcher = compileBooleanMatcher(conditionMap);
    console.log('chunk name;', chunk.name);
    // find the main webpack runtime, skip all other chunks
    if (chunk.name != this.options.runtime && containerEntryModule) {
      return Template.asString('');
    }

    const containerEntry = [containerEntryModule].map((module) => {
      //@ts-ignore
      const containerName = module?._name || name;
      const containerModuleId = module?.id || module?.debugId;

      if (!(containerName && containerName)) {
        return '';
      }
      // const globalRef = this.compilation.options.output?.globalObject;
      //@ts-ignore
      const nodeGlobal = this.compilation.options?.node?.global;

      const globalObject = nodeGlobal
        ? webpack.RuntimeGlobals.global
        : 'global';
      return `

      __webpack_require__.initConsumes = [];
      __webpack_require__.initRemotes = [];
      __webpack_require__.installedModules = {};


// create objext it doesnt exist yet
        globalThis.backupScope = globalThis.backupScope || {};

        if(typeof window === 'undefined') {
          // if(__webpack_require__.S) Object.assign(globalThis.backupScope, global.__remote_scope__);
__webpack_require__.S = globalThis.backupScope
          if(global.__remote_scope__ === undefined) { global.__remote_scope__ = {_config: {}} };


          __webpack_require__.own_remote = new Promise(function(resolve,reject){
          var containerAttachObject = typeof window !== 'undefined' ? window : ${globalObject}['__remote_scope__']
console.log('normal back up scope', globalThis.backupScope);

console.log('GLOBAL ASCIPR, ', global.__remote_scope__)

       function attachRemote (resolve) {
       console.log('BACKUP SCOP IN ATRTACH', globalThis.backupScope)
              const innerRemote = __webpack_require__(${JSON.stringify(
                containerModuleId
              )})
                   global.__remote_scope__[${JSON.stringify(
                     containerName
                   )}] = innerRemote
         console.log('host inner ctn loaded')
                console.log('searching module tree for ${containerName}', __webpack_require__.m[${JSON.stringify(
        containerModuleId
      )}])
              console.log('searching module cache for ${containerName}', __webpack_require__.c[${JSON.stringify(
        containerModuleId
      )}])
      console.log('scope attach', global.__remote_scope__)
         resolve(innerRemote)
      }

__webpack_require__.O.bind(__webpack_require__.O, 0, ["host_inner_ctn"], function() {
       console.log('####host inner loaded')
              attachRemote(resolve)
        },1)



             __webpack_require__.O(0, ["webpack-runtime"], function() {
             console.log('####runtime loaded');

             __webpack_require__.O(0, ["host_inner_ctn"], function() {
               console.log('####host inner loaded')
                      attachRemote(resolve)
                },1)
               console.log(__webpack_require__.m[${JSON.stringify(
                 containerModuleId
               )}]);
              if(!__webpack_require__.m[${JSON.stringify(containerModuleId)}]) {
            let promises = []

              //            __webpack_require__.f.readFileVm('host_inner_ctn',promises).then(()=>console.log('ENSURE CHUNK'))
              // console.log(promises);
                        require.cache[require.resolve("./host_inner_ctnhome_app")] = undefined
                         require("./host_inner_ctnhome_app");
                      } else {
                      attachRemote(resolve)
                }

               console.log('## status of host',__webpack_require__.O.readFileVm("host_inner_ctn"))

        },0)



      })
        } else {


        ${webpack.RuntimeGlobals.shareScopeMap}['default'] = ${
        webpack.RuntimeGlobals.shareScopeMap
      }['default'] || {};}
        try {
        // install custom module into webpack modules from runtime

if(false) {
console.log('###')
console.log('###')
console.log('#n# #')
console.log('# # #')
console.log('# # #')
console.log('###')
        var containerAttachObject = typeof window !== 'undefined' ? window : ${globalObject}['__remote_scope__']
         __webpack_require__.O(0, ["webpack-runtime"], function() { return require("./host_inner_ctn"); })
         __webpack_require__.O(0, ["host_inner_ctn"], function() {
        const innerRemote = __webpack_require__(${JSON.stringify(
          containerModuleId
        )})

              if(!global.__remote_scope__[${JSON.stringify(
                containerName
              )}]) global.__remote_scope__[${JSON.stringify(
        containerName
      )}] = innerRemote
         console.log('host inner ctn loaded')

     // __webpack_require__.I('default',[__webpack_require__.S]);
          })
          }




      } catch (e) {
        console.error('host runtime was unable to initialize its own remote', e);
      }`;
    });
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;
