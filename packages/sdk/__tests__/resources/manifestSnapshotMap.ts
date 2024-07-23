import type { Stats, ModuleInfo } from '../../src/types';

const manifest: { [key: string]: Stats } = {
  ssrAppManifest: {
    id: '@mf/ssr-manifest-provider',
    name: '@mf/ssr-manifest-provider',
    metaData: {
      type: 'global',
      pluginVersion: '0.0.1',
      name: '@mf/ssr-manifest-provider',
      buildInfo: {
        buildVersion: '1.0.0.1517',
        buildName: 'ssr-manifest-provider',
      },
      ssrRemoteEntry: {
        name: 'federation-remote-entry.496985d3.js',
        path: 'server',
        type: 'commonjs-module',
      },
      remoteEntry: {
        name: 'federation-remote-entry.536985d3.js',
        path: '',
        type: 'global',
      },
      types: {
        name: 'index.d.ts',
        path: '',
        api: '@mf-types.d.ts',
        zip: '@mf-types.zip',
      },
      globalName: '__FEDERATION_@mf/ssr-manifest-provider:1.0.0.1517__',
      publicPath: 'https://__CDN_PREFIX__/ssr-manifest-provider/1.0.0.1517/',
    },
    shared: [],
    exposes: [
      {
        id: '@mf/ssr-manifest-provider:button',
        name: 'button',
        path: './button',
        requires: [],
        file: './src/button.tsx',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
    ],
    remotes: [],
  },
  prodAppManifest: {
    id: '@garfish/micro-app-sub2',
    name: '@garfish/micro-app-sub2',
    metaData: {
      name: '@garfish/micro-app-sub2',
      buildInfo: {
        buildVersion: '1.0.0.1517',
        buildName: 'garfish/module/sub2',
      },
      remoteEntry: {
        name: 'federation-remote-entry496985d3.js',
        path: '',
        type: 'global',
      },
      types: {
        name: 'index.d.ts',
        path: '',
        api: '@mf-types.d.ts',
        zip: '@mf-types.zip',
      },
      globalName: '__FEDERATION_@garfish/micro-app-sub2:1.0.0.1517__',
      publicPath: 'https://__CDN_PREFIX__/micro-app-sub2/1.0.0.1517/',
    },
    shared: [],
    remotes: [
      {
        version: '*',
        alias: 'micro-app-sub3',
        moduleName: 'shared-button',
        federationContainerName: '@garfish/micro-app-sub3',
        consumingFederationContainerName: '@garfish/micro-app-sub2',
        usedIn: ['src/App.tsx'],
      },
    ],
    exposes: [
      {
        id: '@garfish/micro-app-sub2:.',
        name: '.',
        path: '.',
        requires: [],
        file: './src/bootstrap.tsx',
        assets: {
          js: {
            sync: ['__federation_expose_defautl_export.js', '94.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:button',
        name: 'button',
        path: './button',
        requires: [],
        file: './src/button.tsx',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:dynamic-variable',
        name: 'dynamic-variable',
        path: './dynamic-variable',
        requires: [],
        file: './src/dynamic-variable.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:buildVersion',
        name: 'buildVersion',
        path: './buildVersion',
        requires: [],
        file: './src/build-version.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:counter',
        name: 'counter',
        path: './counter',
        requires: [],
        file: './src/counter.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
  },
  prodAppManifestWithGetPublicPath: {
    id: '@garfish/micro-app-sub3',
    name: '@garfish/micro-app-sub3',
    metaData: {
      name: '@garfish/micro-app-sub3',
      buildInfo: {
        buildVersion: '1.0.0.1513',
        buildName: 'garfish/module/sub3',
      },
      remoteEntry: {
        name: 'federation-remote-entryc26257dd.js',
        path: '',
        type: 'global',
      },
      types: {
        name: 'index.d.ts',
        path: '',
        api: '',
        zip: '',
      },
      globalName: '__FEDERATION_@garfish/micro-app-sub3:1.0.0.1513__',
      getPublicPath:
        "return 'https://xxx.com/__FEDERATION_micro-app-sub3/1.0.0.1513/'",
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: '@garfish/micro-app-sub3:react',
        name: 'react',
        path: './react',
        requires: [],
        file: './src/exposes/react.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_react.233fdc6d66f893bf299e.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:react-dom',
        name: 'react-dom',
        path: './react-dom',
        requires: [],
        file: './src/exposes/react-dom.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_dom.d6aa6634718653634808.js',
              '197.3aacd0f0d8df28f0c16d.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:react-router-dom',
        name: 'react-router-dom',
        path: './react-router-dom',
        requires: [],
        file: './src/exposes/react-router-dom.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_router_dom.2abbd85882edf70e8c29.js',
              '486.ff01665190ad96f3d058.js',
            ],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:arco-design-web-react',
        name: 'arco-design-web-react',
        path: './arco-design-web-react',
        requires: [],
        file: './src/exposes/arco-design-web-react.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_arco_design_web_react.4e70fa1137386c70bdb4.js',
              '197.3aacd0f0d8df28f0c16d.js',
              '361.31f98c27b3fa9b07ffbd.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:shared-button',
        name: 'shared-button',
        path: './shared-button',
        requires: [],
        file: './src/button.tsx',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_shared_button.df714ec8741ce3c14592.js',
              '988.78d3a5695ac9b854d947.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
  },
  devAppManifest: {
    id: '@garfish/micro-app-sub2',
    name: '@garfish/micro-app-sub2',
    metaData: {
      name: '@garfish/micro-app-sub2',
      buildInfo: {
        buildVersion: 'local',
        buildName: '',
      },
      remoteEntry: {
        name: 'federation-remote-entry.js',
        path: '',
        type: 'global',
      },
      types: {
        name: 'index.d.ts',
        path: '',
        api: '',
        zip: '',
      },
      globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
      publicPath: 'http://localhost:2004/',
    },
    shared: [],
    remotes: [
      {
        entry: 'http://localhost:2005/vmok-manifest.json',
        alias: 'micro-app-sub3',
        moduleName: 'shared-button',
        federationContainerName: '@garfish/micro-app-sub3',
        consumingFederationContainerName: '@garfish/micro-app-sub2',
        usedIn: ['src/App.tsx'],
      },
      {
        version: '1.0.2',
        alias: 'micro-app-sub4',
        moduleName: 'shared-button',
        federationContainerName: '@garfish/micro-app-sub4',
        consumingFederationContainerName: '@garfish/micro-app-sub2',
        usedIn: ['src/App.tsx'],
      },
    ],
    exposes: [
      {
        id: '@garfish/micro-app-sub2:.',
        name: '.',
        path: '.',
        requires: [],
        file: './src/bootstrap.tsx',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:button',
        name: 'button',
        path: './button',
        requires: [],
        file: './src/button.tsx',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:dynamic-variable',
        name: 'dynamic-variable',
        path: './dynamic-variable',
        requires: [],
        file: './src/dynamic-variable.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:buildVersion',
        name: 'buildVersion',
        path: './buildVersion',
        requires: [],
        file: './src/build-version.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub2:counter',
        name: 'counter',
        path: './counter',
        requires: [],
        file: './src/counter.ts',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
  },
  devAppManifestWithGetPublicPath: {
    id: '@garfish/micro-app-sub3',
    name: '@garfish/micro-app-sub3',
    metaData: {
      name: '@garfish/micro-app-sub3',
      buildInfo: {
        buildVersion: 'local',
        buildName: '',
      },
      remoteEntry: {
        name: 'federation-remote-entry.js',
        path: '',
        type: 'global',
      },
      types: {
        name: 'index.d.ts',
        path: '',
        api: '',
        zip: '',
      },
      globalName: '__FEDERATION_@garfish/micro-app-sub3:local__',
      getPublicPath: "return 'http://localhost:2005/'",
    },
    shared: [],
    remotes: [],
    exposes: [
      {
        id: '@garfish/micro-app-sub3:react',
        name: 'react',
        path: './react',
        requires: [],
        file: './src/exposes/react.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react.368935bfb75347399cb0.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:react-dom',
        name: 'react-dom',
        path: './react-dom',
        requires: [],
        file: './src/exposes/react-dom.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_dom.43adc22317d1326f0145.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-dom_17_0_2_react_17_0_2_node_modules_react-do-a09e10.c028e337bfd7230980df.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:react-router-dom',
        name: 'react-router-dom',
        path: './react-router-dom',
        requires: [],
        file: './src/exposes/react-router-dom.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_router_dom.416aa4fda7775f22e4b1.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-router-dom_6_3_0_sfoxds7t5ydpegc3knd667wn6m_n-3afd7e.73c7fab88038fb3560b5.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:arco-design-web-react',
        name: 'arco-design-web-react',
        path: './arco-design-web-react',
        requires: [],
        file: './src/exposes/arco-design-web-react.ts',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_arco_design_web_react.dbb1e6340eff7496e323.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-dom_17_0_2_react_17_0_2_node_modules_react-do-a09e10.c028e337bfd7230980df.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-c0e521.1a90ede599c583bdf8a1.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        id: '@garfish/micro-app-sub3:shared-button',
        name: 'shared-button',
        path: './shared-button',
        requires: [],
        file: './src/button.tsx',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_shared_button.d36f63d0dd15464577f0.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_lodash_4_17_21_node_modules_lodash_lodash_js.ad738e23b192970ace86.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
  },
};

const snapshot: { [key: string]: ModuleInfo } = {
  devAppSnapshot: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: 'http://localhost:2005/vmok-manifest.json',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: '1.0.2',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithVersion: {
    version: 'http://localhost:2006/vmok-manifest.json',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: 'http://localhost:2005/vmok-manifest.json',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: '1.0.2',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithGetPublicPath: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub3:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {},
    shared: [],
    modules: [
      {
        moduleName: 'react',
        modulePath: './react',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react.368935bfb75347399cb0.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'react-dom',
        modulePath: './react-dom',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_dom.43adc22317d1326f0145.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-dom_17_0_2_react_17_0_2_node_modules_react-do-a09e10.c028e337bfd7230980df.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'react-router-dom',
        modulePath: './react-router-dom',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_router_dom.416aa4fda7775f22e4b1.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-router-dom_6_3_0_sfoxds7t5ydpegc3knd667wn6m_n-3afd7e.73c7fab88038fb3560b5.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'arco-design-web-react',
        modulePath: './arco-design-web-react',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_arco_design_web_react.dbb1e6340eff7496e323.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react-dom_17_0_2_react_17_0_2_node_modules_react-do-a09e10.c028e337bfd7230980df.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-c0e521.1a90ede599c583bdf8a1.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'shared-button',
        modulePath: './shared-button',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_shared_button.d36f63d0dd15464577f0.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_react_17_0_2_node_modules_react_index_js.19345156b9167fd411b5.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_lodash_4_17_21_node_modules_lodash_lodash_js.ad738e23b192970ace86.js',
            ],
            async: ['src_testK_ts.5fe32394d3703d02c2ac.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    getPublicPath: "return 'http://localhost:2005/'",
  },
  prodAppSnapshot: {
    version: '',
    buildVersion: '1.0.0.1517',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:1.0.0.1517__',
    remoteEntry: 'federation-remote-entry496985d3.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '@mf-types.d.ts',
    remoteTypesZip: '@mf-types.zip',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '*',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: ['__federation_expose_defautl_export.js', '94.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'https://__CDN_PREFIX__/micro-app-sub2/1.0.0.1517/',
  },
  prodAppSnapshotWithGetPublicPath: {
    version: '',
    buildVersion: '1.0.0.1513',
    globalName: '__FEDERATION_@garfish/micro-app-sub3:1.0.0.1513__',
    remoteEntry: 'federation-remote-entryc26257dd.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {},
    shared: [],
    modules: [
      {
        moduleName: 'react',
        modulePath: './react',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_react.233fdc6d66f893bf299e.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'react-dom',
        modulePath: './react-dom',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_dom.d6aa6634718653634808.js',
              '197.3aacd0f0d8df28f0c16d.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'react-router-dom',
        modulePath: './react-router-dom',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_react_router_dom.2abbd85882edf70e8c29.js',
              '486.ff01665190ad96f3d058.js',
            ],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'arco-design-web-react',
        modulePath: './arco-design-web-react',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_arco_design_web_react.4e70fa1137386c70bdb4.js',
              '197.3aacd0f0d8df28f0c16d.js',
              '361.31f98c27b3fa9b07ffbd.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'shared-button',
        modulePath: './shared-button',
        assets: {
          js: {
            sync: [
              '__FEDERATION_expose_shared_button.df714ec8741ce3c14592.js',
              '988.78d3a5695ac9b854d947.js',
            ],
            async: ['140.f2d7c24837746b44dbd3.js'],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    getPublicPath:
      "return 'https://xxx.com/__FEDERATION_micro-app-sub3/1.0.0.1513/'",
  },
  ssrProdAppSnapshotWithAllParams: {
    version: '',
    buildVersion: '1.0.0.1517',
    globalName: '__FEDERATION_@mf/ssr-manifest-provider:1.0.0.1517__',
    ssrRemoteEntry: 'server/federation-remote-entry.496985d3.js',
    remoteEntry: 'federation-remote-entry.536985d3.js',
    remoteEntryType: 'global',
    ssrRemoteEntryType: 'commonjs-module',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '@mf-types.d.ts',
    remoteTypesZip: '@mf-types.zip',
    remotesInfo: {},
    shared: [],
    modules: [
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
    ],
    publicPath: 'https://__CDN_PREFIX__/ssr-manifest-provider/1.0.0.1517/',
  },
  prodAppSnapshotWithAllParams: {
    version: '',
    buildVersion: '1.0.0.1517',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:1.0.0.1517__',
    remoteEntry: 'federation-remote-entry496985d3.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '@mf-types.d.ts',
    remoteTypesZip: '@mf-types.zip',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.4',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: 'http://localhost:8080/vmok-manifest.json',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: ['__federation_expose_defautl_export.js', '94.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['426.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'https://__CDN_PREFIX__/micro-app-sub2/1.0.0.1517/',
  },
  devAppSnapshotWithOverrides: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.3',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: 'http://localhost:8080/vmok-manifest.json',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithRemotes: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.3',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: '1.2.3',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithPartRemotes: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.3',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithAllParams: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.4',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: 'http://localhost:8080/vmok-manifest.json',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
  devAppSnapshotWithRemotesAndOverrides: {
    version: '',
    buildVersion: 'local',
    globalName: '__FEDERATION_@garfish/micro-app-sub2:local__',
    remoteEntry: 'federation-remote-entry.js',
    remoteEntryType: 'global',
    remoteTypes: 'index.d.ts',
    remoteTypesAPI: '',
    remoteTypesZip: '',
    remotesInfo: {
      '@garfish/micro-app-sub3': {
        matchedVersion: '1.0.4',
      },
      '@garfish/micro-app-sub4': {
        matchedVersion: 'http://localhost:8080/vmok-manifest.json',
      },
    },
    shared: [],
    modules: [
      {
        moduleName: '.',
        modulePath: '.',
        assets: {
          js: {
            sync: [
              '__federation_expose_defautl_export.js',
              'vendors-_eden-mono_temp_node_modules_pnpm_arco-design_web-react_2_45_0_sfoxds7t5ydpegc3knd667-79fd1b.js',
            ],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__federation_expose_defautl_export.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'button',
        modulePath: './button',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_button.js'],
            async: ['src_test_json.js'],
          },
          css: {
            sync: ['__FEDERATION_expose_button.css'],
            async: [],
          },
        },
      },
      {
        moduleName: 'dynamic-variable',
        modulePath: './dynamic-variable',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_dynamic_variable.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'buildVersion',
        modulePath: './buildVersion',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_buildVersion.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
      {
        moduleName: 'counter',
        modulePath: './counter',
        assets: {
          js: {
            sync: ['__FEDERATION_expose_counter.js'],
            async: [],
          },
          css: {
            sync: [],
            async: [],
          },
        },
      },
    ],
    publicPath: 'http://localhost:2004/',
  },
};

export { manifest, snapshot };
