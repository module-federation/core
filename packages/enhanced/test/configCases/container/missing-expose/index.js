it('should finish the build and reject get() for an expose that does not resolve', async () => {
  const container = __non_webpack_require__('./container-file.js');
  await expect(
    Promise.resolve().then(() => container.get('./Missing')),
  ).rejects.toEqual(
    expect.objectContaining({
      code: 'MODULE_NOT_FOUND',
      message: "Cannot find module './does-not-exist.js'",
    }),
  );
  const testFactory = await container.get('./test');
  expect(testFactory()).toBe('test');
});
