it('resolves each consumer against its own requiredVersion range', async () => {
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

  expect(require('pkg-a')).toBe('shared-dep@1.1.0');
  expect(require('pkg-b')).toBe('shared-dep@1.0.5');
  expect(require('shared-dep-explicit-wide')).toBe('shared-dep@1.1.0');
  expect(require('shared-dep-explicit-narrow')).toBe('shared-dep@1.0.5');
});
