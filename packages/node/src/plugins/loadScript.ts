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
    if (global.webpackChunkLoad) {
      global.webpackChunkLoad(url).then(function (resp) {
        return resp.text();
      }).then(function (rawData) {
        cb(null, rawData);
      }).catch(function (err) {
        console.error('Federated Chunk load failed', error);
        return cb(error)
      });
    } else {
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
    }
  }
`;

// Shim to recreate browser version of webpack_require.loadChunk, same api
//language=JS
export const executeLoadTemplate = `
  function executeLoad(url, callback, name) {
    if(!name) {
      throw new Error('__webpack_require__.l name is required for ' + url);
    }
    if (typeof global.__remote_scope__[name] !== 'undefined') return callback(global.__remote_scope__[name]);
    const vm = require('vm');
    (global.webpackChunkLoad || global.fetch || require("node-fetch"))(url).then(function (res) {
      return res.text();
    }).then(function (scriptContent) {
      try {
        const vmContext = {exports, require, module, global, __filename, __dirname, URL,console,process,Buffer,  ...global, globalThis, ...globalThis, Error};
        const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, {filename: 'node-federation-loader-' + name + '.vm'});
        global.__remote_scope__[name] = remote[name] || remote;
        global.__remote_scope__._config[name] = url;
        callback(global.__remote_scope__[name])
      } catch (e) {
        console.error('executeLoad hit catch block');
        e.target = {src: url};
        callback(e);
      }
    }).catch((e) => {
      e.target = {src: url};
      callback(e);
    });
  }
`;
