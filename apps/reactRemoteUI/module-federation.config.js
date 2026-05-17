module.exports = {
  name: 'reactRemoteUI',
  filename: 'remoteEntry.js',
  experiments: {
    asyncStartup: true,
  },
  exposes: {
    './Button': './src/Button',
  },
};
