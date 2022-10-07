/**
 * loadScript(baseURI, fileName, cb)
 * loadScript(scriptUrl, cb)
 */

export default `
    function loadScript(url,cb,chunkID) {
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
      if(global.webpackChunkLoad){
        global.webpackChunkLoad(url).then(function(resp){
          return resp.text();
        }).then(function(rawData){
          cb(null, rawData);
        }).catch(function(err){
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

export const executeLoadTemplate = `
    function executeLoad(url, callback, moduleName) {
      console.log('remoteUrl',remoteUrl)
        const [scriptUrl, moduleName] = extractUrlAndGlobal(remoteUrl);
        console.log("executing remote load", scriptUrl);
        const vm = require('vm');
        return new Promise(function (resolve, reject) {
          if(global.__remote_scope__[moduleName]) resolve(global.__remote_scope__[moduleName]);
         (global.webpackChunkLoad || global.fetch || require("node-fetch"))(scriptUrl).then(function(res){
            return res.text();
          }).then(function(scriptContent){
            try {
              const vmContext = { exports, require, module, global, __filename, __dirname, URL, ...global};
              const remote = vm.runInNewContext(scriptContent + '\\nmodule.exports', vmContext, { filename: 'node-federation-loader-' + moduleName + '.vm' });

              /* TODO: need something like a chunk loading queue, this can lead to async issues
               if two containers load the same remote, they can overwrite global scope
               should check someone is already loading remote and await that */
              global.__remote_scope__[moduleName] = remote[moduleName] || remote
              resolve(global.__remote_scope__[moduleName])
            } catch(e) {
              console.error('problem executing remote module', moduleName);
              reject(e);
            }
          }).catch((e)=>{
            console.error('failed to fetch remote', moduleName, scriptUrl);
            console.error(e);
            reject(null)
          })
        })
    }
`;
