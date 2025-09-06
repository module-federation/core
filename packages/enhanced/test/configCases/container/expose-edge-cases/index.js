it('should be able to handle spaces in path to exposes', async () => {
  const { default: test1 } = await import('./test 1');
  const { default: test2 } = await import('./path with spaces/test-2');
  expect(test1()).toBe('test 1');
  expect(test2()).toBe('test 2');
});
