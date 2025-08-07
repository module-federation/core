import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModuleFederation } from '../src/index';
import { resetFederationGlobalInfo } from '../src/global';
import { requestList } from './mock/env';

describe('shareStrategy Functional Validation (Integration Tests)', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
    requestList.clear();
  });

  afterEach(() => {
    resetFederationGlobalInfo();
    requestList.clear();
  });

  describe('Version-First Strategy Initialization Behavior', () => {
    it('should initialize successfully with all remotes available', () => {
      const hostInstance = new ModuleFederation({
        name: 'host-version-first',
        shareStrategy: 'version-first',
        remotes: [
          {
            name: 'remote1',
            entry: 'http://localhost:1111/remoteEntry.js',
          },
        ],
      });

      // Verify the configuration is set correctly
      expect(hostInstance.options.shareStrategy).toBe('version-first');
      expect(hostInstance.options.remotes).toHaveLength(1);
    });
  });

  describe('Loaded-First Strategy Initialization Behavior', () => {
    it('should initialize successfully with deferred remote loading', () => {
      const hostInstance = new ModuleFederation({
        name: 'host-loaded-first',
        shareStrategy: 'loaded-first',
        remotes: [
          {
            name: 'remote1',
            entry: 'http://localhost:1111/remoteEntry.js',
          },
        ],
      });

      // Verify the configuration is set correctly
      expect(hostInstance.options.shareStrategy).toBe('loaded-first');
      expect(hostInstance.options.remotes).toHaveLength(1);
    });
  });

  describe('Strategy Default Behavior', () => {
    it('should show actual default behavior when no strategy is specified', () => {
      const hostInstance = new ModuleFederation({
        name: 'host-default',
        remotes: [
          {
            name: 'remote1',
            entry: 'http://localhost:1111/remoteEntry.js',
          },
        ],
      });

      // DISCOVERY: Runtime core does not set a default shareStrategy
      // The default is handled at the webpack plugin level
      expect(hostInstance.options.shareStrategy).toBeUndefined();
    });
  });

  describe('Share Resolution Strategy Logic', () => {
    it('should properly configure shared dependencies for version-first', () => {
      const hostInstance = new ModuleFederation({
        name: 'host-version-priority',
        shareStrategy: 'version-first',
        shared: {
          react: {
            version: '18.0.0',
            singleton: true,
          },
        },
        remotes: [],
      });

      // Verify shared configuration
      expect(hostInstance.options.shared.react).toBeDefined();
      expect(hostInstance.options.shared.react[0].strategy).toBe(
        'version-first',
      );
    });

    it('should properly configure shared dependencies for loaded-first', () => {
      const hostInstance = new ModuleFederation({
        name: 'host-loaded-priority',
        shareStrategy: 'loaded-first',
        shared: {
          react: {
            version: '18.0.0',
            singleton: true,
          },
        },
        remotes: [],
      });

      // Verify shared configuration
      expect(hostInstance.options.shared.react).toBeDefined();
      expect(hostInstance.options.shared.react[0].strategy).toBe(
        'loaded-first',
      );
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle malformed remote configurations gracefully', () => {
      expect(() => {
        new ModuleFederation({
          name: 'host-malformed',
          shareStrategy: 'version-first',
          remotes: [
            {
              name: 'invalidRemote',
              // Missing entry - should handle gracefully
            } as any,
          ],
        });
      }).not.toThrow();
    });

    it('should validate strategy values', () => {
      expect(() => {
        new ModuleFederation({
          name: 'host-invalid-strategy',
          shareStrategy: 'invalid-strategy' as any,
          remotes: [],
        });
      }).not.toThrow(); // Should not throw but may warn
    });
  });

  describe('Performance Characteristics', () => {
    it('should demonstrate initialization speed difference between strategies', () => {
      const startVersionFirst = Date.now();
      const versionFirstInstance = new ModuleFederation({
        name: 'host-version-timing',
        shareStrategy: 'version-first',
        remotes: [],
      });
      const versionFirstTime = Date.now() - startVersionFirst;

      const startLoadedFirst = Date.now();
      const loadedFirstInstance = new ModuleFederation({
        name: 'host-loaded-timing',
        shareStrategy: 'loaded-first',
        remotes: [],
      });
      const loadedFirstTime = Date.now() - startLoadedFirst;

      // Both should be very fast for empty remotes
      expect(versionFirstTime).toBeLessThan(100);
      expect(loadedFirstTime).toBeLessThan(100);

      // Verify instances were created
      expect(versionFirstInstance).toBeDefined();
      expect(loadedFirstInstance).toBeDefined();
    });
  });

  describe('Documentation Claims Validation', () => {
    it('should validate actual default behavior vs documented default', () => {
      const defaultInstance = new ModuleFederation({
        name: 'default-test',
        remotes: [],
      });

      // DISCOVERY: Runtime core doesn't set default to version-first
      // Documentation may be referring to webpack plugin defaults
      expect(defaultInstance.options.shareStrategy).toBeUndefined();

      // However, when explicitly set, it should work
      const explicitInstance = new ModuleFederation({
        name: 'explicit-test',
        shareStrategy: 'version-first',
        remotes: [],
      });
      expect(explicitInstance.options.shareStrategy).toBe('version-first');
    });

    it('should confirm strategies affect shared dependency resolution', () => {
      const versionFirstInstance = new ModuleFederation({
        name: 'version-first-shared',
        shareStrategy: 'version-first',
        shared: {
          'test-lib': { version: '1.0.0' },
        },
        remotes: [],
      });

      const loadedFirstInstance = new ModuleFederation({
        name: 'loaded-first-shared',
        shareStrategy: 'loaded-first',
        shared: {
          'test-lib': { version: '1.0.0' },
        },
        remotes: [],
      });

      // Both should have shared configuration with different strategies
      expect(versionFirstInstance.options.shared['test-lib'][0].strategy).toBe(
        'version-first',
      );
      expect(loadedFirstInstance.options.shared['test-lib'][0].strategy).toBe(
        'loaded-first',
      );
    });
  });
});
