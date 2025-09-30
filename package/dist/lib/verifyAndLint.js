"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "verifyAndLint", {
    enumerable: true,
    get: function() {
        return verifyAndLint;
    }
});
const _picocolors = require("./picocolors");
const _worker = require("./worker");
const _fs = require("fs");
const _path = require("path");
const _constants = require("./constants");
const _events = require("../telemetry/events");
const _compileerror = require("./compile-error");
const _iserror = /*#__PURE__*/ _interop_require_default(require("./is-error"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function verifyAndLint(dir, cacheLocation, configLintDirs, enableWorkerThreads, telemetry) {
    let lintWorkers;
    try {
        lintWorkers = new _worker.Worker(require.resolve('./eslint/runLintCheck'), {
            exposedMethods: [
                'runLintCheck'
            ],
            numWorkers: 1,
            enableWorkerThreads,
            maxRetries: 0
        });
        const lintDirs = (configLintDirs ?? _constants.ESLINT_DEFAULT_DIRS).reduce((res, d)=>{
            const currDir = (0, _path.join)(dir, d);
            if (!(0, _fs.existsSync)(currDir)) return res;
            res.push(currDir);
            return res;
        }, []);
        const lintResults = await (lintWorkers == null ? void 0 : lintWorkers.runLintCheck(dir, lintDirs, {
            lintDuringBuild: true,
            eslintOptions: {
                cacheLocation
            }
        }));
        const lintOutput = typeof lintResults === 'string' ? lintResults : lintResults == null ? void 0 : lintResults.output;
        if (typeof lintResults !== 'string' && (lintResults == null ? void 0 : lintResults.eventInfo)) {
            telemetry.record((0, _events.eventLintCheckCompleted)({
                ...lintResults.eventInfo,
                buildLint: true
            }));
        }
        if (typeof lintResults !== 'string' && (lintResults == null ? void 0 : lintResults.isError) && lintOutput) {
            await telemetry.flush();
            throw Object.defineProperty(new _compileerror.CompileError(lintOutput), "__NEXT_ERROR_CODE", {
                value: "E394",
                enumerable: false,
                configurable: true
            });
        }
        if (lintOutput) {
            console.log(lintOutput);
        }
    } catch (err) {
        if ((0, _iserror.default)(err)) {
            if (err.type === 'CompileError' || err instanceof _compileerror.CompileError) {
                console.error((0, _picocolors.red)('\nFailed to compile.'));
                console.error(err.message);
                process.exit(1);
            } else if (err.type === 'FatalError') {
                console.error(err.message);
                process.exit(1);
            }
        }
        throw err;
    } finally{
        try {
            lintWorkers == null ? void 0 : lintWorkers.end();
        } catch  {}
    }
}

//# sourceMappingURL=verifyAndLint.js.map