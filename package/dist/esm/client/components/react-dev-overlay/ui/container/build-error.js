import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from 'react';
import stripAnsi from 'next/dist/compiled/strip-ansi';
import { Terminal } from '../components/terminal';
import { ErrorOverlayLayout } from '../components/errors/error-overlay-layout/error-overlay-layout';
const getErrorTextFromBuildErrorMessage = (multiLineMessage)=>{
    const lines = multiLineMessage.split('\n');
    // The multi-line build error message looks like:
    // <file path>:<line number>:<column number>
    // <error message>
    // <error code frame of compiler or bundler>
    // e.g.
    // ./path/to/file.js:1:1
    // SyntaxError: ...
    // > 1 | con st foo =
    // ...
    return stripAnsi(lines[1] || '');
};
export const BuildError = function BuildError(param) {
    let { message, ...props } = param;
    const noop = useCallback(()=>{}, []);
    const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
        value: "E394",
        enumerable: false,
        configurable: true
    });
    const formattedMessage = useMemo(()=>getErrorTextFromBuildErrorMessage(message) || 'Failed to compile', [
        message
    ]);
    return /*#__PURE__*/ _jsx(ErrorOverlayLayout, {
        errorType: "Build Error",
        errorMessage: formattedMessage,
        onClose: noop,
        error: error,
        footerMessage: "This error occurred during the build process and can only be dismissed by fixing the error.",
        ...props,
        children: /*#__PURE__*/ _jsx(Terminal, {
            content: message
        })
    });
};
export const styles = "";

//# sourceMappingURL=build-error.js.map