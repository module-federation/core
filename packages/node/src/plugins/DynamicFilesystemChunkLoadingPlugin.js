const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
import {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} from './stratagies';


const { RuntimeModule, RuntimeGlobals, Template } = require('webpack');
import {
  fileSystemRunInContextStrategy,
  httpEvalStrategy,
  httpVmStrategy,
} from './strategies';

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
    _getLogger(...items]) {
        if (!this.options.debug) {
          return '';
        }
    
        return `console.log(${items.join(',')});`;
      }
  /**
   * @returns {string} runtime code
   */
 /**
 * @returns {string} runtime code
 */
override generate() {
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
      // Add the contents of CommonJsChunkLoadingPlugin.ts here
      Template.asString([
        'const installedChunks = {};',
        '',
        'const promise = new Promise((resolve, reject) => {',
        Template.indent([
          'installedChunks[chunkId] = [resolve, reject];',
        ]),
        '});',
        '',
        'const onScriptComplete = (event) => {',
        Template.indent([
          '// ...',
        ]),
        '};',
        '',
        'const script = document.createElement("script");',
        'script.src = url;',
        'script.onerror = script.onload = onScriptComplete;',
        'document.head.appendChild(script);',
        '',
        'return promise;',
      ]),
      // ...
    ]);
  
    // Existing code from ReadFileChunkLoadingRuntimeModule's generate method
    // ...
  
    // Combine the code from both snippets
    return Template.asString([
      dynamicFilesystemChunkLoadingPluginCode,
      // ...
    ]);
  }
}

export default DynamicFilesystemChunkLoadingRuntimeModule;
  


  

