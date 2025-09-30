import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { DialogContent } from '../../dialog';
import { ErrorOverlayToolbar, styles as toolbarStyles } from '../error-overlay-toolbar/error-overlay-toolbar';
import { ErrorOverlayFooter } from '../error-overlay-footer/error-overlay-footer';
import { ErrorMessage, styles as errorMessageStyles } from '../error-message/error-message';
import { ErrorTypeLabel, styles as errorTypeLabelStyles } from '../error-type-label/error-type-label';
import { ErrorOverlayNav, styles as floatingHeaderStyles } from '../error-overlay-nav/error-overlay-nav';
import { ErrorOverlayDialog, DIALOG_STYLES } from '../dialog/dialog';
import { ErrorOverlayDialogHeader, DIALOG_HEADER_STYLES } from '../dialog/header';
import { ErrorOverlayDialogBody, DIALOG_BODY_STYLES } from '../dialog/body';
import { CALL_STACK_STYLES } from '../call-stack/call-stack';
import { OVERLAY_STYLES, ErrorOverlayOverlay } from '../overlay/overlay';
import { ErrorOverlayBottomStack } from '../error-overlay-bottom-stack';
import { EnvironmentNameLabel } from '../environment-name-label/environment-name-label';
import { useFocusTrap } from '../dev-tools-indicator/utils';
import { Fader } from '../../fader';
export function ErrorOverlayLayout(param) {
    let { errorMessage, errorType, children, errorCode, error, debugInfo, isBuildError, onClose, versionInfo, runtimeErrors, activeIdx, setActiveIndex, footerMessage, isTurbopack, dialogResizerRef, // This prop is used to animate the dialog, it comes from a parent component (<ErrorOverlay>)
    // If it's not being passed, we should just render the component as it is being
    // used without the context of a parent component that controls its state (e.g. Storybook).
    rendered = true, transitionDurationMs } = param;
    const animationProps = {
        'data-rendered': rendered,
        style: {
            '--transition-duration': "" + transitionDurationMs + "ms"
        }
    };
    const faderRef = React.useRef(null);
    const hasFooter = Boolean(footerMessage || errorCode);
    const dialogRef = React.useRef(null);
    useFocusTrap(dialogRef, null, rendered);
    function onScroll(e) {
        if (faderRef.current) {
            const opacity = clamp(e.currentTarget.scrollTop / 17, [
                0,
                1
            ]);
            faderRef.current.style.opacity = String(opacity);
        }
    }
    var _runtimeErrors_length;
    return /*#__PURE__*/ _jsx(ErrorOverlayOverlay, {
        fixed: isBuildError,
        ...animationProps,
        children: /*#__PURE__*/ _jsxs("div", {
            "data-nextjs-dialog-root": true,
            ref: dialogRef,
            ...animationProps,
            children: [
                /*#__PURE__*/ _jsx(ErrorOverlayNav, {
                    runtimeErrors: runtimeErrors,
                    activeIdx: activeIdx,
                    setActiveIndex: setActiveIndex,
                    versionInfo: versionInfo,
                    isTurbopack: isTurbopack
                }),
                /*#__PURE__*/ _jsxs(ErrorOverlayDialog, {
                    onClose: onClose,
                    dialogResizerRef: dialogResizerRef,
                    "data-has-footer": hasFooter,
                    onScroll: onScroll,
                    footer: hasFooter && /*#__PURE__*/ _jsx(ErrorOverlayFooter, {
                        footerMessage: footerMessage,
                        errorCode: errorCode
                    }),
                    children: [
                        /*#__PURE__*/ _jsxs(DialogContent, {
                            children: [
                                /*#__PURE__*/ _jsxs(ErrorOverlayDialogHeader, {
                                    children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                            className: "nextjs__container_errors__error_title",
                                            // allow assertion in tests before error rating is implemented
                                            "data-nextjs-error-code": errorCode,
                                            children: [
                                                /*#__PURE__*/ _jsxs("span", {
                                                    "data-nextjs-error-label-group": true,
                                                    children: [
                                                        /*#__PURE__*/ _jsx(ErrorTypeLabel, {
                                                            errorType: errorType
                                                        }),
                                                        error.environmentName && /*#__PURE__*/ _jsx(EnvironmentNameLabel, {
                                                            environmentName: error.environmentName
                                                        })
                                                    ]
                                                }),
                                                /*#__PURE__*/ _jsx(ErrorOverlayToolbar, {
                                                    error: error,
                                                    debugInfo: debugInfo
                                                })
                                            ]
                                        }),
                                        /*#__PURE__*/ _jsx(ErrorMessage, {
                                            errorMessage: errorMessage
                                        })
                                    ]
                                }),
                                /*#__PURE__*/ _jsx(ErrorOverlayDialogBody, {
                                    children: children
                                })
                            ]
                        }),
                        /*#__PURE__*/ _jsx(ErrorOverlayBottomStack, {
                            errorCount: (_runtimeErrors_length = runtimeErrors == null ? void 0 : runtimeErrors.length) != null ? _runtimeErrors_length : 0,
                            activeIdx: activeIdx != null ? activeIdx : 0
                        })
                    ]
                }),
                /*#__PURE__*/ _jsx(Fader, {
                    ref: faderRef,
                    side: "top",
                    stop: "50%",
                    blur: "4px",
                    height: 48
                })
            ]
        })
    });
}
function clamp(value, param) {
    let [min, max] = param;
    return Math.min(Math.max(value, min), max);
}
export const styles = "\n  " + OVERLAY_STYLES + "\n  " + DIALOG_STYLES + "\n  " + DIALOG_HEADER_STYLES + "\n  " + DIALOG_BODY_STYLES + "\n\n  " + floatingHeaderStyles + "\n  " + errorTypeLabelStyles + "\n  " + errorMessageStyles + "\n  " + toolbarStyles + "\n  " + CALL_STACK_STYLES + "\n\n  [data-nextjs-error-label-group] {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n  }\n";

//# sourceMappingURL=error-overlay-layout.js.map