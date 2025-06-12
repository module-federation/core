const NextFederationPlugin = require('@module-federation/nextjs-mf');

const nextConfig = {
  webpack(config, options) {
    const { isServer } = options;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    config.plugins.push(
      new NextFederationPlugin({
        name: 'checkout',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          home: `home_app@http://localhost:3000/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
          shop: `shop@http://localhost:3001/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
        },
        exposes: {
          './CheckoutTitle': './components/CheckoutTitle',
          './ButtonOldAnt': './components/ButtonOldAnt',
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
