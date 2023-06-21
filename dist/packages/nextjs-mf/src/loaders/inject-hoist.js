"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function injectTopLoader(source) {
    const delegateModuleHoistImport = "require('@module-federation/nextjs-mf/src/internal-delegate-hoist');\n";
    return `${delegateModuleHoistImport}${source}`;
}
exports.default = injectTopLoader;
//# sourceMappingURL=inject-hoist.js.map