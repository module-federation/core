"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlushedChunks = exports.revalidate = exports.flushChunks = exports.injectScript = exports.extractUrlAndGlobal = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
var utilities_1 = require("@module-federation/utilities");
Object.defineProperty(exports, "extractUrlAndGlobal", { enumerable: true, get: function () { return utilities_1.extractUrlAndGlobal; } });
Object.defineProperty(exports, "injectScript", { enumerable: true, get: function () { return utilities_1.injectScript; } });
// @ts-ignore
var utils_1 = require("@module-federation/node/utils");
Object.defineProperty(exports, "flushChunks", { enumerable: true, get: function () { return utils_1.flushChunks; } });
const revalidate = () => {
    if (typeof window !== 'undefined') {
        console.error('revalidate should only be called server-side');
        return Promise.resolve(false);
    }
    // @ts-ignore
    return Promise.resolve().then(() => tslib_1.__importStar(require('@module-federation/node/utils'))).then((utils) => {
        return utils.revalidate();
    });
};
exports.revalidate = revalidate;
const FlushedChunks = ({ chunks }) => {
    const scripts = chunks
        .filter((c) => c.endsWith('.js'))
        .map((chunk) => {
        if (!chunk.includes('?') && chunk.includes('remoteEntry')) {
            chunk = chunk + '?t=' + Date.now();
        }
        return React.createElement('script', {
            key: chunk,
            src: chunk,
            async: true,
        }, null);
    });
    const css = chunks
        .filter((c) => c.endsWith('.css'))
        .map((chunk) => {
        return React.createElement('link', {
            key: chunk,
            href: chunk,
            rel: 'stylesheet',
        }, null);
    });
    return React.createElement(React.Fragment, null, css, scripts);
};
exports.FlushedChunks = FlushedChunks;
exports.FlushedChunks.defaultProps = {
    chunks: [],
};
//# sourceMappingURL=index.js.map