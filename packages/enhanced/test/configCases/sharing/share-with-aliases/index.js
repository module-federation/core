// Test case for webpack alias resolution with ModuleFederationPlugin
// This test demonstrates that Module Federation doesn't properly resolve aliases when determining shared modules
// We test two types of aliases:
// 1. resolve.alias (global aliases) - using the Next.js react pattern
// 2. module.rules[].resolve.alias (rule-specific aliases) - using a different library

it('should share modules via aliases', async () => {
  // TEST 1: resolve.alias pattern (Next.js style)
  console.log(
    'Testing resolve.alias pattern with react → next/dist/compiled/react...',
  );

  // Import react using the global alias (should resolve to next/dist/compiled/react)
  const reactViaAlias = await import('react');
  // Import the Next.js compiled version directly
  const reactDirect = await import('next/dist/compiled/react');

  // Check if the alias is working correctly (it resolves to Next.js compiled version)
  expect(reactViaAlias.source).toBe('node_modules/next/dist/compiled/react');
  expect(reactViaAlias.name).toBe('next-compiled-react');
  expect(reactViaAlias.createElement()).toBe(
    'CORRECT-next-compiled-react-element',
  );

  // TEST 2: module.rules[].resolve.alias pattern (rule-based alias)
  console.log(
    'Testing module.rules[].resolve.alias pattern with lib-b → lib-b-vendor...',
  );

  // Import lib-b using the rule-based alias (should resolve to lib-b-vendor)
  const libBViaAlias = await import('lib-b');
  // Import the vendor version directly
  const libBDirect = await import('lib-b-vendor');

  // Check if the loader alias is working correctly (it resolves to vendor version)
  expect(libBViaAlias.source).toBe('node_modules/lib-b-vendor');
  expect(libBViaAlias.name).toBe('vendor-lib-b');
  expect(libBViaAlias.getValue()).toBe('CORRECT-vendor-lib-b-value');

  // CRITICAL TESTS: Check if both are the same shared module instance
  // If Module Federation's sharing is working correctly with aliases,
  // the aliased imports and direct imports should be the EXACT SAME module object

  console.log('Checking if modules are shared instances...');
  console.log('react via alias instanceId:', reactViaAlias.instanceId);
  console.log('react direct instanceId:', reactDirect.instanceId);
  console.log('lib-b via alias instanceId:', libBViaAlias.instanceId);
  console.log('lib-b direct instanceId:', libBDirect.instanceId);

  // This test SHOULD FAIL if Module Federation doesn't resolve aliases
  // when determining shared modules

  // Test that resolve.alias modules are the same object reference
  // This tests the Next.js pattern where 'react' → 'next/dist/compiled/react'
  expect(reactViaAlias).toBe(reactDirect);

  // Test that module.rules[].resolve.alias modules are the same object reference
  expect(libBViaAlias).toBe(libBDirect);

  // Also test the instanceId to be thorough
  expect(reactViaAlias.instanceId).toBe(reactDirect.instanceId);
  expect(reactViaAlias.instanceId).toBe('next-compiled-react-shared-instance');

  expect(libBViaAlias.instanceId).toBe(libBDirect.instanceId);
  expect(libBViaAlias.instanceId).toBe('vendor-lib-b-shared-instance');
});

// Export test metadata
module.exports = {
  testName: 'share-with-aliases-test',
};
