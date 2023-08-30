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
        'console.log("DynamicFileSystem", {strategy});',
        'var loadChunk = async function(chunkId,rootOutputDir, remotes, callback) {',
        Template.indent([
          'return await strategy(chunkId,rootOutputDir, remotes, callback);'
        ]),
        '};',
        "return {loadChunk:loadChunk};"
      ]),
      '};',
    ]);
  }
}

export default FileSystemRunInContextStrategyRuntimeModule;
