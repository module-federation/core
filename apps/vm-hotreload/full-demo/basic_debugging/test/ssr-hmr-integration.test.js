const { describe, it } = require('node:test');
const assert = require('node:assert');
const { 
  testSSRWithHMRIntegration,
  createLeafComponentModule,
  simulateHMRUpdate,
  renderToHTML,
  moduleRegistry
} = require('../examples/ssr-hmr-integration.js');

describe('SSR + HMR Integration', () => {
  it('should initialize HMR-enabled modules with proper webpack structure', () => {
    // Clear module registry for clean test
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const leafModule = createLeafComponentModule('Test Text', 'test_leaf');
    
    assert.ok(leafModule.hot, 'Module should have hot property');
    assert.ok(leafModule.hot.active, 'Module hot should be active');
    assert.strictEqual(typeof leafModule.hot.accept, 'function', 'Module should have accept function');
    assert.strictEqual(typeof leafModule.hot.dispose, 'function', 'Module should have dispose function');
    assert.ok(moduleRegistry['test_leaf'], 'Module should be registered in module registry');
  });

  it('should render SSR HTML with module tracking attributes', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const leaf1 = createLeafComponentModule('Text 1', 'leaf1');
    const leaf2 = createLeafComponentModule('Text 2', 'leaf2');
    
    const html = renderToHTML([leaf1, leaf2]);
    
    assert.ok(html.includes('data-module-id="leaf1"'), 'Should include module ID for leaf1');
    assert.ok(html.includes('data-module-id="leaf2"'), 'Should include module ID for leaf2');
    assert.ok(html.includes('Text 1'), 'Should include leaf1 text');
    assert.ok(html.includes('Text 2'), 'Should include leaf2 text');
  });

  it('should simulate HMR updates and trigger hot reload handlers', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const leafModule = createLeafComponentModule('Original Text', 'hmr_test_leaf');
    let hotReloadTriggered = false;
    
    // Set up HMR acceptance with self-accepted handler
    leafModule.hot._selfAccepted = () => {
      hotReloadTriggered = true;
    };
    
    // Simulate HMR update
    simulateHMRUpdate(leafModule, 'Updated Text');
    
    assert.strictEqual(leafModule.exports.getCurrentText(), 'Updated Text', 'Module text should be updated');
    assert.ok(hotReloadTriggered, 'Hot reload handler should have been triggered');
  });

  it('should update SSR HTML after HMR simulation', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const leaf1 = createLeafComponentModule('Original 1', 'leaf1');
    const leaf2 = createLeafComponentModule('Original 2', 'leaf2');
    
    const initialHTML = renderToHTML([leaf1, leaf2]);
    
    // Simulate HMR update for leaf2
    simulateHMRUpdate(leaf2, 'HMR Updated 2');
    
    const updatedHTML = renderToHTML([leaf1, leaf2]);
    
    assert.ok(initialHTML.includes('Original 2'), 'Initial HTML should have original text');
    assert.ok(updatedHTML.includes('HMR Updated 2'), 'Updated HTML should have HMR updated text');
    assert.ok(!updatedHTML.includes('Original 2'), 'Updated HTML should not have original text');
    assert.ok(updatedHTML.includes('Original 1'), 'Other modules should remain unchanged');
  });

  it('should maintain webpack module system integrity during HMR', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const leaf = createLeafComponentModule('Test', 'integrity_test');
    const initialModuleFactory = global.__webpack_require__.m[leaf.id];
    
    simulateHMRUpdate(leaf, 'Updated');
    
    const updatedModuleFactory = global.__webpack_require__.m[leaf.id];
    
    assert.ok(initialModuleFactory, 'Initial module factory should exist');
    assert.ok(updatedModuleFactory, 'Updated module factory should exist');
    assert.ok(global.__webpack_require__.c[leaf.id], 'Module should remain in module cache');
    assert.ok(leaf.hot.active, 'Module hot should remain active');
  });

  it('should run the complete SSR + HMR integration test successfully', async () => {
    const result = await testSSRWithHMRIntegration();
    
    assert.ok(result.testPassed, 'Integration test should pass');
    assert.ok(result.initialHTML, 'Should return initial HTML');
    assert.ok(result.updatedHTML, 'Should return updated HTML');
    assert.ok(result.finalHTML, 'Should return final HTML');
    assert.strictEqual(typeof result.moduleCount, 'number', 'Should report module count');
    assert.ok(result.moduleCount > 0, 'Should have registered modules');
    
    // Verify HMR client integration
    assert.ok(result.hmrStats, 'Should return HMR stats');
    assert.strictEqual(typeof result.hmrStats.totalUpdates, 'number', 'Should track total updates');
  });

  it('should properly handle parent-child module relationships', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const parentModule = createLeafComponentModule('Parent', 'parent');
    const childModule = createLeafComponentModule('Child', 'child');
    
    // Simulate require relationship
    const mockRequire = global.__webpack_require__;
    parentModule.children.push('child');
    childModule.parents.push('parent');
    
    // Set up HMR acceptance on parent for child
    parentModule.hot.accept(['child'], () => {
      console.log('Parent accepted child update');
    });
    
    let parentHandlerCalled = false;
    parentModule.hot._acceptedDependencies['child'] = () => {
      parentHandlerCalled = true;
    };
    
    // Simulate HMR update on child
    simulateHMRUpdate(childModule, 'Updated Child');
    
    assert.ok(parentHandlerCalled, 'Parent should handle child module update');
    assert.ok(parentModule.children.includes('child'), 'Parent should maintain child relationship');
    assert.ok(childModule.parents.includes('parent'), 'Child should maintain parent relationship');
  });

  it('should verify HTML structure consistency across HMR updates', () => {
    Object.keys(moduleRegistry).forEach(key => delete moduleRegistry[key]);
    
    const modules = [
      createLeafComponentModule('A', 'a'),
      createLeafComponentModule('B', 'b'),
      createLeafComponentModule('C', 'c')
    ];
    
    const initialHTML = renderToHTML(modules);
    
    // Update middle module
    simulateHMRUpdate(modules[1], 'B_UPDATED');
    
    const updatedHTML = renderToHTML(modules);
    
    // Extract structure by replacing text content
    const initialStructure = initialHTML.replace(/>[^<]+</g, '>TEXT<');
    const updatedStructure = updatedHTML.replace(/>[^<]+</g, '>TEXT<');
    
    assert.strictEqual(initialStructure, updatedStructure, 'HTML structure should remain identical');
    
    // Verify only target module changed
    assert.ok(updatedHTML.includes('A'), 'Module A should be unchanged');
    assert.ok(updatedHTML.includes('B_UPDATED'), 'Module B should be updated');
    assert.ok(updatedHTML.includes('C'), 'Module C should be unchanged');
  });
});