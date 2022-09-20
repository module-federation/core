const NextFederationPlugin = require('@module-federation/nextjs-mf');
const {customPromise} = require('@module-federation/nextjs-mf/lib/utils')
const Template = require('webpack').Template
console.log(NextFederationPlugin);
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
            shop: customPromise(remotes.shop,Template, function() { new Promise((resolve, reject) => {
              console.log('runing other promise');
              setTimeout(() => {
                resolve('shop');
              } , 1000);
            })}),
            checkout: customPromise(remotes.checkout, Template),
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
