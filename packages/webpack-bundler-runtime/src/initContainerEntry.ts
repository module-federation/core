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
    shared: federationInstance.options?.shared,
    ...remoteEntryInitOptions,
  });

  const hostShareScopeKeys = remoteEntryInitOptions?.shareScopeKeys;
  const hostShareScopeMap = remoteEntryInitOptions?.shareScopeMap || {};
  const existingShareScopeMap = federationInstance.shareScopeMap || {};

  /**
   * Resolve the share scope for a given key.
   * Precedence:
   * 1. Non-empty host scope from `hostShareScopeMap[key]`
   * 2. Existing scope from `existingShareScopeMap[key]`
   *    (when host scope is missing or empty)
   * 3. `fallbackShareScope` when host scope is empty
   *    and no existing scope — only when `fallbackWhenEmpty` is enabled
   * 4. `fallbackShareScope` when neither host nor existing has the key
   */
  const hasOwnScope = (scopeMap: Record<string, any>, key: string) =>
    Object.prototype.hasOwnProperty.call(scopeMap, key);
  const isEmptyShareScope = (scope: Record<string, any> | undefined) =>
    !scope || !Object.keys(scope).length;

  const resolveShareScope = (
    key: string,
    fallbackShareScope: Record<string, any>,
    options: { fallbackWhenEmpty?: boolean } = {},
  ) => {
    const currentShareScope = hostShareScopeMap[key];

    if (
      hasOwnScope(hostShareScopeMap, key) &&
      !isEmptyShareScope(currentShareScope)
    ) {
      return currentShareScope;
    }

    if (
      hasOwnScope(existingShareScopeMap, key) &&
      (!hasOwnScope(hostShareScopeMap, key) ||
        isEmptyShareScope(currentShareScope))
    ) {
      return existingShareScopeMap[key];
    }

    if (hasOwnScope(hostShareScopeMap, key)) {
      return options.fallbackWhenEmpty && isEmptyShareScope(currentShareScope)
        ? fallbackShareScope
        : currentShareScope;
    }

    return fallbackShareScope;
  };

  // host: 'default' remote: 'default'  remote['default'] = hostShareScopeMap['default']
  // host: ['default', 'scope1'] remote: 'default'  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1']
  // host: 'default' remote: ['default','scope1']  remote['default'] = hostShareScopeMap['default']; remote['scope1'] = hostShareScopeMap['scope1'] = {}
  // host: ['scope1','default'] remote: ['scope1','scope2'] => remote['scope1'] = hostShareScopeMap['scope1']; remote['scope2'] = hostShareScopeMap['scope2'] = {};
  if (!shareScopeKey || typeof shareScopeKey === 'string') {
    const key = shareScopeKey || 'default';
    if (Array.isArray(hostShareScopeKeys)) {
      hostShareScopeKeys.forEach((hostKey) => {
        const sc = resolveShareScope(hostKey, {});
        if (
          !hasOwnScope(hostShareScopeMap, hostKey) ||
          (hasOwnScope(existingShareScopeMap, hostKey) &&
            isEmptyShareScope(hostShareScopeMap[hostKey]))
        ) {
          // Write back the resolved scope to fix missing or empty entries
          // in the host map for subsequent iterations of this loop.
          hostShareScopeMap[hostKey] = sc;
        }
        federationInstance.initShareScopeMap(hostKey, sc, {
          hostShareScopeMap,
        });
      });
    } else {
      const sc = resolveShareScope(key, shareScope, {
        fallbackWhenEmpty: true,
      });
      federationInstance.initShareScopeMap(key, sc, {
        hostShareScopeMap,
      });
    }
  } else {
    const hasHostShareInfo =
      Boolean(hostShareScopeKeys) &&
      Boolean(remoteEntryInitOptions?.shareScopeMap);
    shareScopeKey.forEach((key) => {
      const sc = hasHostShareInfo
        ? resolveShareScope(key, {})
        : resolveShareScope(key, shareScope, { fallbackWhenEmpty: true });
      federationInstance.initShareScopeMap(key, sc, {
        hostShareScopeMap,
      });
    });
  }

  if (webpackRequire.federation.attachShareScopeMap) {
    webpackRequire.federation.attachShareScopeMap(webpackRequire);
  }

  if (!Array.isArray(shareScopeKey)) {
    // @ts-ignore
    return webpackRequire.I(shareScopeKey || 'default', initScope);
  }

  const proxyInitializeSharing = Boolean(
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
