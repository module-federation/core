"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static getLogger() {
        return this.loggerInstance;
    }
    static setLogger(logger) {
        this.loggerInstance = logger || console;
        return logger;
    }
}
Logger.loggerInstance = console;
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map