/**
 * loadScript(baseURI, fileName, cb)
 * loadScript(scriptUrl, cb)
 */

module.exports = `
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
