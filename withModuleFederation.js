const path = require("path");
const MergeRuntime = require("./merge-runtime");
const DefinePlugin = require("webpack/lib/DefinePlugin");

const nextServerRemote = (remoteObject) => {
  if (!typeof remoteObject === "object") {
    throw new Error("Remotes must be configured as an object");
  }
  return Object.entries(remoteObject).reduce((acc, [name, config]) => {
    acc[name] = {
      external: `external new Promise(res => {
      let remote
      try {
      remote = require('${config}')['${name}']
      } catch (e) {
      delete require.cache['${config}']
      remote = require('${config}')['${name}']
      }
      const proxy = {get:(request)=> remote.get(request),init:(arg)=>{try {return remote.init(arg)} catch(e){console.log('remote container already initialized')}}}
      res(proxy)
      })`,
    };
    return acc;
  }, {});
};

const withModuleFederation = (config, options, mfConfig) => {
  config.experiments = { topLevelAwait: true };
  if (!options.isServer) {
    config.output.uniqueName = mfConfig.name;
    Object.assign(config.resolve.alias, {
      react$: require.resolve("./react.js"),
      "react-dom$": require.resolve("./react-dom.js"),
      "../next-server/lib/router-context": require.resolve(
        "./next_router_context.js"
      ),
      "../next-server/lib/head-manager-context": require.resolve(
        "./head-manager-context.js"
      ),
    });
  } else {
    Object.assign(config.resolve.alias, {
      // react$: require.resolve("./react.js"),
      "react-dom/server$": require.resolve("./react-dom.js"),
      "../next-server/lib/router-context": require.resolve(
        "./next_router_context.js"
      ),
      "../next-server/lib/head-manager-context": require.resolve(
        "./head-manager-context.js"
      ),
    });
    config.externals.unshift({
      react: require.resolve("./react.js"),
      // "react-dom": require.resolve("./react-dom.js"),
      // "../next-server/lib/router-context": require.resolve(
      //   "./next_router_context.js"
      // ),
    });
  }
  const federationConfig = {
    name: mfConfig.name,
    library: mfConfig.library
      ? mfConfig.library
      : { type: config.output.libraryTarget, name: mfConfig.name },
    filename: mfConfig.filename || "static/runtime/remoteEntry.js",
    remotes: options.isServer
      ? nextServerRemote(mfConfig.remotes)
      : mfConfig.remotes,
    exposes: mfConfig.exposes,
    shared: mfConfig.shared,
  };

  config.plugins.push(
    new options.webpack.container.ModuleFederationPlugin(federationConfig)
  );
  if (mfConfig.mergeRuntime) {
    config.plugins.push(new MergeRuntime(federationConfig));
  }
  config.plugins.push(
    new DefinePlugin({
      __CURRENT_HOST__: JSON.stringify(mfConfig.name),
      __LISTED_REMOTES__: JSON.stringify(Object.keys(federationConfig.remotes)),
    })
  );
};
module.exports = withModuleFederation;
