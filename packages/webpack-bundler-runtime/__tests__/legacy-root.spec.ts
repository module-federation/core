import * as legacyRoot from '../src/index';

describe('legacy root keeps the keys rspack copies onto federation', () => {
  test('keeps the default export keys', () => {
    expect(Object.keys(legacyRoot.default)).toEqual([
      'runtime',
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

  test('keeps the named exports', () => {
    expect(Object.keys(legacyRoot).sort()).toEqual(
      [
        'attachShareScopeMap',
        'bundlerRuntime',
        'bundlerRuntimeOptions',
        'default',
        'initOptions',
        'instance',
        'runtime',
      ].sort(),
    );
  });

  test('keeps federation.runtime as the runtime namespace', () => {
    expect(typeof legacyRoot.default.runtime!.init).toBe('function');
    expect(legacyRoot.runtime).toBe(legacyRoot.default.runtime);
  });
});
