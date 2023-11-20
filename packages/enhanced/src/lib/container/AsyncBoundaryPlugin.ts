import Compiler from 'webpack/lib/Compiler';
import Compilation from 'webpack/lib/Compilation';
import Chunk, { Source } from 'webpack/lib/Chunk';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import Template from 'webpack/lib/Template';
import SortableSet from 'webpack/lib/util/SortableSet';
import Module from 'webpack/lib/Module';
import { StartupRenderContext } from 'webpack/lib/javascript/JavascriptModulesPlugin';

interface Options {
  eager?: RegExp | ((module: Module) => boolean);
  excludeChunk?: (chunk: Chunk) => boolean;
}

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

  private _handleRenderStartup(compiler: Compiler, compilation: Compilation) {
    compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
      compilation,
    ).renderStartup.tap(
      'AsyncEntryStartupPlugin',
      (
        source: Source,
        renderContext: Module,
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
          const entryOptions = upperContext.chunk.getEntryOptions();
          const chunksToRef = entryOptions?.dependOn
            ? [...entryOptions.dependOn, upperContext.chunk.id]
            : [upperContext.chunk.id];

          remotes = this._getRemotes(
            requirements,
            Boolean(hasRemoteModules),
            chunksToRef,
            remotes,
          );
          shared = this._getShared(
            requirements,
            Boolean(consumeShares),
            chunksToRef,
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
        return this._getTemplateString(
          compiler,
          initialEntryModules,
          shared,
          remotes,
          source,
        );
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
    requirements: ReadonlySet<string>,
    hasRemoteModules: boolean,
    chunksToRef: (Chunk.ChunkId | null)[],
    remotes: string,
  ): string {
    if (
      !requirements.has(RuntimeGlobals.currentRemoteGetScope) &&
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
      if (chunkId !== null) {
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
    requirements: ReadonlySet<string>,
    consumeShares: boolean,
    chunksToRef: (Chunk.ChunkId | null)[],
    shared: string,
  ): string {
    if (
      !requirements.has(RuntimeGlobals.shareScopeMap) &&
      !consumeShares &&
      !requirements.has(RuntimeGlobals.initializeSharing)
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
      if (chunkId !== null) {
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
            `__webpack_require__(${JSON.stringify(entryModuleID)});`,
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
    source: Source,
  ) {
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
  }
}

export default AsyncEntryStartupPlugin;
