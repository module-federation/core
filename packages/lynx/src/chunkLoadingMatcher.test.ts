import { describe, expect, it, rs } from '@rstest/core';

import { createLynxChunkLoadingMatcherPlugin } from './chunkLoadingMatcher';
import { createRemoteBundleCompilationStateStore } from './remoteBundleCompilationState';

describe('Lynx chunk-loading matcher', () => {
  it('keeps lazy bundle state isolated between compilations', () => {
    type Compilation = {
      chunks: Set<unknown>;
      entrypoints: Map<string, unknown>;
      hooks: {
        runtimeRequirementInTree: {
          for: () => { tap: () => void };
        };
      };
    };
    const stateStore = createRemoteBundleCompilationStateStore();
    let onCompilation: ((compilation: Compilation) => void) | undefined;
    const beforeEmitByCompilation = new Map<Compilation, (args: any) => any>();
    class RuntimeModule {
      static STAGE_TRIGGER = 20;

      constructor(
        readonly name: string,
        readonly stage: number,
      ) {}
    }
    const compiler = {
      webpack: {
        RuntimeGlobals: { ensureChunkHandlers: 'ensureChunkHandlers' },
        RuntimeModule,
        Template: {
          asString: (lines: string[]) => lines.flat().join('\n'),
          indent: (lines: string | string[]) =>
            (Array.isArray(lines) ? lines : [lines])
              .flat()
              .map((line) => `  ${line}`)
              .join('\n'),
        },
      },
      hooks: {
        thisCompilation: {
          tap(_name: string, callback: (compilation: Compilation) => void) {
            onCompilation = callback;
          },
        },
      },
    };
    createLynxChunkLoadingMatcherPlugin(
      {
        getLynxTemplatePluginHooks(compilation) {
          return {
            asyncChunkName: {
              tap() {},
            },
            beforeEmit: {
              tap(_name, callback) {
                beforeEmitByCompilation.set(
                  compilation as Compilation,
                  callback,
                );
              },
            },
          };
        },
      },
      {
        chunking: 'split',
        exposeByExpectedLazyBundleChunk: new Map([
          ['catalog__background_Card', './Card'],
        ]),
        stateStore,
      } as any,
    ).apply(compiler as any);
    const firstCompilation: Compilation = {
      chunks: new Set(),
      entrypoints: new Map(),
      hooks: { runtimeRequirementInTree: { for: () => ({ tap: () => {} }) } },
    };
    const secondCompilation: Compilation = {
      chunks: new Set(),
      entrypoints: new Map(),
      hooks: { runtimeRequirementInTree: { for: () => ({ tap: () => {} }) } },
    };

    onCompilation!(firstCompilation);
    beforeEmitByCompilation.get(firstCompilation)!({
      entryNames: ['catalog__background_Card'],
      finalEncodeOptions: { sourceContent: { appType: 'DynamicComponent' } },
      outputName: 'first.bundle',
    });
    onCompilation!(secondCompilation);

    expect(stateStore.for(firstCompilation as any).lazyBundleAssets).toEqual(
      new Set(['first.bundle']),
    );
    expect(
      stateStore.for(firstCompilation as any).lazyBundleAssetByExpose,
    ).toEqual(new Map([['./Card', 'first.bundle']]));
    expect(
      stateStore.for(secondCompilation as any).discardedTemplateAssets,
    ).toEqual(new Set());
    expect(stateStore.for(secondCompilation as any).lazyBundleAssets).toEqual(
      new Set(),
    );
    expect(
      stateStore.for(secondCompilation as any).lazyBundleAssetByExpose,
    ).toEqual(new Map());
  });

  it('creates fresh state for non-remote matcher use', () => {
    let onCompilation: ((compilation: any) => void) | undefined;
    const beforeEmitByCompilation = new Map<any, (args: any) => any>();
    class RuntimeModule {
      static STAGE_TRIGGER = 20;

      constructor() {}
    }
    createLynxChunkLoadingMatcherPlugin(
      {
        getLynxTemplatePluginHooks(compilation) {
          return {
            asyncChunkName: { tap() {} },
            beforeEmit: {
              tap(_name, callback) {
                beforeEmitByCompilation.set(compilation, callback);
              },
            },
          };
        },
      },
      {
        chunking: 'split',
        exposeByExpectedLazyBundleChunk: new Map([
          ['catalog__background_Card', './Card'],
        ]),
        pairedRealmChunkSuffixes: {
          background: '-react__background',
          mainThread: '-react__main-thread',
        },
      },
    ).apply({
      webpack: {
        RuntimeGlobals: { ensureChunkHandlers: 'ensureChunkHandlers' },
        RuntimeModule,
        Template: {},
      },
      hooks: {
        thisCompilation: {
          tap(_name: string, callback: (compilation: any) => void) {
            onCompilation = callback;
          },
        },
      },
    } as any);
    const createCompilation = () => ({
      chunks: new Set(),
      entrypoints: new Map(),
      hooks: { runtimeRequirementInTree: { for: () => ({ tap: () => {} }) } },
    });
    const firstCompilation = createCompilation();
    const secondCompilation = createCompilation();
    const lazyBundleArgs = (outputName: string) => ({
      entryNames: ['catalog__background_Card'],
      finalEncodeOptions: { sourceContent: { appType: 'DynamicComponent' } },
      outputName,
    });

    onCompilation!(firstCompilation);
    beforeEmitByCompilation.get(firstCompilation)!(
      lazyBundleArgs('first.bundle'),
    );
    onCompilation!(secondCompilation);

    expect(() =>
      beforeEmitByCompilation.get(secondCompilation)!(
        lazyBundleArgs('second.bundle'),
      ),
    ).not.toThrow();
  });

  it('guards chunks without JavaScript while preserving local JavaScript chunks', () => {
    const entryChunk = {
      files: new Set(['host.js']),
      getAllAsyncChunks: () => new Set(),
      ids: ['host'],
      name: 'host',
    };
    const nestedChunk = {
      files: new Set(['nested.js']),
      getAllAsyncChunks: () => new Set(),
      ids: ['nested'],
      name: 'nested-feature',
    };
    const remoteChunk = {
      files: new Set(),
      getAllAsyncChunks: () => new Set([nestedChunk]),
      ids: [802],
      name: 'remote-react__background',
    };
    const mainThreadAssetlessChunk = {
      files: new Set(),
      getAllAsyncChunks: () => new Set(),
      ids: [803],
      name: 'catalog__main-thread__Empty-react__main-thread',
    };
    const localChunk = {
      files: new Set(['local.js']),
      getAllAsyncChunks: () => new Set(),
      ids: [123],
      name: 'local',
    };
    const cssChunk = {
      files: new Set(['styles.css']),
      getAllAsyncChunks: () => new Set(),
      ids: [456],
      name: 'styles',
    };
    const chunks = new Set([
      entryChunk,
      remoteChunk,
      mainThreadAssetlessChunk,
      localChunk,
      cssChunk,
    ]);
    const chunkGraph = {
      getNumberOfEntryModules(chunk: unknown) {
        return chunk === entryChunk ? 1 : 0;
      },
      getChunkModulesIterableBySourceType(chunk: unknown) {
        return chunk === localChunk ? [{}] : [];
      },
    };
    let onCompilation: ((compilation: any) => void) | undefined;
    let addMatcher: ((chunk: unknown) => void) | undefined;
    let renameAsyncChunk: ((chunkName: string) => string) | undefined;
    let beforeEncode: ((args: any) => any) | undefined;
    let beforeEmit: ((args: any) => any) | undefined;
    const addRuntimeModule = rs.fn();
    const stateStore = createRemoteBundleCompilationStateStore();

    class RuntimeModule {
      static STAGE_TRIGGER = 20;
      protected compilation: any;
      protected chunkGraph: any;

      constructor(
        readonly name: string,
        readonly stage: number,
      ) {}

      attach(compilation: any, _chunk: unknown, graph: any) {
        this.compilation = compilation;
        this.chunkGraph = graph;
      }
    }

    const compiler = {
      webpack: {
        RuntimeGlobals: { ensureChunkHandlers: 'ensureChunkHandlers' },
        RuntimeModule,
        Template: {
          asString: (lines: string[]) => lines.flat().join('\n'),
          indent: (lines: string | string[]) =>
            (Array.isArray(lines) ? lines : [lines])
              .flat()
              .map((line) => `  ${line}`)
              .join('\n'),
        },
      },
      hooks: {
        thisCompilation: {
          tap(_name: string, callback: (compilation: any) => void) {
            onCompilation = callback;
          },
        },
      },
    };
    const compilation = {
      addRuntimeModule,
      chunkGraph,
      chunks,
      entrypoints: new Map([['remote', { chunks: [remoteChunk] }]]),
      hooks: {
        runtimeRequirementInTree: {
          for() {
            return {
              tap(_name: string, callback: (chunk: unknown) => void) {
                addMatcher = callback;
              },
            };
          },
        },
      },
    };

    createLynxChunkLoadingMatcherPlugin(
      {
        getLynxTemplatePluginHooks() {
          return {
            asyncChunkName: {
              tap(_name, callback) {
                renameAsyncChunk = callback;
              },
            },
            beforeEncode: {
              tap(_name, callback) {
                beforeEncode = callback;
              },
            },
            beforeEmit: {
              tap(_name, callback) {
                beforeEmit = callback;
              },
            },
          };
        },
      },
      {
        autoPublicPath: true,
        backgroundOnlyRemote: true,
        chunking: 'split',
        discardSourceEntryBundles: true,
        exposeByExpectedLazyBundleChunk: new Map([
          ['catalog__background_Card', './Card'],
          ['catalog__background_Details', './Details'],
        ]),
        includedChunkPrefixes: ['catalog__background_'],
        remoteEntryName: 'remote',
        pairedRealmChunkPrefixes: {
          background: 'catalog__background_',
          mainThread: 'catalog__main-thread__',
        },
        pairedRealmChunkSuffixes: {
          background: '-react__background',
          mainThread: '-react__main-thread',
        },
        stateStore,
      },
    ).apply(compiler as any);
    onCompilation!(compilation);
    const state = stateStore.for(compilation as any);
    expect(state.discardedTemplateAssets.size).toBe(0);
    expect(state.lazyBundleAssets.size).toBe(0);
    expect(state.lazyBundleAssetByExpose.size).toBe(0);
    addMatcher!(entryChunk);

    const cardArgs = {
      encodeData: {
        lepusCode: { root: { source: 'main-thread runtime' } },
        sourceContent: { appType: 'card' },
      },
    };
    expect(beforeEncode!(cardArgs)).toBe(cardArgs);
    expect(cardArgs.encodeData.lepusCode.root).toBeUndefined();
    const lazyRoot = { source: 'component main thread' };
    beforeEncode!({
      encodeData: {
        lepusCode: { root: lazyRoot },
        sourceContent: { appType: 'DynamicComponent' },
      },
    });
    expect(lazyRoot).toEqual({ source: 'component main thread' });

    const lazyArgs = {
      finalEncodeOptions: {
        sourceContent: { appType: 'DynamicComponent' },
      },
      chunkGroups: [
        { name: 'catalog__background_Card-react__background' },
        { name: 'catalog__main-thread__Card-react__main-thread' },
      ],
      outputName: 'async/catalog__background_Card.hash.bundle',
    };
    expect(beforeEmit!(lazyArgs)).toBe(lazyArgs);
    beforeEmit!({
      chunkGroups: [{ name: 'remote-react__background' }],
      finalEncodeOptions: { sourceContent: { appType: 'card' } },
      outputName: 'bootstrap.lynx.bundle',
    });
    beforeEmit!({
      chunkGroups: [{ name: 'nested-feature' }],
      finalEncodeOptions: {
        sourceContent: { appType: 'DynamicComponent' },
      },
      outputName: 'async/nested-feature.bundle',
    });
    expect(state.lazyBundleAssets).toEqual(
      new Set([
        'async/catalog__background_Card.hash.bundle',
        'async/nested-feature.bundle',
      ]),
    );
    expect(state.lazyBundleAssetByExpose).toEqual(
      new Map([['./Card', 'async/catalog__background_Card.hash.bundle']]),
    );
    expect(state.discardedTemplateAssets).toEqual(
      new Set(['bootstrap.lynx.bundle']),
    );

    expect(addRuntimeModule).toHaveBeenCalledTimes(2);
    const runtimeModule = addRuntimeModule.mock.calls.find(
      ([, module]) => module.name === 'lynx chunk loading matcher',
    )![1];
    runtimeModule.attach(compilation, entryChunk, chunkGraph);
    const source = runtimeModule.generate();

    expect(source).toContain('"802":1');
    expect(source).toContain('__webpack_require__.lynx_chunking = "split"');
    expect(source).toContain(
      '__webpack_require__.lynx_public_path_auto = true',
    );
    expect(source).toContain('"456":1');
    expect(source).not.toContain('"123":1');
    expect(source).not.toContain('"host":1');
    expect(source).toContain('__webpack_require__.f.require = function');
    const startupModule = addRuntimeModule.mock.calls.find(
      ([, module]) => module.name === 'lynx federation startup promise',
    )![1];
    startupModule.attach(compilation, entryChunk, chunkGraph);
    expect(startupModule.generate()).toContain(
      'Promise.resolve(lynxFederationStartup.apply(this, arguments))',
    );
    expect(renameAsyncChunk!('remote')).toBe('');
    expect(renameAsyncChunk!('local')).toBe('local');
    expect(renameAsyncChunk!('catalog__background_Card')).toBe(
      'catalog__background_Card',
    );
    expect(
      renameAsyncChunk!('catalog__main-thread__Card-react__main-thread'),
    ).toBe('catalog__background_Card');
    expect(
      renameAsyncChunk!('catalog__main-thread__Empty-react__main-thread'),
    ).toBe('');
  });
});
