// Federation HMR Isolation Test - Separate test module to avoid self-update issues
// This module tests federation HMR without trying to update itself

const {
  createCallbackUpdateProvider,
  setUpdateProvider,
  forceUpdate,
  getHMRStatus,
  getModuleState,
  applyUpdates,
} = require('./demo/index.js');

const crypto = require('crypto');

// Mock remote entry content for testing
function createTestRemoteEntry(pageName, version = '1.0.0') {
  return `
// Mock federation remote entry for ${pageName} v${version}
var ${pageName}Container = {
  get: function(module) {
    return function() {
      return {
        name: '${pageName}',
        version: '${version}',
        timestamp: ${Date.now()},
        updated: true
      };
    };
  },
  init: function() { return Promise.resolve(); }
};
module.exports = ${pageName}Container;
`;
}

// Test federation HMR workflow
async function testFederationHMRWorkflow() {
  console.log('\n🧪 [Federation Isolate] Testing Federation HMR Workflow\n');
  
  // Step 1: Test update detection
  console.log('📡 Step 1: Testing Update Detection');
  
  let updateCount = 0;
  const testProvider = createCallbackUpdateProvider(async (currentHash) => {
    updateCount++;
    
    if (updateCount <= 3) {
      const pageName = ['home', 'shop', 'about'][updateCount - 1];
      const version = `1.0.${updateCount}`;
      const content = createTestRemoteEntry(pageName, version);
      const hash = crypto.createHash('md5').update(content).digest('hex');
      
      console.log(`   Update ${updateCount}: ${pageName} v${version} (hash: ${hash.substring(0, 8)}...)`);
      
      return {
        update: {
          manifest: {
            h: hash,
            c: [`${pageName}-chunk`],
            r: [],
            m: [`./src/${pageName}.js`]
          },
          script: `
exports.modules = {
  "./src/${pageName}.js": function(module, exports, __webpack_require__) {
    module.exports = {
      name: '${pageName}',
      version: '${version}',
      timestamp: ${Date.now()},
      source: 'HMR_UPDATED'
    };
  }
};
exports.runtime = function(__webpack_require__) {
  console.log('[Test] Runtime updated for ${pageName} v${version}');
};
          `,
          originalInfo: {
            updateId: `test-${pageName}-${version}`,
            webpackHash: hash
          }
        }
      };
    }
    
    return { update: null };
  });
  
  setUpdateProvider(testProvider);
  
  // Step 2: Test normal updates
  console.log('\n🔄 Step 2: Testing Normal Updates');
  for (let i = 1; i <= 3; i++) {
    console.log(`\n   Test Update ${i}:`);
    
    const beforeState = getModuleState();
    const updateData = await testProvider();
    
    if (updateData && updateData.update) {
      const result = await applyUpdates(updateData);
      const afterState = getModuleState();
      
      console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
      if (result.success) {
        console.log(`   Reload count: ${beforeState.reloadCount} → ${afterState.reloadCount}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Step 3: Test force mode (nuclear reset scenario)
  console.log('\n💥 Step 3: Testing Force Mode (Nuclear Reset)');
  
  try {
    const beforeState = getModuleState();
    const hmrStatus = getHMRStatus();
    
    console.log(`   Before force: HMR status = ${hmrStatus.hotStatus}, reload count = ${beforeState.reloadCount}`);
    
    // This is the problematic scenario from the main issue
    const result = await forceUpdate();
    const afterState = getModuleState();
    const newHmrStatus = getHMRStatus();
    
    console.log(`   After force: HMR status = ${newHmrStatus.hotStatus}, reload count = ${afterState.reloadCount}`);
    console.log(`   Force result: ${result.success ? '✅ Success' : '❌ Failed'}`);
    
    if (!result.success) {
      console.log(`   Force error: ${result.error}`);
      console.log(`   This is the issue we need to fix in the main codebase!`);
    }
    
  } catch (error) {
    console.log(`   Force update exception: ${error.message}`);
  }
  
  // Step 4: Test specific nuclear reset components
  console.log('\n🧹 Step 4: Testing Nuclear Reset Components');
  
  // Test individual nuclear reset steps
  const testNuclearResetSteps = () => {
    console.log('   Testing nuclear reset steps:');
    
    // Test 1: Webpack require cache clearing
    if (typeof __webpack_require__ !== 'undefined') {
      const cacheKeys = Object.keys(__webpack_require__.cache || {});
      console.log(`   - Webpack cache entries: ${cacheKeys.length}`);
      
      // Test clearing cache (without actually clearing)
      console.log(`   - Cache clear test: ${cacheKeys.length > 0 ? '✅ Has cache to clear' : 'ℹ️ No cache entries'}`);
    } else {
      console.log('   - ❌ __webpack_require__ not available');
    }
    
    // Test 2: Federation globals
    const gs = new Function('return globalThis')();
    const hasFederation = !!(gs.__FEDERATION__ && gs.__FEDERATION__.__INSTANCES__);
    console.log(`   - Federation globals: ${hasFederation ? '✅ Available' : 'ℹ️ Not found'}`);
    
    if (hasFederation) {
      console.log(`   - Federation instances: ${gs.__FEDERATION__.__INSTANCES__.length}`);
    }
    
    // Test 3: Module hot status
    const hotStatus = getHMRStatus();
    console.log(`   - HMR status: ${hotStatus.hotStatus}`);
    console.log(`   - Module hot available: ${hotStatus.hasModuleHot ? '✅' : '❌'}`);
  };
  
  testNuclearResetSteps();
  
  // Final summary
  console.log('\n📊 Test Summary:');
  const finalState = getModuleState();
  const finalStatus = getHMRStatus();
  
  console.log(`   - Total reloads: ${finalState.reloadCount}`);
  console.log(`   - Last reload: ${finalState.lastReload}`);
  console.log(`   - Module updated: ${finalState.isUpdated}`);
  console.log(`   - Final HMR status: ${finalStatus.hotStatus}`);
  
  if (finalStatus.hotStatus === 'abort') {
    console.log('\n⚠️  HMR Status is "abort" - this indicates the nuclear reset issue!');
    console.log('   This matches the behavior we see in the main Next.js federation setup.');
    console.log('   The issue is that force updates put HMR into abort state.');
  }
  
  console.log('\n✅ Federation HMR isolation test completed!\n');
}

// Auto-accept HMR for this test module
if (module.hot) {
  module.hot.accept(() => {
    console.log('[Federation Isolate] Module hot reloaded');
  });
}

module.exports = {
  testFederationHMRWorkflow,
  createTestRemoteEntry
};

// Run test if executed directly
if (require.main === module) {
  testFederationHMRWorkflow().catch(console.error);
}