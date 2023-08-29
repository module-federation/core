const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class FileSystemRunInContextStrategyRuntimeModule extends RuntimeModule {
  constructor() {
    super('dynamic-file-system', 10);
  }

  generate() {
    return Template.asString([
      '// DFS',
      'var DynamicFileSystem = function(strategy) {',
      Template.indent([
        'this.strategy = strategy;',
        'this.loadChunk = async function(chunkId, chunkName, remotes, logger, callback) {',
        Template.indent([
          'return await this.strategy.loadChunk(chunkId, chunkName, remotes, logger, callback);'
        ]),
        '};'
      ]),
      '};',
    ]);
  }
}

export default FileSystemRunInContextStrategyRuntimeModule;
