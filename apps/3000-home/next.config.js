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
    // used for testing build output snapshots
    const remotes = {
      checkout: `checkout@http://localhost:3002/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      home_app: `home_app@http://localhost:3000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      shop: `shop@http://localhost:3001/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    };

    config.plugins.push(
      new NextFederationPlugin({
        name: 'home_app',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          shop: remotes.shop,
          checkout: remotes.checkout,
        },
        exposes: {
          './SharedNav': './components/SharedNav',
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
          debug: false,
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
        },
      }),
    );
    config.plugins.push({
      name: 'xxx',
      apply(compiler) {
        compiler.options.devtool = false;
      },
    });
    return config;
  },
};

module.exports = nextConfig;
