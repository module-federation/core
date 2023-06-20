"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = exports.Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.getLogger = function () {
        return this.loggerInstance;
    };
    Logger.setLogger = function (logger) {
        this.loggerInstance = logger || console;
        return logger;
    };
    Logger.loggerInstance = console;
    return Logger;
}());
//# sourceMappingURL=Logger.js.map