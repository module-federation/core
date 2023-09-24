import type { Chunk, Compiler } from 'webpack';
import { RawSource } from 'webpack-sources';
import { ModuleFederationPluginOptions } from './types';
import { RuntimeGlobals, Compilation } from 'webpack';
import RemoveEagerModulesFromRuntimePlugin from './RemoveEagerModulesFromRuntimePlugin';
import { getAllChunks } from 'webpack/lib/javascript/ChunkHelpers';
import {ContainerEntryModule} from '@module-federation/enhanced';
import { parseOptions } from '@module-federation/enhanced/src/lib/container/options';

/**
 * This interface includes additional fields specific to the plugin's behavior.
 * @typedef {Object} InvertedContainerOptions
 * @property {string} [container] - The container name.
 * @property {Record<string, string>} remotes - A map of remote modules to their URLs.
 * @property {string} runtime - The name of the current module.
 * @property {boolean} [debug] - A flag to enable debug logging.
 */
interface InvertedContainerOptions extends ModuleFederationPluginOptions {
  container?: string;
  remotes: Record<string, string>; // A map of remote modules to their URLs.
  runtime: string; // The name of the current module.
  debug?: boolean; // A flag to enable debug logging.
}

/**
 * InvertedContainerPlugin is a Webpack plugin that handles loading of chunks in a federated module.
 * @class
 */
class InvertedContainerPlugin {
  private options: InvertedContainerOptions;

  /**
   * Constructor for the InvertedContainerPlugin.
   * @param {InvertedContainerOptions} options - Plugin configuration options.
   */
  constructor(options: InvertedContainerOptions) {
    this.options = options;
  }

  /**
   * Resolves the container module for the given compilation.
   * @param {Compilation} compilation - Webpack compilation instance.
   * @returns {Module | undefined} - The container module or undefined if not found.
   */
  private resolveContainerModule(compilation: Compilation) {
    if (!this.options.container) {
      return undefined;
    }
    const container = compilation.entrypoints
      .get(this.options.container)
      ?.getRuntimeChunk?.();
    if (!container) {
      return undefined;
    }
    const entrymodule =
      compilation.chunkGraph.getChunkEntryModulesIterable(container);
    for (const module of entrymodule) {
      return module;
    }
    return undefined;
  }

  /**
   * Apply method for the Webpack plugin, handling the plugin logic and hooks.
   * @param {Compiler} compiler - Webpack compiler instance.
   */
  public apply(compiler: Compiler) {
    new RemoveEagerModulesFromRuntimePlugin({
      container: this.options.container,
      debug: this.options.debug,
    }).apply(compiler);
    const { Template, javascript } = compiler.webpack;
    // Hook into the compilation process.
    compiler.hooks.thisCompilation.tap(
      'InvertedContainerPlugin',
      (compilation) => {
        // Create a WeakSet to store chunks that have already been processed.
        const onceForChunkSet = new WeakSet();

        // Hook into the 'afterChunks' event to create a new container entry module and add it to the runtime chunk.
        compilation.hooks.afterChunks.tap('InvertedContainerPlugin', (chunk) => {
          if(this.options.container) {

            const runtimeChunks = new Map();
            for (const entrypoint of compilation.entrypoints.values()) {
              const runtimeChunk = entrypoint.getRuntimeChunk();
              if (runtimeChunk) {
                runtimeChunks.set(runtimeChunk.name, runtimeChunk);
              }
            }

            const runtimeChunk = runtimeChunks.get(this.options.runtime);
            const parsedoptions = parseOptions(
              //@ts-ignore
              this.options.exposes,
              (item: any) => ({
                import: Array.isArray(item) ? item : [item],
                name: undefined,
              }),
              (item: any) => ({
                import: Array.isArray(item.import) ? item.import : [item.import],
                name: item.name || undefined,
              }),
            )
            const containerEntryModule = new ContainerEntryModule(
              this.options.container + 'new',
              parseOptions(
                //@ts-ignore
                this.options.exposes,
                (item: any) => ({
                  import: Array.isArray(item) ? item : [item],
                  name: undefined,
                }),
                (item: any) => ({
                  import: Array.isArray(item.import) ? item.import : [item.import],
                  name: item.name || undefined,
                }),
              ),
              this.options.shareScope || 'default',
            );
//@ts-ignore
            //compilation.chunkGraph.connectChunkAndModule(runtimeChunk, containerEntryModule)
            // name: string,
            // exposes: [string, ExposeOptions][],
            // shareScope: string,
            // const runtimeChunk = compilation.addChunk('webpack');
            // compilation.chunkGraph.connectChunkAndModule(
            //   runtimeChunk,
            //   //@ts-ignore
            //   containerEntryModule ,
            // );
          }
        });

        const hooks =
          javascript.JavascriptModulesPlugin.getCompilationHooks(compilation);

        hooks.renderStartup.tap(
          'InvertedContainerPlugin',
          (source: any, renderContext: any, startupRendercontext: any) => {
            const isInvalidContext =
              !renderContext ||
              renderContext?._name ||
              !renderContext?.debugId ||
              !compilation.chunkGraph.isEntryModule(renderContext) ||
              renderContext?.rawRequest?.includes('pages/api') ||
              renderContext?.layer === 'api';

            if (isInvalidContext) {
              // skip empty modules, container entry, and anything that doesn't have a moduleid or is not an entrypoint module.
              return source;
            }

            const { runtimeTemplate, chunkGraph } = compilation;
            const replaceSource = source.source().toString();
            const [webpack_exec, ...webpack_exports] =
              replaceSource.split('\n');

            const chunkID =
              typeof startupRendercontext.chunk.id === 'string'
                ? JSON.stringify(startupRendercontext.chunk.id)
                : startupRendercontext.chunk.id;
            const entries = Array.from(
              chunkGraph.getChunkEntryModulesWithChunkGroupIterable(
                startupRendercontext.chunk,
              ),
            );
            const dependentChunkIds = new Set(
              entries
                .filter(([module, entrypoint]) => entrypoint !== undefined)
                .flatMap(([module, entrypoint]) => {
                  if (entrypoint) {
                    const runtimeChunk = entrypoint.getRuntimeChunk();
                    //@ts-ignore
                    const chunks = getAllChunks(entrypoint, runtimeChunk);
                    return Array.from(chunks, (c) => c.id);
                  }
                  return [];
                }),
            );
            return Template.asString([
              webpack_exec.replace(
                '__webpack_exec__',
                '__original_webpack_exec__',
              ),
              'globalThis.ongoingRemotes = globalThis.ongoingRemotes || [];',
              `var __webpack_exec__ = async function() {`,
              Template.indent([
                `var chunkids = ${JSON.stringify(
                  Array.from(dependentChunkIds),
                )};`,
                `chunkids.forEach((id) => ${RuntimeGlobals.ensureChunkHandlers}.consumes(id, globalThis.ongoingRemotes));`,
                `await Promise.all(globalThis.ongoingRemotes);`,
                'console.log("waiting for consume", globalThis.ongoingRemotes);',
                `chunkids.forEach((id) => ${RuntimeGlobals.ensureChunkHandlers}.remotes(id, globalThis.ongoingRemotes));`,
                `await Promise.all(globalThis.ongoingRemotes);`,
                'console.log("waiting for remote", globalThis.ongoingRemotes);',
                `return  __original_webpack_exec__.apply(this, arguments);`,
              ]),
              `};`,
              // 'debugger',
              ...webpack_exports,
            ]);
          },
        );
      },
    );
  }
}

export default InvertedContainerPlugin;

