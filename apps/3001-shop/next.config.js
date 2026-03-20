const withRspack = require('next-rspack');
const NextFederationPlugin = require('@module-federation/nextjs-mf');
const path = require('path');
const reactPath = path.dirname(require.resolve('react/package.json'));
const reactDomPath = path.dirname(require.resolve('react-dom/package.json'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ],
      },
    ];
  },
  webpack(config, options) {
    const { isServer } = options;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    config.plugins.push(
      new NextFederationPlugin({
        name: 'shop',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          home: `home_app@http://localhost:3000/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
          checkout: `checkout@http://localhost:3002/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
        },
        exposes: {
          './pages/shop/index': './pages/shop/index',
          './pages/shop/products/[...slug]': './pages/shop/products/[...slug]',
          './useCustomRemoteHook': './components/useCustomRemoteHook',
          './WebpackSvg': './components/WebpackSvg',
          './WebpackPng': './components/WebpackPng',
          './menu': './components/menu',
        },
        shared: {
          'lodash/': {},
          antd: {
            requiredVersion: '5.19.1',
            version: '5.19.1',
          },
          '@ant-design/': {
            singleton: true,
          },
        },
      }),
    );
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

module.exports = withRspack(nextConfig);
