import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { AppDevOverlayErrorBoundary } from './app-dev-overlay-error-boundary';
import { FontStyles } from '../font/font-styles';
import { DevOverlay } from '../ui/dev-overlay';
import { handleClientError } from '../../errors/use-error-handler';
import { isNextRouterError } from '../../is-next-router-error';
import { MISSING_ROOT_TAGS_ERROR } from '../../../../shared/lib/errors/constants';
function readSsrError() {
    if (typeof document === 'undefined') {
        return null;
    }
    const ssrErrorTemplateTag = document.querySelector('template[data-next-error-message]');
    if (ssrErrorTemplateTag) {
        const message = ssrErrorTemplateTag.getAttribute('data-next-error-message');
        const stack = ssrErrorTemplateTag.getAttribute('data-next-error-stack');
        const digest = ssrErrorTemplateTag.getAttribute('data-next-error-digest');
        const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
        if (digest) {
            ;
            error.digest = digest;
        }
        // Skip Next.js SSR'd internal errors that which will be handled by the error boundaries.
        if (isNextRouterError(error)) {
            return null;
        }
        error.stack = stack || '';
        return error;
    }
    return null;
}
// Needs to be in the same error boundary as the shell.
// If it commits, we know we recovered from an SSR error.
// If it doesn't commit, we errored again and React will take care of error reporting.
function ReplaySsrOnlyErrors(param) {
    let { onBlockingError } = param;
    if (process.env.NODE_ENV !== 'production') {
        // Need to read during render. The attributes will be gone after commit.
        const ssrError = readSsrError();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(()=>{
            if (ssrError !== null) {
                // TODO(veil): Produces wrong Owner Stack
                // TODO(veil): Mark as recoverable error
                // TODO(veil): console.error
                handleClientError(ssrError);
                // If it's missing root tags, we can't recover, make it blocking.
                if (ssrError.digest === MISSING_ROOT_TAGS_ERROR) {
                    onBlockingError();
                }
            }
        }, [
            ssrError,
            onBlockingError
        ]);
    }
    return null;
}
export function AppDevOverlay(param) {
    let { state, globalError, children } = param;
    const [isErrorOverlayOpen, setIsErrorOverlayOpen] = useState(false);
    const openOverlay = useCallback(()=>{
        setIsErrorOverlayOpen(true);
    }, []);
    return /*#__PURE__*/ _jsxs(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxs(AppDevOverlayErrorBoundary, {
                globalError: globalError,
                onError: setIsErrorOverlayOpen,
                children: [
                    /*#__PURE__*/ _jsx(ReplaySsrOnlyErrors, {
                        onBlockingError: openOverlay
                    }),
                    children
                ]
            }),
            /*#__PURE__*/ _jsxs(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsx(FontStyles, {}),
                    /*#__PURE__*/ _jsx(DevOverlay, {
                        state: state,
                        isErrorOverlayOpen: isErrorOverlayOpen,
                        setIsErrorOverlayOpen: setIsErrorOverlayOpen
                    })
                ]
            })
        ]
    });
}

//# sourceMappingURL=app-dev-overlay.js.map