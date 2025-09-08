import { describe, it, expect, beforeEach, vi } from 'vitest';
import RspeedyCorePlugin from '../rspeedy-core-plugin';
import { isLynxEnvironment } from '../utils';

// Mock Lynx environment
const mockNativeApp = {
  loadScript: vi.fn(),
  loadScriptAsync: vi.fn(),
};

declare const globalThis: any;

describe('RspeedyCorePlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset globalThis.nativeApp
    delete globalThis.nativeApp;
  });

  describe('isLynxEnvironment', () => {
    it('should return false when nativeApp is not available', () => {
      expect(isLynxEnvironment()).toBe(false);
    });

    it('should return true when nativeApp is available', () => {
      globalThis.nativeApp = mockNativeApp;
      expect(isLynxEnvironment()).toBe(true);
    });
  });

  describe('loadEntry', () => {
    it('should throw error when nativeApp is not available', async () => {
      const plugin = RspeedyCorePlugin();
      
      await expect(
        plugin.loadEntry!({
          remoteInfo: {
            entry: 'http://localhost:3001/remoteEntry.js',
            entryGlobalName: 'remote1',
          },
        } as any)
      ).rejects.toThrow('Not running in a Lynx environment');
    });

    it('should successfully load entry when nativeApp is available', async () => {
      const mockContainer = {
        init: vi.fn(),
        get: vi.fn(),
      };

      const mockBundleResult = {
        init: vi.fn().mockReturnValue(mockContainer),
        buildVersion: '1.0.0',
      };

      mockNativeApp.loadScript.mockReturnValue(mockBundleResult);
      globalThis.nativeApp = mockNativeApp;

      const plugin = RspeedyCorePlugin();
      
      const result = await plugin.loadEntry!({
        remoteInfo: {
          entry: 'http://localhost:3001/remoteEntry.js',
          entryGlobalName: 'remote1',
        },
      } as any);

      expect(mockNativeApp.loadScript).toHaveBeenCalledWith(
        'http://localhost:3001/remoteEntry.js'
      );
      expect(mockBundleResult.init).toHaveBeenCalledWith({ tt: mockNativeApp });
      expect(result).toBe(mockContainer);
    });

    it('should throw error when bundle result is invalid', async () => {
      mockNativeApp.loadScript.mockReturnValue(null);
      globalThis.nativeApp = mockNativeApp;

      const plugin = RspeedyCorePlugin();
      
      await expect(
        plugin.loadEntry!({
          remoteInfo: {
            entry: 'http://localhost:3001/remoteEntry.js',
            entryGlobalName: 'remote1',
          },
        } as any)
      ).rejects.toThrow('Failed to load remote entry: remote1');
    });

    it('should throw error when initialized container is invalid', async () => {
      const mockBundleResult = {
        init: vi.fn().mockReturnValue(null),
      };

      mockNativeApp.loadScript.mockReturnValue(mockBundleResult);
      globalThis.nativeApp = mockNativeApp;

      const plugin = RspeedyCorePlugin();
      
      await expect(
        plugin.loadEntry!({
          remoteInfo: {
            entry: 'http://localhost:3001/remoteEntry.js',
            entryGlobalName: 'remote1',
          },
        } as any)
      ).rejects.toThrow('Invalid container for remote1');
    });
  });

  describe('generatePreloadAssets', () => {
    it('should return empty assets', async () => {
      const plugin = RspeedyCorePlugin();
      
      const result = await plugin.generatePreloadAssets!();
      
      expect(result).toEqual({
        cssAssets: [],
        jsAssetsWithoutEntry: [],
        entryAssets: [],
      });
    });
  });

  it('should have correct plugin name', () => {
    const plugin = RspeedyCorePlugin();
    expect(plugin.name).toBe('rspeedy-core-plugin');
  });
});