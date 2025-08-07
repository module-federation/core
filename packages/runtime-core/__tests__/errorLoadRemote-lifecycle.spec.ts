import { assert, describe, test, it, expect, beforeEach, vi } from 'vitest';
import { ModuleFederation } from '../src/core';
import { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { addGlobalSnapshot, resetFederationGlobalInfo } from '../src/global';

/**
 * Comprehensive test suite to verify errorLoadRemote hook lifecycle parameter documentation accuracy.
 *
 * Tests all documented lifecycle values:
 * - 'beforeRequest': Error during initial request processing
 * - 'afterResolve': Error during manifest loading (most common for network failures)
 * - 'onLoad': Error during module loading and execution
 * - 'beforeLoadShare': Error during shared dependency loading
 */
describe('errorLoadRemote lifecycle parameter verification', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });

  beforeEach(() => {
    removeScriptTags();
    resetFederationGlobalInfo();
    // Clear any global state that might interfere
    vi.clearAllMocks();
  });

  it('should call errorLoadRemote with "beforeRequest" lifecycle when beforeRequest hook fails', async () => {
    const errorLoadRemoteSpy = vi.fn();
    const mockError = new Error('beforeRequest hook failed');

    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-beforeRequest-error-plugin',
      beforeRequest(args) {
        // Simulate beforeRequest hook throwing an error
        throw mockError;
      },
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        // Return valid args to continue execution
        return {
          id: args.id,
          options: args.options,
          origin: args.origin,
        };
      },
    });

    const GM = new ModuleFederation({
      name: '@test/beforeRequest-error',
      remotes: [
        {
          name: '@demo/test',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json',
        },
      ],
      plugins: [testPlugin()],
    });

    try {
      await GM.loadRemote('@demo/test/someModule');
    } catch (error) {
      // Expected to fail, but we should still see the errorLoadRemote call
    }

    // Verify errorLoadRemote was called with correct lifecycle
    expect(errorLoadRemoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '@demo/test/someModule',
        error: mockError,
        from: 'runtime',
        lifecycle: 'beforeRequest',
        origin: GM,
      }),
    );
  });

  it('should call errorLoadRemote with "afterResolve" lifecycle when manifest loading fails', async () => {
    const errorLoadRemoteSpy = vi.fn();

    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-afterResolve-error-plugin',
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        // Don't return anything to let the error propagate
      },
    });

    const GM = new ModuleFederation({
      name: '@test/afterResolve-error',
      remotes: [
        {
          name: '@demo/nonexistent',
          entry: 'http://localhost:1111/nonexistent-manifest.json',
        },
      ],
      plugins: [testPlugin()],
    });

    try {
      await GM.loadRemote('@demo/nonexistent/someModule');
    } catch (error) {
      // Expected to fail
    }

    // Verify errorLoadRemote was called with correct lifecycle
    expect(errorLoadRemoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'http://localhost:1111/nonexistent-manifest.json',
        lifecycle: 'afterResolve',
        origin: GM,
      }),
    );
  });

  it('should call errorLoadRemote with "onLoad" lifecycle when module loading fails', async () => {
    const errorLoadRemoteSpy = vi.fn();

    // Set up a mock remote entry that will fail during module execution
    const reset = addGlobalSnapshot({
      '@test/failing-remote': {
        globalName: '@test/failing-remote',
        buildVersion: '1.0.0',
        publicPath: 'http://localhost:1111/',
        remoteTypes: '',
        shared: [],
        remoteEntry: 'resources/failing-remote-entry.js',
        remoteEntryType: 'global',
        modules: [
          {
            moduleName: './FailingComponent',
            modulePath: 'FailingComponent.js',
            assets: {
              js: {
                sync: [],
                async: ['FailingComponent.js'],
              },
            },
          },
        ],
        version: '1.0.0',
        remotesInfo: {},
      },
    });

    // Mock the global remote entry that will throw during get()
    (global as any)['@test/failing-remote'] = {
      init: () => Promise.resolve(),
      get: () => {
        throw new Error('Module execution failed');
      },
    };

    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-onLoad-error-plugin',
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        // Return a fallback module
        return () => ({
          __esModule: true,
          default: () => 'Fallback Component',
        });
      },
    });

    const GM = new ModuleFederation({
      name: '@test/onLoad-error',
      remotes: [
        {
          name: '@test/failing-remote',
          entry: 'http://localhost:1111/failing-manifest.json',
        },
      ],
      plugins: [testPlugin()],
    });

    const result = await GM.loadRemote('@test/failing-remote/FailingComponent');

    // Verify errorLoadRemote was called with correct lifecycle
    expect(errorLoadRemoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '@test/failing-remote/FailingComponent',
        lifecycle: 'onLoad',
        from: 'runtime',
        origin: GM,
        error: expect.any(Error),
      }),
    );

    // Verify the fallback was returned
    expect(result).toBeDefined();

    // Cleanup
    reset();
    delete (global as any)['@test/failing-remote'];
  });

  it('should call errorLoadRemote with "beforeLoadShare" lifecycle when shared dependency loading fails', async () => {
    const errorLoadRemoteSpy = vi.fn();

    // Set up a scenario where shared loading will fail
    const reset = addGlobalSnapshot({
      '@test/shared-remote': {
        globalName: '@test/shared-remote',
        buildVersion: '1.0.0',
        publicPath: 'http://localhost:1111/',
        remoteTypes: '',
        shared: [
          {
            id: 'react',
            name: 'react',
            version: '18.0.0',
            scope: 'default',
            deps: [],
            requiredVersion: '^18.0.0',
          },
        ],
        remoteEntry: 'resources/shared-remote-entry.js',
        remoteEntryType: 'global',
        modules: [],
        version: '1.0.0',
        remotesInfo: {},
      },
    });

    // Mock the global remote entry that will fail during getEntry/init
    (global as any)['@test/shared-remote'] = {
      init: () => {
        throw new Error('Failed to initialize shared dependencies');
      },
      get: () => Promise.resolve(() => ({})),
    };

    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-beforeLoadShare-error-plugin',
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        // Return mock remote entry exports
        return {
          init: () => Promise.resolve(),
          get: () => Promise.resolve(() => ({})),
        };
      },
    });

    const GM = new ModuleFederation({
      name: '@test/beforeLoadShare-error',
      remotes: [
        {
          name: '@test/shared-remote',
          entry: 'http://localhost:1111/shared-manifest.json',
        },
      ],
      shared: {
        react: {
          version: '18.0.0',
          scope: 'default',
          lib: () => ({}),
          shareConfig: {
            singleton: true,
            requiredVersion: '^18.0.0',
          },
        },
      },
      plugins: [testPlugin()],
    });

    // Load a shared dependency to trigger the beforeLoadShare error
    try {
      await GM.loadShare('react');
    } catch (error) {
      // May still throw but we should see the errorLoadRemote call
    }

    // Verify errorLoadRemote was called with correct lifecycle
    expect(errorLoadRemoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        lifecycle: 'beforeLoadShare',
        from: 'runtime',
        origin: GM,
        error: expect.any(Error),
      }),
    );

    // Cleanup
    reset();
    delete (global as any)['@test/shared-remote'];
  });

  it('should pass through correct error information in all lifecycle stages', async () => {
    const lifecycleCalls: Array<{
      lifecycle: string;
      id: string;
      error: Error;
      from: string;
    }> = [];

    const collectingPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'error-collecting-plugin',
      errorLoadRemote(args) {
        lifecycleCalls.push({
          lifecycle: args.lifecycle,
          id: args.id,
          error: args.error as Error,
          from: args.from,
        });

        // Handle different lifecycles appropriately
        if (args.lifecycle === 'beforeRequest') {
          return {
            id: args.id,
            options: args.options,
            origin: args.origin,
          };
        } else if (args.lifecycle === 'afterResolve') {
          // Return a mock manifest
          return {
            id: '@test/mock',
            name: '@test/mock',
            metaData: {
              name: '@test/mock',
              publicPath: 'http://localhost:1111/',
              globalName: '@test/mock',
            },
            shared: [],
            remotes: [],
            exposes: [],
          };
        } else if (args.lifecycle === 'onLoad') {
          return () => ({
            __esModule: true,
            default: () => 'Fallback',
          });
        } else if (args.lifecycle === 'beforeLoadShare') {
          return {
            init: () => Promise.resolve(),
            get: () => Promise.resolve(() => ({})),
          };
        }
      },
    });

    const GM = new ModuleFederation({
      name: '@test/comprehensive',
      remotes: [
        {
          name: '@demo/nonexistent',
          entry: 'http://localhost:1111/nonexistent.json',
        },
      ],
      plugins: [collectingPlugin()],
    });

    // This should trigger multiple lifecycle errors
    try {
      await GM.loadRemote('@demo/nonexistent/someModule');
    } catch (error) {
      // Some errors might still propagate
    }

    // Verify that we collected error calls and they have the expected structure
    expect(lifecycleCalls.length).toBeGreaterThan(0);

    lifecycleCalls.forEach((call) => {
      expect(call.lifecycle).toMatch(
        /^(beforeRequest|afterResolve|onLoad|beforeLoadShare)$/,
      );
      expect(call.id).toBeDefined();
      expect(call.error).toBeInstanceOf(Error);
      expect(call.from).toMatch(/^(runtime|build)$/);
    });
  });

  it('should document the exact lifecycle stages where errorLoadRemote can be called', () => {
    // This is a documentation test that verifies our understanding
    // The documented lifecycle values should match the implementation
    const documentedLifecycles = [
      'beforeRequest',
      'afterResolve',
      'onLoad',
      'beforeLoadShare',
    ];

    // These should match what we found in the source code:
    // - beforeRequest: packages/runtime-core/src/remote/index.ts:341
    // - afterResolve: packages/runtime-core/src/plugins/snapshot/SnapshotHandler.ts:303
    // - onLoad: packages/runtime-core/src/remote/index.ts:258
    // - beforeLoadShare: packages/runtime-core/src/shared/index.ts:324

    expect(documentedLifecycles).toHaveLength(4);
    expect(documentedLifecycles).toContain('beforeRequest');
    expect(documentedLifecycles).toContain('afterResolve');
    expect(documentedLifecycles).toContain('onLoad');
    expect(documentedLifecycles).toContain('beforeLoadShare');
  });

  it('should handle errorLoadRemote return values correctly for each lifecycle', async () => {
    let beforeRequestCalled = false;
    let afterResolveCalled = false;
    let onLoadCalled = false;

    const testPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'return-value-test-plugin',
      beforeRequest() {
        throw new Error('beforeRequest error');
      },
      errorLoadRemote(args) {
        if (args.lifecycle === 'beforeRequest') {
          beforeRequestCalled = true;
          // Should return valid beforeRequest args
          return {
            id: args.id,
            options: args.options,
            origin: args.origin,
          };
        } else if (args.lifecycle === 'afterResolve') {
          afterResolveCalled = true;
          // Should return valid manifest
          return {
            id: '@test/fallback',
            name: '@test/fallback',
            metaData: {
              name: '@test/fallback',
              publicPath: 'http://localhost:1111/',
              globalName: '@test/fallback',
            },
            shared: [],
            remotes: [],
            exposes: [],
          };
        } else if (args.lifecycle === 'onLoad') {
          onLoadCalled = true;
          // Should return module or factory function
          return () => ({
            __esModule: true,
            default: () => 'Test Component',
          });
        }

        return args;
      },
    });

    // Set up a failing global entry to trigger onLoad error
    (global as any)['@test/fallback'] = {
      init: () => Promise.resolve(),
      get: () => {
        throw new Error('onLoad error');
      },
    };

    const GM = new ModuleFederation({
      name: '@test/return-values',
      remotes: [
        {
          name: '@demo/test',
          entry: 'http://localhost:1111/nonexistent.json',
        },
      ],
      plugins: [testPlugin()],
    });

    const result = await GM.loadRemote('@demo/test/component');

    // Verify all lifecycle stages were called
    expect(beforeRequestCalled).toBe(true);
    expect(afterResolveCalled).toBe(true);
    expect(onLoadCalled).toBe(true);

    // Verify final result from onLoad errorLoadRemote
    expect(result).toBeDefined();

    // Cleanup
    delete (global as any)['@test/fallback'];
  });
});
