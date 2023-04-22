/* eslint-disable @typescript-eslint/no-var-requires */
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/

'use strict';

import type { Chunk, ChunkGraph, Compiler } from "webpack";
import { RuntimeModule, Template } from "webpack";
// @ts-ignore
import { getUndoPath } from "webpack/lib/util/identifier";
// @ts-ignore
import compileBooleanMatcher from "webpack/lib/util/compileBooleanMatcher";

/**
 * Interface for InvertedContainerRuntimeModuleOptions, containing
 * options for the InvertedContainerRuntimeModule class.
 */
interface InvertedContainerRuntimeModuleOptions {
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  name?: string; // The name of the current module.
  verbose?: boolean; // A flag to enable verbose logging.
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

    // workaround for next.js
    const getInitialChunkIds = (chunk: Chunk, chunkGraph: ChunkGraph) => {
      const initialChunkIds = new Set(chunk.ids);
      for (const c of chunk.getAllInitialChunks()) {
        if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
        if (c.ids) {
          for (const id of c.ids) initialChunkIds.add(id);
        }
      }
      return initialChunkIds;
    };

    const { chunkGraph, chunk } = this;

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    const hasJsMatcher = compileBooleanMatcher(conditionMap);
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph);
    const ccm = chunkGraph.getChunkModules(chunk);

    // find the main webpack runtime, skip all other chunks
    if (chunk.name !== 'webpack') return Template.asString('');
    const containerEntry = ccm
      .filter((module) => {
        return module.constructor.name === 'ContainerEntryModule';
      })
      .map((module) => {
        return `
        try {
        console.log('should set from host', document.currentScript.src);
        window[${JSON.stringify(
          //@ts-ignore
          module._name || name
        )}] = __webpack_require__(${JSON.stringify(
          module?.id || module?.debugId
        )})
      } catch (e) {
        console.error('host runtime was unable to initialize its own remote', e);
      }`;
      });
    if (containerEntry) {
      console.log(
        'found container entry module for inverse boot',
        containerEntry
      );
    }
    return Template.asString(containerEntry);
  }
}

export default InvertedContainerRuntimeModule;
