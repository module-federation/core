/**
 * Tests for unlayered module consumption using default share configurations
 */
it('should consume React boundary module using default share configuration without layers', async () => {
  const { version, layer } = await import('../shared/react-boundary');
  expect(version).toBe('1.0.0');
  expect(layer).toBeUndefined();
});

it('should consume lib-two v1.3.4 using default non-eager share configuration', async () => {
  const { version, layer } = await import('lib-two');
  expect(version).toBe('1.3.4');
  expect(layer).toBe(undefined);
});
