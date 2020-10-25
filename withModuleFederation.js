const path = require("path");

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
    config.output.library = mfConfig.name;

    config.externals = {
      react: "React",
      // ReactDOM: "ReactDOM"
    };
  } else {
    config.externals = {
      react: path.resolve(__dirname, "./react.js"),
      // "react-dom": path.resolve("./react-dom.js"),
    };
  }

  const federationConfig = {
    name: mfConfig.name,
    library: mfConfig.library
      ? mfConfig.library
      : { type: config.output.libraryTarget, name: mfConfig.name },
    filename: "static/runtime/remoteEntry.js",
    remotes: options.isServer
      ? nextServerRemote(mfConfig.remotes)
      : mfConfig.remotes,
    exposes: mfConfig.exposes,
    shared: mfConfig.shared,
  };
  if (!options.webpack.container) {
    throw new Error("Module Federation only works with Webpack 5");
  }
  config.plugins.push(
    new options.webpack.container.ModuleFederationPlugin(federationConfig)
  );
};
module.exports = withModuleFederation;

