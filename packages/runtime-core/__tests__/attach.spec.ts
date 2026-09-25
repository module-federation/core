import { describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { shared } from '../src/shared/capability';
import { remote } from '../src/remote/capability';
import { snapshot } from '../src/plugins/snapshot/capability';
import { web } from '../src/platform/web';
import { SharedHandler } from '../src/shared';
import { RemoteHandler } from '../src/remote';
import { SnapshotHandler } from '../src/plugins/snapshot/SnapshotHandler';

const REMOTE_SUBPATH = '@module-federation/runtime-core/remote';
const pluginNames = (mf: ModuleFederation) =>
  mf.options.plugins.map((p) => p.name);

describe('ModuleFederation.attach', () => {
  it('(b) attaching the same capability twice keeps the first handler and registers snapshot plugins once', () => {
    const mf = new ModuleFederation({ name: 'attach-twice' }, {});
    mf.attach({ shared, remote, snapshot, platform: web });
    const handlers = [mf.sharedHandler, mf.remoteHandler, mf.snapshotHandler];
    mf.attach({ shared, remote, snapshot, platform: web });

    expect(mf.sharedHandler).toBe(handlers[0]);
    expect(mf.remoteHandler).toBe(handlers[1]);
    expect(mf.snapshotHandler).toBe(handlers[2]);
    expect(mf.sharedHandler).toBeInstanceOf(SharedHandler);
    expect(pluginNames(mf)).toEqual([
      'snapshot-plugin',
      'generate-preload-assets-plugin',
    ]);
  });

  it('(c) attach never downgrades or replaces an enabled slot', () => {
    const mf = new ModuleFederation(
      { name: 'attach-no-downgrade' },
      { shared, remote, snapshot, platform: web },
    );
    const sharedHandler = mf.sharedHandler;
    const remoteHandler = mf.remoteHandler;
    const explode = {
      create: () => {
        throw new Error('enabled slot was replaced');
      },
    };

    mf.attach({});
    mf.attach({ shared: undefined, remote: undefined, platform: undefined });
    mf.attach({ shared: { ...shared, ...explode }, remote: explode } as any);

    expect(mf.sharedHandler).toBe(sharedHandler);
    expect(mf.remoteHandler).toBe(remoteHandler);
    expect(mf.sharedHandler).toBeInstanceOf(SharedHandler);
    expect(mf.remoteHandler).toBeInstanceOf(RemoteHandler);
    expect(mf.platform).toBe(web);
  });

  it('(c) shareScopeMap and idToRemoteMap keep their identity across attach', () => {
    const mf = new ModuleFederation({ name: 'attach-state' }, {});
    const scope = { react: {} } as any;
    mf.initShareScopeMap('default', scope);
    const shareScopeMap = mf.shareScopeMap;
    const idToRemoteMap = mf.remoteHandler.idToRemoteMap;

    mf.attach({ shared, remote, platform: web });

    expect(mf.shareScopeMap).toBe(shareScopeMap);
    expect(mf.sharedHandler.shareScopeMap).toBe(shareScopeMap);
    expect(mf.shareScopeMap.default).toBe(scope);
    expect(mf.remoteHandler.idToRemoteMap).toBe(idToRemoteMap);
  });

  it('(d) registerRemotes and loadRemote on an instance without remote throw the named error', async () => {
    const mf = new ModuleFederation({ name: 'no-remote' }, { shared });

    expect(() =>
      mf.registerRemotes([
        { name: 'late', entry: 'http://localhost:1111/late.js' },
      ]),
    ).toThrow(REMOTE_SUBPATH);
    await expect(mf.loadRemote('late/Button')).rejects.toThrow(REMOTE_SUBPATH);
  });

  it('(e) a plugin that injects remotes in beforeInit fails construction and init without the remote capability', () => {
    const injectRemotes = {
      name: 'inject-remotes',
      beforeInit(args: any) {
        return {
          ...args,
          userOptions: {
            ...args.userOptions,
            remotes: [{ name: 'late', entry: 'http://localhost:1111/late.js' }],
          },
        };
      },
    };

    expect(
      () =>
        new ModuleFederation(
          { name: 'inject-at-construction', plugins: [injectRemotes] },
          { shared },
        ),
    ).toThrow(REMOTE_SUBPATH);

    const existing = new ModuleFederation(
      { name: 'inject-at-init' },
      { shared },
    );
    expect(() =>
      existing.initOptions({
        name: 'inject-at-init',
        plugins: [injectRemotes],
      }),
    ).toThrow(REMOTE_SUBPATH);

    const withRemote = new ModuleFederation(
      { name: 'inject-with-remote', plugins: [injectRemotes] },
      { shared, remote, platform: web },
    );
    expect(withRemote.options.remotes.map((r) => r.name)).toEqual(['late']);
  });

  it('(f) remote arriving through attach registers the snapshot plugins and their listeners run', async () => {
    const userPlugin = { name: 'user-plugin' };
    const mf = new ModuleFederation(
      { name: 'late-remote', plugins: [userPlugin] },
      {},
    );
    expect(pluginNames(mf)).toEqual(['user-plugin']);

    mf.attach({ remote, snapshot, platform: web });

    expect(mf.remoteHandler).toBeInstanceOf(RemoteHandler);
    expect(mf.snapshotHandler).toBeInstanceOf(SnapshotHandler);
    // Construction order is snapshot plugins first; attach appends them after existing plugins.
    expect(pluginNames(mf)).toEqual([
      'user-plugin',
      'snapshot-plugin',
      'generate-preload-assets-plugin',
    ]);

    mf.snapshotHandler.loadRemoteSnapshotInfo = async () => {
      throw new Error('snapshot-plugin listener ran');
    };
    await expect(
      mf.sharedHandler.hooks.lifecycle.afterResolve.emit({
        id: 'late/Button',
        pkgNameOrAlias: 'late',
        expose: './Button',
        remote: {
          name: 'late',
          entry: 'http://localhost:1111/mf-manifest.json',
        },
        options: mf.options,
        origin: mf,
        remoteInfo: {} as any,
      }),
    ).rejects.toThrow('snapshot-plugin listener ran');
  });
});
