const chalk = require("chalk");
const path = require("path");

const isProd = process.env.NODE_ENV === "production";

const logPrefix = chalk.rgb(165, 232, 217)("[next-mf]");
const log = (...args) => console.log(logPrefix, ...args);
log.error = (...args) => console.error(logPrefix, chalk.red("error"), ...args);
log.warning = (...args) =>
  console.warning(logPrefix, chalk.yellow("warning"), ...args);

/**
 * @typedef {Object} WithModuleFederationOptions
 * @property {string[]} removePlugins
 * @property {string} publicPath
 * @property {'error' | 'warn'} [logLevel]
 */

// ModuleFederationPluginOptions is not exported, so using ConstructorParameters to get the plugin options type
/** @type {(
 *   federationPluginOptions: ConstructorParameters<typeof import('webpack').container.ModuleFederationPlugin>[0],
 *   options: WithModuleFederationOptions
 *  ): any} */
const withModuleFederation =
  (
    federationPluginOptions,
    {
      removePlugins = [
        "BuildManifestPlugin",
        "ReactLoadablePlugin",
        "DropClientPage",
        "WellKnownErrorsPlugin",
        "ModuleFederationPlugin",
      ],
      publicPath = "auto",
      logLevel = "error",
    } = {}
  ) =>
  (nextConfig = {}) => {
    /** @type {import('webpack').Compiler} */
    let compiler;

    /**
     * @typedef {Object} StartCompileOptions
     * @property {import('webpack')} webpack
     */

    /**
     * @param {StartCompileOptions} options
     */
    function startCompiler({
      webpack,
      federationPluginOptions,
      compilation,
      removePlugins,
      publicPath,
      done,
    }) {
      if (compiler) {
        return;
      }

      const toDrop = new Set(removePlugins || []);

      const filteredPlugins = compilation.options.plugins.filter((plugin) => {
        if (
          (plugin.constructor && toDrop.has(plugin.constructor.name)) ||
          plugin.__NextFederation__
        ) {
          return false;
        }

        return true;
      });

      // attach defaults that always need to be shared
      Object.assign(federationPluginOptions.shared, {
        "next/dynamic": {
          requiredVersion: false,
          singleton: true,
        },
        "styled-jsx": {
          requiredVersion: false,
          singleton: true,
        },
        "next/link": {
          requiredVersion: false,
          singleton: true,
        },
        "next/router": {
          requiredVersion: false,
          singleton: true,
        },
        "next/script": {
          requiredVersion: false,
          singleton: true,
        },
        "next/head": {
          requiredVersion: false,
          singleton: true,
        },
        react: {
          singleton: true,
          import: false,
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
          publicPath,
        },
        entry: {
          noop: { import: [path.resolve(__dirname, "noop.js")] },
        },
        plugins: [
          ...filteredPlugins,
          new webpack.container.ModuleFederationPlugin(federationPluginOptions),
        ],
        optimization: {
          ...compilation.options.optimization,
          runtimeChunk: false,
          splitChunks: undefined,
        },
      };

      if (typeof webpackOptions.output.chunkFilename === "string") {
        webpackOptions.output.chunkFilename =
          compilation.options.output.chunkFilename.replace(".js", "-fed.js");
      }
      if (typeof webpackOptions.output.filename === "string") {
        webpackOptions.output.filename =
          compilation.options.output.filename.replace(".js", "-fed.js");
      }

      if (isProd) {
        log("compiling...");
      } else {
        log("start watcher...");
      }

      compiler = webpack(webpackOptions);

      const callback = (
        err,
        /** @type {import('webpack').Stats} */
        stats
      ) => {
        log("compiled!");

        if (err) {
          log.error("error:");
          log.error(err.stack || err);
          if (err.details) {
            log.error(err.details);
          }
          return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          log.error("error:");
          log.error(info.errors);
        }

        if (logLevel === "warn" && stats.hasWarnings()) {
          log.warning("warning:");
          log.warning(info.warnings);
        }

        // done is only present in a full build (production), not in a watch build
        done?.(err);
      };

      if (isProd) {
        compiler.run(callback);
      } else {
        compiler.watch(
          {
            aggregateTimeout: 300,
            poll: undefined,
          },
          callback
        );
      }
    }

    return Object.assign({}, nextConfig, {
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
              const run = (compilation, done) => {
                return startCompiler({
                  webpack,
                  federationPluginOptions,
                  compilation,
                  removePlugins,
                  publicPath,
                  done,
                });
              };

              // in production use tapAsync to wait for the full compilation of the sidecar
              if (isProd) {
                compiler.hooks.afterCompile.tapAsync(
                  "NextFederation",
                  (compilation, done) => {
                    run(compilation, done);
                  }
                );
              } else {
                compiler.hooks.afterCompile.tap(
                  "NextFederation",
                  (compilation) => {
                    run(compilation);
                  }
                );
              }
            },
          });
        }

        if (typeof nextConfig.webpack === "function") {
          return nextConfig.webpack(config, options);
        }

        return config;
      },
    });
  };

module.exports = withModuleFederation;
