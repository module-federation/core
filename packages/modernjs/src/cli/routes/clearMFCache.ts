export function clearMFCache() {
  if (!globalThis.__FEDERATION__) {
    console.log('clearMFCache no globalThis.__FEDERATION__');
    return;
  }
  globalThis.__FEDERATION__.__INSTANCES__.map((i) => {
    i.moduleCache.forEach((mc) => {
      if (mc.remoteInfo && mc.remoteInfo.entryGlobalName) {
        delete globalThis[mc.remoteInfo.entryGlobalName];
      }
    });
    i.moduleCache.clear();
    if (globalThis[i.name]) {
      delete globalThis[i.name];
    }
  });
  Object.keys(globalThis.__FEDERATION__).forEach((key) => {
    if (Array.isArray(globalThis.__FEDERATION__[key])) {
      globalThis.__FEDERATION__[key] = [];
    } else if (key === '__PRELOADED_MAP__') {
      globalThis.__FEDERATION__[key] = new Map();
    } else if (typeof globalThis.__FEDERATION__[key] === 'object') {
      globalThis.__FEDERATION__[key] = {};
    }
  });
  if (globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__) {
    globalThis.__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
  }
  globalThis.FORCE_MF_REFRESH = true;
}
