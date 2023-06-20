"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FederatedTypesPlugin", {
    enumerable: true,
    get: function() {
        return FederatedTypesPlugin;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _fs = /*#__PURE__*/ _interop_require_default._(require("fs"));
const _path = /*#__PURE__*/ _interop_require_default._(require("path"));
const _axios = /*#__PURE__*/ _interop_require_default._(require("axios"));
const _utilities = require("@module-federation/utilities");
const _TypescriptCompiler = require("../lib/TypescriptCompiler");
const _normalizeOptions = require("../lib/normalizeOptions");
const _Caching = require("../lib/Caching");
const _FederatedTypesStatsPlugin = require("./FederatedTypesStatsPlugin");
const _download = /*#__PURE__*/ _interop_require_default._(require("../lib/download"));
const PLUGIN_NAME = 'FederatedTypesPlugin';
let FederatedTypesPlugin = class FederatedTypesPlugin {
    apply(compiler) {
        this.normalizeOptions = (0, _normalizeOptions.normalizeOptions)(this.options, compiler);
        const { disableDownloadingRemoteTypes , disableTypeCompilation  } = this.normalizeOptions;
        // Bail if both 'disableDownloadingRemoteTypes' & 'disableTypeCompilation' are 'truthy'
        if (disableDownloadingRemoteTypes && disableTypeCompilation) {
            return;
        }
        this.logger = _utilities.Logger.setLogger(compiler.getInfrastructureLogger(PLUGIN_NAME));
        compiler.options.watchOptions.ignored = this.normalizeOptions.ignoredWatchOptions;
        if (!disableDownloadingRemoteTypes) {
            const importRemotes = async (callback)=>{
                try {
                    await this.importRemoteTypes();
                    callback();
                } catch (error) {
                    callback(this.getError(error));
                }
            };
            compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, async (_, callback)=>{
                this.logger.log('Preparing to download types from remotes on startup');
                await importRemotes(callback);
            });
            compiler.hooks.watchRun.tapAsync(PLUGIN_NAME, async (_, callback)=>{
                this.logger.log('Preparing to download types from remotes');
                await importRemotes(callback);
            });
        }
        if (!disableTypeCompilation) {
            compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (_, params)=>{
                this.logger.log('Preparing to Generate types');
                const filesMap = this.compileTypes();
                params.federated_types = filesMap;
            });
            new _FederatedTypesStatsPlugin.FederatedTypesStatsPlugin(this.normalizeOptions).apply(compiler);
        }
    }
    compileTypes() {
        const exposedComponents = this.options.federationConfig.exposes;
        if (!exposedComponents) {
            return {};
        }
        // './Component': 'path/to/component' -> ['./Component', 'path/to/component']
        const compiler = new _TypescriptCompiler.TypescriptCompiler(this.normalizeOptions);
        try {
            return compiler.generateDeclarationFiles(exposedComponents, this.options.additionalFilesToCompile);
        } catch (error) {
            this.logger.error(error);
            throw error;
        }
    }
    async importRemoteTypes() {
        const remoteComponents = this.options.federationConfig.remotes;
        if (!remoteComponents || remoteComponents && (0, _utilities.isObjectEmpty)(remoteComponents)) {
            this.logger.log('No Remote components configured');
            return;
        }
        this.logger.log('Normalizing remote URLs');
        const remoteUrls = Object.entries(remoteComponents).map(([remote, entry])=>{
            const remoteUrl = entry.substring(0, entry.lastIndexOf('/'));
            const splitIndex = remoteUrl.indexOf('@');
            const url = remoteUrl.substring(splitIndex + 1);
            return {
                origin: url != null ? url : remoteUrl,
                remote
            };
        });
        for await (const { origin , remote  } of remoteUrls){
            const { typescriptFolderName , downloadRemoteTypesTimeout  } = this.normalizeOptions;
            try {
                this.logger.log(`Getting types index for remote '${remote}'`);
                const resp = await _axios.default.get(`${origin}/${this.normalizeOptions.typesIndexJsonFileName}`, {
                    timeout: downloadRemoteTypesTimeout
                });
                const statsJson = resp.data;
                if (statsJson == null ? void 0 : statsJson.files) {
                    this.logger.log(`Checking with Cache entries`);
                    const { filesToCacheBust , filesToDelete  } = _Caching.TypesCache.getCacheBustedFiles(remote, statsJson);
                    this.logger.log('filesToCacheBust', filesToCacheBust);
                    this.logger.log('filesToDelete', filesToDelete);
                    if (filesToDelete.length > 0) {
                        filesToDelete.forEach((file)=>{
                            _fs.default.unlinkSync(_path.default.resolve(this.normalizeOptions.webpackCompilerOptions.context, typescriptFolderName, remote, file));
                        });
                    }
                    if (filesToCacheBust.length > 0) {
                        await Promise.all(filesToCacheBust.map((file)=>{
                            const url = new URL(_path.default.join(origin, typescriptFolderName, file)).toString();
                            const destination = _path.default.join(this.normalizeOptions.webpackCompilerOptions.context, typescriptFolderName, remote);
                            this.logger.log('Downloading types...');
                            return (0, _download.default)({
                                url,
                                destination,
                                filename: file
                            });
                        }));
                        this.logger.log('downloading complete');
                    }
                } else {
                    this.logger.log(`No types index found for remote '${remote}'`);
                }
            } catch (error) {
                this.logger.error(`Unable to download '${remote}' remote types index file: `, error.message);
                this.logger.log(error);
            }
        }
    }
    getError(error) {
        if (error instanceof Error) return error;
        return new Error(error);
    }
    constructor(options){
        this.options = options;
    }
};

//# sourceMappingURL=FederatedTypesPlugin.js.map