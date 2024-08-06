import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const { RuntimeGlobals, RuntimeModule, Template, javascript } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { getUndoPath } = require(
  normalizeWebpackPath('webpack/lib/util/identifier'),
) as typeof import('webpack/lib/util/identifier');

class AutoPublicPathRuntimeModule extends RuntimeModule {
  private options: any;

  constructor(options: any) {
    super('publicPath', RuntimeModule.STAGE_BASIC + 1);
    this.options = options;
  }

  /**
   * @returns {string} runtime code
   */
  override generate() {
    const { compilation } = this;
    const {
      scriptType,
      path,
      publicPath,
      importMetaName,
      uniqueName,
      chunkLoading,
      //@ts-ignore
    } = compilation.outputOptions;

    const getPath = () =>
      compilation?.getPath(publicPath || '', {
        hash: compilation?.hash || 'XXXX',
      });

    const chunkName = compilation?.getPath(
      javascript.JavascriptModulesPlugin.getChunkFilenameTemplate(
        this.chunk,
        compilation?.outputOptions,
      ),
      {
        chunk: this.chunk,
        contentHashType: 'javascript',
      },
    );

    let undoPath: string | null = null;
    if (chunkName && path) {
      undoPath = getUndoPath(chunkName, path, false);
    }

    const getPathFromFederation = `
function getPathFromFederation() {
  // Access the global federation manager or create a fallback object
  var federationManager = globalThis.__FEDERATION__ || {};
  // Access the current Webpack instance's federation details or create a fallback object
  var instance = __webpack_require__.federation.instance || {};

  // Function to aggregate all known remote module paths
  var getAllKnownRemotes = function() {
    var found = {};
    // Iterate over all federation instances to collect module cache entries
    (federationManager.__INSTANCES__ || []).forEach((instance) => {
    if(instance){
      instance.moduleCache.forEach((value, key) => {
        found[key] = value;
      });
      }
    });
    return found;
  };

  // Retrieve the combined remote cache from all federation instances
  const combinedRemoteCache = getAllKnownRemotes();
  // Get the name of the current host from the instance
  const hostName = instance.name;
  // Find the path for the current host in the remote cache
  const foundPath = combinedRemoteCache[hostName];
  // If a path is not found, return undefined to indicate the absence of an entry path
  if (!foundPath) { return undefined; }
  // Return the entry path for the found remote module
  const entryPath = foundPath.remoteInfo.entry;
  return entryPath;
}
`;
    const definePropertyCode = `
Object.defineProperty(__webpack_require__, "p", {
  get: function() {
    var scriptUrl;

    // Attempt to get the script URL based on the environment
    var scriptType = ${JSON.stringify(scriptType)};
    var chunkLoading = ${JSON.stringify(chunkLoading)};
    var isModuleEnvironment = ['module', 'node', 'async-node', 'require'].includes(scriptType) || chunkLoading;

    if (isModuleEnvironment) {
      try {
        // Use Function constructor to avoid direct reference to import.meta in environments that do not support it
        scriptUrl = (new Function('return typeof ${importMetaName}.url === "string" ? ${importMetaName}.url : undefined;'))();
      } catch (e) {
        // Handle cases where import.meta is not available or other errors occur
        var scriptPath = getPathFromFederation();
        if (scriptPath) {
          scriptUrl = scriptPath;
        } else if (typeof __filename !== "undefined") {
          scriptUrl = __filename;
        } else {
          scriptUrl = ${
            publicPath !== 'auto' ? JSON.stringify(getPath()) : 'undefined'
          };
        }
      }
    } else {
      // Fallback for non-module environments, such as browsers
      if (${RuntimeGlobals.global}.importScripts) {
        scriptUrl = ${RuntimeGlobals.global}.location + "";
      }
      var document = ${RuntimeGlobals.global}.document;
      if (!scriptUrl && document) {
        if (document.currentScript) {
          scriptUrl = document.currentScript.src;
        } else {
          var scripts = document.getElementsByTagName("script");
          if (scripts.length) {
            scriptUrl = scripts[scripts.length - 1].src;
          }
        }
      }
    }

    if (!scriptUrl) {
      throw new Error("Unable to calculate automatic public path");
    }

    // Clean up the script URL by removing any hash or query parameters
    scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\\?.*$/, "").replace(/\\/[^\\/]+$/, "/");

    // Apply any undo path that might be necessary for nested public paths
    var finalScript = ${JSON.stringify(
      undoPath,
    )} ? scriptUrl + ${JSON.stringify(undoPath)} : scriptUrl;

    // Helper function to ensure the URL has a protocol if it starts with '//'
    var addProtocol = function(url) {
      return url.startsWith('//') ? 'https:' + url : url;
    };

    // Set the global variable for the public path
    globalThis.currentVmokPublicPath = addProtocol(finalScript) || '/';

    // Return the final public path
    return finalScript
  }
});
`;

    return Template.asString([getPathFromFederation, definePropertyCode]);
  }
}

export default AutoPublicPathRuntimeModule;
