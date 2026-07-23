import { describe, expect, it, rs } from '@rstest/core';

import { createLynxExternalBundlePlugin } from './externalBundle';
import { createRemoteBundleCompilationStateStore } from './remoteBundleCompilationState';

interface TestAsset {
  name: string;
  source: { source(): string | Buffer };
}

const createAsset = (name: string, content = name): TestAsset => ({
  name,
  source: { source: () => content },
});

const setupPlugin = (
  chunking: 'split' | 'single',
  lazyBundleAssets = new Set([
    'async/Card.hash.bundle',
    'async/Nested.hash.bundle',
  ]),
  lazyBundleAssetByExpose = new Map([
    ['./Card', 'async/Card.hash.bundle'],
    ['./Nested', 'async/Nested.hash.bundle'],
  ]),
) => {
  const encode = rs.fn(async () => ({ buffer: Buffer.from('external') }));
  const discardedTemplateAssets = new Set(['bootstrap.bundle']);
  const stateStore = createRemoteBundleCompilationStateStore();
  if (chunking === 'single') {
    discardedTemplateAssets.add('async/Card.hash.bundle');
    discardedTemplateAssets.add('async/Nested.hash.bundle');
  }
  const plugin = createLynxExternalBundlePlugin({
    bundleFileName: 'catalog.lynx.bundle',
    chunking,
    encode,
    entryAssets: ['catalog.js'],
    entryName: 'catalog',
    entrySectionNames: new Map([['catalog.js', 'catalog_global']]),
    exposeByExpectedLazyBundleChunk: new Map([
      ['catalog__background_Card', './Card'],
      ['catalog__background_Nested', './Nested'],
    ]),
    includedChunkPrefixes: ['catalog__background_', 'catalog__main-thread__'],
    preservedAssets: ['mf-manifest.json', 'mf-stats.json'],
    stateStore,
  });
  let onCompilation: ((compilation: any) => void) | undefined;
  let onEmit: ((compilation: any) => Promise<void>) | undefined;
  const compiler = {
    webpack: {
      Compilation: { PROCESS_ASSETS_STAGE_REPORT: 5_000 },
      sources: {
        RawSource: class {
          constructor(readonly value: Buffer | string) {}
        },
      },
    },
    hooks: {
      thisCompilation: {
        tap(_name: string, callback: (compilation: any) => void) {
          onCompilation = callback;
        },
      },
      emit: {
        tapPromise(
          _name: string,
          callback: (compilation: any) => Promise<void>,
        ) {
          onEmit = callback;
        },
      },
    },
  };
  plugin.apply(compiler as any);

  return {
    encode,
    onCompilation: () => (compilation: any) => {
      const state = stateStore.for(compilation);
      state.discardedTemplateAssets = new Set(discardedTemplateAssets);
      state.lazyBundleAssets = new Set(lazyBundleAssets);
      state.lazyBundleAssetByExpose = new Map(lazyBundleAssetByExpose);
      state.pairedBundleChunks.add('catalog__main-thread.js');
      onCompilation!(compilation);
    },
    onEmit: () => onEmit!,
  };
};

const createCompilation = (sourceAssets: TestAsset[]) => {
  let assets = [...sourceAssets];
  let snapshot: (() => void) | undefined;
  const deleteAsset = rs.fn((name: string) => {
    assets = assets.filter((asset) => asset.name !== name);
  });
  const emitAsset = rs.fn((name: string, source: TestAsset['source']) => {
    assets = [
      ...assets.filter((asset) => asset.name !== name),
      { name, source },
    ];
  });
  const nestedChunk = {
    name: 'nested-feature',
    files: new Set(['async/nested-feature.js', 'async/nested-feature.css']),
    auxiliaryFiles: new Set<string>(),
    getAllAsyncChunks: () => new Set(),
  };
  const remoteChunk = {
    name: 'catalog__background_Card',
    files: new Set([
      'async/catalog__background_Card.js',
      'async/catalog__background_Card.css',
    ]),
    auxiliaryFiles: new Set<string>(),
    getAllAsyncChunks: () => new Set([nestedChunk]),
  };
  const compilation = {
    entrypoints: new Map([
      [
        'catalog',
        {
          chunks: [remoteChunk],
          getFiles: () => ['catalog.js', 'runtime.js'],
        },
      ],
    ]),
    chunks: [remoteChunk, nestedChunk],
    getAssets: () => assets,
    getAsset: (name: string) => assets.find((asset) => asset.name === name),
    deleteAsset,
    emitAsset,
    hooks: {
      processAssets: {
        tap(options: { stage: number }, callback: () => void) {
          expect(options.stage).toBe(5_000);
          snapshot = callback;
        },
      },
    },
  };

  return {
    compilation,
    names: () => assets.map(({ name }) => name).sort(),
    replaceAssets(nextAssets: TestAsset[]) {
      assets = nextAssets;
    },
    snapshot: () => snapshot!(),
  };
};

describe('Lynx external bundle', () => {
  const sourceAssets = [
    createAsset('catalog.js', 'module.exports = "container"'),
    createAsset('runtime.js', 'module.exports = "runtime"'),
    createAsset('async/catalog__background_Card.js', 'module.exports = "card"'),
    createAsset('async/catalog__background_Card.css', '.card {}'),
    createAsset('async/nested-feature.js', 'module.exports = "nested"'),
    createAsset('async/nested-feature.css', '.nested {}'),
    createAsset('unrelated-app.js', 'module.exports = "unrelated"'),
    createAsset('ignored.map'),
  ];

  it('keeps split lazy bundles outside the container bundle', async () => {
    const { encode, onCompilation, onEmit } = setupPlugin('split');
    const harness = createCompilation(sourceAssets);
    onCompilation()(harness.compilation);
    harness.snapshot();
    harness.replaceAssets([
      createAsset('mf-manifest.json'),
      createAsset('mf-stats.json'),
      createAsset('async/Card.hash.bundle'),
      createAsset('async/Nested.hash.bundle'),
      createAsset('bootstrap.bundle'),
      createAsset('unrelated-app.js'),
      createAsset('images/orbit.png'),
    ]);

    await onEmit()(harness.compilation);

    const encodeOptions = encode.mock.calls[0][0] as any;
    expect(encodeOptions.compilerOptions.targetSdkVersion).toBe('3.7');
    expect(encodeOptions.compilerOptions.isExternalBundle).toBe(true);
    expect(encodeOptions.compilerOptions.isLazy).toBe(false);
    expect(Object.keys(encodeOptions.customSections).sort()).toEqual([
      'catalog_global',
      'runtime',
    ]);
    expect(harness.names()).toEqual([
      'async/Card.hash.bundle',
      'async/Nested.hash.bundle',
      'catalog.lynx.bundle',
      'images/orbit.png',
      'mf-manifest.json',
      'mf-stats.json',
      'unrelated-app.js',
    ]);
  });

  it('keeps REPORT asset snapshots with their compilation', async () => {
    const { encode, onCompilation, onEmit } = setupPlugin('single');
    const first = createCompilation([createAsset('catalog.js', 'first')]);
    const second = createCompilation([createAsset('catalog.js', 'second')]);

    onCompilation()(first.compilation);
    first.snapshot();
    onCompilation()(second.compilation);
    second.snapshot();

    await onEmit()(first.compilation);

    const encodeOptions = encode.mock.calls[0][0] as any;
    expect(encodeOptions.customSections.catalog_global.content).toBe('first');
  });

  it('rejects split builds when any expose lacks a ReactLynx lazy bundle', async () => {
    const { onCompilation, onEmit } = setupPlugin(
      'split',
      new Set(['async/Card.hash.bundle']),
      new Map([['./Card', 'async/Card.hash.bundle']]),
    );
    const harness = createCompilation(sourceAssets);
    onCompilation()(harness.compilation);
    harness.snapshot();
    harness.replaceAssets([createAsset('async/Card.hash.bundle')]);

    await expect(onEmit()(harness.compilation)).rejects.toThrow(
      'missing bundles for "./Nested"',
    );
  });

  it('rejects tracked lazy bundles that are missing from the compilation', async () => {
    const { onCompilation, onEmit } = setupPlugin('split');
    const harness = createCompilation(sourceAssets);
    onCompilation()(harness.compilation);
    harness.snapshot();
    harness.replaceAssets([createAsset('async/Card.hash.bundle')]);

    await expect(onEmit()(harness.compilation)).rejects.toThrow(
      'missing bundles for "./Nested"',
    );
  });

  it('snapshots every JS and CSS chunk into one atomic bundle', async () => {
    const { encode, onCompilation, onEmit } = setupPlugin('single');
    const harness = createCompilation(sourceAssets);
    onCompilation()(harness.compilation);
    harness.snapshot();
    harness.replaceAssets([
      createAsset('mf-manifest.json'),
      createAsset('mf-stats.json'),
      createAsset('async/Card.hash.bundle'),
      createAsset('async/Nested.hash.bundle'),
      createAsset('unrelated-app.js'),
      createAsset('fonts/orbit.woff2'),
    ]);

    await onEmit()(harness.compilation);

    const encodeOptions = encode.mock.calls[0][0] as any;
    expect(Object.keys(encodeOptions.customSections).sort()).toEqual([
      'async/catalog__background_Card',
      'async/catalog__background_Card:CSS',
      'async/nested-feature',
      'async/nested-feature:CSS',
      'catalog_global',
      'runtime',
    ]);
    expect(
      encodeOptions.customSections['async/catalog__background_Card:CSS'],
    ).toMatchObject({
      encoding: 'CSS',
    });
    expect(encodeOptions.customSections).not.toHaveProperty('unrelated-app');
    expect(harness.names()).toEqual([
      'catalog.lynx.bundle',
      'fonts/orbit.woff2',
      'mf-manifest.json',
      'mf-stats.json',
      'unrelated-app.js',
    ]);
  });
});
