import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import type { SharedLoadContext } from '../src/type';

const declared = { shareScopeDispatch: 'declared' } as const;

function setup(shareScope: string | string[], name: string) {
  const init = rs.fn();
  const host = new ModuleFederation({
    name,
    shareStrategy: 'version-first',
    remotes: [
      {
        name: 'peer',
        type: 'script',
        entry: `https://remote.test/${name}.js`,
        shareScope,
      },
    ],
    plugins: [
      {
        name: 'in-memory-entry',
        loadEntry: async () => ({ init, get: rs.fn() }),
      },
    ],
  });
  return { host, init };
}

function expectInit(
  host: ModuleFederation,
  init: ReturnType<typeof rs.fn>,
  keys: string | string[],
) {
  expect(init).toHaveBeenCalledTimes(1);
  const [pool, chain, options] = init.mock.calls[0];
  const first = Array.isArray(keys) ? keys[0] : keys;
  expect(pool).toBeDefined();
  expect(pool).toBe(host.shareScopeMap[first]);
  expect(chain).toEqual(expect.any(Array));
  expect(options.shareScopeMap).toBe(host.shareScopeMap);
  expect(options.shareScopeKeys).toEqual(keys);
}

describe('initializeSharing with declared script remote scopes', () => {
  it.each<[string, string[]]>([
    ['second', ['b']],
    ['both', ['a', 'b']],
  ])(
    'initializes an array remote once when asked for %s',
    async (label, scopes) => {
      const { host, init } = setup(['a', 'b'], `array-${label}`);
      await expect(
        Promise.all(
          scopes.flatMap((scope) =>
            host.initializeSharing(scope, { context: declared }),
          ),
        ),
      ).resolves.toBeDefined();
      expectInit(host, init, ['a', 'b']);
    },
  );

  it('does not match an array remote without the call context', async () => {
    const { host, init } = setup(['a', 'b'], 'array-control');
    await expect(
      Promise.all([
        ...host.initializeSharing('a'),
        ...host.initializeSharing('b'),
      ]),
    ).resolves.toBeDefined();
    expect(init).not.toHaveBeenCalled();
  });

  it.each<[string, SharedLoadContext | undefined]>([
    ['legacy', undefined],
    ['declared', declared],
  ])('keeps scalar matching for the %s call', async (label, context) => {
    const { host, init } = setup('b', `scalar-${label}`);
    await expect(
      Promise.all(host.initializeSharing('a', { context })),
    ).resolves.toBeDefined();
    expect(init).not.toHaveBeenCalled();
    await expect(
      Promise.all(host.initializeSharing('b', { context })),
    ).resolves.toBeDefined();
    expectInit(host, init, 'b');
  });
});
