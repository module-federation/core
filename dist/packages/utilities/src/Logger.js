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
    static getInlineLogger() {
        return (...items) => `if (global.logger) {
        debugger;
        global.logger.log({ data: { items:[${items.map(item => item).join(',')}], global, __webpack_require__ } });
      } else {
        console.log(${items.join(',')});
      }`;
    }
}
Logger.loggerInstance = console;
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map