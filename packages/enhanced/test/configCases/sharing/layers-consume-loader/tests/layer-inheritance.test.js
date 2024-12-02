/**
 * Tests for layer inheritance chain: index-layer -> entry-layer -> react-layer
 */
it('should inherit react-layer through entry-layer when importing from index-layer', async () => {
  const { version, layer } = await import('../shared/react-boundary');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('react-layer');
});
