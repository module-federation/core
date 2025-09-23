const NextFederationPlugin = require('@module-federation/nextjs-mf');
/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
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
          './useCustomRemoteHook': './components/useCustomRemoteHook',
          './WebpackSvg': './components/WebpackSvg',
          './WebpackPng': './components/WebpackPng',
          './menu': './components/menu',
        },
        shared: {
          'lodash/': {},
          // Ensure a single React across host/remotes and prevent local fallbacks
          react: { singleton: true, requiredVersion: false, import: false },
          'react-dom': {
            singleton: true,
            requiredVersion: false,
            import: false,
          },
          'react/jsx-runtime': {
            singleton: true,
            requiredVersion: false,
            import: false,
          },
          antd: {
            requiredVersion: '5.19.1',
            version: '5.19.1',
          },
          '@ant-design/cssinjs': { singleton: true, requiredVersion: false },
          '@ant-design/': {
            singleton: true,
          },
          '@tanstack/': {
            singleton: true,
          },
          '@tanstack/react-query': {
            singleton: true,
            requiredVersion: false,
          },
          '@tanstack/query-core': {
            singleton: true,
            requiredVersion: false,
          },
        },
        extraOptions: {
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          automaticPageStitching: false,
        },
      }),
    );
    return config;
  },
};

module.exports = nextConfig;
