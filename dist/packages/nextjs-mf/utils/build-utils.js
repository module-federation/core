"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRemoteFilename = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const computeRemoteFilename = (isServer, filename) => {
    if (isServer && filename) {
        return path_1.default.basename(filename);
    }
    return filename;
};
exports.computeRemoteFilename = computeRemoteFilename;
//# sourceMappingURL=build-utils.js.map