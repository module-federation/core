const moduleFederationConfig = {
  name: 'runtime_demo_remote',
  exposes: {
    './Button': './src/Button.tsx',
  },
};

module.exports = moduleFederationConfig;
