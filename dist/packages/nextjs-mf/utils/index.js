"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revalidate = exports.FlushedChunks = exports.flushChunks = exports.injectScript = exports.extractUrlAndGlobal = void 0;
var common_1 = require("@module-federation/utilities/src/utils/common");
Object.defineProperty(exports, "extractUrlAndGlobal", { enumerable: true, get: function () { return common_1.extractUrlAndGlobal; } });
Object.defineProperty(exports, "injectScript", { enumerable: true, get: function () { return common_1.injectScript; } });
// @ts-ignore
var utils_1 = require("@module-federation/node/utils");
Object.defineProperty(exports, "flushChunks", { enumerable: true, get: function () { return utils_1.flushChunks; } });
var flushedChunks_1 = require("./flushedChunks");
Object.defineProperty(exports, "FlushedChunks", { enumerable: true, get: function () { return flushedChunks_1.FlushedChunks; } });
const revalidate = () => {
    if (typeof window !== 'undefined') {
        console.error('revalidate should only be called server-side');
        return Promise.resolve(false);
    }
    // @ts-ignore
    return import('@module-federation/node/utils').then((utils) => {
        return utils.revalidate();
    });
};
exports.revalidate = revalidate;
//# sourceMappingURL=index.js.map