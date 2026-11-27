const { ModuleFederationPlugin } = require('../../../../dist/src');

class AssertMixedRuntimeConnectionPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'AssertMixedRuntimeConnectionPlugin',
      (compilation) => {
        compilation.hooks.optimizeChunks.tap(
          { name: 'AssertMixedRuntimeConnectionPlugin', stage: 10 },
          () => {
            const runtimePlugin = [...compilation.modules].find((module) =>
              module.resource?.endsWith('runtime-plugin.js'),
            );
            const hasMixedRuntimeConnection = runtimePlugin
              ? [
                  ...compilation.moduleGraph.getOutgoingConnections(
                    runtimePlugin,
                  ),
                ].some(
                  (connection) =>
                    connection.module?.resource?.includes(
                      'runtime-specific-pkg',
                    ) &&
                    connection.getActiveState('runtime-secondary') === true &&
                    connection.getActiveState(
                      'runtime-hoist_inactive_connections',
                    ) === false &&
                    connection.getActiveState(undefined) !== false,
                )
              : false;

            if (!hasMixedRuntimeConnection) {
              throw new Error(
                'Expected runtime-specific-pkg to have a mixed-runtime connection',
              );
            }
          },
        );
      },
    );
  }
}

module.exports = {
  entry: {
    main: './index.js',
    secondary: './secondary.js',
  },
  target: 'async-node',
  output: {
    filename: '[name].js',
    publicPath: '/',
  },
  optimization: {
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
    sideEffects: true,
    minimize: false,
    concatenateModules: false,
    chunkIds: 'named',
    moduleIds: 'named',
  },
  plugins: [
    new AssertMixedRuntimeConnectionPlugin(),
    new ModuleFederationPlugin({
      name: 'hoist_inactive_connections',
      filename: 'container.js',
      exposes: {
        './noop': './noop.js',
      },
      runtimePlugins: [require.resolve('./runtime-plugin.js')],
    }),
  ],
};
