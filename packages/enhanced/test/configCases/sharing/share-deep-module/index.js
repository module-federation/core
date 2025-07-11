it('should share a deep module path', async () => {
  await __webpack_init_sharing__('default');
  // Share scopes are available but we don't need to log them

  expect(
    __webpack_share_scopes__.default['shared/directory/thing'],
  ).toBeDefined();
  const { version } = await import('shared');
  const { version: versionInner } = await import('my-module');
  expect(version).toBe('1.0.0');
  expect(versionInner).toBe('2.0.0');
});
