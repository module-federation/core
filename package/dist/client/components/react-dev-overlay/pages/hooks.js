"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "usePagesDevOverlay", {
    enumerable: true,
    get: function() {
        return usePagesDevOverlay;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _interop_require_wildcard = require("@swc/helpers/_/_interop_require_wildcard");
const _react = /*#__PURE__*/ _interop_require_default._(require("react"));
const _bus = /*#__PURE__*/ _interop_require_wildcard._(require("./bus"));
const _shared = require("../shared");
const _router = require("../../../router");
const usePagesDevOverlay = ()=>{
    const [state, dispatch] = (0, _shared.useErrorOverlayReducer)('pages');
    _react.default.useEffect(()=>{
        _bus.on(dispatch);
        const { handleStaticIndicator } = require('./hot-reloader-client');
        _router.Router.events.on('routeChangeComplete', handleStaticIndicator);
        return function() {
            _router.Router.events.off('routeChangeComplete', handleStaticIndicator);
            _bus.off(dispatch);
        };
    }, [
        dispatch
    ]);
    const onComponentError = _react.default.useCallback((_error, _componentStack)=>{
    // TODO: special handling
    }, []);
    return {
        state,
        onComponentError
    };
};

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=hooks.js.map