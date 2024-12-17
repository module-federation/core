it('should load module with correct layer from entry layer', async () => {
  const { version, layer } = await import('./async-boundary');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('module-layer');
});
