/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-check

const { withNx } = require('@nrwl/next/plugins/with-nx');
// const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // webpack(config, options) {
  //   if (!options.isServer) {
  //     config.plugins.push(
  //       new NextFederationPlugin({
  //         name: 'home',
  //         filename: 'static/chunks/remoteEntry.js',
  //         remotes: {
  //           home: 'home@http://localhost:3000/_next/static/chunks/remoteEntry.js',
  //           shop: 'shop@http://localhost:3001/_next/static/chunks/remoteEntry.js',
  //           checkout:
  //             'checkout@http://localhost:3002/_next/static/chunks/remoteEntry.js',
  //         },
  //         exposes: {
  //           './SharedNav': './components/SharedNav.js',
  //         },
  //         shared: {},
  //         extraOptions: {
  //           exposePages: true,
  //           enableImageLoaderFix: true,
  //           enableUrlLoaderFix: true,
  //         },
  //       })
  //     );
  //   }

  //   return config;
  // },
};

module.exports = withNx(nextConfig);
