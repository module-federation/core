const shareNextInternals = `if (process.browser) {
  Object.assign(__webpack_share_scopes__.default, {
    "next/link": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/link")),
      },
    },
    "next/head": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/head")),
      },
    },
    "next/dynamic": {
      [next.version]: {
        loaded: true,
        get: () => Promise.resolve(() => require("next/dynamic")),
      },
    },
  });
}
`;

module.exports = function (source) {
  const FederationPluginInstance = this._compiler.options.plugins.find(
    (plugin) => {
      if (
        plugin.constructor &&
        plugin.constructor.name === "ModuleFederationPlugin"
      ) {
        return true;
      }
    }
  );
  let manualInitializationString = [];
  if (FederationPluginInstance && FederationPluginInstance._options.remotes) {
    manualInitializationString.push("if (process.browser) {");
    Object.keys(FederationPluginInstance._options.remotes).forEach((remote) => {
      manualInitializationString.push(
        `window.${remote}?.init(__webpack_share_scopes__.default);`
      );
    });
    manualInitializationString.push("};");
  }
  manualInitializationString = manualInitializationString.join("\n");
  return shareNextInternals + manualInitializationString + source;
};
