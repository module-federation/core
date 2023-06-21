"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUnnecessarySharedKeys = void 0;
// Utility function to remove unnecessary shared keys from the default share scope
const internal_1 = require("../../internal");
function removeUnnecessarySharedKeys(shared) {
    const warnings = Object.keys(shared).reduce((acc, key) => {
        if (internal_1.DEFAULT_SHARE_SCOPE[key]) {
            acc.push(`[nextjs-mf] You are sharing ${key} from the default share scope. This is not necessary and can be removed.`);
            // Use a type assertion to inform TypeScript that 'key' can be used as an index for the 'shared' object
            delete shared[key];
        }
        return acc;
    }, []);
    if (warnings.length > 0) {
        console.warn('%c' + warnings.join('\n'), 'color: red');
    }
}
exports.removeUnnecessarySharedKeys = removeUnnecessarySharedKeys;
//# sourceMappingURL=remove-unnecessary-shared-keys.js.map