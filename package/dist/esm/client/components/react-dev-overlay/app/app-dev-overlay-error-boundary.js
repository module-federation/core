import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PureComponent } from 'react';
import { RuntimeErrorHandler } from '../../errors/runtime-error-handler';
import { ErrorBoundary, GlobalError as DefaultGlobalError } from '../../error-boundary';
function ErroredHtml(param) {
    let { globalError: [GlobalError, globalErrorStyles], error } = param;
    if (!error) {
        return /*#__PURE__*/ _jsxs("html", {
            children: [
                /*#__PURE__*/ _jsx("head", {}),
                /*#__PURE__*/ _jsx("body", {})
            ]
        });
    }
    return /*#__PURE__*/ _jsxs(ErrorBoundary, {
        errorComponent: DefaultGlobalError,
        children: [
            globalErrorStyles,
            /*#__PURE__*/ _jsx(GlobalError, {
                error: error
            })
        ]
    });
}
export class AppDevOverlayErrorBoundary extends PureComponent {
    static getDerivedStateFromError(error) {
        if (!error.stack) {
            return {
                isReactError: false,
                reactError: null
            };
        }
        RuntimeErrorHandler.hadRuntimeError = true;
        return {
            isReactError: true,
            reactError: error
        };
    }
    componentDidCatch() {
        this.props.onError(this.state.isReactError);
    }
    render() {
        const { children, globalError } = this.props;
        const { isReactError, reactError } = this.state;
        const fallback = /*#__PURE__*/ _jsx(ErroredHtml, {
            globalError: globalError,
            error: reactError
        });
        return isReactError ? fallback : children;
    }
    constructor(...args){
        super(...args), this.state = {
            isReactError: false,
            reactError: null
        };
    }
}

//# sourceMappingURL=app-dev-overlay-error-boundary.js.map