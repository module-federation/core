it('should only provide shared@2.0.0 due to exclude filter on v1', async () => {
  await __webpack_init_sharing__('default');

  const { version } = await import('shared');
  expect(version).toBe('1.0.0');

  const { version: versionInner } = await import('my-module');
  expect(versionInner).toBe('2.0.0');
});

it('should not have v1 in share scope due to exclude filter', async () => {
  const shareScope = __webpack_share_scopes__.default.shared;
  console.log('share scope', __webpack_share_scopes__.default);
  expect(shareScope['2.0.0']).toBeDefined();
  expect(shareScope['1.0.0']).toBeUndefined();
});
