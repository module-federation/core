import { describe, expect, it } from 'vitest';
import { pluginModuleFederation } from './index';
import pkg from '../../package.json';
import { CALL_NAME_MAP } from '../constant';
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

  it('should use defined plugin name in dual-target guidance error', () => {
    const plugin = pluginModuleFederation(mockMFConfig, { target: 'dual' });
    const mockApi = {
      context: { callerName: CALL_NAME_MAP.RSLIB },
      getRsbuildConfig: () => ({}),
    };

    expect(() => plugin.setup(mockApi as any)).toThrow(
      `Please set ${pkg.name} as global plugin in rslib.config.ts if you set 'target: "dual"'.`,
    );
  });
});
