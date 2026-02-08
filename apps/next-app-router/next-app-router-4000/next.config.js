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

    config.plugins.push({
      name: 'xxx',
      apply(compiler) {
        compiler.options.devtool = false;
      },
    });

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
  runtime: {
    onRemoteFailure: 'null-fallback',
  },
  diagnostics: {
    level: 'warn',
  },
});
