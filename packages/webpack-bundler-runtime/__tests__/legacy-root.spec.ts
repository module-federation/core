import * as legacyRoot from '../src/index';

describe('legacy root keeps the keys rspack copies onto federation', () => {
  test('keeps the default export keys', () => {
    expect(Object.keys(legacyRoot.default)).toEqual([
      'instance',
      'initOptions',
      'bundlerRuntime',
      'attachShareScopeMap',
      'bundlerRuntimeOptions',
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

  test('has no federation.runtime namespace', () => {
    expect(legacyRoot.default).not.toHaveProperty('runtime');
    expect(legacyRoot).not.toHaveProperty('runtime');
  });
});
