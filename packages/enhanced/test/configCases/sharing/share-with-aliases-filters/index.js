it('should load direct compiled stub for aliased react when excluded by version filter', async () => {
  const mod = await import('react');
  // Validate we loaded the direct compiled stub (not the shared instance)
  expect(mod.name).toBe('compiled-react');
  expect(mod.source).toBe('node_modules/next/dist/compiled/react');
  expect(mod.createElement()).toBe('DIRECT-compiled-react-element');
});

it('should share aliased react-allowed when included by version filter', async () => {
  const viaAlias = await import('react-allowed');
  const direct = await import('next/dist/compiled/react-allowed');

  // Identity and behavior checks
  expect(viaAlias.name).toBe('compiled-react-allowed');
  expect(viaAlias.source).toBe('node_modules/next/dist/compiled/react-allowed');
  expect(viaAlias.createElement()).toBe(
    'SHARED-compiled-react-allowed-element',
  );

  // Identity should match direct import as well
  expect(viaAlias.name).toBe(direct.name);
  expect(viaAlias.source).toBe(direct.source);
});

module.exports = {
  testName: 'share-with-aliases-filters',
};
