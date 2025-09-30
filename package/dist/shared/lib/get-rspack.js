"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    getRspackCore: null,
    getRspackReactRefresh: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getRspackCore: function() {
        return getRspackCore;
    },
    getRspackReactRefresh: function() {
        return getRspackReactRefresh;
    }
});
const _log = require("../../build/output/log");
function getRspackCore() {
    warnRspack();
    try {
        const paths = [
            require.resolve('next-rspack')
        ];
        // eslint-disable-next-line import/no-extraneous-dependencies
        return require(require.resolve('@rspack/core', {
            paths
        }));
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
            throw Object.defineProperty(new Error('@rspack/core is not available. Please make sure `next-rspack` is correctly installed.'), "__NEXT_ERROR_CODE", {
                value: "E647",
                enumerable: false,
                configurable: true
            });
        }
        throw e;
    }
}
function getRspackReactRefresh() {
    warnRspack();
    try {
        const paths = [
            require.resolve('next-rspack')
        ];
        // eslint-disable-next-line import/no-extraneous-dependencies
        const plugin = require(require.resolve('@rspack/plugin-react-refresh', {
            paths
        }));
        const entry = require.resolve('@rspack/plugin-react-refresh/react-refresh-entry', {
            paths
        });
        plugin.entry = entry;
        return plugin;
    } catch (e) {
        if (e instanceof Error && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
            throw Object.defineProperty(new Error('@rspack/plugin-react-refresh is not available. Please make sure `next-rspack` is correctly installed.'), "__NEXT_ERROR_CODE", {
                value: "E648",
                enumerable: false,
                configurable: true
            });
        }
        throw e;
    }
}
function warnRspack() {
    (0, _log.warnOnce)("`next-rspack` is currently experimental. It's not an official Next.js plugin, and is supported by the Rspack team in partnership with Next.js. Help improve Next.js and Rspack by providing feedback at https://github.com/vercel/next.js/discussions/77800");
}

//# sourceMappingURL=get-rspack.js.map