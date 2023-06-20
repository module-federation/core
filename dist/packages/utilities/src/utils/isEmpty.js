"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObjectEmpty = void 0;
var isObjectEmpty = function (obj) {
    for (var x in obj) {
        return false;
    }
    return true;
};
exports.isObjectEmpty = isObjectEmpty;
//# sourceMappingURL=isEmpty.js.map