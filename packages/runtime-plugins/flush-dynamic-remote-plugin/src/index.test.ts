import { describe, expect, it, vi, assert } from 'vitest';
import { init, registerRemotes } from '@module-federation/runtime';
import flushDynamicRemotePlugin from './index';

const sleep = () =>
  new Promise((resolve) => {
    process.nextTick(() => setImmediate(resolve));
  });

describe('flushDynamicRemotePlugin will work on third call if remoteEntry content has changed ', async () => {
  it('auto flush dynamic remote entry', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(
        new Response(`module.exports.remote = {
          get(scope) {
            const moduleMap = {
              './say'() {
                return () => 'hello app1';
              },
            };
            return moduleMap[scope];
          },
          init() {},
        };`),
      );
    });
    const entry = 'http://localhost:8001/remoteEntry.js';
    const instance = init({
      name: 'host',
      remotes: [
        {
          name: 'remote',
          entry: entry,
        },
      ],
      plugins: [flushDynamicRemotePlugin({ expiredTime: 10 })],
    });

    const remote = await instance.loadRemote<() => string>('remote/say');
    assert(remote, 'remote should be a function');
    expect(remote()).toBe('hello app1');
    await sleep();
    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(
        new Response(`module.exports.remote = {
        get(scope) {
          const moduleMap = {
            './say'() {
              return () => 'hello app2';
            },
          };
          return moduleMap[scope];
        },
        init() {},
      };
      `),
      );
    });
    registerRemotes([
      {
        name: 'remote',
        entry: entry,
      },
    ]);

    const secondRemote = await instance.loadRemote<() => string>('remote/say');
    assert(secondRemote, 'remote should be a function');
    expect(secondRemote()).toBe('hello app1');
    await sleep();

    globalThis.fetch = vi.fn().mockImplementation(() => {
      return Promise.resolve(
        new Response(`module.exports.remote = {
        get(scope) {
          const moduleMap = {
            './say'() {
              return () => 'hello app2';
            },
          };
          return moduleMap[scope];
        },
        init() {},
      };
      `),
      );
    });
    registerRemotes([
      {
        name: 'remote',
        entry: entry,
      },
    ]);

    const thirdRemote = await instance.loadRemote<() => string>('remote/say');
    assert(thirdRemote, 'remote should be a function');
    expect(thirdRemote()).toBe('hello app2');
  });
});
