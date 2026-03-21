import type {
  Compilation,
  Compiler,
  WebpackPluginInstance,
} from '@rspack/core';

type ChunkLike = {
  hasRuntime(): boolean;
  id?: string | number | null;
  getAllReferencedChunks(): Iterable<ChunkLike>;
};

type RuntimeModuleContextLike = {
  chunk?: ChunkLike;
};

const PLUGIN_NAME = 'NextjsMfEntryStartupPlugin';

const getReferencedChunkIds = (chunk: ChunkLike): Array<string | number> => {
  const referencedChunkIds: Array<string | number> = [];

  for (const referencedChunk of chunk.getAllReferencedChunks()) {
    if (referencedChunk === chunk) {
      continue;
    }
    const referencedChunkId = referencedChunk.id;
    if (
      referencedChunkId === null ||
      referencedChunkId === undefined ||
      referencedChunkId === chunk.id
    ) {
      continue;
    }
    referencedChunkIds.push(referencedChunkId);
  }

  return referencedChunkIds;
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
      const { chunk } = this as unknown as RuntimeModuleContextLike;
      if (!chunk) {
        return '';
      }

      const referencedChunkIds = getReferencedChunkIds(chunk);

      return Template.asString([
        `var nextjsMfPrevStartup = ${RuntimeGlobals.startup};`,
        'var nextjsMfWrappedStartupEntrypoint = false;',
        'var nextjsMfPrefetchedEntrypointRemotes = false;',
        `var nextjsMfEntryDependentChunkIds = ${JSON.stringify(referencedChunkIds)};`,
        'var nextjsMfWarmDependentChunks = function(handler, promises) {',
        '  if (typeof handler !== "function" || !nextjsMfEntryDependentChunkIds.length) {',
        '    return;',
        '  }',
        '  for (var i = 0; i < nextjsMfEntryDependentChunkIds.length; i++) {',
        '    handler(nextjsMfEntryDependentChunkIds[i], promises);',
        '  }',
        '};',
        `${RuntimeGlobals.startup} = function() {`,
        '  var startupResult = typeof nextjsMfPrevStartup === "function" ? nextjsMfPrevStartup() : undefined;',
        '  if (!nextjsMfWrappedStartupEntrypoint && typeof __webpack_require__.X === "function") {',
        '    nextjsMfWrappedStartupEntrypoint = true;',
        '    var nextjsMfPrevStartupEntrypoint = __webpack_require__.X;',
        '    var nextjsMfInvokePrevStartupEntrypoint = function(result, chunkIds, fn) {',
        '      if (typeof nextjsMfPrevStartupEntrypoint === "function") {',
        '        return nextjsMfPrevStartupEntrypoint(result, chunkIds, fn);',
        '      }',
        '      return undefined;',
        '    };',
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
