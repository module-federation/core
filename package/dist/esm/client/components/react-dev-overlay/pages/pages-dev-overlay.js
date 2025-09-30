import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { PagesDevOverlayErrorBoundary } from './pages-dev-overlay-error-boundary';
import { usePagesDevOverlay } from './hooks';
import { FontStyles } from '../font/font-styles';
import { DevOverlay } from '../ui/dev-overlay';
export function PagesDevOverlay(param) {
    let { children } = param;
    const { state, onComponentError } = usePagesDevOverlay();
    const [isErrorOverlayOpen, setIsErrorOverlayOpen] = useState(true);
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsx(PagesDevOverlayErrorBoundary, {
                onError: onComponentError,
                children: children != null ? children : null
            }),
            /*#__PURE__*/ _jsx(FontStyles, {}),
            /*#__PURE__*/ _jsx(DevOverlay, {
                state: state,
                isErrorOverlayOpen: isErrorOverlayOpen,
                setIsErrorOverlayOpen: setIsErrorOverlayOpen
            })
        ]
    });
}

//# sourceMappingURL=pages-dev-overlay.js.map