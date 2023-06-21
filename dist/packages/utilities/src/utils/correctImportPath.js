"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.correctImportPath = void 0;
const correctImportPath = (context, entryFile) => {
    if (typeof window === 'undefined') {
        if ((process === null || process === void 0 ? void 0 : process.platform) !== 'win32') {
            return entryFile;
        }
        if (entryFile.match(/^\.?\.\\/) || !entryFile.match(/^[A-Z]:\\\\/i)) {
            return entryFile.replace(/\\/g, '/');
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const path = require('path');
        const joint = path.win32.relative(context, entryFile);
        const relative = joint.replace(/\\/g, '/');
        if (relative.includes('node_modules/')) {
            return relative.split('node_modules/')[1];
        }
        return `./${relative}`;
    }
    return null;
};
exports.correctImportPath = correctImportPath;
//# sourceMappingURL=correctImportPath.js.map