"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RenderError", {
    enumerable: true,
    get: function() {
        return RenderError;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _shared = require("../../../shared");
const _geterrorbytype = require("../../../utils/get-error-by-type");
function getErrorSignature(ev) {
    const { event } = ev;
    // eslint-disable-next-line default-case -- TypeScript checks this
    switch(event.type){
        case _shared.ACTION_UNHANDLED_ERROR:
        case _shared.ACTION_UNHANDLED_REJECTION:
            {
                return event.reason.name + "::" + event.reason.message + "::" + event.reason.stack;
            }
    }
}
const RenderError = (props)=>{
    const { state } = props;
    const isBuildError = !!state.buildError;
    if (isBuildError) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(RenderBuildError, {
            ...props
        });
    } else {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(RenderRuntimeError, {
            ...props
        });
    }
};
const RenderRuntimeError = (param)=>{
    let { children, state, isAppDir } = param;
    const { errors } = state;
    const [lookups, setLookups] = (0, _react.useState)({});
    const [runtimeErrors, nextError] = (0, _react.useMemo)(()=>{
        let ready = [];
        let next = null;
        // Ensure errors are displayed in the order they occurred in:
        for(let idx = 0; idx < errors.length; ++idx){
            const e = errors[idx];
            const { id } = e;
            if (id in lookups) {
                ready.push(lookups[id]);
                continue;
            }
            // Check for duplicate errors
            if (idx > 0) {
                const prev = errors[idx - 1];
                if (getErrorSignature(prev) === getErrorSignature(e)) {
                    continue;
                }
            }
            next = e;
            break;
        }
        return [
            ready,
            next
        ];
    }, [
        errors,
        lookups
    ]);
    (0, _react.useEffect)(()=>{
        if (nextError == null) {
            return;
        }
        let mounted = true;
        (0, _geterrorbytype.getErrorByType)(nextError, isAppDir).then((resolved)=>{
            if (mounted) {
                // We don't care if the desired error changed while we were resolving,
                // thus we're not tracking it using a ref. Once the work has been done,
                // we'll store it.
                setLookups((m)=>({
                        ...m,
                        [resolved.id]: resolved
                    }));
            }
        });
        return ()=>{
            mounted = false;
        };
    }, [
        nextError,
        isAppDir
    ]);
    const totalErrorCount = errors.filter((err, idx)=>{
        const prev = errors[idx - 1];
        // Check for duplicates
        if (idx > 0) return getErrorSignature(prev) !== getErrorSignature(err);
        return true;
    }).length;
    return children({
        runtimeErrors,
        totalErrorCount
    });
};
const RenderBuildError = (param)=>{
    let { children } = param;
    return children({
        runtimeErrors: [],
        // Build errors and missing root layout tags persist until fixed,
        // so we can set a fixed error count of 1
        totalErrorCount: 1
    });
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=render-error.js.map