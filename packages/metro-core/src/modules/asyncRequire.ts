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
        }
      } catch {
        // metro-cache not installed — cache layer disabled
      }
    }
  }

  // CacheManager singleton shared via globalThis
  let cacheManager: any = (globalThis as any).__MFE_CACHE_MANAGER__ ?? null;

  return async (originalBundlePath: string) => {
    const scope = globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__];

    const publicPath = getPublicPath(scope.origin);
    const bundlePath = getBundlePath(originalBundlePath, publicPath);

    console.log(
      '[MFE-Cache] loadBundleAsync:',
      __METRO_GLOBAL_PREFIX__,
      isUrl(bundlePath) ? bundlePath.split('?')[0] : bundlePath,
    );

    // --- Cache layer: only intercept remote bundles (full URLs) ---
    if (cacheEnabled && cacheModule && isUrl(bundlePath)) {
      const { CacheManager, NativeMFECache } = cacheModule;

      // Lazy-init CacheManager singleton
      if (!cacheManager) {
        cacheManager = new CacheManager();
        await cacheManager.initialize();
        (globalThis as any).__MFE_CACHE_MANAGER__ = cacheManager;
      }

      try {
        const cached = await cacheManager.getCachedBundle(bundlePath);

        if (cached) {
          // Path A: cache HIT — read from disk + JS eval
          console.log('[MFE-Cache] HIT:', cached.filePath);
          const source = await NativeMFECache.readFile(cached.filePath, 'utf8');
          eval(source);
        } else {
          // Path B: cache MISS — download + save + read + JS eval
          const urlParts = bundlePath.split('/');
          const bundleFileName =
            urlParts[urlParts.length - 1]?.split('.')[0] ?? 'unknown';
          const remoteName = bundleFileName;

          const destPath = await cacheManager.getBundleDestPath(
            remoteName,
            bundlePath,
          );
          console.log('[MFE-Cache] MISS:', remoteName, '→', destPath);

          const { sha256 } = await NativeMFECache.downloadFile(
            bundlePath,
            destPath,
          );

          await cacheManager.saveBundleToCache(remoteName, destPath, {
            bundleUrl: bundlePath,
            bundleHash: sha256,
          });

          const source = await NativeMFECache.readFile(destPath, 'utf8');
          eval(source);
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
      // No cache: split bundles, dev without FORCE_CACHE, or metro-cache not installed
      const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');
      await loadBundleAsync(encodedBundlePath);
    }

    // --- Below: shared/remotes preloading (unchanged) ---

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
