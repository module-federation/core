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
        if(typeof window === 'undefined') {
          if(global.__remote_scope__ === undefined) { global.__remote_scope__ = {_config: {}} };

        } else {


        ${webpack.RuntimeGlobals.shareScopeMap}['default'] = ${
        webpack.RuntimeGlobals.shareScopeMap
      }['default'] || {};
}
        try {
        // install custom module into webpack modules from runtime


console.log('INVERT RUNNING AGAIN')
        var containerAttachObject = typeof window !== 'undefined' ? window : ${globalObject}['__remote_scope__']
__webpack_require__.X(console.log,[${JSON.stringify(containerName)}], (cd)=>{
const innerRemtote = __webpack_require__(${JSON.stringify(containerModuleId)})
              global.__remote_scope__[${JSON.stringify(
                //@ts-ignore
                containerName
              )}] = {
              get: innerRemtote.get,
              init: function(initScope,initToken){
              console.log('in host init')

              console.log(__webpack_require__);
              console.log(__webpack_require__.S['default'])
              console.log(initScope,initToken)
              delete __webpack_require__.S['default']['next/head']

              innerRemtote.init(initScope,[])
              console.log('holding');
              console.log(__webpack_require__.S['default'])

              return new Promise((resolve,reject)=>{});
               return innerRemtote.init(initScope,initToken)
                }
              }

              console.log(__webpack_require__.S['default'])
              Promise.resolve(__webpack_require__.I('default', [__webpack_require__.S])).then(()=>{
              console.log('all containers have initialized');
              console.log(__webpack_require__.S['default'])
              })

       console.log(__webpack_require__.S['default'])
      })


      } catch (e) {
        console.error('host runtime was unable to initialize its own remote', e);
      }`;
    });
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;
