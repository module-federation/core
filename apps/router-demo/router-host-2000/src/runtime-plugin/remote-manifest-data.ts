export const manifestJson = {
  id: 'remote1',
  name: 'remote1',
  metaData: {
    name: 'remote1',
    type: 'app',
    buildInfo: {
      buildVersion: '1.0.34',
      buildName: 'remote1',
    },
    remoteEntry: {
      name: 'static/js/remote1.js',
      path: '',
      type: 'global',
    },
    types: {
      path: '',
      name: '',
      zip: '@mf-types.zip',
      api: '@mf-types.d.ts',
    },
    globalName: 'remote1',
    pluginVersion: '0.8.9',
    prefetchInterface: false,
    publicPath: 'http://localhost:2001/',
  },
  shared: [],
  remotes: [],
  exposes: [
    {
      id: 'remote1:button',
      name: 'button',
      assets: {
        js: {
          sync: [
            'static/js/async/vendors-node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js.js',
            'static/js/async/__federation_expose_button.js',
          ],
          async: [],
        },
        css: {
          sync: [],
          async: [],
        },
      },
      path: './button',
    },
    {
      id: 'remote1:export-app',
      name: 'export-app',
      assets: {
        js: {
          sync: [
            'static/js/async/vendors-node_modules_pnpm_react_18_3_1_node_modules_react_jsx-dev-runtime_js.js',
            'static/js/async/vendors-node_modules_pnpm_antd_5_19_1_react-dom_18_3_1_react_18_3_1_node_modules_antd_es_imag-d838a2.js',
            'static/js/async/src_App_tsx.js',
            'static/js/async/__federation_expose_export_app.js',
          ],
          async: [],
        },
        css: {
          sync: [],
          async: [],
        },
      },
      path: './export-app',
    },
  ],
};
