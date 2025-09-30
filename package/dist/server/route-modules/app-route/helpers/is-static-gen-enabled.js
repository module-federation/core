"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "isStaticGenEnabled", {
    enumerable: true,
    get: function() {
        return isStaticGenEnabled;
    }
});
function isStaticGenEnabled(mod) {
    return mod.dynamic === 'force-static' || mod.dynamic === 'error' || mod.revalidate === false || mod.revalidate !== undefined && mod.revalidate > 0 || typeof mod.generateStaticParams == 'function';
}

//# sourceMappingURL=is-static-gen-enabled.js.map