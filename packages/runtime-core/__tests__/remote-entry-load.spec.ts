import { describe, it, expect, vi, Mock } from 'vitest';
import { FederationHost } from '../src/core';
// Import base Plugin type from SDK
// import { Plugin } from '@module-federation/sdk';
import { RemoteEntryExports, RemoteInfo } from '../src/type';
// Import functions to mock
import * as loadUtils from '../src/utils/load';

// Mock getRemoteEntry (the exported orchestrator function)
vi.mock('../src/utils/load', async (importOriginal) => {
  const actual = await importOriginal<typeof loadUtils>();
  return {
    ...actual,
    // Keep other exports like getRemoteInfo, getRemoteEntryUniqueKey if needed
    getRemoteEntry: vi.fn(), // Mock the main exported loading function
  };
});

describe('FederationHost - Remote Entry Loading', () => {
  // Define mock implementations outside tests to avoid redefining
  const mockScriptEntry: RemoteEntryExports = {
    // Revert to async factory function
    get: (module: string) => async () => `Mock ${module} from script`,
    // Match expected signature init: (shareScope) => Promise<void>
    init: async (shareScope: Record<string, any>) => {
      await Promise.resolve();
    },
  };
  const mockEsmEntry: RemoteEntryExports = {
    get: (module: string) => async () => `Mock ${module} from esm`,
    init: async (shareScope: Record<string, any>) => {
      await Promise.resolve();
    },
  };
  const mockModuleEntry: RemoteEntryExports = {
    get: (module: string) => async () => `Mock ${module} from module`,
    init: async (shareScope: Record<string, any>) => {
      await Promise.resolve();
    },
  };
  const mockSystemEntry: RemoteEntryExports = {
    get: (module: string) => async () => `Mock ${module} from system`,
    init: async (shareScope: Record<string, any>) => {
      await Promise.resolve();
    },
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock implementation for getRemoteEntry
    (loadUtils.getRemoteEntry as Mock).mockImplementation(
      async (args: { remoteInfo: RemoteInfo }) => {
        const { type } = args.remoteInfo;
        if (type === 'esm') {
          return mockEsmEntry;
        }
        if (type === 'module') {
          return mockModuleEntry;
        }
        if (type === 'system') {
          return mockSystemEntry;
        }
        // Default to script
        return mockScriptEntry;
      },
    );
  });

  it('should attempt to load remote with type "script" (default)', async () => {
    // No plugin needed
    const host = new FederationHost({
      name: 'test-host-script',
      remotes: [{ name: 'remoteScript', entry: 'script-entry.js' }], // No type specified, defaults to 'script'
      plugins: [],
    });

    const loadedModule = await host.loadRemote<string>('remoteScript/test'); // T is the final module type: string
    // Verify getRemoteEntry was called
    expect(loadUtils.getRemoteEntry).toHaveBeenCalled();
    // Check the resolved module value directly
    expect(loadedModule).toBe('Mock ./test from script');
  });

  it('should attempt to load remote with type "esm"', async () => {
    // No plugin needed
    const host = new FederationHost({
      name: 'test-host-esm',
      remotes: [{ name: 'remoteEsm', entry: 'esm-entry.js', type: 'esm' }],
      plugins: [],
    });

    const loadedModule = await host.loadRemote<string>('remoteEsm/test'); // T is string
    expect(loadUtils.getRemoteEntry).toHaveBeenCalled();
    // Check the value directly
    expect(loadedModule).toBe('Mock ./test from esm');
  });

  it('should attempt to load remote with type "module" (alias for "esm")', async () => {
    // No plugin needed
    const host = new FederationHost({
      name: 'test-host-module',
      remotes: [
        { name: 'remoteModule', entry: 'module-entry.js', type: 'module' },
      ],
      plugins: [],
    });

    const loadedModule = await host.loadRemote<string>('remoteModule/test'); // T is string
    expect(loadUtils.getRemoteEntry).toHaveBeenCalled();
    // Check the value directly
    expect(loadedModule).toBe('Mock ./test from module');
  });

  it('should attempt to load remote with type "system"', async () => {
    // No plugin needed
    const host = new FederationHost({
      name: 'test-host-system',
      remotes: [
        { name: 'remoteSystem', entry: 'system-entry.js', type: 'system' },
      ],
      plugins: [],
    });

    // No need to mock System.import directly, as loadSystemJsEntry is mocked
    const loadedModule = await host.loadRemote<string>('remoteSystem/test'); // T is string
    expect(loadUtils.getRemoteEntry).toHaveBeenCalled();
    // Check the value directly
    expect(loadedModule).toBe('Mock ./test from system');
  });
});
