const { withNx } = require('@nx/next/plugins/with-nx');
const { workspaceRoot } = require('nx/src/utils/workspace-root');

const path = require('path');
const { registerTsConfigPaths } = require('nx/src/plugins/js/utils/register');
registerTsConfigPaths(path.join(workspaceRoot, 'tsconfig.tmp.json'));
const NextFederationPlugin = require('@module-federation/nextjs-mf');
const fs = require('fs');

function renameDefaultDelegate() {
  const filesToRename = [
    {
      oldPath: path.resolve(__dirname, '../../dist/packages/nextjs-mf/src/default-delegate.js'),
      newPath: path.resolve(__dirname, '../../dist/packages/nextjs-mf/src/default-delegate.cjs'),
    },
    {
      oldPath: path.resolve(__dirname, '../../dist/packages/nextjs-mf/src/federation-noop.js'),
      newPath: path.resolve(__dirname, '../../dist/packages/nextjs-mf/src/federation-noop.cjs'),
    },
  ];

  filesToRename.forEach(({ oldPath, newPath }) => {
    fs.rename(oldPath, newPath, function(err) {
      if (err) {
        // Do not log error
      }
    });
  });
}
try {
renameDefaultDelegate();
} catch(e) { /* empty */ }
// const {
//   createDelegatedModule,
// } = require('@module-federation/nextjs-mf/utilities');

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
    const { isServer } = options;
    // used for testing build output snapshots

    const remotes = {
      // shop: createDelegatedModule(require.resolve('./remote-delegate.js'), {
      //   remote: `shop@http://localhost:3001/_next/static/${
      //     isServer ? 'ssr' : 'chunks'
      //   }/remoteEntry.js`,
      // }),
      // checkout: createDelegatedModule(require.resolve('./remote-delegate.js'), {
      //   remote: `checkout@http://localhost:3002/_next/static/${isServer ? 'ssr' : 'chunks'}/remoteEntry.js`,
      // }),

      shop: `shop@http://localhost:3001/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
      checkout: `checkout@http://localhost:3002/_next/static/${
        isServer ? 'ssr' : 'chunks'
      }/remoteEntry.js`,
    };

    config.plugins.push(
      new NextFederationPlugin({
        name: 'home_app',
        filename: 'static/chunks/remoteEntry.js',
        remotes: {
          shop: remotes.shop,
          checkout: remotes.checkout,
        },
        exposes: {
          './SharedNav': './components/SharedNav',
          './menu': './components/menu',
        },
        shared: {
          lodash: {},
          antd: {},
        },
        extraOptions: {
          debug: false,
          exposePages: true,
          enableImageLoaderFix: true,
          enableUrlLoaderFix: true,
          skipSharingNextInternals: false,
          automaticPageStitching: false,
        },
      })
    );
    return config;
  },
};

module.exports = withNx(nextConfig);

