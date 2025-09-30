import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ShadowPortal } from './components/shadow-portal';
import { Base } from './styles/base';
import { ComponentStyles } from './styles/component-styles';
import { CssReset } from './styles/css-reset';
import { Colors } from './styles/colors';
import { ErrorOverlay } from './components/errors/error-overlay/error-overlay';
import { DevToolsIndicator } from './components/errors/dev-tools-indicator/dev-tools-indicator';
import { RenderError } from './container/runtime-error/render-error';
import { DarkTheme } from './styles/dark-theme';
import { useDevToolsScale } from './components/errors/dev-tools-indicator/dev-tools-info/preferences';
export function DevOverlay(param) {
    let { state, isErrorOverlayOpen, setIsErrorOverlayOpen } = param;
    const [scale, setScale] = useDevToolsScale();
    return /*#__PURE__*/ _jsxs(ShadowPortal, {
        children: [
            /*#__PURE__*/ _jsx(CssReset, {}),
            /*#__PURE__*/ _jsx(Base, {
                scale: scale
            }),
            /*#__PURE__*/ _jsx(Colors, {}),
            /*#__PURE__*/ _jsx(ComponentStyles, {}),
            /*#__PURE__*/ _jsx(DarkTheme, {}),
            /*#__PURE__*/ _jsx(RenderError, {
                state: state,
                isAppDir: true,
                children: (param)=>{
                    let { runtimeErrors, totalErrorCount } = param;
                    const isBuildError = state.buildError !== null;
                    return /*#__PURE__*/ _jsxs(_Fragment, {
                        children: [
                            state.showIndicator && /*#__PURE__*/ _jsx(DevToolsIndicator, {
                                scale: scale,
                                setScale: setScale,
                                state: state,
                                errorCount: totalErrorCount,
                                isBuildError: isBuildError,
                                setIsErrorOverlayOpen: setIsErrorOverlayOpen
                            }),
                            /*#__PURE__*/ _jsx(ErrorOverlay, {
                                state: state,
                                runtimeErrors: runtimeErrors,
                                isErrorOverlayOpen: isErrorOverlayOpen,
                                setIsErrorOverlayOpen: setIsErrorOverlayOpen
                            })
                        ]
                    });
                }
            })
        ]
    });
}

//# sourceMappingURL=dev-overlay.js.map