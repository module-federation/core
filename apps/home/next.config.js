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
    const { isServer } = options;
    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'home_app',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            // Failing to add this entry, causes '/exposed-pages' route
            // to throw error.
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
    }
    return config;
  },
};

module.exports = withNx(nextConfig);
