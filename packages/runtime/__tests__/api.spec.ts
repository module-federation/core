import { describe, it, expect, rs, beforeEach } from '@rstest/core';
import { resetFederationGlobalInfo } from '@module-federation/runtime-core';
import { createInstance, getInstance, init } from '../src';

// eslint-disable-next-line max-lines-per-function
describe('api', () => {
  it('initializes and validates API structure', () => {
    const FM = init({
      name: '@federation/name',
      remotes: [],
    });
    expect(FM.loadShare).not.toBe(null);
    expect(FM.loadRemote).not.toBe(null);
  });
  it('initializes with the same name and returns the same instance', () => {
    const FM1 = init({
      name: '@federation/same-name',
      remotes: [],
    });
    const FM2 = init({
      name: '@federation/same-name',
      remotes: [],
    });
    expect(FM1).toBe(FM2);
  });
  it('initializes with the same name but different versions and returns different instances', () => {
    const FM1 = init({
      name: '@federation/same-name-with-version',
      version: '1.0.1',
      remotes: [],
    });
    const FM2 = init({
      name: '@federation/same-name-with-version',
      version: '1.0.2',
      remotes: [],
    });
    expect(FM1).not.toBe(FM2);
  });
  it('merges remotes when initialized with the same name', () => {
    const FM1 = init({
      name: '@federation/merge-remotes',
      remotes: [
        {
          name: '@federation/sub2',
          entry: 'xxx',
        },
      ],
    });
    const FM2 = init({
      name: '@federation/merge-remotes',
      remotes: [
        {
          name: '@federation/sub3',
          entry: 'xxx',
        },
      ],
    });
    expect(FM2).toBe(FM1);
    // merge remotes
    expect(FM1.options.remotes).toEqual(
      expect.arrayContaining([
        {
          name: '@federation/sub2',
          entry: new URL('xxx', location.origin).href,
          shareScope: 'default',
          type: 'global',
        },
        {
          name: '@federation/sub3',
          entry: new URL('xxx', location.origin).href,
          shareScope: 'default',
          type: 'global',
        },
      ]),
    );
  });
  it('initializes with different names and returns different instances', () => {
    const FM3 = init({
      name: '@federation/main3',
      remotes: [],
    });
    const FM4 = init({
      name: '@federation/main4',
      remotes: [],
    });
    expect(FM3).not.toBe(FM4);
  });

  it('returns the default instance when no finder is provided', () => {
    init({
      name: '@federation/default-instance',
      remotes: [],
    });
    const defaultInstance = getInstance();
    expect(defaultInstance).not.toBeNull();

    createInstance({
      name: '@federation/secondary-instance',
      remotes: [],
    });

    expect(getInstance()).toBe(defaultInstance);
  });

  describe('default instance contract', () => {
    type Runtime = typeof import('../src');
    let runtime: Runtime;

    // Fresh module copy (module-level default) and fresh global instance list
    beforeEach(async () => {
      resetFederationGlobalInfo();
      rs.resetModules();
      runtime = await import('../src');
    });

    const remote = (name: string) => ({
      name,
      entry: `http://localhost:1111/${name}/remoteEntry.js`,
    });
    const remoteNames = (instance: {
      options: { remotes: { name: string }[] };
    }) => instance.options.remotes.map((remoteInfo) => remoteInfo.name);

    it('first init() establishes the default', () => {
      expect(runtime.getInstance()).toBeNull();
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      expect(runtime.getInstance()).toBe(host);
    });

    it('second init() with a different name returns its own instance and keeps the default', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      // Simulates a remote container whose bundler runtime calls init() through
      // the same @module-federation/runtime copy as the host
      const remoteInstance = runtime.init({
        name: '@federation/remote',
        remotes: [],
      });
      expect(remoteInstance).not.toBe(host);
      expect(remoteInstance.name).toBe('@federation/remote');
      expect(runtime.getInstance()).toBe(host);
    });

    it('repeated init() with the same name reuses the instance and merges options', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      const again = runtime.init({
        name: '@federation/host',
        remotes: [remote('@federation/sub')],
      });
      expect(again).toBe(host);
      expect(remoteNames(host)).toContain('@federation/sub');
      expect(runtime.getInstance()).toBe(host);
    });

    it('createInstance() never establishes the default', () => {
      runtime.createInstance({ name: '@federation/created', remotes: [] });
      expect(runtime.getInstance()).toBeNull();
    });

    it('createInstance() after a default never changes it', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      runtime.createInstance({ name: '@federation/created', remotes: [] });
      expect(runtime.getInstance()).toBe(host);
    });

    it('getInstance(finder) searches global instances independently of the default', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      const created = runtime.createInstance({
        name: '@federation/created',
        remotes: [],
      });
      expect(runtime.getInstance()).toBe(host);
      expect(
        runtime.getInstance(
          (instance) => instance.name === '@federation/created',
        ),
      ).toBe(created);
      expect(
        runtime.getInstance(
          (instance) => instance.name === '@federation/missing',
        ),
      ).toBeNull();
    });

    it('routes every top-level API to the default instance', async () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      const other = runtime.init({ name: '@federation/other', remotes: [] });

      const methods = [
        'registerRemotes',
        'registerShared',
        'registerPlugins',
        'preloadRemote',
        'loadRemote',
        'loadShare',
      ] as const;
      const spy = (instance: typeof host) =>
        Object.fromEntries(
          methods.map((method) => [
            method,
            rs.spyOn(instance, method).mockImplementation(async () => null),
          ]),
        ) as Record<(typeof methods)[number], ReturnType<typeof rs.spyOn>>;
      const hostSpies = spy(host);
      const otherSpies = spy(other);

      runtime.registerRemotes([remote('@federation/sub')]);
      runtime.registerShared({});
      runtime.registerPlugins([]);
      await runtime.preloadRemote([{ nameOrAlias: '@federation/sub' }]);
      await runtime.loadRemote('@federation/sub/Widget');
      await runtime.loadShare('react');

      for (const method of methods) {
        expect(hostSpies[method]).toHaveBeenCalledTimes(1);
        expect(otherSpies[method]).not.toHaveBeenCalled();
      }
    });

    it('top-level registerRemotes mutates the default, not a later init() instance', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      const remoteInstance = runtime.init({
        name: '@federation/remote',
        remotes: [],
      });
      runtime.registerRemotes([remote('@federation/sub')]);
      expect(remoteNames(host)).toContain('@federation/sub');
      expect(remoteInstance.options.remotes).toHaveLength(0);
    });

    it('an instance from createInstance() becomes the default when init() adopts it and none exists', () => {
      const created = runtime.createInstance({
        name: '@federation/created',
        remotes: [],
      });
      expect(runtime.getInstance()).toBeNull();
      expect(runtime.init({ name: '@federation/created', remotes: [] })).toBe(
        created,
      );
      expect(runtime.getInstance()).toBe(created);
    });

    it('an instance from createInstance() does not become the default via init() when one exists', () => {
      const host = runtime.init({ name: '@federation/host', remotes: [] });
      const created = runtime.createInstance({
        name: '@federation/created',
        remotes: [],
      });
      expect(runtime.init({ name: '@federation/created', remotes: [] })).toBe(
        created,
      );
      expect(runtime.getInstance()).toBe(host);
    });
  });

  it('finds the first matching registered instance', () => {
    const firstInstance = createInstance({
      name: '@federation/find-first',
      remotes: [],
    });
    const matchingInstance = createInstance({
      name: '@federation/find-target',
      remotes: [],
    });

    expect(getInstance((instance) => instance === firstInstance)).toBe(
      firstInstance,
    );
    expect(
      getInstance((instance) => instance.name === '@federation/find-target'),
    ).toBe(matchingInstance);
    expect(
      getInstance((instance) => instance.name === '@federation/missing'),
    ).toBe(null);
  });

  it('generates an id for runtime-created instances', () => {
    const FM = createInstance({
      name: '@federation/create-instance-id',
      version: '1.0.0',
      remotes: [],
    });

    expect(FM.options.id).toBe('@federation/create-instance-id@1.0.0');
  });

  it('does not generate an id for init-created instances', () => {
    const FM = init({
      name: '@federation/init-without-id',
      version: '1.0.0',
      remotes: [],
    });

    expect(FM.options.id).toBe('');
  });

  it('alias check', () => {
    // 校验 alias 是否等于 remote.name 和 remote.alias 的前缀，如果是则报错
    // 因为引用支持多级路径的引用时无法保证名称是否唯一，所以不支持 alias 为 remote.name 的前缀
    //     需要注意的是不要将 alias 和 name 的前缀相等，例如：

    // ```js
    // remotes: [
    //     {
    //         name: "@scope/button",
    //         version: "1.0.2"
    //     },
    //     {
    //         name: "@scope/component",
    //         alias: "@scope",
    //         version: "1.0.1"
    //     }
    // ]

    // 因为引用支持多级路径的引用，在使用 `@scope/button` 时内部无法判断是从 `"@scope/button"` 获取的还是从 `"@scope/component"` 获取的
    expect(() => {
      init({
        name: '@federation/init-alias',
        remotes: [
          {
            name: '@scope/button',
            version: '1.0.2',
          },
          {
            name: '@scope/component',
            alias: '@scope',
            version: '1.0.1',
          },
        ],
      });
    }).toThrow(
      /The alias @scope of remote @scope\/component is not allowed to be the prefix of @scope\/button name or alias/,
    );

    expect(() => {
      init({
        name: '@federation/init-alias1',
        remotes: [
          {
            name: '@federation/button',
            alias: '@scope/button',
            version: '1.0.2',
          },
          {
            name: '@scope/component',
            alias: '@scope',
            version: '1.0.1',
          },
        ],
      });
    }).toThrow(
      /The alias @scope of remote @scope\/component is not allowed to be the prefix of @federation\/button name or alias/,
    );
  });
});
