"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.echoExecutor = exports.devExecutor = exports.buildExecutor = void 0;
// Export executors
var executor_1 = require("./executors/build/executor");
Object.defineProperty(exports, "buildExecutor", { enumerable: true, get: function () { return __importDefault(executor_1).default; } });
var executor_2 = require("./executors/dev/executor");
Object.defineProperty(exports, "devExecutor", { enumerable: true, get: function () { return __importDefault(executor_2).default; } });
var executor_3 = require("./executors/echo/executor");
Object.defineProperty(exports, "echoExecutor", { enumerable: true, get: function () { return __importDefault(executor_3).default; } });
//# sourceMappingURL=index.js.map