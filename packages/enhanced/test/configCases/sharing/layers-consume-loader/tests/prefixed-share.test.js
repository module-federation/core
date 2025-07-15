/**
 * Tests for prefixed module sharing with different layers
 */
it('should consume thing1 from multi-pkg with multi-pkg-layer', async () => {
  const { version, layer } = await import('multi-pkg/thing1');
  expect(version).toBe('2.0.0');
  expect(layer).toBe('multi-pkg-layer');
});

it('should consume thing2 from multi-pkg with multi-pkg-layer', async () => {
  const { version, layer } = await import('multi-pkg/thing2');
  expect(version).toBe('2.0.0');
  expect(layer).toBe('multi-pkg-layer');
});
