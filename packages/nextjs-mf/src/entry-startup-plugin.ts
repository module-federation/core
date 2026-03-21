import type {
  Compilation,
  Compiler,
  WebpackPluginInstance,
} from '@rspack/core';

type ChunkLike = {
  hasRuntime(): boolean;
  id?: string | number | null;
};

type ChunkGraphLike = {
  getChunkEntryDependentChunksIterable(chunk: ChunkLike): Iterable<ChunkLike>;
};

type RuntimeModuleContextLike = {
  chunk?: ChunkLike;
  chunkGraph?: ChunkGraphLike | null;
  compilation?: {
    chunkGraph?: ChunkGraphLike | null;
  } | null;
};

const PLUGIN_NAME = 'NextjsMfEntryStartupPlugin';

const getEntryDependentChunkIds = (
  chunk: ChunkLike,
  chunkGraph: ChunkGraphLike,
): Array<string | number> => {
  const dependentChunkIds: Array<string | number> = [];

  for (const dependentChunk of chunkGraph.getChunkEntryDependentChunksIterable(
    chunk,
  )) {
    const dependentChunkId = dependentChunk.id;
    if (dependentChunkId === null || dependentChunkId === undefined) {
      continue;
    }
    dependentChunkIds.push(dependentChunkId);
  }

  return dependentChunkIds;
};

const createEntryStartupRuntimeModule = (
  webpackRef: typeof import('@rspack/core'),
) => {
  const { RuntimeGlobals, RuntimeModule, Template } = webpackRef;

  return class EntryStartupRuntimeModule extends RuntimeModule {
    constructor() {
      super('nextjs-mf entry federation startup', RuntimeModule.STAGE_TRIGGER);
    }

    override generate(): string {
      const { chunk, chunkGraph, compilation } =
        this as unknown as RuntimeModuleContextLike;
      if (!chunk) {
        return '';
      }

      const runtimeChunkGraph = chunkGraph || compilation?.chunkGraph;
      if (!runtimeChunkGraph) {
        return '';
      }

      const dependentChunkIds = getEntryDependentChunkIds(
        chunk,
        runtimeChunkGraph,
      );

      return Template.asString([
        `var nextjsMfPrevStartup = ${RuntimeGlobals.startup};`,
        'var nextjsMfWrappedStartupEntrypoint = false;',
        'var nextjsMfPrefetchedEntrypointRemotes = false;',
        `var nextjsMfEntryDependentChunkIds = ${JSON.stringify(dependentChunkIds)};`,
        'var nextjsMfWarmDependentChunks = function(handler, promises) {',
        '  if (typeof handler !== "function" || !nextjsMfEntryDependentChunkIds.length) {',
        '    return;',
        '  }',
        '  for (var i = 0; i < nextjsMfEntryDependentChunkIds.length; i++) {',
        '    handler(nextjsMfEntryDependentChunkIds[i], promises);',
        '  }',
        '};',
        'var nextjsMfInvokePrevStartupEntrypoint = function(result, chunkIds, fn) {',
        '  if (typeof nextjsMfPrevStartupEntrypoint === "function") {',
        '    return nextjsMfPrevStartupEntrypoint(result, chunkIds, fn);',
        '  }',
        '  return undefined;',
        '};',
        `${RuntimeGlobals.startup} = function() {`,
        '  var startupResult = typeof nextjsMfPrevStartup === "function" ? nextjsMfPrevStartup() : undefined;',
        '  if (!nextjsMfWrappedStartupEntrypoint && typeof __webpack_require__.X === "function") {',
        '    nextjsMfWrappedStartupEntrypoint = true;',
        '    var nextjsMfPrevStartupEntrypoint = __webpack_require__.X;',
        '    __webpack_require__.X = function(result, chunkIds, fn) {',
        '      if (nextjsMfPrefetchedEntrypointRemotes || typeof nextjsMfPrevStartupEntrypoint !== "function") {',
        '        return nextjsMfInvokePrevStartupEntrypoint(result, chunkIds, fn);',
        '      }',
        '      nextjsMfPrefetchedEntrypointRemotes = true;',
        '      var promises = [];',
        '      nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.remotes, promises);',
        '      nextjsMfWarmDependentChunks(__webpack_require__.f && __webpack_require__.f.consumes, promises);',
        '      if (!promises.length) {',
        '        return nextjsMfInvokePrevStartupEntrypoint(result, chunkIds, fn);',
        '      }',
        '      return Promise.all(promises).then(function() {',
        '        return nextjsMfInvokePrevStartupEntrypoint(result, chunkIds, fn);',
        '      });',
        '    };',
        '  }',
        '  return startupResult;',
        '};',
      ]);
    }
  };
};

class EntryStartupPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    const EntryStartupRuntimeModule = createEntryStartupRuntimeModule(
      compiler.webpack as never,
    );

    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          PLUGIN_NAME,
          (chunk: any, set: Set<string>) => {
            if (!chunk.hasRuntime()) {
              return;
            }

            set.add(compiler.webpack.RuntimeGlobals.startup);
            set.add(compiler.webpack.RuntimeGlobals.startupEntrypoint);
            set.add(compiler.webpack.RuntimeGlobals.ensureChunkHandlers);

            compilation.addRuntimeModule(
              chunk as never,
              new EntryStartupRuntimeModule(),
            );
          },
        );
      },
    );
  }
}

export default EntryStartupPlugin;
