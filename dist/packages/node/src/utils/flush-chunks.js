"use strict";
/* eslint-disable no-undef */
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushChunks = exports.usedChunks = void 0;
if (!globalThis.usedChunks) {
    globalThis.usedChunks = new Set();
}
/**
 * Initialize usedChunks and share it globally.
 * @type {Set}
 */
exports.usedChunks = globalThis.usedChunks;
/**
 * Load hostStats from the JSON file.
 * @returns {object} hostStats - An object containing host stats data.
 */
const loadHostStats = () => {
    try {
        return __non_webpack_require__('../federated-stats.json');
    }
    catch (e) {
        return {};
    }
};
/**
 * Create a shareMap based on the loaded modules.
 * @returns {object} shareMap - An object containing the shareMap data.
 */
const createShareMap = () => {
    // Check if __webpack_share_scopes__ is defined and has a default property
    if (__webpack_share_scopes__?.default) {
        // Reduce the keys of the default property to create the share map
        return Object.keys(__webpack_share_scopes__.default).reduce((acc, key) => {
            // Get the loaded modules for the current key
            const loadedModules = Object.values(__webpack_share_scopes__.default[key])
                // Filter out the modules that are not loaded
                .filter((sharedModule) => sharedModule.loaded)
                // Map the filtered modules to their 'from' properties
                .map((sharedModule) => sharedModule.from);
            // If there are any loaded modules, add them to the accumulator object
            if (loadedModules.length > 0) {
                acc[key] = loadedModules;
            }
            // Return the accumulator object for the next iteration
            return acc;
        }, {});
    }
    // If __webpack_share_scopes__ is not defined or doesn't have a default property, return an empty object
    return {};
};
/**
 * Process a single chunk and return an array of updated chunks.
 * @param {string} chunk - A chunk string containing remote and request data.
 * @param {object} shareMap - An object containing the shareMap data.
 * @param {object} hostStats - An object containing host stats data.
 * @returns {Promise<Array>} A promise that resolves to an array of updated chunks.
 */
const processChunk = async (chunk, shareMap, hostStats) => {
    // Create a set to store the chunks
    const chunks = new Set();
    // Split the chunk string into remote and request
    const [remote, request] = chunk.split('->');
    // If the remote is not defined in the global config, return
    if (!global.__remote_scope__._config[remote]) {
        console.error(`flush chunks:`, `Remote ${remote} is not defined in the global config`);
        return;
    }
    try {
        // Extract the remote name from the URL
        const remoteName = new URL(global.__remote_scope__._config[remote]).pathname
            .split('/')
            .pop();
        // Construct the stats file URL from the remote config
        const statsFile = global.__remote_scope__._config[remote]
            .replace(remoteName, 'federated-stats.json')
            .replace('ssr', 'chunks');
        let stats = {};
        try {
            // Fetch the remote config and stats file
            stats = await fetch(statsFile).then((res) => res.json());
        }
        catch (e) {
            console.error('flush error', e);
        }
        // Add the main chunk to the chunks set
        chunks.add(global.__remote_scope__._config[remote].replace('ssr', 'chunks'));
        // Extract the prefix from the remote config
        const [prefix] = global.__remote_scope__._config[remote].split('static/');
        // Process federated modules from the stats object
        if (stats.federatedModules) {
            stats.federatedModules.forEach((modules) => {
                // Process exposed modules
                if (modules.exposes?.[request]) {
                    modules.exposes[request].forEach((chunk) => {
                        chunks.add([prefix, chunk].join(''));
                        //TODO: reimplement this
                        Object.values(chunk).forEach((chunk) => {
                            // Add files to the chunks set
                            if (chunk.files) {
                                chunk.files.forEach((file) => {
                                    chunks.add(prefix + file);
                                });
                            }
                            // Process required modules
                            if (chunk.requiredModules) {
                                chunk.requiredModules.forEach((module) => {
                                    // Check if the module is in the shareMap
                                    if (shareMap[module]) {
                                        // If the module is from the host, log the host stats
                                        if (shareMap[module][0].startsWith('host__')) {
                                            console.log('host', hostStats);
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
        // Return the array of chunks
        return Array.from(chunks);
    }
    catch (e) {
        console.error('flush error:', e);
    }
};
/**
 * Flush the chunks and return a deduplicated array of chunks.
 * @returns {Promise<Array>} A promise that resolves to an array of deduplicated chunks.
 */
const flushChunks = async () => {
    const hostStats = loadHostStats();
    const shareMap = createShareMap();
    const allFlushed = await Promise.all(Array.from(exports.usedChunks).map(async (chunk) => processChunk(chunk, shareMap, hostStats)));
    // Deduplicate the chunks array
    const dedupe = Array.from(new Set([...allFlushed.flat()]));
    // Clear usedChunks
    exports.usedChunks.clear();
    // Filter out any undefined or null values
    return dedupe.filter(Boolean);
};
exports.flushChunks = flushChunks;
//# sourceMappingURL=flush-chunks.js.map