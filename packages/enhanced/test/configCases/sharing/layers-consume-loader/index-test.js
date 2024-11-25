it('Module Graph should have layerd share', async () => {
  const { version, layer } = await import('./async-boundary');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('react-layer');
});
