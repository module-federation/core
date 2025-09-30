"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getErrorByType: null,
    useFrames: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getErrorByType: function() {
        return getErrorByType;
    },
    useFrames: function() {
        return useFrames;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _shared = require("../shared");
const _stackframe = require("./stack-frame");
const _errorsource = require("../../../../shared/lib/error-source");
const _react = /*#__PURE__*/ _interop_require_default._(require("react"));
const useFrames = (error)=>{
    if ('use' in _react.default) {
        const frames = error.frames;
        if (typeof frames !== 'function') {
            throw Object.defineProperty(new Error('Invariant: frames must be a function when the React version has React.use. This is a bug in Next.js.'), "__NEXT_ERROR_CODE", {
                value: "E636",
                enumerable: false,
                configurable: true
            });
        }
        return _react.default.use(frames());
    } else {
        if (!Array.isArray(error.frames)) {
            throw Object.defineProperty(new Error('Invariant: frames must be an array when the React version does not have React.use. This is a bug in Next.js.'), "__NEXT_ERROR_CODE", {
                value: "E637",
                enumerable: false,
                configurable: true
            });
        }
        return error.frames;
    }
};
async function getErrorByType(ev, isAppDir) {
    const { id, event } = ev;
    switch(event.type){
        case _shared.ACTION_UNHANDLED_ERROR:
        case _shared.ACTION_UNHANDLED_REJECTION:
            {
                const baseError = {
                    id,
                    runtime: true,
                    error: event.reason
                };
                if ('use' in _react.default) {
                    const readyRuntimeError = {
                        ...baseError,
                        // createMemoizedPromise dedups calls to getOriginalStackFrames
                        frames: createMemoizedPromise(async ()=>{
                            return await (0, _stackframe.getOriginalStackFrames)(event.frames, (0, _errorsource.getErrorSource)(event.reason), isAppDir);
                        })
                    };
                    if (event.type === _shared.ACTION_UNHANDLED_ERROR) {
                        readyRuntimeError.componentStackFrames = event.componentStackFrames;
                    }
                    return readyRuntimeError;
                } else {
                    const readyRuntimeError = {
                        ...baseError,
                        // createMemoizedPromise dedups calls to getOriginalStackFrames
                        frames: await (0, _stackframe.getOriginalStackFrames)(event.frames, (0, _errorsource.getErrorSource)(event.reason), isAppDir)
                    };
                    if (event.type === _shared.ACTION_UNHANDLED_ERROR) {
                        readyRuntimeError.componentStackFrames = event.componentStackFrames;
                    }
                    return readyRuntimeError;
                }
            }
        default:
            {
                break;
            }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = event;
    throw Object.defineProperty(new Error('type system invariant violation'), "__NEXT_ERROR_CODE", {
        value: "E335",
        enumerable: false,
        configurable: true
    });
}
function createMemoizedPromise(promiseFactory) {
    const cachedPromise = promiseFactory();
    return function() {
        return cachedPromise;
    };
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=get-error-by-type.js.map