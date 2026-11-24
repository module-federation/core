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

  const { shareScopeDispatch, additionalShareScopeKeys } =
    webpackRequire.federation;
  const additionalScopes: string[] = [];
  if (
    shareScopeDispatch === 'declared' &&
    hostShareScopeMap &&
    additionalShareScopeKeys?.length
  ) {
    const ownsArray = Array.isArray(shareScopeKey);
    const hostArray = Array.isArray(hostShareScopeKeys);
    for (const key of additionalShareScopeKeys) {
      if (
        ownsArray
          ? shareScopeKey.includes(key)
          : key === (shareScopeKey || 'default')
      ) {
        continue;
      }
      if (hostArray && !hostShareScopeKeys.includes(key)) continue;
      // A scalar container already binds every name from an array request.
      if (!hostArray || ownsArray) {
        if (!hostShareScopeMap[key]) hostShareScopeMap[key] = {};
        federationInstance.initShareScopeMap(key, hostShareScopeMap[key], {
          hostShareScopeMap,
        });
      }
      additionalScopes.push(key);
    }
  }

  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }

  const primary = !Array.isArray(shareScopeKey)
    ? webpackRequire.I(shareScopeKey || 'default', initScope)
    : webpackRequire.federation.initOptions.shared
      ? webpackRequire.I(shareScopeKey, initScope)
      : Promise.all(
          shareScopeKey.map((key) => webpackRequire.I(key, initScope)),
        ).then(() => true);

  if (!additionalScopes.length) return primary as WebpackRequire['I'] | void;

  const initializeAdditionalScopes = () =>
    Promise.all(
      additionalScopes.flatMap((scope) =>
        federationInstance.initializeSharing(scope, {
          from: 'build',
          strategy: federationInstance.options.shareStrategy,
          initScope,
          context: { shareScopeDispatch },
        }),
      ),
    ).then(() => true);
  const ready =
    primary &&
    typeof primary !== 'boolean' &&
    typeof primary.then === 'function'
      ? Promise.resolve(primary).then(initializeAdditionalScopes)
      : initializeAdditionalScopes();
  return ready as unknown as WebpackRequire['I'];
}
