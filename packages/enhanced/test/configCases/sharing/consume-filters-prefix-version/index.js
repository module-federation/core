const consumedShareKeys = () =>
  Object.values(
    __webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping,
  ).map((data) => data.shareKey);

it('consumes a prefix match whose package version satisfies include.version', async () => {
  const mod = await import('lib-included/sub');
  expect(mod.default).toBe('lib-included/sub');
  expect(consumedShareKeys()).toContain('lib-included/sub');
});

it('does not consume a prefix match whose package version fails include.version', async () => {
  const mod = await import('lib/sub');
  expect(mod.default).toBe('lib/sub');
  expect(consumedShareKeys()).not.toContain('lib/sub');
});

it('does not consume a prefix match whose package version matches exclude.version', async () => {
  const mod = await import('lib-excluded/sub');
  expect(mod.default).toBe('lib-excluded/sub');
  expect(consumedShareKeys()).not.toContain('lib-excluded/sub');
});

it('consumes a relative request with include.version because it has no package name', async () => {
  const mod = await import('./src/local');
  expect(mod.default).toBe('local');
  expect(consumedShareKeys()).toContain('./src/local');
});

it('does not consume an aliased request whose packageName version fails include.version', async () => {
  const mod = await import('my-lib');
  expect(mod.default).toBe('lib');
  expect(consumedShareKeys()).not.toContain('my-lib');
});
