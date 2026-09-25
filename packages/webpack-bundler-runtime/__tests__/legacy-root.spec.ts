import * as legacyRoot from '../src/index';

describe('legacy root keeps the keys rspack copies onto federation', () => {
  test('keeps the default export keys', () => {
    expect(Object.keys(legacyRoot.default)).toEqual([
      'instance',
      'initOptions',
      'bundlerRuntime',
      'attachShareScopeMap',
      'bundlerRuntimeOptions',
      'runtime',
    ]);
  });

  test('exposes every adapter without capability defines', () => {
    expect(Object.keys(legacyRoot.default.bundlerRuntime!).sort()).toEqual(
      [
        'I',
        'S',
        'consumes',
        'getSharedFallbackGetter',
        'init',
        'initContainerEntry',
        'installInitialConsumes',
        'remotes',
      ].sort(),
    );
  });

  test('ignores the removed capability defines', () => {
    const globals = globalThis as Record<string, unknown>;
    globals['FEDERATION_OPTIMIZE_NO_REMOTE'] = true;
    globals['FEDERATION_OPTIMIZE_NO_SHARED'] = true;
    globals['FEDERATION_HAS_EXPOSES'] = false;
    try {
      jest.isolateModules(() => {
        const root = require('../src/index') as typeof legacyRoot;
        expect(Object.keys(root.default.bundlerRuntime!)).toEqual(
          expect.arrayContaining([
            'remotes',
            'consumes',
            'I',
            'initContainerEntry',
          ]),
        );
      });
    } finally {
      delete globals['FEDERATION_OPTIMIZE_NO_REMOTE'];
      delete globals['FEDERATION_OPTIMIZE_NO_SHARED'];
      delete globals['FEDERATION_HAS_EXPOSES'];
    }
  });

  test('keeps the named exports', () => {
    expect(Object.keys(legacyRoot).sort()).toEqual(
      [
        'attachShareScopeMap',
        'bundlerRuntime',
        'bundlerRuntimeOptions',
        'default',
        'initOptions',
        'instance',
      ].sort(),
    );
  });

  test('keeps only runtime.init, not the runtime namespace', () => {
    expect(Object.keys(legacyRoot.default.runtime!)).toEqual(['init']);
    expect(legacyRoot).not.toHaveProperty('runtime');
  });

  test('rspack 1.x initializes through runtime.init on the copied keys', () => {
    // @rspack/core 1.7.9 moduleFederationDefaultRuntime: copy the keys, then call runtime.init.
    const federation: any = {};
    for (const key in legacyRoot.default) {
      federation[key] = (legacyRoot.default as any)[key];
    }
    federation.initOptions = { name: 'legacy-root-rspack1', remotes: [] };
    federation.instance = federation.runtime.init(federation.initOptions);
    expect(federation.instance.name).toBe('legacy-root-rspack1');
  });
});
