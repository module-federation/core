"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
/**
 *
 * Requires `include-defaults.js` with required shared libs
 *
 */
function patchDefaultSharedLoader(content) {
    if (content.includes('include-defaults')) {
        // If already patched, return
        return content;
    }
    // avoid absolute paths as they break hashing when the root for the project is moved
    // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
    const pathIncludeDefaults = path_1.default.relative(this.context, path_1.default.resolve(__dirname, '../include-defaults.js'));
    return [
        '',
        `require(${JSON.stringify('./' + pathIncludeDefaults)});`,
        content,
    ].join('\n');
}
exports.default = patchDefaultSharedLoader;
//# sourceMappingURL=patchDefaultSharedLoader.js.map