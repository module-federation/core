const { withNx } = require('@nrwl/next/plugins/with-nx');

const NextFederationPlugin = require('@module-federation/nextjs-mf');
const {
  promiseTemplate,
} = require('@module-federation/nextjs-mf/utils/build-utils');
/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  async redirects() {
    return [{
      source: '/',
      destination: '/shop',
      permanent: true
    }];
  },
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  // swcMinify: true,
  webpack(config, options) {
    const { isServer } = options;

      config.plugins.push(
        new NextFederationPlugin({
          name: 'shop',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {

  // shop: promiseTemplate('global@url', (resolve,reject) => {}),
    home: promiseTemplate(
    // can also be a string if it needs to be computed in scope
    `(resolve, reject) => {
                resolve("home_app@http://localhost:3000/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js");
              }`,
    (resolve,reject)=>{
      console.log('runing other promise');
      setTimeout(() => {
        console.log('resolving promise');
        resolve();
      } , 1000);
    }),
            // home: `home_app@http://localhost:3000/_next/static/${
            //   isServer ? 'ssr' : 'chunks'
            // }/remoteEntry.js`,
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
            './menu': './components/menu',
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
    return config;
  },
};

module.exports = withNx(nextConfig);
