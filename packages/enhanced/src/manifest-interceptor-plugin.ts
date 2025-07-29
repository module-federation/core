/**
 * Manifest Loading Interceptor Plugin
 *
 * Provides early error detection and handling for manifest.json loading failures.
 * This plugin intercepts manifest requests at the earliest possible point to prevent
 * cascading failures and provide immediate fallback strategies.
 */

import type { ModuleFederationRuntimePlugin } from '@module-federation/enhanced/runtime';

export interface ManifestInterceptorConfig {
  /** Maximum time to wait for manifest loading (ms) */
  timeout?: number;
  /** Enable early validation of manifest structure */
  validateStructure?: boolean;
  /** Fallback manifest URLs to try in order */
  fallbackUrls?: string[];
  /** Custom error handler for manifest failures */
  onError?: (error: Error, url: string) => Promise<any> | any;
  /** Enable development mode mock manifest */
  enableMockInDev?: boolean;
  /** Mock manifest data for development */
  mockManifest?: any;
}

export interface ManifestValidationError extends Error {
  code:
    | 'MANIFEST_INVALID_STRUCTURE'
    | 'MANIFEST_TIMEOUT'
    | 'MANIFEST_NETWORK_ERROR';
  originalError?: Error;
  manifestUrl?: string;
}

/**
 * Creates a manifest validation error with proper typing
 */
function createManifestError(
  code: ManifestValidationError['code'],
  message: string,
  originalError?: Error,
  manifestUrl?: string,
): ManifestValidationError {
  const error = new Error(message) as ManifestValidationError;
  error.code = code;
  error.originalError = originalError;
  error.manifestUrl = manifestUrl;
  return error;
}

/**
 * Validates manifest structure to catch errors early
 */
function validateManifestStructure(manifest: any, url: string): void {
  if (!manifest || typeof manifest !== 'object') {
    throw createManifestError(
      'MANIFEST_INVALID_STRUCTURE',
      `Manifest at ${url} is not a valid object`,
      undefined,
      url,
    );
  }

  const requiredFields = ['metaData', 'exposes', 'shared'];
  const missingFields = requiredFields.filter((field) => !(field in manifest));

  if (missingFields.length > 0) {
    throw createManifestError(
      'MANIFEST_INVALID_STRUCTURE',
      `Manifest at ${url} is missing required fields: ${missingFields.join(', ')}`,
      undefined,
      url,
    );
  }

  // Validate metaData structure
  if (!manifest.metaData || typeof manifest.metaData !== 'object') {
    throw createManifestError(
      'MANIFEST_INVALID_STRUCTURE',
      `Manifest at ${url} has invalid metaData structure`,
      undefined,
      url,
    );
  }
}

/**
 * Fetches manifest with timeout and validation
 */
async function fetchManifestWithTimeout(
  url: string,
  timeout: number,
  validateStructure: boolean,
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw createManifestError(
        'MANIFEST_NETWORK_ERROR',
        `Failed to fetch manifest: ${response.status} ${response.statusText}`,
        undefined,
        url,
      );
    }

    const manifest = await response.json();

    if (validateStructure) {
      validateManifestStructure(manifest, url);
    }

    return manifest;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createManifestError(
        'MANIFEST_TIMEOUT',
        `Manifest loading timed out after ${timeout}ms`,
        error,
        url,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Creates the manifest interceptor plugin
 */
export function createManifestInterceptorPlugin(
  config: ManifestInterceptorConfig = {},
): ModuleFederationRuntimePlugin {
  const {
    timeout = 10000,
    validateStructure = true,
    fallbackUrls = [],
    onError,
    enableMockInDev = false,
    mockManifest,
  } = config;

  // Store failed URLs to avoid retrying
  const failedUrls = new Set<string>();
  const manifestCache = new Map<string, any>();

  return {
    name: 'manifest-interceptor-plugin',

    async beforeInit(args) {
      // Pre-validate configuration
      if (
        enableMockInDev &&
        process.env.NODE_ENV === 'development' &&
        mockManifest
      ) {
        console.warn(
          '[ManifestInterceptor] Using mock manifest in development mode',
        );
        if (validateStructure) {
          try {
            validateManifestStructure(mockManifest, 'mock://manifest');
          } catch (error) {
            console.error(
              '[ManifestInterceptor] Mock manifest validation failed:',
              error,
            );
          }
        }
      }

      return args;
    },

    async fetch(url, options) {
      // Only intercept manifest.json requests
      if (!url.includes('manifest.json') && !url.includes('mf-manifest.json')) {
        return;
      }

      // Return mock in development if enabled
      if (
        enableMockInDev &&
        process.env.NODE_ENV === 'development' &&
        mockManifest
      ) {
        console.log('[ManifestInterceptor] Returning mock manifest for:', url);
        return new Response(JSON.stringify(mockManifest), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Check cache first
      if (manifestCache.has(url)) {
        const cached = manifestCache.get(url);
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Skip if already failed
      if (failedUrls.has(url)) {
        console.warn(
          '[ManifestInterceptor] Skipping previously failed URL:',
          url,
        );
        return;
      }

      const urlsToTry = [url, ...fallbackUrls];
      let lastError: Error | undefined;

      // Try each URL in sequence
      for (const tryUrl of urlsToTry) {
        if (failedUrls.has(tryUrl)) {
          continue;
        }

        try {
          console.log(
            '[ManifestInterceptor] Attempting to fetch manifest from:',
            tryUrl,
          );
          const manifest = await fetchManifestWithTimeout(
            tryUrl,
            timeout,
            validateStructure,
          );

          // Cache successful result
          manifestCache.set(url, manifest);
          manifestCache.set(tryUrl, manifest);

          console.log(
            '[ManifestInterceptor] Successfully loaded manifest from:',
            tryUrl,
          );

          return new Response(JSON.stringify(manifest), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        } catch (error) {
          console.warn(
            '[ManifestInterceptor] Failed to load manifest from:',
            tryUrl,
            error.message,
          );
          failedUrls.add(tryUrl);
          lastError = error;

          // Call custom error handler if provided
          if (onError) {
            try {
              const result = await onError(error, tryUrl);
              if (result) {
                manifestCache.set(url, result);
                return new Response(JSON.stringify(result), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                });
              }
            } catch (handlerError) {
              console.error(
                '[ManifestInterceptor] Error handler failed:',
                handlerError,
              );
            }
          }
        }
      }

      // All URLs failed
      failedUrls.add(url);
      console.error('[ManifestInterceptor] All manifest URLs failed for:', url);

      // Return original fetch to let normal error handling proceed
      return;
    },

    async errorLoadRemote(args) {
      // Handle manifest-related errors that slip through
      if (args.lifecycle === 'afterResolve' && args.error) {
        const error = args.error as Error;

        // Check if this is a manifest-related error
        if (
          error.message.includes('manifest') ||
          error.message.includes('RUNTIME_003') ||
          args.id?.includes('manifest.json')
        ) {
          console.error(
            '[ManifestInterceptor] Handling manifest error for:',
            args.id,
            error.message,
          );

          // Try custom error handler one more time
          if (onError && args.id) {
            try {
              const result = await onError(error, args.id);
              if (result) {
                return result;
              }
            } catch (handlerError) {
              console.error(
                '[ManifestInterceptor] Final error handler failed:',
                handlerError,
              );
            }
          }
        }
      }

      return args;
    },
  };
}

/**
 * Pre-configured plugin for common use cases
 */
export const manifestInterceptorPlugin = createManifestInterceptorPlugin({
  timeout: 15000,
  validateStructure: true,
  enableMockInDev: true,
});
