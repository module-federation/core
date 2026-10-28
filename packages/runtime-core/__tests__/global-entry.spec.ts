import { afterEach, describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { getRemoteEntryExports } from '../src/global';
import { getRemoteEntry, getRemoteInfo } from '../src/utils/load';

const key = '__test_remote_global_collision__';

afterEach(() => {
  delete (globalThis as any)[key];
});

describe('remote entry global collisions', () => {
  it.each([
    'window',
    'document',
    'globalThis',
    'process',
    'constructor',
    'toString',
    'NaN',
    'undefined',
    'Infinity',
  ])('rejects the occupied global %s before loading a script', async (name) => {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    const href = window.location.href;
    const createScript = rs.fn();
    const origin = new ModuleFederation({
      name: 'collision-host',
      remotes: [],
      plugins: [{ name: 'observe-scripts', createScript }],
    });

    await expect(
      getRemoteEntry({
        origin,
        remoteInfo: getRemoteInfo({
          name,
          type: 'var',
          entry: 'http://localhost:1111/must-not-be-loaded.js',
        }),
      }),
    ).rejects.toThrow(`Remote entry global name collision: "${name}"`);

    expect(createScript).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyDescriptor(globalThis, name)).toEqual(original);
    expect(window.location.href).toBe(href);
  });

  it.each([false, 0, '', null, NaN])(
    'rejects occupied falsy slots (%s) rather than overwriting them',
    (value) => {
      (globalThis as any)[key] = value;
      expect(() => getRemoteEntryExports('remote', key)).toThrow(
        'Remote entry global name collision',
      );
      expect(Object.is((globalThis as any)[key], value)).toBe(true);
    },
  );

  it('does not invoke a foreign global accessor', () => {
    const get = rs.fn(() => ({ get: rs.fn(), init: rs.fn() }));
    const set = rs.fn();
    Object.defineProperty(globalThis, key, { get, set, configurable: true });

    expect(() => getRemoteEntryExports('remote', key)).toThrow(
      'Remote entry global name collision',
    );
    expect(get).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });

  it('reports a collision when a container method getter throws', () => {
    const get = rs.fn(() => {
      throw new Error('foreign getter');
    });
    (globalThis as any)[key] = Object.defineProperty({}, 'get', { get });

    expect(() => getRemoteEntryExports('remote', key)).toThrow(
      'Remote entry global name collision',
    );
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('keeps a missing or unassigned writable registration slot available', () => {
    expect(getRemoteEntryExports('remote', key).entryExports).toBeUndefined();
    (globalThis as any)[key] = undefined;
    expect(getRemoteEntryExports('remote', key).entryExports).toBeUndefined();
  });

  it('preserves a foreign global when force registering after a collision', async () => {
    const foreign = { applicationState: true };
    (globalThis as any)[key] = foreign;
    const remote = {
      name: 'force-register-collision',
      entryGlobalName: key,
      entry: 'http://localhost:1111/must-not-be-loaded.js',
    };
    const origin = new ModuleFederation({
      name: 'force-register-host',
      remotes: [remote],
    });

    await expect(origin.loadRemote(`${remote.name}/message`)).rejects.toThrow(
      'Remote entry global name collision',
    );
    expect(origin.moduleCache.has(remote.name)).toBe(true);
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);

    origin.registerRemotes(
      [{ ...remote, entry: 'http://localhost:1111/replacement.js' }],
      { force: true },
    );

    expect(Object.getOwnPropertyDescriptor(globalThis, key)).toEqual(
      descriptor,
    );
    expect((globalThis as any)[key]).toBe(foreign);
  });

  it.each(['owned', 'replaced', 'accessor'] as const)(
    'only removes its own loaded container when force registering (%s global)',
    async (state) => {
      const container = {
        init() {},
        get() {
          return () => ({ message: 'ok' });
        },
      };
      (globalThis as any)[key] = container;
      const remote = {
        name: 'force-register-loaded',
        entryGlobalName: key,
        entry: 'http://localhost:1111/must-not-be-loaded.js',
      };
      const origin = new ModuleFederation({
        name: 'force-register-loaded-host',
        remotes: [remote],
      });
      await expect(
        origin.loadRemote(`${remote.name}/message`),
      ).resolves.toEqual({
        message: 'ok',
      });
      const foreign = { applicationState: true };
      const get = rs.fn(() => foreign);
      if (state === 'replaced') {
        (globalThis as any)[key] = foreign;
      } else if (state === 'accessor') {
        Object.defineProperty(globalThis, key, { get, configurable: true });
      }
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);

      origin.registerRemotes(
        [{ ...remote, entry: 'http://localhost:1111/replacement.js' }],
        { force: true },
      );

      if (state === 'owned') {
        expect(Object.hasOwn(globalThis, key)).toBe(false);
      } else {
        expect(Object.getOwnPropertyDescriptor(globalThis, key)).toEqual(
          descriptor,
        );
      }
      expect(get).not.toHaveBeenCalled();
    },
  );

  it('reuses an existing legitimate container without loading its script', async () => {
    class Container {
      get() {}
      init() {}
    }
    const container = new Container();
    (globalThis as any)[key] = container;
    const createScript = rs.fn();
    const origin = new ModuleFederation({
      name: 'preloaded-container-host',
      remotes: [],
      plugins: [{ name: 'observe-scripts', createScript }],
    });

    await expect(
      getRemoteEntry({
        origin,
        remoteInfo: getRemoteInfo({
          name: 'remote',
          entryGlobalName: key,
          entry: 'http://localhost:1111/must-not-be-loaded.js',
        }),
      }),
    ).resolves.toBe(container);
    expect(createScript).not.toHaveBeenCalled();
  });

  it('accepts Webpack and Rspack container export getters', async () => {
    const get = rs.fn();
    const init = rs.fn();
    const container = Object.defineProperties(
      {},
      {
        get: { enumerable: true, get: () => get },
        init: { enumerable: true, get: () => init },
      },
    );
    (globalThis as any)[key] = container;
    const origin = new ModuleFederation({
      name: 'getter-exports-host',
      remotes: [],
    });

    await expect(
      getRemoteEntry({
        origin,
        remoteInfo: getRemoteInfo({
          name: 'remote',
          entryGlobalName: key,
          entry: 'http://localhost:1111/must-not-be-loaded.js',
        }),
      }),
    ).resolves.toBe(container);
    expect(get).not.toHaveBeenCalled();
    expect(init).not.toHaveBeenCalled();
  });

  it('does not apply global collision checks to browser ESM loading', async () => {
    const origin = new ModuleFederation({ name: 'process', remotes: [] });
    const remoteInfo = getRemoteInfo({
      name: 'window',
      type: 'module',
      entry: `data:text/javascript,${encodeURIComponent('export function get() {} export function init() {}')}`,
    });

    await expect(getRemoteEntry({ origin, remoteInfo })).resolves.toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
  });

  it.each(['module', 'commonjs-module'] as const)(
    'rejects Node %s registration collisions before fetching or executing the entry',
    async (type) => {
      const previous = Object.getOwnPropertyDescriptor(
        globalThis,
        'ENV_TARGET',
      );
      Object.defineProperty(globalThis, 'ENV_TARGET', {
        value: 'node',
        configurable: true,
      });
      try {
        const createScript = rs.fn();
        const origin = new ModuleFederation({
          name: 'node-collision-host',
          remotes: [],
          plugins: [{ name: 'observe-node-scripts', createScript }],
        });
        const processDescriptor = Object.getOwnPropertyDescriptor(
          globalThis,
          'process',
        );
        await expect(
          getRemoteEntry({
            origin,
            remoteInfo: getRemoteInfo({
              name: 'process',
              type,
              entry: 'http://localhost:1111/must-not-be-loaded.js',
            }),
          }),
        ).rejects.toThrow('Remote entry global name collision: "process"');
        expect(createScript).not.toHaveBeenCalled();
        expect(Object.getOwnPropertyDescriptor(globalThis, 'process')).toEqual(
          processDescriptor,
        );
      } finally {
        if (previous) {
          Object.defineProperty(globalThis, 'ENV_TARGET', previous);
        } else {
          delete (globalThis as any).ENV_TARGET;
        }
      }
    },
  );
});
