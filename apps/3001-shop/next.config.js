const { withNx } = require('@nrwl/next/plugins/with-nx');

const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // swcMinify: true,
  webpack(config, options) {
    const { isServer } = options;

    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'shop',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            home: `home_app@http://localhost:3000/_next/static/${
              isServer ? 'ssr' : 'chunks'
            }/remoteEntry.js`,
            shop: `shop@http://localhost:3001/_next/static/${
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
          },
          shared: {
            lodash: {},
          },
          extraOptions: {
            exposePages: true,
            enableImageLoaderFix: true,
            enableUrlLoaderFix: true,
            automaticPageStitching: true,
          },
        })
      );
    }
    return config;
  },
};

module.exports = withNx(nextConfig);
