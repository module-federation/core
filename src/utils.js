const remoteVars = process.env.REMOTES || {};

const runtimeRemotes = Object.entries(remoteVars).reduce(function (acc, item) {
  const [key, value] = item;
  if (typeof value === 'object' && typeof value.then === 'function') {
    acc[key] = { asyncContainer: value };
  } else if (typeof value === 'string') {
    const [global, url] = value.split('@');
    acc[key] = { global, url };
  } else {
    console.log('remotes process', process.env.REMOTES);
    throw new Error(`[mf] Invalid value received for runtime_remote "${key}"`);
  }
  return acc;
}, {});

module.exports.remotes = runtimeRemotes;

/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 *
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 */
function injectScript(keyOrRuntimeRemoteItem) {
  let reference = keyOrRuntimeRemoteItem;
  if (typeof keyOrRuntimeRemoteItem === 'string') {
    reference = runtimeRemotes[keyOrRuntimeRemoteItem];
  }

  // 1) Load remote container if needed
  let asyncContainer;
  if (reference.asyncContainer) {
    asyncContainer = reference.asyncContainer;
  } else {
    const remoteGlobal = reference.global;
    const __webpack_error__ = new Error();
    asyncContainer = new Promise(function (resolve, reject) {
      if (typeof window[remoteGlobal] !== 'undefined') {
        return resolve(window[remoteGlobal]);
      }

      __webpack_require__.l(
        reference.url,
        function (event) {
          if (typeof window[remoteGlobal] !== 'undefined') {
            return resolve(window[remoteGlobal]);
          }

          var errorType =
            event && (event.type === 'load' ? 'missing' : event.type);
          var realSrc = event && event.target && event.target.src;
          __webpack_error__.message =
            'Loading script failed.\n(' + errorType + ': ' + realSrc + ')';
          __webpack_error__.name = 'ScriptExternalLoadError';
          __webpack_error__.type = errorType;
          __webpack_error__.request = realSrc;
          reject(__webpack_error__);
        },
        remoteGlobal
      );
    });
  }

  // 2) Initialize remote container
  return asyncContainer
    .then(function (container) {
      if (!__webpack_share_scopes__.default) {
        // not always a promise, so we wrap it in a resolve
        return Promise.resolve(__webpack_init_sharing__('default')).then(
          function () {
            return container;
          }
        );
      } else {
        return container;
      }
    })
    .then(function (container) {
      try {
        // WARNING: here might be a potential BUG.
        //   `container.init` does not return a Promise, and here we do not call `then` on it.
        // But according to [docs](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers)
        //   it must be async.
        // The problem may be in Proxy in NextFederationPlugin.js.
        //   or maybe a bug in the webpack itself - instead of returning rejected promise it just throws an error.
        // But now everything works properly and we keep this code as is.
        container.init(__webpack_share_scopes__.default);
      } catch (e) {
        // maybe container already initialized so nothing to throw
      }
      return container;
    });
}

module.exports.injectScript = injectScript;
