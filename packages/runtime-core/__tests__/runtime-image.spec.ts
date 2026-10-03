import {
  assertRuntimeImageCompatible,
  attachRuntimeImage,
  readRuntimeImage,
  type RuntimeImageDescriptorV1,
} from '../src/runtimeImage';

const image = (
  overrides: Partial<RuntimeImageDescriptorV1> = {},
): RuntimeImageDescriptorV1 => ({
  contract: 1,
  compatibilityId: 'module-federation.runtime-family.1',
  required: ['remote'],
  forbidden: [],
  available: ['remote', 'shared'],
  target: 'web',
  entryLoadingIdentity: 'sdk-node@1',
  ...overrides,
});

describe('runtime image compatibility', () => {
  it('rejects a different family before state is reused', () => {
    expect(() =>
      assertRuntimeImageCompatible(
        image(),
        image({ compatibilityId: 'other-family' }),
      ),
    ).toThrow(/other-family/);
  });

  it('rejects a provider that exposes a forbidden capability', () => {
    expect(() =>
      assertRuntimeImageCompatible(
        image({ available: ['remote', 'shared'] }),
        image({ forbidden: ['shared'], required: ['remote'] }),
      ),
    ).toThrow(/forbidden capability shared/);
  });

  it('rejects reuse in either order when only one image can load shared modules', () => {
    const withoutShared = image({
      forbidden: ['shared'],
      available: ['remote'],
    });
    const withShared = image({ available: ['remote', 'shared'] });

    expect(() =>
      assertRuntimeImageCompatible(withoutShared, withShared),
    ).toThrow(/missing capability shared/);
    expect(() =>
      assertRuntimeImageCompatible(withShared, withoutShared),
    ).toThrow(/forbidden capability shared/);
    expect(() =>
      assertRuntimeImageCompatible(withShared, image()),
    ).not.toThrow();
  });

  it('stores the descriptor on the instance without changing enumerable keys', () => {
    const instance = {};
    attachRuntimeImage(instance, image());
    expect(readRuntimeImage(instance)?.entryLoadingIdentity).toBe('sdk-node@1');
    expect(Object.keys(instance)).toEqual([]);
  });
});
