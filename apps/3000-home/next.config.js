const { withNx } = require('@nx/next/plugins/with-nx');
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
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
          antd: {
            requiredVersion: '5.19.1',
            version: '5.19.1',
          },
          '@ant-design/': {
            singleton: true,
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

module.exports = withNx(nextConfig);
