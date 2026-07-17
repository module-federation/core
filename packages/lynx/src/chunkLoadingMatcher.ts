import type { Chunk, Compiler, WebpackPluginInstance } from '@rspack/core';

interface TemplateEncodeArgs {
  encodeData: {
    lepusCode: {
      root?: unknown;
    };
    sourceContent: {
      appType: string;
    };
  };
}

interface TemplateEmitArgs {
  entryNames: string[];
  finalEncodeOptions: {
    sourceContent: {
      appType: string;
    };
  };
  outputName: string;
}

export interface LynxTemplatePluginApi {
  getLynxTemplatePluginHooks(compilation: unknown): {
    asyncChunkName: {
      tap(name: string, callback: (chunkName: string) => string): void;
    };
    beforeEncode?: {
      tap(name: string, callback: (args: TemplateEncodeArgs) => unknown): void;
    };
    beforeEmit?: {
      tap(name: string, callback: (args: TemplateEmitArgs) => unknown): void;
    };
  };
}

interface ChunkLoadingMatcherOptions {
  autoPublicPath?: boolean;
  backgroundOnlyRemote?: boolean;
  chunking?: 'single' | 'split';
  discardSourceEntryBundles?: boolean;
  discardedTemplateAssets?: Set<string>;
  exposeByExpectedLazyBundleChunk?: ReadonlyMap<string, string>;
  includedChunkPrefixes?: string[];
  lazyBundleAssetByExpose?: Map<string, string>;
  lazyBundleAssets?: Set<string>;
  remoteEntryName?: string;
  pairedRealmChunkPrefixes?: {
    background: string;
    mainThread: string;
  };
  pairedRealmChunkSuffixes?: {
    background: string;
    mainThread: string;
  };
}

interface ChunkGraph {
  getNumberOfEntryModules(chunk: Chunk): number;
  getChunkModulesIterableBySourceType(
    chunk: Chunk,
    sourceType: string,
  ): Iterable<unknown> | undefined;
}

const chunkHasJavaScript = (chunk: Chunk, chunkGraph: ChunkGraph): boolean => {
  if (chunkGraph.getNumberOfEntryModules(chunk) > 0) {
    return true;
  }

  const modules = chunkGraph.getChunkModulesIterableBySourceType(
    chunk,
    'javascript',
  );
  return modules?.[Symbol.iterator]().next().done === false;
};

const getNonJavaScriptChunkIds = (
  chunks: Iterable<Chunk>,
  chunkGraph: ChunkGraph,
): Array<string | number> =>
  Array.from(chunks).flatMap((chunk) =>
    chunkHasJavaScript(chunk, chunkGraph) ? [] : [...(chunk.ids ?? [])],
  );

const getRemoteChunkNames = (
  compilation: {
    chunks: Iterable<Chunk>;
    entrypoints: ReadonlyMap<string, { chunks: Iterable<Chunk> }>;
  },
  options: ChunkLoadingMatcherOptions,
): Set<string> => {
  const chunks = new Set<Chunk>();
  const addChunkGraph = (chunk: Chunk): void => {
    chunks.add(chunk);
    for (const asyncChunk of chunk.getAllAsyncChunks()) {
      chunks.add(asyncChunk);
    }
  };

  if (options.remoteEntryName) {
    for (const chunk of compilation.entrypoints.get(options.remoteEntryName)
      ?.chunks ?? []) {
      addChunkGraph(chunk);
    }
  }
  for (const chunk of compilation.chunks) {
    if (
      typeof chunk.name === 'string' &&
      options.includedChunkPrefixes?.some((prefix) =>
        chunk.name!.startsWith(prefix),
      )
    ) {
      addChunkGraph(chunk);
    }
  }

  return new Set(
    Array.from(chunks).flatMap((chunk) =>
      typeof chunk.name === 'string' ? [chunk.name] : [],
    ),
  );
};

const stripPairedRealmChunkSuffix = (
  chunkName: string,
  suffixes: ChunkLoadingMatcherOptions['pairedRealmChunkSuffixes'],
): string =>
  suffixes
    ? [suffixes.background, suffixes.mainThread].reduce(
        (name, suffix) =>
          name.endsWith(suffix) ? name.slice(0, -suffix.length) : name,
        chunkName,
      )
    : chunkName;

const normalizeLazyBundleChunkName = (
  chunkName: string,
  options: ChunkLoadingMatcherOptions,
): string => {
  const normalizedChunkName = stripPairedRealmChunkSuffix(
    chunkName,
    options.pairedRealmChunkSuffixes,
  );
  const prefixes = options.pairedRealmChunkPrefixes;
  return prefixes && normalizedChunkName.startsWith(prefixes.mainThread)
    ? `${prefixes.background}${normalizedChunkName.slice(prefixes.mainThread.length)}`
    : normalizedChunkName;
};

export const createLynxChunkLoadingMatcherPlugin = (
  lynxTemplatePlugin?: LynxTemplatePluginApi,
  options: ChunkLoadingMatcherOptions = {},
): WebpackPluginInstance => ({
  apply(compiler: Compiler) {
    const pluginName = 'LynxModuleFederationChunkLoadingMatcher';
    const { RuntimeGlobals, RuntimeModule, Template } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      options.lazyBundleAssets?.clear();
      options.lazyBundleAssetByExpose?.clear();
      options.discardedTemplateAssets?.clear();
      let remoteChunkNames: Set<string> | undefined;
      const templateHooks =
        lynxTemplatePlugin?.getLynxTemplatePluginHooks(compilation);
      templateHooks?.asyncChunkName.tap(pluginName, (chunkName) => {
        const layerSuffixes = options.pairedRealmChunkSuffixes;
        const normalizedChunkName = stripPairedRealmChunkSuffix(
          chunkName,
          layerSuffixes,
        );
        const hasAssetlessChunk = Array.from(compilation.chunks).some(
          (chunk) => {
            if (
              chunkHasJavaScript(chunk, compilation.chunkGraph) ||
              typeof chunk.name !== 'string'
            ) {
              return false;
            }
            const suffix = layerSuffixes
              ? [layerSuffixes.background, layerSuffixes.mainThread].find(
                  (candidate) => chunk.name!.endsWith(candidate),
                )
              : undefined;
            return (
              (suffix ? chunk.name.slice(0, -suffix.length) : chunk.name) ===
              normalizedChunkName
            );
          },
        );
        if (hasAssetlessChunk) {
          return '';
        }
        return normalizeLazyBundleChunkName(chunkName, options);
      });
      if (options.backgroundOnlyRemote) {
        templateHooks?.beforeEncode?.tap(pluginName, (args) => {
          if (args.encodeData.sourceContent.appType !== 'DynamicComponent') {
            args.encodeData.lepusCode.root = undefined;
          }
          return args;
        });
      }
      templateHooks?.beforeEmit?.tap(pluginName, (args) => {
        let chunkNames = remoteChunkNames;
        if (!chunkNames) {
          chunkNames = getRemoteChunkNames(compilation, options);
          remoteChunkNames = chunkNames;
        }
        const isDynamicComponent =
          args.finalEncodeOptions.sourceContent.appType === 'DynamicComponent';
        const isRemoteOutput = args.entryNames.some((name) =>
          chunkNames.has(name),
        );
        const exposedKeys = new Set(
          args.entryNames.flatMap((name) => {
            const exposedKey = options.exposeByExpectedLazyBundleChunk?.get(
              normalizeLazyBundleChunkName(name, options),
            );
            return exposedKey === undefined ? [] : [exposedKey];
          }),
        );

        if (isDynamicComponent && (isRemoteOutput || exposedKeys.size > 0)) {
          options.lazyBundleAssets?.add(args.outputName);
          for (const exposedKey of exposedKeys) {
            const previousAsset =
              options.lazyBundleAssetByExpose?.get(exposedKey);
            if (previousAsset && previousAsset !== args.outputName) {
              throw new Error(
                `@module-federation/lynx expose "${exposedKey}" emitted multiple DynamicComponent lazy bundles: "${previousAsset}" and "${args.outputName}".`,
              );
            }
            options.lazyBundleAssetByExpose?.set(exposedKey, args.outputName);
          }
          if (options.chunking === 'split') {
            options.discardedTemplateAssets?.delete(args.outputName);
          } else {
            options.discardedTemplateAssets?.add(args.outputName);
          }
        } else if (options.discardSourceEntryBundles) {
          options.discardedTemplateAssets?.add(args.outputName);
        }
        return args;
      });

      class ChunkLoadingMatcherRuntimeModule extends RuntimeModule {
        constructor() {
          super('lynx chunk loading matcher', RuntimeModule.STAGE_TRIGGER);
        }

        override generate(): string {
          const autoPublicPath = options.autoPublicPath
            ? '__webpack_require__.lynx_public_path_auto = true;'
            : '';
          const chunking = options.chunking
            ? `__webpack_require__.lynx_chunking = ${JSON.stringify(options.chunking)};`
            : '';
          const chunkIds = getNonJavaScriptChunkIds(
            this.compilation!.chunks,
            this.chunkGraph!,
          );
          if (chunkIds.length === 0) {
            return Template.asString([autoPublicPath, chunking]);
          }

          const matcher = Object.fromEntries(
            chunkIds.map((id) => [String(id), 1]),
          );
          return Template.asString([
            autoPublicPath,
            chunking,
            'var lynxChunkLoader = __webpack_require__.f.require;',
            'if (lynxChunkLoader) {',
            Template.indent([
              `var lynxChunksWithoutJavaScript = ${JSON.stringify(matcher)};`,
              '__webpack_require__.f.require = function(chunkId, promises) {',
              Template.indent([
                'if (!__webpack_require__.o(lynxChunksWithoutJavaScript, chunkId)) {',
                Template.indent('return lynxChunkLoader(chunkId, promises);'),
                '}',
              ]),
              '};',
            ]),
            '}',
          ]);
        }
      }

      class StartupPromiseRuntimeModule extends RuntimeModule {
        constructor() {
          super(
            'lynx federation startup promise',
            RuntimeModule.STAGE_TRIGGER - 1,
          );
        }

        override generate(): string {
          return Template.asString([
            'var lynxFederationStartup = __webpack_require__.x;',
            '__webpack_require__.x = function() {',
            Template.indent(
              'return Promise.resolve(lynxFederationStartup.apply(this, arguments));',
            ),
            '};',
          ]);
        }
      }

      compilation.hooks.runtimeRequirementInTree
        .for(RuntimeGlobals.ensureChunkHandlers)
        .tap(pluginName, (chunk) => {
          compilation.addRuntimeModule(
            chunk,
            new ChunkLoadingMatcherRuntimeModule(),
          );
          compilation.addRuntimeModule(
            chunk,
            new StartupPromiseRuntimeModule(),
          );
        });
    });
  },
});
