import { describe, it, expect, vi } from 'vitest';
import { init, unloadRemote } from '../src';

// eslint-disable-next-line max-lines-per-function
describe('api', () => {
  it('initializes and validates API structure', () => {
    const FM = init({
      name: '@federation/name',
      remotes: [],
    });
    expect(FM.loadShare).not.toBe(null);
    expect(FM.loadRemote).not.toBe(null);
    expect(FM.unloadRemote).not.toBe(null);
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

  it('exports top-level unloadRemote wrapper and delegates to instance', async () => {
    const FM = init({
      name: '@federation/unload-wrapper',
      remotes: [
        {
          name: '@register-remotes/app1',
          alias: 'app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    await FM.loadRemote('@register-remotes/app1/say');
    expect(unloadRemote('@register-remotes/app1')).toBe(true);
  });

  it('throws for top-level unloadRemote wrapper when instance is missing', async () => {
    vi.resetModules();
    const runtime = await import('../src/index');
    expect(() => runtime.unloadRemote('missing')).toThrow();
  });
});
