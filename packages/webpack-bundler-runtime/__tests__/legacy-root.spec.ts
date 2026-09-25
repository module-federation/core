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
