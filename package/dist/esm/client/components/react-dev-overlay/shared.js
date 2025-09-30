var _process_env___NEXT_DEV_INDICATOR;
import { useReducer } from 'react';
export const ACTION_STATIC_INDICATOR = 'static-indicator';
export const ACTION_BUILD_OK = 'build-ok';
export const ACTION_BUILD_ERROR = 'build-error';
export const ACTION_BEFORE_REFRESH = 'before-fast-refresh';
export const ACTION_REFRESH = 'fast-refresh';
export const ACTION_VERSION_INFO = 'version-info';
export const ACTION_UNHANDLED_ERROR = 'unhandled-error';
export const ACTION_UNHANDLED_REJECTION = 'unhandled-rejection';
export const ACTION_DEBUG_INFO = 'debug-info';
export const ACTION_DEV_INDICATOR = 'dev-indicator';
export const STORAGE_KEY_THEME = '__nextjs-dev-tools-theme';
export const STORAGE_KEY_POSITION = '__nextjs-dev-tools-position';
export const STORAGE_KEY_SCALE = '__nextjs-dev-tools-scale';
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
export const INITIAL_OVERLAY_STATE = {
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
export function useErrorOverlayReducer(routerType) {
    return useReducer((state, action)=>{
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
export const REACT_REFRESH_FULL_RELOAD = '[Fast Refresh] performing full reload\n\n' + "Fast Refresh will perform a full reload when you edit a file that's imported by modules outside of the React rendering tree.\n" + 'You might have a file which exports a React component but also exports a value that is imported by a non-React component file.\n' + 'Consider migrating the non-React component export to a separate file and importing it into both files.\n\n' + 'It is also possible the parent component of the component you edited is a class component, which disables Fast Refresh.\n' + 'Fast Refresh requires at least one parent function component in your React tree.';
export const REACT_REFRESH_FULL_RELOAD_FROM_ERROR = '[Fast Refresh] performing full reload because your application had an unrecoverable error';
export function reportInvalidHmrMessage(message, err) {
    console.warn('[HMR] Invalid message: ' + JSON.stringify(message) + '\n' + (err instanceof Error && (err == null ? void 0 : err.stack) || ''));
}

//# sourceMappingURL=shared.js.map