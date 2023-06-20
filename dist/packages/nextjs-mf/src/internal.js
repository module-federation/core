"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDisplayErrors = exports.getDelegates = exports.parseRemotes = exports.parseRemoteSyntax = exports.removePlugins = exports.getOutputPath = exports.externalizedShares = exports.internalizeSharedPackages = exports.generateRemoteTemplate = exports.reKeyHostShared = exports.DEFAULT_SHARE_SCOPE = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const utils_1 = require("webpack/lib/sharing/utils");
const options_1 = require("webpack/lib/container/options");
const utilities_1 = require("@module-federation/utilities");
// the share scope we attach by default
// in hosts we re-key them to prevent webpack moving the modules into their own chunks (cause eager error)
// in remote these are marked as import:false as we always expect the host to prove them
exports.DEFAULT_SHARE_SCOPE = {
    react: {
        singleton: true,
        requiredVersion: false,
    },
    'react/jsx-runtime': {
        singleton: true,
        requiredVersion: false,
    },
    'react/jsx-dev-runtime': {
        singleton: true,
        requiredVersion: false,
    },
    'react-dom': {
        singleton: true,
        requiredVersion: false,
    },
    'next/dynamic': {
        requiredVersion: false,
        singleton: true,
    },
    'styled-jsx': {
        requiredVersion: false,
        singleton: true,
    },
    'styled-jsx/style': {
        requiredVersion: false,
        singleton: true,
    },
    'next/link': {
        requiredVersion: false,
        singleton: true,
    },
    'next/router': {
        requiredVersion: false,
        singleton: true,
    },
    'next/script': {
        requiredVersion: false,
        singleton: true,
    },
    'next/head': {
        requiredVersion: false,
        singleton: true,
    },
};
// put host in-front of any shared module key, so "hostreact"
const reKeyHostShared = (options = {}) => {
    const shared = {
        // ...options, causes multiple copies of a package to be loaded into a graph, dangerous for singletons
        ...exports.DEFAULT_SHARE_SCOPE,
    };
    const reKeyedInternalModules = Object.entries(shared).reduce((acc, item) => {
        const [itemKey, shareOptions] = item;
        const shareKey = `host${item.shareKey || itemKey}`;
        acc[shareKey] = shareOptions;
        if (!shareOptions.import) {
            acc[shareKey].import = itemKey;
        }
        if (!shareOptions.shareKey) {
            acc[shareKey].shareKey = itemKey;
        }
        if (exports.DEFAULT_SHARE_SCOPE[itemKey]) {
            acc[shareKey].packageName = itemKey;
        }
        return acc;
    }, {});
    return {
        ...options,
        ...reKeyedInternalModules,
    };
};
exports.reKeyHostShared = reKeyHostShared;
// browser template to convert remote into promise new promise and use require.loadChunk to load the chunk
const generateRemoteTemplate = (url, global) => `new Promise(function (resolve, reject) {
    var url = new URL(${JSON.stringify(url)});
    url.searchParams.set('t', Date.now());
    var __webpack_error__ = new Error();
    if(!window.remoteLoading) {
        window.remoteLoading = {};
    };

    if(window.remoteLoading[${JSON.stringify(global)}]) {
      return resolve(window.remoteLoading[${JSON.stringify(global)}])
    }

    var res, rej;
    window.remoteLoading[${JSON.stringify(global)}] = new Promise(function(rs,rj){
      res = rs;
      rej = rj;
    })

    if (typeof window[${JSON.stringify(global)}] !== 'undefined') {
      res(window[${JSON.stringify(global)}]);
      return resolve(window[${JSON.stringify(global)}]);
    }

     __webpack_require__.l(
      url.href,
      function (event) {
        if (typeof window[${JSON.stringify(global)}] !== 'undefined') {
          res(window[${JSON.stringify(global)}]);
          return resolve(window[${JSON.stringify(global)}]);
        }
        var errorType = event && (event.type === 'load' ? 'missing' : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          'Loading script failed.\\n(' + errorType + ': ' + realSrc + ')';
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        rej(__webpack_error__);
        reject(__webpack_error__);
      },
      ${JSON.stringify(global)}
    );
  }).then(function () {
    const proxy = {
      get: ${global}.get,
      init: function(shareScope, initToken) {

        const handler = {
          get(target, prop) {
            if (target[prop]) {
              Object.values(target[prop]).forEach(function(o) {
                if(o.from === '_N_E') {
                  o.loaded = 1
                }
              })
            }
            return target[prop]
          },
          set(target, property, value, receiver) {
            if (target[property]) {
              return target[property]
            }
            target[property] = value
            return true
          }
        }
        try {
          ${global}.init(new Proxy(shareScope, handler), initToken)
        } catch (e) {

        }
        ${global}.__initialized = true
      }
    }
    if (!${global}.__initialized) {
      proxy.init(__webpack_require__.S.default)
    }
    return proxy
  })`;
exports.generateRemoteTemplate = generateRemoteTemplate;
// shared packages must be compiled into webpack bundle, not require() pass through
const internalizeSharedPackages = (options, compiler) => {
    //TODO: should use this util for other areas where we read MF options from userland
    if (!options.shared) {
        return;
    }
    const sharedOptions = parseShareOptions(options);
    // get share keys from user, filter out ones that need to be external
    const internalizableKeys = Object.keys(sharedOptions).filter((key) => {
        if (!exports.DEFAULT_SHARE_SCOPE[key]) {
            return true;
        }
        const index = sharedOptions[key].import;
        if (index && !exports.DEFAULT_SHARE_SCOPE[index]) {
            return true;
        }
        return false;
    });
    if (Array.isArray(compiler.options.externals)) {
        // take original externals regex
        const backupExternals = compiler.options.externals[0];
        // if externals is a function (like when you're not running in serverless mode or creating a single build)
        if (typeof backupExternals === 'function') {
            // replace externals function with short-circuit, or fall back to original algo
            compiler.options.externals[0] = (mod, callback) => {
                if (!internalizableKeys.some((v) => mod.request?.includes(v))) {
                    return backupExternals(mod, callback);
                }
                // bundle it
                return Promise.resolve();
            };
        }
    }
};
exports.internalizeSharedPackages = internalizeSharedPackages;
exports.externalizedShares = Object.entries(exports.DEFAULT_SHARE_SCOPE).reduce((acc, item) => {
    const [key, value] = item;
    acc[key] = { ...value, import: false };
    if (key === 'react/jsx-runtime') {
        delete acc[key].import;
    }
    return acc;
}, {});
// determine output base path, derives .next folder location
const getOutputPath = (compiler) => {
    const isServer = compiler.options.target !== 'client';
    let outputPath = compiler.options.output.path?.split(path_1.default.sep);
    const foundIndex = outputPath?.lastIndexOf(isServer ? 'server' : 'static');
    outputPath = outputPath
        ?.slice(0, foundIndex && foundIndex > 0 ? foundIndex : outputPath.length)
        .join(path_1.default.sep);
    return outputPath;
};
exports.getOutputPath = getOutputPath;
exports.removePlugins = [
    'NextJsRequireCacheHotReloader',
    'BuildManifestPlugin',
    'WellKnownErrorsPlugin',
    'WebpackBuildEventsPlugin',
    'HotModuleReplacementPlugin',
    'NextMiniCssExtractPlugin',
    'NextFederationPlugin',
    'CopyFilePlugin',
    'ProfilingPlugin',
    'DropClientPage',
    'ReactFreshWebpackPlugin',
    'NextMedusaPlugin',
];
/*
 This code is checking if the remote is a string and that it includes an symbol If
 both of these conditions are met then we extract the url and global from the remote
  */
const parseRemoteSyntax = (remote) => {
    if (typeof remote === 'string' &&
        remote.includes('@') &&
        !remote.startsWith('internal ')) {
        const [url, global] = (0, utilities_1.extractUrlAndGlobal)(remote);
        return (0, exports.generateRemoteTemplate)(url, global);
    }
    return remote;
};
exports.parseRemoteSyntax = parseRemoteSyntax;
/*
 This code is doing the following It\'s iterating over all remotes and checking if
 they are using a custom promise template or not If it\'s a custom promise template
 we\'re parsing the remote syntax to get the module name and version number
  */
const parseRemotes = (remotes) => Object.entries(remotes).reduce((acc, [key, value]) => {
    // check if user is passing a internal "delegate module" reference
    if (value.startsWith('internal ')) {
        return { ...acc, [key]: value };
    }
    // check if user is passing custom promise template
    if (!value.startsWith('promise ') && value.includes('@')) {
        return { ...acc, [key]: `promise ${(0, exports.parseRemoteSyntax)(value)}` };
    }
    // return standard template otherwise
    return { ...acc, [key]: value };
}, {});
exports.parseRemotes = parseRemotes;
const getDelegates = (remotes) => {
    return Object.entries(remotes).reduce((acc, [key, value]) => {
        // check if user is passing a internal "delegate module" reference
        if (value.startsWith('internal ')) {
            return { ...acc, [key]: value };
        }
        return acc;
    }, {});
};
exports.getDelegates = getDelegates;
/*
 This code is parsing the options shared object and creating a new object with all
 of the shared configs Then it is iterating over each key in this new object and
 assigning them to an array that will be returned by this function This array contains
 objects that are used as values for the shared property of Module Federation Plugin
 Options The first thing we do here is check if the item passed into shared was a
 string or not if it\'s an array If it wasn\'t then throw an error because there should
 only be strings in there Otherwise continue on with our code below
  */
const parseShareOptions = (options) => {
    const sharedOptions = (0, options_1.parseOptions)(options.shared, (item, key) => {
        if (typeof item !== 'string')
            throw new Error('Unexpected array in shared');
        return item === key || !(0, utils_1.isRequiredVersion)(item)
            ? {
                import: item,
            }
            : {
                import: key,
                requiredVersion: item,
            };
    }, (item) => item);
    return sharedOptions.reduce((acc, [key, options]) => {
        acc[key] = {
            import: options.import,
            shareKey: options.shareKey || key,
            shareScope: options.shareScope,
            requiredVersion: options.requiredVersion,
            strictVersion: options.strictVersion,
            singleton: options.singleton,
            packageName: options.packageName,
            eager: options.eager,
        };
        return acc;
    }, {});
};
const toDisplayErrors = (err) => err
    .map((error) => {
    let { message } = error;
    if (error.stack) {
        message += `\n${error.stack}`;
    }
    return message;
})
    .join('\n');
exports.toDisplayErrors = toDisplayErrors;
//# sourceMappingURL=internal.js.map