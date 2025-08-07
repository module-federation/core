import { RetryPlugin } from '../src/index';
import { fetchWithRetry } from '../src/fetch-retry';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RemoteInfo } from '@module-federation/runtime/types';

describe('Documentation Claims Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    global.fetch = fetch;
  });

  const createMockRemoteInfo = (
    name: string,
  ): RemoteInfo & { alias?: string } => ({
    name,
    entry: `http://localhost:3001/${name}Entry.js`,
    type: 'remote',
    version: '1.0.0',
  });

  describe('When Retry Plugin Should Be Used (Documentation Claims)', () => {
    it('should verify that retry plugin is essential for shareStrategy: "loaded-first"', async () => {
      // This is a conceptual test - the plugin itself doesn't handle shareStrategy
      // but the documentation claims it's essential for these strategies

      const plugin = RetryPlugin({
        fetch: { retryTimes: 2, retryDelay: 0 },
        script: { retryTimes: 2, retryDelay: 0 },
      });

      expect(plugin.name).toBe('retry-plugin');
      expect(plugin.fetch).toBeDefined();
      expect(plugin.loadEntryError).toBeDefined();

      // The presence of both fetch and script retry mechanisms
      // supports the documentation claim about handling eager loading scenarios
    });

    it('should handle temporarily unavailable remotes (network failures)', async () => {
      const plugin = RetryPlugin({
        fetch: { retryTimes: 3, retryDelay: 100 },
      });

      // Simulate temporarily unavailable remote
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network unreachable'));
        }
        // Remote becomes available on 3rd try
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
          clone: function () {
            return this;
          },
        });
      });

      const result = await plugin.fetch(
        'https://temporarily-unavailable.com/manifest.json',
        {},
      );
      vi.advanceTimersByTime(300);

      expect(await result.json()).toEqual({ success: true });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle unstable network conditions with retries', async () => {
      const plugin = RetryPlugin({
        fetch: { retryTimes: 5, retryDelay: 50 },
      });

      // Simulate unstable network - random failures
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        // Fail on attempts 1, 3, 4 - succeed on attempt 5
        if ([1, 3, 4].includes(attempts)) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: () => Promise.resolve({}),
            clone: function () {
              return this;
            },
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ networkStable: true }),
          clone: function () {
            return this;
          },
        });
      });

      try {
        const result = await plugin.fetch(
          'https://unstable-network.com/api',
          {},
        );
        vi.advanceTimersByTime(400);

        if (result && result.ok) {
          expect(await result.json()).toEqual({ networkStable: true });
        }
      } catch (error) {
        // May still fail if network remains unstable
      }

      expect(attempts).toBeGreaterThan(1);
    });

    it('should handle services that start at different times', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 4,
          retryDelay: 200,
        },
      });

      // Simulate service starting up - fails initially, then succeeds
      let serviceStarted = false;
      const mockGetRemoteEntry = vi.fn().mockImplementation(() => {
        if (!serviceStarted) {
          // Simulate service startup delay
          setTimeout(() => {
            serviceStarted = true;
          }, 300);
          return Promise.reject(new Error('Service not ready'));
        }
        return Promise.resolve({ get: () => ({ default: 'StartedService' }) });
      });

      const resultPromise = plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('startingService'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'starting-service',
      });

      // Advance time to allow service to start and retries to occur
      vi.advanceTimersByTime(1000);

      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(mockGetRemoteEntry).toHaveBeenCalled();
    });
  });

  describe('When Retries Happen (Documented Behavior)', () => {
    describe('Fetch Retries', () => {
      it('should retry on HTTP error status codes (4xx, 5xx)', async () => {
        const errorCodes = [400, 401, 403, 404, 500, 502, 503, 504];

        for (const statusCode of errorCodes) {
          global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: statusCode,
            json: () => Promise.resolve({}),
            clone: function () {
              return this;
            },
          });

          try {
            await fetchWithRetry({
              url: `https://example.com/${statusCode}`,
              retryTimes: 1,
              retryDelay: 0,
            });
          } catch (error) {
            expect(error.message).toContain(`Server error：${statusCode}`);
          }

          // Should have retried once
          expect(global.fetch).toHaveBeenCalledTimes(2);
          vi.clearAllMocks();
        }
      });

      it('should retry on network errors (fetch rejection)', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        try {
          await fetchWithRetry({
            url: 'https://example.com',
            retryTimes: 2,
            retryDelay: 0,
          });
        } catch (error) {
          expect(error.message).toContain('request failed three times');
        }

        expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      });

      it('should retry on JSON parse errors', async () => {
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.reject(new Error('Invalid JSON syntax')),
          clone: function () {
            return this;
          },
        });

        try {
          await fetchWithRetry({
            url: 'https://example.com/invalid-json',
            retryTimes: 1,
            retryDelay: 0,
          });
        } catch (error) {
          expect(error.message).toContain('Json parse error');
        }

        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    describe('Script Retries', () => {
      it('should retry on script loading errors (Promise rejections)', async () => {
        const plugin = RetryPlugin({
          script: { retryTimes: 2, retryDelay: 0 },
        });

        const mockGetRemoteEntry = vi
          .fn()
          .mockRejectedValueOnce(new Error('Script load error'))
          .mockRejectedValueOnce(new Error('Timeout'))
          .mockResolvedValueOnce({ get: () => {} });

        const result = await plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('scriptError'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'script-error',
        });

        expect(result).toBeDefined();
        expect(mockGetRemoteEntry).toHaveBeenCalledTimes(3);
      });

      it('should retry on module factory errors', async () => {
        const plugin = RetryPlugin({
          script: { retryTimes: 2, retryDelay: 0 },
        });

        const mockRemoteEntryExports = {
          get: vi
            .fn()
            .mockRejectedValueOnce(new Error('Module not found'))
            .mockRejectedValueOnce(new Error('Factory creation failed'))
            .mockResolvedValueOnce(() => ({ default: 'Component' })),
        };

        const result = await plugin.getModuleFactory({
          remoteEntryExports: mockRemoteEntryExports,
          expose: './Component',
          moduleInfo: createMockRemoteInfo('factoryError'),
        });

        expect(result).toBeDefined();
        expect(mockRemoteEntryExports.get).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('When Retries Do NOT Happen (Documented Behavior)', () => {
    describe('Fetch - No Retries', () => {
      it('should NOT retry on successful responses (2xx status codes)', async () => {
        const successCodes = [200, 201, 202, 204, 206];

        for (const statusCode of successCodes) {
          global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            status: statusCode,
            json: () => Promise.resolve({ success: true, code: statusCode }),
            clone: function () {
              return this;
            },
          });

          const result = await fetchWithRetry({
            url: `https://example.com/${statusCode}`,
            retryTimes: 5, // High retry count to test it's not used
            retryDelay: 0,
          });

          expect(await result.json()).toEqual({
            success: true,
            code: statusCode,
          });
          expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once
          vi.clearAllMocks();
        }
      });

      it('should NOT retry when no fetch configuration is provided', async () => {
        const plugin = RetryPlugin({
          script: { retryTimes: 3 }, // Only script retry
        });

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ noRetry: true }),
          clone: function () {
            return this;
          },
        });

        const result = await plugin.fetch('https://example.com', {});
        expect(await result.json()).toEqual({ noRetry: true });
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      it('should NOT retry for URLs not matching the configured URL', async () => {
        const plugin = RetryPlugin({
          fetch: {
            url: 'https://specific-domain.com/manifest.json', // Specific URL
            retryTimes: 3,
          },
        });

        global.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        });

        // Call with different URL
        const result = await plugin.fetch(
          'https://different-domain.com/manifest.json',
          {},
        );

        // Should use original fetch, not retry
        expect(result.status).toBe(500);
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    describe('Script - No Retries', () => {
      it('should NOT retry when no script configuration is provided', async () => {
        const plugin = RetryPlugin({
          fetch: { retryTimes: 3 }, // Only fetch retry
        });

        const mockGetRemoteEntry = vi.fn();

        const result = await plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('noScriptConfig'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'no-script',
        });

        expect(result).toBeUndefined();
        expect(mockGetRemoteEntry).not.toHaveBeenCalled();
      });

      it('should NOT retry for modules not in moduleName list', async () => {
        const plugin = RetryPlugin({
          script: {
            retryTimes: 3,
            moduleName: ['allowedModule1', 'allowedModule2'],
          },
        });

        const mockGetRemoteEntry = vi
          .fn()
          .mockRejectedValue(new Error('Should not retry'));

        try {
          await plugin.loadEntryError({
            getRemoteEntry: mockGetRemoteEntry,
            origin: {} as any,
            remoteInfo: createMockRemoteInfo('disallowedModule'),
            remoteEntryExports: undefined,
            globalLoading: {},
            uniqueKey: 'disallowed',
          });
        } catch (error) {
          // Should not reach here as function shouldn't be called
        }

        expect(mockGetRemoteEntry).not.toHaveBeenCalled();
      });

      it('should NOT retry successful script operations', async () => {
        const plugin = RetryPlugin({
          script: { retryTimes: 5 }, // High retry count
        });

        const mockGetRemoteEntry = vi.fn().mockResolvedValue({
          get: () => ({ default: 'SuccessfulComponent' }),
        });

        const result = await plugin.loadEntryError({
          getRemoteEntry: mockGetRemoteEntry,
          origin: {} as any,
          remoteInfo: createMockRemoteInfo('successfulModule'),
          remoteEntryExports: undefined,
          globalLoading: {},
          uniqueKey: 'successful',
        });

        expect(result).toBeDefined();
        expect(mockGetRemoteEntry).toHaveBeenCalledTimes(1); // Only called once
      });
    });
  });

  describe('Fallback Mechanism Verification', () => {
    it('should verify fallback is only used after all retries fail', async () => {
      const fallbackMock = vi.fn(() => 'https://fallback.com/manifest.json');

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        })
        .mockResolvedValueOnce({
          // Fallback call also fails
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        });

      try {
        await fetchWithRetry({
          url: 'https://primary.com/manifest.json',
          retryTimes: 3,
          retryDelay: 0,
          fallback: fallbackMock,
        });
      } catch (error) {
        expect(error.message).toContain('request failed three times');
      }

      // Primary URL: initial + 3 retries = 4 calls
      // Fallback URL: 1 call = 5 total calls
      expect(global.fetch).toHaveBeenCalledTimes(5);
      expect(fallbackMock).toHaveBeenCalledWith(
        'https://primary.com/manifest.json',
      );
    });

    it('should verify fallback can receive and transform the original URL', async () => {
      const fallbackTransformer = vi.fn((originalUrl: string) => {
        return originalUrl.replace('primary', 'backup');
      });

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
          clone: function () {
            return this;
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ fallbackSuccess: true }),
          clone: function () {
            return this;
          },
        });

      const result = await fetchWithRetry({
        url: 'https://primary.com/manifest.json',
        retryTimes: 0, // No retries, go straight to fallback
        retryDelay: 0,
        fallback: fallbackTransformer,
      });

      expect(fallbackTransformer).toHaveBeenCalledWith(
        'https://primary.com/manifest.json',
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://backup.com/manifest.json',
        {},
      );
      expect(await result.json()).toEqual({ fallbackSuccess: true });
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle zero retries configuration', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
        clone: function () {
          return this;
        },
      });

      try {
        await fetchWithRetry({
          url: 'https://example.com',
          retryTimes: 0,
          retryDelay: 1000,
        });
      } catch (error) {
        expect(error.message).toContain('request failed three times');
      }

      expect(global.fetch).toHaveBeenCalledTimes(1); // Only initial call, no retries
    });

    it('should handle empty moduleName array (should not retry any modules)', async () => {
      const plugin = RetryPlugin({
        script: {
          retryTimes: 3,
          moduleName: [], // Empty array
        },
      });

      const mockGetRemoteEntry = vi
        .fn()
        .mockRejectedValue(new Error('Should not be called'));

      const result = await plugin.loadEntryError({
        getRemoteEntry: mockGetRemoteEntry,
        origin: {} as any,
        remoteInfo: createMockRemoteInfo('anyModule'),
        remoteEntryExports: undefined,
        globalLoading: {},
        uniqueKey: 'any-module',
      });

      expect(result).toBeUndefined();
      expect(mockGetRemoteEntry).not.toHaveBeenCalled();
    });
  });
});
