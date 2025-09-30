import { jsx as _jsx } from "react/jsx-runtime";
import { Suspense } from 'react';
import { BuildError } from '../../../container/build-error';
import { Errors } from '../../../container/errors';
import { useDelayedRender } from '../../../hooks/use-delayed-render';
const transitionDurationMs = 200;
export function ErrorOverlay(param) {
    let { state, runtimeErrors, isErrorOverlayOpen, setIsErrorOverlayOpen } = param;
    const isTurbopack = !!process.env.TURBOPACK;
    // This hook lets us do an exit animation before unmounting the component
    const { mounted, rendered } = useDelayedRender(isErrorOverlayOpen, {
        exitDelay: transitionDurationMs
    });
    const commonProps = {
        rendered,
        transitionDurationMs,
        isTurbopack,
        versionInfo: state.versionInfo
    };
    if (state.buildError !== null) {
        return /*#__PURE__*/ _jsx(BuildError, {
            ...commonProps,
            message: state.buildError,
            // This is not a runtime error, forcedly display error overlay
            rendered: true
        });
    }
    // No Runtime Errors.
    if (!runtimeErrors.length) {
        // Workaround React quirk that triggers "Switch to client-side rendering" if
        // we return no Suspense boundary here.
        return /*#__PURE__*/ _jsx(Suspense, {});
    }
    if (!mounted) {
        // Workaround React quirk that triggers "Switch to client-side rendering" if
        // we return no Suspense boundary here.
        return /*#__PURE__*/ _jsx(Suspense, {});
    }
    return /*#__PURE__*/ _jsx(Errors, {
        ...commonProps,
        debugInfo: state.debugInfo,
        runtimeErrors: runtimeErrors,
        onClose: ()=>{
            setIsErrorOverlayOpen(false);
        }
    });
}

//# sourceMappingURL=error-overlay.js.map