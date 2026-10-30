const { ModuleFederationPlugin } = require('../../../../dist/src');

const shared = {
  dep: { import: './dep', version: '1.0.0' },
};

function createContainer(name, expose, remoteName) {
  return new ModuleFederationPlugin({
    name,
    library: { type: 'commonjs-module' },
    exposes: [expose],
    remotes: {
      [remoteName]: `promise Promise.resolve().then(() => require('./${remoteName}.js'))`,
    },
    shared,
  });
}

module.exports = {
  output: {
    filename: '[name].js',
  },
  plugins: [
    createContainer('containerA', './a', 'containerB'),
    createContainer('containerB', './b', 'containerA'),
  ],
};
