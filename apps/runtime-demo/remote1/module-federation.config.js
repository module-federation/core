const moduleFederationConfig = {
  name: 'runtime_demo_remote1',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/Button.tsx',
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
  },
};

module.exports = moduleFederationConfig;
