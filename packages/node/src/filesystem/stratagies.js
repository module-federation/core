export async function fileSystemRunInContextStrategy(
  chunkId,
  rootOutputDir,
  remotes,
  callback
) {
  var fs = require('fs');
  var path = require('path');
  var vm = require('vm');
  var filename = require('path').join(
    __dirname,
    //eslint-disable-next-line
    rootOutputDir + __webpack_require__.u(chunkId)
  );
  if (fs.existsSync(filename)) {
    fs.readFile(filename, 'utf-8', (err, content) => {
      if (err) {
        callback(err, null);
        return;
      }
      var chunk = {};
      try {
        vm.runInThisContext(
          '(function(exports, require, __dirname, __filename) {' +
            content +
            '\n})',
          filename
        )(chunk, require, path.dirname(filename), filename);
        callback(null, chunk);
      } catch (e) {
        console.log("'runInThisContext threw'", e);
        callback(e, null);
      }
    });
  } else {
    const err = new Error(`File ${filename} does not exist`);
    callback(err, null);
  }
}

// HttpEvalStrategy
export async function httpEvalStrategy(
  chunkName,
  remoteName,
  remotes,
  callback
) {
  var url;
  try {
    // eslint-disable-next-line no-undef
     url = new URL(chunkName,__webpack_require__.p);
  } catch(e) {
    console.error('module-federation: failed to construct absolute chunk path of',remoteName,'for',chunkName, e);
    url = new URL(remotes[remoteName]);
    var getBasenameFromUrl = (url) => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    };
    var fileToReplace = getBasenameFromUrl(url.pathname);
    url.pathname = url.pathname.replace(fileToReplace, chunkName);
  }

  const data = await fetch(url).then((res) => res.text());
  var chunk = {};
  try {
    eval(
      '(function(exports, require, __dirname, __filename) {' + data + '\n})',
      chunkName
    )(chunk, require, '.', chunkName);
    callback(null, chunk);
  } catch (e) {
    callback(e, null);
  }
}
/**
 * HttpVmStrategy
 * This function is used to execute a chunk of code in a VM using HTTP or HTTPS based on the protocol.
 * @param {string} chunkName - The name of the chunk to be executed.
 * @param {string} remoteName - The name of the remote server.
 * @param {object} remotes - An object containing the remote servers.
 * @param {function} callback - A callback function to be executed after the chunk is executed.
 */
export async function httpVmStrategy(chunkName, remoteName, remotes, callback) {
  var http = require('http');
  var https = require('https');
  var vm = require('vm');
  var url;
  try {
    console.log('trying chunk load', chunkName, __webpack_require__.p);
    url = new URL(chunkName, __webpack_require__.p);
  } catch(e) {
    console.error('module-federation: failed to construct absolute chunk path of',remoteName,'for',chunkName, e);
 console.log('fallbak url constructed', remotes._config[remoteName])

 url = new URL(remotes._config[remoteName]);
    var fileToReplace = require('path').basename(url.pathname);
    url.pathname = url.pathname.replace(fileToReplace, chunkName);
  }
  var protocol = url.protocol === 'https:' ? https : http;
  protocol.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      var chunk = {};
      vm.runInThisContext(
        '(function(exports, require, __dirname, __filename) {' + data + '\n})',
        chunkName
      )(chunk, require, '.', chunkName);
      callback(null, chunk);
    });
    res.on('error', (err) => {
      callback(err, null);
    });
  });
}
