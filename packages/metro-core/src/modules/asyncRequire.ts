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
    // @ts-expect-error dynamic key access on global object
    globalThis[`${__METRO_GLOBAL_PREFIX__ ?? ''}__loadBundleAsync`];

  const loadBundleAsync =
    __loadBundleAsync as typeof globalThis.__loadBundleAsync;

  return async (originalBundlePath: string) => {
    const scope = globalThis.__FEDERATION__.__NATIVE__[__METRO_GLOBAL_PREFIX__];

    // entry is always in the root directory of assets associated with remote
    // based on that, we extract the public path from the origin URL
    // e.g. http://example.com/a/b/c/mf-manfiest.json -> http://example.com/a/b/c
    const publicPath = getPublicPath(scope.origin);
    const bundlePath = getBundlePath(originalBundlePath, publicPath);

    // ../../node_modules/ -> ..%2F..%2Fnode_modules/ so that it's not automatically sanitized
    const encodedBundlePath = bundlePath.replaceAll('../', '..%2F');

    const result = await loadBundleAsync(encodedBundlePath);

    // when the origin is not the same, it means we are loading a remote container
    // we can return early since dependencies are processed differently for entry bundles
    if (!isSameOrigin(bundlePath, publicPath)) {
      return result;
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

    return result;
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

  // @ts-expect-error dynamic key access on global object
  global[`${__METRO_GLOBAL_PREFIX__}__loadBundleAsync`] = buildAsyncRequire();
}

// @ts-expect-error dynamic key access on global object
global[`${__METRO_GLOBAL_PREFIX__}__loadBundleAsync`] =
  buildLoadBundleAsyncWrapper();
