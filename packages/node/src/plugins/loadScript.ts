/**
 * loadScript(baseURI, fileName, cb)
 * loadScript(scriptUrl, cb)
 */

//language=JS
export default `
  function loadScript(url, cb, chunkID) {
    var url;
    var cb = arguments[arguments.length - 1];
    if (typeof cb !== "function") {
      throw new Error("last argument should be a function");
    }
    if (arguments.length === 2) {
      url = arguments[0];
    } else if (arguments.length === 3) {
      url = new URL(arguments[1], arguments[0]).toString();
    } else {
      throw new Error("invalid number of arguments");
    }
    if (globalThis.webpackChunkLoad) {
      globalThis.webpackChunkLoad(url).then(function (resp) {
        return resp.text();
      }).then(function (rawData) {
        cb(null, rawData);
      }).catch(function (err) {
        console.error('Federated Chunk load failed', err);
        return cb(err)
      });
    } else if (typeof process !== 'undefined') {
      //TODO https support
      let request = (url.startsWith('https') ? require('https') : require('http')).get(url, function (resp) {
        if (resp.statusCode === 200) {
          let rawData = '';
          resp.setEncoding('utf8');
          resp.on('data', chunk => {
            rawData += chunk;
          });
          resp.on('end', () => {
            cb(null, rawData);
          });
        } else {
          cb(resp);
        }
      });
      request.on('error', error => {
        console.error('Federated Chunk load failed', error);
        return cb(error)
      });
    } else {
      fetch(url).then(function (resp) {
        return resp.text();
      }).then(function (rawData) {
        cb(null, rawData);
      }).catch(function (err) {
        console.error('Federated Chunk load failed', err);
        return cb(err)
      })
    }
  }
`;

// Shim to recreate browser version of webpack_require.loadChunk, same api
//language=JS
export const executeLoadTemplate = `
  function executeLoad(url, callback, name) {
    if (!name) {
      throw new Error('__webpack_require__.l name is required for ' + url);
    }
    if (typeof globalThis.__remote_scope__[name] !== 'undefined') return callback(globalThis.__remote_scope__[name]);
    // if its a worker or node
    if (typeof process !== 'undefined') {
      const vm = require('vm');
      (globalThis.webpackChunkLoad || globalThis.fetch || require("node-fetch"))(url).then(function (res) {
        return res.text();
      }).then(function (scriptContent) {
        try {
     const vmContext = typeof URLSearchParams === 'undefined' ?{exports, require, module, global, __filename, __dirname, URL, URLSearchParams, console, process,Buffer, ...global, remoteEntryName: name}:
          {exports, require, module, global, __filename, __dirname, URL, URLSearchParams, console, process,Buffer, ...global, remoteEntryName: name};

          const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, {filename: 'node-federation-loader-' + name + '.vm'});
          globalThis.__remote_scope__[name] = remote[name] || remote;
          globalThis.__remote_scope__._config[name] = url;
          callback(globalThis.__remote_scope__[name])
        } catch (e) {
          console.error('executeLoad hit catch block');
          e.target = {src: url};
          callback(e);
        }
      }).catch((e) => {
        e.target = {src: url};
        callback(e);
      });
    } else {
      fetch(url).then(function (res) {
        return res.text();
      }).then(function (scriptContent) {
        try {
          const remote = eval('let module = {};' + scriptContent + '\\nmodule.exports')
          // const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, {filename: 'node-federation-loader-' + name + '.vm'});
          globalThis.__remote_scope__[name] = remote[name] || remote;
          globalThis.__remote_scope__._config[name] = url;
          callback(globalThis.__remote_scope__[name])
        } catch (e) {
          console.error('executeLoad hit catch block',e);
          e.target = {src: url};
          callback(e);
        }
      });
    }
  }
`;
