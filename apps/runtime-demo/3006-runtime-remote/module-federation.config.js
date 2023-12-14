const moduleFederationConfig = {
  name: 'runtime_demo_remote',
  exposes: {
    './Button': './src/Button.tsx',
    './Button1': './src/Button1.tsx',
  },
};

module.exports = moduleFederationConfig;
