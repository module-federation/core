const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
const {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} = require('./stratagies');

class DynamicFilesystemChunkLoadingRuntimeModule extends RuntimeModule {
  constructor() {
    super('dynamic-filesystem-chunk-loading', RuntimeModule.STAGE_BASIC);
  }

  _generateBaseUri(chunk, rootOutputDir) {
    const options = chunk.getEntryOptions();
    if (options && options.baseUri) {
      return `${RuntimeGlobals.baseURI} = ${JSON.stringify(options.baseUri)};`;
    }

    return `${RuntimeGlobals.baseURI} = require("url").pathToFileURL(${
      rootOutputDir
        ? `__dirname + ${JSON.stringify('/' + rootOutputDir)}`
        : '__filename'
    });`;
  }

  /**
   * @private
   * @param {unknown[]} items item to log
   */
  _getLogger(...items) {
    if (!this.options.debug) {
      return '';
    }

    return `console.log(${items.join(',')});`;
  }
  /**
   * @returns {string} runtime code
   */
  generate() {
    // Code from DynamicFilesystemChunkLoadingPlugin.js
    const dynamicFilesystemChunkLoadingPluginCode = Template.asString([
      fileSystemRunInContextStrategy.toString(),
      httpEvalStrategy.toString(),
      httpVmStrategy.toString(),
      'const loadChunkStrategy = async (strategyType,chunkId,rootOutputDir, remotes, callback) => {',
      Template.indent([
        'switch (strategyType) {',
        Template.indent([
          'case "filesystem": return await fileSystemRunInContextStrategy(chunkId,rootOutputDir, remotes, callback);',
          'case "http-eval": return await httpEvalStrategy(chunkId,rootOutputDir, remotes, callback);',
          'case "http-vm": return await httpVmStrategy(chunkId,rootOutputDir, remotes, callback);',
          'default: throw new Error("Invalid strategy type");',
        ]),
        '}',
      ]),
      '};',
    ]);
    return Template.asString([
      dynamicFilesystemChunkLoadingPluginCode,
      // ...
    ]);
  }
}

module.exports = DynamicFilesystemChunkLoadingRuntimeModule;
