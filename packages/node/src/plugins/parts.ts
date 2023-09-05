import { Template, RuntimeGlobals } from 'webpack';

export function generateHmrCode(withHmr: boolean, rootOutputDir: string): string {
  if (!withHmr) {
    return '// no HMR';
  }

  return Template.asString([
    'function loadUpdateChunk(chunkId, updatedModulesList) {',
    Template.indent([
      'return new Promise(function(resolve, reject) {',
      Template.indent([
        `var filename = require('path').join(__dirname, ${JSON.stringify(
          rootOutputDir
        )} + ${RuntimeGlobals.getChunkUpdateScriptFilename}(chunkId));`,
        "require('fs').readFile(filename, 'utf-8', function(err, content) {",
        Template.indent([
          'if(err) return reject(err);',
          'var update = {};',
          "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
            "(update, require, require('path').dirname(filename), filename);",
          'var updatedModules = update.modules;',
          'var runtime = update.runtime;',
          'for(var moduleId in updatedModules) {',
          Template.indent([
            `if(${RuntimeGlobals.hasOwnProperty}(updatedModules, moduleId)) {`,
            Template.indent([
              `currentUpdate[moduleId] = updatedModules[moduleId];`,
              'if(updatedModulesList) updatedModulesList.push(moduleId);',
            ]),
            '}',
          ]),
          '}',
          'if(runtime) currentUpdateRuntime.push(runtime);',
          'resolve();',
        ]),
        '});',
      ]),
      '});',
    ]),
    '}',
    '',
    Template.getFunctionContent(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js')
    )
      .replace(/\$key\$/g, 'readFileVm')
      .replace(/\$installedChunks\$/g, 'installedChunks')
      .replace(/\$loadUpdateChunk\$/g, 'loadUpdateChunk')
      .replace(/\$moduleCache\$/g, RuntimeGlobals.moduleCache)
      .replace(/\$moduleFactories\$/g, RuntimeGlobals.moduleFactories)
      .replace(
        /\$ensureChunkHandlers\$/g,
        RuntimeGlobals.ensureChunkHandlers
      )
      .replace(/\$hasOwnProperty\$/g, RuntimeGlobals.hasOwnProperty)
      .replace(/\$hmrModuleData\$/g, RuntimeGlobals.hmrModuleData)
      .replace(
        /\$hmrDownloadUpdateHandlers\$/g,
        RuntimeGlobals.hmrDownloadUpdateHandlers
      )
      .replace(
        /\$hmrInvalidateModuleHandlers\$/g,
        RuntimeGlobals.hmrInvalidateModuleHandlers
      ),
  ]);
}