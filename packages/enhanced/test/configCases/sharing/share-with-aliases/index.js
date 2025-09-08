it('should share modules via aliases', async () => {
  // Verify alias resolution yields the same shared module id
  const reactModuleId = require.resolve('react');
  const directReactModuleId = require.resolve('next/dist/compiled/react');
  expect(reactModuleId).toBe(directReactModuleId);
  expect(reactModuleId).toMatch(/webpack\/sharing/);
  expect(directReactModuleId).toMatch(/webpack\/sharing/);

  // Import aliased and direct React and assert identity + behavior
  const reactViaAlias = await import('react');
  const reactDirect = await import('next/dist/compiled/react');
  expect(reactViaAlias.source).toBe('node_modules/next/dist/compiled/react');
  expect(reactViaAlias.name).toBe('next-compiled-react');
  expect(reactViaAlias.createElement()).toBe(
    'CORRECT-next-compiled-react-element',
  );

  // Verify rule-based alias for lib-b behaves identically to direct vendor import
  const libBModuleId = require.resolve('lib-b');
  const libBVendorModuleId = require.resolve('lib-b-vendor');
  expect(libBModuleId).toBe(libBVendorModuleId);
  expect(libBModuleId).toMatch(/webpack\/sharing/);
  expect(libBVendorModuleId).toMatch(/webpack\/sharing/);

  const libBViaAlias = await import('lib-b');
  const libBDirect = await import('lib-b-vendor');
  expect(libBViaAlias.source).toBe('node_modules/lib-b-vendor');
  expect(libBViaAlias.name).toBe('vendor-lib-b');
  expect(libBViaAlias.getValue()).toBe('CORRECT-vendor-lib-b-value');

  // Identity checks for aliased vs direct imports
  expect(reactViaAlias.name).toBe(reactDirect.name);
  expect(reactViaAlias.source).toBe(reactDirect.source);
  expect(libBViaAlias.name).toBe(libBDirect.name);
  expect(libBViaAlias.source).toBe(libBDirect.source);

  // Instance id checks to ensure shared instances
  expect(reactViaAlias.instanceId).toBe(reactDirect.instanceId);
  expect(reactViaAlias.instanceId).toBe('next-compiled-react-shared-instance');
  expect(libBViaAlias.instanceId).toBe(libBDirect.instanceId);
  expect(libBViaAlias.instanceId).toBe('vendor-lib-b-shared-instance');
});

module.exports = {
  testName: 'share-with-aliases-test',
};
