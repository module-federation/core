"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObjectEmpty = void 0;
const isObjectEmpty = (obj) => {
    for (const x in obj) {
        return false;
    }
    return true;
};
exports.isObjectEmpty = isObjectEmpty;
//# sourceMappingURL=isEmpty.js.map