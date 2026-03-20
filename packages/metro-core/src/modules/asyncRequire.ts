// join two paths
// e.g. /a/b/ + /c/d -> /a/b/c/d
function joinComponents(prefix: string, suffix: string) {
  return prefix.replace(/\/+$/, '') + '/' + suffix.replace(/^\/+/, '');
}

// get the public path from the url
// e.g. http://host:8081/a/b.bundle -> http://host:8081/a
function getPublicPath(url?: string) {
  return url?.split('/').slice(0, -1).join('/');
}

function isUrl(url: string) {
  return url.match(/^https?:\/\//);
}

// Extract a bundle name from a URL for cache grouping
// e.g. https://cdn.example.com/miniApp/mini.bundle → "miniApp/mini"
// e.g. https://cdn.example.com/miniApp/exposed/info.bundle → "miniApp/exposed/info"
// e.g. http://localhost:8082/mini.bundle?platform=ios → "mini"
function extractBundleName(url: string): string {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.replace(/^\/+/, '').split('/');
    // Remove .bundle extension and query params from last segment
    if (pathParts.length > 0) {
      pathParts[pathParts.length - 1] = pathParts[pathParts.length - 1]
        .split('.')[0]
        .split('?')[0];
    }
    return pathParts.join('/') || 'unknown';
  } catch {
    // Fallback for non-URL paths
    const last = url.split('/').pop() ?? 'unknown';
    return last.split('.')[0].split('?')[0];
  }
}

// get bundle id from the bundle path
// e.g. /a/b.bundle?platform=ios -> a/b
// e.g. http://host:8081/a/b.bundle -> a/b
function getBundleId(bundlePath: string, publicPath: string) {
  let path = bundlePath;
  // remove the public path if it's an url
  if (isUrl(path)) {
    path = path.replace(publicPath, '');
  }
  // remove the leading slash
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  // remove the query params
  path = path.split('?')[0];
  // remove the bundle extension
  return path.replace('.bundle', '');
}

function isSameOrigin(url: string, originPublicPath?: string) {
  // if it's not a fully qualified url, we assume it's the same origin
  if (!isUrl(url)) {
    return true;
  }
  return !!originPublicPath && url.startsWith(originPublicPath);
}

// prefix the bundle path with the public path
// e.g. /a/b.bundle -> http://host:8081/a/b.bundle
function getBundlePath(bundlePath: string, bundleOrigin?: string) {
  // don't modify the path in development
  if (process.env.NODE_ENV !== 'production') {
    return bundlePath;
  }
  // don't modify fully qualified urls
  // e.g. when loading container modules
  if (isUrl(bundlePath)) {
    return bundlePath;
  }
  // don't modify the path if we don't know the bundle origin
  // e.g. when loading host split bundles
  if (!bundleOrigin) {
    return bundlePath;
  }
  return joinComponents(bundleOrigin, bundlePath);
}

function buildLoadBundleAsyncWrapper() {
  const registry = require('mf:remote-module-registry');

  const __loadBundleAsync =
    globalThis[`${__METRO_GLOBAL_PREFIX__ ?? ''}__loadBundleAsync`];

  const loadBundleAsync =
    __loadBundleAsync as typeof globalThis.__loadBundleAsync;

  // DEBUG: set to true to test cache layer in dev mode
  const FORCE_CACHE_IN_DEV = true;

  // Try to load metro-cache for caching.
  // Host loads via require, remotes reuse via globalThis (they can't require metro-cache).
  let cacheModule: {
    CacheManager: any;
    NativeMFECache: any;
  } | null = null;

  const cacheEnabled =
    process.env.NODE_ENV === 'production' || FORCE_CACHE_IN_DEV;

  if (cacheEnabled) {
    if ((globalThis as any).__MFE_CACHE_MODULE__) {
      cacheModule = (globalThis as any).__MFE_CACHE_MODULE__;
    } else {
      try {
        const mod = require('@module-federation/metro-cache');
        if (mod?.NativeMFECache && mod?.CacheManager) {
          cacheModule = mod;
          (globalThis as any).__MFE_CACHE_MODULE__ = mod;
          // Install JSI bindings (sync) — runtime is guaranteed ready since JS is running
          if (typeof mod.NativeMFECache.installJSI === 'function') {
            mod.NativeMFECache.installJSI();
          }
        }
      } catch {
        // metro-cache not installed — cache layer disabled
      }
    }
  }

  // CacheManager singleton shared via globalThis
  let cacheManager: any = (globalThis as any).__MFE_CACHE_MANAGER__ ?? null;
  let cacheInitPromise: Promise<void> | null = null;

  // Inflight dedup: same bundlePath won't trigger concurrent downloads.
  // On error the entry is removed so the next call can retry.
  const inflight = new Map<string, Promise<void>>();

  // Helper: read bundle from file and eval
  function evalFromFile(filePath: string, NativeMFECache: any) {
    if (typeof (globalThis as any).__MFE_readFileSync === 'function') {
      const source = (globalThis as any).__MFE_readFileSync(filePath);
      eval(source);
    } else {
      // Fallback: async read (less ideal — introduces a microtask gap)
      return NativeMFECache.readFile(filePath, 'utf8').then(
        (source: string) => {
          eval(source);
        },
      );
    }
  }

  // Helper: lazy-init CacheManager singleton
  async function ensureCacheManager() {
    if (!cacheManager) {
      if (!cacheInitPromise) {
        cacheInitPromise = (async () => {
          const cm = new cacheModule!.CacheManager();
          await cm.initialize();
          cacheManager = cm;
          (globalThis as any).__MFE_CACHE_MANAGER__ = cm;
        })();
      }
      await cacheInitPromise;
    }
    return cacheManager;
  }

  async function doLoadBundle(originalBundlePath: string) {
    const scope = globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__];

    const publicPath = getPublicPath(scope.origin);
    let bundlePath = getBundlePath(originalBundlePath, publicPath);

    const isSplitBundle = !isUrl(originalBundlePath);

    // For remote split bundles with cache enabled, convert relative paths to
    // full URLs so they enter the same cache path as container bundles.
    // In dev mode, getBundlePath returns relative paths unchanged, but we need
    // full URLs for the cache layer (download + eval).
    if (
      isSplitBundle &&
      cacheEnabled &&
      cacheModule &&
      publicPath &&
      !isUrl(bundlePath)
    ) {
      bundlePath = joinComponents(publicPath, bundlePath);
    }

    // --- Cache layer: intercept bundles with full URLs (containers + remote split bundles) ---
    if (cacheEnabled && cacheModule && isUrl(bundlePath)) {
      const { NativeMFECache } = cacheModule;

      await ensureCacheManager();

      try {
        // Resolve expected hash from manifest (strip query params for lookup)
        const bundlePathNoQuery = bundlePath.split('?')[0];
        const expectedHash = ((globalThis as any).__MFE_BUNDLE_HASHES__ ?? {})[
          bundlePathNoQuery
        ] as string | undefined;

        // If manifest has no hash for this bundle, we can't verify integrity
        // — skip cache entirely and fall back to network load
        if (!expectedHash) {
          const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');
          await loadBundleAsync(encodedBundlePath);
        } else {
          const cached = await cacheManager.getCachedBundle(bundlePath);

          // Determine if cache is valid: hash must match manifest
          const cacheValid =
            cached &&
            cached.metadata.bundleHash &&
            cached.metadata.bundleHash === expectedHash;

          if (cacheValid) {
            // Path A: cache HIT with matching hash — use cached bundle
            cacheManager.updateLastUsedAt(bundlePath).catch(() => {});
            await evalFromFile(cached.filePath, NativeMFECache);
          } else {
            // Path B: cache MISS or EXPIRED — download fresh bundle
            const remoteName = extractBundleName(bundlePath);
            const destPath = await cacheManager.getBundleDestPath(
              remoteName,
              bundlePath,
            );

            const { sha256 } = await NativeMFECache.downloadFile(
              bundlePath,
              destPath,
            );

            // Checksum verification against manifest hash
            if (sha256 !== expectedHash) {
              try {
                await NativeMFECache.deleteFile(destPath);
              } catch {
                /* ok */
              }
              // Fall back to network load
              const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');
              await loadBundleAsync(encodedBundlePath);
            } else {
              await cacheManager.saveBundleToCache(remoteName, destPath, {
                bundleUrl: bundlePath,
                bundleHash: sha256,
              });
              await evalFromFile(destPath, NativeMFECache);
            }
          }
        }
      } catch (cacheError) {
        console.warn(
          '[MFE-Cache] cache error, falling back to network:',
          cacheError,
        );
        const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');
        await loadBundleAsync(encodedBundlePath);
      }
    } else {
      // No cache: host split bundles (no publicPath), cache disabled, or metro-cache not installed
      const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');
      await loadBundleAsync(encodedBundlePath);
    }

    // --- Below: shared/remotes preloading ---

    // when the origin is not the same, it means we are loading a remote container
    // we can return early since dependencies are processed differently for entry bundles
    if (!isSameOrigin(bundlePath, publicPath)) {
      return;
    }

    // at this point the code in the bundle has been evaluated
    // but not yet executed through metroRequire
    // note: at this point, public path is always defined
    const bundleId = getBundleId(bundlePath, publicPath!);
    const shared = scope.deps.shared[bundleId];
    const remotes = scope.deps.remotes[bundleId];

    const promises = [];
    if (shared && shared.length > 0) {
      // load shared used synchronously in the bundle
      promises.push(...shared.map(registry.loadSharedToRegistry));
    }
    if (remotes && remotes.length > 0) {
      // load remotes used synchronously in the bundle
      promises.push(...remotes.map(registry.loadRemoteToRegistry));
    }

    await Promise.all(promises);
  }

  return (originalBundlePath: string): Promise<void> => {
    const existing = inflight.get(originalBundlePath);
    if (existing) {
      return existing;
    }

    const promise = doLoadBundle(originalBundlePath).catch((err) => {
      inflight.delete(originalBundlePath);
      throw err;
    });

    inflight.set(originalBundlePath, promise);
    return promise;
  };
}

// load expo async require if outside expo
if (!process.env.EXPO_OS) {
  // @expo/metro-runtime/src/async-require/fetchAsync.native.ts requires
  // process.env.EXPO_OS to be set but since expo is optional, we set it
  // to an empty string as a fallback to prevent reference errors
  process.env.EXPO_OS = '';

  const {
    buildAsyncRequire,
  } = require('@expo/metro-runtime/src/async-require/buildAsyncRequire');

  global[`${__METRO_GLOBAL_PREFIX__}__loadBundleAsync`] = buildAsyncRequire();
}

global[`${__METRO_GLOBAL_PREFIX__}__loadBundleAsync`] =
  buildLoadBundleAsyncWrapper();
