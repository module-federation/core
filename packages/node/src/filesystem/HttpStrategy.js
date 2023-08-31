const https = require('https');
const vm = require('vm');

class HttpStrategy {
  async loadChunk(chunkId, rootOutputDir, remotes, callback) {
    const remoteRegistry = globalThis.__remote_scope__._config;
    const requestedRemote = remoteRegistry[chunkName];
    let scriptUrl = new URL(requestedRemote);

    // Logging for debugging; you can remove or modify these as needed
    logger(`'will load remote chunk'`, scriptUrl.toString());

    const getBasenameFromUrl = (url) => {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    };

    const fileToReplace = getBasenameFromUrl(scriptUrl.pathname);
    scriptUrl.pathname = scriptUrl.pathname.replace(fileToReplace, chunkName);

    https
      .get(scriptUrl.toString(), (res) => {
        let content = '';

        res.on('data', (chunk) => {
          content += chunk;
        });

        res.on('end', () => {
          const chunk = {};
          try {
            vm.runInThisContext(
              `(function(exports, require, __dirname, __filename) {${content}\n})`,
              scriptUrl.toString()
            )(
              chunk,
              require,
              require('path').dirname(scriptUrl.pathname),
              scriptUrl.pathname
            );
            callback(null, chunk);
          } catch (e) {
            logger(`'runInThisContext threw'`, e);
            callback(e, null);
          }
        });
      })
      .on('error', (err) => {
        logger(
          `'error loading remote chunk'`,
          scriptUrl.toString(),
          'got',
          err
        );
        callback(err, null);
      });
  }
}

export default HttpStrategy;
