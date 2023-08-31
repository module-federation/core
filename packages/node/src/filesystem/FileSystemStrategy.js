const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FileSystemStrategy {
  loadChunk(chunkId, rootOutputDir, remotes, callback) {
    const filename = path.join(__dirname, rootOutputDir, `${chunkId}.js`);

    // Logging for debugging; you can remove or modify these as needed
    console.log(`'chunk filename local load'`, chunkId);

    if (fs.existsSync(filename)) {
      fs.readFile(filename, 'utf-8', (err, content) => {
        if (err) {
          callback(err, null);
          return;
        }

        const chunk = {};
        try {
          vm.runInThisContext(
            `(function(exports, require, __dirname, __filename) {${content}\n})`,
            filename
          )(chunk, require, path.dirname(filename), filename);
          callback(null, chunk);
        } catch (e) {
          console(`'runInThisContext threw'`, e);
          callback(e, null);
        }
      });
    } else {
      const err = new Error(`File ${filename} does not exist`);
      callback(err, null);
    }
  }
}
