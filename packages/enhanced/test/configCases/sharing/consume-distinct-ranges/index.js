it('should keep one consume module per requiredVersion range of the same hoisted dependency', async () => {
  await __webpack_init_sharing__('default');
  __webpack_share_scopes__['default'] = {
    'shared-dep': {
      '1.0.5': {
        get: () => () => 'shared-dep@1.0.5',
      },
      '1.1.0': {
        get: () => () => 'shared-dep@1.1.0',
      },
    },
  };

  const consumeModules = __STATS__.modules
    .filter((m) => m.moduleType === 'consume-shared-module')
    .map((m) => m.name)
    .sort();
  expect(consumeModules).toEqual([
    'consume shared module (default) shared-dep@^1.0.0',
    'consume shared module (default) shared-dep@~1.0.0',
  ]);

  expect(require('pkg-a')).toBe('shared-dep@1.1.0');
  expect(require('pkg-b')).toBe('shared-dep@1.0.5');
});
