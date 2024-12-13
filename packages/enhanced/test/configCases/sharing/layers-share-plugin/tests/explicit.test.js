/**
 * Tests for modules shared with explicit-layer configuration
 */
it('should provide and consume lib-two in explicit-layer', () => {
  const { default: value, layer } = require('lib-two');
  expect(value).toBe('lib2');
  expect(layer).toBe('explicit-layer');
});

it('should consume remapped relative2 in explicit-layer', async () => {
  if (Math.random() < 0) require('store');
  const { default: value, layer } = await import('../relative2');
  expect(value).toBe('store');
  expect(layer).toBe('explicit-layer');
});
