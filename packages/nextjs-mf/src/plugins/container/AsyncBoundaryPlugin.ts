import { Template, RuntimeGlobals } from 'webpack';
import { Source } from 'webpack-sources';
import type Compilation from 'webpack/lib/Compilation';
import type Compiler from 'webpack/lib/Compiler';
import type Chunk from 'webpack/lib/Chunk';
import { RenderContext } from 'webpack/lib/MainTemplate';
import { getAllChunks } from 'webpack/lib/javascript/ChunkHelpers';
import { ChunkGraph } from 'webpack/lib/ChunkGroup';

/**
 * AsyncBoundaryPlugin is a Webpack plugin that handles asynchronous boundaries in a federated module.
 * @class
 */
class AsyncBoundaryPlugin {
  /**
   * Apply the plugin to the Webpack compiler instance.
   * @param {Compiler} compiler - Webpack compiler instance.
   */
  public apply(compiler: Compiler): void {
    const { javascript } = compiler.webpack;
    compiler.hooks.thisCompilation.tap('AsyncBoundaryPlugin', (compilation: Compilation) => {
      const hooks = javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);
      hooks.renderStartup.tap('AsyncBoundaryPlugin', (source: Source, renderContext: RenderContext, startupRenderContext: Chunk) => {
        return this.renderStartupLogic(source, renderContext, startupRenderContext, compilation);
      });
    });
  }

  /**
   * Render the startup logic for the plugin.
   * @param {Source} source - The source code.
   * @param {RenderContext} renderContext - The render context.
   * @param {any} startupRenderContext - The startup render context.
   * @param {Compilation} compilation - The Webpack compilation instance.
   * @returns {string} - The modified source code.
   */
  private renderStartupLogic(source: Source, renderContext: RenderContext, startupRenderContext: Chunk, compilation: Compilation): string {
    const isInvalidContext = this.checkInvalidContext(renderContext, compilation);
    if (isInvalidContext) return source.source().toString();

    const { chunkGraph } = compilation;
    const replaceSource = source.source().toString();
    const [webpack_exec, ...webpack_exports] = replaceSource.split('\n');
    const dependentChunkIds = this.getDependentChunkIds(startupRenderContext, chunkGraph);

    return Template.asString([
      this.replaceWebpackExec(webpack_exec),
      'globalThis.ongoingRemotes = globalThis.ongoingRemotes || [];',
      'var __webpack_exec__ = async function() {',
      Template.indent([
        `var chunkIds = ${JSON.stringify(Array.from(dependentChunkIds))};`,
        `chunkIds.forEach((id) => ${RuntimeGlobals.ensureChunkHandlers}.consumes(id, globalThis.ongoingRemotes));`,
        `await Promise.all(globalThis.ongoingRemotes);`,
        'console.log("waiting for consume", globalThis.ongoingRemotes.length);',
        `chunkIds.forEach((id) => ${RuntimeGlobals.ensureChunkHandlers}.remotes(id, globalThis.ongoingRemotes));`,
        `await Promise.all(globalThis.ongoingRemotes);`,
        'console.log("waiting for remote", globalThis.ongoingRemotes.length);',
        `return  __original_webpack_exec__.apply(this, arguments);`,
      ]),
      `};`,
      ...webpack_exports,
    ]);
  }

  /**
   * Check if the render context is invalid.
   * @param {RenderContext} renderContext - The render context.
   * @param {Compilation} compilation - The Webpack compilation instance.
   * @returns {boolean} - True if the context is invalid, false otherwise.
   */
  private checkInvalidContext(renderContext: RenderContext, compilation: Compilation): boolean {
    return !renderContext ||
      renderContext?._name ||
      !renderContext?.debugId ||
      !compilation.chunkGraph.isEntryModule(renderContext) ||
      renderContext?.rawRequest?.includes('pages/api') ||
      renderContext?.layer === 'api';
  }

  /**
   * Replace the webpack exec string.
   * @param {string} webpack_exec - The webpack exec string.
   * @returns {string} - The replaced webpack exec string.
   */
  private replaceWebpackExec(webpack_exec: string): string {
    return webpack_exec.replace('__webpack_exec__', '__original_webpack_exec__');
  }

  /**
   * Get the IDs of the dependent chunks.
   * @param {any} startupRenderContext - The startup render context.
   * @param {any} chunkGraph - The chunk graph.
   * @returns {Set} - The set of dependent chunk IDs.
   */
  private getDependentChunkIds(startupRenderContext: RenderContext, chunkGraph: ChunkGraph): Set<string | number | null> {
    const entries = Array.from(chunkGraph.getChunkEntryModulesWithChunkGroupIterable(startupRenderContext.chunk));
    const chunkIds = new Set<string | number | null>();
    for (const [module, entrypoint] of entries) {
      if (entrypoint) {
        const runtimeChunk = entrypoint.getRuntimeChunk();
        if(runtimeChunk) {
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
