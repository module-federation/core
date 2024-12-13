/**
 * Tests for modules shared with different-layer configuration
 */
it('should provide and consume lib1 in different-layer', async () => {
  const { default: value, layer } = await import('lib1');
  expect(value).toBe('lib1');
  expect(layer).toBe('different-layer');
});

it('should provide and consume relative1 in different-layer', async () => {
  const { default: value, layer } = await import('../relative1');
  expect(value).toBe('rel1');
  expect(layer).toBe('different-layer');
});
