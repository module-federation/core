/**
 * Tests for layer inheritance in shared modules
 */
it('Module Graph should have layered share', async () => {
  const { version, layer } = await import('../shared/react-boundary');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('react-layer');
});
