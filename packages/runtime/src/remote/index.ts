import {
  type ModuleInfo,
  type GlobalModuleInfo,
  isBrowserEnv,
  warn,
  composeKeyWithSeparator,
} from '@module-federation/sdk';
import { globalLoading } from '../global';
import {
  Options,
  UserOptions,
  PreloadAssets,
  PreloadOptions,
  PreloadRemoteArgs,
  Remote,
  RemoteInfo,
} from '../type';
import { FederationHost } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncHook,
} from '../utils/hooks';
import {
  assert,
  getRemoteInfo,
  getRemoteEntryUniqueKey,
  matchRemoteWithNameAndExpose,
} from '../utils';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { Module, ModuleOptions } from '../module';
import { formatPreloadArgs, preloadAssets } from '../utils/preload';
import { getGlobalShareScope } from '../utils/share';

export interface LoadRemoteMatch {
  id: string;
  pkgNameOrAlias: string;
  expose: string;
  remote: Remote;
  options: Options;
  origin: FederationHost;
  remoteInfo: RemoteInfo;
  remoteSnapshot?: ModuleInfo;
}

export class RemoteHandler {
  host: FederationHost;
  hooks = new PluginSystem({
    beforeRequest: new AsyncWaterfallHook<{
      id: string;
      options: Options;
      origin: FederationHost;
    }>('beforeRequest'),
    onLoad: new AsyncHook<
      [
        {
          id: string;
          expose: string;
          pkgNameOrAlias: string;
          remote: Remote;
          options: ModuleOptions;
          origin: FederationHost;
          exposeModule: any;
          exposeModuleFactory: any;
          moduleInstance: Module;
        },
      ],
      void
    >('onLoad'),
    handlePreloadModule: new SyncHook<
      {
        id: string;
        name: string;
        remote: Remote;
        remoteSnapshot: ModuleInfo;
        preloadConfig: PreloadRemoteArgs;
        origin: FederationHost;
      },
      void
    >('handlePreloadModule'),
    errorLoadRemote: new AsyncHook<
      [
        {
          id: string;
          error: unknown;
          options?: any;
          from: 'build' | 'runtime';
          lifecycle: 'onLoad' | 'beforeRequest';
          origin: FederationHost;
        },
      ],
      void | unknown
    >('errorLoadRemote'),
    beforePreloadRemote: new AsyncHook<{
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }>(),
    generatePreloadAssets: new AsyncHook<
      [
        {
          origin: FederationHost;
          preloadOptions: PreloadOptions[number];
          remote: Remote;
          remoteInfo: RemoteInfo;
          remoteSnapshot: ModuleInfo;
          globalSnapshot: GlobalModuleInfo;
        },
      ],
      Promise<PreloadAssets>
    >('generatePreloadAssets'),
    // not used yet
    afterPreloadRemote: new AsyncHook<{
      preloadOps: Array<PreloadRemoteArgs>;
      options: Options;
      origin: FederationHost;
    }>(),
  });

  constructor(host: FederationHost) {
    this.host = host;
  }

  formatAndRegisterRemote(globalOptions: Options, userOptions: UserOptions) {
    const userRemotes = userOptions.remotes || [];

    return userRemotes.reduce((res, remote) => {
      this.registerRemote(remote, res, { force: false });
      return res;
    }, globalOptions.remotes);
  }

  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote<T>(
    id: string,
    options?: { loadFactory?: boolean; from: 'build' | 'runtime' },
  ): Promise<T | null> {
    const { host } = this;
    try {
      const { loadFactory = true } = options || { loadFactory: true };
      // 1. Validate the parameters of the retrieved module. There are two module request methods: pkgName + expose and alias + expose.
      // 2. Request the snapshot information of the current host and globally store the obtained snapshot information. The retrieved module information is partially offline and partially online. The online module information will retrieve the modules used online.
      // 3. Retrieve the detailed information of the current module from global (remoteEntry address, expose resource address)
      // 4. After retrieving remoteEntry, call the init of the module, and then retrieve the exported content of the module through get
      // id: pkgName(@federation/app1) + expose(button) = @federation/app1/button
      // id: alias(app1) + expose(button) = app1/button
      // id: alias(app1/utils) + expose(loadash/sort) = app1/utils/loadash/sort
      const { module, moduleOptions, remoteMatchInfo } =
        await this.getRemoteModuleAndOptions({
          id,
        });
      const { pkgNameOrAlias, remote, expose, id: idRes } = remoteMatchInfo;
      const moduleOrFactory = (await module.get(expose, options)) as T;

      const moduleWrapper = await this.hooks.lifecycle.onLoad.emit({
        id: idRes,
        pkgNameOrAlias,
        expose,
        exposeModule: loadFactory ? moduleOrFactory : undefined,
        exposeModuleFactory: loadFactory ? undefined : moduleOrFactory,
        remote,
        options: moduleOptions,
        moduleInstance: module,
        origin: host,
      });

      if (typeof moduleWrapper === 'function') {
        return moduleWrapper as T;
      }

      return moduleOrFactory;
    } catch (error) {
      const { from = 'runtime' } = options || { from: 'runtime' };

      const failOver = await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        error,
        from,
        lifecycle: 'onLoad',
        origin: host,
      });

      if (!failOver) {
        throw error;
      }

      return failOver as T;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(preloadOptions: Array<PreloadRemoteArgs>): Promise<void> {
    const { host } = this;

    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOptions,
      options: host.options,
      origin: host,
    });

    const preloadOps: PreloadOptions = formatPreloadArgs(
      host.options.remotes,
      preloadOptions,
    );

    await Promise.all(
      preloadOps.map(async (ops) => {
        const { remote } = ops;
        const remoteInfo = getRemoteInfo(remote);
        const { globalSnapshot, remoteSnapshot } =
          await host.snapshotHandler.loadRemoteSnapshotInfo(remote);

        const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
          origin: host,
          preloadOptions: ops,
          remote,
          remoteInfo,
          globalSnapshot,
          remoteSnapshot,
        });
        if (!assets) {
          return;
        }
        preloadAssets(remoteInfo, host, assets);
      }),
    );
  }

  registerRemotes(remotes: Remote[], options?: { force?: boolean }): void {
    const { host } = this;
    remotes.forEach((remote) => {
      this.registerRemote(remote, host.options.remotes, {
        force: options?.force,
      });
    });
  }

  async getRemoteModuleAndOptions(options: { id: string }): Promise<{
    module: Module;
    moduleOptions: ModuleOptions;
    remoteMatchInfo: LoadRemoteMatch;
  }> {
    const { host } = this;
    const { id } = options;
    let loadRemoteArgs;

    try {
      loadRemoteArgs = await this.hooks.lifecycle.beforeRequest.emit({
        id,
        options: host.options,
        origin: host,
      });
    } catch (error) {
      loadRemoteArgs = (await this.hooks.lifecycle.errorLoadRemote.emit({
        id,
        options: host.options,
        origin: host,
        from: 'runtime',
        error,
        lifecycle: 'beforeRequest',
      })) as {
        id: string;
        options: Options;
        origin: FederationHost;
      };

      if (!loadRemoteArgs) {
        throw error;
      }
    }

    const { id: idRes } = loadRemoteArgs;

    const remoteSplitInfo = matchRemoteWithNameAndExpose(
      host.options.remotes,
      idRes,
    );

    assert(
      remoteSplitInfo,
      `
        Unable to locate ${idRes} in ${
          host.options.name
        }. Potential reasons for failure include:\n
        1. ${idRes} was not included in the 'remotes' parameter of ${
          host.options.name || 'the host'
        }.\n
        2. ${idRes} could not be found in the 'remotes' of ${
          host.options.name
        } with either 'name' or 'alias' attributes.
        3. ${idRes} is not online, injected, or loaded.
        4. ${idRes}  cannot be accessed on the expected.
        5. The 'beforeRequest' hook was provided but did not return the correct 'remoteInfo' when attempting to load ${idRes}.
      `,
    );

    const { remote: rawRemote } = remoteSplitInfo;
    const remoteInfo = getRemoteInfo(rawRemote);
    const matchInfo =
      await host.sharedHandler.hooks.lifecycle.afterResolve.emit({
        id: idRes,
        ...remoteSplitInfo,
        options: host.options,
        origin: host,
        remoteInfo,
      });

    const { remote, expose } = matchInfo;
    assert(
      remote && expose,
      `The 'beforeRequest' hook was executed, but it failed to return the correct 'remote' and 'expose' values while loading ${idRes}.`,
    );
    let module: Module | undefined = host.moduleCache.get(remote.name);

    const moduleOptions: ModuleOptions = {
      host: host,
      remoteInfo,
    };

    if (!module) {
      module = new Module(moduleOptions);
      host.moduleCache.set(remote.name, module);
    }
    return {
      module,
      moduleOptions,
      remoteMatchInfo: matchInfo,
    };
  }

  registerRemote(
    remote: Remote,
    targetRemotes: Remote[],
    options?: { force?: boolean },
  ): void {
    const { host } = this;

    const normalizeRemote = () => {
      if (remote.alias) {
        // Validate if alias equals the prefix of remote.name and remote.alias, if so, throw an error
        // As multi-level path references cannot guarantee unique names, alias being a prefix of remote.name is not supported
        const findEqual = targetRemotes.find(
          (item) =>
            remote.alias &&
            (item.name.startsWith(remote.alias) ||
              item.alias?.startsWith(remote.alias)),
        );
        assert(
          !findEqual,
          `The alias ${remote.alias} of remote ${
            remote.name
          } is not allowed to be the prefix of ${
            findEqual && findEqual.name
          } name or alias`,
        );
      }
      // Set the remote entry to a complete path
      if ('entry' in remote) {
        if (isBrowserEnv() && !remote.entry.startsWith('http')) {
          remote.entry = new URL(remote.entry, window.location.origin).href;
        }
      }
      if (!remote.shareScope) {
        remote.shareScope = DEFAULT_SCOPE;
      }
      if (!remote.type) {
        remote.type = DEFAULT_REMOTE_TYPE;
      }
    };
    const registeredRemote = targetRemotes.find(
      (item) => item.name === remote.name,
    );
    if (!registeredRemote) {
      normalizeRemote();
      targetRemotes.push(remote);
    } else {
      const messages = [
        `The remote "${remote.name}" is already registered.`,
        options?.force
          ? 'Hope you have known that OVERRIDE it may have some unexpected errors'
          : 'If you want to merge the remote, you can set "force: true".',
      ];
      if (options?.force) {
        // remove registered remote
        this.removeRemote(registeredRemote);
        normalizeRemote();
        targetRemotes.push(remote);
      }
      warn(messages.join(' '));
    }
  }

  private removeRemote(remote: Remote): void {
    const { host } = this;
    const { name } = remote;
    const remoteIndex = host.options.remotes.findIndex(
      (item) => item.name === name,
    );
    if (remoteIndex !== -1) {
      host.options.remotes.splice(remoteIndex, 1);
    }
    const loadedModule = host.moduleCache.get(remote.name);
    if (loadedModule) {
      const remoteInfo = loadedModule.remoteInfo;
      const key = remoteInfo.entryGlobalName as keyof typeof globalThis;

      if (globalThis[key]) {
        delete globalThis[key];
      }
      const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
        loadedModule.remoteInfo,
      );
      if (globalLoading[remoteEntryUniqueKey]) {
        delete globalLoading[remoteEntryUniqueKey];
      }
      // delete un loaded shared and instance
      let remoteInsId = remoteInfo.buildVersion
        ? composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion)
        : remoteInfo.name;
      const remoteInsIndex = globalThis.__FEDERATION__.__INSTANCES__.findIndex(
        (ins) => {
          if (remoteInfo.buildVersion) {
            return ins.options.id === remoteInsId;
          } else {
            return ins.name === remoteInsId;
          }
        },
      );
      if (remoteInsIndex !== -1) {
        const remoteIns =
          globalThis.__FEDERATION__.__INSTANCES__[remoteInsIndex];
        remoteInsId = remoteIns.options.id || remoteInsId;
        const globalShareScopeMap = getGlobalShareScope();

        let isAllSharedNotUsed = true;
        const needDeleteKeys: Array<[string, string, string, string]> = [];
        Object.keys(globalShareScopeMap).forEach((instId) => {
          Object.keys(globalShareScopeMap[instId]).forEach((shareScope) => {
            Object.keys(globalShareScopeMap[instId][shareScope]).forEach(
              (shareName) => {
                Object.keys(
                  globalShareScopeMap[instId][shareScope][shareName],
                ).forEach((shareVersion) => {
                  const shared =
                    globalShareScopeMap[instId][shareScope][shareName][
                      shareVersion
                    ];
                  if (shared.from === remoteInfo.name) {
                    if (shared.loaded || shared.loading) {
                      shared.useIn = shared.useIn.filter(
                        (usedHostName) => usedHostName !== remoteInfo.name,
                      );
                      if (shared.useIn.length) {
                        isAllSharedNotUsed = false;
                      } else {
                        needDeleteKeys.push([
                          instId,
                          shareScope,
                          shareName,
                          shareVersion,
                        ]);
                      }
                    } else {
                      needDeleteKeys.push([
                        instId,
                        shareScope,
                        shareName,
                        shareVersion,
                      ]);
                    }
                  }
                });
              },
            );
          });
        });

        if (isAllSharedNotUsed) {
          remoteIns.shareScopeMap = {};
          delete globalShareScopeMap[remoteInsId];
        }
        needDeleteKeys.forEach(
          ([insId, shareScope, shareName, shareVersion]) => {
            delete globalShareScopeMap[insId]?.[shareScope]?.[shareName]?.[
              shareVersion
            ];
          },
        );
        globalThis.__FEDERATION__.__INSTANCES__.splice(remoteInsIndex, 1);
      }
      host.moduleCache.delete(remote.name);
    }
  }
}
