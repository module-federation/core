const NextFederationPlugin = require('@module-federation/nextjs-mf/lib/NextFederationPlugin');

module.exports = {
  webpack(config, options) {
    const { webpack, isServer } = options;
    Object.assign(config.experiments, { topLevelAwait: true });
      config.plugins.push(
        new NextFederationPlugin({
          name: 'checkout',
          remotes: {
            home: `home_app@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
            shop: `shop@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
            checkout:
              `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          },
          filename: 'static/chunks/remoteEntry.js',
          exposes: {
            './CheckoutTitle': './src/components/CheckoutTitle.js',
            './ButtonOldAnt': './src/components/ButtonOldAnt.js',
          },
          shared: {},
          extraOptions: {
            exposePages: true,
            enableImageLoaderFix: true,
            enableUrlLoaderFix: true,
          },
        })
      );

    return config;
  },
};
