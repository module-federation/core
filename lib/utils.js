const remoteVars = process.env.REMOTES || {};
const remotes = Object.entries(remoteVars).reduce((acc, item) => {

  const [key, value] = item;
  if(typeof value !=='string') {
    acc[key] = {
      global: value
    };
    return acc
  }
  const [global, url] = value.split("@");
  acc[key] = {
    url,
    global,
  };
  return acc;
}, {});

const injectScript = (key) => {
  var __webpack_error__ = new Error();
  let reference = key

  if(typeof key === 'string') {
    reference = remotes[key]
  }
  const remoteGlobal = reference.global;
  return new Promise(function (resolve, reject) {
    if(!reference.url) {
      return reference.global
    }
    if (typeof window[remoteGlobal] !== "undefined") return resolve();
    __webpack_require__.l(
      reference.url,
      function (event) {
        if (typeof window[remoteGlobal] !== "undefined") return resolve();
        var errorType =
          event && (event.type === "load" ? "missing" : event.type);
        var realSrc = event && event.target && event.target.src;
        __webpack_error__.message =
          "Loading script failed.\n(" + errorType + ": " + realSrc + ")";
        __webpack_error__.name = "ScriptExternalLoadError";
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
        reject(__webpack_error__);
      },
      remoteGlobal
    );
  }).then(async () => {
    if (!__webpack_share_scopes__.default) {
      await __webpack_init_sharing__("default");
    }
    try {
      await window[remoteGlobal].init(__webpack_share_scopes__.default);
    } catch (e) {}
    return window[remoteGlobal];
  });
};

module.exports.injectScript = injectScript;
