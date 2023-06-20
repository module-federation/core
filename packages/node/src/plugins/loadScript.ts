/**
 * loadScript(baseURI, fileName, cb)
 * loadScript(scriptUrl, cb)
 */

//language=JS
export default `
  function loadScript(url, cb, chunkID) {
    if(global.logger){
      global.logger.log({data: {name: 'loadScript',global }});
    }
    console.log(__webpack_require__, '__webpack_require__');
    debugger;
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
        // TODO: remove conditional in v7, this is to prevent breaking change between v6.0.x and v6.1.x
        const vmContext = typeof URLSearchParams === 'undefined' ?
          {exports, require, module, global, __filename, __dirname, URL, console, process,Buffer, ...global, remoteEntryName: name} :
          {exports, require, module, global, __filename, __dirname, URL, URLSearchParams, console, process,Buffer, ...global, remoteEntryName: name};

        const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, {filename: 'node-federation-loader-' + name + '.vm'});
        const foundContainer = remote[name] || remote

        if(!global.__remote_scope__[name]) {
          global.__remote_scope__[name] = {
            get: foundContainer.get,
            init: function(initScope, initToken) {
              try {
                foundContainer.init(initScope, initToken)
              } catch (e) {
                // already initialized
              }
            }
          };
          global.__remote_scope__._config[name] = url;
        }
        callback(global.__remote_scope__[name]);
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
