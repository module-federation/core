const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FileSystemRunInContextStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('file-system-run-in-context-strategy', 10);
  }

  generate() {
    return Template.asString([
      '// FileSystemRunInContextStrategy',
      'function loadChunkFileSystemRunInContext(chunkId,rootOutputDir, remotes, callback) {',
      Template.indent([
        'var fs = require("fs");',
        'var path = require("path");',
        'var vm = require("vm");',
        `var filename = require('path').join(__dirname, rootOutputDir + ${RuntimeGlobals.getChunkScriptFilename}(chunkId));`,
        'if (fs.existsSync(filename)) {',
        Template.indent([
          `fs.readFile(filename, 'utf-8', (err, content) => {`,
          Template.indent([
            'if (err) {',
            Template.indent(['callback(err, null);', 'return;']),
            '}',
            'var chunk = {};',
            'try {',
            Template.indent([
              `vm.runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)(chunk, require, path.dirname(filename), filename);`,
              'callback(null, chunk);',
            ]),
            '} catch (e) {',
            Template.indent([
              `console.log("'runInThisContext threw'", e);`,
              'callback(e, null);',
            ]),
            '}',
          ]),
          '});',
        ]),
        '} else {',
        Template.indent([
          'const err = new Error(`File ${filename} does not exist`);',
          'callback(err, null);',
        ]),
        '}',
      ]),
      '}',
    ]);
  }
}

export default FileSystemRunInContextStrategyRuntimeModule;
