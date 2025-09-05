// Test case for webpack alias resolution with ModuleFederationPlugin
// This test demonstrates that Module Federation doesn't properly resolve aliases when determining shared modules
// We test two types of aliases:
// 1. resolve.alias (global aliases) - using the Next.js react pattern
// 2. module.rules[].resolve.alias (rule-specific aliases) - using a different library

it('should share modules via aliases', async () => {
  // FIRST: Check module resolution before testing sharing
  console.log('Testing module resolution with require.resolve...');

  try {
    const reactResolved = require.resolve('react');
    const nextCompiledReactResolved = require.resolve(
      'next/dist/compiled/react',
    );

    console.log('react resolves to:', reactResolved);
    console.log(
      'next/dist/compiled/react resolves to:',
      nextCompiledReactResolved,
    );

    // CRITICAL TEST: If Module Federation properly handles aliases, both should resolve
    // to the SAME webpack sharing module ID since they point to the same location
    // The aliased import should get sharing treatment just like the direct import
    if (reactResolved !== nextCompiledReactResolved) {
      console.log(
        '❌ Module Federation alias handling BROKEN - different module IDs',
      );
      console.log(
        '   This means aliased imports are NOT being shared properly!',
      );

      // Check if they're both sharing modules or if one is missing sharing
      const reactIsShared = reactResolved.includes('webpack/sharing');
      const directIsShared =
        nextCompiledReactResolved.includes('webpack/sharing');

      console.log('   react is shared:', reactIsShared);
      console.log('   next/dist/compiled/react is shared:', directIsShared);

      if (!reactIsShared && directIsShared) {
        console.log(
          '   PROBLEM: Aliased import not shared, direct import is shared',
        );
      } else if (reactIsShared && !directIsShared) {
        console.log(
          '   PROBLEM: Direct import not shared, aliased import is shared',
        );
      } else {
        console.log('   PROBLEM: Both have different sharing module IDs');
      }
    } else {
      console.log(
        '✅ Module Federation alias handling working - same module ID',
      );
    }
  } catch (e) {
    console.log('Error resolving modules:', e.message);
  }

  // TEST 1: resolve.alias pattern (Next.js style)
  console.log(
    'Testing resolve.alias pattern with react → next/dist/compiled/react...',
  );

  // Import react using the global alias (should resolve to next/dist/compiled/react)
  const reactViaAlias = await import('react');
  // Import the Next.js compiled version directly
  const reactDirect = await import('next/dist/compiled/react');

  console.log('react via alias name:', reactViaAlias.name);
  console.log('react direct name:', reactDirect.name);
  console.log(
    'react via alias createElement():',
    reactViaAlias.createElement(),
  );

  // CRITICAL TEST: Both aliased and direct imports should resolve to same sharing module
  // This proves Module Federation properly handles aliases during sharing resolution
  const reactModuleId = require.resolve('react');
  const directModuleId = require.resolve('next/dist/compiled/react');

  console.log('Final check - react module ID:', reactModuleId);
  console.log('Final check - direct module ID:', directModuleId);

  // FAIL THE TEST if Module Federation doesn't handle aliases properly
  expect(reactModuleId).toBe(directModuleId);
  expect(reactModuleId).toMatch(/webpack\/sharing/);
  expect(directModuleId).toMatch(/webpack\/sharing/);

  // If aliases are NOT working, webpack will load the regular react module
  // and Module Federation won't share it because 'react' is not in shared config
  // This should FAIL if aliases aren't properly handled by Module Federation
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

  // CRITICAL TEST: Both aliased and direct imports should resolve to same sharing module
  // This proves Module Federation properly handles module.rules[].resolve.alias
  const libBModuleId = require.resolve('lib-b');
  const libBVendorModuleId = require.resolve('lib-b-vendor');

  console.log('lib-b resolves to:', libBModuleId);
  console.log('lib-b-vendor resolves to:', libBVendorModuleId);

  // Check if they're both sharing modules or if one is missing sharing
  const libBIsShared = libBModuleId.includes('webpack/sharing');
  const libBVendorIsShared = libBVendorModuleId.includes('webpack/sharing');

  console.log('lib-b is shared:', libBIsShared);
  console.log('lib-b-vendor is shared:', libBVendorIsShared);

  if (!libBIsShared && libBVendorIsShared) {
    console.log(
      '❌ PROBLEM: lib-b alias not shared, direct lib-b-vendor is shared',
    );
  } else if (libBIsShared && !libBVendorIsShared) {
    console.log(
      '❌ PROBLEM: Direct lib-b-vendor not shared, lib-b alias is shared',
    );
  } else if (libBModuleId !== libBVendorModuleId) {
    console.log(
      '❌ PROBLEM: lib-b and lib-b-vendor have different sharing module IDs',
    );
  } else {
    console.log('✅ lib-b alias handling working correctly');
  }

  // FAIL THE TEST if Module Federation doesn't handle rule-based aliases properly
  expect(libBModuleId).toBe(libBVendorModuleId);
  expect(libBModuleId).toMatch(/webpack\/sharing/);
  expect(libBVendorModuleId).toMatch(/webpack\/sharing/);

  // Validate that both resolve to the same package identity
  // We don't require the exact same object instance; it's sufficient that
  // the aliased and direct imports point to the same package (name/source)

  console.log('Checking if modules are shared instances...');
  console.log('react via alias instanceId:', reactViaAlias.instanceId);
  console.log('react direct instanceId:', reactDirect.instanceId);
  console.log('lib-b via alias instanceId:', libBViaAlias.instanceId);
  console.log('lib-b direct instanceId:', libBDirect.instanceId);

  // Ensure aliased and direct resolves have the same package identity
  expect(reactViaAlias.name).toBe(reactDirect.name);
  expect(reactViaAlias.source).toBe(reactDirect.source);
  expect(libBViaAlias.name).toBe(libBDirect.name);
  expect(libBViaAlias.source).toBe(libBDirect.source);

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
