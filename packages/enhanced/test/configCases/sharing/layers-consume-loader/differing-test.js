it('Module graph should have a layer different layer', async () => {
  const { version, layer } = await import('react');
  expect(version).toBe('1.0.0');
  expect(layer).toBe('differing-layer');
});

it('Module graph should have a layer set explicitly thats not the inherited issuerLayer', async () => {
  const { dix, layer } = await import('react/index2');
  expect(dix).toBe('1.0.0');
  expect(layer).toBe('explicit-layer');
});
