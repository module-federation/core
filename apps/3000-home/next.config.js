const { withNx } = require('@nrwl/next/plugins/with-nx');

const NextFederationPlugin = require('@module-federation/nextjs-mf');
const {
  promiseTemplate,
} = require('@module-federation/nextjs-mf/utils/build-utils');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },

  webpack(config, options) {
    const { isServer } = options;
      const remotes = {
        shop: `shop@http://localhost:3001/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,
        checkout: `checkout@http://localhost:3002/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,

      };
      if(isServer) {
        config.module.rules.push({
          test: /pages/,
          exclude: [/node_modules/,/_document/],
          use: [
            '@module-federation/async-boundary-loader',
          ]
        });
      }
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
          },
          shared: {
            lodash: {},
            antd: {},
          },
          extraOptions: {
            exposePages: true,
            enableImageLoaderFix: true,
            enableUrlLoaderFix: true,
            skipSharingNextInternals: false,
            automaticPageStitching: true,
          },
        })
      );
    return config;
  },
};

module.exports = withNx(nextConfig);
