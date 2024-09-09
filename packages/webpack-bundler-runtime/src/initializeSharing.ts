import { FEDERATION_SUPPORTED_TYPES } from './constant';
import { attachShareScopeMap } from './attachShareScopeMap';
import { RemoteEntryExports, InitializeSharingOptions } from './types';

export function initializeSharing({
  shareScopeName,
  webpackRequire,
  initPromises,
  initTokens,
  initScope,
}: InitializeSharingOptions): Promise<boolean> | boolean | void {
  if (!initScope) initScope = [];
  const mfInstance = webpackRequire.federation.instance!;

  // handling circular init calls
  var initToken = initTokens[shareScopeName];
  if (!initToken)
    initToken = initTokens[shareScopeName] = { from: mfInstance.name };
  if (initScope.indexOf(initToken) >= 0) return;
  initScope.push(initToken);

  const promise = initPromises[shareScopeName];
  if (promise) return promise;
  var warn = (msg: string) =>
    typeof console !== 'undefined' && console.warn && console.warn(msg);

  var initExternal = (id: string | number) => {
    var handleError = (err: any) =>
      warn('Initialization of sharing external failed: ' + err);
    try {
      var module = webpackRequire(id);
      if (!module) return;
      var initFn = (module: RemoteEntryExports) =>
        module &&
        module.init &&
        // @ts-ignore compat legacy mf shared behavior
        module.init(webpackRequire.S![shareScopeName], initScope);
      if (module.then) return promises.push(module.then(initFn, handleError));
      var initResult = initFn(module);
      // @ts-ignore
      if (initResult && typeof initResult !== 'boolean' && initResult.then)
        // @ts-ignore
        return promises.push(initResult['catch'](handleError));
    } catch (err) {
      handleError(err);
    }
  };
  const promises = mfInstance.initializeSharing(shareScopeName, {
    strategy: mfInstance.options.shareStrategy,
    initScope,
    from: 'build',
  });
  attachShareScopeMap(webpackRequire);

  const bundlerRuntimeRemotesOptions =
    webpackRequire.federation.bundlerRuntimeOptions.remotes;
  if (bundlerRuntimeRemotesOptions) {
    Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach(
      (moduleId) => {
        const info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
        const externalModuleId =
          bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[moduleId][2];
        if (info.length > 1) {
          initExternal(externalModuleId);
        } else if (info.length === 1) {
          const remoteInfo = info[0];
          if (!FEDERATION_SUPPORTED_TYPES.includes(remoteInfo.externalType)) {
            initExternal(externalModuleId);
          }
        }
      },
    );
  }

  if (!promises.length) {
    return (initPromises[shareScopeName] = true);
  }

  return (initPromises[shareScopeName] = Promise.all(promises).then(
    () => (initPromises[shareScopeName] = true),
  ));
}
