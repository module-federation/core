import {
  readRuntimeImage,
  type RuntimeImageDescriptorV1,
} from '@module-federation/runtime-core';
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
  it('publishes the created instance through the global default pointer', () => {
    const instance = createInstance({
      name: 'global-default',
      runtimeImage: image(),
    });

    expect(getInstance()).toBe(instance);
    expect(readRuntimeImage(instance)).toEqual(image());
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
