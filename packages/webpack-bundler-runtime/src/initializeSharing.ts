import helpers from '@module-federation/runtime/helpers';
import { FEDERATION_SUPPORTED_TYPES } from './constant';
import { attachShareScopeMap } from './attachShareScopeMap';
import { RemoteEntryExports, InitializeSharingOptions } from './types';

const INIT_WAITS = Symbol.for('mf.initWaits');
// Containers each container's sharing init is waiting on, shared by every container on the page
const pageGlobal = helpers.global.Global as any;
if (!pageGlobal[INIT_WAITS]) pageGlobal[INIT_WAITS] = new Map();
const initWaits: Map<string, Map<string, number>> = pageGlobal[INIT_WAITS];

const waitsOn = (
  from: string,
  to: string,
  seen = new Set<string>(),
): boolean => {
  if (from === to) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  return Array.from(initWaits.get(from)?.keys() || []).some((next) =>
    waitsOn(next, to, seen),
  );
};

const addWait = (caller: string, name: string, promise: Promise<unknown>) => {
  const waits = initWaits.get(caller) || new Map<string, number>();
  initWaits.set(caller, waits);
  waits.set(name, (waits.get(name) || 0) + 1);
  const done = () => {
    const count = (waits.get(name) || 0) - 1;
    if (count > 0) waits.set(name, count);
    else waits.delete(name);
  };
  promise.then(done, done);
};

let initCaller: string | undefined;

// Runs fn with the name of the container whose sharing init is calling into this one
export function withInitCaller<T>(caller: string | undefined, fn: () => T): T {
  const previous = initCaller;
  initCaller = caller;
  try {
    return fn();
  } finally {
    initCaller = previous;
  }
}

export function initializeSharing({
  shareScopeName,
  webpackRequire,
  initPromises,
  initTokens,
  initScope,
}: InitializeSharingOptions): Promise<boolean> | boolean | void {
  const caller = initCaller;
  const shareScopeKeys = Array.isArray(shareScopeName)
    ? shareScopeName
    : [shareScopeName];
  var initializeSharingPromises: Array<Promise<boolean> | boolean | void> = [];
  var _initializeSharing = function (shareScopeKey: string) {
    if (!initScope) initScope = [];
    const mfInstance = webpackRequire.federation.instance!;

    // handling circular init calls
    var initToken = initTokens[shareScopeKey];
    if (!initToken)
      initToken = initTokens[shareScopeKey] = { from: mfInstance.name };
    if (initScope.indexOf(initToken) >= 0) return;
    initScope.push(initToken);

    const promise = initPromises[shareScopeKey];
    if (promise) {
      if (caller && promise !== true) {
        // Waiting would close a cycle when this pending init already waits on the caller
        if (waitsOn(mfInstance.name, caller)) return;
        addWait(caller, mfInstance.name, promise);
      }
      return promise;
    }
    var warn = (msg: string) =>
      typeof console !== 'undefined' && console.warn && console.warn(msg);

    var initExternal = (id: string | number) => {
      var handleError = (err: any) =>
        warn('Initialization of sharing external failed: ' + err);
      try {
        var module = webpackRequire(id);
        if (!module) return;
        var initOptions = {
          shareScopeMap: webpackRequire.S || {},
          shareScopeKeys: shareScopeName,
        };
        Object.defineProperty(initOptions, 'initFrom', {
          value: mfInstance.name,
        });
        var initFn = (module: RemoteEntryExports) =>
          module &&
          module.init &&
          // @ts-ignore compat legacy mf shared behavior
          module.init(webpackRequire.S![shareScopeKey], initScope, initOptions);
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
    const promises = mfInstance.initializeSharing(shareScopeKey, {
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
            bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[
              moduleId
            ][2];
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
      return (initPromises[shareScopeKey] = true);
    }

    const pending = (initPromises[shareScopeKey] = Promise.all(promises).then(
      () => (initPromises[shareScopeKey] = true),
    ));
    if (caller) addWait(caller, mfInstance.name, pending);
    return pending;
  };

  shareScopeKeys.forEach((key) => {
    initializeSharingPromises.push(_initializeSharing(key));
  });
  return Promise.all(initializeSharingPromises).then(() => true);
}
