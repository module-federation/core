const { JSDOM } = require('jsdom');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { HMRClient } = require('../lib/hmr-client');

// Mock DOM environment for SSR
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;

// Simulate webpack module system for HMR
let currentModuleId = 0;
const moduleRegistry = {};

function createMockWebpackModule(moduleFactory, id = null) {
  const moduleId = id || `module_${++currentModuleId}`;
  const module = {
    id: moduleId,
    exports: {},
    hot: {
      active: true,
      _acceptedDependencies: {},
      _acceptedErrorHandlers: {},
      _disposeHandlers: [],
      _selfAccepted: false,
      _selfDeclined: false,
      _selfInvalidated: false,
      _main: false,
      accept: function(deps, callback) {
        if (typeof deps === 'function') {
          this._selfAccepted = callback || true;
        } else if (Array.isArray(deps)) {
          deps.forEach(dep => {
            this._acceptedDependencies[dep] = callback;
          });
        }
      },
      dispose: function(callback) {
        this._disposeHandlers.push(callback);
      },
      status: function() {
        return 'idle';
      }
    },
    children: [],
    parents: []
  };
  
  moduleRegistry[moduleId] = module;
  moduleFactory(module, module.exports, createMockRequire(moduleId));
  return module;
}

function createMockRequire(parentId) {
  return function mockRequire(moduleId) {
    if (moduleRegistry[moduleId]) {
      const parentModule = moduleRegistry[parentId];
      const childModule = moduleRegistry[moduleId];
      if (parentModule && childModule) {
        if (!parentModule.children.includes(moduleId)) {
          parentModule.children.push(moduleId);
        }
        if (!childModule.parents.includes(parentId)) {
          childModule.parents.push(parentId);
        }
      }
      return moduleRegistry[moduleId].exports;
    }
    return require(moduleId);
  };
}

// Create mock __webpack_require__
global.__webpack_require__ = function(moduleId) {
  if (moduleRegistry[moduleId]) {
    return moduleRegistry[moduleId].exports;
  }
  throw new Error(`Module ${moduleId} not found`);
};

__webpack_require__.m = {};
__webpack_require__.c = moduleRegistry;
__webpack_require__.h = () => 'mock-hash-' + Date.now();
__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
__webpack_require__.hmrD = {};

// Leaf component with HMR integration
function createLeafComponentModule(initialText, moduleId) {
  return createMockWebpackModule((module, exports, require) => {
    let currentText = initialText;
    
    function LeafComponent({ id, text = currentText }) {
      return React.createElement('span', { 
        id: id,
        'data-testid': `leaf-${id}`,
        'data-module-id': moduleId
      }, text);
    }
    
    // HMR acceptance
    if (module.hot) {
      module.hot.accept([], () => {
        console.log(`🔥 [HMR] Module ${moduleId} hot reloaded with new text: ${currentText}`);
      });
      
      module.hot.dispose(() => {
        console.log(`🗑️ [HMR] Module ${moduleId} disposed`);
      });
    }
    
    // Export update function for HMR simulation
    exports.updateText = function(newText) {
      currentText = newText;
      console.log(`📝 [HMR] Module ${moduleId} text updated to: ${newText}`);
    };
    
    exports.LeafComponent = LeafComponent;
    exports.getCurrentText = () => currentText;
    
    __webpack_require__.m[moduleId] = () => exports;
  }, moduleId);
}

// Container component
function createAppModule() {
  return createMockWebpackModule((module, exports, require) => {
    function App({ leafModules }) {
      return React.createElement('div', { 
        id: 'app',
        className: 'container'
      }, [
        React.createElement('h1', { key: 'title' }, 'SSR HMR Integration Test'),
        React.createElement('div', { key: 'content', className: 'content' }, 
          leafModules.map(leafModule => {
            const { LeafComponent } = leafModule.exports;
            return React.createElement(LeafComponent, {
              key: leafModule.id,
              id: leafModule.id
            });
          })
        )
      ]);
    }
    
    if (module.hot) {
      module.hot.accept(['./leaf1', './leaf2', './leaf3'], () => {
        console.log('🔥 [HMR] App module reloaded due to leaf module changes');
      });
    }
    
    exports.App = App;
  }, 'app_module');
}

// Create the component modules
const leaf1Module = createLeafComponentModule('Original Text 1', 'leaf1');
const leaf2Module = createLeafComponentModule('Original Text 2', 'leaf2');
const leaf3Module = createLeafComponentModule('Original Text 3', 'leaf3');
const appModule = createAppModule();

function renderToHTML(leafModules) {
  const { App } = appModule.exports;
  const appElement = React.createElement(App, { leafModules });
  return ReactDOMServer.renderToString(appElement);
}

function simulateHMRUpdate(targetModule, newText) {
  console.log(`\n🔥 [HMR Simulation] Updating module ${targetModule.id} with new text: "${newText}"`);
  
  // Update the module's text
  targetModule.exports.updateText(newText);
  
  // Create new module factory
  const newModuleFactory = () => targetModule.exports;
  __webpack_require__.m[targetModule.id] = newModuleFactory;
  
  // Trigger HMR accept handlers
  if (targetModule.hot._selfAccepted) {
    console.log(`🔥 [HMR] Triggering self-accepted handler for ${targetModule.id}`);
    if (typeof targetModule.hot._selfAccepted === 'function') {
      targetModule.hot._selfAccepted();
    }
  }
  
  // Trigger parent accept handlers
  targetModule.parents.forEach(parentId => {
    const parentModule = moduleRegistry[parentId];
    if (parentModule && parentModule.hot._acceptedDependencies[targetModule.id]) {
      console.log(`🔥 [HMR] Triggering parent accept handler in ${parentId} for ${targetModule.id}`);
      const handler = parentModule.hot._acceptedDependencies[targetModule.id];
      if (typeof handler === 'function') {
        handler();
      }
    }
  });
  
  console.log(`✅ [HMR] Module ${targetModule.id} hot update completed`);
}

async function testSSRWithHMRIntegration() {
  console.log('🚀 Starting SSR + HMR Integration Test...\n');
  
  // Initialize HMR Client
  const hmrClient = new HMRClient({ 
    logging: true, 
    autoAttach: true 
  });
  
  // Set up update provider for HMR client
  let updateQueue = [];
  hmrClient.setUpdateProvider(async () => {
    if (updateQueue.length > 0) {
      const update = updateQueue.shift();
      return { update };
    }
    return { update: null };
  });
  
  console.log('📊 [HMR Client] Status:', hmrClient.getStatus());
  
  // Initial render
  const leafModules = [leaf1Module, leaf2Module, leaf3Module];
  const initialHTML = renderToHTML(leafModules);
  
  console.log('📄 Initial SSR HTML:');
  console.log(initialHTML);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Simulate HMR update for leaf2 module
  console.log('🔄 Simulating HMR update for leaf2 module...\n');
  simulateHMRUpdate(leaf2Module, 'HMR UPDATED TEXT 2');
  
  // Render after HMR update
  const updatedHTML = renderToHTML(leafModules);
  
  console.log('\n📄 Updated SSR HTML after HMR:');
  console.log(updatedHTML);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Verify the changes
  const hasOriginalText = initialHTML.includes('Original Text 2');
  const hasUpdatedText = updatedHTML.includes('HMR UPDATED TEXT 2');
  const stillHasOriginalInUpdated = updatedHTML.includes('Original Text 2');
  const hasModuleIdAttribute = updatedHTML.includes('data-module-id="leaf2"');
  
  console.log('🔍 HMR Integration Verification:');
  console.log(`✓ Initial HTML had original text: ${hasOriginalText}`);
  console.log(`✓ Updated HTML has HMR updated text: ${hasUpdatedText}`);
  console.log(`✓ Updated HTML no longer has original text: ${!stillHasOriginalInUpdated}`);
  console.log(`✓ HTML includes module tracking attributes: ${hasModuleIdAttribute}`);
  
  // Test HMR client functionality
  console.log('\n🧪 Testing HMR Client Integration:');
  
  // Add an update to the queue for HMR client
  updateQueue.push({
    manifest: {
      h: __webpack_require__.h(),
      c: ['index'],
      r: [],
      m: [leaf2Module.id]
    },
    script: `
      exports.modules = {
        '${leaf2Module.id}': function(module, exports, require) {
          exports.updateText('HMR CLIENT UPDATED TEXT 2');
          exports.LeafComponent = function({ id }) {
            return React.createElement('span', { 
              id: id,
              'data-testid': 'leaf-' + id,
              'data-module-id': '${leaf2Module.id}'
            }, 'HMR CLIENT UPDATED TEXT 2');
          };
        }
      };
      exports.runtime = function(__webpack_require__) {
        console.log('[HMR Runtime] Update applied via HMR client');
      };
    `,
    originalInfo: {
      updateId: 'hmr-client-test-' + Date.now(),
      webpackHash: __webpack_require__.h()
    }
  });
  
  // Check for updates using HMR client
  const updateResult = await hmrClient.checkForUpdates();
  console.log('📊 [HMR Client] Update result:', updateResult);
  
  // Final verification
  const finalHTML = renderToHTML(leafModules);
  const testPassed = hasOriginalText && hasUpdatedText && !stillHasOriginalInUpdated && hasModuleIdAttribute;
  
  console.log(`\n${testPassed ? '✅ SUCCESS' : '❌ FAILED'}: SSR + HMR Integration Test`);
  console.log('\n📈 Module Registry State:');
  Object.keys(moduleRegistry).forEach(moduleId => {
    const module = moduleRegistry[moduleId];
    console.log(`  - ${moduleId}: active=${module.hot.active}, selfAccepted=${!!module.hot._selfAccepted}`);
  });
  
  hmrClient.detach();
  
  return {
    initialHTML,
    updatedHTML,
    finalHTML,
    testPassed,
    hmrClientWorking: updateResult.success,
    moduleCount: Object.keys(moduleRegistry).length,
    hmrStats: hmrClient.getStats()
  };
}

// Export for use in tests
module.exports = {
  testSSRWithHMRIntegration,
  createLeafComponentModule,
  createAppModule,
  simulateHMRUpdate,
  renderToHTML,
  moduleRegistry
};

// Run the test if this file is executed directly
if (require.main === module) {
  testSSRWithHMRIntegration().catch(console.error);
}