// Test 1: Verify all documented imports actually work
console.log('=== TESTING IMPORT PATHS ===\n');

// Test SDK imports claimed in line 361-366
try {
  const sdk = require('./packages/sdk/dist/index.cjs.cjs');
  console.log('✓ SDK import works from local path');
  
  // Test specific exports claimed
  const expectedExports = [
    'ModuleFederationPluginOptions',
    'normalizeWebpackPath', 
    'createLogger',
    'generateSnapshotFromManifest',
    'isBrowserEnv',
    'loadScript',
    'createScript',
    'decodeName',
    'encodeName',
    'createModuleFederationConfig',
    'inferAutoPublicPath',
    'parseEntry',
    'simpleJoinRemoteEntry'
  ];
  
  const missingExports = [];
  expectedExports.forEach(exp => {
    if (!(exp in sdk)) {
      missingExports.push(exp);
      console.log(`✗ MISSING SDK EXPORT: ${exp}`);
    }
  });
  
  console.log('SDK exports found:', Object.keys(sdk).join(', '));
  
  if (missingExports.length > 0) {
    console.log(`✗ SDK EXPORTS MISMATCH - Documentation is LYING! Missing: ${missingExports.join(', ')}`);
  }
} catch (e) {
  console.log('✗ SDK import FAILED:', e.message);
}

// Test runtime-core imports claimed in line 372-373
try {
  const runtimeCore = require('./packages/runtime-core/dist');
  console.log('✓ Runtime-core import works');
  console.log('Runtime-core exports found:', Object.keys(runtimeCore).join(', '));
  
  // Check for claimed classes
  if (!runtimeCore.ModuleFederation) {
    console.log('✗ ModuleFederation class NOT FOUND - Documentation is LYING!');
  }
} catch (e) {
  console.log('✗ Runtime-core import FAILED:', e.message);
}

// Test runtime imports
try {
  const runtime = require('./packages/runtime/dist');
  console.log('✓ Runtime import works');
  console.log('Runtime exports found:', Object.keys(runtime).join(', '));
  
  // Check for claimed exports in line 107
  const expectedAPIs = ['loadRemote', 'loadShare', 'init', 'registerRemotes'];
  const missingAPIs = [];
  expectedAPIs.forEach(api => {
    if (!(api in runtime)) {
      missingAPIs.push(api);
      console.log(`✗ Runtime API '${api}' NOT FOUND - Documentation is LYING!`);
    }
  });
  
  if (missingAPIs.length > 0) {
    console.log(`✗ Runtime APIs MISSING: ${missingAPIs.join(', ')}`);
  }
} catch (e) {
  console.log('✗ Runtime import FAILED:', e.message);
}

// Test webpack-bundler-runtime
try {
  const bundlerRuntime = require('./packages/webpack-bundler-runtime/dist');
  console.log('✓ Webpack-bundler-runtime import works');
  console.log('Webpack-bundler-runtime exports found:', Object.keys(bundlerRuntime).join(', '));
} catch (e) {
  console.log('✗ Webpack-bundler-runtime import FAILED:', e.message);
}

// Test enhanced package
try {
  const enhanced = require('./packages/enhanced/dist');
  console.log('✓ Enhanced import works');
  console.log('Enhanced exports found:', Object.keys(enhanced).join(', '));
  
  // Check for ModuleFederationPlugin
  if (!enhanced.ModuleFederationPlugin) {
    console.log('✗ ModuleFederationPlugin NOT FOUND - Documentation is LYING!');
  }
} catch (e) {
  console.log('✗ Enhanced import FAILED:', e.message);
}

// Test error-codes package
try {
  const errorCodes = require('./packages/error-codes/dist');
  console.log('✓ Error-codes import works');
  console.log('Error-codes exports found:', Object.keys(errorCodes).join(', '));
  
  // Check for claimed exports
  if (!errorCodes.getShortErrorMsg) {
    console.log('✗ getShortErrorMsg NOT FOUND - Documentation is LYING!');
  }
} catch (e) {
  console.log('✗ Error-codes import FAILED:', e.message);
}

console.log('\n=== TESTING PACKAGE.JSON DEPENDENCIES ===\n');

// Check actual dependencies to verify architecture claims
const packagePaths = {
  '@module-federation/sdk': './packages/sdk/package.json',
  '@module-federation/runtime-core': './packages/runtime-core/package.json',
  '@module-federation/runtime': './packages/runtime/package.json',
  '@module-federation/webpack-bundler-runtime': './packages/webpack-bundler-runtime/package.json',
  '@module-federation/enhanced': './packages/enhanced/package.json'
};

Object.entries(packagePaths).forEach(([pkg, path]) => {
  try {
    const pkgJson = require(path);
    console.log(`\n${pkg} dependencies:`);
    console.log('Dependencies:', Object.keys(pkgJson.dependencies || {}));
    console.log('PeerDependencies:', Object.keys(pkgJson.peerDependencies || {}));
    
    // Verify dependency claims
    if (pkg === '@module-federation/runtime-core') {
      // Claims to depend only on SDK and error-codes (line 86)
      const deps = Object.keys(pkgJson.dependencies || {});
      const unexpectedDeps = deps.filter(d => 
        !d.includes('@module-federation/sdk') && 
        !d.includes('@module-federation/error-codes') &&
        !d.includes('source-map')
      );
      if (unexpectedDeps.length > 0) {
        console.log(`✗ UNDOCUMENTED DEPENDENCIES in runtime-core: ${unexpectedDeps.join(', ')}`);
        console.log('✗ Documentation claims runtime-core only depends on SDK and error-codes - THIS IS A LIE!');
      }
    }
    
    if (pkg === '@module-federation/runtime') {
      // Claims to depend on runtime-core, SDK, and error-codes (line 102)
      const deps = Object.keys(pkgJson.dependencies || {});
      const expectedDeps = ['@module-federation/runtime-core', '@module-federation/sdk', '@module-federation/error-codes'];
      const unexpectedDeps = deps.filter(d => !expectedDeps.some(exp => d.includes(exp)));
      if (unexpectedDeps.length > 0) {
        console.log(`✗ UNDOCUMENTED DEPENDENCIES in runtime: ${unexpectedDeps.join(', ')}`);
      }
    }
    
    if (pkg === '@module-federation/webpack-bundler-runtime') {
      // Claims to depend on runtime and SDK (line 116)
      const deps = Object.keys(pkgJson.dependencies || {});
      const expectedDeps = ['@module-federation/runtime', '@module-federation/sdk'];
      const hasRuntime = deps.some(d => d.includes('@module-federation/runtime'));
      const hasSdk = deps.some(d => d.includes('@module-federation/sdk'));
      
      if (!hasRuntime || !hasSdk) {
        console.log(`✗ MISSING EXPECTED DEPENDENCIES in webpack-bundler-runtime`);
        console.log(`  Has runtime: ${hasRuntime}, Has SDK: ${hasSdk}`);
        console.log(`  Actual deps: ${deps.join(', ')}`);
      }
    }
  } catch (e) {
    console.log(`Failed to read package.json for ${pkg}:`, e.message);
  }
});