const withRspack = require('next-rspack');
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
      home_app: `home_app@http://localhost:4000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      shop: `shop@http://localhost:4000/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    };

    config.plugins.push(
      // Experimental quarantine only: wave 1 does not claim App Router support.
      new NextFederationPlugin({
        name: 'home_app',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          remote_4001: remotes.remote_4001,
          shop: remotes.shop,
          checkout: remotes.checkout,
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

module.exports = withRspack(nextConfig);
