// Lazy compilation client for federated remotes. Same protocol as
// `@rspack/core/hot/lazy-compilation-web.js`, but a relative endpoint is
// resolved against this bundle's public path instead of the page. A remote
// runs on the host's page, so the page origin is the host's dev server.
if (typeof XMLHttpRequest === 'undefined') {
  throw new Error(
    "Environment doesn't support lazy compilation (requires XMLHttpRequest)",
  );
}

var urlBase = decodeURIComponent(__resourceQuery.slice(1));
try {
  urlBase = new URL(
    urlBase,
    new URL(__webpack_public_path__, self.location.href),
  ).href;
} catch (_) {
  // Keep the page-relative endpoint when the public path can't be resolved.
}

var compiling = new Set();
var errorHandlers = new Set();
var pendingXhr;
var hasPendingUpdate = false;

function sendRequest() {
  if (compiling.size === 0) {
    hasPendingUpdate = false;
    return;
  }

  var xhr = new XMLHttpRequest();
  pendingXhr = xhr;
  xhr.open('POST', urlBase, true);
  // text/plain keeps this a simple CORS request, so no preflight is sent.
  xhr.setRequestHeader('Content-Type', 'text/plain');

  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    pendingXhr = undefined;
    if (xhr.status < 200 || xhr.status >= 300) {
      var error = new Error(
        'Problem communicating active modules to the server ' +
          urlBase +
          ': HTTP ' +
          xhr.status,
      );
      errorHandlers.forEach(function (onError) {
        onError(error);
      });
    }
    if (hasPendingUpdate) {
      hasPendingUpdate = false;
      sendRequest();
    }
  };

  xhr.send(Array.from(compiling).join('\n'));
}

function sendActiveRequest() {
  hasPendingUpdate = true;
  if (!pendingXhr) {
    hasPendingUpdate = false;
    sendRequest();
  }
}

export const activate = function (options) {
  var data = options.data;
  var onError = options.onError;
  errorHandlers.add(onError);

  if (!compiling.has(data)) {
    compiling.add(data);
    sendActiveRequest();
  }

  if (!options.active && !import.meta.webpackHot) {
    console.log(
      'Hot Module Replacement is not enabled. Waiting for process restart...',
    );
  }

  return function () {
    errorHandlers.delete(onError);
    compiling.delete(data);
    sendActiveRequest();
  };
};
