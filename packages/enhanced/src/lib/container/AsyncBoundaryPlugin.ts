import { Template, RuntimeGlobals } from 'webpack';
import { Source } from 'webpack-sources';
import type Compilation from 'webpack/lib/Compilation';
import type Compiler from 'webpack/lib/Compiler';
import type Module from 'webpack/lib/Module';
import type Chunk from 'webpack/lib/Chunk';
import { getAllChunks } from 'webpack/lib/javascript/ChunkHelpers';
import { ChunkGraph } from 'webpack/lib/ChunkGroup';
import { StartupRenderContext } from 'webpack/lib/javascript/JavascriptModulesPlugin';
import { RenderContext } from 'webpack/lib/javascript/JavascriptModulesPlugin';
import { SyncBailHook } from 'tapable';
/**
 * AsyncBoundaryPlugin is a Webpack plugin that handles asynchronous boundaries in a federated module.
 * @class
 */
class AsyncBoundaryPlugin {
  /**
   * Define hooks
   * @property {SyncBailHook} checkInvalidContext - A hook that checks if the render context is invalid.
   */
  public hooks = {
    checkInvalidContext: new SyncBailHook<[Module, Compilation], boolean>([
      'renderContext',
      'compilation',
    ]),
  };

  /**
   * Apply the plugin to the Webpack compiler instance.
   * @param {Compiler} compiler - Webpack compiler instance.
   */
  public apply(compiler: Compiler): void {
    const { javascript } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(
      'AsyncBoundaryPlugin',
      (compilation: Compilation) => {
        const hooks =
          javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);

        hooks.renderStartup.tap(
          'AsyncBoundaryPlugin',
          (
            source: Source,
            renderContext: Module,
            startupRenderContext: StartupRenderContext,
          ) => {
              if (startupRenderContext.chunk.hasRuntime()) {
                return source;
              }
            const isInvalidContext =
              this.hooks.checkInvalidContext.call(renderContext, compilation) ?? false;
              if (isInvalidContext) return source

              const startup = [
                'var promiseTrack = [];',
                `if(__webpack_require__.f && __webpack_require__.f.remotes) __webpack_require__.f.remotes(${JSON.stringify(
                  startupRenderContext.chunk.id,
                )}, promiseTrack);`,
                `if(__webpack_require__.f && __webpack_require__.f.consumes) __webpack_require__.f.consumes(${JSON.stringify(
                  startupRenderContext.chunk.id,
                )}, promiseTrack);`,
                `var __webpack_exports__ = Promise.all(promiseTrack).then(function() {`,
                source.source(),
                'return __webpack_exports__;',
                `});`,
              ].join('\n');

              return startup;
          },
        );
      },
    );
  }
}

export default AsyncBoundaryPlugin;
