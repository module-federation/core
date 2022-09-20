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
  webpack(config, options) {
    const { webpack, isServer } = options;

    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'checkout',
          remotes: {
            home: `home_app@http://localhost:4200/_next/static/${
              isServer ? 'ssr' : 'chunks'
            }/remoteEntry.js`,
            shop: `shop@http://localhost:4201/_next/static/${
              isServer ? 'ssr' : 'chunks'
            }/remoteEntry.js`,
            checkout: `checkout@http://localhost:4202/_next/static/${
              isServer ? 'ssr' : 'chunks'
            }/remoteEntry.js`,
          },
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './CheckoutTitle': './components/CheckoutTitle.js',
            './ButtonOldAnt': './components/ButtonOldAnt.js',
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
