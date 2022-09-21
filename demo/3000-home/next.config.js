const NextFederationPlugin = require('@module-federation/nextjs-mf');
const {promiseTemplate, promiseFactory} = require('@module-federation/nextjs-mf/lib/build-utils');

module.exports = {
  webpack(config, options) {
    const { isServer } = options;
    if (!options.isServer) {
      const remotes = {
        shop: `shop@http://localhost:3001/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,
        checkout: `checkout@http://localhost:3002/_next/static/${
          isServer ? 'ssr' : 'chunks'
        }/remoteEntry.js`,
      }
      config.plugins.push(
        new NextFederationPlugin({
          name: 'home_app',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            shop: promiseTemplate(
              // can also be a string if it needs to be computed in scope
              `(resolve, reject) => {
                resolve("${remotes.shop}");
              }`,
              (resolve,reject)=>{
              console.log('runing other promise');
              setTimeout(() => {
                console.log('resolving promise');
                resolve();
              } , 1000);
            }),
            checkout: remotes.checkout,
          },
          exposes: {
            './SharedNav': './components/SharedNav.js',
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
