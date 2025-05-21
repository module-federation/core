const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // Set this to true if you would like to to use SVGR
  // See: https://github.com/gregberge/svgr
  svgr: false,
  port: 4000,
  webpack(config, options) {
    const { isServer } = options;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    // used for testing build output snapshots
    const remotes = {
      remote_4001: `remote_4001@http://localhost:4001/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      checkout: `checkout@http://localhost:4000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      home_app: `home_app@http://localhost:3000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      shop: `shop@http://localhost:4000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    };

    config.plugins.push(
      new NextFederationPlugin({
        name: 'app_router_4000',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          remote_4001: remotes.remote_4001,
          home_app: remotes.home_app,
          // checkout: remotes.checkout,
        },
        shared: {
          // 'react': {
          //   singleton: true,
          //   requiredVersion: false
          // },
          // 'react-dom': {
          //   singleton: true,
          //   requiredVersion: false
          // }
        },
        extraOptions: {
          debug: false,
          exposePages: false,
          // enableImageLoaderFix: true,
          // enableUrlLoaderFix: true,
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
