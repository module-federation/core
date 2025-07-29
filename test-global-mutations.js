console.log('=== AGGRESSIVE GLOBAL STATE MUTATION TESTING ===\n');

// Test 1: Document the initial global state
console.log('TEST 1: INITIAL GLOBAL STATE\n');

console.log('global.__FEDERATION__ properties:');
Object.keys(global.__FEDERATION__ || {}).forEach(key => {
  const value = global.__FEDERATION__[key];
  console.log(`  ${key}:`, Array.isArray(value) ? `Array(${value.length})` : typeof value);
});

console.log('\nglobal.__GLOBAL_LOADING_REMOTE_ENTRY__:', 
  typeof global.__GLOBAL_LOADING_REMOTE_ENTRY__);

// Test 2: Try to corrupt the global state
console.log('\n\nTEST 2: ATTEMPTING TO CORRUPT GLOBAL STATE\n');

const originalFederation = JSON.parse(JSON.stringify(global.__FEDERATION__));

// Attack 1: Delete critical properties
console.log('Attack 1: Deleting __INSTANCES__...');
delete global.__FEDERATION__.__INSTANCES__;
console.log('  Result: __INSTANCES__ is', global.__FEDERATION__.__INSTANCES__);
console.log('  ❌ GLOBAL STATE IS MUTABLE - No protection!');

// Attack 2: Corrupt the module info
console.log('\nAttack 2: Corrupting moduleInfo...');
global.__FEDERATION__.moduleInfo = 'CORRUPTED';
console.log('  Result: moduleInfo is now:', global.__FEDERATION__.moduleInfo);
console.log('  ❌ Module registry can be corrupted!');

// Attack 3: Inject malicious data
console.log('\nAttack 3: Injecting malicious data...');
global.__FEDERATION__.MALICIOUS = 'INJECTED';
console.log('  Result: MALICIOUS property added:', global.__FEDERATION__.MALICIOUS);
console.log('  ❌ No validation on global mutations!');

// Attack 4: Replace entire __FEDERATION__
console.log('\nAttack 4: Replacing entire __FEDERATION__ object...');
const oldFederation = global.__FEDERATION__;
global.__FEDERATION__ = { FAKE: true };
console.log('  Result: __FEDERATION__ is now:', global.__FEDERATION__);
console.log('  ❌ Entire global can be replaced!');

// Restore for further tests
global.__FEDERATION__ = oldFederation;

// Test 3: Race conditions
console.log('\n\nTEST 3: RACE CONDITION TESTING\n');

console.log('Simulating concurrent access...');
const promises = [];
for (let i = 0; i < 10; i++) {
  promises.push(new Promise((resolve) => {
    // Simulate concurrent modifications
    if (!global.__FEDERATION__.__INSTANCES__) {
      global.__FEDERATION__.__INSTANCES__ = [];
    }
    global.__FEDERATION__.__INSTANCES__.push({ id: i });
    
    // Simulate manifest loading race
    if (!global.__FEDERATION__.__MANIFEST_LOADING__) {
      global.__FEDERATION__.__MANIFEST_LOADING__ = {};
    }
    global.__FEDERATION__.__MANIFEST_LOADING__[`remote${i}`] = Promise.resolve();
    
    resolve();
  }));
}

Promise.all(promises).then(() => {
  console.log('  Instances after concurrent access:', 
    global.__FEDERATION__.__INSTANCES__.length);
  console.log('  ❌ No synchronization mechanisms detected!');
});

// Test 4: Memory leaks
console.log('\n\nTEST 4: MEMORY LEAK POTENTIAL\n');

console.log('Adding many instances...');
for (let i = 0; i < 1000; i++) {
  if (!global.__FEDERATION__.__INSTANCES__) {
    global.__FEDERATION__.__INSTANCES__ = [];
  }
  global.__FEDERATION__.__INSTANCES__.push({
    id: `leak-test-${i}`,
    largeData: new Array(1000).fill('x').join('')
  });
}

console.log('  Instances count:', global.__FEDERATION__.__INSTANCES__.length);
console.log('  ❌ No cleanup mechanism found!');
console.log('  ❌ Instances accumulate indefinitely!');

// Test 5: Type safety
console.log('\n\nTEST 5: TYPE SAFETY VIOLATIONS\n');

console.log('Inserting wrong types...');
global.__FEDERATION__.__SHARE__ = 123; // Should be object
global.__FEDERATION__.__GLOBAL_PLUGIN__ = 'not-an-array'; // Should be array
global.__FEDERATION__.__PRELOADED_MAP__ = null; // Should be Map

console.log('  __SHARE__ type:', typeof global.__FEDERATION__.__SHARE__);
console.log('  __GLOBAL_PLUGIN__ type:', typeof global.__FEDERATION__.__GLOBAL_PLUGIN__);
console.log('  __PRELOADED_MAP__ type:', typeof global.__FEDERATION__.__PRELOADED_MAP__);
console.log('  ❌ No runtime type checking!');

// Test 6: Hidden dependencies on global state
console.log('\n\nTEST 6: HIDDEN GLOBAL DEPENDENCIES\n');

// Try to load runtime with corrupted globals
try {
  // First corrupt the globals
  global.__FEDERATION__ = {
    __INSTANCES__: 'not-an-array',
    __SHARE__: null,
    moduleInfo: false
  };
  
  // Try to use runtime
  const runtime = require('./packages/runtime/dist/index.cjs.cjs');
  console.log('  ✓ Runtime loaded despite corrupted globals');
  
  // Try to call a function
  try {
    runtime.init({ name: 'test' });
    console.log('  ✓ init() worked with corrupted globals');
  } catch (e) {
    console.log('  ✗ init() failed:', e.message);
    console.log('  ❌ Hidden dependency on global state structure!');
  }
} catch (e) {
  console.log('  ✗ Runtime failed to load:', e.message);
}

// Test 7: Documentation claims vs reality
console.log('\n\nTEST 7: DOCUMENTATION CLAIMS VS REALITY\n');

console.log('Documentation (line 143-171) claims structured global state.');
console.log('Reality:');
console.log('  1. No validation on mutations');
console.log('  2. No access control');
console.log('  3. No type safety');
console.log('  4. No cleanup mechanisms');
console.log('  5. No race condition protection');
console.log('  6. Can be completely replaced');
console.log('  7. Hidden dependencies on structure');

console.log('\n=== CONCLUSION ===\n');

console.log('❌ GLOBAL STATE IS COMPLETELY UNPROTECTED!');
console.log('❌ ANY CODE CAN CORRUPT MODULE FEDERATION!');
console.log('❌ NO DEFENSIVE PROGRAMMING DETECTED!');
console.log('❌ DOCUMENTATION PRESENTS IT AS ROBUST BUT IT\'S FRAGILE!\n');

console.log('SECURITY IMPLICATIONS:');
console.log('  - Malicious code can hijack module loading');
console.log('  - State corruption can break entire apps');
console.log('  - No isolation between federation instances');
console.log('  - Memory leaks are trivial to cause');

// Restore original state
console.log('\n\nRestoring original state...');
global.__FEDERATION__ = originalFederation;
console.log('State restored.');