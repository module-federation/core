// Federation Multi-Entry HMR Test - Similar to Next.js Pages
// This test isolates HMR issues by creating multiple entry points like Next.js

const {
  createCallbackUpdateProvider,
  setUpdateProvider,
  forceUpdate,
  getHMRStatus,
  getModuleState,
  applyUpdates,
} = require('../examples/demo/index.js');

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

// Simulate Next.js-like page structure
const pages = {
  home: {
    name: 'home',
    entry: './pages/home.js',
    remoteEntry: 'http://localhost:3000/remoteEntry.js',
    federated: true
  },
  shop: {
    name: 'shop', 
    entry: './pages/shop.js',
    remoteEntry: 'http://localhost:3001/remoteEntry.js',
    federated: true
  },
  about: {
    name: 'about',
    entry: './pages/about.js',
    remoteEntry: null,
    federated: false
  }
};

// Mock federation state
let federationState = {
  remoteHashes: {},
  moduleCache: new Map(),
  instances: [],
  hmrClient: null
};

// Mock remote entry content generator
function generateRemoteEntryContent(pageName, version = '1.0.0') {
  const content = `
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({
/******/
/******/ 	"./src/components/Page.js": ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
/******/ 		__webpack_require__.r(__webpack_exports__);
/******/ 		__webpack_require__.d(__webpack_exports__, {
/******/ 		  "default": () => __WEBPACK_DEFAULT_EXPORT__
/******/ 		});
/******/ 		
/******/ 		const Page = () => {
/******/ 		  return {
/******/ 		    name: '${pageName}',
/******/ 		    version: '${version}',
/******/ 		    timestamp: ${Date.now()},
/******/ 		    content: 'This is the ${pageName} page - version ${version}'
/******/ 		  };
/******/ 		};
/******/ 		
/******/ 		const __WEBPACK_DEFAULT_EXPORT__ = (Page);
/******/ 	})
/******/ });

var __webpack_exports__ = {};
__webpack_require__ = function(moduleId) {
  return __webpack_modules__[moduleId](null, __webpack_exports__, __webpack_require__);
};
__webpack_require__.r = function(exports) {
  Object.defineProperty(exports, '__esModule', { value: true });
};
__webpack_require__.d = function(exports, definition) {
  for(var key in definition) {
    Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
  }
};

// Module Federation container
var moduleMap = {
  "./Page": () => __webpack_require__("./src/components/Page.js")
};

var get = (module, getScope) => {
  __webpack_require__.R = getScope;
  getScope = (__webpack_require__.o(moduleMap, module) ? moduleMap[module] : () => { throw new Error('Module "' + module + '" does not exist in container.'); });
  __webpack_require__.R = undefined;
  return getScope();
};

var init = (shareScope, initScope) => {
  if (!__webpack_require__.S) __webpack_require__.S = {};
  var name = "${pageName}";
  var oldScope = __webpack_require__.S[name];
  if(oldScope && oldScope !== shareScope) throw new Error("Container initialization failed as it has already been initialized with a different share scope");
  __webpack_require__.S[name] = shareScope;
  return __webpack_require__.I(name, initScope);
};

// Expose container
__webpack_require__.R = undefined;
__webpack_require__.S = {};
__webpack_require__.I = function(name, initScope) { return Promise.resolve(); };
__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); };

var ${pageName} = {
  get: get,
  init: init
};

module.exports = ${pageName};
/******/ })();
`;
  return content;
}

// Simulate remote entry file changes 
async function simulateRemoteEntryChange(pageName, newVersion) {
  const content = generateRemoteEntryContent(pageName, newVersion);
  const hash = crypto.createHash('md5').update(content).digest('hex');
  
  console.log(`\n🔄 [Federation Multi-Entry] Simulating remote entry change for '${pageName}'`);
  console.log(`   Version: ${newVersion}`);
  console.log(`   Hash: ${hash}`);
  
  return { content, hash, version: newVersion };
}

// Federation-aware update provider
function createFederationUpdateProvider() {
  let updateCount = 0;
  
  return createCallbackUpdateProvider(async (currentHash) => {
    updateCount++;
    console.log(`\n📡 [Federation Provider] Checking for updates (check #${updateCount})...`);
    
    // Simulate different scenarios
    const scenarios = [
      { page: 'home', version: '1.0.1', probability: 0.3 },
      { page: 'shop', version: '1.0.2', probability: 0.3 },
      { page: 'home', version: '1.0.3', probability: 0.2 },
      { page: 'shop', version: '1.0.4', probability: 0.2 }
    ];
    
    // Pick a scenario based on update count
    const scenarioIndex = (updateCount - 1) % scenarios.length;
    const scenario = scenarios[scenarioIndex];
    
    if (Math.random() < scenario.probability || updateCount <= 4) {
      const { content, hash, version } = await simulateRemoteEntryChange(scenario.page, scenario.version);
      
      // Check if hash actually changed
      const currentPageHash = federationState.remoteHashes[scenario.page];
      if (currentPageHash === hash) {
        console.log(`   No changes detected for ${scenario.page} (hash: ${hash})`);
        return { update: null };
      }
      
      // Update our federation state
      federationState.remoteHashes[scenario.page] = hash;
      
      console.log(`   🔥 REMOTE CHANGE DETECTED for '${scenario.page}'!`);
      console.log(`   Old hash: ${currentPageHash || 'none'}`);
      console.log(`   New hash: ${hash}`);
      
      // Create federation-style update
      const update = {
        manifest: {
          h: hash,
          c: [`${scenario.page}-chunk`],
          r: currentPageHash ? [`${scenario.page}-chunk`] : [],
          m: [`./src/components/${scenario.page}/Page.js`]
        },
        script: `
exports.modules = {
  "./src/components/${scenario.page}/Page.js": function(module, exports, __webpack_require__) {
    const Page = () => ({
      name: '${scenario.page}',
      version: '${version}',
      timestamp: ${Date.now()},
      content: 'UPDATED: This is the ${scenario.page} page - version ${version}',
      hmrUpdated: true
    });
    module.exports = Page;
  }
};
exports.runtime = function(__webpack_require__) {
  console.log('[Federation HMR] Runtime patch applied for ${scenario.page} v${version}');
};
        `,
        originalInfo: {
          updateId: `federation-${scenario.page}-${version}-${Date.now()}`,
          webpackHash: hash,
          remoteName: scenario.page,
          version: version
        }
      };
      
      return { update };
    }
    
    console.log(`   No updates available (check #${updateCount})`);
    return { update: null };
  });
}

// Multi-entry HMR test runner
async function runMultiEntryHMRTest() {
  console.log('\n🚀 [Federation Multi-Entry] Starting HMR test...\n');
  
  // Setup
  console.log('📋 Setup:');
  console.log('  - Simulating Next.js-like multi-entry federation setup');
  console.log('  - Pages:', Object.keys(pages).join(', '));
  console.log('  - Each page has its own remote entry and federation container');
  
  // Initialize federation provider
  const federationProvider = createFederationUpdateProvider();
  setUpdateProvider(federationProvider);
  
  console.log('\n📊 Initial HMR Status:');
  const initialStatus = getHMRStatus();
  console.log('  - Webpack require available:', initialStatus.hasWebpackRequire);
  console.log('  - Module hot available:', initialStatus.hasModuleHot);
  console.log('  - Hot status:', initialStatus.hotStatus);
  console.log('  - Webpack hash:', initialStatus.webpackHash);
  
  console.log('\n🔄 Starting federation HMR simulation...\n');
  
  // Test 1: Normal update cycle
  console.log('TEST 1: Normal Federation Update Detection');
  for (let i = 1; i <= 3; i++) {
    console.log(`\n--- Update Cycle ${i} ---`);
    
    try {
      const updateData = await federationProvider();
      
      if (updateData && updateData.update) {
        console.log('✅ Update detected, applying...');
        
        const beforeState = getModuleState();
        const result = await applyUpdates(updateData);
        const afterState = getModuleState();
        
        if (result.success) {
          console.log('✅ Update applied successfully!');
          console.log('   Update ID:', result.updateId);
          console.log('   Reload count before:', beforeState.reloadCount);
          console.log('   Reload count after:', afterState.reloadCount);
          console.log('   Module state updated:', afterState.isUpdated);
        } else {
          console.log('❌ Update failed:', result.reason, result.error);
        }
      } else {
        console.log('ℹ️  No updates available');
      }
      
      // Wait between cycles
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log('❌ Update cycle failed:', error.message);
    }
  }
  
  // Test 2: Force mode (nuclear reset scenario)
  console.log('\n\nTEST 2: Force Mode (Nuclear Reset)');
  console.log('--- Simulating the nuclear reset scenario from current issue ---');
  
  try {
    console.log('🔥 Triggering force update (nuclear reset)...');
    
    const beforeState = getModuleState();
    const result = await forceUpdate();
    const afterState = getModuleState();
    
    if (result.success) {
      console.log('✅ Force update completed!');
      console.log('   Module reloaded:', afterState.reloadCount > beforeState.reloadCount);
      console.log('   State reset:', !beforeState.isUpdated || afterState.isUpdated);
    } else {
      console.log('❌ Force update failed:', result.reason, result.error);
    }
    
  } catch (error) {
    console.log('❌ Force update error:', error.message);
  }
  
  // Test 3: Multi-page simultaneous updates
  console.log('\n\nTEST 3: Multi-Page Updates (Stress Test)');
  console.log('--- Testing concurrent updates to multiple federation containers ---');
  
  const simultaneousUpdates = ['home', 'shop', 'about'].map(async (pageName, index) => {
    try {
      console.log(`🔄 Simulating update for ${pageName}...`);
      
      const { content, hash } = await simulateRemoteEntryChange(pageName, `2.${index}.0`);
      
      // Create page-specific update
      const update = {
        manifest: {
          h: hash,
          c: [`${pageName}-chunk`],
          r: [],
          m: [`./src/pages/${pageName}.js`]
        },
        script: `
exports.modules = {
  "./src/pages/${pageName}.js": function(module, exports, __webpack_require__) {
    const ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page = () => ({
      name: '${pageName}',
      version: '2.${index}.0',
      timestamp: ${Date.now()},
      isMultiUpdate: true
    });
    module.exports = ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page;
  }
};
        `,
        originalInfo: {
          updateId: `multi-${pageName}-${Date.now()}`,
          webpackHash: hash
        }
      };
      
      const result = await applyUpdates({ update });
      return { pageName, success: result.success, result };
      
    } catch (error) {
      return { pageName, success: false, error: error.message };
    }
  });
  
  const results = await Promise.allSettled(simultaneousUpdates);
  console.log('\n📊 Multi-page update results:');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { pageName, success } = result.value;
      console.log(`   ${success ? '✅' : '❌'} ${pageName}: ${success ? 'Success' : 'Failed'}`);
    } else {
      console.log(`   ❌ Update ${index}: Promise rejected`);
    }
  });
  
  // Final status
  console.log('\n📊 Final HMR Status:');
  const finalStatus = getHMRStatus();
  const finalState = getModuleState();
  
  console.log('  - Module reload count:', finalState.reloadCount);
  console.log('  - Last reload:', finalState.lastReload);
  console.log('  - Module updated:', finalState.isUpdated);
  console.log('  - Hot status:', finalStatus.hotStatus);
  console.log('  - Federation state:', {
    remoteHashes: Object.keys(federationState.remoteHashes).length,
    moduleCache: federationState.moduleCache.size
  });
  
  console.log('\n✅ Multi-entry federation HMR test completed!\n');
}

// Export for testing
module.exports = {
  runMultiEntryHMRTest,
  createFederationUpdateProvider,
  simulateRemoteEntryChange,
  generateRemoteEntryContent,
  pages,
  federationState
};

// Run if executed directly
if (require.main === module) {
  runMultiEntryHMRTest().catch(console.error);
}