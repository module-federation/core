"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    ACTION_BEFORE_REFRESH: null,
    ACTION_BUILD_ERROR: null,
    ACTION_BUILD_OK: null,
    ACTION_DEBUG_INFO: null,
    ACTION_DEV_INDICATOR: null,
    ACTION_REFRESH: null,
    ACTION_STATIC_INDICATOR: null,
    ACTION_UNHANDLED_ERROR: null,
    ACTION_UNHANDLED_REJECTION: null,
    ACTION_VERSION_INFO: null,
    INITIAL_OVERLAY_STATE: null,
    REACT_REFRESH_FULL_RELOAD: null,
    REACT_REFRESH_FULL_RELOAD_FROM_ERROR: null,
    STORAGE_KEY_POSITION: null,
    STORAGE_KEY_SCALE: null,
    STORAGE_KEY_THEME: null,
    reportInvalidHmrMessage: null,
    useErrorOverlayReducer: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ACTION_BEFORE_REFRESH: function() {
        return ACTION_BEFORE_REFRESH;
    },
    ACTION_BUILD_ERROR: function() {
        return ACTION_BUILD_ERROR;
    },
    ACTION_BUILD_OK: function() {
        return ACTION_BUILD_OK;
    },
    ACTION_DEBUG_INFO: function() {
        return ACTION_DEBUG_INFO;
    },
    ACTION_DEV_INDICATOR: function() {
        return ACTION_DEV_INDICATOR;
    },
    ACTION_REFRESH: function() {
        return ACTION_REFRESH;
    },
    ACTION_STATIC_INDICATOR: function() {
        return ACTION_STATIC_INDICATOR;
    },
    ACTION_UNHANDLED_ERROR: function() {
        return ACTION_UNHANDLED_ERROR;
    },
    ACTION_UNHANDLED_REJECTION: function() {
        return ACTION_UNHANDLED_REJECTION;
    },
    ACTION_VERSION_INFO: function() {
        return ACTION_VERSION_INFO;
    },
    INITIAL_OVERLAY_STATE: function() {
        return INITIAL_OVERLAY_STATE;
    },
    REACT_REFRESH_FULL_RELOAD: function() {
        return REACT_REFRESH_FULL_RELOAD;
    },
    REACT_REFRESH_FULL_RELOAD_FROM_ERROR: function() {
        return REACT_REFRESH_FULL_RELOAD_FROM_ERROR;
    },
    STORAGE_KEY_POSITION: function() {
        return STORAGE_KEY_POSITION;
    },
    STORAGE_KEY_SCALE: function() {
        return STORAGE_KEY_SCALE;
    },
    STORAGE_KEY_THEME: function() {
        return STORAGE_KEY_THEME;
    },
    reportInvalidHmrMessage: function() {
        return reportInvalidHmrMessage;
    },
    useErrorOverlayReducer: function() {
        return useErrorOverlayReducer;
    }
});
const _react = require("react");
var _process_env___NEXT_DEV_INDICATOR;
const ACTION_STATIC_INDICATOR = 'static-indicator';
const ACTION_BUILD_OK = 'build-ok';
const ACTION_BUILD_ERROR = 'build-error';
const ACTION_BEFORE_REFRESH = 'before-fast-refresh';
const ACTION_REFRESH = 'fast-refresh';
const ACTION_VERSION_INFO = 'version-info';
const ACTION_UNHANDLED_ERROR = 'unhandled-error';
const ACTION_UNHANDLED_REJECTION = 'unhandled-rejection';
const ACTION_DEBUG_INFO = 'debug-info';
const ACTION_DEV_INDICATOR = 'dev-indicator';
const STORAGE_KEY_THEME = '__nextjs-dev-tools-theme';
const STORAGE_KEY_POSITION = '__nextjs-dev-tools-position';
const STORAGE_KEY_SCALE = '__nextjs-dev-tools-scale';
function pushErrorFilterDuplicates(errors, err) {
    return [
        ...errors.filter((e)=>{
            // Filter out duplicate errors
            return e.event.reason.stack !== err.event.reason.stack;
        }),
        err
    ];
}
const shouldDisableDevIndicator = ((_process_env___NEXT_DEV_INDICATOR = process.env.__NEXT_DEV_INDICATOR) == null ? void 0 : _process_env___NEXT_DEV_INDICATOR.toString()) === 'false';
const INITIAL_OVERLAY_STATE = {
    nextId: 1,
    buildError: null,
    errors: [],
    notFound: false,
    staticIndicator: false,
    /* 
    This is set to `true` when we can reliably know
    whether the indicator is in disabled state or not.  
    Otherwise the surface would flicker because the disabled flag loads from the config.
  */ showIndicator: false,
    disableDevIndicator: false,
    refreshState: {
        type: 'idle'
    },
    versionInfo: {
        installed: '0.0.0',
        staleness: 'unknown'
    },
    debugInfo: {
        devtoolsFrontendUrl: undefined
    }
};
function getInitialState(routerType) {
    return {
        ...INITIAL_OVERLAY_STATE,
        routerType
    };
}
function useErrorOverlayReducer(routerType) {
    return (0, _react.useReducer)((state, action)=>{
        switch(action.type){
            case ACTION_DEBUG_INFO:
                {
                    return {
                        ...state,
                        debugInfo: action.debugInfo
                    };
                }
            case ACTION_STATIC_INDICATOR:
                {
                    return {
                        ...state,
                        staticIndicator: action.staticIndicator
                    };
                }
            case ACTION_BUILD_OK:
                {
                    return {
                        ...state,
                        buildError: null
                    };
                }
            case ACTION_BUILD_ERROR:
                {
                    return {
                        ...state,
                        buildError: action.message
                    };
                }
            case ACTION_BEFORE_REFRESH:
                {
                    return {
                        ...state,
                        refreshState: {
                            type: 'pending',
                            errors: []
                        }
                    };
                }
            case ACTION_REFRESH:
                {
                    return {
                        ...state,
                        buildError: null,
                        errors: // Errors can come in during updates. In this case, UNHANDLED_ERROR
                        // and UNHANDLED_REJECTION events might be dispatched between the
                        // BEFORE_REFRESH and the REFRESH event. We want to keep those errors
                        // around until the next refresh. Otherwise we run into a race
                        // condition where those errors would be cleared on refresh completion
                        // before they can be displayed.
                        state.refreshState.type === 'pending' ? state.refreshState.errors : [],
                        refreshState: {
                            type: 'idle'
                        }
                    };
                }
            case ACTION_UNHANDLED_ERROR:
            case ACTION_UNHANDLED_REJECTION:
                {
                    switch(state.refreshState.type){
                        case 'idle':
                            {
                                return {
                                    ...state,
                                    nextId: state.nextId + 1,
                                    errors: pushErrorFilterDuplicates(state.errors, {
                                        id: state.nextId,
                                        event: action
                                    })
                                };
                            }
                        case 'pending':
                            {
                                return {
                                    ...state,
                                    nextId: state.nextId + 1,
                                    refreshState: {
                                        ...state.refreshState,
                                        errors: pushErrorFilterDuplicates(state.refreshState.errors, {
                                            id: state.nextId,
                                            event: action
                                        })
                                    }
                                };
                            }
                        default:
                            return state;
                    }
                }
            case ACTION_VERSION_INFO:
                {
                    return {
                        ...state,
                        versionInfo: action.versionInfo
                    };
                }
            case ACTION_DEV_INDICATOR:
                {
                    return {
                        ...state,
                        showIndicator: true,
                        disableDevIndicator: shouldDisableDevIndicator || !!action.devIndicator.disabledUntil
                    };
                }
            default:
                {
                    return state;
                }
        }
    }, getInitialState(routerType));
}
const REACT_REFRESH_FULL_RELOAD = '[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.';
const REACT_REFRESH_FULL_RELOAD_FROM_ERROR = '[Fast Refresh] performing full reload because your application had an unrecoverable error';
function reportInvalidHmrMessage(message, err) {
    console.warn('[HMR] Invalid message: ' + JSON.stringify(message) + '\n' + (err instanceof Error && (err == null ? void 0 : err.stack) || ''));
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=shared.js.map