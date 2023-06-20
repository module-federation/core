/* eslint-disable @typescript-eslint/no-var-requires */
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const webpack_1 = require("webpack");
const identifier_1 = require("webpack/lib/util/identifier");
const compileBooleanMatcher_1 = tslib_1.__importDefault(require("webpack/lib/util/compileBooleanMatcher"));
const loadScript_1 = tslib_1.__importStar(require("./loadScript"));
class ReadFileChunkLoadingRuntimeModule extends webpack_1.RuntimeModule {
    constructor(runtimeRequirements, options, chunkLoadingContext) {
        super('readFile chunk loading', webpack_1.RuntimeModule.STAGE_ATTACH);
        this.runtimeRequirements = runtimeRequirements;
        this.options = options;
        this.chunkLoadingContext = chunkLoadingContext;
    }
    /**
     * @private
     * @param {Chunk} chunk chunk
     * @param {string} rootOutputDir root output directory
     * @returns {string} generated code
     */
    _generateBaseUri(chunk, rootOutputDir) {
        const options = chunk.getEntryOptions();
        if (options && options.baseUri) {
            return `${webpack_1.RuntimeGlobals.baseURI} = ${JSON.stringify(options.baseUri)};`;
        }
        return `${webpack_1.RuntimeGlobals.baseURI} = require("url").pathToFileURL(${rootOutputDir
            ? `__dirname + ${JSON.stringify('/' + rootOutputDir)}`
            : '__filename'});`;
    }
    /**
     * @private
     * @param {unknown[]} items item to log
     */
    _getLogger(...items) {
        if (!this.options.verbose) {
            return '';
        }
        return `console.log(${items.join(',')});`;
    }
    /**
     * @returns {string} runtime code
     */
    generate() {
        // name in this context is always the current remote itself.
        // this code below is in each webpack runtime, host and remotes
        // remote entries handle their own loading of chunks, so i have fractal self awareness
        // hosts will likely never run the http chunk loading runtime, they use fs.readFile
        // remotes only use fs.readFile if we were to cache the chunks on disk after fetching - otherwise its always using http
        // so for example, if im in hostA and require(remoteb/module) --> console.log of name in runtime code will return remoteb
        const { remotes = {}, name } = this.options;
        // for delegate modules, we need to avoid serializing internal modules, only register primitive configs in the runtime
        // delegates have their own registration code, so we dont need to handle them here.
        const remotesByType = Object.values(remotes).reduce((acc, remote) => {
            if (remote.startsWith('promise ') ||
                remote.startsWith('internal ') ||
                remote.startsWith('external ')) {
                acc.functional.push(remote);
            }
            else {
                acc.normal.push(remote);
            }
            return acc;
        }, { functional: [], normal: [] });
        const { webpack } = this.chunkLoadingContext;
        const chunkHasJs = (webpack && webpack.javascript.JavascriptModulesPlugin.chunkHasJs) ||
            require('webpack/lib/javascript/JavascriptModulesPlugin').chunkHasJs;
        // workaround for next.js
        const getInitialChunkIds = (chunk, chunkGraph) => {
            const initialChunkIds = new Set(chunk.ids);
            for (const c of chunk.getAllInitialChunks()) {
                if (c === chunk || chunkHasJs(c, chunkGraph))
                    continue;
                if (c.ids) {
                    for (const id of c.ids)
                        initialChunkIds.add(id);
                }
            }
            return initialChunkIds;
        };
        const { chunkGraph, chunk } = this;
        const { runtimeTemplate } = this.compilation;
        const fn = webpack_1.RuntimeGlobals.ensureChunkHandlers;
        const withBaseURI = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.baseURI);
        const withExternalInstallChunk = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.externalInstallChunk);
        const withOnChunkLoad = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.onChunksLoaded);
        const withLoading = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.ensureChunkHandlers);
        const withHmr = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.hmrDownloadUpdateHandlers);
        const withHmrManifest = this.runtimeRequirements.has(webpack_1.RuntimeGlobals.hmrDownloadManifest);
        const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
        const hasJsMatcher = (0, compileBooleanMatcher_1.default)(conditionMap);
        const initialChunkIds = getInitialChunkIds(chunk, chunkGraph); // , chunkHasJs);
        const outputName = this.compilation.getPath(((webpack &&
            webpack.javascript.JavascriptModulesPlugin
                .getChunkFilenameTemplate) ||
            require('webpack/lib/javascript/JavascriptModulesPlugin')
                .getChunkFilenameTemplate)(chunk, this.compilation.outputOptions), {
            chunk,
            contentHashType: 'javascript',
        });
        const rootOutputDir = (0, identifier_1.getUndoPath)(outputName, this.compilation.outputOptions.path, false);
        const stateExpression = withHmr
            ? `${webpack_1.RuntimeGlobals.hmrRuntimeStatePrefix}_readFileVm`
            : undefined;
        return webpack_1.Template.asString([
            withBaseURI
                ? this._generateBaseUri(chunk, rootOutputDir)
                : '// no baseURI',
            '',
            '// object to store loaded chunks',
            '// "0" means "already loaded", Promise means loading',
            `var installedChunks = ${stateExpression ? `${stateExpression} = ${stateExpression} || ` : ''}{`,
            webpack_1.Template.indent(Array.from(initialChunkIds, (id) => `${JSON.stringify(id)}: 0`).join(',\n')),
            '};',
            '',
            withOnChunkLoad
                ? `${webpack_1.RuntimeGlobals.onChunksLoaded}.readFileVm = ${runtimeTemplate.returningFunction('installedChunks[chunkId] === 0', 'chunkId')};`
                : '// no on chunks loaded',
            '',
            withLoading || withExternalInstallChunk
                ? `var installChunk = ${runtimeTemplate.basicFunction('chunk', [
                    'var moreModules = chunk.modules, chunkIds = chunk.ids, runtime = chunk.runtime;',
                    'for(var moduleId in moreModules) {',
                    webpack_1.Template.indent([
                        `if(${webpack_1.RuntimeGlobals.hasOwnProperty}(moreModules, moduleId)) {`,
                        webpack_1.Template.indent([
                            `${webpack_1.RuntimeGlobals.moduleFactories}[moduleId] = moreModules[moduleId];`,
                        ]),
                        '}',
                    ]),
                    '}',
                    `if(runtime) runtime(__webpack_require__);`,
                    'for(var i = 0; i < chunkIds.length; i++) {',
                    webpack_1.Template.indent([
                        'if(installedChunks[chunkIds[i]]) {',
                        webpack_1.Template.indent(['installedChunks[chunkIds[i]][0]();']),
                        '}',
                        'installedChunks[chunkIds[i]] = 0;',
                    ]),
                    '}',
                    withOnChunkLoad ? `${webpack_1.RuntimeGlobals.onChunksLoaded}();` : '',
                ])};`
                : '// no chunk install function needed',
            '',
            withLoading
                ? webpack_1.Template.asString([
                    '// load script equivalent for server side',
                    `${webpack_1.RuntimeGlobals.loadScript} = ${runtimeTemplate.basicFunction('url,callback,chunkId', [
                        webpack_1.Template.indent([
                            'if(!global.__remote_scope__) {',
                            webpack_1.Template.indent([
                                '// create a global scope for container, similar to how remotes are set on window in the browser',
                                'global.__remote_scope__ = {',
                                '_config: {},',
                                '}',
                            ]),
                            '}',
                        ]),
                        webpack_1.Template.indent([
                            loadScript_1.executeLoadTemplate,
                            `executeLoad(url,callback,chunkId)`,
                        ]),
                    ])}`,
                ])
                : '// no remote script loader needed',
            withLoading
                ? webpack_1.Template.asString([
                    '// ReadFile + VM.run chunk loading for javascript',
                    `${fn}.readFileVm = function(chunkId, promises) {`,
                    hasJsMatcher !== false
                        ? webpack_1.Template.indent([
                            '',
                            'var installedChunkData = installedChunks[chunkId];',
                            'if(installedChunkData !== 0) { // 0 means "already installed".',
                            webpack_1.Template.indent([
                                '// array of [resolve, reject, promise] means "currently loading"',
                                'if(installedChunkData) {',
                                webpack_1.Template.indent(['promises.push(installedChunkData[2]);']),
                                '} else {',
                                webpack_1.Template.indent([
                                    hasJsMatcher === true
                                        ? 'if(true) { // all chunks have JS'
                                        : `if(${hasJsMatcher('chunkId')}) {`,
                                    webpack_1.Template.indent([
                                        '// load the chunk and return promise to it',
                                        'var promise = new Promise(async function(resolve, reject) {',
                                        webpack_1.Template.indent([
                                            'installedChunkData = installedChunks[chunkId] = [resolve, reject];',
                                            `var filename = require('path').join(__dirname, ${JSON.stringify(rootOutputDir)} + ${webpack_1.RuntimeGlobals.getChunkScriptFilename}(chunkId));`,
                                            "var fs = require('fs');",
                                            'if(fs.existsSync(filename)) {',
                                            webpack_1.Template.indent([
                                                "fs.readFile(filename, 'utf-8', function(err, content) {",
                                                webpack_1.Template.indent([
                                                    'if(err) return reject(err);',
                                                    'var chunk = {};',
                                                    "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                                        "(chunk, require, require('path').dirname(filename), filename);",
                                                    'installChunk(chunk);',
                                                ]),
                                                '});',
                                            ]),
                                            '} else {',
                                            webpack_1.Template.indent([
                                                loadScript_1.default,
                                                this._getLogger(`'needs to load remote module from ${JSON.stringify(name)}'`),
                                                this._getLogger(`'remotes known to'`, JSON.stringify(name), JSON.stringify(remotes)),
                                                // keys are mostly useless here, we want to find remote by its global (unique name)
                                                `var remotes = ${JSON.stringify(Object.values(remotesByType.normal).reduce((acc, remote) => {
                                                    //TODO: need to handle all other cases like when remote is not a @ syntax string
                                                    const [global, url] = remote.split('@');
                                                    acc[global] = url;
                                                    return acc;
                                                }, {}))};`,
                                                'Object.assign(global.__remote_scope__._config, remotes)',
                                                'const remoteRegistry = global.__remote_scope__._config',
                                                /*
                                          TODO: keying by global should be ok, but need to verify - need to deal with when user passes promise new promise() global will/should still exist - but can only be known at runtime
                                        */
                                                this._getLogger(`'remotes keyed by global name'`, JSON.stringify(remotesByType.normal)),
                                                this._getLogger(`'remote scope configs'`, 'global.__remote_scope__._config'),
                                                this._getLogger(`'before remote scope'`),
                                                this._getLogger(`'global.__remote_scope__'`, `global.__remote_scope__`),
                                                this._getLogger(`'global.__remote_scope__[${JSON.stringify(name)}]'`, `global.__remote_scope__[${JSON.stringify(name)}]`),
                                                /*   TODO: this global.REMOTE_CONFIG doesnt work in this v5 core, not sure if i need to keep it or not
                                             not deleting it yet since i might need this for tracking all the remote entries across systems
                                             for now, im going to use locally known remote scope from remoteEntry config
                                             update: We will most likely need this, since remote would not have its own config
                                             id need to access the host system and find the known url
                                              basically this is how i create publicPath: auto on servers.
                                             `var requestedRemote = global.REMOTE_CONFIG[${JSON.stringify(
                                              name
                                            )}]`,
                                         */
                                                `var requestedRemote = remoteRegistry[${JSON.stringify(name)}]`,
                                                this._getLogger(`'requested remote'`, `requestedRemote`),
                                                /*TODO: we need to support when user implements own promise new promise function
                                                for example i have my own promise remotes, not global@remotename
                                                so there could be cases where remote may be function still - not sure */
                                                /*TODO: need to handle if chunk fetch fails/crashes - ensure server still can keep loading
                                                right now if you throw an error in here, server will stall forever */
                                                `if(typeof requestedRemote === 'function'){
                    requestedRemote = await requestedRemote()
                  }`,
                                                this._getLogger(`'var requestedRemote'`, `requestedRemote`),
                                                // example: uncomment this and server will never reply
                                                // `var scriptUrl = new URL(requestedRemote.split("@")[1]);`,
                                                // since im looping over remote and creating global at build time, i dont need to split string at runtime
                                                // there may still be a use case for that with promise new promise, depending on how we design it.
                                                `var scriptUrl = new URL(requestedRemote);`,
                                                this._getLogger(`'global.__remote_scope__'`, `global.__remote_scope__`),
                                                `var chunkName = ${webpack_1.RuntimeGlobals.getChunkScriptFilename}(chunkId);`,
                                                this._getLogger(`'chunkname to request'`, `chunkName`),
                                                `var fileToReplace = require('path').basename(scriptUrl.pathname);`,
                                                `scriptUrl.pathname = scriptUrl.pathname.replace(fileToReplace, chunkName);`,
                                                this._getLogger(`'will load remote chunk'`, `scriptUrl.toString()`),
                                                `loadScript(scriptUrl.toString(), function(err, content) {`,
                                                webpack_1.Template.indent([
                                                    this._getLogger(`'load script callback fired'`),
                                                    "if(err) {console.error('error loading remote chunk', scriptUrl.toString(),'got',content,'with error', err); return reject(err);}",
                                                    'var chunk = {};',
                                                    'try {',
                                                    "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                                        "(chunk, require, require('path').dirname(filename), filename);",
                                                    '} catch (e) {',
                                                    "console.error('runInThisContext threw', e)",
                                                    '}',
                                                    'installChunk(chunk);',
                                                ]),
                                                '}, chunkId);',
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
                        : webpack_1.Template.indent(['installedChunks[chunkId] = 0;']),
                    '};',
                ])
                : '// no chunk loading',
            '',
            withExternalInstallChunk
                ? webpack_1.Template.asString([
                    'module.exports = __webpack_require__;',
                    `${webpack_1.RuntimeGlobals.externalInstallChunk} = installChunk;`,
                ])
                : '// no external install chunk',
            '',
            withHmr
                ? webpack_1.Template.asString([
                    'function loadUpdateChunk(chunkId, updatedModulesList) {',
                    webpack_1.Template.indent([
                        'return new Promise(function(resolve, reject) {',
                        webpack_1.Template.indent([
                            `var filename = require('path').join(__dirname, ${JSON.stringify(rootOutputDir)} + ${webpack_1.RuntimeGlobals.getChunkUpdateScriptFilename}(chunkId));`,
                            "require('fs').readFile(filename, 'utf-8', function(err, content) {",
                            webpack_1.Template.indent([
                                'if(err) return reject(err);',
                                'var update = {};',
                                "require('vm').runInThisContext('(function(exports, require, __dirname, __filename) {' + content + '\\n})', filename)" +
                                    "(update, require, require('path').dirname(filename), filename);",
                                'var updatedModules = update.modules;',
                                'var runtime = update.runtime;',
                                'for(var moduleId in updatedModules) {',
                                webpack_1.Template.indent([
                                    `if(${webpack_1.RuntimeGlobals.hasOwnProperty}(updatedModules, moduleId)) {`,
                                    webpack_1.Template.indent([
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
                    webpack_1.Template.getFunctionContent(require('webpack/lib/hmr/JavascriptHotModuleReplacement.runtime.js'))
                        .replace(/\$key\$/g, 'readFileVm')
                        .replace(/\$installedChunks\$/g, 'installedChunks')
                        .replace(/\$loadUpdateChunk\$/g, 'loadUpdateChunk')
                        .replace(/\$moduleCache\$/g, webpack_1.RuntimeGlobals.moduleCache)
                        .replace(/\$moduleFactories\$/g, webpack_1.RuntimeGlobals.moduleFactories)
                        .replace(/\$ensureChunkHandlers\$/g, webpack_1.RuntimeGlobals.ensureChunkHandlers)
                        .replace(/\$hasOwnProperty\$/g, webpack_1.RuntimeGlobals.hasOwnProperty)
                        .replace(/\$hmrModuleData\$/g, webpack_1.RuntimeGlobals.hmrModuleData)
                        .replace(/\$hmrDownloadUpdateHandlers\$/g, webpack_1.RuntimeGlobals.hmrDownloadUpdateHandlers)
                        .replace(/\$hmrInvalidateModuleHandlers\$/g, webpack_1.RuntimeGlobals.hmrInvalidateModuleHandlers),
                ])
                : '// no HMR',
            '',
            withHmrManifest
                ? webpack_1.Template.asString([
                    `${webpack_1.RuntimeGlobals.hmrDownloadManifest} = function() {`,
                    webpack_1.Template.indent([
                        'return new Promise(function(resolve, reject) {',
                        webpack_1.Template.indent([
                            `var filename = require('path').join(__dirname, ${JSON.stringify(rootOutputDir)} + ${webpack_1.RuntimeGlobals.getUpdateManifestFilename}());`,
                            "require('fs').readFile(filename, 'utf-8', function(err, content) {",
                            webpack_1.Template.indent([
                                'if(err) {',
                                webpack_1.Template.indent([
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
                ])
                : '// no HMR manifest',
        ]);
    }
}
exports.default = ReadFileChunkLoadingRuntimeModule;
//# sourceMappingURL=LoadFileChunkLoadingRuntimeModule.js.map