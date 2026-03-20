import type {
  Compiler,
  Compilation,
  WebpackPluginInstance,
} from '@rspack/core';

const createEntryStartupRuntimeModule = (
  webpackRef: typeof import('@rspack/core'),
) => {
  const { RuntimeGlobals, RuntimeModule, Template } = webpackRef;

  return class EntryStartupRuntimeModule extends RuntimeModule {
    constructor() {
      super('nextjs-mf entry federation startup', RuntimeModule.STAGE_TRIGGER);
    }

    override generate(): string {
      const { chunk } = this;
      if (!chunk?.hasRuntime()) {
        return '';
      }

      return Template.asString([
        `var nextjsMfPrevStartup = ${RuntimeGlobals.startup};`,
        'var nextjsMfWrappedStartupEntrypoint = false;',
        'var nextjsMfPrefetchedEntrypointRemotes = false;',
        'var nextjsMfWarmChunkMapping = function(mapping, handler, promises) {',
        '  if (!mapping || typeof handler !== "function") {',
        '    return;',
        '  }',
        '  Object.keys(mapping).forEach(function(chunkId) {',
        '    handler(chunkId, promises);',
        '  });',
        '};',
        `${RuntimeGlobals.startup} = function() {`,
        '  var startupResult = typeof nextjsMfPrevStartup === "function" ? nextjsMfPrevStartup() : undefined;',
        '  if (!nextjsMfWrappedStartupEntrypoint && typeof __webpack_require__.X === "function") {',
        '    nextjsMfWrappedStartupEntrypoint = true;',
        '    var nextjsMfPrevStartupEntrypoint = __webpack_require__.X;',
        '    __webpack_require__.X = function(result, chunkIds, fn) {',
        '      if (nextjsMfPrefetchedEntrypointRemotes || typeof nextjsMfPrevStartupEntrypoint !== "function") {',
        '        return nextjsMfPrevStartupEntrypoint(result, chunkIds, fn);',
        '      }',
        '      nextjsMfPrefetchedEntrypointRemotes = true;',
        '      var promises = [];',
        '      nextjsMfWarmChunkMapping(',
        '        __webpack_require__.remotesLoadingData && __webpack_require__.remotesLoadingData.chunkMapping,',
        '        __webpack_require__.f && __webpack_require__.f.remotes,',
        '        promises',
        '      );',
        '      nextjsMfWarmChunkMapping(',
        '        __webpack_require__.consumesLoadingData && __webpack_require__.consumesLoadingData.chunkMapping,',
        '        __webpack_require__.f && __webpack_require__.f.consumes,',
        '        promises',
        '      );',
        '      if (!promises.length) {',
        '        return nextjsMfPrevStartupEntrypoint(result, chunkIds, fn);',
        '      }',
        '      return Promise.all(promises).then(function() {',
        '        return nextjsMfPrevStartupEntrypoint(result, chunkIds, fn);',
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
      'NextjsMfEntryStartupPlugin',
      (compilation: Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'NextjsMfEntryStartupPlugin',
          (chunk, set) => {
            if (!chunk.hasRuntime()) {
              return;
            }

            set.add(compiler.webpack.RuntimeGlobals.startup);
            set.add(compiler.webpack.RuntimeGlobals.startupEntrypoint);
            set.add(compiler.webpack.RuntimeGlobals.ensureChunkHandlers);

            compilation.addRuntimeModule(
              chunk,
              new EntryStartupRuntimeModule(),
            );
          },
        );
      },
    );
  }
}

export default EntryStartupPlugin;
