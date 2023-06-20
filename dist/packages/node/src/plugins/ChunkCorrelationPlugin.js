"use strict";
const PLUGIN_NAME = 'FederationStatsPlugin';
/** @typedef {import("./webpack-stats-types").WebpackStats} WebpackStats */
/** @typedef {import(  "./webpack-stats-types").WebpackStatsChunk} WebpackStatsChunk */
/** @typedef {import("./webpack-stats-types").WebpackStatsModule} WebpackStatsModule */
/**
 * @typedef {object} SharedDependency
 * @property {string} shareScope
 * @property {string} shareKey
 * @property {string} requiredVersion
 * @property {boolean} strictVersion
 * @property {boolean} singleton
 * @property {boolean} eager
 */
/**
 * @typedef {object} SharedModule
 * @property {string[]} chunks
 * @property {SharedDependency[]} provides
 */
/**
 * @typedef {object} Exposed
 * @property {string[]} chunks
 * @property {SharedModule[]} sharedModules
 */
/**
 * @typedef {object} FederatedContainer
 * @property {string} remote
 * @property {string} entry
 * @property {SharedModule[]} sharedModules
 * @property {{ [key: string]: Exposed }} exposes
 */
/**
 * @typedef {object} FederatedStats
 * @property {SharedModule[]} sharedModules
 * @property {FederatedContainer[]} federatedModules
 */
const concat = (x, y) => x.concat(y);
const flatMap = (xs, f) => xs.map(f).reduce(concat, []);
/**
 *
 * @param {WebpackStats} stats
 * @returns {}
 */
function getRemoteModules(stats) {
    return stats.modules
        .filter((mod) => mod.moduleType === 'remote-module')
        .reduce((acc, remoteModule) => {
        acc[remoteModule.nameForCondition] = remoteModule.id;
        return acc;
    }, {});
}
/**
 *
 * @param {WebpackStats} stats
 * @param {string} exposedFile
 * @returns {WebpackStatsModule[]}
 */
function getExposedModules(stats, exposedFile) {
    return stats.modules.filter((mod) => mod.name.startsWith(exposedFile));
}
/**
 *
 * @param {WebpackStats} stats
 * @param {WebpackStatsModule} mod
 * @returns {Exposed}
 */
function getExposed(stats, mod) {
    const chunks = stats.chunks.filter((chunk) => mod.chunks.some((id) => id === chunk.id));
    const flatChunks = flatMap(chunks, (chunk) => ({
        [chunk.id]: chunk.files.map((f) => `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`),
    }));
    return flatChunks.reduce((acc, chunk) => {
        Object.assign(acc, chunk);
        return acc;
    }, {});
}
/**
 *
 * @param {import("webpack").Module} mod
 * @param {(issuer: string) => boolean} check
 * @returns {boolean}
 */
function searchIssuer(mod, check) {
    if (mod.issuer && check(mod.issuer)) {
        return true;
    }
    return !!mod.modules && mod.modules.some((m) => searchIssuer(m, check));
}
/**
 * @param {import("webpack").Module} mod
 * @param {(issuer: string) => boolean} check
 * @returns {string[]}
 */
function getIssuers(mod, check) {
    if (mod.issuer && check(mod.issuer)) {
        return [mod.issuer];
    }
    return ((mod.modules &&
        mod.modules.filter((m) => searchIssuer(m, check)).map((m) => m.issuer)) ||
        []);
}
/**
 * @param {string} issuer
 * @returns {SharedDependency}
 */
function parseFederatedIssuer(issuer) {
    const split = issuer?.split('|') || [];
    if (split.length !== 8 || split[0] !== 'consume-shared-module') {
        return null;
    }
    const [, shareScope, shareKey, requiredVersion, strictVersion, , singleton, eager,] = split;
    return {
        shareScope,
        shareKey,
        requiredVersion,
        strictVersion: JSON.parse(strictVersion),
        singleton: JSON.parse(singleton),
        eager: JSON.parse(eager),
    };
}
/**
 *
 * @param {WebpackStats} stats
 * @param {import("webpack").container.ModuleFederationPlugin} federationPlugin
 * @returns {SharedModule[]}
 */
function getSharedModules(stats, federationPlugin) {
    return flatMap(stats.chunks.filter((chunk) => {
        if (!stats.entrypoints[federationPlugin._options.name]) {
            return false;
        }
        return stats.entrypoints[federationPlugin._options.name].chunks.some((id) => chunk.id === id);
    }), (chunk) => flatMap(chunk.children, (id) => stats.chunks.filter((c) => c.id === id &&
        c.files.length > 0 &&
        c.parents.some((p) => stats.entrypoints[federationPlugin._options.name].chunks.some((c) => c === p)) &&
        c.modules.some((m) => searchIssuer(m, (issuer) => issuer?.startsWith('consume-shared-module'))))))
        .map((chunk) => ({
        chunks: chunk.files.map((f) => `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`),
        provides: flatMap(chunk.modules.filter((m) => searchIssuer(m, (issuer) => issuer?.startsWith('consume-shared-module'))), (m) => getIssuers(m, (issuer) => issuer?.startsWith('consume-shared-module')))
            .map(parseFederatedIssuer)
            .filter((f) => !!f),
    }))
        .filter((c) => c.provides.length > 0);
}
/**
 * @param {WebpackStats} stats
 * @returns {SharedModule[]}
 */
function getMainSharedModules(stats) {
    const chunks = stats.namedChunkGroups['main']
        ? flatMap(stats.namedChunkGroups['main'].chunks, (c) => stats.chunks.filter((chunk) => chunk.id === c))
        : [];
    return flatMap(chunks, (chunk) => flatMap(chunk.children, (id) => stats.chunks.filter((c) => c.id === id &&
        c.files.length > 0 &&
        c.modules.some((m) => searchIssuer(m, (issuer) => issuer?.startsWith('consume-shared-module'))))))
        .map((chunk) => ({
        chunks: chunk.files.map((f) => `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${f}`),
        provides: flatMap(chunk.modules.filter((m) => searchIssuer(m, (issuer) => issuer?.startsWith('consume-shared-module'))), (m) => getIssuers(m, (issuer) => issuer?.startsWith('consume-shared-module')))
            .map(parseFederatedIssuer)
            .filter((f) => !!f),
    }))
        .filter((c) => c.provides.length > 0);
}
/**
 *
 * @param {WebpackStats} stats
 * @param {import("webpack").container.ModuleFederationPlugin} federationPlugin
 * @returns {FederatedStats}
 */
function getFederationStats(stats, federationPlugin) {
    const exposedModules = Object.entries(federationPlugin._options.exposes).reduce((exposedModules, [exposedAs, exposedFile]) => Object.assign(exposedModules, {
        [exposedAs]: getExposedModules(stats, exposedFile),
    }), {});
    /** @type {{ [key: string]: Exposed }} */
    const exposes = Object.entries(exposedModules).reduce((exposedChunks, [exposedAs, exposedModules]) => Object.assign(exposedChunks, {
        [exposedAs]: flatMap(exposedModules, (mod) => getExposed(stats, mod)),
    }), {});
    /** @type {string} */
    const remote = federationPlugin._options.library?.name || federationPlugin._options.name;
    const sharedModules = getSharedModules(stats, federationPlugin);
    const remoteModules = getRemoteModules(stats);
    return {
        remote,
        entry: `${stats.publicPath === 'auto' ? '' : stats.publicPath || ''}${stats.assetsByChunkName[remote] &&
            stats.assetsByChunkName[remote].length === 1
            ? stats.assetsByChunkName[remote][0]
            : federationPlugin._options.filename}`,
        sharedModules,
        exposes,
        remoteModules,
    };
}
/**
 * @typedef {object} FederationStatsPluginOptions
 * @property {string} filename The filename in the `output.path` directory to write stats to.
 */
/**
 * Writes relevant federation stats to a file for further consumption.
 */
class FederationStatsPlugin {
    /**
     *
     * @param {FederationStatsPluginOptions} options
     */
    constructor(options) {
        if (!options || !options.filename) {
            throw new Error('filename option is required.');
        }
        this._options = options;
    }
    /**
     *
     * @param {import("webpack").Compiler} compiler
     */
    apply(compiler) {
        const federationPlugins = compiler.options.plugins?.filter((plugin) => [
            'NextFederationPlugin',
            'UniversalFederationPlugin',
            'NodeFederationPlugin',
            'ModuleFederationPlugin',
        ].includes(plugin.constructor.name) && plugin?._options?.exposes);
        if (!federationPlugins || federationPlugins.length === 0) {
            console.error('No ModuleFederationPlugin(s) found.');
            return;
        }
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tapPromise({
                name: PLUGIN_NAME,
                stage: compilation.constructor.PROCESS_ASSETS_STAGE_ANALYSE,
            }, async () => {
                const stats = compilation.getStats().toJson({
                    performance: false,
                    time: false,
                    logging: 'none',
                    loggingDebug: false,
                    loggingTrace: false,
                    source: false,
                    children: false,
                    errors: false,
                    warnings: false,
                    errorsCount: false,
                    warningsCount: false,
                    builtAt: false,
                    timings: false,
                });
                const federatedModules = federationPlugins.map((federationPlugin) => getFederationStats(stats, federationPlugin));
                const sharedModules = getMainSharedModules(stats);
                const statsResult = {
                    sharedModules,
                    federatedModules,
                };
                const statsJson = JSON.stringify(statsResult);
                const statsBuffer = Buffer.from(statsJson, 'utf-8');
                const statsSource = {
                    source: () => statsBuffer,
                    size: () => statsBuffer.length,
                };
                const { filename } = this._options;
                const asset = compilation.getAsset(filename);
                if (asset) {
                    compilation.updateAsset(filename, statsSource);
                }
                else {
                    compilation.emitAsset(filename, statsSource);
                }
            });
        });
    }
}
module.exports = FederationStatsPlugin;
//# sourceMappingURL=ChunkCorrelationPlugin.js.map