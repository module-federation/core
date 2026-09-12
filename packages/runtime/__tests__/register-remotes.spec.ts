import { assert, describe, it, expect, rs } from '@rstest/core';
import {
  CurrentGlobal,
  Global,
  setGlobalFederationInstance,
} from '@module-federation/runtime-core';
import {
  ModuleFederation,
  withSideEffectScope,
  getRecordedRemoteSideEffects,
} from '../src/index';

describe('ModuleFederation', () => {
  it('registers new remotes and loads them correctly', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
    // Register new remotes
    FM.registerRemotes([
      {
        name: '@register-remotes/app2',
        entry:
          'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
      },
    ]);
    const app2Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app2Module);
    const res = await app2Module();
    expect(res).toBe('hello app2');
  });
  it('does not merge loaded remote by default', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    FM.registerRemotes([
      {
        name: '@register-remotes/app1',
        // Entry is different from the registered remote
        entry:
          'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
      },
    ]);

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
  });
  it('merges loaded remote by setting "force: true"', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/app1',
          // Entry is different from the registered remote
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
        },
      ],
      { force: true },
    );
    const newApp1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(newApp1Module);
    const newApp1Res = await newApp1Module();
    // Value is different from the registered remote
    expect(newApp1Res).toBe('hello app1 entry2');
  });
  describe('removeRemote runtime instance ownership', () => {
    const BUILD_NAME = '@register-remotes/app1';
    const HOST_NAME = '@federation/instance';
    const ENTRY1 =
      'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js';
    const ENTRY2 =
      'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js';
    const remoteOf = (
      entry: string,
      registeredName: string,
      entryGlobalName?: string,
    ) => ({
      name: registeredName,
      entry,
      ...(entryGlobalName ? { entryGlobalName } : {}),
    });
    const loadApp1 = async (
      registeredName = BUILD_NAME,
      entryGlobalName?: string,
    ) => {
      // Drop any container global left behind by earlier tests so the entry
      // script is executed again instead of being reused.
      delete (CurrentGlobal as Record<string, unknown>)[BUILD_NAME];
      const FM = new ModuleFederation({
        name: HOST_NAME,
        version: '1.0.1',
        remotes: [remoteOf(ENTRY1, registeredName, entryGlobalName)],
      });
      const mod = await FM.loadRemote<Promise<() => string>>(
        `${registeredName}/say`,
      );
      assert(mod);
      expect(await mod()).toBe('hello app1 entry1');
      return FM;
    };
    const setBuildVersion = (
      FM: ModuleFederation,
      registeredName: string,
      buildVersion: string,
    ) => {
      const loaded = FM.moduleCache.get(registeredName);
      assert(loaded);
      loaded.remoteInfo.buildVersion = buildVersion;
    };
    const addInstance = (name: string, version?: string, id?: string) => {
      const instance = new ModuleFederation({ name, version, remotes: [] });
      if (id !== undefined) {
        instance.options.id = id;
      }
      setGlobalFederationInstance(instance);
      return instance;
    };
    const forceReRegister = (
      FM: ModuleFederation,
      registeredName = BUILD_NAME,
      entryGlobalName?: string,
      options?: { disposeSideEffects?: boolean },
    ) => {
      const warnSpy = rs.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        FM.registerRemotes(
          [remoteOf(ENTRY2, registeredName, entryGlobalName)],
          {
            force: true,
            ...options,
          },
        );
        return warnSpy.mock.calls
          .flat()
          .filter(
            (arg): arg is string =>
              typeof arg === 'string' &&
              arg.includes('__FEDERATION__.__INSTANCES__'),
          );
      } finally {
        warnSpy.mockRestore();
      }
    };
    const makeShared = (from: string, useIn: string[], loaded: boolean) =>
      ({
        version: '18.0.0',
        get: () => () => ({}),
        shareConfig: {},
        scope: ['default'],
        useIn,
        from,
        deps: [],
        loaded,
        strategy: 'version-first',
      }) as any;
    const instances = () => CurrentGlobal.__FEDERATION__.__INSTANCES__;

    it('removes only the instance with the matching build version when two share a build name', async () => {
      const FM = await loadApp1();
      setBuildVersion(FM, BUILD_NAME, '2.0.0');
      const v1 = addInstance(BUILD_NAME, '1.0.0');
      const v2 = addInstance(BUILD_NAME, '2.0.0');

      const warnings = forceReRegister(FM);

      expect(instances()).toContain(v1);
      expect(instances()).not.toContain(v2);
      expect(warnings).toEqual([]);
    });

    it('resolves the instance through entryGlobalName when the registration alias differs from the build name', async () => {
      const alias = '@register-remotes/app1-alias';
      const FM = await loadApp1(alias, BUILD_NAME);
      const remoteInstance = addInstance(BUILD_NAME);

      const warnings = forceReRegister(FM, alias, BUILD_NAME);

      expect(instances()).not.toContain(remoteInstance);
      expect(FM.moduleCache.has(alias)).toBe(false);
      expect(warnings).toEqual([]);

      const next = await FM.loadRemote<Promise<() => string>>(`${alias}/say`);
      assert(next);
      expect(await next()).toBe('hello app1 entry2');
    });

    it('deletes unloaded shares produced by the remote instance from the global share scope', async () => {
      const FM = await loadApp1();
      addInstance(BUILD_NAME);
      const shareScope = Global.__FEDERATION__.__SHARE__;
      shareScope[BUILD_NAME] = {
        default: { react: { '18.0.0': makeShared(BUILD_NAME, [], false) } },
      };

      forceReRegister(FM);

      expect(shareScope[BUILD_NAME]).toBeUndefined();
    });

    it('keeps shares still consumed by another host and only drops the producer from useIn', async () => {
      const FM = await loadApp1();
      addInstance(BUILD_NAME);
      const shareScope = Global.__FEDERATION__.__SHARE__;
      const shared = makeShared(BUILD_NAME, [HOST_NAME, BUILD_NAME], true);
      shareScope[BUILD_NAME] = { default: { react: { '18.0.0': shared } } };

      forceReRegister(FM);

      expect(shareScope[BUILD_NAME]?.default?.react?.['18.0.0']).toBe(shared);
      expect(shared.useIn).toEqual([HOST_NAME]);
    });

    it('removes nothing and warns about ambiguity when two unversioned instances share the name', async () => {
      const FM = await loadApp1();
      const first = addInstance(BUILD_NAME);
      const second = addInstance(BUILD_NAME);

      const warnings = forceReRegister(FM);

      expect(instances()).toContain(first);
      expect(instances()).toContain(second);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('ambiguous');
      expect(warnings[0]).toContain('2 runtime instances');
      expect(warnings[0]).toContain('"registeredName"');
    });

    it('warns when instances with the same name exist but none has the requested build version', async () => {
      const FM = await loadApp1();
      setBuildVersion(FM, BUILD_NAME, '3.0.0');
      const v1 = addInstance(BUILD_NAME, '1.0.0');

      const warnings = forceReRegister(FM);

      expect(instances()).toContain(v1);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('"3.0.0"');
      expect(warnings[0]).toContain('found versions: 1.0.0');
    });

    it('stays silent and still clears the module cache for a container without a runtime instance', async () => {
      const FM = await loadApp1();
      const unrelated = addInstance('@register-remotes/unrelated');
      const before = [...instances()];

      const warnings = forceReRegister(FM);

      expect(warnings).toEqual([]);
      expect(instances()).toEqual(before);
      expect(instances()).toContain(unrelated);
      expect(FM.moduleCache.has(BUILD_NAME)).toBe(false);

      const next = await FM.loadRemote<Promise<() => string>>(
        `${BUILD_NAME}/say`,
      );
      assert(next);
      expect(await next()).toBe('hello app1 entry2');
    });

    it('resolves a versioned instance by options.name and options.version when options.id is custom', async () => {
      const FM = await loadApp1();
      setBuildVersion(FM, BUILD_NAME, '2.0.0');
      const custom = addInstance(BUILD_NAME, '2.0.0', 'custom-build-id');

      const warnings = forceReRegister(FM);

      expect(instances()).not.toContain(custom);
      expect(warnings).toEqual([]);
    });

    it('disposes recorded side effects on forced re-registration when disposeSideEffects is true', async () => {
      const FM = await loadApp1();
      const warningHandler = () => {};
      let timerHandle: any;

      withSideEffectScope(BUILD_NAME, () => {
        timerHandle = setTimeout(() => {}, 10000);
        process.on('warning', warningHandler);
      });

      expect(getRecordedRemoteSideEffects(BUILD_NAME)).toBeDefined();
      expect(process.listeners('warning')).toContain(warningHandler);

      forceReRegister(FM, BUILD_NAME, undefined, { disposeSideEffects: true });

      expect(getRecordedRemoteSideEffects(BUILD_NAME)).toBeUndefined();
      expect(process.listeners('warning')).not.toContain(warningHandler);
    });
  });
});
