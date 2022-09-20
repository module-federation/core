// eslint-disable-next-line @typescript-eslint/no-var-requires
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
    if (!options.isServer) {
      config.plugins.push(
        new NextFederationPlugin({
          name: 'shop',
          filename: 'static/chunks/remoteEntry.js',
          remotes: {
            home: 'home@http://localhost:4200/_next/static/chunks/remoteEntry.js',
            shop: 'shop@http://localhost:4201/_next/static/chunks/remoteEntry.js',
            checkout:
              'checkout@http://localhost:4202/_next/static/chunks/remoteEntry.js',
          },
          exposes: {
            // pages
            './pages/shop/index': './pages/shop/index.js',
            './pages/shop/products/[...slug]':
              './pages/shop/products/[...slug].js',
            './pages/shop/test-webpack-png': './pages/shop/test-webpack-png.js',
            './pages/shop/test-webpack-svg': './pages/shop/test-webpack-svg.js',
            './pages/shop/exposed-pages': './pages/shop/exposed-pages.js',
            // components
            './useCustomRemoteHook': './components/useCustomRemoteHook.js',
            './WebpackSvg': './components/WebpackSvg.js',
            './WebpackPng': './components/WebpackPng.js',
            // utilities
            './pages/_menu': './pages/_menu.js',
            './pages-map': './pages-map.js',
          },
          extraOptions: {
            enableImageLoaderFix: true,
            enableUrlLoaderFix: true,
          },
        })
      );
    }
    return config;
  },
};

module.exports = withNx(nextConfig);
