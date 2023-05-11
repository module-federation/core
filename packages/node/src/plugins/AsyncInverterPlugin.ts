import type { Chunk, Compiler, Compilation } from 'webpack';
import Template from 'webpack/lib/Template';
import type { ModuleFederationPluginOptions } from '../types';
import { ConcatSource, RawSource, ReplaceSource } from 'webpack-sources';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import template from './custom-jsonp';
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';
import { ChunkGraph, Module, RuntimeModule } from 'webpack';
//@ts-ignore
import {
  parseVersionRuntimeCode,
  versionLtRuntimeCode,
  rangeToStringRuntimeCode,
  satisfyRuntimeCode,
  //@ts-ignore
} from 'webpack/lib/util/semver';
interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  verbose?: boolean;
  invertedBoot?: boolean;
}

class AsyncInverterPlugin {
  private options: CommonJsChunkLoadingOptions;
  private initialRemoteModules: Map<any, any>;
  // @ts-ignore
  private compiler: Compiler;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    // eager imports of remote container modules
    this.initialRemoteModules = new Map();
  }

  getInitialChunkIds(chunk: Chunk, chunkGraph: ChunkGraph) {
    const chunkHasJs =
      (this.compiler.webpack &&
        this.compiler.webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
      // @ts-ignore
      require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;
    //@ts-ignore
    const initialChunkIds = new Set(`${chunk.id}` || [chunk.ids]);
    let cc;
    let current;
    for (const c of chunk.getAllInitialChunks()) {
      console.log('looping through initial chunks', c);
      if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
      if (c.ids) {
        for (const id of c.ids) initialChunkIds.add(`${id}`);
      }
      current = c;
      cc = c.getAllInitialChunks();
    }

    return initialChunkIds;
  }
  //@ts-ignore
  addRemoteModules(modules: Iterable<Module>, entry: Chunk): void {
    if (!this.initialRemoteModules.has(entry.name)) {
      this.initialRemoteModules.set(entry.name, new Set());
    }
    const existing = this.initialRemoteModules.get(entry.name);
    for (const module of modules) {
      existing.add(module);
    }
  }

  apply(compiler: Compiler) {
    this.compiler = compiler;
    compiler.hooks.thisCompilation.tap('AsyncInverterPlugin', (compilation) => {
      return;
      const hooks =
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        );

      hooks.renderStartup.tap(
        'AddCommentWebpackPlugin',
        //@ts-ignore
        (source, renderContext) => {
          if (
            renderContext &&
            renderContext.constructor.name !== 'NormalModule'
          ) {
            return source;
          }

          const newSource = [];
          const replaceSource = source.source().toString().split('\n');

          const searchString = '__webpack_exec__';
          const replaceString = '__webpack_exec_proxy__';

          const originalExec = replaceSource.findIndex((s: string) =>
            s.includes(searchString)
          );

          if (originalExec === -1) {
            return source;
          }

          const firstHalf = replaceSource.slice(0, originalExec + 1);
          const secondHalf = replaceSource.slice(
            originalExec + 1,
            replaceSource.length
          );

          // Push renamed exec pack into new source
          newSource.push(
            firstHalf.join('\n').replace(searchString, replaceString)
          );

          newSource.push(`

            var ${searchString} = function(moduleId) {
return __webpack_require__.own_remote.then((thing)=>{
console.log('loaded pages remote if exists:',exports.id);
return Promise.all(__webpack_require__.initRemotes);
}).then(()=>{
console.log('loaded pages remote if exists:',exports.id);
return Promise.all(__webpack_require__.initConsumes);
}).then(()=>{
console.log('async startup for entrypoint done');
console.log('SUOULD REQUIRE PAged,m', moduleId);
console.log('SCOPE MEMORY CHECK',__webpack_require__.S === globalThis.backupScope);
console.log('SCOPE MEMORY CHECK',Object.keys(__webpack_require__.S), Object.keys(globalThis.backupScope))
return ${replaceString}(moduleId);
})
             };
              `);
          return Template.asString([
            '',
            'if(exports.id) {',
            Template.indent([
              '__webpack_require__.getEagerSharedForChunkId(exports.id,__webpack_require__.initRemotes);',
              '__webpack_require__.getEagerRemotesForChunkId(exports.id,__webpack_require__.initConsumes)',
            ]),
            '}',
            ...newSource,
            ...secondHalf,
            '',
          ]);
        }
      );
      compilation.hooks.optimizeChunks.tap(
        'AddModulesToRuntimeChunkPlugin',
        (chunks) => {
          console.log('optimize chunks');
          for (const entrypointModule of compilation.entrypoints.values()) {
            const entrypoint = entrypointModule.getEntrypointChunk();
            if (entrypoint.hasRuntime()) continue;
          }
        }
      );
    });
  }
}

export default AsyncInverterPlugin;
