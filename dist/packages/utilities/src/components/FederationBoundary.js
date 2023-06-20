"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importStar(require("react"));
var ErrorBoundary_1 = tslib_1.__importDefault(require("./ErrorBoundary"));
/**
 * A fallback component that renders nothing.
 */
var FallbackComponent = function () {
    return null;
};
/**
 * Wrapper around dynamic import.
 * Adds error boundaries and fallback options.
 */
var FederationBoundary = function (_a) {
    var dynamicImporter = _a.dynamicImporter, _b = _a.fallback, fallback = _b === void 0 ? function () { return Promise.resolve(FallbackComponent); } : _b, _c = _a.customBoundary, CustomBoundary = _c === void 0 ? ErrorBoundary_1.default : _c, rest = tslib_1.__rest(_a, ["dynamicImporter", "fallback", "customBoundary"]);
    var ImportResult = (0, react_1.useMemo)(function () {
        return (0, react_1.lazy)(function () {
            return dynamicImporter()
                .catch(function (e) {
                console.error(e);
                return fallback();
            })
                .then(function (m) {
                return {
                    //@ts-ignore
                    default: m.default || m,
                };
            });
        });
    }, [dynamicImporter, fallback]);
    return (react_1.default.createElement(CustomBoundary, null,
        react_1.default.createElement(ImportResult, tslib_1.__assign({}, rest))));
};
exports.default = FederationBoundary;
//# sourceMappingURL=FederationBoundary.js.map