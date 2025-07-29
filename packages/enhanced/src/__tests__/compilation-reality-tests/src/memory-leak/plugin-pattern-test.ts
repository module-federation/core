/**
 * Testing Plugin Pattern from Memory Leak Tests
 * Issue: The examples show plugins but don't define the expected interface
 */

import { ModuleFederation } from '@module-federation/runtime-core';

// The example shows this plugin pattern but doesn't define types
const memoryTrackingPlugin = {
  name: 'MemoryTrackingPlugin',
  moduleReferences: new Set(),
  
  // Issue: What are the types for 'args'?
  onLoad(args: any) {
    // Simulate module with potential memory leak
    const module = {
      id: args.id,
      data: new Array(1000).fill('x'.repeat(1000)), // ~1MB per module
      timestamp: Date.now(),
      cleanup: null
    };
    
    this.moduleReferences.add(module);
    
    // Issue: The return type is unclear - returns a function that returns module?
    return () => module;
  },
  
  cleanup() {
    // Check if references are properly released
    this.moduleReferences.clear();
  }
};

// Test circular reference plugin
const circularPlugin = {
  name: 'CircularPlugin',
  instances: [] as any[],
  federation: null as any,
  
  init(args: any) {
    const instance = {
      id: Date.now(),
      origin: args.origin,
      plugin: this, // Circular reference - will this cause issues?
      data: new Array(1000).fill('data'),
      self: null as any
    };
    
    this.instances.push(instance);
    instance.self = instance; // Self reference
    
    return args;
  }
};

// Event leak plugin example
const eventLeakPlugin = {
  name: 'EventLeakPlugin',
  
  beforeRequest(args: any) {
    // Issue: Where is the event emitter defined?
    // The example uses require('events') but doesn't show initialization
    const listener = () => {
      console.log(`Request ${args.id}`);
    };
    
    // This references an undefined eventEmitter
    // eventEmitter.on('request', listener);
    
    return args;
  },
  
  onLoad(args: any) {
    const listener = () => {
      console.log(`Loaded ${args.id}`);
    };
    
    // Again, eventEmitter is not defined
    // eventEmitter.on('load', listener);
    
    return args;
  }
};

// Test if these plugins can be used
async function testPluginPatterns() {
  console.log('Testing plugin patterns...\n');
  
  // Issue: The ModuleFederation constructor might not accept plugins
  try {
    const federation = new ModuleFederation({
      name: 'plugin-test',
      plugins: [memoryTrackingPlugin, circularPlugin]
    } as any);
    
    console.log('Federation with plugins created successfully');
    
    // Issue: registerPlugin method might not exist
    if ('registerPlugin' in federation) {
      (federation as any).registerPlugin(eventLeakPlugin);
      console.log('Plugin registered successfully');
    } else {
      console.error('registerPlugin method not found on federation instance');
    }
    
  } catch (error) {
    console.error('Failed to create federation with plugins:', error);
  }
  
  // Test plugin lifecycle methods
  console.log('\nTesting plugin lifecycle methods...');
  
  // Test onLoad
  const loadResult = memoryTrackingPlugin.onLoad({ id: 'test-module' });
  console.log('onLoad result type:', typeof loadResult);
  console.log('onLoad returns function:', typeof loadResult === 'function');
  
  if (typeof loadResult === 'function') {
    const module = loadResult();
    console.log('Module from onLoad:', module);
  }
  
  // Test cleanup
  console.log('\nTesting cleanup...');
  console.log('References before cleanup:', memoryTrackingPlugin.moduleReferences.size);
  memoryTrackingPlugin.cleanup();
  console.log('References after cleanup:', memoryTrackingPlugin.moduleReferences.size);
  
  // Test circular references
  console.log('\nTesting circular references...');
  circularPlugin.init({ origin: 'test' });
  console.log('Circular plugin instances:', circularPlugin.instances.length);
  console.log('Has circular reference:', circularPlugin.instances[0]?.plugin === circularPlugin);
  console.log('Has self reference:', circularPlugin.instances[0]?.self === circularPlugin.instances[0]);
}

if (require.main === module) {
  testPluginPatterns().catch(console.error);
}

export { memoryTrackingPlugin, circularPlugin, eventLeakPlugin };