/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { moduleFederationPlugin } from '@module-federation/sdk';
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

export type Options = moduleFederationPlugin.AsyncBoundaryOptions;
class AsyncEntryStartupPlugin {
  private _options: Options;
  private _runtimeChunks = new Map<string | number, Chunk | undefined>();

  constructor(options?: Options) {
    this._options = options || {};
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      'AsyncEntryStartupPlugin',
      (compilation: Compilation) => {
        this._collectRuntimeChunks(compilation);
        this._handleRenderStartup(compiler, compilation);
      },
    );
  }

  private _collectRuntimeChunks(compilation: Compilation) {
    compilation.hooks.beforeChunkAssets.tap('AsyncEntryStartupPlugin', () => {
      for (const chunk of compilation.chunks) {
        if (chunk.hasRuntime() && chunk.id !== null) {
          this._runtimeChunks.set(chunk.id, chunk);
          for (const dependentChunk of compilation.chunkGraph.getChunkEntryDependentChunksIterable(
            chunk,
          )) {
            if (dependentChunk.id !== null) {
              this._runtimeChunks.set(dependentChunk.id, dependentChunk);
            }
          }
        }
      }
    });
  }

  getChunkByName(
    compilation: Compilation,
    dependOn: string[],
    byname: Set<Chunk>,
  ) {
    for (const name of dependOn) {
      const chunk = compilation.namedChunks.get(name);
      if (chunk) {
        byname.add(chunk);
      }
    }
  }

  private _handleRenderStartup(compiler: Compiler, compilation: Compilation) {
    compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
      compilation,
    ).renderStartup.tap(
      'AsyncEntryStartupPlugin',
      (
        source: sources.Source,
        _renderContext: Module,
        upperContext: StartupRenderContext,
      ) => {
        const isSingleRuntime = compiler.options?.optimization?.runtimeChunk;
        if (upperContext?.chunk.id && isSingleRuntime) {
          if (upperContext?.chunk.hasRuntime()) {
            this._runtimeChunks.set(upperContext.chunk.id, upperContext.chunk);
            return source;
          }
        }

        if (
          this._options.excludeChunk &&
          this._options.excludeChunk(upperContext.chunk)
        ) {
          return source;
        }

        const runtime = this._getChunkRuntime(upperContext);

        let remotes = '';
        let shared = '';

        for (const runtimeItem of runtime) {
          if (!runtimeItem) {
            continue;
          }

          const requirements =
            compilation.chunkGraph.getTreeRuntimeRequirements(runtimeItem);

          const entryOptions = upperContext.chunk.getEntryOptions();
          const chunkInitialsSet = new Set(
            compilation.chunkGraph.getChunkEntryDependentChunksIterable(
              upperContext.chunk,
            ),
          );

          chunkInitialsSet.add(upperContext.chunk);
          const dependOn = entryOptions?.dependOn || [];
          this.getChunkByName(compilation, dependOn, chunkInitialsSet);

          const initialChunks = [];

          let hasRemoteModules = false;
          let consumeShares = false;

          for (const chunk of chunkInitialsSet) {
            initialChunks.push(chunk.id);
            if (!hasRemoteModules) {
              hasRemoteModules = Boolean(
                compilation.chunkGraph.getChunkModulesIterableBySourceType(
                  chunk,
                  'remote',
                ),
              );
            }
            if (!consumeShares) {
              consumeShares = Boolean(
                compilation.chunkGraph.getChunkModulesIterableBySourceType(
                  chunk,
                  'consume-shared',
                ),
              );
            }
            if (hasRemoteModules && consumeShares) {
              break;
            }
          }

          remotes = this._getRemotes(
            compiler.webpack.RuntimeGlobals,
            requirements,
            hasRemoteModules,
            initialChunks,
            remotes,
          );

          shared = this._getShared(
            compiler.webpack.RuntimeGlobals,
            requirements,
            consumeShares,
            initialChunks,
            shared,
          );
        }

        if (!remotes && !shared) {
          return source;
        }

        const initialEntryModules = this._getInitialEntryModules(
          compilation,
          upperContext,
        );
        const templateString = this._getTemplateString(
          compiler,
          initialEntryModules,
          shared,
          remotes,
          source,
        );

        return new compiler.webpack.sources.ConcatSource(templateString);
      },
    );
  }

  private _getChunkRuntime(upperContext: StartupRenderContext) {
    const runtime = new Set<Chunk>();
    const chunkRuntime = upperContext.chunk.runtime;
    if (chunkRuntime) {
      const runtimeItems =
        chunkRuntime instanceof SortableSet ? chunkRuntime : [chunkRuntime];
      for (const runtimeItem of runtimeItems) {
        const chunk = this._runtimeChunks.get(runtimeItem);
        if (chunk) {
          runtime.add(chunk);
        }
      }
    }
    if (runtime.size === 0) {
      runtime.add(upperContext.chunk);
    }
    return runtime;
  }
  private _getRemotes(
    runtimeGlobals: typeof RuntimeGlobals,
    requirements: ReadonlySet<string>,
    hasRemoteModules: boolean,
    chunksToRef: (Chunk['id'] | null | undefined)[],
    remotes: string,
  ): string {
    if (
      !requirements.has(runtimeGlobals.currentRemoteGetScope) &&
      !hasRemoteModules &&
      !requirements.has('__webpack_require__.vmok')
    ) {
      return remotes;
    }

    const remotesParts = remotes.startsWith(
      'if(__webpack_require__.f && __webpack_require__.f.remotes) {',
    )
      ? [remotes]
      : [
          remotes,
          'if(__webpack_require__.f && __webpack_require__.f.remotes) {',
        ];

    for (const chunkId of chunksToRef) {
      if (chunkId !== null && chunkId !== undefined) {
        remotesParts.push(
          ` __webpack_require__.f.remotes(${JSON.stringify(
            chunkId,
          )}, promiseTrack);`,
        );
      }
    }

    remotesParts.push('}');
    return remotesParts.join('');
  }

  private _getShared(
    runtimeGlobals: typeof RuntimeGlobals,
    requirements: ReadonlySet<string>,
    consumeShares: boolean,
    chunksToRef: (Chunk['id'] | null | undefined)[],
    shared: string,
  ): string {
    if (
      !requirements.has(runtimeGlobals.shareScopeMap) &&
      !consumeShares &&
      !requirements.has(runtimeGlobals.initializeSharing)
    ) {
      return shared;
    }

    const sharedParts = shared.startsWith(
      'if(__webpack_require__.f && __webpack_require__.f.consumes) {',
    )
      ? [shared]
      : [
          shared,
          'if(__webpack_require__.f && __webpack_require__.f.consumes) {',
        ];

    for (const chunkId of chunksToRef) {
      if (chunkId !== null && chunkId !== undefined) {
        sharedParts.push(
          ` __webpack_require__.f.consumes(${JSON.stringify(
            chunkId,
          )}, promiseTrack);`,
        );
      }
    }

    sharedParts.push('}');
    return sharedParts.join('');
  }

  private _getInitialEntryModules(
    compilation: Compilation,
    upperContext: { chunk: Chunk },
  ): string[] {
    const entryModules = compilation.chunkGraph.getChunkEntryModulesIterable(
      upperContext.chunk,
    );
    const initialEntryModules = [];

    for (const entryModule of entryModules) {
      const entryModuleID = compilation.chunkGraph.getModuleId(entryModule);
      if (entryModuleID) {
        let shouldInclude = false;

        if (typeof this._options.eager === 'function') {
          shouldInclude = this._options.eager(entryModule);
        } else if (
          this._options.eager &&
          this._options.eager.test(entryModule.identifier())
        ) {
          shouldInclude = true;
        }

        if (shouldInclude) {
          initialEntryModules.push(
            `if(__webpack_require__.m[${JSON.stringify(entryModuleID)}]) {
              __webpack_require__(${JSON.stringify(entryModuleID)});
            } else {
              console.warn('Federation Runtime Module not found. In the current runtime');
            }`,
          );
        }
      }
    }
    return initialEntryModules;
  }

  private _getTemplateString(
    compiler: Compiler,
    initialEntryModules: string[],
    shared: string,
    remotes: string,
    source: sources.Source,
  ) {
    const { Template } = compiler.webpack;
    if (
      compiler.options?.experiments?.topLevelAwait &&
      compiler.options?.experiments?.outputModule
    ) {
      return Template.asString([
        'var promiseTrack = [];',
        Template.asString(initialEntryModules),
        shared,
        remotes,
        'await Promise.all(promiseTrack)',
        Template.indent(source.source().toString()),
      ]);
    }
    return Template.asString([
      'var promiseTrack = [];',
      Template.asString(initialEntryModules),
      shared,
      remotes,
      'var __webpack_exports__ = Promise.all(promiseTrack).then(function() {',
      Template.indent(source.source().toString()),
      Template.indent('return __webpack_exports__'),
      '});',
    ]);
  }
}

export default AsyncEntryStartupPlugin;
