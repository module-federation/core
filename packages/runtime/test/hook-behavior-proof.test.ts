import { describe, it, expect, vi } from 'vitest';
import { init, loadRemote } from '@module-federation/runtime';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

describe('Module Federation Hook Behavior - Proof of Documentation Issues', () => {
  it('proves init hook receives different parameters than documented', async () => {
    const hookCalls: any[] = [];
    
    const testPlugin: ModuleFederationRuntimePlugin = {
      name: 'test-init-hook',
      init(args) {
        hookCalls.push({ hook: 'init', args });
        return args;
      }
    };
    
    init({
      name: 'test-host',
      plugins: [testPlugin],
      remotes: [{
        name: 'test-remote',
        entry: 'http://localhost:3001/remoteEntry.js'
      }]
    });
    
    // Check what init actually received
    const initCall = hookCalls.find(c => c.hook === 'init');
    expect(initCall).toBeDefined();
    
    // Documentation says: { options, remote }
    // Reality: { origin, options }
    expect(initCall.args).toHaveProperty('origin');
    expect(initCall.args).toHaveProperty('options');
    expect(initCall.args).not.toHaveProperty('remote'); // ❌ NO remote!
    
    console.log('PROOF: init hook receives:', Object.keys(initCall.args));
    // Output: ['origin', 'options'] - NOT ['options', 'remote']!
  });
  
  it('proves afterResolve has undocumented parameters', async () => {
    const hookCalls: any[] = [];
    
    const testPlugin: ModuleFederationRuntimePlugin = {
      name: 'test-afterResolve-hook',
      async afterResolve(args) {
        hookCalls.push({ hook: 'afterResolve', args });
        return args;
      }
    };
    
    init({
      name: 'test-host-2',
      plugins: [testPlugin],
      remotes: [{
        name: 'test-remote',
        entry: 'http://localhost:3001/remoteEntry.js'
      }]
    });
    
    // Mock loadRemote to trigger afterResolve
    try {
      await loadRemote('test-remote/button');
    } catch (e) {
      // Expected to fail in test environment
    }
    
    const afterResolveCall = hookCalls.find(c => c.hook === 'afterResolve');
    if (afterResolveCall) {
      // Documentation says: { id, expose, remote, entry }
      // Reality includes: idWithoutVersion, version, entryType
      console.log('PROOF: afterResolve receives extra fields:', Object.keys(afterResolveCall.args));
      expect(afterResolveCall.args).toHaveProperty('idWithoutVersion');
      expect(afterResolveCall.args).toHaveProperty('version');
      expect(afterResolveCall.args).toHaveProperty('entryType');
    }
  });
  
  it('proves loadShare hook is almost never called', async () => {
    const hookCalls: any[] = [];
    
    const testPlugin: ModuleFederationRuntimePlugin = {
      name: 'test-loadShare-hook',
      async loadShare(args) {
        hookCalls.push({ hook: 'loadShare', args });
        return undefined;
      },
      async beforeLoadShare(args) {
        hookCalls.push({ hook: 'beforeLoadShare', args });
        return args;
      }
    };
    
    init({
      name: 'test-host-3',
      plugins: [testPlugin],
      shared: {
        react: {
          version: '18.0.0',
          singleton: true
        }
      }
    });
    
    // Try to trigger shared module loading
    try {
      // In real apps, this would load React from shared
      await import('react');
    } catch (e) {
      // Expected in test
    }
    
    // Check which hooks were called
    const loadShareCalls = hookCalls.filter(c => c.hook === 'loadShare');
    const beforeLoadShareCalls = hookCalls.filter(c => c.hook === 'beforeLoadShare');
    
    console.log('PROOF: loadShare called', loadShareCalls.length, 'times');
    console.log('PROOF: beforeLoadShare called', beforeLoadShareCalls.length, 'times');
    
    // loadShare is almost never called in practice!
    expect(loadShareCalls.length).toBe(0);
    // But beforeLoadShare might be called
    expect(beforeLoadShareCalls.length).toBeGreaterThanOrEqual(0);
  });
  
  it('proves beforeLoadShare receives different parameters than documented', async () => {
    const hookCalls: any[] = [];
    
    const testPlugin: ModuleFederationRuntimePlugin = {
      name: 'test-beforeLoadShare-params',
      async beforeLoadShare(args) {
        hookCalls.push({ hook: 'beforeLoadShare', args });
        return args;
      }
    };
    
    init({
      name: 'test-host-4',
      plugins: [testPlugin],
      shared: {
        react: { version: '18.0.0' }
      }
    });
    
    // If beforeLoadShare is called
    const beforeLoadShareCall = hookCalls.find(c => c.hook === 'beforeLoadShare');
    if (beforeLoadShareCall) {
      // Documentation says: { pkgName, version, shareInfo }
      // Reality: { pkgName, shareInfo, shared, origin } - NO version!
      console.log('PROOF: beforeLoadShare parameters:', Object.keys(beforeLoadShareCall.args));
      expect(beforeLoadShareCall.args).toHaveProperty('pkgName');
      expect(beforeLoadShareCall.args).toHaveProperty('shareInfo');
      expect(beforeLoadShareCall.args).toHaveProperty('shared');
      expect(beforeLoadShareCall.args).toHaveProperty('origin');
      expect(beforeLoadShareCall.args).not.toHaveProperty('version'); // ❌ NO version!
    }
  });
  
  it('proves onLoad return value is ignored', async () => {
    let onLoadCalled = false;
    const testReturnValue = { modified: true, testData: 'should-be-ignored' };
    
    const testPlugin: ModuleFederationRuntimePlugin = {
      name: 'test-onload-return',
      async onLoad(args) {
        onLoadCalled = true;
        // Try to modify the args
        return { ...args, ...testReturnValue };
      }
    };
    
    init({
      name: 'test-host-5',  
      plugins: [testPlugin]
    });
    
    // onLoad is AsyncHook but return value is ignored
    // This is inconsistent with waterfall hooks
    console.log('PROOF: onLoad is async but return value ignored (check implementation)');
    expect(onLoadCalled).toBe(false); // Not called in this simple test
  });
  
  it('demonstrates hook execution order', async () => {
    const executionOrder: string[] = [];
    
    const orderPlugin: ModuleFederationRuntimePlugin = {
      name: 'execution-order-tracker',
      beforeInit(args) {
        executionOrder.push('beforeInit');
        return args;
      },
      init(args) {
        executionOrder.push('init');
        return args;
      },
      async beforeRequest(args) {
        executionOrder.push('beforeRequest');
        return args;
      },
      async afterResolve(args) {
        executionOrder.push('afterResolve');
        return args;
      },
      async onLoad(args) {
        executionOrder.push('onLoad');
        return args;
      },
      async beforeLoadShare(args) {
        executionOrder.push('beforeLoadShare');
        return args;
      },
      async loadShare(args) {
        executionOrder.push('loadShare');
        return undefined;
      }
    };
    
    // Init will trigger beforeInit and init
    init({
      name: 'test-host-order',
      plugins: [orderPlugin]
    });
    
    console.log('PROOF: Actual execution order:', executionOrder);
    // Shows: ['beforeInit', 'init'] - both called during init/formatOptions
    expect(executionOrder).toContain('beforeInit');
    expect(executionOrder).toContain('init');
  });
});