const { ContainerReferencePlugin } = require('../../../../dist/src');

module.exports = {
  mode: 'development',
  devtool: false,
  plugins: [
    new ContainerReferencePlugin({
      remoteType: 'var',
      remotes: {
        'remote-esm-pkg': 'REMOTE_ESM_PKG',
      },
    }),
  ],
};
