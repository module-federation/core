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
  name: 'home_app',
  mode: 'app',
  filename: 'static/chunks/remoteEntry.js',
  remotes: ({ isServer }) => ({
    remote_4001: `remote_4001@http://localhost:4001/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
    shop: `shop@http://localhost:4000/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
    checkout: `checkout@http://localhost:4000/_next/static/${
      isServer ? 'ssr' : 'chunks'
    }/remoteEntry.js`,
  }),
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
