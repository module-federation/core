import {
  RUNTIME_005,
  RUNTIME_006,
  runtimeDescMap,
} from '@module-federation/error-codes';
import { Federation } from '../global';
import {
  Options,
  ShareScopeMap,
  ShareInfos,
  Shared,
  RemoteEntryExports,
  UserOptions,
  ShareStrategy,
  InitScope,
  InitTokens,
  CallFrom,
  TreeShakingArgs,
  LoadShareExtraOptions,
  SharedLoadContext,
  SharedLoadTrigger,
  SharedRegistrationResult,
  SharedSelectionDecision,
  SharedSelectionResult,
} from '../type';
import { ModuleFederation } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncWaterfallHook,
  SyncHook,
} from '../utils/hooks';
import {
  formatShareConfigs,
  getRegisteredShare,
  getTargetSharedOptions,
  getGlobalShareScope,
  directShare,
  shouldUseTreeShaking,
  addUseIn,
  getSharedCandidateInfo,
} from '../utils/share';
import {
  assert,
  error,
  addUniqueItem,
  optionsToMFContext,
  warn,
} from '../utils';
import { DEFAULT_SCOPE } from '../constant';
import type { LoadRemoteMatch } from '../remote';
import { createRemoteEntryInitOptions } from '../module';

export class SharedHandler {
  host: ModuleFederation;
  shareScopeMap: ShareScopeMap;
  hooks = new PluginSystem({
    beforeRegisterShare: new SyncWaterfallHook<{
      pkgName: string;
      shared: Shared;
      origin: ModuleFederation;
    }>('beforeRegisterShare'),
    afterRegisterShare: new SyncHook<
      [
        {
          pkgName: string;
          registration: SharedRegistrationResult;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterRegisterShare'),
    afterResolve: new AsyncWaterfallHook<LoadRemoteMatch>('afterResolve'),
    beforeLoadShare: new AsyncWaterfallHook<{
      pkgName: string;
      shareInfo?: Shared;
      shared: Options['shared'];
      origin: ModuleFederation;
      loadContext: SharedSelectionResult['context'];
    }>('beforeLoadShare'),
    // not used yet
    loadShare: new AsyncHook<[ModuleFederation, string, ShareInfos]>(),
    afterLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          selectedShared?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          selectionResult?: SharedSelectionResult;
          origin: ModuleFederation;
        },
      ],
      void
    >('afterLoadShare'),
    errorLoadShare: new SyncHook<
      [
        {
          pkgName: string;
          shareInfo?: Partial<Shared>;
          shared: Options['shared'];
          shareScopeMap: ShareScopeMap;
          lifecycle: 'loadShare' | 'loadShareSync';
          origin: ModuleFederation;
          error?: unknown;
          recovered?: boolean;
          selectionResult?: SharedSelectionResult;
        },
      ],
      void
    >('errorLoadShare'),
    resolveShare: new SyncWaterfallHook<{
      shareScopeMap: ShareScopeMap;
      scope: string;
      pkgName: string;
      version: string;
      shareInfo: Shared;
      GlobalFederation: Federation;
      resolver: () => { shared: Shared; useTreesShaking: boolean } | undefined;
    }>('resolveShare'),
    // maybe will change, temporarily for internal use only
    initContainerShareScopeMap: new SyncWaterfallHook<{
      shareScope: ShareScopeMap[string];
      options: Options;
      origin: ModuleFederation;
      scopeName: string;
      hostShareScopeMap?: ShareScopeMap;
    }>('initContainerShareScopeMap'),
  });
  initTokens: InitTokens;
  private operationCounter = 0;
  private registrationCounter = 0;
  constructor(host: ModuleFederation) {
    this.host = host;
    this.shareScopeMap = {};
    this.initTokens = {};
    this._setGlobalShareScopeMap(host.options);
  }

  private createLoadContext(
    lifecycle: 'loadShare' | 'loadShareSync',
    extraOptions?: LoadShareExtraOptions,
  ): SharedSelectionResult['context'] {
    this.operationCounter += 1;
    const context = extraOptions?.context || {};
    return {
      ...context,
      operationId:
        context.operationId || `${lifecycle}-${this.operationCounter}`,
      trigger: context.trigger || extraOptions?.from || 'runtime',
    };
  }

  private createSelectionResult(
    decision: SharedSelectionDecision,
    loadType: SharedSelectionResult['loadType'],
    context: SharedSelectionResult['context'],
    overrides: Partial<SharedSelectionDecision> = {},
  ): SharedSelectionResult {
    return {
      ...decision,
      ...overrides,
      loadType,
      context,
    };
  }

  private createSelectionDecision(
    pkgName: string,
    shareInfo: Partial<Shared> | undefined,
    reason: SharedSelectionDecision['reason'],
  ): SharedSelectionDecision {
    const scopes = shareInfo?.scope?.length ? shareInfo.scope : [DEFAULT_SCOPE];
    const candidates = scopes.flatMap((scope) =>
      Object.entries(this.shareScopeMap[scope]?.[pkgName] || {}).map(
        ([version, shared]) =>
          getSharedCandidateInfo(
            scope,
            version,
            shared,
            shareInfo?.shareConfig?.requiredVersion,
          ),
      ),
    );
    return {
      scope: scopes[0],
      requestedVersion: shareInfo?.version,
      requiredVersion: shareInfo?.shareConfig?.requiredVersion,
      singleton: Boolean(shareInfo?.shareConfig?.singleton),
      strictVersion: Boolean(shareInfo?.shareConfig?.strictVersion),
      eager: Boolean(shareInfo?.shareConfig?.eager),
      strategy: shareInfo?.strategy || 'version-first',
      candidates,
      reason,
      failureReason: reason,
    };
  }

  private emitAfterRegisterShare(
    pkgName: string,
    registration: Omit<SharedRegistrationResult, 'registrationId'>,
  ): void {
    this.registrationCounter += 1;
    try {
      this.hooks.lifecycle.afterRegisterShare.emit({
        pkgName,
        registration: {
          ...registration,
          registrationId: `shared-register-${this.registrationCounter}`,
        },
        origin: this.host,
      });
    } catch (hookError) {
      warn(hookError);
    }
  }

  private emitAfterLoadShare({
    lifecycle,
    pkgName,
    shareInfo,
    selectedShared,
    selectionResult,
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    selectedShared?: Partial<Shared>;
    selectionResult?: SharedSelectionResult;
  }): void {
    try {
      this.hooks.lifecycle.afterLoadShare.emit({
        pkgName,
        shareInfo,
        selectedShared,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        selectionResult,
        origin: this.host,
      });
    } catch (error) {
      warn(error);
    }
  }

  private emitErrorLoadShare({
    lifecycle,
    pkgName,
    shareInfo,
    error,
    recovered,
    selectionResult,
  }: {
    lifecycle: 'loadShare' | 'loadShareSync';
    pkgName: string;
    shareInfo?: Partial<Shared>;
    error?: unknown;
    recovered?: boolean;
    selectionResult?: SharedSelectionResult;
  }): void {
    try {
      this.hooks.lifecycle.errorLoadShare.emit({
        pkgName,
        shareInfo,
        shared: this.host.options.shared,
        shareScopeMap: this.shareScopeMap,
        lifecycle,
        origin: this.host,
        error,
        recovered,
        selectionResult,
      });
    } catch (hookError) {
      warn(hookError);
    }
  }

  // register shared in shareScopeMap
  registerShared(globalOptions: Options, userOptions: UserOptions) {
    const { newShareInfos, allShareInfos } = formatShareConfigs(
      globalOptions,
      userOptions,
    );

    const sharedKeys = Object.keys(newShareInfos);
    sharedKeys.forEach((sharedKey) => {
      const sharedVals = newShareInfos[sharedKey];
      sharedVals.forEach((sharedVal) => {
        sharedVal.scope.forEach((sc) => {
          this.hooks.lifecycle.beforeRegisterShare.emit({
            origin: this.host,
            pkgName: sharedKey,
            shared: sharedVal,
          });
          const registeredShared = this.shareScopeMap[sc]?.[sharedKey];
          const previousAtVersion = registeredShared?.[sharedVal.version];
          let action: SharedRegistrationResult['action'];
          let reason: string;
          if (!registeredShared) {
            this.setShared({
              pkgName: sharedKey,
              lib: sharedVal.lib,
              get: sharedVal.get,
              loaded: sharedVal.loaded || Boolean(sharedVal.lib),
              shared: sharedVal,
              from: userOptions.name,
            });
            action = 'registered';
            reason = 'first-registration';
          } else if (
            previousAtVersion === sharedVal ||
            previousAtVersion?.from === sharedVal.from
          ) {
            action = 'reused';
            reason = 'same-version-same-provider';
          } else {
            action = 'ignored';
            reason = previousAtVersion
              ? 'existing-version-preserved'
              : 'scope-already-registered';
          }

          const candidates = Object.entries(
            this.shareScopeMap[sc]?.[sharedKey] || {},
          ).map(([version, shared]) =>
            getSharedCandidateInfo(
              sc,
              version,
              shared,
              sharedVal.shareConfig?.requiredVersion,
            ),
          );
          const effectiveShared =
            this.shareScopeMap[sc]?.[sharedKey]?.[sharedVal.version] ||
            Object.values(this.shareScopeMap[sc]?.[sharedKey] || {})[0];
          this.emitAfterRegisterShare(sharedKey, {
            scope: sc,
            trigger: 'runtime',
            candidate: getSharedCandidateInfo(
              sc,
              sharedVal.version,
              sharedVal,
              sharedVal.shareConfig?.requiredVersion,
            ),
            candidates,
            action,
            effective: effectiveShared
              ? getSharedCandidateInfo(
                  sc,
                  effectiveShared.version,
                  effectiveShared,
                  sharedVal.shareConfig?.requiredVersion,
                )
              : undefined,
            reason,
          });
        });
      });
    });

    return {
      newShareInfos,
      allShareInfos,
    };
  }

  async loadShare<T>(
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): Promise<false | (() => T | undefined)> {
    const { host } = this;
    const loadContext = this.createLoadContext('loadShare', extraOptions);
    // This function performs the following steps:
    // 1. Checks if the currently loaded share already exists, if not, it throws an error
    // 2. Searches globally for a matching share, if found, it uses it directly
    // 3. If not found, it retrieves it from the current share and stores the obtained share globally.

    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });
    let shareOptionsRes: Shared | undefined = shareOptions;
    let selectionDecision: SharedSelectionDecision | undefined;

    try {
      if (shareOptions?.scope) {
        await Promise.all(
          shareOptions.scope.map(async (shareScope) => {
            await Promise.all(
              this.initializeSharing(shareScope, {
                strategy: shareOptions.strategy,
                from: extraOptions?.from,
                context: loadContext,
              }),
            );
            return;
          }),
        );
      }
      const loadShareRes = await this.hooks.lifecycle.beforeLoadShare.emit({
        pkgName,
        shareInfo: shareOptions,
        shared: host.options.shared,
        origin: host,
        loadContext,
      });

      shareOptionsRes = loadShareRes.shareInfo;

      // Assert that shareInfoRes exists, if not, throw an error
      assert(
        shareOptionsRes,
        `Cannot find shared "${pkgName}" in host "${host.options.name}". Ensure the shared config for "${pkgName}" is declared in the federation plugin options and the host has been initialized before loading shares.`,
      );
      const resolvedShareOptions = shareOptionsRes;

      const { shared: registeredShared, useTreesShaking } =
        getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareOptionsRes,
          this.hooks.lifecycle.resolveShare,
          (decision) => {
            selectionDecision = decision;
          },
        ) || {};

      if (selectionDecision && extraOptions?.resolver && registeredShared) {
        selectionDecision = {
          ...selectionDecision,
          reason: 'custom-resolver',
          failureReason: undefined,
        };
      }

      const registeredSelectionResult = registeredShared
        ? this.createSelectionResult(
            selectionDecision ||
              this.createSelectionDecision(
                pkgName,
                resolvedShareOptions,
                'exact-match',
              ),
            'async',
            loadContext,
            {
              selected:
                selectionDecision?.selected ||
                getSharedCandidateInfo(
                  selectionDecision?.scope ||
                    resolvedShareOptions.scope?.[0] ||
                    DEFAULT_SCOPE,
                  registeredShared.version,
                  registeredShared,
                  resolvedShareOptions.shareConfig?.requiredVersion,
                ),
              failureReason: undefined,
            },
          )
        : undefined;

      if (registeredShared) {
        const targetShared = directShare(registeredShared, useTreesShaking);
        if (targetShared.lib) {
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            selectionResult: registeredSelectionResult,
          });
          return targetShared.lib as () => T;
        } else if (targetShared.loading && !targetShared.loaded) {
          const factory = await targetShared.loading;
          targetShared.loaded = true;
          if (!targetShared.lib) {
            targetShared.lib = factory;
          }
          addUseIn(targetShared, host.options.name);
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            selectionResult: registeredSelectionResult,
          });
          return factory;
        } else {
          const asyncLoadProcess = async () => {
            const factory = await targetShared.get!();
            addUseIn(targetShared, host.options.name);
            targetShared.loaded = true;
            targetShared.lib = factory;
            return factory as () => T;
          };
          const loading = asyncLoadProcess();
          this.setShared({
            pkgName,
            loaded: false,
            shared: registeredShared,
            from: host.options.name,
            lib: null,
            loading,
            treeShaking: useTreesShaking
              ? (targetShared as TreeShakingArgs)
              : undefined,
          });
          const factory = await loading;
          this.emitAfterLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            selectedShared: registeredShared,
            selectionResult: registeredSelectionResult,
          });
          return factory;
        }
      } else {
        if (extraOptions?.customShareInfo) {
          this.emitErrorLoadShare({
            lifecycle: 'loadShare',
            pkgName,
            shareInfo: resolvedShareOptions,
            recovered: true,
            selectionResult: this.createSelectionResult(
              selectionDecision ||
                this.createSelectionDecision(
                  pkgName,
                  resolvedShareOptions,
                  'version-mismatch',
                ),
              'async',
              loadContext,
              { recovered: true },
            ),
          });
          return false;
        }
        const _useTreeShaking = shouldUseTreeShaking(
          resolvedShareOptions.treeShaking,
        );
        const targetShared = directShare(resolvedShareOptions, _useTreeShaking);

        const asyncLoadProcess = async () => {
          const factory = await targetShared.get!();
          targetShared.lib = factory;
          targetShared.loaded = true;
          addUseIn(targetShared, host.options.name);
          const { shared: gShared, useTreesShaking: gUseTreeShaking } =
            getRegisteredShare(
              this.shareScopeMap,
              pkgName,
              resolvedShareOptions,
              this.hooks.lifecycle.resolveShare,
            ) || {};
          if (gShared) {
            const targetGShared = directShare(gShared, gUseTreeShaking);
            targetGShared.lib = factory;
            targetGShared.loaded = true;
            gShared.from = resolvedShareOptions.from;
          }
          return factory as () => T;
        };
        const loading = asyncLoadProcess();
        this.setShared({
          pkgName,
          loaded: false,
          shared: resolvedShareOptions,
          from: host.options.name,
          lib: null,
          loading,
          treeShaking: _useTreeShaking
            ? (targetShared as TreeShakingArgs)
            : undefined,
        });
        const factory = await loading;
        this.emitAfterLoadShare({
          lifecycle: 'loadShare',
          pkgName,
          shareInfo: resolvedShareOptions,
          selectedShared: resolvedShareOptions,
          selectionResult: this.createSelectionResult(
            selectionDecision ||
              this.createSelectionDecision(
                pkgName,
                resolvedShareOptions,
                'local-fallback',
              ),
            'async',
            loadContext,
            {
              reason: 'local-fallback',
              failureReason: undefined,
              fallback: true,
              selected: getSharedCandidateInfo(
                resolvedShareOptions.scope?.[0] || DEFAULT_SCOPE,
                resolvedShareOptions.version,
                resolvedShareOptions,
                resolvedShareOptions.shareConfig?.requiredVersion,
              ),
            },
          ),
        });
        return factory;
      }
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: 'loadShare',
        pkgName,
        shareInfo: shareOptionsRes,
        error: shareError,
        selectionResult: this.createSelectionResult(
          selectionDecision ||
            this.createSelectionDecision(
              pkgName,
              shareOptionsRes,
              shareOptionsRes ? 'load-error' : 'missing-config',
            ),
          'async',
          loadContext,
          {
            failureReason:
              selectionDecision?.failureReason ||
              (shareOptionsRes ? 'load-error' : 'missing-config'),
          },
        ),
      });
      throw shareError;
    }
  }

  /**
   * This function initializes the sharing sequence (executed only once per share scope).
   * It accepts one argument, the name of the share scope.
   * If the share scope does not exist, it creates one.
   */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  initializeSharing(
    shareScopeName = DEFAULT_SCOPE,
    extraOptions?: {
      initScope?: InitScope;
      from?: CallFrom;
      strategy?: ShareStrategy;
      context?: SharedLoadContext;
    },
  ): Array<Promise<void>> {
    const { host } = this;
    const from = extraOptions?.from;
    const strategy = extraOptions?.strategy;
    const trigger: SharedLoadTrigger =
      extraOptions?.context?.trigger || from || 'runtime';
    let initScope = extraOptions?.initScope;
    const promises: Promise<any>[] = [];
    if (from !== 'build') {
      const { initTokens } = this;
      if (!initScope) initScope = [];
      let initToken = initTokens[shareScopeName];
      if (!initToken)
        initToken = initTokens[shareScopeName] = { from: this.host.name };
      if (initScope.indexOf(initToken) >= 0) return promises;
      initScope.push(initToken);
    }

    const shareScope = this.shareScopeMap;
    const hostName = host.options.name;
    // Creates a new share scope if necessary
    if (!shareScope[shareScopeName]) {
      shareScope[shareScopeName] = {};
    }
    // Executes all initialization snippets from all accessible modules
    const scope = shareScope[shareScopeName];
    const register = (name: string, shared: Shared) => {
      const { version, eager } = shared;
      scope[name] = scope[name] || {};
      const versions = scope[name];
      const existingShared = versions[version];
      const activeVersion: Shared =
        existingShared && (directShare(existingShared) as Shared);
      const activeVersionEager = Boolean(
        activeVersion &&
        (('eager' in activeVersion && activeVersion.eager) ||
          ('shareConfig' in activeVersion && activeVersion.shareConfig?.eager)),
      );
      const shouldReplace = Boolean(
        !activeVersion ||
        (activeVersion.strategy !== 'loaded-first' &&
          !activeVersion.loaded &&
          (Boolean(!eager) !== !activeVersionEager
            ? eager
            : hostName > versions[version].from)),
      );
      let action: SharedRegistrationResult['action'];
      let reason: string;
      if (existingShared === shared) {
        action = 'reused';
        reason = 'same-registration-reused';
      } else if (shouldReplace) {
        versions[version] = shared;
        action = activeVersion ? 'replaced' : 'registered';
        reason = !activeVersion
          ? 'first-registration'
          : eager && !activeVersionEager
            ? 'eager-preferred'
            : 'provider-name-preferred';
      } else {
        action = 'ignored';
        reason =
          activeVersion.strategy === 'loaded-first'
            ? 'loaded-first-preserved'
            : activeVersion.loaded
              ? 'loaded-version-preserved'
              : activeVersionEager && !eager
                ? 'eager-provider-preserved'
                : 'provider-name-preserved';
      }

      const candidate = getSharedCandidateInfo(
        shareScopeName,
        version,
        shared,
        shared.shareConfig?.requiredVersion,
      );
      const effectiveShared = versions[version];
      this.emitAfterRegisterShare(name, {
        scope: shareScopeName,
        trigger,
        candidate,
        candidates: Object.entries(versions).map(
          ([candidateVersion, candidateShared]) =>
            getSharedCandidateInfo(
              shareScopeName,
              candidateVersion,
              candidateShared,
              shared.shareConfig?.requiredVersion,
            ),
        ),
        action,
        effective: effectiveShared
          ? getSharedCandidateInfo(
              shareScopeName,
              effectiveShared.version,
              effectiveShared,
              shared.shareConfig?.requiredVersion,
            )
          : undefined,
        reason,
      });
    };

    const initRemoteModule = async (key: string): Promise<void> => {
      const { module } = await host.remoteHandler.getRemoteModuleAndOptions({
        id: key,
      });
      let remoteEntryExports: RemoteEntryExports | undefined = undefined;
      try {
        remoteEntryExports = await module.getEntry();
      } catch (error) {
        remoteEntryExports =
          (await host.remoteHandler.hooks.lifecycle.errorLoadRemote.emit({
            id: key,
            error,
            from: 'runtime',
            lifecycle: 'beforeLoadShare',
            remote: module.remoteInfo,
            origin: host,
          })) as RemoteEntryExports;
        if (!remoteEntryExports) {
          return;
        }
      } finally {
        // prevent self load loop: when host load self , the initTokens is not the same
        if (remoteEntryExports?.init && !module.initing) {
          module.remoteEntryExports = remoteEntryExports;
          await module.init(undefined, undefined, initScope);
        }
      }
    };
    Object.keys(host.options.shared).forEach((shareName) => {
      const sharedArr = host.options.shared[shareName];
      sharedArr.forEach((shared) => {
        if (shared.scope.includes(shareScopeName)) {
          register(shareName, shared);
        }
      });
    });
    // TODO: strategy==='version-first' need to be removed in the future
    if (
      host.options.shareStrategy === 'version-first' ||
      strategy === 'version-first'
    ) {
      host.options.remotes.forEach((remote) => {
        if (remote.shareScope === shareScopeName) {
          promises.push(initRemoteModule(remote.name));
        }
      });
    }

    return promises;
  }

  // The lib function will only be available if the shared set by eager or runtime init is set or the shared is successfully loaded.
  // 1. If the loaded shared already exists globally, then it will be reused
  // 2. If lib exists in local shared, it will be used directly
  // 3. If the local get returns something other than Promise, then it will be used directly
  loadShareSync<T>(
    pkgName: string,
    extraOptions?: LoadShareExtraOptions,
  ): () => T | never {
    const { host } = this;
    const loadContext = this.createLoadContext('loadShareSync', extraOptions);
    let selectionDecision: SharedSelectionDecision | undefined;
    const shareOptions = getTargetSharedOptions({
      pkgName,
      extraOptions,
      shareInfos: host.options.shared,
    });

    try {
      if (shareOptions?.scope) {
        shareOptions.scope.forEach((shareScope) => {
          this.initializeSharing(shareScope, {
            strategy: shareOptions.strategy,
            from: extraOptions?.from,
            context: loadContext,
          });
        });
      }
      const { shared: registeredShared } =
        getRegisteredShare(
          this.shareScopeMap,
          pkgName,
          shareOptions,
          this.hooks.lifecycle.resolveShare,
          (decision) => {
            selectionDecision = decision;
          },
        ) || {};

      if (selectionDecision && extraOptions?.resolver && registeredShared) {
        selectionDecision = {
          ...selectionDecision,
          reason: 'custom-resolver',
          failureReason: undefined,
        };
      }

      const registeredSelectionResult = registeredShared
        ? this.createSelectionResult(
            selectionDecision ||
              this.createSelectionDecision(
                pkgName,
                shareOptions,
                'exact-match',
              ),
            'sync',
            loadContext,
            {
              selected:
                selectionDecision?.selected ||
                getSharedCandidateInfo(
                  selectionDecision?.scope ||
                    shareOptions.scope?.[0] ||
                    DEFAULT_SCOPE,
                  registeredShared.version,
                  registeredShared,
                  shareOptions.shareConfig?.requiredVersion,
                ),
              failureReason: undefined,
            },
          )
        : undefined;

      if (registeredShared) {
        if (typeof registeredShared.lib === 'function') {
          addUseIn(registeredShared, host.options.name);
          if (!registeredShared.loaded) {
            registeredShared.loaded = true;
            if (registeredShared.from === host.options.name) {
              shareOptions.loaded = true;
            }
          }
          this.emitAfterLoadShare({
            lifecycle: 'loadShareSync',
            pkgName,
            shareInfo: shareOptions,
            selectedShared: registeredShared,
            selectionResult: registeredSelectionResult,
          });
          return registeredShared.lib as () => T;
        }
        if (typeof registeredShared.get === 'function') {
          const module = registeredShared.get();
          if (!(module instanceof Promise)) {
            addUseIn(registeredShared, host.options.name);
            this.setShared({
              pkgName,
              loaded: true,
              from: host.options.name,
              lib: module,
              shared: registeredShared,
            });
            this.emitAfterLoadShare({
              lifecycle: 'loadShareSync',
              pkgName,
              shareInfo: shareOptions,
              selectedShared: registeredShared,
              selectionResult: registeredSelectionResult,
            });
            return module;
          }
        }
      }

      if (shareOptions.lib) {
        if (!shareOptions.loaded) {
          shareOptions.loaded = true;
        }
        this.emitAfterLoadShare({
          lifecycle: 'loadShareSync',
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          selectionResult: this.createSelectionResult(
            selectionDecision ||
              this.createSelectionDecision(
                pkgName,
                shareOptions,
                'local-fallback',
              ),
            'sync',
            loadContext,
            {
              reason: 'local-fallback',
              failureReason: undefined,
              fallback: true,
              selected: getSharedCandidateInfo(
                shareOptions.scope?.[0] || DEFAULT_SCOPE,
                shareOptions.version,
                shareOptions,
                shareOptions.shareConfig?.requiredVersion,
              ),
            },
          ),
        });
        return shareOptions.lib as () => T;
      }

      if (shareOptions.get) {
        const module = shareOptions.get();

        if (module instanceof Promise) {
          const errorCode =
            extraOptions?.from === 'build' ? RUNTIME_005 : RUNTIME_006;
          error(
            errorCode,
            runtimeDescMap,
            {
              hostName: host.options.name,
              sharedPkgName: pkgName,
            },
            undefined,
            optionsToMFContext(host.options),
          );
        }

        shareOptions.lib = module;

        this.setShared({
          pkgName,
          loaded: true,
          from: host.options.name,
          lib: shareOptions.lib,
          shared: shareOptions,
        });
        this.emitAfterLoadShare({
          lifecycle: 'loadShareSync',
          pkgName,
          shareInfo: shareOptions,
          selectedShared: shareOptions,
          selectionResult: this.createSelectionResult(
            selectionDecision ||
              this.createSelectionDecision(
                pkgName,
                shareOptions,
                'local-fallback',
              ),
            'sync',
            loadContext,
            {
              reason: 'local-fallback',
              failureReason: undefined,
              fallback: true,
              selected: getSharedCandidateInfo(
                shareOptions.scope?.[0] || DEFAULT_SCOPE,
                shareOptions.version,
                shareOptions,
                shareOptions.shareConfig?.requiredVersion,
              ),
            },
          ),
        });
        return shareOptions.lib as () => T;
      }

      error(
        RUNTIME_006,
        runtimeDescMap,
        {
          hostName: host.options.name,
          sharedPkgName: pkgName,
        },
        undefined,
        optionsToMFContext(host.options),
      );
    } catch (shareError) {
      this.emitErrorLoadShare({
        lifecycle: 'loadShareSync',
        pkgName,
        shareInfo: shareOptions,
        error: shareError,
        selectionResult: this.createSelectionResult(
          selectionDecision ||
            this.createSelectionDecision(pkgName, shareOptions, 'load-error'),
          'sync',
          loadContext,
          {
            failureReason: selectionDecision?.failureReason || 'load-error',
          },
        ),
      });
      throw shareError;
    }
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
    extraOptions: { hostShareScopeMap?: ShareScopeMap } = {},
  ): void {
    const { host } = this;
    const previousScope = this.shareScopeMap[scopeName];
    this.shareScopeMap[scopeName] = shareScope;
    Object.entries(shareScope).forEach(([pkgName, versions]) => {
      Object.entries(versions).forEach(([version, shared]) => {
        const previousShared = previousScope?.[pkgName]?.[version];
        const action: SharedRegistrationResult['action'] = !previousShared
          ? 'registered'
          : previousShared === shared
            ? 'reused'
            : 'replaced';
        this.emitAfterRegisterShare(pkgName, {
          scope: scopeName,
          trigger: 'container-init',
          candidate: getSharedCandidateInfo(
            scopeName,
            version,
            shared,
            shared.shareConfig?.requiredVersion,
          ),
          candidates: Object.entries(versions).map(
            ([candidateVersion, candidateShared]) =>
              getSharedCandidateInfo(
                scopeName,
                candidateVersion,
                candidateShared,
                shared.shareConfig?.requiredVersion,
              ),
          ),
          action,
          effective: getSharedCandidateInfo(
            scopeName,
            version,
            shared,
            shared.shareConfig?.requiredVersion,
          ),
          reason:
            action === 'registered'
              ? 'container-share-registered'
              : action === 'reused'
                ? 'container-share-reused'
                : 'container-share-replaced',
        });
      });
    });
    this.hooks.lifecycle.initContainerShareScopeMap.emit({
      shareScope,
      options: host.options,
      origin: host,
      scopeName,
      hostShareScopeMap: extraOptions.hostShareScopeMap,
    });
  }

  private setShared({
    pkgName,
    shared,
    from,
    lib,
    loading,
    loaded,
    get,
    treeShaking,
  }: {
    pkgName: string;
    shared: Shared;
    from: string;
    lib: any;
    loaded?: boolean;
    loading?: Shared['loading'];
    get?: Shared['get'];
    treeShaking?: TreeShakingArgs;
  }): void {
    const { version, scope = 'default', ...shareInfo } = shared;
    const scopes: string[] = Array.isArray(scope) ? scope : [scope];

    const mergeAttrs = (shared: Shared) => {
      const merge = <K extends keyof TreeShakingArgs>(
        s: TreeShakingArgs,
        key: K,
        val: TreeShakingArgs[K],
      ): void => {
        if (val && !s[key]) {
          s[key] = val;
        }
      };
      const targetShared = (
        treeShaking ? shared.treeShaking! : shared
      ) as TreeShakingArgs;
      merge(targetShared, 'loaded', loaded);
      merge(targetShared, 'loading', loading);
      merge(targetShared, 'get', get);
    };
    scopes.forEach((sc) => {
      if (!this.shareScopeMap[sc]) {
        this.shareScopeMap[sc] = {};
      }
      if (!this.shareScopeMap[sc][pkgName]) {
        this.shareScopeMap[sc][pkgName] = {};
      }

      if (!this.shareScopeMap[sc][pkgName][version]) {
        this.shareScopeMap[sc][pkgName][version] = {
          version,
          scope: [sc],
          ...shareInfo,
          lib,
        };
      }

      const registeredShared = this.shareScopeMap[sc][pkgName][version];
      mergeAttrs(registeredShared);
      if (from && registeredShared.from !== from) {
        registeredShared.from = from;
      }
    });
  }

  private _setGlobalShareScopeMap(hostOptions: Options): void {
    const globalShareScopeMap = getGlobalShareScope();
    const identifier = hostOptions.id || hostOptions.name;
    if (identifier && !globalShareScopeMap[identifier]) {
      globalShareScopeMap[identifier] = this.shareScopeMap;
    }
  }
}
