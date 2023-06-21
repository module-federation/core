"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importStar(require("react"));
const ErrorBoundary_1 = tslib_1.__importDefault(require("./ErrorBoundary"));
/**
 * A fallback component that renders nothing.
 */
const FallbackComponent = () => {
    return null;
};
/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options.
 */
const FederationBoundary = (_a) => {
    var { dynamicImporter, fallback = () => Promise.resolve(FallbackComponent), customBoundary: CustomBoundary = ErrorBoundary_1.default } = _a, rest = tslib_1.__rest(_a, ["dynamicImporter", "fallback", "customBoundary"]);
    const ImportResult = (0, react_1.useMemo)(() => {
        return (0, react_1.lazy)(() => dynamicImporter()
            .catch((e) => {
            console.error(e);
            return fallback();
        })
            .then((m) => {
            return {
                //@ts-ignore
                default: m.default || m,
            };
        }));
    }, [dynamicImporter, fallback]);
    return (react_1.default.createElement(CustomBoundary, null,
        react_1.default.createElement(ImportResult, Object.assign({}, rest))));
};
exports.default = FederationBoundary;
//# sourceMappingURL=FederationBoundary.js.map