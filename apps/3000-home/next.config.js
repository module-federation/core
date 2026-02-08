const { withNextFederation } = require('@module-federation/nextjs-mf');
const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

/** @type {import('next').NextConfig} */
const baseConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, options) {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };

    config.plugins.push({
      name: 'nx-dev-webpack-plugin',
      apply(compiler) {
        compiler.options.devtool = false;
        compiler.options.resolve.alias = {
          ...compiler.options.resolve.alias,
          react: reactPath,
          'react-dom': reactDomPath,
        };
      },
    });

    return config;
  },
};

module.exports = withNextFederation(baseConfig, {
  name: 'home_app',
  mode: 'pages',
  filename: 'static/chunks/remoteEntry.js',
  remotes: ({ isServer }) => ({
    shop: `shop@http://localhost:3001/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
    checkout: `checkout@http://localhost:3002/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
  }),
  exposes: {
    './SharedNav': './components/SharedNav',
    './menu': './components/menu',
  },
  shared: {
    'lodash/': {},
    '@ant-design/cssinjs': {
      singleton: true,
      requiredVersion: false,
      eager: true,
    },
    antd: {
      requiredVersion: '5.19.1',
      version: '5.19.1',
    },
    '@ant-design/': {
      singleton: true,
    },
  },
  pages: {
    exposePages: true,
    pageMapFormat: 'routes-v2',
  },
  runtime: {
    onRemoteFailure: 'null-fallback',
  },
  diagnostics: {
    level: 'warn',
  },
});
