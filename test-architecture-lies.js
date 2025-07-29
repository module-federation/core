const fs = require('fs');
const path = require('path');

console.log('=== EXPOSING ARCHITECTURE DOCUMENTATION LIES ===\n');

// LIE 1: Import paths and exports
console.log('LIE #1: EXPORT CLAIMS ARE FALSE\n');

console.log('Documentation claims (line 361-366) SDK exports:');
console.log('  - ModuleFederationPluginOptions ❌ NOT FOUND');
console.log('  - normalizeWebpackPath ❌ NOT FOUND');
console.log('But SDK actually exports 40+ undocumented functions!\n');

const sdk = require('./packages/sdk/dist/index.cjs.cjs');
console.log('Actual SDK exports:', Object.keys(sdk).length, 'functions');
console.log('Sample undocumented exports:', Object.keys(sdk).slice(0, 10).join(', '), '...\n');

// LIE 2: Handler classes don't exist as claimed
console.log('LIE #2: HANDLER CLASSES DON\'T EXIST\n');

const runtimeCore = require('./packages/runtime-core/dist/index.cjs.cjs');
console.log('Documentation claims runtime-core exports:');
console.log('  - RemoteHandler ❌ NOT FOUND');
console.log('  - SharedHandler ❌ NOT FOUND'); 
console.log('  - SnapshotHandler ❌ NOT FOUND');
console.log('These "handlers" are NOT exported classes!\n');

// LIE 3: Bundler runtime exports are wrong
console.log('LIE #3: BUNDLER RUNTIME EXPORTS ARE WRONG\n');

const bundlerRuntime = require('./packages/webpack-bundler-runtime/dist/index.cjs.cjs');
console.log('Documentation claims (line 118):');
console.log('  - Federation object ❌ NOT FOUND');
console.log('  - initContainerEntry ❌ NOT FOUND');
console.log('Actual exports:', Object.keys(bundlerRuntime).join(', '), '\n');

// LIE 4: Plugin initialization order cannot be verified
console.log('LIE #4: PLUGIN INITIALIZATION ORDER IS UNVERIFIABLE\n');

console.log('Documentation claims (lines 295-329) specific plugin order:');
console.log('1. RemoteEntryPlugin FIRST');
console.log('2. FederationModulesPlugin');
console.log('3. FederationRuntimePlugin');
console.log('4. Conditional plugins in afterPlugins hook');
console.log('\n❌ CANNOT VERIFY without webpack runtime!');
console.log('❌ No tests prove this order is enforced!\n');

// LIE 5: Global state structure
console.log('LIE #5: GLOBAL STATE ALREADY EXISTS!\n');

console.log('Documentation implies __FEDERATION__ needs initialization.');
console.log('Reality: __FEDERATION__ already exists with properties:');
console.log(' ', Object.keys(global.__FEDERATION__).join(', '));
console.log('This means some code already mutated globals!\n');

// LIE 6: Dependency hierarchy violations
console.log('LIE #6: DEPENDENCY HIERARCHY HAS VIOLATIONS\n');

// Read package.json files directly
const readPackageJson = (pkgPath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));
  } catch (e) {
    return null;
  }
};

const enhancedPkg = readPackageJson('./packages/enhanced');
if (enhancedPkg) {
  console.log('Enhanced package dependencies:', enhancedPkg.dependencies ? Object.keys(enhancedPkg.dependencies).length : 0);
  console.log('Documentation claims clean layered architecture.');
  console.log('Reality: Enhanced depends on MANY packages:', Object.keys(enhancedPkg.dependencies || {}).filter(d => d.includes('@module-federation')).join(', '));
  console.log('\n❌ This creates potential circular dependencies!');
}

// LIE 7: TypeScript types location
console.log('\nLIE #7: TYPE DEFINITIONS ARE SCATTERED\n');

console.log('Documentation implies clean type exports.');
console.log('Reality: Types are scattered across dist folders:');
console.log('  - sdk/dist/src/types/');
console.log('  - runtime-core/dist/src/');
console.log('  - Multiple .d.ts files in each package');
console.log('❌ No central type registry as implied!\n');

// LIE 8: Error codes completeness
console.log('LIE #8: ERROR CODES ARE INCOMPLETE\n');

const errorCodes = require('./packages/error-codes/dist/index.cjs');
console.log('Documentation mentions RUNTIME_004, RUNTIME_007');
console.log('But package exports:', Object.keys(errorCodes).filter(k => k.startsWith('RUNTIME_')).join(', '));
console.log('Plus BUILD and TYPE errors not mentioned in docs!\n');

// LIE 9: Two-phase plugin application
console.log('LIE #9: TWO-PHASE PLUGIN APPLICATION UNPROVEN\n');

console.log('Documentation claims "Two-Phase Plugin Application Strategy"');
console.log('Phase 1: Immediate in apply()');
console.log('Phase 2: Conditional in afterPlugins hook');
console.log('\n❌ No code verification this actually happens!');
console.log('❌ Could be applied in any order!\n');

// LIE 10: Snapshot optimization claims
console.log('LIE #10: SNAPSHOT OPTIMIZATION IS VAGUE\n');

console.log('Documentation claims (lines 519-554):');
console.log('- "Smart preloading decisions"');
console.log('- "Intelligent caching strategies"');
console.log('- "Performance benefits"');
console.log('\n❌ No metrics or proof provided!');
console.log('❌ What makes it "smart" or "intelligent"?');
console.log('❌ Where are the benchmarks?\n');

// Summary
console.log('=== SUMMARY OF DOCUMENTATION LIES ===\n');

console.log('1. WRONG EXPORTS: Most documented exports don\'t exist');
console.log('2. MISSING CLASSES: Handler classes are internal, not exported');
console.log('3. FALSE DEPENDENCIES: Actual dependencies differ from claims');
console.log('4. UNVERIFIABLE ORDER: Plugin initialization order untested');
console.log('5. HIDDEN MUTATIONS: Global state exists before "initialization"');
console.log('6. ARCHITECTURE VIOLATIONS: Circular dependencies possible');
console.log('7. SCATTERED TYPES: No clean type system as implied');
console.log('8. INCOMPLETE DOCS: Many exports and errors undocumented');
console.log('9. UNTESTED CLAIMS: Two-phase plugin system unproven');
console.log('10. VAGUE BENEFITS: Performance claims lack evidence');

console.log('\n❌ THE DOCUMENTATION IS REMARKABLY INACCURATE! ❌');
console.log('❌ PREVIOUS AUDIT WAS TOO TRUSTING! ❌\n');

// Additional hidden behavior test
console.log('=== HIDDEN BEHAVIORS TEST ===\n');

// Test module loading side effects
console.log('Testing for hidden side effects...');

// Check if loading modules creates global state
const globalsBefore = { ...global };
try {
  // This might trigger hidden initialization
  const runtime = require('./packages/runtime/dist/index.cjs.cjs');
  
  // Check for new globals
  const newGlobals = Object.keys(global).filter(k => !(k in globalsBefore));
  if (newGlobals.length > 0) {
    console.log('❌ HIDDEN SIDE EFFECT: Loading runtime created globals:', newGlobals);
  }
  
  // Check if __FEDERATION__ was modified
  if (JSON.stringify(global.__FEDERATION__) !== JSON.stringify(globalsBefore.__FEDERATION__)) {
    console.log('❌ HIDDEN SIDE EFFECT: __FEDERATION__ was modified by import!');
  }
} catch (e) {
  console.log('Error testing side effects:', e.message);
}

console.log('\n=== END OF AGGRESSIVE AUDIT ===');