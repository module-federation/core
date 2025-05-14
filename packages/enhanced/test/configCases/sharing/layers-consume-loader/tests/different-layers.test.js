/**
 * Tests for different layer configurations in shared module consumption
 */
it('should consume shared React module from differing-layer when test is in differing-layer', async () => {
  const { version, layer } = await import('react');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('differing-layer');
});

it('should consume React with explicit-layer override when importing index2 from differing-layer', async () => {
  const { dix, layer } = await import('react/index2');
  expect(dix).toBe('1.0.0');
  expect(layer).toBe('explicit-layer');
});
