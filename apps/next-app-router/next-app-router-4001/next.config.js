const { withNx } = require('@nx/next/plugins/with-nx');
const NextFederationPlugin = require('@module-federation/nextjs-mf');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  webpack(config, options) {
    const { isServer } = options;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };
    config.plugins.push(
      new NextFederationPlugin({
        name: 'remote_4001',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          // Core UI Components
          './Button': './ui/button',
          // './Header': isServer ? './ui/header?rsc' : './ui/header?shared',
          './Footer': './ui/footer',
          // './GlobalNav(rsc)': isServer ? './ui/global-nav?rsc' : './ui/global-nav',
          // './GlobalNav(ssr)': isServer ? './ui/global-nav?ssr' : './ui/global-nav',
          './GlobalNav': './ui/global-nav',
          //
          // // Product Related Components
          // './ProductCard': './ui/product-card',
          // './ProductPrice': './ui/product-price',
          // './ProductRating': './ui/product-rating',
          // './ProductDeal': './ui/product-deal',
          //
          // // Navigation Components
          // './TabGroup': './ui/tab-group',
          // './TabNavItem': './ui/tab-nav-item',
          //
          // // Utility Components
          // './Boundary': './ui/boundary',
          // './CountUp': './ui/count-up',
          // './RenderedTimeAgo': './ui/rendered-time-ago',
          // './RenderingInfo': './ui/rendering-info'
        },
        shared: {
          // 'react': {
          //   singleton: true,
          //   requiredVersion: false
          // },
          // 'react-dom': {
          //   singleton: true,
          //   requiredVersion: false
          // }
        },
        extraOptions: {
          debug: false,
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
        },
      }),
    );
    config.plugins.push({
      name: 'xxx',
      apply(compiler) {
        compiler.options.devtool = false;
      },
    });
    return config;
  },
};

module.exports = withNx(nextConfig);
