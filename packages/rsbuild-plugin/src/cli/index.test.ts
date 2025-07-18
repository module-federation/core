import { describe, expect, it } from 'vitest';
import { pluginModuleFederation } from './index';
import type { moduleFederationPlugin } from '@module-federation/sdk';

describe('pluginModuleFederation', () => {
  const mockMFConfig: moduleFederationPlugin.ModuleFederationPluginOptions = {
    name: 'test',
    exposes: {
      './Button': './src/Button',
    },
  };

  it('should work without rsbuildOptions parameter', () => {
    const plugin = pluginModuleFederation(mockMFConfig);
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('rsbuild:module-federation-enhanced');
  });

  it('should work with rsbuildOptions parameter', () => {
    const plugin = pluginModuleFederation(mockMFConfig, { ssr: true });
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('rsbuild:module-federation-enhanced');
  });

  it('should work with empty rsbuildOptions', () => {
    const plugin = pluginModuleFederation(mockMFConfig, {});
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('rsbuild:module-federation-enhanced');
  });
});
