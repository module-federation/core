it('Module Graph should unlayered share', async () => {
  const {version, layer} = (await import('./async-boundary'));
  debugger;
  expect(version).toBe('1.0.0');
  expect(layer).toBeUndefined();
});
