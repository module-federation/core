const path = require("path");

const FederatedStatsPlugin = require("webpack-federated-stats-plugin");

const withModuleFederation =
  (
    federationPluginOptions,
    {
      removePlugins = [
        "BuildManifestPlugin",
        "ReactLoadablePlugin",
        "DropClientPage",
        "WellKnownErrorsPlugin",
      ],
      stats,
    } = {}
  ) =>
  (nextConfig = {}) =>
    Object.assign({}, nextConfig, {
      /**
       * @param {import("webpack").Configuration} config
       * @param {*} options
       * @returns {import("webpack").Configuration}
       */
      webpack(config, options) {
        const { webpack } = options;

        if (!options.isServer) {
          /**
           * @type {{ webpack: import("webpack") }}
           */
          config.plugins.push({
            __NextFederation__: true,
            /**
             * @param {import("webpack").Compiler} compiler
             */
            apply(compiler) {
              compiler.hooks.afterCompile.tapAsync(
                "NextFederation",
                (compilation, done) => {
                  const toDrop = new Set(removePlugins || []);

                  const filteredPlugins = compilation.options.plugins.filter(
                    (plugin) => {
                      if (
                        (plugin.constructor &&
                          toDrop.has(plugin.constructor.name)) ||
                        plugin.__NextFederation__
                      ) {
                        return false;
                      }

                      return true;
                    }
                  );
                  // attach defaults that always need to be shared
                  Object.assign(federationPluginOptions.shared, {
                    "next/dynamic": {
                      requiredVersion: false,
                      singleton: true,
                    },
                    "next/link": {
                      requiredVersion: false,
                      singleton: true,
                    },
                    "next/head": {
                      requiredVersion: false,
                      singleton: true,
                    },
                  });
                  /** @type {import("webpack").WebpackOptionsNormalized} */
                  const webpackOptions = {
                    cache: false,
                    ...compilation.options,
                    output: {
                      ...compilation.options.output,
                      chunkLoadingGlobal: undefined,
                      devtoolNamespace: undefined,
                      uniqueName: federationPluginOptions.name,
                    },
                    entry: {
                      noop: { import: [path.resolve(__dirname, "noop.js")] },
                    },
                    plugins: [
                      ...filteredPlugins,
                      new webpack.container.ModuleFederationPlugin(
                        federationPluginOptions
                      ),
                    ],
                    optimization: {
                      ...compilation.options.optimization,
                      runtimeChunk: false,
                      splitChunks: undefined,
                    },
                  };

                  if (stats) {
                    webpackOptions.plugins.push(
                      new FederatedStatsPlugin({ filename: stats })
                    );
                  }

                  webpack(webpackOptions, (err) => {
                    done(err);
                  });
                }
              );
            },
          });
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    });

module.exports = withModuleFederation;
