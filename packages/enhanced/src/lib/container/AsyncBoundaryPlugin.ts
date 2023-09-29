import { Template, RuntimeGlobals } from 'webpack';
import { Source } from 'webpack-sources';
import type Compilation from 'webpack/lib/Compilation';
import type Compiler from 'webpack/lib/Compiler';
import type Module from 'webpack/lib/Module';
import { getAllChunks } from 'webpack/lib/javascript/ChunkHelpers';
import { ChunkGraph } from 'webpack/lib/ChunkGroup';
import { StartupRenderContext } from 'webpack/lib/javascript/JavascriptModulesPlugin';
import { RenderContext } from 'webpack/lib/javascript/JavascriptModulesPlugin';
import { SyncBailHook } from 'tapable';

interface RenderStartupLogicHook {
  (source: Source, renderContext: Module, startupRenderContext: StartupRenderContext): string;
}

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
    const getCompilationHooks =
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks;
    compiler.hooks.thisCompilation.tap(
      'AsyncBoundaryPlugin',
      (compilation: Compilation) => {
        getCompilationHooks(compilation).renderStartup.tap(
          'AsyncBoundaryPlugin',
          this.renderStartupLogic(compilation),
        );
      },
    );
  }

  /**
   * Render the startup logic function creator for the plugin.
   * @param {Compilation} compilation - The Webpack compilation instance.
   * @returns {RenderStartupLogicHook} - The modified source code.
   */
  private renderStartupLogic(compilation: Compilation): RenderStartupLogicHook {
    /**
     * Render the startup logic for the plugin.
     * @param {Source} source - The source code.
     * @param {RenderContext} renderContext - The render context.
     * @param {StartupRenderContext} startupRenderContext - The startup render context.
     * @returns {string} - The modified source code.
     */
    return (
        source: Source,
        renderContext: Module,
        startupRenderContext: StartupRenderContext,
    ): string => {
      const isInvalidContext =
          this.hooks.checkInvalidContext.call(renderContext, compilation) ?? false;
      if (isInvalidContext) return source.source().toString();

      const { chunkGraph } = compilation;
      const replaceSource = source.source().toString();
      const [webpack_exec, ...webpack_exports] = replaceSource.split('\n');
      const dependentChunkIds = this.getDependentChunkIds(
          startupRenderContext,
          chunkGraph,
      );

      return Template.asString([
        this.replaceWebpackExec(webpack_exec),
        `globalThis.ongoingRemotes = globalThis.ongoingRemotes || [];`,
        `var __webpack_exec__ = async function() {`,
        Template.indent([
          `var chunkIds = ${JSON.stringify(Array.from(dependentChunkIds))};`,
          `chunkIds.forEach(function(id) { ${RuntimeGlobals.ensureChunkHandlers}.consumes(id, globalThis.ongoingRemotes); });`,
          `await Promise.all(globalThis.ongoingRemotes);`,
          `chunkIds.forEach(function(id) { ${RuntimeGlobals.ensureChunkHandlers}.remotes(id, globalThis.ongoingRemotes); });`,
          `await Promise.all(globalThis.ongoingRemotes);`,
          `return  __original_webpack_exec__.apply(this, arguments);`,
        ]),
        `};`,
        ...webpack_exports,
      ]);
    }
  }

  /**
   * Replace the webpack exec string.
   * @param {string} webpack_exec - The webpack exec string.
   * @returns {string} - The replaced webpack exec string.
   */
  private replaceWebpackExec(webpack_exec: string): string {
    return webpack_exec.replace(
      '__webpack_exec__',
      '__original_webpack_exec__',
    );
  }

  /**
   * Get the IDs of the dependent chunks.
   * @param {any} startupRenderContext - The startup render context.
   * @param {any} chunkGraph - The chunk graph.
   * @returns {Set} - The set of dependent chunk IDs.
   */
  private getDependentChunkIds(
    startupRenderContext: RenderContext,
    chunkGraph: ChunkGraph,
  ): Set<string | number | null> {
    const entries = Array.from(
      chunkGraph.getChunkEntryModulesWithChunkGroupIterable(
        startupRenderContext.chunk,
      ),
    );
    const chunkIds = new Set<string | number | null>();
    for (const [module, entrypoint] of entries) {
      if (entrypoint) {
        const runtimeChunk = entrypoint.getRuntimeChunk();
        if (runtimeChunk) {
          const chunks = getAllChunks(entrypoint, runtimeChunk);
          for (const c of chunks) {
            chunkIds.add(c.id);
          }
        }
      }
    }
    return chunkIds;
  }
}

export default AsyncBoundaryPlugin;
