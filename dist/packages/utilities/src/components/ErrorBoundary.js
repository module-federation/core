"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
/**
 * Generic error boundary component.
 */
var ErrorBoundary = /** @class */ (function (_super) {
    tslib_1.__extends(ErrorBoundary, _super);
    function ErrorBoundary(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            hasError: false,
        };
        return _this;
    }
    ErrorBoundary.getDerivedStateFromError = function ( /*error: Error*/) {
        return {
            hasError: true,
        };
    };
    ErrorBoundary.prototype.componentDidCatch = function (error, errorInfo) {
        console.error(error, errorInfo);
    };
    ErrorBoundary.prototype.render = function () {
        if (this.state.hasError) {
            return 'An error has occurred.';
        }
        return this.props.children;
    };
    return ErrorBoundary;
}(react_1.default.Component));
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map