const NextFederationPlugin = require('@module-federation/nextjs-mf');
const webpack = require('webpack');
const path = require('path');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // Disable TypeScript type checking to prevent build errors
  typescript: {
    // !! WARN !!
    // Turning this option on allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack(config, options) {
    const { isServer } = options;

    // Disable module ID optimization - keep readable names
    config.optimization = config.optimization || {};
    config.optimization.moduleIds = 'named';
    config.optimization.chunkIds = 'named';
    config.devtool = false;
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };

    // Replace relative imports of router-context.shared-runtime with absolute path
    // config.plugins.push(
    //   new webpack.NormalModuleReplacementPlugin(
    //     /router-context\.shared-runtime/,
    //     function(resource) {
    //       const originalRequest = resource.request; // e.g., 'next/dist/shared/lib/router-context.shared-runtime'
    //       // Use require.resolve to get the actual path for router-context
    //       const newRequest = require.resolve('next/dist/shared/lib/router-context.shared-runtime');
    //
    //       if (originalRequest === newRequest) {
    //         return;
    //       }
    //
    //       // if (resource.contextInfo && resource.contextInfo.issuer) {
    //       //   const issuer = resource.contextInfo.issuer;
    //       // }
    //
    //       console.log('[Module Replacement] Router context module:', originalRequest);
    //       resource.request = newRequest;
    //       console.log(
    //         `[Module Replacement] Replaced "${originalRequest}" with "${newRequest}"`
    //       );
    //     }
    //   )
    // );

    config.cache = false;
    config.plugins.push(
      new NextFederationPlugin({
        name: 'remote_4001',
        filename: 'static/chunks/remoteEntry.js',
        exposes: {
          // Core UI Components
          './Button': './rsc/button',
          './ssr/Button': './classic/button',
          // './Header': isServer ? './ui/header?rsc' : './ui/header?shared',
          // './Footer': './ui/footer',
          // './GlobalNav(rsc)': isServer ? './ui/global-nav?rsc' : './ui/global-nav',
          // './GlobalNav(ssr)': isServer ? './ui/global-nav?ssr' : './ui/global-nav',
          // './GlobalNav': './ui/global-nav',
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
          exposePages: false,
          enableImageLoaderFix: false,
          enableUrlLoaderFix: false,
        },
      }),
    );
    config.plugins.push({
      name: 'xxx',
      apply(compiler) {
        compiler.options.devtool = false;
        compiler.options.optimization.minimize = false;
        compiler.options.optimization.moduleIds = 'named';
        compiler.options.optimization.chunkIds = 'named';
      },
    });
    return config;
  },
};

module.exports = nextConfig;
