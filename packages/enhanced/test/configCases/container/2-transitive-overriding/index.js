it('should allow transitive overrides (container-no-shared/a)', () => {
  return import('container-no-shared/a').then(({ value }) => {
    expect(value).toBe('new shared');
  });
});

it('should not override non-overridables (container-no-shared/b)', () => {
  return import('container-no-shared/b').then(({ value }) => {
    expect(value).toBe('shared');
  });
});

it('should have good module ids', async () => {
  const { default: m0 } = await import(
    'container-no-shared/modules-from-remote'
  );
  const { default: m1 } = await import('container-no-shared/modules');
  const m2 = Object.keys(__webpack_modules__).sort();
  [
    './b.js',
    './modules.js',
    'webpack/container/entry/container-with-shared',
    'webpack/sharing/consume/default/shared/./shared',
  ].forEach((id) => {
    expect(m0.includes(id)).toEqual(true);
  });

  [
    './a.js',
    './b.js',
    './modules-from-remote.js',
    './modules.js',
    'webpack/container/entry/container-no-shared',
    'webpack/container/reference/container-with-shared',
    'webpack/container/remote/container-with-shared/b',
    'webpack/container/remote/container-with-shared/modules',
  ].forEach((id) => {
    expect(m1.includes(id)).toEqual(true);
  });

  [
    './index.js',
    './shared.js',
    'webpack/container/reference/container-no-shared',
    'webpack/container/remote/container-no-shared/a',
    'webpack/container/remote/container-no-shared/b',
    'webpack/container/remote/container-no-shared/modules',
    'webpack/container/remote/container-no-shared/modules-from-remote',
  ].forEach((id) => {
    expect(m2.includes(id)).toEqual(true);
  });
});
