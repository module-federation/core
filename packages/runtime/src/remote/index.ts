import {
  type ModuleInfo,
  type GlobalModuleInfo,
  isBrowserEnv,
  warn,
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
import { FederationHost, getRemoteModuleAndOptions } from '../core';
import {
  PluginSystem,
  AsyncHook,
  AsyncWaterfallHook,
  SyncHook,
} from '../utils/hooks';
import { assert, getRemoteInfo, getRemoteEntryUniqueKey } from '../utils';
import { DEFAULT_REMOTE_TYPE, DEFAULT_SCOPE } from '../constant';
import { Module, ModuleOptions } from '../module';
import { formatPreloadArgs, preloadAssets } from '../utils/preload';

export class RemoteHandler {
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

  formatRemote(
    origin: FederationHost,
    globalOptions: Options,
    userOptions: UserOptions,
  ) {
    const userRemotes = userOptions.remotes || [];

    return userRemotes.reduce((res, remote) => {
      this.registerRemote(origin, remote, res, { force: false });
      return res;
    }, globalOptions.remotes);
  }

  // eslint-disable-next-line max-lines-per-function
  // eslint-disable-next-line @typescript-eslint/member-ordering
  async loadRemote<T>(
    origin: FederationHost,
    id: string,
    options?: { loadFactory?: boolean; from: 'build' | 'runtime' },
  ): Promise<T | null> {
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
        await getRemoteModuleAndOptions({
          id,
          origin: origin,
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
        origin: origin,
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
        origin: origin,
      });

      if (!failOver) {
        throw error;
      }

      return failOver as T;
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  async preloadRemote(
    origin: FederationHost,
    preloadOptions: Array<PreloadRemoteArgs>,
  ): Promise<void> {
    await this.hooks.lifecycle.beforePreloadRemote.emit({
      preloadOptions,
      options: origin.options,
      origin: origin,
    });

    const preloadOps: PreloadOptions = formatPreloadArgs(
      origin.options.remotes,
      preloadOptions,
    );

    await Promise.all(
      preloadOps.map(async (ops) => {
        const { remote } = ops;
        const remoteInfo = getRemoteInfo(remote);
        const { globalSnapshot, remoteSnapshot } =
          await origin.snapshotHandler.loadRemoteSnapshotInfo(remote);

        const assets = await this.hooks.lifecycle.generatePreloadAssets.emit({
          origin: origin,
          preloadOptions: ops,
          remote,
          remoteInfo,
          globalSnapshot,
          remoteSnapshot,
        });
        if (!assets) {
          return;
        }
        preloadAssets(remoteInfo, origin, assets);
      }),
    );
  }

  registerRemotes(
    origin: FederationHost,
    remotes: Remote[],
    options?: { force?: boolean },
  ): void {
    remotes.forEach((remote) => {
      this.registerRemote(origin, remote, origin.options.remotes, {
        force: options?.force,
      });
    });
  }

  private removeRemote(origin: FederationHost, remote: Remote): void {
    const { name } = remote;
    const remoteIndex = origin.options.remotes.findIndex(
      (item) => item.name === name,
    );
    if (remoteIndex !== -1) {
      origin.options.remotes.splice(remoteIndex, 1);
    }
    const loadedModule = origin.moduleCache.get(remote.name);
    if (loadedModule) {
      const key = loadedModule.remoteInfo
        .entryGlobalName as keyof typeof globalThis;
      if (globalThis[key]) {
        delete globalThis[key];
      }
      const remoteEntryUniqueKey = getRemoteEntryUniqueKey(
        loadedModule.remoteInfo,
      );
      if (globalLoading[remoteEntryUniqueKey]) {
        delete globalLoading[remoteEntryUniqueKey];
      }
      origin.moduleCache.delete(remote.name);
    }
  }

  registerRemote(
    origin: FederationHost,
    remote: Remote,
    targetRemotes: Remote[],
    options?: { force?: boolean },
  ): void {
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
        this.removeRemote(origin, registeredRemote);
        normalizeRemote();
        targetRemotes.push(remote);
      }
      warn(messages.join(' '));
    }
  }
}
