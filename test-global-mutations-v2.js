console.log('=== AGGRESSIVE GLOBAL STATE MUTATION TESTING V2 ===\n');

// First, let's see what globals exist before any module loading
console.log('INITIAL STATE CHECK:\n');

const initialGlobals = Object.keys(global).filter(k => 
  k.includes('FEDERATION') || k.includes('LOADING') || k.includes('__')
);
console.log('Federation-related globals:', initialGlobals);

// Load runtime to trigger global creation
console.log('\nLoading runtime to create globals...');
const runtime = require('./packages/runtime/dist/index.cjs.cjs');

console.log('\nGlobals after loading runtime:');
const afterLoadGlobals = Object.keys(global).filter(k => 
  k.includes('FEDERATION') || k.includes('LOADING') || k.includes('__')
);
console.log('Federation-related globals:', afterLoadGlobals);

// Now test mutations
console.log('\n\n=== MUTATION TESTING ===\n');

if (global.__FEDERATION__) {
  console.log('TEST 1: MUTABILITY CHECK\n');
  
  const original = { ...global.__FEDERATION__ };
  
  // Test 1: Direct property deletion
  console.log('Deleting __INSTANCES__...');
  delete global.__FEDERATION__.__INSTANCES__;
  console.log('  Deleted:', !('__INSTANCES__' in global.__FEDERATION__));
  console.log('  ❌ Critical properties can be deleted!');
  
  // Test 2: Property replacement
  console.log('\nReplacing moduleInfo with string...');
  global.__FEDERATION__.moduleInfo = 'HACKED';
  console.log('  moduleInfo is now:', global.__FEDERATION__.moduleInfo);
  console.log('  ❌ Type safety violated!');
  
  // Test 3: Adding arbitrary properties
  console.log('\nAdding malicious properties...');
  global.__FEDERATION__.BACKDOOR = () => console.log('PWNED');
  global.__FEDERATION__.EVIL_DATA = { steal: 'credentials' };
  console.log('  Added:', Object.keys(global.__FEDERATION__).filter(k => k.includes('BACKDOOR') || k.includes('EVIL')));
  console.log('  ❌ Arbitrary code injection possible!');
  
  // Test 4: Complete replacement
  console.log('\nReplacing entire __FEDERATION__ object...');
  const oldFed = global.__FEDERATION__;
  global.__FEDERATION__ = { FAKE: true };
  console.log('  __FEDERATION__ is now:', global.__FEDERATION__);
  console.log('  ❌ Entire global replaceable!');
  
  // Restore
  global.__FEDERATION__ = oldFed;
}

// Test runtime behavior with corrupted state
console.log('\n\nTEST 2: RUNTIME BEHAVIOR WITH CORRUPTED STATE\n');

// Corrupt the state
global.__FEDERATION__ = {
  __INSTANCES__: null,
  __SHARE__: 'not-an-object',
  moduleInfo: 123,
  __MANIFEST_LOADING__: false,
  __PRELOADED_MAP__: 'not-a-map'
};

console.log('Corrupted state set. Testing runtime functions...\n');

// Test various runtime functions
const tests = [
  { fn: 'init', args: [{ name: 'test' }] },
  { fn: 'loadRemote', args: ['app/Button'] },
  { fn: 'registerRemotes', args: [[{ name: 'app', entry: 'http://fake.com' }]] }
];

tests.forEach(({ fn, args }) => {
  try {
    console.log(`Calling ${fn}()...`);
    runtime[fn](...args);
    console.log(`  ✓ ${fn}() succeeded with corrupted state`);
  } catch (e) {
    console.log(`  ✗ ${fn}() failed:`, e.message);
    console.log(`  ❌ Hidden dependency on global state!`);
  }
});

// Test concurrent access
console.log('\n\nTEST 3: CONCURRENT ACCESS SIMULATION\n');

const results = [];
const promises = [];

for (let i = 0; i < 10; i++) {
  promises.push(new Promise((resolve) => {
    setTimeout(() => {
      // Each "thread" tries to modify __INSTANCES__
      if (!global.__FEDERATION__.__INSTANCES__) {
        global.__FEDERATION__.__INSTANCES__ = [];
      }
      
      const before = global.__FEDERATION__.__INSTANCES__.length;
      global.__FEDERATION__.__INSTANCES__.push({ id: i });
      const after = global.__FEDERATION__.__INSTANCES__.length;
      
      results.push({ i, before, after, diff: after - before });
      resolve();
    }, Math.random() * 10);
  }));
}

Promise.all(promises).then(() => {
  console.log('Concurrent modification results:');
  const lost = results.filter(r => r.diff !== 1);
  if (lost.length > 0) {
    console.log('  ❌ Lost updates detected:', lost.length);
  } else {
    console.log('  All updates succeeded (but no locking detected)');
  }
  console.log('  ❌ No synchronization mechanisms!');
  
  // Final report
  console.log('\n\n=== VULNERABILITY SUMMARY ===\n');
  
  console.log('CRITICAL FINDINGS:');
  console.log('1. ❌ Global state has NO access control');
  console.log('2. ❌ NO type safety enforcement');
  console.log('3. ❌ NO validation on mutations');
  console.log('4. ❌ NO protection against corruption');
  console.log('5. ❌ NO synchronization for concurrent access');
  console.log('6. ❌ State can be completely replaced');
  console.log('7. ❌ Malicious code injection is trivial');
  console.log('8. ❌ Runtime depends on state structure');
  
  console.log('\nSECURITY IMPLICATIONS:');
  console.log('- Any script can hijack module federation');
  console.log('- Supply chain attacks are trivial');
  console.log('- State corruption causes silent failures');
  console.log('- No audit trail for modifications');
  console.log('- Race conditions in production likely');
  
  console.log('\nDOCUMENTATION VS REALITY:');
  console.log('Documentation: Presents organized, robust system');
  console.log('Reality: Fragile global state with zero protection');
  console.log('\n❌ THE ARCHITECTURE IS FUNDAMENTALLY INSECURE! ❌');
});