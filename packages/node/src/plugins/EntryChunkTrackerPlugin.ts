import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type {
  Compiler,
  Compilation,
  Chunk,
  sources,
  Module,
  RuntimeGlobals,
  javascript,
} from 'webpack';
import type { SyncWaterfallHook } from 'tapable';

const SortableSet = require(
  normalizeWebpackPath('webpack/lib/util/SortableSet'),
) as typeof import('webpack/lib/util/SortableSet');

type CompilationHooksJavascriptModulesPlugin = ReturnType<
  typeof javascript.JavascriptModulesPlugin.getCompilationHooks
>;
type RenderStartup = CompilationHooksJavascriptModulesPlugin['renderStartup'];

type InferStartupRenderContext<T> =
  T extends SyncWaterfallHook<
    [infer Source, infer Module, infer StartupRenderContext]
  >
    ? StartupRenderContext
    : never;

type StartupRenderContext = InferStartupRenderContext<RenderStartup>;

export interface Options {
  eager?: RegExp | ((module: Module) => boolean);
  excludeChunk?: (chunk: Chunk) => boolean;
}

class EntryChunkTrackerPlugin {
  private _options: Options;

  constructor(options?: Options) {
    this._options = options || {};
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      'EntryChunkTrackerPlugin',
      (compilation: Compilation) => {
        this._handleRenderStartup(compiler, compilation);
      },
    );
  }
  private _handleRenderStartup(compiler: Compiler, compilation: Compilation) {
    compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
      compilation,
    ).renderStartup.tap(
      'EntryChunkTrackerPlugin',
      (
        source: sources.Source,
        _renderContext: Module,
        upperContext: StartupRenderContext,
      ) => {
        if (
          this._options.excludeChunk &&
          this._options.excludeChunk(upperContext.chunk)
        ) {
          return source;
        }

        const templateString = this._getTemplateString(compiler, source);

        return new compiler.webpack.sources.ConcatSource(templateString);
      },
    );
  }

  private _getTemplateString(compiler: Compiler, source: sources.Source) {
    const { Template } = compiler.webpack;
    return Template.asString([
      `if(typeof module !== 'undefined') {
        globalThis.entryChunkCache = globalThis.entryChunkCache || new Set();
        module.filename && globalThis.entryChunkCache.add(module.filename);
        if(module.children) {
        module.children.forEach(function(c) {
          c.filename && globalThis.entryChunkCache.add(c.filename);
        })
}
      }`,
      Template.indent(source.source().toString()),
    ]);
  }
}

export default EntryChunkTrackerPlugin;
