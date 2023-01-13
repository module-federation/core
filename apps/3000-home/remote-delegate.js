module.exports = new Promise((resolve, reject) => {
  console.log('Delegate being called for', __resourceQuery)
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote')
  console.log(currentRequest)
  const [containerGlobal, url] = currentRequest.split('@');
  const __webpack_error__ = new Error()
  __webpack_require__.l(
    url,
    function (event) {
      const container = typeof window === 'undefined' ? global.__remote_scope__[containerGlobal] : window[containerGlobal];
      console.log('delegate resolving', container)
      if (typeof container !== 'undefined') return resolve(container);
      var realSrc = event && event.target && event.target.src;
      __webpack_error__.message = 'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
      __webpack_error__.name = 'ScriptExternalLoadError';
      __webpack_error__.stack = event.stack;
      reject(__webpack_error__);
    },
    containerGlobal,
  );
})
