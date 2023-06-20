"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "generateTypesStats", {
    enumerable: true,
    get: function() {
        return generateTypesStats;
    }
});
const _extends = require("@swc/helpers/_/_extends");
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _crypto = /*#__PURE__*/ _interop_require_default._(require("crypto"));
const generateTypesStats = (filesMap, normalizeOptions)=>{
    return Object.entries(filesMap).reduce((acc, [path, contents])=>{
        const filename = path.slice(path.indexOf(normalizeOptions.distDir) + `${normalizeOptions.distDir}/`.length);
        return _extends._({}, acc, {
            [filename]: _crypto.default.createHash('md5').update(contents).digest('hex')
        });
    }, {});
};

//# sourceMappingURL=generateTypesStats.js.map