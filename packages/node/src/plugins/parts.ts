import { Template, RuntimeGlobals, Chunk, ChunkGraph } from 'webpack';
import DynamicFileSystem from '../filesystem/DynamicFilesystemRuntimeModule';
import { executeLoadTemplate } from './loadScript';

export function generateHmrCode(
  withHmr: boolean,
  rootOutputDir: string
): string {
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
      .replace(/\$ensureChunkHandlers\$/g, RuntimeGlobals.ensureChunkHandlers)
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
export function getInitialChunkIds(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  chunkHasJs: any
) {
  const initialChunkIds = new Set(chunk.ids);
  for (const c of chunk.getAllInitialChunks()) {
    if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
    if (c.ids) {
      for (const id of c.ids) initialChunkIds.add(id);
    }
    for (const c of chunk.getAllAsyncChunks()) {
      if (c === chunk || chunkHasJs(c, chunkGraph)) continue;
      if (c.ids) {
        for (const id of c.ids) initialChunkIds.add(id);
      }
    }
  }
  return initialChunkIds;
}
export function generateLoadingCode(
  withLoading: boolean,
  fn: string,
  hasJsMatcher: any,
  rootOutputDir: string,
  remotes: Record<string, string>,
  name: string | undefined
): string {
  if (!withLoading) {
    return '// no chunk loading';
  }

  return Template.asString([
    `if(!globalThis.__remote_scope__) globalThis.__remote_scope__ = ${RuntimeGlobals.require}.federation`,
    '// Dynamic filesystem chunk loading for javascript',
    `${fn}.readFileVm = function(chunkId, promises) {`,
    hasJsMatcher !== false
      ? Template.indent([
          '',
          'var installedChunkData = installedChunks[chunkId];',
          'if(installedChunkData !== 0) { // 0 means "already installed".',
          Template.indent([
            '// array of [resolve, reject, promise] means "currently loading"',
            'if(installedChunkData) {',
            Template.indent(['promises.push(installedChunkData[2]);']),
            '} else {',
            Template.indent([
              hasJsMatcher === true
                ? 'if(true) { // all chunks have JS'
                : `if(${hasJsMatcher('chunkId')}) {`,
              Template.indent([
                '// load the chunk and return promise to it',
                'var promise = new Promise(async function(resolve, reject) {',
                Template.indent([
                  'installedChunkData = installedChunks[chunkId] = [resolve, reject];',
                  'function installChunkCallback(error,chunk){',
                  Template.indent([
                    'if(error) return reject(error);',
                    'installChunk(chunk);',
                  ]),
                  '}',
                  'var fs = typeof process !== "undefined" ? require(\'fs\') : false;',
                  `var filename = typeof process !== "undefined" ? require('path').join(__dirname, ${JSON.stringify(
                    rootOutputDir
                  )} + ${
                    RuntimeGlobals.getChunkScriptFilename
                  }(chunkId)) : false;`,
                  'if(fs && fs.existsSync(filename)) {',
                  Template.indent([
                    `loadChunkStrategy('filesystem', chunkId, ${JSON.stringify(
                      rootOutputDir
                    )}, remotes, installChunkCallback);`,
                  ]),
                  '} else { ',
                  Template.indent([
                    `var remotes = ${JSON.stringify(
                      Object.values(remotes).reduce((acc, remote) => {
                        const [global, url] = remote.split('@');
                        acc[global] = url;
                        return acc;
                      }, {} as Record<string, string>)
                    )};`,

                    `var requestedRemote = ${
                      RuntimeGlobals.require
                    }.federation.remotes[${JSON.stringify(name)}]`,

                    "if(typeof requestedRemote === 'function'){",
                    Template.indent(
                      'requestedRemote = await requestedRemote()'
                    ),
                    '}',

                    `var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                    "const loadingStrategy = typeof process !== 'undefined' ?  'http-vm' : 'http-eval';",

                    `loadChunkStrategy(loadingStrategy, chunkName,${JSON.stringify(
                      name
                    )}, globalThis.__remote_scope__.remotes,installChunkCallback);`,
                  ]),
                  '}',
                ]),
                '});',
                'promises.push(installedChunkData[2] = promise);',
              ]),
              '} else installedChunks[chunkId] = 0;',
            ]),
            '}',
          ]),
          '}',
        ])
      : Template.indent(['installedChunks[chunkId] = 0;']),
    '};',
  ]);
}
export function generateHmrManifestCode(
  withHmrManifest: boolean,
  rootOutputDir: string
): string {
  if (!withHmrManifest) {
    return '// no HMR manifest';
  }

  return Template.asString([
    `${RuntimeGlobals.hmrDownloadManifest} = function() {`,
    Template.indent([
      'return new Promise(function(resolve, reject) {',
      Template.indent([
        `var filename = require('path').join(__dirname, ${JSON.stringify(
          rootOutputDir
        )} + ${RuntimeGlobals.getUpdateManifestFilename}());`,
        "require('fs').readFile(filename, 'utf-8', function(err, content) {",
        Template.indent([
          'if(err) {',
          Template.indent([
            'if(err.code === "ENOENT") return resolve();',
            'return reject(err);',
          ]),
          '}',
          'try { resolve(JSON.parse(content)); }',
          'catch(e) { reject(e); }',
        ]),
        '});',
      ]),
      '});',
    ]),
    '}',
  ]);
}
export function handleOnChunkLoad(
  withOnChunkLoad: boolean,
  runtimeTemplate: any
): string {
  if (withOnChunkLoad) {
    return `${
      RuntimeGlobals.onChunksLoaded
    }.readFileVm = ${runtimeTemplate.returningFunction(
      'installedChunks[chunkId] === 0',
      'chunkId'
    )};`;
  } else {
    return '// no on chunks loaded';
  }
}
/**
 * Generates the load script equivalent for server side.
 * @param {any} runtimeTemplate - The runtime template.
 * @returns {string} - The generated script.
 */
export function generateLoadScript(runtimeTemplate: any): string {
  return Template.asString([
    '// load script equivalent for server side',
    `${RuntimeGlobals.loadScript} = ${runtimeTemplate.basicFunction(
      'url,callback,chunkId',
      [
        Template.indent([
          'if(!globalThis.__remote_scope__) {',
          Template.indent([
            '// create a global scope for container, similar to how remotes are set on window in the browser',
            'globalThis.__remote_scope__ = {',
            '_config: {},',
            '}',
          ]),
          '}',
        ]),
        Template.indent([
"          console.log('executeLoadTemplate',url,chunkId)",
          executeLoadTemplate,
          `executeLoad(url,callback,chunkId)`,
        ]),
      ]
    )}`,
  ]);
}
export function generateInstallChunk(runtimeTemplate: any, withOnChunkLoad: boolean): string {
  return `var installChunk = ${runtimeTemplate.basicFunction('chunk', [
    'var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;',
    'for(var moduleId in moreModules) {',
    Template.indent([
      `if(${RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
      Template.indent([
        `${RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`,
      ]),
      '}',
    ]),
    '}',
    `if(runtime) runtime(__webpack_require__);`,
    'for(var i = 0; i < chunkIds.length; i++) {',
    Template.indent([
      'if(installedChunks[chunkIds[i]]) {',
      Template.indent(['installedChunks[chunkIds[i]][0]();']),
      '}',
      'installedChunks[chunkIds[i]] = 0;',
    ]),
    '}',
    withOnChunkLoad ? `${RuntimeGlobals.onChunksLoaded}();` : '',
  ])};`;
}
export  function generateExternalInstallChunkCode(withExternalInstallChunk: boolean, debug: boolean | undefined): string {
  if (!withExternalInstallChunk) {
    return '// no external install chunk';
  }

  return Template.asString([
    'module.exports = __webpack_require__;',
    `${RuntimeGlobals.externalInstallChunk} = function(){`,
   debug
      ? `console.debug('node: webpack installing to install chunk id:', arguments['0'].id);`
      : '',
    `return installChunk.apply(this, arguments)};`,
  ]);
}
