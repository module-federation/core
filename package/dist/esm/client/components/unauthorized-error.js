import { jsx as _jsx } from "react/jsx-runtime";
import { HTTPAccessErrorFallback } from './http-access-fallback/error-fallback';
export default function Unauthorized() {
    return /*#__PURE__*/ _jsx(HTTPAccessErrorFallback, {
        status: 401,
        message: "You're not authorized to access this page."
    });
}

//# sourceMappingURL=unauthorized-error.js.map