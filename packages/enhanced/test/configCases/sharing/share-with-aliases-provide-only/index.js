it('should share aliased-only react without direct target import', async () => {
  // The aliased bare import should resolve to the shared module id for the target
  const reactModuleId = require.resolve('react');
  const targetModuleId = require.resolve('next/dist/compiled/react');
  expect(reactModuleId).toBe(targetModuleId);
  expect(reactModuleId).toMatch(/webpack\/sharing/);

  // Import only the aliased name and ensure it is the compiled/react target
  const reactViaAlias = await import('react');
  expect(reactViaAlias.source).toBe('node_modules/next/dist/compiled/react');
  expect(reactViaAlias.name).toBe('next-compiled-react');
  expect(reactViaAlias.createElement()).toBe(
    'CORRECT-next-compiled-react-element',
  );

  // Ensure it is a shared instance
  expect(reactViaAlias.instanceId).toBe('next-compiled-react-shared-instance');
});

module.exports = {
  testName: 'share-with-aliases-provide-only',
};
