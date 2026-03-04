import { InitContainerEntryOptions, WebpackRequire } from './types';

export function initContainerEntry(
  options: InitContainerEntryOptions,
): WebpackRequire['I'] | void {
  const {
    webpackRequire,
    shareScope,
    initScope,
    shareScopeKey,
    remoteEntryInitOptions,
  } = options;
  if (!webpackRequire.S) return;
  if (
    !webpackRequire.federation ||
    !webpackRequire.federation.instance ||
    !webpackRequire.federation.initOptions
  )
    return;

  const federationInstance = webpackRequire.federation.instance;

  federationInstance.initOptions({
    name: webpackRequire.federation.initOptions.name,
    remotes: [],
    ...remoteEntryInitOptions,
  });

  const hostShareScopeKeys = remoteEntryInitOptions?.shareScopeKeys;
  const hostShareScopeMap = remoteEntryInitOptions?.shareScopeMap;

  // host: 'default' remote: 'default'  remote['default'] = hostShareScopeMap['default']
  // host: ['default', 'scope1'] remote: 'default'  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scop1']
  // host: 'default' remote: ['default','scope1']  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1'] = {}
  // host: ['scope1','default'] remote: ['scope1','scope2'] => remote['scope1'] = hostShareScopeMap['scope1']; remote['scope2'] = hostShareScopeMap['scope2'] = {};
  if (!shareScopeKey || typeof shareScopeKey === 'string') {
    const key = shareScopeKey || 'default';
    if (Array.isArray(hostShareScopeKeys)) {
      // const sc = hostShareScopeMap![key];
      // if (!sc) {
      //   throw new Error('shareScopeKey is not exist in hostShareScopeMap');
      // }
      // federationInstance.initShareScopeMap(key, sc, {
      //   hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
      // });

      hostShareScopeKeys.forEach((hostKey) => {
        if (!hostShareScopeMap![hostKey]) {
          hostShareScopeMap![hostKey] = {};
        }
        const sc = hostShareScopeMap![hostKey];
        federationInstance.initShareScopeMap(hostKey, sc, {
          hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
        });
      });
    } else {
      federationInstance.initShareScopeMap(key, shareScope, {
        hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
      });
    }
  } else {
    shareScopeKey.forEach((key) => {
      if (!hostShareScopeKeys || !hostShareScopeMap) {
        federationInstance.initShareScopeMap(key, shareScope, {
          hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
        });
        return;
      }

      if (!hostShareScopeMap[key]) {
        hostShareScopeMap[key] = {};
      }
      const sc = hostShareScopeMap[key];
      federationInstance.initShareScopeMap(key, sc, {
        hostShareScopeMap: remoteEntryInitOptions?.shareScopeMap || {},
      });
    });
  }

  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }
  if (typeof webpackRequire.federation.prefetch === 'function') {
    webpackRequire.federation.prefetch();
  }

  if (!Array.isArray(shareScopeKey)) {
    // @ts-ignore
    return webpackRequire.I(shareScopeKey || 'default', initScope);
  }

  var proxyInitializeSharing = Boolean(
    webpackRequire.federation.initOptions.shared,
  );

  if (proxyInitializeSharing) {
    // @ts-ignore
    return webpackRequire.I(shareScopeKey, initScope);
  }
  // @ts-ignore
  return Promise.all(
    shareScopeKey.map((key) => {
      // @ts-ignore
      return webpackRequire.I(key, initScope);
    }),
  ).then(() => true);
}
