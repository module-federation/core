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

// Class to handle asynchronous entry startup
class AsyncEntryStartupPlugin {
  private _options: Options;

  constructor(options?: Options) {
    this._options = options || {};
  }

  apply(compiler: Compiler): void {
    const chunkRuntimes = new Map();
    compiler.hooks.thisCompilation.tap(
      'AsyncEntryStartupPlugin',
      (compilation: Compilation) => {
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation,
        ).renderStartup.tap(
          'AsyncEntryStartupPlugin',
          (
            source: any,
            renderContext: Module,
            upperContext: { chunk: Chunk },
          ) => {
            // Check if single runtime chunk is enabled
            if (compiler?.options?.optimization?.runtimeChunk) {
              if (upperContext?.chunk.hasRuntime()) {
                chunkRuntimes.set(upperContext.chunk.id, upperContext.chunk);
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

            const runtime = chunkRuntimes.get(upperContext.chunk.runtime);

            // Get the runtime requirements of the chunk
            const requirements =
              compilation.chunkGraph.getTreeRuntimeRequirements(
                runtime || upperContext.chunk,
              );

            let remotes = '';
            let shared = '';
            const hasRemoteModules =
              compilation.chunkGraph.getChunkModulesIterableBySourceType(
                upperContext.chunk,
                'remote',
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
              requirements.has(RuntimeGlobals.initializeSharing)
            ) {
              shared = `if(__webpack_require__.f && __webpack_require__.f.consumes) __webpack_require__.f.consumes(${JSON.stringify(
                upperContext.chunk.id,
              )}, promiseTrack);`;
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
              if (entryModule.id) {
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
                    `__webpack_require__(${JSON.stringify(entryModule.id)});`,
                  );
                }
              }
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
      },
    );
  }
}

export default AsyncEntryStartupPlugin;
