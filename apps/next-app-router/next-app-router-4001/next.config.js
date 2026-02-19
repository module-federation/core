process.env.FEDERATION_WEBPACK_PATH =
  process.env.FEDERATION_WEBPACK_PATH ||
  require.resolve('next/dist/compiled/webpack/webpack-lib');

const { withNextFederation } = require('@module-federation/nextjs-mf');

/** @type {import('next').NextConfig} */
const baseConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.watchOptions = {
      ignored: ['**/node_modules/**', '**/@mf-types/**'],
    };

    return config;
  },
};

module.exports = withNextFederation(baseConfig, {
  name: 'remote_4001',
  mode: 'app',
  filename: 'static/chunks/remoteEntry.js',
  remotes: ({ isServer }) => ({
    remote_4001: `remote_4001@http://localhost:4001/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
  }),
  exposes: {
    './Button': './ui/button',
    './Header': './ui/header',
    './Footer': './ui/footer',
    './GlobalNav': './ui/global-nav',
    './ProductCard': './ui/product-card',
    './TabGroup': './ui/tab-group',
    './TabNavItem': './ui/tab-nav-item',
    './CountUp': './ui/count-up',
    './RenderingInfo': './ui/rendering-info',
  },
  app: {
    enableClientComponents: true,
    enableRsc: true,
  },
  dts: false,
  runtime: {
    onRemoteFailure: 'null-fallback',
  },
  diagnostics: {
    level: 'warn',
  },
});
