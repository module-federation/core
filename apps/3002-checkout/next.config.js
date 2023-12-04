const { withNx } = require('@nx/next/plugins/with-nx');
const { workspaceRoot } = require('nx/src/utils/workspace-root');

const path = require('path');
const { registerTsConfigPaths } = require('nx/src/plugins/js/utils/register');
registerTsConfigPaths(path.join(workspaceRoot, 'tsconfig.tmp.json'));
const NextFederationPlugin = require('@module-federation/nextjs-mf');

// const { createDelegatedModule } = require('@module-federation/nextjs-mf/utilities');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  webpack(config, options) {
    const { isServer } = options;

    config.plugins.push(
      new NextFederationPlugin({
        name: 'checkout',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          // home: createDelegatedModule(require.resolve('./remote-delegate.js'), {
          //   remote: `home_app@http://localhost:3000/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          // }),
          // shop: createDelegatedModule(require.resolve('./remote-delegate.js'), {
          //   remote: `shop@http://localhost:3001/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          // }),
          // checkout: createDelegatedModule(require.resolve('./remote-delegate.js'), {
          //   remote: `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
          // }),
          home: `home_app@http://localhost:3000/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
          shop: `shop@http://localhost:3001/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
          checkout: `checkout@http://localhost:3002/_next/static/${
            isServer ? 'ssr' : 'chunks'
          }/remoteEntry.js`,
        },
        exposes: {
          './CheckoutTitle': './components/CheckoutTitle',
          './ButtonOldAnt': './components/ButtonOldAnt',
          './menu': './components/menu',
        },
        shared: {
          lodash: {},
          antd: {},
        },
        extraOptions: {
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          automaticPageStitching: false,
        },
      }),
    );
    return config;
  },
};

module.exports = withNx(nextConfig);
