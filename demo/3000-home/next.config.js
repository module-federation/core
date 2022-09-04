const NextFederationPlugin = require('@module-federation/nextjs-mf/lib/NextFederationPlugin');

module.exports = {
  webpack(config, options) {
    const {isServer} = options
      config.plugins.push(
        new NextFederationPlugin({
          name: 'home_app',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            home: `home_app@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
            shop: `shop@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
            checkout:
              `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          },
          exposes: {
            './SharedNav': './components/SharedNav.js',
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
