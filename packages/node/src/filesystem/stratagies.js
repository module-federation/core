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
  var url = new URL(remotes[remoteName]);
  var getBasenameFromUrl = (url) => {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  };
  var fileToReplace = getBasenameFromUrl(url.pathname);
  url.pathname = url.pathname.replace(fileToReplace, chunkName);
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

// HttpVmStrategy
export async function httpVmStrategy(chunkName, remoteName, remotes, callback) {
  var http = require('http');
  var https = require('https');
  var vm = require('vm');
  var url = new URL(remotes[remoteName]);
  var fileToReplace = require('path').basename(url.pathname);
  url.pathname = url.pathname.replace(fileToReplace, chunkName);
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
