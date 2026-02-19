import { describe, expect, it, vi } from 'vitest';
import {
  pluginModuleFederation,
  RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
} from './index';
import { CALL_NAME_MAP } from '../constant';

import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { Rspack } from '@rsbuild/core';

type MockApiState = {
  beforeCreateCompiler?: (args: {
    bundlerConfigs?: Rspack.Configuration[];
  }) => void;
};

function createMockApi(
  rsbuildConfig: Record<string, any>,
  callerName = 'rsbuild',
) {
  const originalConfig = JSON.parse(JSON.stringify(rsbuildConfig));
  const state: MockApiState = {};

  const api = {
    context: {
      callerName,
    },
    getRsbuildConfig: (kind?: 'original') =>
      kind === 'original' ? originalConfig : rsbuildConfig,
    modifyRsbuildConfig: (callback: (config: Record<string, any>) => void) => {
      callback(rsbuildConfig);
    },
    modifyEnvironmentConfig: vi.fn(),
    expose: vi.fn(),
    processAssets: vi.fn(),
    onBeforeCreateCompiler: (
      callback: (args: { bundlerConfigs?: Rspack.Configuration[] }) => void,
    ) => {
      state.beforeCreateCompiler = callback;
    },
    onDevCompileDone: vi.fn(),
    onAfterBuild: vi.fn(),
  };

  return { api, state, rsbuildConfig };
}

function createMfOptions(): moduleFederationPlugin.ModuleFederationPluginOptions {
  return {
    name: 'host',
    remotes: {
      remote: 'remote@http://localhost:3001/mf-manifest.json',
    },
  };
}

describe('pluginModuleFederation node target environment behavior', () => {
  it('uses the configured custom environment instead of requiring "mf"', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
      environment: 'ssr',
    });
    const { api, rsbuildConfig } = createMockApi({
      environments: {
        client: {},
        ssr: {},
      },
    });

    plugin.setup(api as any);

    expect(rsbuildConfig.environments.ssr.tools?.rspack).toBeDefined();
    expect(rsbuildConfig.environments.client.tools?.rspack).toBeUndefined();
  });

  it('throws a clear error when target=node environment is missing', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
      environment: 'ssr',
    });
    const { api } = createMockApi({
      environments: {
        client: {},
      },
    });

    expect(() => plugin.setup(api as any)).toThrow(
      "Can not find environment 'ssr' when using target: 'node'. Available environments: client.",
    );
  });

  it('defaults to the rsbuild node environment when target=node and environment is omitted', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
    });
    const { api, rsbuildConfig } = createMockApi({
      environments: {
        web: {},
        node: {},
      },
    });

    plugin.setup(api as any);

    expect(rsbuildConfig.environments.node.tools?.rspack).toBeDefined();
    expect(rsbuildConfig.environments.web.tools?.rspack).toBeUndefined();
  });

  it('defaults to the rspress node environment when target=node and environment is omitted', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
    });
    const { api, rsbuildConfig } = createMockApi(
      {
        environments: {
          web: {},
          node: {},
          node_md: {},
        },
      },
      CALL_NAME_MAP.RSPRESS,
    );

    plugin.setup(api as any);

    expect(rsbuildConfig.environments.node.tools?.rspack).toBeDefined();
    expect(rsbuildConfig.environments.web.tools?.rspack).toBeUndefined();
  });

  it('still applies MF to the selected node environment when output is commonjs-like', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
      environment: 'ssr',
    });
    const { api, state } = createMockApi({
      environments: {
        client: {},
        ssr: {},
      },
    });
    const ssrBundlerConfig: Rspack.Configuration = {
      name: 'ssr',
      output: {
        path: '/tmp/ssr',
        publicPath: '/',
        chunkFilename: 'chunks/[name].js',
        library: {
          type: 'commonjs2',
        },
      },
      optimization: {},
      plugins: [],
    };
    const clientBundlerConfig: Rspack.Configuration = {
      name: 'client',
      output: {
        path: '/tmp/client',
        publicPath: '/',
        library: {
          type: 'commonjs2',
        },
      },
      optimization: {},
      plugins: [],
    };

    plugin.setup(api as any);
    expect(state.beforeCreateCompiler).toBeDefined();

    state.beforeCreateCompiler!({
      bundlerConfigs: [ssrBundlerConfig, clientBundlerConfig],
    });

    expect(ssrBundlerConfig.target).toBe('async-node');
    expect(ssrBundlerConfig.plugins?.length).toBeGreaterThan(0);
    expect(clientBundlerConfig.target).toBeUndefined();
    expect(clientBundlerConfig.plugins?.length).toBe(0);
    const exposedApi = (api.expose as ReturnType<typeof vi.fn>).mock.calls.find(
      ([name]) => name === RSBUILD_PLUGIN_MODULE_FEDERATION_NAME,
    )?.[1] as {
      options: {
        nodePlugin?: unknown;
        browserPlugin?: unknown;
      };
    };
    expect(exposedApi.options.nodePlugin).toBeDefined();
    expect(exposedApi.options.browserPlugin).toBeUndefined();
  });

  it('skips MF injection for non-selected MF-format environments', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
      environment: 'ssr',
    });
    const { api, state } = createMockApi({
      environments: {
        client: {},
        ssr: {},
      },
    });
    const ssrBundlerConfig: Rspack.Configuration = {
      name: 'ssr',
      output: {
        path: '/tmp/ssr',
        publicPath: '/',
        chunkFilename: 'chunks/[name].js',
        library: {
          type: 'commonjs2',
        },
      },
      optimization: {},
      plugins: [],
    };
    // No output.library => treated as MF format by isMFFormat.
    const clientBundlerConfig: Rspack.Configuration = {
      name: 'client',
      output: {
        path: '/tmp/client',
        publicPath: '/',
      },
      optimization: {},
      plugins: [],
    };

    plugin.setup(api as any);
    expect(state.beforeCreateCompiler).toBeDefined();

    state.beforeCreateCompiler!({
      bundlerConfigs: [ssrBundlerConfig, clientBundlerConfig],
    });

    expect(ssrBundlerConfig.target).toBe('async-node');
    expect(ssrBundlerConfig.plugins?.length).toBeGreaterThan(0);
    expect(clientBundlerConfig.target).toBeUndefined();
    expect(clientBundlerConfig.plugins?.length).toBe(0);
  });

  it('keeps target=dual restriction for non-rslib/non-rspress callers', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'dual',
    });
    const { api } = createMockApi({
      environments: {
        mf: {},
      },
    });

    expect(() => plugin.setup(api as any)).toThrow(
      "'target' option is only supported in Rslib.",
    );
  });

  it('preserves default mf environment behavior when no custom environment is provided', () => {
    const plugin = pluginModuleFederation(createMfOptions(), {
      target: 'node',
    });
    const { api, rsbuildConfig } = createMockApi(
      {
        environments: {
          mf: {},
        },
      },
      CALL_NAME_MAP.RSLIB,
    );

    plugin.setup(api as any);

    expect(rsbuildConfig.environments.mf.tools?.rspack).toBeDefined();
  });
});
