/* eslint-disable no-undef */
if (!window.__FEDERATION__) {
  window.__FEDERATION__ = {};
}
window.targetTab = null;
window.__FEDERATION__.moduleInfo = {
  manifest_host: {
    version: '',
    remoteEntry: '',
    remotesInfo: {
      webpack_provider: {
        matchedVersion: 'http://localhost:3009/mf-manifest.json',
      },
      rspack_manifest_provider: {
        matchedVersion: 'http://localhost:3011/mf-manifest.json',
      },
      rspack_provider: {
        matchedVersion: 'http://localhost:3010/mf-manifest.json',
      },
    },
  },
  'webpack_provider:http://localhost:3009/mf-manifest.json': {
    version: 'http://localhost:3009/mf-manifest.json',
    buildVersion: 'local',
    globalName: 'webpack_provider',
    remoteEntry: 'remoteEntry.js',
    remoteEntryType: 'global',
    remoteTypes: '',
    remotesInfo: {},
    shared: [
      {
        version: '1.0.0',
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.06b18ff53c9ed8df.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
            sync: [
              'node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_client_js.6c1fb801553c9058.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom/client',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
            sync: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.06b18ff53c9ed8df.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
            sync: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_jsx-dev-runtime_js.7d450774c6be9bc2.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react/jsx-dev-runtime',
      },
      {
        assets: {
          js: {
            async: [],
            sync: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react',
      },
    ],
    modules: [
      {
        moduleName: 'useCustomRemoteHook',
        modulePath: './useCustomRemoteHook',
        assets: {
          js: {
            sync: [
              '__federation_expose_useCustomRemoteHook.1c1944da84032dcb.js',
            ],
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'WebpackSvg',
        modulePath: './WebpackSvg',
        assets: {
          js: {
            sync: ['__federation_expose_WebpackSvg.5f5d2a458701e92e.js'],
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_jsx-dev-runtime_js.7d450774c6be9bc2.js',
            ],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'WebpackPng',
        modulePath: './WebpackPng',
        assets: {
          js: {
            sync: ['__federation_expose_WebpackPng.dfdb5dfddf37ee30.js'],
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_jsx-dev-runtime_js.7d450774c6be9bc2.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.b369bcfb7fa52b5a.js',
            ],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:3009/',
  },
  'rspack_manifest_provider:http://localhost:3011/mf-manifest.json': {
    version: 'http://localhost:3011/mf-manifest.json',
    buildVersion: 'local',
    globalName: 'rspack_manifest_provider',
    remoteEntry: 'remoteEntry.js',
    remoteEntryType: 'global',
    remoteTypes: '',
    remotesInfo: {},
    shared: [
      {
        assets: {
          js: {
            async: [],
            sync: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
            sync: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
            sync: [
              'node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_client_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom/client',
      },
    ],
    modules: [
      {
        moduleName: 'Component',
        modulePath: './Component',
        assets: {
          js: {
            sync: [
              'vendors-node_modules_pnpm_antd_4_24_15_react-dom_18_2_0_react_18_2_0_node_modules_antd_es_ind-4fb8b6.js',
              '__federation_expose_Component.js',
            ],
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
              'src_asyncFile_ts.js',
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
            ],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:3011/',
  },
  'rspack_provider:http://localhost:3010/mf-manifest.json': {
    version: 'http://localhost:3010/mf-manifest.json',
    buildVersion: 'local',
    globalName: 'rspack_provider',
    remoteEntry: 'remoteEntry.js',
    remoteEntryType: 'global',
    remoteTypes: '',
    remotesInfo: {},
    shared: [
      {
        assets: {
          js: {
            async: [],
            sync: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
            sync: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
            sync: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_jsx-dev-runtime_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react/jsx-dev-runtime',
      },
      {
        assets: {
          js: {
            async: [
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
            ],
            sync: [
              'node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_client_js.js',
            ],
          },
          css: {
            async: [],
            sync: [],
          },
        },
        sharedName: 'react-dom/client',
      },
    ],
    modules: [
      {
        moduleName: 'ButtonOldAnt',
        modulePath: './ButtonOldAnt',
        assets: {
          js: {
            sync: [
              'vendors-node_modules_pnpm_antd_4_24_15_react-dom_18_2_0_react_18_2_0_node_modules_antd_lib_bu-5a4809.js',
              '__federation_expose_ButtonOldAnt.js',
            ],
            async: [
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_jsx-dev-runtime_js.js',
              'src_bootstrap_tsx.js',
              'vendors-node_modules_pnpm_react_18_2_0_node_modules_react_index_js.js',
              'vendors-node_modules_pnpm_react-dom_18_2_0_react_18_2_0_node_modules_react-dom_index_js.js',
            ],
          },
          css: {
            sync: ['__federation_expose_ButtonOldAnt.css'],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:3010/',
  },
};
window.__FEDERATION__.originModuleInfo = window.__FEDERATION__.moduleInfo;
window.__FEDERATION__.__SHARE__ = {
  '@vmok-e2e/edenx-demo-app1:1.0.0.6867': {
    default: {
      'react-dom': {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app1'],
          from: '@vmok-e2e/edenx-demo-app1',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: true,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
      react: {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app1', '@vmok-e2e/edenx-demo-app2'],
          from: '@vmok-e2e/edenx-demo-app1',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: true,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
      version: '0.0.6255',
      axios: {
        '0.24.0': {
          deps: [],
          useIn: [],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: null,
          version: '0.24.0',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^0.24.0',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
        },
      },
      'react-dom/client': {
        '18.3.1': {
          deps: [],
          useIn: [],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: null,
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
        },
      },
      'react/jsx-runtime': {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app2'],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
    },
  },
  '@vmok-e2e/edenx-demo-app2:1.0.0.6800': {
    default: {
      'react-dom': {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app1'],
          from: '@vmok-e2e/edenx-demo-app1',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: true,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
      react: {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app1', '@vmok-e2e/edenx-demo-app2'],
          from: '@vmok-e2e/edenx-demo-app1',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: true,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
      version: '0.0.6255',
      axios: {
        '0.24.0': {
          deps: [],
          useIn: [],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: null,
          version: '0.24.0',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^0.24.0',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
        },
      },
      'react-dom/client': {
        '18.3.1': {
          deps: [],
          useIn: [],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: null,
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
        },
      },
      'react/jsx-runtime': {
        '18.3.1': {
          deps: [],
          useIn: ['@vmok-e2e/edenx-demo-app2'],
          from: '@vmok-e2e/edenx-demo-app2',
          loading: {},
          version: '18.3.1',
          get: 'Function',
          scope: ['default'],
          shareConfig: {
            requiredVersion: '^18.3.1',
            singleton: true,
            eager: false,
            strictVersion: false,
            layer: null,
          },
          strategy: 'loaded-first',
          loaded: true,
          lib: 'Function',
        },
      },
    },
  },
  default: {
    'react-dom': {
      '18.3.1': {
        deps: [],
        useIn: ['@vmok-e2e/edenx-demo-app1'],
        from: '@vmok-e2e/edenx-demo-app1',
        loading: {},
        version: '18.3.1',
        get: 'Function',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: true,
          strictVersion: false,
          layer: null,
        },
        strategy: 'loaded-first',
        loaded: true,
        lib: 'Function',
      },
    },
    react: {
      '18.3.1': {
        deps: [],
        useIn: ['@vmok-e2e/edenx-demo-app1', '@vmok-e2e/edenx-demo-app2'],
        from: '@vmok-e2e/edenx-demo-app1',
        loading: {},
        version: '18.3.1',
        get: 'Function',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: true,
          strictVersion: false,
          layer: null,
        },
        strategy: 'loaded-first',
        loaded: true,
        lib: 'Function',
      },
    },
    version: '0.0.6255',
    axios: {
      '0.24.0': {
        deps: [],
        useIn: [],
        from: '@vmok-e2e/edenx-demo-app2',
        loading: null,
        version: '0.24.0',
        get: 'Function',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^0.24.0',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: null,
        },
        strategy: 'loaded-first',
      },
    },
    'react-dom/client': {
      '18.3.1': {
        deps: [],
        useIn: [],
        from: '@vmok-e2e/edenx-demo-app2',
        loading: null,
        version: '18.3.1',
        get: 'Function',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: null,
        },
        strategy: 'loaded-first',
      },
    },
    'react/jsx-runtime': {
      '18.3.1': {
        deps: [],
        useIn: ['@vmok-e2e/edenx-demo-app2'],
        from: '@vmok-e2e/edenx-demo-app2',
        loading: {},
        version: '18.3.1',
        get: 'Function',
        scope: ['default'],
        shareConfig: {
          requiredVersion: '^18.3.1',
          singleton: true,
          eager: false,
          strictVersion: false,
          layer: null,
        },
        strategy: 'loaded-first',
        loaded: true,
        lib: 'Function',
      },
    },
  },
};
export default window.__FEDERATION__;
