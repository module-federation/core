import { jsx as _jsx } from "react/jsx-runtime";
import { HTTPAccessErrorFallback } from './http-access-fallback/error-fallback';
export default function Forbidden() {
    return /*#__PURE__*/ _jsx(HTTPAccessErrorFallback, {
        status: 403,
        message: "This page could not be accessed."
    });
}

//# sourceMappingURL=forbidden-error.js.map