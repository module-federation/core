import Compiler from 'webpack/lib/Compiler';
import Compilation from 'webpack/lib/Compilation';
import Chunk from 'webpack/lib/Chunk';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import Template from 'webpack/lib/Template';
import Module from 'webpack/lib/Module';

interface Options {
  eager?: RegExp | ((module: Module) => boolean);
  excludeChunk?: (chunk: Chunk) => boolean;
}

class AsyncEntryStartupPlugin {
  private _options: Options;
  private _runtimeChunks: Map<string | number, Chunk>;

  constructor(options?: Options) {
    this._options = options || {};
    this._runtimeChunks = new Map<string | number, Chunk>();
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap('AsyncEntryStartupPlugin', (compilation: Compilation) => {
      this.collectRuntimeChunks(compilation);
      this.handleRenderStartup(compiler, compilation);
    });
  }

  private collectRuntimeChunks(compilation: Compilation): void {
    compilation.hooks.beforeChunkAssets.tap('CollectRuntimeChunksPlugin', () => {
      for (const chunk of compilation.chunks) {
        if (chunk.hasRuntime() && chunk.id !== null) {
          this._runtimeChunks.set(chunk.id, chunk);
          for (const dependentChunk of compilation.chunkGraph.getChunkEntryDependentChunksIterable(chunk)) {
            if (dependentChunk.id !== null) {
              this._runtimeChunks.set(dependentChunk.id, dependentChunk);
            }
          }
        }
      }
    });
  }

  private handleRenderStartup(compiler: Compiler, compilation: Compilation): void {
    compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(compilation).renderStartup.tap(
      'AsyncEntryStartupPlugin',
      (source: any, renderContext: Module, upperContext: { chunk: Chunk }) => {
        // Check if this._runtimeChunks contains any runtime chunks
        if (this._runtimeChunks.size > 0 && upperContext.chunk.id) {
          if (upperContext?.chunk.hasRuntime()) {
            this._runtimeChunks.set(upperContext.chunk.id, upperContext.chunk);
            return source;
          }
        }

        // Check if excludeChunk is provided, use it to decide further processing
        if (
          this._options.excludeChunk &&
          this._options.excludeChunk(upperContext.chunk)
        ) {
          return source;
        }

        const runtime = new Set();
        if (typeof upperContext.chunk.runtime === 'string' || typeof upperContext.chunk.runtime === 'number') {
          if (this._runtimeChunks.has(upperContext.chunk.runtime)) {
            runtime.add(this._runtimeChunks.get(upperContext.chunk.runtime));
          } else {
            runtime.add(upperContext.chunk);
          }
        } else if (upperContext.chunk.runtime && typeof upperContext.chunk.runtime[Symbol.iterator] === 'function') {
          for (const runtimeItem of upperContext.chunk.runtime) {
            if (this._runtimeChunks.has(runtimeItem)) {
              runtime.add(this._runtimeChunks.get(runtimeItem));
            }
          }
        }
        if (runtime.size === 0) {
          runtime.add(upperContext.chunk);
        }
        // Get the runtime requirements of the chunk
        let remotes = '';
        let shared = '';

        for (const runtimeItem of runtime) {
          const requirements =
            compilation.chunkGraph.getTreeRuntimeRequirements(
              runtimeItem as Chunk,
            );

          const hasRemoteModules =
            compilation.chunkGraph.getChunkModulesIterableBySourceType(
              upperContext.chunk,
              'remote',
            );

          const consumeShares =
            compilation.chunkGraph.getChunkModulesIterableBySourceType(
              upperContext.chunk,
              'consume-shared',
            );

          // Check if the chunk has remote get scope
          if (
            requirements.has(RuntimeGlobals.currentRemoteGetScope) ||
            hasRemoteModules ||
            requirements.has('__webpack_require__.vmok')
          ) {
            remotes = `if(__webpack_require__.f && __webpack_require__.f.remotes) __webpack_require__.f.remotes(${JSON.stringify(
              upperContext.chunk.id,
            )}, promiseTrack);`;
          }

          // Check if the chunk has share scope map or initialize sharing
          if (
            requirements.has(RuntimeGlobals.shareScopeMap) ||
            requirements.has(RuntimeGlobals.initializeSharing) ||
            consumeShares
          ) {
            shared = `if(__webpack_require__.f && __webpack_require__.f.consumes) __webpack_require__.f.consumes(${JSON.stringify(
              upperContext.chunk.id,
            )}, promiseTrack);`;
          }
        }

        // If no remotes or shared, return the source
        if (!remotes && !shared) {
          return source;
        }

        // Get the entry modules of the chunk
        const entryModules =
          compilation.chunkGraph.getChunkEntryModulesIterable(
            upperContext.chunk,
          );

        const initialEntryModules = [];

        // Iterate over the entry modules
        for (const entryModule of entryModules) {
          const entryModuleID = compilation.chunkGraph.getModuleId(entryModule)
          if (entryModuleID) {
            let shouldInclude = false;

            // Check if eager is a function and call it
            if (typeof this._options.eager === 'function') {
              shouldInclude = this._options.eager(entryModule);
            } else if (
              this._options.eager &&
              this._options.eager.test(entryModule.identifier())
            ) {
              // Check if eager is a RegExp and test it
              shouldInclude = true;
            }

            // If shouldInclude is true, push the module to initialEntryModules
            if (shouldInclude) {
              initialEntryModules.push(
                `__webpack_require__(${JSON.stringify(entryModuleID)});`,
              );
            }
          }
        }
        if(compiler.options?.experiments?.topLevelAwait && compiler.options?.experiments?.outputModule) {
          return Template.asString([
            'var promiseTrack = [];',
            Template.asString(initialEntryModules),
            shared,
            remotes,
            'await Promise.all(promiseTrack)',
            Template.indent(source.source()),
          ]);
        }
        return Template.asString([
          'var promiseTrack = [];',
          Template.asString(initialEntryModules),
          shared,
          remotes,
          'var __webpack_exports__ = Promise.all(promiseTrack).then(function() {',
          Template.indent(source.source()),
          Template.indent('return __webpack_exports__'),
          '});',
        ]);
      },
    );
  }
}

export default AsyncEntryStartupPlugin;
