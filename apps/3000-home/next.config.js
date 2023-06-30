const { registerPluginTSTranspiler } = require('nx/src/utils/nx-plugin.js');

registerPluginTSTranspiler();
const { withNx } = require('@nx/next/plugins/with-nx');
const { createDelegatedModule } = require('@module-federation/utilities');
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

    const remotes = {
      shop: createDelegatedModule(require.resolve('./remote-delegate.js'), {
        remote: `shop@http://localhost:3001/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,
      }),
      // checkout: createDelegatedModule(require.resolve('./remote-delegate.js'), {
      //   remote: `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
      // }),
      // shop: `shop@http://localhost:3001/_next/static/${
      //   isServer ? 'ssr' : 'chunks'
      // }/remoteEntry.js`,
      checkout: `checkout@http://localhost:3002/_next/static/${
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
          lodash: {},
          antd: {},
        },
        extraOptions: {
          automaticAsyncBoundary: true,
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          skipSharingNextInternals: false,
          automaticPageStitching: false,
        },
      })
    );
    return config;
  },
};

module.exports = withNx(nextConfig);
