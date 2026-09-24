import {
  CurrentGlobal,
  readRuntimeImage,
  type RuntimeImageDescriptorV1,
} from '@module-federation/runtime-core';
import { rs } from '@rstest/core';
import { createInstance, getInstance, init } from '../src';

const image = (
  overrides: Partial<RuntimeImageDescriptorV1> = {},
): RuntimeImageDescriptorV1 => ({
  contract: 1,
  compatibilityId: 'runtime-family',
  required: ['remote'],
  forbidden: [],
  available: ['remote', 'shared'],
  target: 'web',
  entryLoadingIdentity: 'web-loader',
  ...overrides,
});

describe('runtime image reuse', () => {
  it('keeps getInstance bound to init in this runtime copy', () => {
    const instance = createInstance({
      name: 'created-not-default',
      runtimeImage: image(),
    });

    expect(getInstance()).not.toBe(instance);
    expect(readRuntimeImage(instance)).toEqual(image());
  });

  it('registers separately built instances with different targets and capabilities', () => {
    const host = createInstance({
      name: 'image-host',
      runtimeImage: image({ target: 'web', available: ['remote', 'shared'] }),
    });
    const remote = createInstance({
      name: 'image-remote',
      runtimeImage: image({
        target: 'universal',
        forbidden: ['shared'],
        available: ['remote'],
      }),
    });

    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toEqual(
      expect.arrayContaining([host, remote]),
    );
  });

  it('rejects a different family before plugins run', () => {
    const beforeInit = rs.fn((args) => args);
    createInstance({ name: 'family-a-host', runtimeImage: image() });

    expect(() =>
      createInstance({
        name: 'family-b-host',
        runtimeImage: image({ compatibilityId: 'other-family' }),
        plugins: [{ name: 'observe-before-init', beforeInit }],
      }),
    ).toThrow(/other-family/);
    expect(beforeInit).not.toHaveBeenCalled();
    expect(
      CurrentGlobal.__FEDERATION__.__INSTANCES__.map((i) => i.name),
    ).not.toContain('family-b-host');
  });

  it('reuses a compatible image and rejects an incompatible family', () => {
    const first = init({
      name: 'runtime-image-host',
      runtimeImage: image(),
    });
    const reused = init({
      name: 'runtime-image-host',
      runtimeImage: image(),
    });

    expect(reused).toBe(first);
    expect(() =>
      init({
        name: 'runtime-image-host',
        runtimeImage: image({ compatibilityId: 'other-family' }),
      }),
    ).toThrow(
      'Refusing to reuse runtime state from runtime-family with other-family.',
    );
    expect(readRuntimeImage(first)?.compatibilityId).toBe('runtime-family');
  });
});
