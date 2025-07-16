import { describe, it, expect, vi } from 'vitest';
import { lazyLoadComponentPlugin } from './lazy-load-component-plugin';
import type { ModuleFederation } from '@module-federation/runtime';

describe('lazyLoadComponentPlugin', () => {
  it('should register lazy load component methods on the instance', () => {
    const instance = {
      registerPlugins: vi.fn(),
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
