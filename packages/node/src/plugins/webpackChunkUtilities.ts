import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const { RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Chunk, ChunkGraph } from 'webpack';

/**
 * Generates the hot module replacement (HMR) code.
 * @param {boolean} withHmr - Flag indicating whether HMR is enabled.
 * @param {string} rootOutputDir - The root output directory.
 * @returns {string} - The generated HMR code.
 */
export function generateHmrCode(
  withHmr: boolean,
  rootOutputDir: string,
): string {
  if (!withHmr) {
    return '// no HMR';
  }

  return Template.asString([
    // Function to load updated chunk
    'function loadUpdateChunk(chunkId, updatedModulesList) {',
    Template.indent([
      'return new Promise(function(resolve, reject) {',
      Template.indent([
        // Construct filename for the updated chunk
        `var filename = require('path').join(__dirname, ${JSON.stringify(
          rootOutputDir,
        )} + ${RuntimeGlobals.getChunkUpdateScriptFilename}(chunkId));`,
        // Read the updated chunk file
        "require('fs').readFile(filename, 'utf-8', function(err, content) {",
        Template.indent([
          'if(err) return reject(err);',
          'var update = {};',
          // Execute the updated chunk in the current context
          "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
            "(update, require, require('path').dirname(filename), filename);",
          'var updatedModules = update.modules;',
          'var runtime = update.runtime;',
          // Iterate over the updated modules
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
    // Replace placeholders in the HMR runtime code
    Template.getFunctionContent(
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js'),
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
        RuntimeGlobals.hmrDownloadUpdateHandlers,
      )
      .replace(
        /\$hmrInvalidateModuleHandlers\$/g,
        RuntimeGlobals.hmrInvalidateModuleHandlers,
      ),
  ]);
}
/**
 * Retrieves the initial chunk IDs.
 * @param {Chunk} chunk - The chunk object.
 * @param {ChunkGraph} chunkGraph - The chunk graph object.
 * @param {any} chunkHasJs - Function to check if a chunk has JavaScript.
 * @returns {Set} - The set of initial chunk IDs.
 */
export function getInitialChunkIds(
  chunk: Chunk,
  chunkGraph: ChunkGraph,
  chunkHasJs: any,
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
/**
 * Generates the loading code for chunks.
 * @param {boolean} withLoading - Flag indicating whether chunk loading is enabled.
 * @param {string} fn - The function name.
 * @param {any} hasJsMatcher - Function to check if a chunk has JavaScript.
 * @param {string} rootOutputDir - The root output directory.
 * @param {Record<string, string>} remotes - The remotes object.
 * @param {string | undefined} name - The name of the chunk.
 * @returns {string} - The generated loading code.
 */
export function generateLoadingCode(
  withLoading: boolean,
  fn: string,
  hasJsMatcher: any,
  rootOutputDir: string,
  remotes: Record<string, string>,
  name: string | undefined,
): string {
  if (!withLoading) {
    return '// no chunk loading';
  }

  return Template.asString([
    '// Dynamic filesystem chunk loading for javascript',
    `${fn}.readFileVm = function(chunkId, promises) {`,
    hasJsMatcher !== false
      ? Template.indent([
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
                    rootOutputDir,
                  )} + ${
                    RuntimeGlobals.getChunkScriptFilename
                  }(chunkId)) : false;`,

                  'if(fs && fs.existsSync(filename)) {',
                  Template.indent([
                    `loadChunkStrategy('filesystem', chunkId, ${JSON.stringify(
                      rootOutputDir,
                    )}, remotes, installChunkCallback);`,
                  ]),
                  '} else { ',
                  Template.indent([
                    `var remotes = ${JSON.stringify(
                      Object.values(remotes).reduce(
                        (acc, remote) => {
                          const [global, url] = remote.split('@');
                          acc[global] = url;
                          return acc;
                        },
                        {} as Record<string, string>,
                      ),
                    )};`,

                    `var chunkName = ${RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                    "const loadingStrategy = typeof process !== 'undefined' ?  'http-vm' : 'http-eval';",
                    `loadChunkStrategy(loadingStrategy, chunkName,${RuntimeGlobals.require}.federation.initOptions.name, ${RuntimeGlobals.require}.federation.initOptions.remotes, installChunkCallback);`,
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
/**
 * Generates the HMR manifest code.
 * @param {boolean} withHmrManifest - Flag indicating whether HMR manifest is enabled.
 * @param {string} rootOutputDir - The root output directory.
 * @returns {string} - The generated HMR manifest code.
 */
export function generateHmrManifestCode(
  withHmrManifest: boolean,
  rootOutputDir: string,
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
          rootOutputDir,
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
/**
 * Handles the on chunk load event.
 * @param {boolean} withOnChunkLoad - Flag indicating whether on chunk load event is enabled.
 * @param {any} runtimeTemplate - The runtime template.
 * @returns {string} - The generated on chunk load event handler.
 */
export function handleOnChunkLoad(
  withOnChunkLoad: boolean,
  runtimeTemplate: any,
): string {
  if (withOnChunkLoad) {
    return `${
      RuntimeGlobals.onChunksLoaded
    }.readFileVm = ${runtimeTemplate.returningFunction(
      'installedChunks[chunkId] === 0',
      'chunkId',
    )};`;
  } else {
    return '// no on chunks loaded';
  }
}
/**
 * Generates the load script for server-side execution. This function creates a script that loads a remote module
 * and executes it in the current context. It supports both browser and Node.js environments.
 * @param {any} runtimeTemplate - The runtime template used to generate the load script.
 * @returns {string} - The generated load script.
 */
export function generateLoadScript(runtimeTemplate: any): string {
  return Template.asString([
    '// load script equivalent for server side',
    `${RuntimeGlobals.loadScript} = ${runtimeTemplate.basicFunction(
      'url, callback, chunkId',
      [
        Template.indent([
          `async function executeLoad(url, callback, name) {
            if (!name) {
              throw new Error('__webpack_require__.l name is required for ' + url);
            }
            const usesInternalRef = name.startsWith('__webpack_require__')
            if (usesInternalRef) {
              const regex = /__webpack_require__\\.federation\\.instance\\.moduleCache\\.get\\(([^)]+)\\)/;
              const match = name.match(regex);
              if (match) {
                name = match[1].replace(/["']/g, '');
              }
            }
            try {
              const federation = ${RuntimeGlobals.require}.federation;
              const res = await ${RuntimeGlobals.require}.federation.runtime.loadScriptNode(url, { attrs: {} });
              const enhancedRemote = federation.instance.initRawContainer(name, url, res);
              // use normal global assignment
              if(!usesInternalRef && !globalThis[name]) {
                globalThis[name] = enhancedRemote
              }
              callback(enhancedRemote);
            } catch (error) {
              callback(error);
            }

          }`,
          `executeLoad(url, callback, chunkId);`,
        ]),
      ],
    )}`,
  ]);
}
export function generateInstallChunk(
  runtimeTemplate: any,
  withOnChunkLoad: boolean,
): string {
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
    'if(runtime) runtime(__webpack_require__);',
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
export function generateExternalInstallChunkCode(
  withExternalInstallChunk: boolean,
  debug: boolean | undefined,
): string {
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
