import { FEDERATION_SUPPORTED_TYPES } from './constant';
import { attachShareScopeMap } from './attachShareScopeMap';
import {
  RemoteEntryExports,
  InitializeSharingOptions,
  WebpackRequire,
} from './types';

type PeerInit = {
  chain: InitializeSharingOptions['initScope'];
  call: object;
  onStack: boolean;
  ready: Promise<void>;
};

type DispatchState = {
  peers: WeakMap<object, Map<string, PeerInit | null>>;
  pending: Map<string, Set<PeerInit>>;
  orderedPromises: InitializeSharingOptions['initPromises'];
};

const dispatchStates = new WeakMap<WebpackRequire, DispatchState>();

export function initializeSharing({
  shareScopeName,
  webpackRequire,
  initPromises,
  initTokens,
  initScope,
}: InitializeSharingOptions): Promise<boolean> | boolean | void {
  const ordered = Array.isArray(shareScopeName);
  const shareScopeKeys = ordered ? shareScopeName : [shareScopeName];
  var initializeSharingPromises: Array<Promise<boolean> | boolean | void> = [];
  let dispatch: DispatchState | undefined;
  if (webpackRequire.federation.shareScopeDispatch === 'declared') {
    dispatch = dispatchStates.get(webpackRequire);
    if (!dispatch) {
      dispatch = {
        peers: new WeakMap(),
        pending: new Map(),
        orderedPromises: Object.create(null),
      };
      dispatchStates.set(webpackRequire, dispatch);
    }
  }
  // A filtered walk cannot satisfy the legacy walk for the same scalar key.
  const readinessByKey =
    ordered && dispatch ? dispatch.orderedPromises : initPromises;
  // Later keys in this request are not nested calls into the runtime.
  const call = dispatch && {};
  var _initializeSharing = function (shareScopeKey: string) {
    if (!initScope) initScope = [];
    const mfInstance = webpackRequire.federation.instance!;

    // handling circular init calls
    var initToken = initTokens[shareScopeKey];
    if (!initToken)
      initToken = initTokens[shareScopeKey] = { from: mfInstance.name };
    if (initScope.indexOf(initToken) >= 0) return;
    initScope.push(initToken);

    const pending = dispatch?.pending.get(shareScopeKey);
    // The cached promise is for independent callers. Returning it to an owner
    // of one of its running records would make that init wait for itself.
    const revisit =
      pending &&
      Array.from(pending).some(
        (record) =>
          record.onStack ||
          (record.chain === initScope && record.call !== call),
      );
    const promise = readinessByKey[shareScopeKey];
    if (promise) {
      if (revisit) return;
      if (!pending?.size) return promise;
      return Promise.all([
        promise,
        ...Array.from(pending, (r) => r.ready),
      ]).then(() => true);
    }
    var warn = (msg: string) =>
      typeof console !== 'undefined' && console.warn && console.warn(msg);

    var handleError = (err: any) =>
      warn('Initialization of sharing external failed: ' + err);

    const initDeclared = (
      peer: RemoteEntryExports,
      declaredScope: string | string[],
    ) => {
      const { peers, pending } = dispatch!;
      let byContract = peers.get(peer);
      if (!byContract) peers.set(peer, (byContract = new Map()));
      const contract = JSON.stringify(declaredScope);
      const previous = byContract.get(contract);
      if (previous !== undefined) return previous?.ready;

      let resolve!: () => void;
      const record: PeerInit = {
        chain: initScope,
        call: call!,
        onStack: true,
        ready: new Promise<void>((done) => (resolve = done)),
      };
      byContract.set(contract, record);
      const scopes = webpackRequire.S!;
      const keys = Array.isArray(declaredScope)
        ? declaredScope
        : [declaredScope];
      keys.forEach((key) => {
        if (!scopes[key]) scopes[key] = {};
        let records = pending.get(key);
        if (!records) pending.set(key, (records = new Set()));
        records.add(record);
      });
      const finish = () => {
        byContract.set(contract, null);
        keys.forEach((key) => pending.get(key)?.delete(record));
        resolve();
      };
      const fail = (err: unknown) => {
        handleError(err);
        finish();
      };
      try {
        // @ts-ignore compat legacy mf shared behavior
        const result = peer.init(scopes[keys[0]], initScope, {
          shareScopeMap: scopes,
          shareScopeKeys: declaredScope,
        });
        if (result && typeof result.then === 'function') {
          Promise.resolve(result).then(finish, fail);
          return record.ready;
        }
        finish();
      } catch (err) {
        fail(err);
      } finally {
        record.onStack = false;
      }
    };

    var initExternal = (
      id: string | number,
      declaredScope?: string | string[],
    ) => {
      try {
        var module = webpackRequire(id);
        if (!module) return;
        var initFn = (module: RemoteEntryExports) =>
          module &&
          module.init &&
          (declaredScope !== undefined
            ? initDeclared(module, declaredScope)
            : // @ts-ignore compat legacy mf shared behavior
              module.init(webpackRequire.S![shareScopeKey], initScope, {
                shareScopeMap: webpackRequire.S || {},
                shareScopeKeys: shareScopeName,
              }));
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
      ...(dispatch && { context: { shareScopeDispatch: 'declared' } }),
    });
    attachShareScopeMap(webpackRequire);

    const bundlerRuntimeRemotesOptions =
      webpackRequire.federation.bundlerRuntimeOptions.remotes;
    if (bundlerRuntimeRemotesOptions) {
      Object.keys(bundlerRuntimeRemotesOptions.idToRemoteMap).forEach(
        (moduleId) => {
          const info = bundlerRuntimeRemotesOptions.idToRemoteMap[moduleId];
          const [remoteScope, , externalModuleId] =
            bundlerRuntimeRemotesOptions.idToExternalAndNameMapping[moduleId];
          const declaredScope =
            dispatch && (Array.isArray(remoteScope) || ordered)
              ? remoteScope
              : undefined;
          if (
            declaredScope !== undefined &&
            (Array.isArray(declaredScope)
              ? declaredScope.indexOf(shareScopeKey) < 0
              : declaredScope !== shareScopeKey)
          ) {
            return;
          }
          if (info.length > 1) {
            initExternal(externalModuleId, declaredScope);
          } else if (info.length === 1) {
            const remoteInfo = info[0];
            if (!FEDERATION_SUPPORTED_TYPES.includes(remoteInfo.externalType)) {
              initExternal(externalModuleId, declaredScope);
            }
          }
        },
      );
    }

    // Scope readiness includes pending records even when this caller skips them.
    dispatch?.pending.get(shareScopeKey)?.forEach((record) => {
      promises.push(record.ready);
    });
    if (!promises.length) {
      return (readinessByKey[shareScopeKey] = true);
    }

    const readiness = (readinessByKey[shareScopeKey] = Promise.all(
      promises,
    ).then(() => (readinessByKey[shareScopeKey] = true)));
    return revisit ? undefined : readiness;
  };

  shareScopeKeys.forEach((key) => {
    initializeSharingPromises.push(_initializeSharing(key));
  });
  return Promise.all(initializeSharingPromises).then(() => true);
}
