"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flushChunks = exports.usedChunks = void 0;
exports.usedChunks = new Set();
global.usedChunks = exports.usedChunks;
const flushChunks = async () => {
    const allFlushed = await Promise.all(Array.from(exports.usedChunks).map(async (chunk) => {
        const chunks = new Set();
        const [remote, request] = chunk.split('->');
        if (!global.__remote_scope__._config[remote]) {
            return;
        }
        // fetch the json file
        try {
            const statsFile = global.__remote_scope__._config[remote].replace('remoteEntry.js', 'federated-stats.json');
            const stats = await fetch(statsFile).then(async (res) => await res.json());
            chunks.add(global.__remote_scope__._config[remote].replace('ssr', 'chunks'));
            const [prefix] = global.__remote_scope__._config[remote].split('static/');
            if (stats.federatedModules) {
                stats.federatedModules.forEach((modules) => {
                    if (modules.exposes?.[request]) {
                        modules.exposes[request].forEach((chunk) => {
                            Object.values(chunk).forEach((chunk) => {
                                chunk.forEach((chunk) => {
                                    chunks.add(prefix + chunk);
                                });
                            });
                        });
                    }
                });
            }
            return Array.from(chunks);
        }
        catch (e) {
            console.log(e);
        }
    }));
    const dedupe = Array.from(new Set([...allFlushed.flat()]));
    exports.usedChunks.clear();
    return dedupe.filter(Boolean);
};
exports.flushChunks = flushChunks;
//# sourceMappingURL=flush-chunks.js.map