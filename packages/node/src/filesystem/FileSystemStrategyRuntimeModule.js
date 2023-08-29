const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FileSystemRunInContextStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('file-system-run-in-context-strategy', 10);
  }

  generate() {
    const { compilation } = this;
    const { runtimeTemplate } = compilation;

    return Template.asString([
      '// FileSystemRunInContextStrategy',
      'var fs = require("fs");',
      'var path = require("path");',
      'var vm = require("vm");',

      'function loadChunkFileSystemRunInContext(chunkId, rootOutputDir, logger, callback) {',
      Template.indent([
        `var filename = path.join(__dirname, rootOutputDir, chunkId + '.js');`,
        `logger("'chunk filename local load'", chunkId);`,

        'if (fs.existsSync(filename)) {',
        Template.indent([
          `fs.readFile(filename, 'utf-8', (err, content) => {`,
          Template.indent([
            'if (err) {',
            Template.indent([
              'callback(err, null);',
              'return;'
            ]),
            '}',
            'var chunk = {};',
            'try {',
            Template.indent([
              `vm.runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)(chunk, require, path.dirname(filename), filename);`,
              'callback(null, chunk);'
            ]),
            '} catch (e) {',
            Template.indent([
              `logger("'runInThisContext threw'", e);`,
              'callback(e, null);'
            ]),
            '}',
          ]),
          '});'
        ]),
        '} else {',
        Template.indent([
          'const err = new Error(`File ${filename} does not exist`);',
          'callback(err, null);'
        ]),
        '}'
      ]),
      '}'
    ]);
  }
}

export default FileSystemRunInContextStrategyRuntimeModule;
