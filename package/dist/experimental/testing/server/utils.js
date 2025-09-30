"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    constructRequest: null,
    getRedirectUrl: null,
    getRewrittenUrl: null,
    isRewrite: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    constructRequest: function() {
        return constructRequest;
    },
    getRedirectUrl: function() {
        return getRedirectUrl;
    },
    getRewrittenUrl: function() {
        return getRewrittenUrl;
    },
    isRewrite: function() {
        return isRewrite;
    }
});
const _mockrequest = require("../../../server/lib/mock-request");
const _node = require("../../../server/base-http/node");
const _url = require("../../../lib/url");
function constructRequest({ url, headers = {}, cookies = {} }) {
    if (!headers) {
        headers = {};
    }
    if (!headers.host) {
        var _parseUrl;
        headers.host = (_parseUrl = (0, _url.parseUrl)(url)) == null ? void 0 : _parseUrl.host;
    }
    if (cookies) {
        headers = {
            ...headers,
            cookie: Object.entries(cookies).map(([name, value])=>`${name}=${value}`).join(';')
        };
    }
    return new _node.NodeNextRequest(new _mockrequest.MockedRequest({
        url,
        headers,
        method: 'GET'
    }));
}
function getRedirectUrl(response) {
    return response.headers.get('location');
}
function isRewrite(response) {
    return Boolean(getRewrittenUrl(response));
}
function getRewrittenUrl(response) {
    return response.headers.get('x-middleware-rewrite');
}

//# sourceMappingURL=utils.js.map