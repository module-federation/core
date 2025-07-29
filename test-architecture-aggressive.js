const fs = require('fs');
const path = require('path');

console.log('=== AGGRESSIVE ARCHITECTURE TESTING ===\n');

// Test 1: Verify all documented imports and exports
console.log('TEST 1: Import Path and Export Verification\n');

const tests = {
  sdk: {
    path: './packages/sdk/dist/index.cjs.cjs',
    expectedExports: [
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
    ]
  },
  runtimeCore: {
    path: './packages/runtime-core/dist/index.cjs.cjs',
    expectedExports: ['ModuleFederation', 'RemoteHandler', 'SharedHandler', 'SnapshotHandler']
  },
  runtime: {
    path: './packages/runtime/dist/index.cjs.cjs',
    expectedExports: ['loadRemote', 'loadShare', 'init', 'registerRemotes']
  },
  bundlerRuntime: {
    path: './packages/webpack-bundler-runtime/dist/index.cjs.cjs',
    expectedExports: ['Federation', 'attachShareScopeMap', 'initContainerEntry']
  },
  enhanced: {
    path: './packages/enhanced/dist/src/index.cjs',
    expectedExports: ['ModuleFederationPlugin']
  },
  errorCodes: {
    path: './packages/error-codes/dist/index.cjs',
    expectedExports: ['getShortErrorMsg', 'RUNTIME_004', 'RUNTIME_007']
  }
};

Object.entries(tests).forEach(([name, test]) => {
  try {
    const module = require(test.path);
    const moduleExports = Object.keys(module);
    console.log(`✓ ${name} loaded successfully`);
    console.log(`  Exports found: ${moduleExports.join(', ')}`);
    
    const missingExports = test.expectedExports.filter(exp => !moduleExports.includes(exp));
    if (missingExports.length > 0) {
      console.log(`  ✗ MISSING EXPORTS: ${missingExports.join(', ')}`);
      console.log(`  ✗ DOCUMENTATION LIES ABOUT ${name} EXPORTS!`);
    }
    
    // Find undocumented exports
    const undocumentedExports = moduleExports.filter(exp => 
      !test.expectedExports.includes(exp) && exp !== 'default'
    );
    if (undocumentedExports.length > 0) {
      console.log(`  ⚠️  UNDOCUMENTED EXPORTS: ${undocumentedExports.join(', ')}`);
    }
  } catch (e) {
    console.log(`✗ ${name} FAILED TO LOAD: ${e.message}`);
  }
  console.log('');
});

// Test 2: Verify dependency hierarchy
console.log('\nTEST 2: Dependency Hierarchy Verification\n');

const checkDependencies = (pkgName, pkgPath) => {
  try {
    const pkgJson = require(path.join(pkgPath, 'package.json'));
    const deps = Object.keys(pkgJson.dependencies || {});
    const peerDeps = Object.keys(pkgJson.peerDependencies || {});
    
    console.log(`${pkgName}:`);
    console.log(`  Dependencies: ${deps.join(', ') || 'NONE'}`);
    if (peerDeps.length > 0) {
      console.log(`  PeerDependencies: ${peerDeps.join(', ')}`);
    }
    
    // Check for violations
    if (pkgName === 'sdk') {
      if (deps.length > 0) {
        console.log(`  ✗ SDK HAS DEPENDENCIES! Documentation claims it's foundation with no deps - LIES!`);
      }
    }
    
    if (pkgName === 'runtime-core') {
      const allowedDeps = ['@module-federation/sdk', '@module-federation/error-codes'];
      const violations = deps.filter(d => !allowedDeps.some(allowed => d.includes(allowed)));
      if (violations.length > 0) {
        console.log(`  ✗ ILLEGAL DEPENDENCIES: ${violations.join(', ')}`);
        console.log(`  ✗ Documentation claims only SDK and error-codes dependencies - LIES!`);
      }
    }
    
    // Check if lower layers depend on higher layers (violation)
    if (pkgName === 'sdk' || pkgName === 'error-codes') {
      const higherLayerDeps = deps.filter(d => 
        d.includes('runtime') || d.includes('enhanced') || d.includes('webpack-bundler')
      );
      if (higherLayerDeps.length > 0) {
        console.log(`  ✗ ARCHITECTURE VIOLATION: Foundation layer depends on higher layers: ${higherLayerDeps.join(', ')}`);
      }
    }
    
    if (pkgName === 'runtime-core') {
      const higherLayerDeps = deps.filter(d => 
        d.includes('@module-federation/runtime') || 
        d.includes('enhanced') || 
        d.includes('webpack-bundler')
      );
      if (higherLayerDeps.length > 0) {
        console.log(`  ✗ ARCHITECTURE VIOLATION: Core depends on higher layers: ${higherLayerDeps.join(', ')}`);
      }
    }
    
    return deps;
  } catch (e) {
    console.log(`${pkgName}: ✗ FAILED TO READ package.json: ${e.message}`);
    return [];
  }
};

const packages = [
  ['sdk', './packages/sdk'],
  ['error-codes', './packages/error-codes'],
  ['runtime-core', './packages/runtime-core'],
  ['runtime', './packages/runtime'],
  ['webpack-bundler-runtime', './packages/webpack-bundler-runtime'],
  ['enhanced', './packages/enhanced']
];

packages.forEach(([name, path]) => {
  checkDependencies(name, path);
  console.log('');
});

// Test 3: Test global state claims
console.log('\nTEST 3: Global State Testing\n');

// Try to access __FEDERATION__ global
console.log('Checking global.__FEDERATION__:');
if (typeof global.__FEDERATION__ !== 'undefined') {
  console.log('  ✓ __FEDERATION__ exists');
  console.log('  Properties:', Object.keys(global.__FEDERATION__));
} else {
  console.log('  ⚠️  __FEDERATION__ does not exist (needs runtime initialization)');
}

// Test 4: Try to create circular dependencies
console.log('\nTEST 4: Circular Dependency Test\n');

try {
  // Try to make SDK depend on runtime (should fail if architecture is enforced)
  console.log('Attempting to create circular dependency...');
  // This would be in actual code - just documenting the test
  console.log('  ⚠️  Cannot test circular dependencies without modifying source');
} catch (e) {
  console.log('  Error:', e.message);
}

// Test 5: Check for hidden dependencies via file analysis
console.log('\nTEST 5: Hidden Dependencies Analysis\n');

const analyzeImports = (filePath, packageName) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /(?:import|require)\s*\(?['"](@module-federation\/[^'"]+)['"]\)?/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      if (!imports.includes(match[1])) {
        imports.push(match[1]);
      }
    }
    
    if (imports.length > 0) {
      console.log(`${packageName} imports: ${imports.join(', ')}`);
      
      // Check for architectural violations
      if (packageName.includes('sdk') && imports.some(i => i.includes('runtime'))) {
        console.log(`  ✗ ARCHITECTURE VIOLATION: SDK imports from runtime!`);
      }
    }
    
    return imports;
  } catch (e) {
    // Silently skip if file doesn't exist
    return [];
  }
};

// Check source files for hidden imports
console.log('Analyzing source files for hidden dependencies...');
analyzeImports('./packages/sdk/src/index.ts', 'sdk/src/index.ts');
analyzeImports('./packages/runtime-core/src/index.ts', 'runtime-core/src/index.ts');
analyzeImports('./packages/runtime/src/index.ts', 'runtime/src/index.ts');

// Test 6: Plugin initialization order test
console.log('\nTEST 6: Plugin Initialization Order Claims\n');

try {
  const enhanced = require('./packages/enhanced/dist/src/index.cjs');
  if (enhanced.ModuleFederationPlugin) {
    console.log('✓ ModuleFederationPlugin found');
    console.log('  ⚠️  Cannot verify plugin initialization order without webpack instance');
    console.log('  Documentation claims specific order - UNVERIFIED');
  }
} catch (e) {
  console.log('✗ Failed to load enhanced package:', e.message);
}

// Test 7: Check for undocumented global mutations
console.log('\nTEST 7: Global Mutations Check\n');

const globalKeysBefore = Object.keys(global);
try {
  // Try to load runtime to see if it mutates globals
  require('./packages/runtime/dist/index.cjs.cjs');
  const globalKeysAfter = Object.keys(global);
  const newGlobals = globalKeysAfter.filter(k => !globalKeysBefore.includes(k));
  
  if (newGlobals.length > 0) {
    console.log(`✗ UNDOCUMENTED GLOBAL MUTATIONS: ${newGlobals.join(', ')}`);
  } else {
    console.log('✓ No unexpected global mutations detected');
  }
} catch (e) {
  console.log('  Could not test global mutations:', e.message);
}

console.log('\n=== AGGRESSIVE TESTING COMPLETE ===');
console.log('\nSUMMARY OF LIES AND VIOLATIONS FOUND:');
console.log('1. Check console output above for all ✗ marks');
console.log('2. Documentation makes claims that cannot be verified without runtime');
console.log('3. Some architectural boundaries may not be enforced at build time');
console.log('4. Global state behavior needs runtime testing to fully verify');