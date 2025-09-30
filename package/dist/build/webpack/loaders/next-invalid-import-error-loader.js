"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return nextInvalidImportErrorLoader;
    }
});
function nextInvalidImportErrorLoader() {
    const { message } = this.getOptions();
    throw Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
}

//# sourceMappingURL=next-invalid-import-error-loader.js.map