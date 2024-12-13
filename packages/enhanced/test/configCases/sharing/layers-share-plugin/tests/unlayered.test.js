/**
 * Tests for modules shared without layer configuration
 */
it('should provide and consume unlayered lib4', async () => {
  const { default: value, layer } = await import('lib4');
  expect(value).toBe('lib4');
  expect(layer).toBeUndefined();
});

it('should provide and consume unlayered relative3', async () => {
  const { default: value, layer } = await import('../relative3');
  expect(value).toBe('rel3');
  expect(layer).toBeUndefined();
});
