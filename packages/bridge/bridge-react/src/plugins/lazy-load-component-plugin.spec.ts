import { describe, it, expect, rs } from '@rstest/core';
import { lazyLoadComponentPlugin } from './lazy-load-component-plugin';
import {
  createInstance,
  type ModuleFederation,
} from '@module-federation/enhanced/runtime';

describe('lazyLoadComponentPlugin', () => {
  it('extends instances created through enhanced/runtime', () => {
    const instance = createInstance({
      name: 'bridge-enhanced-runtime',
      remotes: [],
      plugins: [lazyLoadComponentPlugin()],
    });

    expect(typeof instance.createLazyComponent).toBe('function');
    expect(typeof instance.prefetch).toBe('function');
    expect(instance.collectSSRAssets({ id: 'missing/component' })).toEqual([]);
  });

  it('should register lazy load component methods on the instance', () => {
    const instance = {
      registerPlugins: rs.fn(),
    } as unknown as ModuleFederation;

    const plugin = lazyLoadComponentPlugin();
    if (plugin.apply) {
      plugin.apply(instance);
    }

    expect(instance.registerPlugins).toHaveBeenCalled();
    expect(typeof instance.createLazyComponent).toBe('function');
    expect(typeof instance.prefetch).toBe('function');
    expect(typeof instance.collectSSRAssets).toBe('function');
  });
});
