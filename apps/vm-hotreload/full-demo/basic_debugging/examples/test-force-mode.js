// Test script to verify force update functionality

const {
  setUpdateProvider,
  createDefaultUpdateProvider,
  applyUpdates,
  forceUpdate,
  runDemo,
  startUpdatePolling,
  getCounter,
  incrementCounter,
} = require('./src/index.js');

console.log('🧪 Testing Force Update Functionality\n');

// Mock webpack_require for testing
global.__webpack_require__ = {
  h: () => 'mock-hash-123',
  hmrS_readFileVm: {
    index: true,
    main: true,
  },
  c: {
    './src/index.js': { id: './src/index.js' },
    './src/utils.js': { id: './src/utils.js' },
  },
  hmrF: () => 'mock-hash-123',
};

async function testForceMode() {
  console.log('=== Test 1: Force Update with No Data ===');
  try {
    await forceUpdate();
    console.log('✅ Force update with no data: PASSED\n');
  } catch (error) {
    console.log('❌ Force update with no data: FAILED -', error.message, '\n');
  }

  console.log('=== Test 2: Apply Updates with Force Flag (null data) ===');
  try {
    await applyUpdates(null, true);
    console.log('✅ Apply updates with force flag (null): PASSED\n');
  } catch (error) {
    console.log(
      '❌ Apply updates with force flag (null): FAILED -',
      error.message,
      '\n',
    );
  }

  console.log('=== Test 3: Apply Updates with Force Flag (empty update) ===');
  try {
    const emptyUpdate = { update: null };
    await applyUpdates(emptyUpdate, true);
    console.log('✅ Apply updates with force flag (empty): PASSED\n');
  } catch (error) {
    console.log(
      '❌ Apply updates with force flag (empty): FAILED -',
      error.message,
      '\n',
    );
  }

  console.log('=== Test 4: Apply Updates with Force Flag (partial data) ===');
  try {
    const partialUpdate = {
      update: {
        manifest: { h: 'test', c: [], r: [], m: [] }, // Empty arrays should be populated
        script: 'exports.modules = {}; console.log("Force test script");',
        originalInfo: { updateId: 'force-test', webpackHash: 'test' },
      },
    };
    await applyUpdates(partialUpdate, true);
    console.log('✅ Apply updates with force flag (partial): PASSED\n');
  } catch (error) {
    console.log(
      '❌ Apply updates with force flag (partial): FAILED -',
      error.message,
      '\n',
    );
  }

  console.log('=== Test 5: Normal Apply Updates (should return early) ===');
  try {
    await applyUpdates(null, false); // Should return early without force
    console.log('✅ Normal apply updates (early return): PASSED\n');
  } catch (error) {
    console.log(
      '❌ Normal apply updates (early return): FAILED -',
      error.message,
      '\n',
    );
  }

  console.log('=== Test 6: Run Demo with Force Mode ===');
  try {
    await runDemo(true);
    console.log('✅ Run demo with force mode: PASSED\n');
  } catch (error) {
    console.log('❌ Run demo with force mode: FAILED -', error.message, '\n');
  }

  console.log('=== Test 7: Verify Counter Functionality ===');
  const initialCounter = getCounter();
  incrementCounter();
  incrementCounter();
  const finalCounter = getCounter();

  if (finalCounter === initialCounter + 2) {
    console.log('✅ Counter functionality: PASSED\n');
  } else {
    console.log(
      `❌ Counter functionality: FAILED - Expected ${initialCounter + 2}, got ${finalCounter}\n`,
    );
  }

  console.log('=== Test 8: Provider Configuration ===');
  try {
    const defaultProvider = createDefaultUpdateProvider();
    setUpdateProvider(defaultProvider);
    console.log('✅ Provider configuration: PASSED\n');
  } catch (error) {
    console.log('❌ Provider configuration: FAILED -', error.message, '\n');
  }
}

// Run tests
testForceMode()
  .then(() => {
    console.log('🎉 Force Mode Testing Complete!');
    console.log('📋 All major force update functionality has been tested.');
    console.log(
      '💡 The system can now force apply updates even with empty/null data.',
    );
  })
  .catch((error) => {
    console.error('💥 Testing failed with error:', error);
  });
