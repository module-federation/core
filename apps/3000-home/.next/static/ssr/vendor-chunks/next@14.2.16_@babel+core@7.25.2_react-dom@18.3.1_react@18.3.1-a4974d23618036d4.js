exports.id = "vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1";
exports.ids = ["vendor-chunks/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1"];
exports.modules = {

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/deployment-id.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/deployment-id.js ***!
  \********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getDeploymentIdQueryOrEmptyString", ({
    enumerable: true,
    get: function() {
        return getDeploymentIdQueryOrEmptyString;
    }
}));
function getDeploymentIdQueryOrEmptyString() {
    if (false) {}
    return "";
}

//# sourceMappingURL=deployment-id.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-base-path.js":
/*!*********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-base-path.js ***!
  \*********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addBasePath", ({
    enumerable: true,
    get: function() {
        return addBasePath;
    }
}));
const _addpathprefix = __webpack_require__(/*! ../shared/lib/router/utils/add-path-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js");
const _normalizetrailingslash = __webpack_require__(/*! ./normalize-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js");
const basePath =  false || "";
function addBasePath(path, required) {
    return (0, _normalizetrailingslash.normalizePathTrailingSlash)( false ? 0 : (0, _addpathprefix.addPathPrefix)(path, basePath));
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=add-base-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-locale.js":
/*!******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-locale.js ***!
  \******************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addLocale", ({
    enumerable: true,
    get: function() {
        return addLocale;
    }
}));
const _normalizetrailingslash = __webpack_require__(/*! ./normalize-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js");
const addLocale = function(path) {
    for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        args[_key - 1] = arguments[_key];
    }
    if (false) {}
    return path;
};
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=add-locale.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/app-router-headers.js":
/*!*************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/app-router-headers.js ***!
  \*************************************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ACTION: function() {
        return ACTION;
    },
    FLIGHT_PARAMETERS: function() {
        return FLIGHT_PARAMETERS;
    },
    NEXT_DID_POSTPONE_HEADER: function() {
        return NEXT_DID_POSTPONE_HEADER;
    },
    NEXT_ROUTER_PREFETCH_HEADER: function() {
        return NEXT_ROUTER_PREFETCH_HEADER;
    },
    NEXT_ROUTER_STATE_TREE: function() {
        return NEXT_ROUTER_STATE_TREE;
    },
    NEXT_RSC_UNION_QUERY: function() {
        return NEXT_RSC_UNION_QUERY;
    },
    NEXT_URL: function() {
        return NEXT_URL;
    },
    RSC_CONTENT_TYPE_HEADER: function() {
        return RSC_CONTENT_TYPE_HEADER;
    },
    RSC_HEADER: function() {
        return RSC_HEADER;
    }
});
const RSC_HEADER = "RSC";
const ACTION = "Next-Action";
const NEXT_ROUTER_STATE_TREE = "Next-Router-State-Tree";
const NEXT_ROUTER_PREFETCH_HEADER = "Next-Router-Prefetch";
const NEXT_URL = "Next-Url";
const RSC_CONTENT_TYPE_HEADER = "text/x-component";
const FLIGHT_PARAMETERS = [
    [
        RSC_HEADER
    ],
    [
        NEXT_ROUTER_STATE_TREE
    ],
    [
        NEXT_ROUTER_PREFETCH_HEADER
    ]
];
const NEXT_RSC_UNION_QUERY = "_rsc";
const NEXT_DID_POSTPONE_HEADER = "x-nextjs-postponed";
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=app-router-headers.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/router-reducer/router-reducer-types.js":
/*!******************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/router-reducer/router-reducer-types.js ***!
  \******************************************************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    ACTION_FAST_REFRESH: function() {
        return ACTION_FAST_REFRESH;
    },
    ACTION_NAVIGATE: function() {
        return ACTION_NAVIGATE;
    },
    ACTION_PREFETCH: function() {
        return ACTION_PREFETCH;
    },
    ACTION_REFRESH: function() {
        return ACTION_REFRESH;
    },
    ACTION_RESTORE: function() {
        return ACTION_RESTORE;
    },
    ACTION_SERVER_ACTION: function() {
        return ACTION_SERVER_ACTION;
    },
    ACTION_SERVER_PATCH: function() {
        return ACTION_SERVER_PATCH;
    },
    PrefetchCacheEntryStatus: function() {
        return PrefetchCacheEntryStatus;
    },
    PrefetchKind: function() {
        return PrefetchKind;
    },
    isThenable: function() {
        return isThenable;
    }
});
const ACTION_REFRESH = "refresh";
const ACTION_NAVIGATE = "navigate";
const ACTION_RESTORE = "restore";
const ACTION_SERVER_PATCH = "server-patch";
const ACTION_PREFETCH = "prefetch";
const ACTION_FAST_REFRESH = "fast-refresh";
const ACTION_SERVER_ACTION = "server-action";
var PrefetchKind;
(function(PrefetchKind) {
    PrefetchKind["AUTO"] = "auto";
    PrefetchKind["FULL"] = "full";
    PrefetchKind["TEMPORARY"] = "temporary";
})(PrefetchKind || (PrefetchKind = {}));
var PrefetchCacheEntryStatus;
(function(PrefetchCacheEntryStatus) {
    PrefetchCacheEntryStatus["fresh"] = "fresh";
    PrefetchCacheEntryStatus["reusable"] = "reusable";
    PrefetchCacheEntryStatus["expired"] = "expired";
    PrefetchCacheEntryStatus["stale"] = "stale";
})(PrefetchCacheEntryStatus || (PrefetchCacheEntryStatus = {}));
function isThenable(value) {
    // TODO: We don't gain anything from this abstraction. It's unsound, and only
    // makes sense in the specific places where we use it. So it's better to keep
    // the type coercion inline, instead of leaking this to other places in
    // the codebase.
    return value && (typeof value === "object" || typeof value === "function") && typeof value.then === "function";
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=router-reducer-types.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/detect-domain-locale.js":
/*!****************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/detect-domain-locale.js ***!
  \****************************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "detectDomainLocale", ({
    enumerable: true,
    get: function() {
        return detectDomainLocale;
    }
}));
const detectDomainLocale = function() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    if (false) {}
};
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=detect-domain-locale.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/get-domain-locale.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/get-domain-locale.js ***!
  \*************************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getDomainLocale", ({
    enumerable: true,
    get: function() {
        return getDomainLocale;
    }
}));
const _normalizetrailingslash = __webpack_require__(/*! ./normalize-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js");
const basePath =  false || "";
function getDomainLocale(path, locale, locales, domainLocales) {
    if (false) {} else {
        return false;
    }
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=get-domain-locale.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/has-base-path.js":
/*!*********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/has-base-path.js ***!
  \*********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "hasBasePath", ({
    enumerable: true,
    get: function() {
        return hasBasePath;
    }
}));
const _pathhasprefix = __webpack_require__(/*! ../shared/lib/router/utils/path-has-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js");
const basePath =  false || "";
function hasBasePath(path) {
    return (0, _pathhasprefix.pathHasPrefix)(path, basePath);
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=has-base-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/head-manager.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/head-manager.js ***!
  \********************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DOMAttributeNames: function() {
        return DOMAttributeNames;
    },
    default: function() {
        return initHeadManager;
    },
    isEqualNode: function() {
        return isEqualNode;
    }
});
const DOMAttributeNames = {
    acceptCharset: "accept-charset",
    className: "class",
    htmlFor: "for",
    httpEquiv: "http-equiv",
    noModule: "noModule"
};
function reactElementToDOM(param) {
    let { type, props } = param;
    const el = document.createElement(type);
    for(const p in props){
        if (!props.hasOwnProperty(p)) continue;
        if (p === "children" || p === "dangerouslySetInnerHTML") continue;
        // we don't render undefined props to the DOM
        if (props[p] === undefined) continue;
        const attr = DOMAttributeNames[p] || p.toLowerCase();
        if (type === "script" && (attr === "async" || attr === "defer" || attr === "noModule")) {
            el[attr] = !!props[p];
        } else {
            el.setAttribute(attr, props[p]);
        }
    }
    const { children, dangerouslySetInnerHTML } = props;
    if (dangerouslySetInnerHTML) {
        el.innerHTML = dangerouslySetInnerHTML.__html || "";
    } else if (children) {
        el.textContent = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
    }
    return el;
}
function isEqualNode(oldTag, newTag) {
    if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
        const nonce = newTag.getAttribute("nonce");
        // Only strip the nonce if `oldTag` has had it stripped. An element's nonce attribute will not
        // be stripped if there is no content security policy response header that includes a nonce.
        if (nonce && !oldTag.getAttribute("nonce")) {
            const cloneTag = newTag.cloneNode(true);
            cloneTag.setAttribute("nonce", "");
            cloneTag.nonce = nonce;
            return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
        }
    }
    return oldTag.isEqualNode(newTag);
}
let updateElements;
if (false) {} else {
    updateElements = (type, components)=>{
        const headEl = document.getElementsByTagName("head")[0];
        const headCountEl = headEl.querySelector("meta[name=next-head-count]");
        if (true) {
            if (!headCountEl) {
                console.error("Warning: next-head-count is missing. https://nextjs.org/docs/messages/next-head-count-missing");
                return;
            }
        }
        const headCount = Number(headCountEl.content);
        const oldTags = [];
        for(let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j == null ? void 0 : j.previousElementSibling) || null){
            var _j_tagName;
            if ((j == null ? void 0 : (_j_tagName = j.tagName) == null ? void 0 : _j_tagName.toLowerCase()) === type) {
                oldTags.push(j);
            }
        }
        const newTags = components.map(reactElementToDOM).filter((newTag)=>{
            for(let k = 0, len = oldTags.length; k < len; k++){
                const oldTag = oldTags[k];
                if (isEqualNode(oldTag, newTag)) {
                    oldTags.splice(k, 1);
                    return false;
                }
            }
            return true;
        });
        oldTags.forEach((t)=>{
            var _t_parentNode;
            return (_t_parentNode = t.parentNode) == null ? void 0 : _t_parentNode.removeChild(t);
        });
        newTags.forEach((t)=>headEl.insertBefore(t, headCountEl));
        headCountEl.content = (headCount - oldTags.length + newTags.length).toString();
    };
}
function initHeadManager() {
    return {
        mountedInstances: new Set(),
        updateHead: (head)=>{
            const tags = {};
            head.forEach((h)=>{
                if (// it won't be inlined. In this case revert to the original behavior
                h.type === "link" && h.props["data-optimized-fonts"]) {
                    if (document.querySelector('style[data-href="' + h.props["data-href"] + '"]')) {
                        return;
                    } else {
                        h.props.href = h.props["data-href"];
                        h.props["data-href"] = undefined;
                    }
                }
                const components = tags[h.type] || [];
                components.push(h);
                tags[h.type] = components;
            });
            const titleComponent = tags.title ? tags.title[0] : null;
            let title = "";
            if (titleComponent) {
                const { children } = titleComponent.props;
                title = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
            }
            if (title !== document.title) document.title = title;
            [
                "meta",
                "base",
                "link",
                "style",
                "script"
            ].forEach((type)=>{
                updateElements(type, tags[type] || []);
            });
        }
    };
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=head-manager.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/image-component.js":
/*!***********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/image-component.js ***!
  \***********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* __next_internal_client_entry_do_not_use__  cjs */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "Image", ({
    enumerable: true,
    get: function() {
        return Image;
    }
}));
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _interop_require_wildcard = __webpack_require__(/*! @swc/helpers/_/_interop_require_wildcard */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__webpack_require__(/*! react */ "react"));
const _reactdom = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react-dom */ "react-dom"));
const _head = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ../shared/lib/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/head.js"));
const _getimgprops = __webpack_require__(/*! ../shared/lib/get-img-props */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/get-img-props.js");
const _imageconfig = __webpack_require__(/*! ../shared/lib/image-config */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-config.js");
const _imageconfigcontextsharedruntime = __webpack_require__(/*! ../shared/lib/image-config-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/image-config-context.js");
const _warnonce = __webpack_require__(/*! ../shared/lib/utils/warn-once */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js");
const _routercontextsharedruntime = __webpack_require__(/*! ../shared/lib/router-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/router-context.js");
const _imageloader = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! next/dist/shared/lib/image-loader */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-loader.js"));
// This is replaced by webpack define plugin
const configEnv = {"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","dangerouslyAllowSVG":false,"unoptimized":false,"domains":[],"remotePatterns":[]};
if (true) {
    globalThis.__NEXT_IMAGE_IMPORTED = true;
}
// See https://stackoverflow.com/q/39777833/266535 for why we use this ref
// handler instead of the img's onLoad attribute.
function handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput) {
    const src = img == null ? void 0 : img.src;
    if (!img || img["data-loaded-src"] === src) {
        return;
    }
    img["data-loaded-src"] = src;
    const p = "decode" in img ? img.decode() : Promise.resolve();
    p.catch(()=>{}).then(()=>{
        if (!img.parentElement || !img.isConnected) {
            // Exit early in case of race condition:
            // - onload() is called
            // - decode() is called but incomplete
            // - unmount is called
            // - decode() completes
            return;
        }
        if (placeholder !== "empty") {
            setBlurComplete(true);
        }
        if (onLoadRef == null ? void 0 : onLoadRef.current) {
            // Since we don't have the SyntheticEvent here,
            // we must create one with the same shape.
            // See https://reactjs.org/docs/events.html
            const event = new Event("load");
            Object.defineProperty(event, "target", {
                writable: false,
                value: img
            });
            let prevented = false;
            let stopped = false;
            onLoadRef.current({
                ...event,
                nativeEvent: event,
                currentTarget: img,
                target: img,
                isDefaultPrevented: ()=>prevented,
                isPropagationStopped: ()=>stopped,
                persist: ()=>{},
                preventDefault: ()=>{
                    prevented = true;
                    event.preventDefault();
                },
                stopPropagation: ()=>{
                    stopped = true;
                    event.stopPropagation();
                }
            });
        }
        if (onLoadingCompleteRef == null ? void 0 : onLoadingCompleteRef.current) {
            onLoadingCompleteRef.current(img);
        }
        if (true) {
            const origSrc = new URL(src, "http://n").searchParams.get("url") || src;
            if (img.getAttribute("data-nimg") === "fill") {
                if (!unoptimized && (!sizesInput || sizesInput === "100vw")) {
                    let widthViewportRatio = img.getBoundingClientRect().width / window.innerWidth;
                    if (widthViewportRatio < 0.6) {
                        if (sizesInput === "100vw") {
                            (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" prop and "sizes" prop of "100vw", but image is not rendered at full viewport width. Please adjust "sizes" to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes');
                        } else {
                            (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" but is missing "sizes" prop. Please add it to improve page performance. Read more: https://nextjs.org/docs/api-reference/next/image#sizes');
                        }
                    }
                }
                if (img.parentElement) {
                    const { position } = window.getComputedStyle(img.parentElement);
                    const valid = [
                        "absolute",
                        "fixed",
                        "relative"
                    ];
                    if (!valid.includes(position)) {
                        (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" and parent element with invalid "position". Provided "' + position + '" should be one of ' + valid.map(String).join(",") + ".");
                    }
                }
                if (img.height === 0) {
                    (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has "fill" and a height value of 0. This is likely because the parent element of the image has not been styled to have a set height.');
                }
            }
            const heightModified = img.height.toString() !== img.getAttribute("height");
            const widthModified = img.width.toString() !== img.getAttribute("width");
            if (heightModified && !widthModified || !heightModified && widthModified) {
                (0, _warnonce.warnOnce)('Image with src "' + origSrc + '" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles \'width: "auto"\' or \'height: "auto"\' to maintain the aspect ratio.');
            }
        }
    });
}
function getDynamicProps(fetchPriority) {
    if (Boolean(_react.use)) {
        // In React 19.0.0 or newer, we must use camelCase
        // prop to avoid "Warning: Invalid DOM property".
        // See https://github.com/facebook/react/pull/25927
        return {
            fetchPriority
        };
    }
    // In React 18.2.0 or older, we must use lowercase prop
    // to avoid "Warning: Invalid DOM property".
    return {
        fetchpriority: fetchPriority
    };
}
const ImageElement = /*#__PURE__*/ (0, _react.forwardRef)((param, forwardedRef)=>{
    let { src, srcSet, sizes, height, width, decoding, className, style, fetchPriority, placeholder, loading, unoptimized, fill, onLoadRef, onLoadingCompleteRef, setBlurComplete, setShowAltText, sizesInput, onLoad, onError, ...rest } = param;
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("img", {
        ...rest,
        ...getDynamicProps(fetchPriority),
        // It's intended to keep `loading` before `src` because React updates
        // props in order which causes Safari/Firefox to not lazy load properly.
        // See https://github.com/facebook/react/issues/25883
        loading: loading,
        width: width,
        height: height,
        decoding: decoding,
        "data-nimg": fill ? "fill" : "1",
        className: className,
        style: style,
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        sizes: sizes,
        srcSet: srcSet,
        src: src,
        ref: (0, _react.useCallback)((img)=>{
            if (forwardedRef) {
                if (typeof forwardedRef === "function") forwardedRef(img);
                else if (typeof forwardedRef === "object") {
                    // @ts-ignore - .current is read only it's usually assigned by react internally
                    forwardedRef.current = img;
                }
            }
            if (!img) {
                return;
            }
            if (onError) {
                // If the image has an error before react hydrates, then the error is lost.
                // The workaround is to wait until the image is mounted which is after hydration,
                // then we set the src again to trigger the error handler (if there was an error).
                // eslint-disable-next-line no-self-assign
                img.src = img.src;
            }
            if (true) {
                if (!src) {
                    console.error('Image is missing required "src" property:', img);
                }
                if (img.getAttribute("alt") === null) {
                    console.error('Image is missing required "alt" property. Please add Alternative Text to describe the image for screen readers and search engines.');
                }
            }
            if (img.complete) {
                handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
            }
        }, [
            src,
            placeholder,
            onLoadRef,
            onLoadingCompleteRef,
            setBlurComplete,
            onError,
            unoptimized,
            sizesInput,
            forwardedRef
        ]),
        onLoad: (event)=>{
            const img = event.currentTarget;
            handleLoading(img, placeholder, onLoadRef, onLoadingCompleteRef, setBlurComplete, unoptimized, sizesInput);
        },
        onError: (event)=>{
            // if the real image fails to load, this will ensure "alt" is visible
            setShowAltText(true);
            if (placeholder !== "empty") {
                // If the real image fails to load, this will still remove the placeholder.
                setBlurComplete(true);
            }
            if (onError) {
                onError(event);
            }
        }
    });
});
function ImagePreload(param) {
    let { isAppRouter, imgAttributes } = param;
    const opts = {
        as: "image",
        imageSrcSet: imgAttributes.srcSet,
        imageSizes: imgAttributes.sizes,
        crossOrigin: imgAttributes.crossOrigin,
        referrerPolicy: imgAttributes.referrerPolicy,
        ...getDynamicProps(imgAttributes.fetchPriority)
    };
    if (isAppRouter && _reactdom.default.preload) {
        // See https://github.com/facebook/react/pull/26940
        _reactdom.default.preload(imgAttributes.src, opts);
        return null;
    }
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_head.default, {
        children: /*#__PURE__*/ (0, _jsxruntime.jsx)("link", {
            rel: "preload",
            // Note how we omit the `href` attribute, as it would only be relevant
            // for browsers that do not support `imagesrcset`, and in those cases
            // it would cause the incorrect image to be preloaded.
            //
            // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-imagesrcset
            href: imgAttributes.srcSet ? undefined : imgAttributes.src,
            ...opts
        }, "__nimg-" + imgAttributes.src + imgAttributes.srcSet + imgAttributes.sizes)
    });
}
const Image = /*#__PURE__*/ (0, _react.forwardRef)((props, forwardedRef)=>{
    const pagesRouter = (0, _react.useContext)(_routercontextsharedruntime.RouterContext);
    // We're in the app directory if there is no pages router.
    const isAppRouter = !pagesRouter;
    const configContext = (0, _react.useContext)(_imageconfigcontextsharedruntime.ImageConfigContext);
    const config = (0, _react.useMemo)(()=>{
        const c = configEnv || configContext || _imageconfig.imageConfigDefault;
        const allSizes = [
            ...c.deviceSizes,
            ...c.imageSizes
        ].sort((a, b)=>a - b);
        const deviceSizes = c.deviceSizes.sort((a, b)=>a - b);
        return {
            ...c,
            allSizes,
            deviceSizes
        };
    }, [
        configContext
    ]);
    const { onLoad, onLoadingComplete } = props;
    const onLoadRef = (0, _react.useRef)(onLoad);
    (0, _react.useEffect)(()=>{
        onLoadRef.current = onLoad;
    }, [
        onLoad
    ]);
    const onLoadingCompleteRef = (0, _react.useRef)(onLoadingComplete);
    (0, _react.useEffect)(()=>{
        onLoadingCompleteRef.current = onLoadingComplete;
    }, [
        onLoadingComplete
    ]);
    const [blurComplete, setBlurComplete] = (0, _react.useState)(false);
    const [showAltText, setShowAltText] = (0, _react.useState)(false);
    const { props: imgAttributes, meta: imgMeta } = (0, _getimgprops.getImgProps)(props, {
        defaultLoader: _imageloader.default,
        imgConf: config,
        blurComplete,
        showAltText
    });
    return /*#__PURE__*/ (0, _jsxruntime.jsxs)(_jsxruntime.Fragment, {
        children: [
            /*#__PURE__*/ (0, _jsxruntime.jsx)(ImageElement, {
                ...imgAttributes,
                unoptimized: imgMeta.unoptimized,
                placeholder: imgMeta.placeholder,
                fill: imgMeta.fill,
                onLoadRef: onLoadRef,
                onLoadingCompleteRef: onLoadingCompleteRef,
                setBlurComplete: setBlurComplete,
                setShowAltText: setShowAltText,
                sizesInput: props.sizes,
                ref: forwardedRef
            }),
            imgMeta.priority ? /*#__PURE__*/ (0, _jsxruntime.jsx)(ImagePreload, {
                isAppRouter: isAppRouter,
                imgAttributes: imgAttributes
            }) : null
        ]
    });
});
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=image-component.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/link.js":
/*!************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/link.js ***!
  \************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* __next_internal_client_entry_do_not_use__  cjs */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return _default;
    }
}));
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react */ "react"));
const _resolvehref = __webpack_require__(/*! ./resolve-href */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/resolve-href.js");
const _islocalurl = __webpack_require__(/*! ../shared/lib/router/utils/is-local-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-local-url.js");
const _formaturl = __webpack_require__(/*! ../shared/lib/router/utils/format-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-url.js");
const _utils = __webpack_require__(/*! ../shared/lib/utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
const _addlocale = __webpack_require__(/*! ./add-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-locale.js");
const _routercontextsharedruntime = __webpack_require__(/*! ../shared/lib/router-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/router-context.js");
const _approutercontextsharedruntime = __webpack_require__(/*! ../shared/lib/app-router-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/app-router-context.js");
const _useintersection = __webpack_require__(/*! ./use-intersection */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/use-intersection.js");
const _getdomainlocale = __webpack_require__(/*! ./get-domain-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/get-domain-locale.js");
const _addbasepath = __webpack_require__(/*! ./add-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-base-path.js");
const _routerreducertypes = __webpack_require__(/*! ./components/router-reducer/router-reducer-types */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/router-reducer/router-reducer-types.js");
const prefetched = new Set();
function prefetch(router, href, as, options, appOptions, isAppRouter) {
    if (true) {
        return;
    }
    // app-router supports external urls out of the box so it shouldn't short-circuit here as support for e.g. `replace` is added in the app-router.
    if (!isAppRouter && !(0, _islocalurl.isLocalURL)(href)) {
        return;
    }
    // We should only dedupe requests when experimental.optimisticClientCache is
    // disabled.
    if (!options.bypassPrefetchedCheck) {
        const locale = typeof options.locale !== "undefined" ? options.locale : "locale" in router ? router.locale : undefined;
        const prefetchedKey = href + "%" + as + "%" + locale;
        // If we've already fetched the key, then don't prefetch it again!
        if (prefetched.has(prefetchedKey)) {
            return;
        }
        // Mark this URL as prefetched.
        prefetched.add(prefetchedKey);
    }
    const doPrefetch = async ()=>{
        if (isAppRouter) {
            // note that `appRouter.prefetch()` is currently sync,
            // so we have to wrap this call in an async function to be able to catch() errors below.
            return router.prefetch(href, appOptions);
        } else {
            return router.prefetch(href, as, options);
        }
    };
    // Prefetch the JSON page if asked (only in the client)
    // We need to handle a prefetch error here since we may be
    // loading with priority which can reject but we don't
    // want to force navigation since this is only a prefetch
    doPrefetch().catch((err)=>{
        if (true) {
            // rethrow to show invalid URL errors
            throw err;
        }
    });
}
function isModifiedEvent(event) {
    const eventTarget = event.currentTarget;
    const target = eventTarget.getAttribute("target");
    return target && target !== "_self" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || // triggers resource download
    event.nativeEvent && event.nativeEvent.which === 2;
}
function linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAppRouter) {
    const { nodeName } = e.currentTarget;
    // anchors inside an svg have a lowercase nodeName
    const isAnchorNodeName = nodeName.toUpperCase() === "A";
    if (isAnchorNodeName && (isModifiedEvent(e) || // app-router supports external urls out of the box so it shouldn't short-circuit here as support for e.g. `replace` is added in the app-router.
    !isAppRouter && !(0, _islocalurl.isLocalURL)(href))) {
        // ignore click for browser’s default behavior
        return;
    }
    e.preventDefault();
    const navigate = ()=>{
        // If the router is an NextRouter instance it will have `beforePopState`
        const routerScroll = scroll != null ? scroll : true;
        if ("beforePopState" in router) {
            router[replace ? "replace" : "push"](href, as, {
                shallow,
                locale,
                scroll: routerScroll
            });
        } else {
            router[replace ? "replace" : "push"](as || href, {
                scroll: routerScroll
            });
        }
    };
    if (isAppRouter) {
        _react.default.startTransition(navigate);
    } else {
        navigate();
    }
}
function formatStringOrUrl(urlObjOrString) {
    if (typeof urlObjOrString === "string") {
        return urlObjOrString;
    }
    return (0, _formaturl.formatUrl)(urlObjOrString);
}
/**
 * A React component that extends the HTML `<a>` element to provide [prefetching](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#2-prefetching)
 * and client-side navigation between routes.
 *
 * It is the primary way to navigate between routes in Next.js.
 *
 * Read more: [Next.js docs: `<Link>`](https://nextjs.org/docs/app/api-reference/components/link)
 */ const Link = /*#__PURE__*/ _react.default.forwardRef(function LinkComponent(props, forwardedRef) {
    let children;
    const { href: hrefProp, as: asProp, children: childrenProp, prefetch: prefetchProp = null, passHref, replace, shallow, scroll, locale, onClick, onMouseEnter: onMouseEnterProp, onTouchStart: onTouchStartProp, legacyBehavior = false, ...restProps } = props;
    children = childrenProp;
    if (legacyBehavior && (typeof children === "string" || typeof children === "number")) {
        children = /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
            children: children
        });
    }
    const pagesRouter = _react.default.useContext(_routercontextsharedruntime.RouterContext);
    const appRouter = _react.default.useContext(_approutercontextsharedruntime.AppRouterContext);
    const router = pagesRouter != null ? pagesRouter : appRouter;
    // We're in the app directory if there is no pages router.
    const isAppRouter = !pagesRouter;
    const prefetchEnabled = prefetchProp !== false;
    /**
     * The possible states for prefetch are:
     * - null: this is the default "auto" mode, where we will prefetch partially if the link is in the viewport
     * - true: we will prefetch if the link is visible and prefetch the full page, not just partially
     * - false: we will not prefetch if in the viewport at all
     */ const appPrefetchKind = prefetchProp === null ? _routerreducertypes.PrefetchKind.AUTO : _routerreducertypes.PrefetchKind.FULL;
    if (true) {
        function createPropError(args) {
            return new Error("Failed prop type: The prop `" + args.key + "` expects a " + args.expected + " in `<Link>`, but got `" + args.actual + "` instead." + ( false ? 0 : ""));
        }
        // TypeScript trick for type-guarding:
        const requiredPropsGuard = {
            href: true
        };
        const requiredProps = Object.keys(requiredPropsGuard);
        requiredProps.forEach((key)=>{
            if (key === "href") {
                if (props[key] == null || typeof props[key] !== "string" && typeof props[key] !== "object") {
                    throw createPropError({
                        key,
                        expected: "`string` or `object`",
                        actual: props[key] === null ? "null" : typeof props[key]
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = key;
            }
        });
        // TypeScript trick for type-guarding:
        const optionalPropsGuard = {
            as: true,
            replace: true,
            scroll: true,
            shallow: true,
            passHref: true,
            prefetch: true,
            locale: true,
            onClick: true,
            onMouseEnter: true,
            onTouchStart: true,
            legacyBehavior: true
        };
        const optionalProps = Object.keys(optionalPropsGuard);
        optionalProps.forEach((key)=>{
            const valType = typeof props[key];
            if (key === "as") {
                if (props[key] && valType !== "string" && valType !== "object") {
                    throw createPropError({
                        key,
                        expected: "`string` or `object`",
                        actual: valType
                    });
                }
            } else if (key === "locale") {
                if (props[key] && valType !== "string") {
                    throw createPropError({
                        key,
                        expected: "`string`",
                        actual: valType
                    });
                }
            } else if (key === "onClick" || key === "onMouseEnter" || key === "onTouchStart") {
                if (props[key] && valType !== "function") {
                    throw createPropError({
                        key,
                        expected: "`function`",
                        actual: valType
                    });
                }
            } else if (key === "replace" || key === "scroll" || key === "shallow" || key === "passHref" || key === "prefetch" || key === "legacyBehavior") {
                if (props[key] != null && valType !== "boolean") {
                    throw createPropError({
                        key,
                        expected: "`boolean`",
                        actual: valType
                    });
                }
            } else {
                // TypeScript trick for type-guarding:
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const _ = key;
            }
        });
        // This hook is in a conditional but that is ok because `process.env.NODE_ENV` never changes
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const hasWarned = _react.default.useRef(false);
        if (props.prefetch && !hasWarned.current && !isAppRouter) {
            hasWarned.current = true;
            console.warn("Next.js auto-prefetches automatically based on viewport. The prefetch attribute is no longer needed. More: https://nextjs.org/docs/messages/prefetch-true-deprecated");
        }
    }
    if (true) {
        if (isAppRouter && !asProp) {
            let href;
            if (typeof hrefProp === "string") {
                href = hrefProp;
            } else if (typeof hrefProp === "object" && typeof hrefProp.pathname === "string") {
                href = hrefProp.pathname;
            }
            if (href) {
                const hasDynamicSegment = href.split("/").some((segment)=>segment.startsWith("[") && segment.endsWith("]"));
                if (hasDynamicSegment) {
                    throw new Error("Dynamic href `" + href + "` found in <Link> while using the `/app` router, this is not supported. Read more: https://nextjs.org/docs/messages/app-dir-dynamic-href");
                }
            }
        }
    }
    const { href, as } = _react.default.useMemo(()=>{
        if (!pagesRouter) {
            const resolvedHref = formatStringOrUrl(hrefProp);
            return {
                href: resolvedHref,
                as: asProp ? formatStringOrUrl(asProp) : resolvedHref
            };
        }
        const [resolvedHref, resolvedAs] = (0, _resolvehref.resolveHref)(pagesRouter, hrefProp, true);
        return {
            href: resolvedHref,
            as: asProp ? (0, _resolvehref.resolveHref)(pagesRouter, asProp) : resolvedAs || resolvedHref
        };
    }, [
        pagesRouter,
        hrefProp,
        asProp
    ]);
    const previousHref = _react.default.useRef(href);
    const previousAs = _react.default.useRef(as);
    // This will return the first child, if multiple are provided it will throw an error
    let child;
    if (legacyBehavior) {
        if (true) {
            if (onClick) {
                console.warn('"onClick" was passed to <Link> with `href` of `' + hrefProp + '` but "legacyBehavior" was set. The legacy behavior requires onClick be set on the child of next/link');
            }
            if (onMouseEnterProp) {
                console.warn('"onMouseEnter" was passed to <Link> with `href` of `' + hrefProp + '` but "legacyBehavior" was set. The legacy behavior requires onMouseEnter be set on the child of next/link');
            }
            try {
                child = _react.default.Children.only(children);
            } catch (err) {
                if (!children) {
                    throw new Error("No children were passed to <Link> with `href` of `" + hrefProp + "` but one child is required https://nextjs.org/docs/messages/link-no-children");
                }
                throw new Error("Multiple children were passed to <Link> with `href` of `" + hrefProp + "` but only one child is supported https://nextjs.org/docs/messages/link-multiple-children" + ( false ? 0 : ""));
            }
        } else {}
    } else {
        if (true) {
            if ((children == null ? void 0 : children.type) === "a") {
                throw new Error("Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.\nLearn more: https://nextjs.org/docs/messages/invalid-new-link-with-extra-anchor");
            }
        }
    }
    const childRef = legacyBehavior ? child && typeof child === "object" && child.ref : forwardedRef;
    const [setIntersectionRef, isVisible, resetVisible] = (0, _useintersection.useIntersection)({
        rootMargin: "200px"
    });
    const setRef = _react.default.useCallback((el)=>{
        // Before the link getting observed, check if visible state need to be reset
        if (previousAs.current !== as || previousHref.current !== href) {
            resetVisible();
            previousAs.current = as;
            previousHref.current = href;
        }
        setIntersectionRef(el);
        if (childRef) {
            if (typeof childRef === "function") childRef(el);
            else if (typeof childRef === "object") {
                childRef.current = el;
            }
        }
    }, [
        as,
        childRef,
        href,
        resetVisible,
        setIntersectionRef
    ]);
    // Prefetch the URL if we haven't already and it's visible.
    _react.default.useEffect(()=>{
        // in dev, we only prefetch on hover to avoid wasting resources as the prefetch will trigger compiling the page.
        if (true) {
            return;
        }
        if (!router) {
            return;
        }
        // If we don't need to prefetch the URL, don't do prefetch.
        if (!isVisible || !prefetchEnabled) {
            return;
        }
        // Prefetch the URL.
        prefetch(router, href, as, {
            locale
        }, {
            kind: appPrefetchKind
        }, isAppRouter);
    }, [
        as,
        href,
        isVisible,
        locale,
        prefetchEnabled,
        pagesRouter == null ? void 0 : pagesRouter.locale,
        router,
        isAppRouter,
        appPrefetchKind
    ]);
    const childProps = {
        ref: setRef,
        onClick (e) {
            if (true) {
                if (!e) {
                    throw new Error('Component rendered inside next/link has to pass click event to "onClick" prop.');
                }
            }
            if (!legacyBehavior && typeof onClick === "function") {
                onClick(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onClick === "function") {
                child.props.onClick(e);
            }
            if (!router) {
                return;
            }
            if (e.defaultPrevented) {
                return;
            }
            linkClicked(e, router, href, as, replace, shallow, scroll, locale, isAppRouter);
        },
        onMouseEnter (e) {
            if (!legacyBehavior && typeof onMouseEnterProp === "function") {
                onMouseEnterProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onMouseEnter === "function") {
                child.props.onMouseEnter(e);
            }
            if (!router) {
                return;
            }
            if ((!prefetchEnabled || "development" === "development") && isAppRouter) {
                return;
            }
            prefetch(router, href, as, {
                locale,
                priority: true,
                // @see {https://github.com/vercel/next.js/discussions/40268?sort=top#discussioncomment-3572642}
                bypassPrefetchedCheck: true
            }, {
                kind: appPrefetchKind
            }, isAppRouter);
        },
        onTouchStart:  false ? 0 : function onTouchStart(e) {
            if (!legacyBehavior && typeof onTouchStartProp === "function") {
                onTouchStartProp(e);
            }
            if (legacyBehavior && child.props && typeof child.props.onTouchStart === "function") {
                child.props.onTouchStart(e);
            }
            if (!router) {
                return;
            }
            if (!prefetchEnabled && isAppRouter) {
                return;
            }
            prefetch(router, href, as, {
                locale,
                priority: true,
                // @see {https://github.com/vercel/next.js/discussions/40268?sort=top#discussioncomment-3572642}
                bypassPrefetchedCheck: true
            }, {
                kind: appPrefetchKind
            }, isAppRouter);
        }
    };
    // If child is an <a> tag and doesn't have a href attribute, or if the 'passHref' property is
    // defined, we specify the current 'href', so that repetition is not needed by the user.
    // If the url is absolute, we can bypass the logic to prepend the domain and locale.
    if ((0, _utils.isAbsoluteUrl)(as)) {
        childProps.href = as;
    } else if (!legacyBehavior || passHref || child.type === "a" && !("href" in child.props)) {
        const curLocale = typeof locale !== "undefined" ? locale : pagesRouter == null ? void 0 : pagesRouter.locale;
        // we only render domain locales if we are currently on a domain locale
        // so that locale links are still visitable in development/preview envs
        const localeDomain = (pagesRouter == null ? void 0 : pagesRouter.isLocaleDomain) && (0, _getdomainlocale.getDomainLocale)(as, curLocale, pagesRouter == null ? void 0 : pagesRouter.locales, pagesRouter == null ? void 0 : pagesRouter.domainLocales);
        childProps.href = localeDomain || (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(as, curLocale, pagesRouter == null ? void 0 : pagesRouter.defaultLocale));
    }
    return legacyBehavior ? /*#__PURE__*/ _react.default.cloneElement(child, childProps) : /*#__PURE__*/ (0, _jsxruntime.jsx)("a", {
        ...restProps,
        ...childProps,
        children: children
    });
});
const _default = Link;
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=link.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js":
/*!********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js ***!
  \********************************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "normalizePathTrailingSlash", ({
    enumerable: true,
    get: function() {
        return normalizePathTrailingSlash;
    }
}));
const _removetrailingslash = __webpack_require__(/*! ../shared/lib/router/utils/remove-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js");
const _parsepath = __webpack_require__(/*! ../shared/lib/router/utils/parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
const normalizePathTrailingSlash = (path)=>{
    if (!path.startsWith("/") || undefined) {
        return path;
    }
    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
    if (false) {}
    return "" + (0, _removetrailingslash.removeTrailingSlash)(pathname) + query + hash;
};
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=normalize-trailing-slash.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-base-path.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-base-path.js ***!
  \************************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removeBasePath", ({
    enumerable: true,
    get: function() {
        return removeBasePath;
    }
}));
const _hasbasepath = __webpack_require__(/*! ./has-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/has-base-path.js");
const basePath =  false || "";
function removeBasePath(path) {
    if (false) {}
    // Can't trim the basePath if it has zero length!
    if (basePath.length === 0) return path;
    path = path.slice(basePath.length);
    if (!path.startsWith("/")) path = "/" + path;
    return path;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=remove-base-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-locale.js":
/*!*********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-locale.js ***!
  \*********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removeLocale", ({
    enumerable: true,
    get: function() {
        return removeLocale;
    }
}));
const _parsepath = __webpack_require__(/*! ../shared/lib/router/utils/parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
function removeLocale(path, locale) {
    if (false) {}
    return path;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=remove-locale.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/request-idle-callback.js":
/*!*****************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/request-idle-callback.js ***!
  \*****************************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    cancelIdleCallback: function() {
        return cancelIdleCallback;
    },
    requestIdleCallback: function() {
        return requestIdleCallback;
    }
});
const requestIdleCallback = typeof self !== "undefined" && self.requestIdleCallback && self.requestIdleCallback.bind(window) || function(cb) {
    let start = Date.now();
    return self.setTimeout(function() {
        cb({
            didTimeout: false,
            timeRemaining: function() {
                return Math.max(0, 50 - (Date.now() - start));
            }
        });
    }, 1);
};
const cancelIdleCallback = typeof self !== "undefined" && self.cancelIdleCallback && self.cancelIdleCallback.bind(window) || function(id) {
    return clearTimeout(id);
};
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=request-idle-callback.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/resolve-href.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/resolve-href.js ***!
  \********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "resolveHref", ({
    enumerable: true,
    get: function() {
        return resolveHref;
    }
}));
const _querystring = __webpack_require__(/*! ../shared/lib/router/utils/querystring */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js");
const _formaturl = __webpack_require__(/*! ../shared/lib/router/utils/format-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-url.js");
const _omit = __webpack_require__(/*! ../shared/lib/router/utils/omit */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/omit.js");
const _utils = __webpack_require__(/*! ../shared/lib/utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
const _normalizetrailingslash = __webpack_require__(/*! ./normalize-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/normalize-trailing-slash.js");
const _islocalurl = __webpack_require__(/*! ../shared/lib/router/utils/is-local-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-local-url.js");
const _utils1 = __webpack_require__(/*! ../shared/lib/router/utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/index.js");
const _interpolateas = __webpack_require__(/*! ../shared/lib/router/utils/interpolate-as */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/interpolate-as.js");
function resolveHref(router, href, resolveAs) {
    // we use a dummy base url for relative urls
    let base;
    let urlAsString = typeof href === "string" ? href : (0, _formaturl.formatWithValidation)(href);
    // repeated slashes and backslashes in the URL are considered
    // invalid and will never match a Next.js page/file
    const urlProtoMatch = urlAsString.match(/^[a-zA-Z]{1,}:\/\//);
    const urlAsStringNoProto = urlProtoMatch ? urlAsString.slice(urlProtoMatch[0].length) : urlAsString;
    const urlParts = urlAsStringNoProto.split("?", 1);
    if ((urlParts[0] || "").match(/(\/\/|\\)/)) {
        console.error("Invalid href '" + urlAsString + "' passed to next/router in page: '" + router.pathname + "'. Repeated forward-slashes (//) or backslashes \\ are not valid in the href.");
        const normalizedUrl = (0, _utils.normalizeRepeatedSlashes)(urlAsStringNoProto);
        urlAsString = (urlProtoMatch ? urlProtoMatch[0] : "") + normalizedUrl;
    }
    // Return because it cannot be routed by the Next.js router
    if (!(0, _islocalurl.isLocalURL)(urlAsString)) {
        return resolveAs ? [
            urlAsString
        ] : urlAsString;
    }
    try {
        base = new URL(urlAsString.startsWith("#") ? router.asPath : router.pathname, "http://n");
    } catch (_) {
        // fallback to / for invalid asPath values e.g. //
        base = new URL("/", "http://n");
    }
    try {
        const finalUrl = new URL(urlAsString, base);
        finalUrl.pathname = (0, _normalizetrailingslash.normalizePathTrailingSlash)(finalUrl.pathname);
        let interpolatedAs = "";
        if ((0, _utils1.isDynamicRoute)(finalUrl.pathname) && finalUrl.searchParams && resolveAs) {
            const query = (0, _querystring.searchParamsToUrlQuery)(finalUrl.searchParams);
            const { result, params } = (0, _interpolateas.interpolateAs)(finalUrl.pathname, finalUrl.pathname, query);
            if (result) {
                interpolatedAs = (0, _formaturl.formatWithValidation)({
                    pathname: result,
                    hash: finalUrl.hash,
                    query: (0, _omit.omit)(query, params)
                });
            }
        }
        // if the origin didn't change, it means we received a relative href
        const resolvedHref = finalUrl.origin === base.origin ? finalUrl.href.slice(finalUrl.origin.length) : finalUrl.href;
        return resolveAs ? [
            resolvedHref,
            interpolatedAs || resolvedHref
        ] : resolvedHref;
    } catch (_) {
        return resolveAs ? [
            urlAsString
        ] : urlAsString;
    }
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=resolve-href.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/route-loader.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/route-loader.js ***!
  \********************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createRouteLoader: function() {
        return createRouteLoader;
    },
    getClientBuildManifest: function() {
        return getClientBuildManifest;
    },
    isAssetError: function() {
        return isAssetError;
    },
    markAssetError: function() {
        return markAssetError;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _getassetpathfromroute = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ../shared/lib/router/utils/get-asset-path-from-route */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-asset-path-from-route.js"));
const _trustedtypes = __webpack_require__(/*! ./trusted-types */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/trusted-types.js");
const _requestidlecallback = __webpack_require__(/*! ./request-idle-callback */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/request-idle-callback.js");
const _deploymentid = __webpack_require__(/*! ../build/deployment-id */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/build/deployment-id.js");
// 3.8s was arbitrarily chosen as it's what https://web.dev/interactive
// considers as "Good" time-to-interactive. We must assume something went
// wrong beyond this point, and then fall-back to a full page transition to
// show the user something of value.
const MS_MAX_IDLE_DELAY = 3800;
function withFuture(key, map, generator) {
    let entry = map.get(key);
    if (entry) {
        if ("future" in entry) {
            return entry.future;
        }
        return Promise.resolve(entry);
    }
    let resolver;
    const prom = new Promise((resolve)=>{
        resolver = resolve;
    });
    map.set(key, entry = {
        resolve: resolver,
        future: prom
    });
    return generator ? generator() // eslint-disable-next-line no-sequences
    .then((value)=>(resolver(value), value)).catch((err)=>{
        map.delete(key);
        throw err;
    }) : prom;
}
const ASSET_LOAD_ERROR = Symbol("ASSET_LOAD_ERROR");
function markAssetError(err) {
    return Object.defineProperty(err, ASSET_LOAD_ERROR, {});
}
function isAssetError(err) {
    return err && ASSET_LOAD_ERROR in err;
}
function hasPrefetch(link) {
    try {
        link = document.createElement("link");
        return(// with relList.support
        !!window.MSInputMethodContext && !!document.documentMode || link.relList.supports("prefetch"));
    } catch (e) {
        return false;
    }
}
const canPrefetch = hasPrefetch();
const getAssetQueryString = ()=>{
    return (0, _deploymentid.getDeploymentIdQueryOrEmptyString)();
};
function prefetchViaDom(href, as, link) {
    return new Promise((resolve, reject)=>{
        const selector = '\n      link[rel="prefetch"][href^="' + href + '"],\n      link[rel="preload"][href^="' + href + '"],\n      script[src^="' + href + '"]';
        if (document.querySelector(selector)) {
            return resolve();
        }
        link = document.createElement("link");
        // The order of property assignment here is intentional:
        if (as) link.as = as;
        link.rel = "prefetch";
        link.crossOrigin = undefined;
        link.onload = resolve;
        link.onerror = ()=>reject(markAssetError(new Error("Failed to prefetch: " + href)));
        // `href` should always be last:
        link.href = href;
        document.head.appendChild(link);
    });
}
function appendScript(src, script) {
    return new Promise((resolve, reject)=>{
        script = document.createElement("script");
        // The order of property assignment here is intentional.
        // 1. Setup success/failure hooks in case the browser synchronously
        //    executes when `src` is set.
        script.onload = resolve;
        script.onerror = ()=>reject(markAssetError(new Error("Failed to load script: " + src)));
        // 2. Configure the cross-origin attribute before setting `src` in case the
        //    browser begins to fetch.
        script.crossOrigin = undefined;
        // 3. Finally, set the source and inject into the DOM in case the child
        //    must be appended for fetching to start.
        script.src = src;
        document.body.appendChild(script);
    });
}
// We wait for pages to be built in dev before we start the route transition
// timeout to prevent an un-necessary hard navigation in development.
let devBuildPromise;
// Resolve a promise that times out after given amount of milliseconds.
function resolvePromiseWithTimeout(p, ms, err) {
    return new Promise((resolve, reject)=>{
        let cancelled = false;
        p.then((r)=>{
            // Resolved, cancel the timeout
            cancelled = true;
            resolve(r);
        }).catch(reject);
        // We wrap these checks separately for better dead-code elimination in
        // production bundles.
        if (true) {
            (devBuildPromise || Promise.resolve()).then(()=>{
                (0, _requestidlecallback.requestIdleCallback)(()=>setTimeout(()=>{
                        if (!cancelled) {
                            reject(err);
                        }
                    }, ms));
            });
        }
        if (false) {}
    });
}
function getClientBuildManifest() {
    if (self.__BUILD_MANIFEST) {
        return Promise.resolve(self.__BUILD_MANIFEST);
    }
    const onBuildManifest = new Promise((resolve)=>{
        // Mandatory because this is not concurrent safe:
        const cb = self.__BUILD_MANIFEST_CB;
        self.__BUILD_MANIFEST_CB = ()=>{
            resolve(self.__BUILD_MANIFEST);
            cb && cb();
        };
    });
    return resolvePromiseWithTimeout(onBuildManifest, MS_MAX_IDLE_DELAY, markAssetError(new Error("Failed to load client build manifest")));
}
function getFilesForRoute(assetPrefix, route) {
    if (true) {
        const scriptUrl = assetPrefix + "/_next/static/chunks/pages" + encodeURI((0, _getassetpathfromroute.default)(route, ".js")) + getAssetQueryString();
        return Promise.resolve({
            scripts: [
                (0, _trustedtypes.__unsafeCreateTrustedScriptURL)(scriptUrl)
            ],
            // Styles are handled by `style-loader` in development:
            css: []
        });
    }
    return getClientBuildManifest().then((manifest)=>{
        if (!(route in manifest)) {
            throw markAssetError(new Error("Failed to lookup route: " + route));
        }
        const allFiles = manifest[route].map((entry)=>assetPrefix + "/_next/" + encodeURI(entry));
        return {
            scripts: allFiles.filter((v)=>v.endsWith(".js")).map((v)=>(0, _trustedtypes.__unsafeCreateTrustedScriptURL)(v) + getAssetQueryString()),
            css: allFiles.filter((v)=>v.endsWith(".css")).map((v)=>v + getAssetQueryString())
        };
    });
}
function createRouteLoader(assetPrefix) {
    const entrypoints = new Map();
    const loadedScripts = new Map();
    const styleSheets = new Map();
    const routes = new Map();
    function maybeExecuteScript(src) {
        // With HMR we might need to "reload" scripts when they are
        // disposed and readded. Executing scripts twice has no functional
        // differences
        if (false) {} else {
            return appendScript(src);
        }
    }
    function fetchStyleSheet(href) {
        let prom = styleSheets.get(href);
        if (prom) {
            return prom;
        }
        styleSheets.set(href, prom = fetch(href, {
            credentials: "same-origin"
        }).then((res)=>{
            if (!res.ok) {
                throw new Error("Failed to load stylesheet: " + href);
            }
            return res.text().then((text)=>({
                    href: href,
                    content: text
                }));
        }).catch((err)=>{
            throw markAssetError(err);
        }));
        return prom;
    }
    return {
        whenEntrypoint (route) {
            return withFuture(route, entrypoints);
        },
        onEntrypoint (route, execute) {
            (execute ? Promise.resolve().then(()=>execute()).then((exports1)=>({
                    component: exports1 && exports1.default || exports1,
                    exports: exports1
                }), (err)=>({
                    error: err
                })) : Promise.resolve(undefined)).then((input)=>{
                const old = entrypoints.get(route);
                if (old && "resolve" in old) {
                    if (input) {
                        entrypoints.set(route, input);
                        old.resolve(input);
                    }
                } else {
                    if (input) {
                        entrypoints.set(route, input);
                    } else {
                        entrypoints.delete(route);
                    }
                    // when this entrypoint has been resolved before
                    // the route is outdated and we want to invalidate
                    // this cache entry
                    routes.delete(route);
                }
            });
        },
        loadRoute (route, prefetch) {
            return withFuture(route, routes, ()=>{
                let devBuildPromiseResolve;
                if (true) {
                    devBuildPromise = new Promise((resolve)=>{
                        devBuildPromiseResolve = resolve;
                    });
                }
                return resolvePromiseWithTimeout(getFilesForRoute(assetPrefix, route).then((param)=>{
                    let { scripts, css } = param;
                    return Promise.all([
                        entrypoints.has(route) ? [] : Promise.all(scripts.map(maybeExecuteScript)),
                        Promise.all(css.map(fetchStyleSheet))
                    ]);
                }).then((res)=>{
                    return this.whenEntrypoint(route).then((entrypoint)=>({
                            entrypoint,
                            styles: res[1]
                        }));
                }), MS_MAX_IDLE_DELAY, markAssetError(new Error("Route did not complete loading: " + route))).then((param)=>{
                    let { entrypoint, styles } = param;
                    const res = Object.assign({
                        styles: styles
                    }, entrypoint);
                    return "error" in entrypoint ? entrypoint : res;
                }).catch((err)=>{
                    if (prefetch) {
                        // we don't want to cache errors during prefetch
                        throw err;
                    }
                    return {
                        error: err
                    };
                }).finally(()=>devBuildPromiseResolve == null ? void 0 : devBuildPromiseResolve());
            });
        },
        prefetch (route) {
            // https://github.com/GoogleChromeLabs/quicklink/blob/453a661fa1fa940e2d2e044452398e38c67a98fb/src/index.mjs#L115-L118
            // License: Apache 2.0
            let cn;
            if (cn = navigator.connection) {
                // Don't prefetch if using 2G or if Save-Data is enabled.
                if (cn.saveData || /2g/.test(cn.effectiveType)) return Promise.resolve();
            }
            return getFilesForRoute(assetPrefix, route).then((output)=>Promise.all(canPrefetch ? output.scripts.map((script)=>prefetchViaDom(script.toString(), "script")) : [])).then(()=>{
                (0, _requestidlecallback.requestIdleCallback)(()=>this.loadRoute(route, true).catch(()=>{}));
            }).catch(()=>{});
        }
    };
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=route-loader.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/router.js":
/*!**************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/router.js ***!
  \**************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* global window */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    Router: function() {
        return _router.default;
    },
    createRouter: function() {
        return createRouter;
    },
    // Export the singletonRouter and this is the public API.
    default: function() {
        return _default;
    },
    makePublicRouterInstance: function() {
        return makePublicRouterInstance;
    },
    useRouter: function() {
        return useRouter;
    },
    withRouter: function() {
        return _withrouter.default;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _react = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react */ "react"));
const _router = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ../shared/lib/router/router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/router.js"));
const _routercontextsharedruntime = __webpack_require__(/*! ../shared/lib/router-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/router-context.js");
const _iserror = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ../lib/is-error */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-error.js"));
const _withrouter = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ./with-router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/with-router.js"));
const singletonRouter = {
    router: null,
    readyCallbacks: [],
    ready (callback) {
        if (this.router) return callback();
        if (false) {}
    }
};
// Create public properties and methods of the router in the singletonRouter
const urlPropertyFields = [
    "pathname",
    "route",
    "query",
    "asPath",
    "components",
    "isFallback",
    "basePath",
    "locale",
    "locales",
    "defaultLocale",
    "isReady",
    "isPreview",
    "isLocaleDomain",
    "domainLocales"
];
const routerEvents = [
    "routeChangeStart",
    "beforeHistoryChange",
    "routeChangeComplete",
    "routeChangeError",
    "hashChangeStart",
    "hashChangeComplete"
];
const coreMethodFields = [
    "push",
    "replace",
    "reload",
    "back",
    "prefetch",
    "beforePopState"
];
// Events is a static property on the router, the router doesn't have to be initialized to use it
Object.defineProperty(singletonRouter, "events", {
    get () {
        return _router.default.events;
    }
});
function getRouter() {
    if (!singletonRouter.router) {
        const message = "No router instance found.\n" + 'You should only use "next/router" on the client side of your app.\n';
        throw new Error(message);
    }
    return singletonRouter.router;
}
urlPropertyFields.forEach((field)=>{
    // Here we need to use Object.defineProperty because we need to return
    // the property assigned to the actual router
    // The value might get changed as we change routes and this is the
    // proper way to access it
    Object.defineProperty(singletonRouter, field, {
        get () {
            const router = getRouter();
            return router[field];
        }
    });
});
coreMethodFields.forEach((field)=>{
    singletonRouter[field] = function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        const router = getRouter();
        return router[field](...args);
    };
});
routerEvents.forEach((event)=>{
    singletonRouter.ready(()=>{
        _router.default.events.on(event, function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            const eventField = "on" + event.charAt(0).toUpperCase() + event.substring(1);
            const _singletonRouter = singletonRouter;
            if (_singletonRouter[eventField]) {
                try {
                    _singletonRouter[eventField](...args);
                } catch (err) {
                    console.error("Error when running the Router event: " + eventField);
                    console.error((0, _iserror.default)(err) ? err.message + "\n" + err.stack : err + "");
                }
            }
        });
    });
});
const _default = singletonRouter;
function useRouter() {
    const router = _react.default.useContext(_routercontextsharedruntime.RouterContext);
    if (!router) {
        throw new Error("NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted");
    }
    return router;
}
function createRouter() {
    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
        args[_key] = arguments[_key];
    }
    singletonRouter.router = new _router.default(...args);
    singletonRouter.readyCallbacks.forEach((cb)=>cb());
    singletonRouter.readyCallbacks = [];
    return singletonRouter.router;
}
function makePublicRouterInstance(router) {
    const scopedRouter = router;
    const instance = {};
    for (const property of urlPropertyFields){
        if (typeof scopedRouter[property] === "object") {
            instance[property] = Object.assign(Array.isArray(scopedRouter[property]) ? [] : {}, scopedRouter[property]) // makes sure query is not stateful
            ;
            continue;
        }
        instance[property] = scopedRouter[property];
    }
    // Events is a static property on the router, the router doesn't have to be initialized to use it
    instance.events = _router.default.events;
    coreMethodFields.forEach((field)=>{
        instance[field] = function() {
            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                args[_key] = arguments[_key];
            }
            return scopedRouter[field](...args);
        };
    });
    return instance;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=router.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/script.js":
/*!**************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/script.js ***!
  \**************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* __next_internal_client_entry_do_not_use__  cjs */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    handleClientScriptLoad: function() {
        return handleClientScriptLoad;
    },
    initScriptLoader: function() {
        return initScriptLoader;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _interop_require_wildcard = __webpack_require__(/*! @swc/helpers/_/_interop_require_wildcard */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _reactdom = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react-dom */ "react-dom"));
const _react = /*#__PURE__*/ _interop_require_wildcard._(__webpack_require__(/*! react */ "react"));
const _headmanagercontextsharedruntime = __webpack_require__(/*! ../shared/lib/head-manager-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/head-manager-context.js");
const _headmanager = __webpack_require__(/*! ./head-manager */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/head-manager.js");
const _requestidlecallback = __webpack_require__(/*! ./request-idle-callback */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/request-idle-callback.js");
const ScriptCache = new Map();
const LoadCache = new Set();
const ignoreProps = [
    "onLoad",
    "onReady",
    "dangerouslySetInnerHTML",
    "children",
    "onError",
    "strategy",
    "stylesheets"
];
const insertStylesheets = (stylesheets)=>{
    // Case 1: Styles for afterInteractive/lazyOnload with appDir injected via handleClientScriptLoad
    //
    // Using ReactDOM.preinit to feature detect appDir and inject styles
    // Stylesheets might have already been loaded if initialized with Script component
    // Re-inject styles here to handle scripts loaded via handleClientScriptLoad
    // ReactDOM.preinit handles dedup and ensures the styles are loaded only once
    if (_reactdom.default.preinit) {
        stylesheets.forEach((stylesheet)=>{
            _reactdom.default.preinit(stylesheet, {
                as: "style"
            });
        });
        return;
    }
    // Case 2: Styles for afterInteractive/lazyOnload with pages injected via handleClientScriptLoad
    //
    // We use this function to load styles when appdir is not detected
    // TODO: Use React float APIs to load styles once available for pages dir
    if (false) {}
};
const loadScript = (props)=>{
    const { src, id, onLoad = ()=>{}, onReady = null, dangerouslySetInnerHTML, children = "", strategy = "afterInteractive", onError, stylesheets } = props;
    const cacheKey = id || src;
    // Script has already loaded
    if (cacheKey && LoadCache.has(cacheKey)) {
        return;
    }
    // Contents of this script are already loading/loaded
    if (ScriptCache.has(src)) {
        LoadCache.add(cacheKey);
        // It is possible that multiple `next/script` components all have same "src", but has different "onLoad"
        // This is to make sure the same remote script will only load once, but "onLoad" are executed in order
        ScriptCache.get(src).then(onLoad, onError);
        return;
    }
    /** Execute after the script first loaded */ const afterLoad = ()=>{
        // Run onReady for the first time after load event
        if (onReady) {
            onReady();
        }
        // add cacheKey to LoadCache when load successfully
        LoadCache.add(cacheKey);
    };
    const el = document.createElement("script");
    const loadPromise = new Promise((resolve, reject)=>{
        el.addEventListener("load", function(e) {
            resolve();
            if (onLoad) {
                onLoad.call(this, e);
            }
            afterLoad();
        });
        el.addEventListener("error", function(e) {
            reject(e);
        });
    }).catch(function(e) {
        if (onError) {
            onError(e);
        }
    });
    if (dangerouslySetInnerHTML) {
        // Casting since lib.dom.d.ts doesn't have TrustedHTML yet.
        el.innerHTML = dangerouslySetInnerHTML.__html || "";
        afterLoad();
    } else if (children) {
        el.textContent = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : "";
        afterLoad();
    } else if (src) {
        el.src = src;
        // do not add cacheKey into LoadCache for remote script here
        // cacheKey will be added to LoadCache when it is actually loaded (see loadPromise above)
        ScriptCache.set(src, loadPromise);
    }
    for (const [k, value] of Object.entries(props)){
        if (value === undefined || ignoreProps.includes(k)) {
            continue;
        }
        const attr = _headmanager.DOMAttributeNames[k] || k.toLowerCase();
        el.setAttribute(attr, value);
    }
    if (strategy === "worker") {
        el.setAttribute("type", "text/partytown");
    }
    el.setAttribute("data-nscript", strategy);
    // Load styles associated with this script
    if (stylesheets) {
        insertStylesheets(stylesheets);
    }
    document.body.appendChild(el);
};
function handleClientScriptLoad(props) {
    const { strategy = "afterInteractive" } = props;
    if (strategy === "lazyOnload") {
        window.addEventListener("load", ()=>{
            (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
        });
    } else {
        loadScript(props);
    }
}
function loadLazyScript(props) {
    if (document.readyState === "complete") {
        (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
    } else {
        window.addEventListener("load", ()=>{
            (0, _requestidlecallback.requestIdleCallback)(()=>loadScript(props));
        });
    }
}
function addBeforeInteractiveToCache() {
    const scripts = [
        ...document.querySelectorAll('[data-nscript="beforeInteractive"]'),
        ...document.querySelectorAll('[data-nscript="beforePageRender"]')
    ];
    scripts.forEach((script)=>{
        const cacheKey = script.id || script.getAttribute("src");
        LoadCache.add(cacheKey);
    });
}
function initScriptLoader(scriptLoaderItems) {
    scriptLoaderItems.forEach(handleClientScriptLoad);
    addBeforeInteractiveToCache();
}
/**
 * Load a third-party scripts in an optimized way.
 *
 * Read more: [Next.js Docs: `next/script`](https://nextjs.org/docs/app/api-reference/components/script)
 */ function Script(props) {
    const { id, src = "", onLoad = ()=>{}, onReady = null, strategy = "afterInteractive", onError, stylesheets, ...restProps } = props;
    // Context is available only during SSR
    const { updateScripts, scripts, getIsSsr, appDir, nonce } = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
    /**
   * - First mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script hasn't loaded yet (not in LoadCache)
   *      onReady is skipped, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. hasLoadScriptEffectCalled.current is false, loadScript executes
   *      Once the script is loaded, the onLoad and onReady will be called by then
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   *
   * - Second mount:
   *   1. The useEffect for onReady executes
   *   2. hasOnReadyEffectCalled.current is false, but the script has already loaded (found in LoadCache)
   *      onReady is called, set hasOnReadyEffectCalled.current to true
   *   3. The useEffect for loadScript executes
   *   4. The script is already loaded, loadScript bails out
   *   [If strict mode is enabled / is wrapped in <OffScreen /> component]
   *   5. The useEffect for onReady executes again
   *   6. hasOnReadyEffectCalled.current is true, so entire effect is skipped
   *   7. The useEffect for loadScript executes again
   *   8. hasLoadScriptEffectCalled.current is true, so entire effect is skipped
   */ const hasOnReadyEffectCalled = (0, _react.useRef)(false);
    (0, _react.useEffect)(()=>{
        const cacheKey = id || src;
        if (!hasOnReadyEffectCalled.current) {
            // Run onReady if script has loaded before but component is re-mounted
            if (onReady && cacheKey && LoadCache.has(cacheKey)) {
                onReady();
            }
            hasOnReadyEffectCalled.current = true;
        }
    }, [
        onReady,
        id,
        src
    ]);
    const hasLoadScriptEffectCalled = (0, _react.useRef)(false);
    (0, _react.useEffect)(()=>{
        if (!hasLoadScriptEffectCalled.current) {
            if (strategy === "afterInteractive") {
                loadScript(props);
            } else if (strategy === "lazyOnload") {
                loadLazyScript(props);
            }
            hasLoadScriptEffectCalled.current = true;
        }
    }, [
        props,
        strategy
    ]);
    if (strategy === "beforeInteractive" || strategy === "worker") {
        if (updateScripts) {
            scripts[strategy] = (scripts[strategy] || []).concat([
                {
                    id,
                    src,
                    onLoad,
                    onReady,
                    onError,
                    ...restProps
                }
            ]);
            updateScripts(scripts);
        } else if (getIsSsr && getIsSsr()) {
            // Script has already loaded during SSR
            LoadCache.add(id || src);
        } else if (getIsSsr && !getIsSsr()) {
            loadScript(props);
        }
    }
    // For the app directory, we need React Float to preload these scripts.
    if (appDir) {
        // Injecting stylesheets here handles beforeInteractive and worker scripts correctly
        // For other strategies injecting here ensures correct stylesheet order
        // ReactDOM.preinit handles loading the styles in the correct order,
        // also ensures the stylesheet is loaded only once and in a consistent manner
        //
        // Case 1: Styles for beforeInteractive/worker with appDir - handled here
        // Case 2: Styles for beforeInteractive/worker with pages dir - Not handled yet
        // Case 3: Styles for afterInteractive/lazyOnload with appDir - handled here
        // Case 4: Styles for afterInteractive/lazyOnload with pages dir - handled in insertStylesheets function
        if (stylesheets) {
            stylesheets.forEach((styleSrc)=>{
                _reactdom.default.preinit(styleSrc, {
                    as: "style"
                });
            });
        }
        // Before interactive scripts need to be loaded by Next.js' runtime instead
        // of native <script> tags, because they no longer have `defer`.
        if (strategy === "beforeInteractive") {
            if (!src) {
                // For inlined scripts, we put the content in `children`.
                if (restProps.dangerouslySetInnerHTML) {
                    // Casting since lib.dom.d.ts doesn't have TrustedHTML yet.
                    restProps.children = restProps.dangerouslySetInnerHTML.__html;
                    delete restProps.dangerouslySetInnerHTML;
                }
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("script", {
                    nonce: nonce,
                    dangerouslySetInnerHTML: {
                        __html: "(self.__next_s=self.__next_s||[]).push(" + JSON.stringify([
                            0,
                            {
                                ...restProps,
                                id
                            }
                        ]) + ")"
                    }
                });
            } else {
                // @ts-ignore
                _reactdom.default.preload(src, restProps.integrity ? {
                    as: "script",
                    integrity: restProps.integrity,
                    nonce,
                    crossOrigin: restProps.crossOrigin
                } : {
                    as: "script",
                    nonce,
                    crossOrigin: restProps.crossOrigin
                });
                return /*#__PURE__*/ (0, _jsxruntime.jsx)("script", {
                    nonce: nonce,
                    dangerouslySetInnerHTML: {
                        __html: "(self.__next_s=self.__next_s||[]).push(" + JSON.stringify([
                            src,
                            {
                                ...restProps,
                                id
                            }
                        ]) + ")"
                    }
                });
            }
        } else if (strategy === "afterInteractive") {
            if (src) {
                // @ts-ignore
                _reactdom.default.preload(src, restProps.integrity ? {
                    as: "script",
                    integrity: restProps.integrity,
                    nonce,
                    crossOrigin: restProps.crossOrigin
                } : {
                    as: "script",
                    nonce,
                    crossOrigin: restProps.crossOrigin
                });
            }
        }
    }
    return null;
}
Object.defineProperty(Script, "__nextScript", {
    value: true
});
const _default = Script;
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=script.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/trusted-types.js":
/*!*********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/trusted-types.js ***!
  \*********************************************************************************************************************************************/
/***/ ((module, exports) => {

"use strict";
/**
 * Stores the Trusted Types Policy. Starts as undefined and can be set to null
 * if Trusted Types is not supported in the browser.
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "__unsafeCreateTrustedScriptURL", ({
    enumerable: true,
    get: function() {
        return __unsafeCreateTrustedScriptURL;
    }
}));
let policy;
/**
 * Getter for the Trusted Types Policy. If it is undefined, it is instantiated
 * here or set to null if Trusted Types is not supported in the browser.
 */ function getPolicy() {
    if (typeof policy === "undefined" && "undefined" !== "undefined") { var _window_trustedTypes; }
    return policy;
}
function __unsafeCreateTrustedScriptURL(url) {
    var _getPolicy;
    return ((_getPolicy = getPolicy()) == null ? void 0 : _getPolicy.createScriptURL(url)) || url;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=trusted-types.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/use-intersection.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/use-intersection.js ***!
  \************************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "useIntersection", ({
    enumerable: true,
    get: function() {
        return useIntersection;
    }
}));
const _react = __webpack_require__(/*! react */ "react");
const _requestidlecallback = __webpack_require__(/*! ./request-idle-callback */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/request-idle-callback.js");
const hasIntersectionObserver = typeof IntersectionObserver === "function";
const observers = new Map();
const idList = [];
function createObserver(options) {
    const id = {
        root: options.root || null,
        margin: options.rootMargin || ""
    };
    const existing = idList.find((obj)=>obj.root === id.root && obj.margin === id.margin);
    let instance;
    if (existing) {
        instance = observers.get(existing);
        if (instance) {
            return instance;
        }
    }
    const elements = new Map();
    const observer = new IntersectionObserver((entries)=>{
        entries.forEach((entry)=>{
            const callback = elements.get(entry.target);
            const isVisible = entry.isIntersecting || entry.intersectionRatio > 0;
            if (callback && isVisible) {
                callback(isVisible);
            }
        });
    }, options);
    instance = {
        id,
        observer,
        elements
    };
    idList.push(id);
    observers.set(id, instance);
    return instance;
}
function observe(element, callback, options) {
    const { id, observer, elements } = createObserver(options);
    elements.set(element, callback);
    observer.observe(element);
    return function unobserve() {
        elements.delete(element);
        observer.unobserve(element);
        // Destroy observer when there's nothing left to watch:
        if (elements.size === 0) {
            observer.disconnect();
            observers.delete(id);
            const index = idList.findIndex((obj)=>obj.root === id.root && obj.margin === id.margin);
            if (index > -1) {
                idList.splice(index, 1);
            }
        }
    };
}
function useIntersection(param) {
    let { rootRef, rootMargin, disabled } = param;
    const isDisabled = disabled || !hasIntersectionObserver;
    const [visible, setVisible] = (0, _react.useState)(false);
    const elementRef = (0, _react.useRef)(null);
    const setElement = (0, _react.useCallback)((element)=>{
        elementRef.current = element;
    }, []);
    (0, _react.useEffect)(()=>{
        if (hasIntersectionObserver) {
            if (isDisabled || visible) return;
            const element = elementRef.current;
            if (element && element.tagName) {
                const unobserve = observe(element, (isVisible)=>isVisible && setVisible(isVisible), {
                    root: rootRef == null ? void 0 : rootRef.current,
                    rootMargin
                });
                return unobserve;
            }
        } else {
            if (!visible) {
                const idleCallback = (0, _requestidlecallback.requestIdleCallback)(()=>setVisible(true));
                return ()=>(0, _requestidlecallback.cancelIdleCallback)(idleCallback);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        isDisabled,
        rootMargin,
        rootRef,
        visible,
        elementRef.current
    ]);
    const resetVisible = (0, _react.useCallback)(()=>{
        setVisible(false);
    }, []);
    return [
        setElement,
        visible,
        resetVisible
    ];
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=use-intersection.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/with-router.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/with-router.js ***!
  \*******************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return withRouter;
    }
}));
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react */ "react"));
const _router = __webpack_require__(/*! ./router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/router.js");
function withRouter(ComposedComponent) {
    function WithRouterWrapper(props) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)(ComposedComponent, {
            router: (0, _router.useRouter)(),
            ...props
        });
    }
    WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps;
    WithRouterWrapper.origGetInitialProps = ComposedComponent.origGetInitialProps;
    if (true) {
        const name = ComposedComponent.displayName || ComposedComponent.name || "Unknown";
        WithRouterWrapper.displayName = "withRouter(" + name + ")";
    }
    return WithRouterWrapper;
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=with-router.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/client-only/index.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/client-only/index.js ***!
  \***************************************************************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/cookie/index.js":
/*!**********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/cookie/index.js ***!
  \**********************************************************************************************************************************************/
/***/ ((module) => {

(()=>{"use strict";if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var e={};(()=>{var r=e;
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */r.parse=parse;r.serialize=serialize;var i=decodeURIComponent;var t=encodeURIComponent;var a=/; */;var n=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function parse(e,r){if(typeof e!=="string"){throw new TypeError("argument str must be a string")}var t={};var n=r||{};var o=e.split(a);var s=n.decode||i;for(var p=0;p<o.length;p++){var f=o[p];var u=f.indexOf("=");if(u<0){continue}var v=f.substr(0,u).trim();var c=f.substr(++u,f.length).trim();if('"'==c[0]){c=c.slice(1,-1)}if(undefined==t[v]){t[v]=tryDecode(c,s)}}return t}function serialize(e,r,i){var a=i||{};var o=a.encode||t;if(typeof o!=="function"){throw new TypeError("option encode is invalid")}if(!n.test(e)){throw new TypeError("argument name is invalid")}var s=o(r);if(s&&!n.test(s)){throw new TypeError("argument val is invalid")}var p=e+"="+s;if(null!=a.maxAge){var f=a.maxAge-0;if(isNaN(f)||!isFinite(f)){throw new TypeError("option maxAge is invalid")}p+="; Max-Age="+Math.floor(f)}if(a.domain){if(!n.test(a.domain)){throw new TypeError("option domain is invalid")}p+="; Domain="+a.domain}if(a.path){if(!n.test(a.path)){throw new TypeError("option path is invalid")}p+="; Path="+a.path}if(a.expires){if(typeof a.expires.toUTCString!=="function"){throw new TypeError("option expires is invalid")}p+="; Expires="+a.expires.toUTCString()}if(a.httpOnly){p+="; HttpOnly"}if(a.secure){p+="; Secure"}if(a.sameSite){var u=typeof a.sameSite==="string"?a.sameSite.toLowerCase():a.sameSite;switch(u){case true:p+="; SameSite=Strict";break;case"lax":p+="; SameSite=Lax";break;case"strict":p+="; SameSite=Strict";break;case"none":p+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}}return p}function tryDecode(e,r){try{return r(e)}catch(r){return e}}})();module.exports=e})();

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/gzip-size/index.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/gzip-size/index.js ***!
  \*************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(()=>{var e={154:(e,r,t)=>{var n=t(781);var o=["write","end","destroy"];var i=["resume","pause"];var s=["data","close"];var c=Array.prototype.slice;e.exports=duplex;function forEach(e,r){if(e.forEach){return e.forEach(r)}for(var t=0;t<e.length;t++){r(e[t],t)}}function duplex(e,r){var t=new n;var a=false;forEach(o,proxyWriter);forEach(i,proxyReader);forEach(s,proxyStream);r.on("end",handleEnd);e.on("drain",(function(){t.emit("drain")}));e.on("error",reemit);r.on("error",reemit);t.writable=e.writable;t.readable=r.readable;return t;function proxyWriter(r){t[r]=method;function method(){return e[r].apply(e,arguments)}}function proxyReader(e){t[e]=method;function method(){t.emit(e);var n=r[e];if(n){return n.apply(r,arguments)}r.emit(e)}}function proxyStream(e){r.on(e,reemit);function reemit(){var r=c.call(arguments);r.unshift(e);t.emit.apply(t,r)}}function handleEnd(){if(a){return}a=true;var e=c.call(arguments);e.unshift("end");t.emit.apply(t,e)}function reemit(e){t.emit("error",e)}}},349:(e,r,t)=>{"use strict";const n=t(147);const o=t(781);const i=t(796);const s=t(154);const c=t(530);const getOptions=e=>Object.assign({level:9},e);e.exports=(e,r)=>{if(!e){return Promise.resolve(0)}return c(i.gzip)(e,getOptions(r)).then((e=>e.length)).catch((e=>0))};e.exports.sync=(e,r)=>i.gzipSync(e,getOptions(r)).length;e.exports.stream=e=>{const r=new o.PassThrough;const t=new o.PassThrough;const n=s(r,t);let c=0;const a=i.createGzip(getOptions(e)).on("data",(e=>{c+=e.length})).on("error",(()=>{n.gzipSize=0})).on("end",(()=>{n.gzipSize=c;n.emit("gzip-size",c);t.end()}));r.pipe(a);r.pipe(t,{end:false});return n};e.exports.file=(r,t)=>new Promise(((o,i)=>{const s=n.createReadStream(r);s.on("error",i);const c=s.pipe(e.exports.stream(t));c.on("error",i);c.on("gzip-size",o)}));e.exports.fileSync=(r,t)=>e.exports.sync(n.readFileSync(r),t)},530:e=>{"use strict";const processFn=(e,r)=>function(...t){const n=r.promiseModule;return new n(((n,o)=>{if(r.multiArgs){t.push(((...e)=>{if(r.errorFirst){if(e[0]){o(e)}else{e.shift();n(e)}}else{n(e)}}))}else if(r.errorFirst){t.push(((e,r)=>{if(e){o(e)}else{n(r)}}))}else{t.push(n)}e.apply(this,t)}))};e.exports=(e,r)=>{r=Object.assign({exclude:[/.+(Sync|Stream)$/],errorFirst:true,promiseModule:Promise},r);const t=typeof e;if(!(e!==null&&(t==="object"||t==="function"))){throw new TypeError(`Expected \`input\` to be a \`Function\` or \`Object\`, got \`${e===null?"null":t}\``)}const filter=e=>{const match=r=>typeof r==="string"?e===r:r.test(e);return r.include?r.include.some(match):!r.exclude.some(match)};let n;if(t==="function"){n=function(...t){return r.excludeMain?e(...t):processFn(e,r).apply(this,t)}}else{n=Object.create(Object.getPrototypeOf(e))}for(const t in e){const o=e[t];n[t]=typeof o==="function"&&filter(t)?processFn(o,r):o}return n}},147:e=>{"use strict";e.exports=__webpack_require__(/*! fs */ "fs")},781:e=>{"use strict";e.exports=__webpack_require__(/*! stream */ "stream")},796:e=>{"use strict";e.exports=__webpack_require__(/*! zlib */ "zlib")}};var r={};function __nccwpck_require__(t){var n=r[t];if(n!==undefined){return n.exports}var o=r[t]={exports:{}};var i=true;try{e[t](o,o.exports,__nccwpck_require__);i=false}finally{if(i)delete r[t]}return o.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var t=__nccwpck_require__(349);module.exports=t})();

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/path-to-regexp/index.js":
/*!******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/path-to-regexp/index.js ***!
  \******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                throw new TypeError("Missing parameter name at " + i);
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at " + j);
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at " + j);
                    }
                }
                pattern += str[j++];
            }
            if (count)
                throw new TypeError("Unbalanced pattern at " + i);
            if (!pattern)
                throw new TypeError("Missing pattern at " + i);
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            return tokens[i++].value;
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            return value;
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    };
    var consumeText = function () {
        var result = "";
        var value;
        // tslint:disable-next-line
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
exports.parse = parse;
/**
 * Compile a string to a template function for the path.
 */
function compile(str, options) {
    return tokensToFunction(parse(str, options), options);
}
exports.compile = compile;
/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens, options) {
    if (options === void 0) { options = {}; }
    var reFlags = flags(options);
    var _a = options.encode, encode = _a === void 0 ? function (x) { return x; } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
    // Compile all the tokens into regexps.
    var matches = tokens.map(function (token) {
        if (typeof token === "object") {
            return new RegExp("^(?:" + token.pattern + ")$", reFlags);
        }
    });
    return function (data) {
        var path = "";
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (typeof token === "string") {
                path += token;
                continue;
            }
            var value = data ? data[token.name] : undefined;
            var optional = token.modifier === "?" || token.modifier === "*";
            var repeat = token.modifier === "*" || token.modifier === "+";
            if (Array.isArray(value)) {
                if (!repeat) {
                    throw new TypeError("Expected \"" + token.name + "\" to not repeat, but got an array");
                }
                if (value.length === 0) {
                    if (optional)
                        continue;
                    throw new TypeError("Expected \"" + token.name + "\" to not be empty");
                }
                for (var j = 0; j < value.length; j++) {
                    var segment = encode(value[j], token);
                    if (validate && !matches[i].test(segment)) {
                        throw new TypeError("Expected all \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                    }
                    path += token.prefix + segment + token.suffix;
                }
                continue;
            }
            if (typeof value === "string" || typeof value === "number") {
                var segment = encode(String(value), token);
                if (validate && !matches[i].test(segment)) {
                    throw new TypeError("Expected \"" + token.name + "\" to match \"" + token.pattern + "\", but got \"" + segment + "\"");
                }
                path += token.prefix + segment + token.suffix;
                continue;
            }
            if (optional)
                continue;
            var typeOfMessage = repeat ? "an array" : "a string";
            throw new TypeError("Expected \"" + token.name + "\" to be " + typeOfMessage);
        }
        return path;
    };
}
exports.tokensToFunction = tokensToFunction;
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
    var keys = [];
    var re = pathToRegexp(str, keys, options);
    return regexpToFunction(re, keys, options);
}
exports.match = match;
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.decode, decode = _a === void 0 ? function (x) { return x; } : _a;
    return function (pathname) {
        var m = re.exec(pathname);
        if (!m)
            return false;
        var path = m[0], index = m.index;
        var params = Object.create(null);
        var _loop_1 = function (i) {
            // tslint:disable-next-line
            if (m[i] === undefined)
                return "continue";
            var key = keys[i - 1];
            if (key.modifier === "*" || key.modifier === "+") {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
                    return decode(value, key);
                });
            }
            else {
                params[key.name] = decode(m[i], key);
            }
        };
        for (var i = 1; i < m.length; i++) {
            _loop_1(i);
        }
        return { path: path, index: index, params: params };
    };
}
exports.regexpToFunction = regexpToFunction;
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        return path;
    // Use a negative lookahead to match only capturing groups.
    var groups = path.source.match(/\((?!\?)/g);
    if (groups) {
        for (var i = 0; i < groups.length; i++) {
            keys.push({
                name: i,
                prefix: "",
                suffix: "",
                modifier: "",
                pattern: ""
            });
        }
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
    var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
    var route = start ? "^" : "";
    // Iterate over the tokens and create our regexp string.
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === "string") {
            route += escapeString(encode(token));
        }
        else {
            var prefix = escapeString(encode(token.prefix));
            var suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    keys.push(token);
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        var mod = token.modifier === "*" ? "?" : "";
                        route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                    }
                    else {
                        route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                    }
                }
                else {
                    route += "(" + token.pattern + ")" + token.modifier;
                }
            }
            else {
                route += "(?:" + prefix + suffix + ")" + token.modifier;
            }
        }
    }
    if (end) {
        if (!strict)
            route += delimiter + "?";
        route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    }
    else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string"
            ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
            : // tslint:disable-next-line
                endToken === undefined;
        if (!strict) {
            route += "(?:" + delimiter + "(?=" + endsWith + "))?";
        }
        if (!isEndDelimited) {
            route += "(?=" + delimiter + "|" + endsWith + ")";
        }
    }
    return new RegExp(route, flags(options));
}
exports.tokensToRegexp = tokensToRegexp;
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp)
        return regexpToRegexp(path, keys);
    if (Array.isArray(path))
        return arrayToRegexp(path, keys, options);
    return stringToRegexp(path, keys, options);
}
exports.pathToRegexp = pathToRegexp;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/picomatch/index.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/picomatch/index.js ***!
  \*************************************************************************************************************************************************/
/***/ ((module) => {

(()=>{"use strict";var t={170:(t,e,u)=>{const n=u(510);const isWindows=()=>{if(typeof navigator!=="undefined"&&navigator.platform){const t=navigator.platform.toLowerCase();return t==="win32"||t==="windows"}if(typeof process!=="undefined"&&process.platform){return process.platform==="win32"}return false};function picomatch(t,e,u=false){if(e&&(e.windows===null||e.windows===undefined)){e={...e,windows:isWindows()}}return n(t,e,u)}Object.assign(picomatch,n);t.exports=picomatch},154:t=>{const e="\\\\/";const u=`[^${e}]`;const n="\\.";const o="\\+";const s="\\?";const r="\\/";const a="(?=.)";const i="[^/]";const c=`(?:${r}|$)`;const p=`(?:^|${r})`;const l=`${n}{1,2}${c}`;const f=`(?!${n})`;const A=`(?!${p}${l})`;const _=`(?!${n}{0,1}${c})`;const R=`(?!${l})`;const E=`[^.${r}]`;const h=`${i}*?`;const g="/";const b={DOT_LITERAL:n,PLUS_LITERAL:o,QMARK_LITERAL:s,SLASH_LITERAL:r,ONE_CHAR:a,QMARK:i,END_ANCHOR:c,DOTS_SLASH:l,NO_DOT:f,NO_DOTS:A,NO_DOT_SLASH:_,NO_DOTS_SLASH:R,QMARK_NO_DOT:E,STAR:h,START_ANCHOR:p,SEP:g};const C={...b,SLASH_LITERAL:`[${e}]`,QMARK:u,STAR:`${u}*?`,DOTS_SLASH:`${n}{1,2}(?:[${e}]|$)`,NO_DOT:`(?!${n})`,NO_DOTS:`(?!(?:^|[${e}])${n}{1,2}(?:[${e}]|$))`,NO_DOT_SLASH:`(?!${n}{0,1}(?:[${e}]|$))`,NO_DOTS_SLASH:`(?!${n}{1,2}(?:[${e}]|$))`,QMARK_NO_DOT:`[^.${e}]`,START_ANCHOR:`(?:^|[${e}])`,END_ANCHOR:`(?:[${e}]|$)`,SEP:"\\"};const y={alnum:"a-zA-Z0-9",alpha:"a-zA-Z",ascii:"\\x00-\\x7F",blank:" \\t",cntrl:"\\x00-\\x1F\\x7F",digit:"0-9",graph:"\\x21-\\x7E",lower:"a-z",print:"\\x20-\\x7E ",punct:"\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",space:" \\t\\r\\n\\v\\f",upper:"A-Z",word:"A-Za-z0-9_",xdigit:"A-Fa-f0-9"};t.exports={MAX_LENGTH:1024*64,POSIX_REGEX_SOURCE:y,REGEX_BACKSLASH:/\\(?![*+?^${}(|)[\]])/g,REGEX_NON_SPECIAL_CHARS:/^[^@![\].,$*+?^{}()|\\/]+/,REGEX_SPECIAL_CHARS:/[-*+?.^${}(|)[\]]/,REGEX_SPECIAL_CHARS_BACKREF:/(\\?)((\W)(\3*))/g,REGEX_SPECIAL_CHARS_GLOBAL:/([-*+?.^${}(|)[\]])/g,REGEX_REMOVE_BACKSLASH:/(?:\[.*?[^\\]\]|\\(?=.))/g,REPLACEMENTS:{"***":"*","**/**":"**","**/**/**":"**"},CHAR_0:48,CHAR_9:57,CHAR_UPPERCASE_A:65,CHAR_LOWERCASE_A:97,CHAR_UPPERCASE_Z:90,CHAR_LOWERCASE_Z:122,CHAR_LEFT_PARENTHESES:40,CHAR_RIGHT_PARENTHESES:41,CHAR_ASTERISK:42,CHAR_AMPERSAND:38,CHAR_AT:64,CHAR_BACKWARD_SLASH:92,CHAR_CARRIAGE_RETURN:13,CHAR_CIRCUMFLEX_ACCENT:94,CHAR_COLON:58,CHAR_COMMA:44,CHAR_DOT:46,CHAR_DOUBLE_QUOTE:34,CHAR_EQUAL:61,CHAR_EXCLAMATION_MARK:33,CHAR_FORM_FEED:12,CHAR_FORWARD_SLASH:47,CHAR_GRAVE_ACCENT:96,CHAR_HASH:35,CHAR_HYPHEN_MINUS:45,CHAR_LEFT_ANGLE_BRACKET:60,CHAR_LEFT_CURLY_BRACE:123,CHAR_LEFT_SQUARE_BRACKET:91,CHAR_LINE_FEED:10,CHAR_NO_BREAK_SPACE:160,CHAR_PERCENT:37,CHAR_PLUS:43,CHAR_QUESTION_MARK:63,CHAR_RIGHT_ANGLE_BRACKET:62,CHAR_RIGHT_CURLY_BRACE:125,CHAR_RIGHT_SQUARE_BRACKET:93,CHAR_SEMICOLON:59,CHAR_SINGLE_QUOTE:39,CHAR_SPACE:32,CHAR_TAB:9,CHAR_UNDERSCORE:95,CHAR_VERTICAL_LINE:124,CHAR_ZERO_WIDTH_NOBREAK_SPACE:65279,extglobChars(t){return{"!":{type:"negate",open:"(?:(?!(?:",close:`))${t.STAR})`},"?":{type:"qmark",open:"(?:",close:")?"},"+":{type:"plus",open:"(?:",close:")+"},"*":{type:"star",open:"(?:",close:")*"},"@":{type:"at",open:"(?:",close:")"}}},globChars(t){return t===true?C:b}}},697:(t,e,u)=>{const n=u(154);const o=u(96);const{MAX_LENGTH:s,POSIX_REGEX_SOURCE:r,REGEX_NON_SPECIAL_CHARS:a,REGEX_SPECIAL_CHARS_BACKREF:i,REPLACEMENTS:c}=n;const expandRange=(t,e)=>{if(typeof e.expandRange==="function"){return e.expandRange(...t,e)}t.sort();const u=`[${t.join("-")}]`;try{new RegExp(u)}catch(e){return t.map((t=>o.escapeRegex(t))).join("..")}return u};const syntaxError=(t,e)=>`Missing ${t}: "${e}" - use "\\\\${e}" to match literal characters`;const parse=(t,e)=>{if(typeof t!=="string"){throw new TypeError("Expected a string")}t=c[t]||t;const u={...e};const p=typeof u.maxLength==="number"?Math.min(s,u.maxLength):s;let l=t.length;if(l>p){throw new SyntaxError(`Input length: ${l}, exceeds maximum allowed length: ${p}`)}const f={type:"bos",value:"",output:u.prepend||""};const A=[f];const _=u.capture?"":"?:";const R=n.globChars(u.windows);const E=n.extglobChars(R);const{DOT_LITERAL:h,PLUS_LITERAL:g,SLASH_LITERAL:b,ONE_CHAR:C,DOTS_SLASH:y,NO_DOT:$,NO_DOT_SLASH:x,NO_DOTS_SLASH:S,QMARK:H,QMARK_NO_DOT:v,STAR:d,START_ANCHOR:L}=R;const globstar=t=>`(${_}(?:(?!${L}${t.dot?y:h}).)*?)`;const T=u.dot?"":$;const O=u.dot?H:v;let k=u.bash===true?globstar(u):d;if(u.capture){k=`(${k})`}if(typeof u.noext==="boolean"){u.noextglob=u.noext}const m={input:t,index:-1,start:0,dot:u.dot===true,consumed:"",output:"",prefix:"",backtrack:false,negated:false,brackets:0,braces:0,parens:0,quotes:0,globstar:false,tokens:A};t=o.removePrefix(t,m);l=t.length;const w=[];const N=[];const I=[];let B=f;let G;const eos=()=>m.index===l-1;const D=m.peek=(e=1)=>t[m.index+e];const M=m.advance=()=>t[++m.index]||"";const remaining=()=>t.slice(m.index+1);const consume=(t="",e=0)=>{m.consumed+=t;m.index+=e};const append=t=>{m.output+=t.output!=null?t.output:t.value;consume(t.value)};const negate=()=>{let t=1;while(D()==="!"&&(D(2)!=="("||D(3)==="?")){M();m.start++;t++}if(t%2===0){return false}m.negated=true;m.start++;return true};const increment=t=>{m[t]++;I.push(t)};const decrement=t=>{m[t]--;I.pop()};const push=t=>{if(B.type==="globstar"){const e=m.braces>0&&(t.type==="comma"||t.type==="brace");const u=t.extglob===true||w.length&&(t.type==="pipe"||t.type==="paren");if(t.type!=="slash"&&t.type!=="paren"&&!e&&!u){m.output=m.output.slice(0,-B.output.length);B.type="star";B.value="*";B.output=k;m.output+=B.output}}if(w.length&&t.type!=="paren"){w[w.length-1].inner+=t.value}if(t.value||t.output)append(t);if(B&&B.type==="text"&&t.type==="text"){B.output=(B.output||B.value)+t.value;B.value+=t.value;return}t.prev=B;A.push(t);B=t};const extglobOpen=(t,e)=>{const n={...E[e],conditions:1,inner:""};n.prev=B;n.parens=m.parens;n.output=m.output;const o=(u.capture?"(":"")+n.open;increment("parens");push({type:t,value:e,output:m.output?"":C});push({type:"paren",extglob:true,value:M(),output:o});w.push(n)};const extglobClose=t=>{let n=t.close+(u.capture?")":"");let o;if(t.type==="negate"){let s=k;if(t.inner&&t.inner.length>1&&t.inner.includes("/")){s=globstar(u)}if(s!==k||eos()||/^\)+$/.test(remaining())){n=t.close=`)$))${s}`}if(t.inner.includes("*")&&(o=remaining())&&/^\.[^\\/.]+$/.test(o)){const u=parse(o,{...e,fastpaths:false}).output;n=t.close=`)${u})${s})`}if(t.prev.type==="bos"){m.negatedExtglob=true}}push({type:"paren",extglob:true,value:G,output:n});decrement("parens")};if(u.fastpaths!==false&&!/(^[*!]|[/()[\]{}"])/.test(t)){let n=false;let s=t.replace(i,((t,e,u,o,s,r)=>{if(o==="\\"){n=true;return t}if(o==="?"){if(e){return e+o+(s?H.repeat(s.length):"")}if(r===0){return O+(s?H.repeat(s.length):"")}return H.repeat(u.length)}if(o==="."){return h.repeat(u.length)}if(o==="*"){if(e){return e+o+(s?k:"")}return k}return e?t:`\\${t}`}));if(n===true){if(u.unescape===true){s=s.replace(/\\/g,"")}else{s=s.replace(/\\+/g,(t=>t.length%2===0?"\\\\":t?"\\":""))}}if(s===t&&u.contains===true){m.output=t;return m}m.output=o.wrapOutput(s,m,e);return m}while(!eos()){G=M();if(G==="\0"){continue}if(G==="\\"){const t=D();if(t==="/"&&u.bash!==true){continue}if(t==="."||t===";"){continue}if(!t){G+="\\";push({type:"text",value:G});continue}const e=/^\\+/.exec(remaining());let n=0;if(e&&e[0].length>2){n=e[0].length;m.index+=n;if(n%2!==0){G+="\\"}}if(u.unescape===true){G=M()}else{G+=M()}if(m.brackets===0){push({type:"text",value:G});continue}}if(m.brackets>0&&(G!=="]"||B.value==="["||B.value==="[^")){if(u.posix!==false&&G===":"){const t=B.value.slice(1);if(t.includes("[")){B.posix=true;if(t.includes(":")){const t=B.value.lastIndexOf("[");const e=B.value.slice(0,t);const u=B.value.slice(t+2);const n=r[u];if(n){B.value=e+n;m.backtrack=true;M();if(!f.output&&A.indexOf(B)===1){f.output=C}continue}}}}if(G==="["&&D()!==":"||G==="-"&&D()==="]"){G=`\\${G}`}if(G==="]"&&(B.value==="["||B.value==="[^")){G=`\\${G}`}if(u.posix===true&&G==="!"&&B.value==="["){G="^"}B.value+=G;append({value:G});continue}if(m.quotes===1&&G!=='"'){G=o.escapeRegex(G);B.value+=G;append({value:G});continue}if(G==='"'){m.quotes=m.quotes===1?0:1;if(u.keepQuotes===true){push({type:"text",value:G})}continue}if(G==="("){increment("parens");push({type:"paren",value:G});continue}if(G===")"){if(m.parens===0&&u.strictBrackets===true){throw new SyntaxError(syntaxError("opening","("))}const t=w[w.length-1];if(t&&m.parens===t.parens+1){extglobClose(w.pop());continue}push({type:"paren",value:G,output:m.parens?")":"\\)"});decrement("parens");continue}if(G==="["){if(u.nobracket===true||!remaining().includes("]")){if(u.nobracket!==true&&u.strictBrackets===true){throw new SyntaxError(syntaxError("closing","]"))}G=`\\${G}`}else{increment("brackets")}push({type:"bracket",value:G});continue}if(G==="]"){if(u.nobracket===true||B&&B.type==="bracket"&&B.value.length===1){push({type:"text",value:G,output:`\\${G}`});continue}if(m.brackets===0){if(u.strictBrackets===true){throw new SyntaxError(syntaxError("opening","["))}push({type:"text",value:G,output:`\\${G}`});continue}decrement("brackets");const t=B.value.slice(1);if(B.posix!==true&&t[0]==="^"&&!t.includes("/")){G=`/${G}`}B.value+=G;append({value:G});if(u.literalBrackets===false||o.hasRegexChars(t)){continue}const e=o.escapeRegex(B.value);m.output=m.output.slice(0,-B.value.length);if(u.literalBrackets===true){m.output+=e;B.value=e;continue}B.value=`(${_}${e}|${B.value})`;m.output+=B.value;continue}if(G==="{"&&u.nobrace!==true){increment("braces");const t={type:"brace",value:G,output:"(",outputIndex:m.output.length,tokensIndex:m.tokens.length};N.push(t);push(t);continue}if(G==="}"){const t=N[N.length-1];if(u.nobrace===true||!t){push({type:"text",value:G,output:G});continue}let e=")";if(t.dots===true){const t=A.slice();const n=[];for(let e=t.length-1;e>=0;e--){A.pop();if(t[e].type==="brace"){break}if(t[e].type!=="dots"){n.unshift(t[e].value)}}e=expandRange(n,u);m.backtrack=true}if(t.comma!==true&&t.dots!==true){const u=m.output.slice(0,t.outputIndex);const n=m.tokens.slice(t.tokensIndex);t.value=t.output="\\{";G=e="\\}";m.output=u;for(const t of n){m.output+=t.output||t.value}}push({type:"brace",value:G,output:e});decrement("braces");N.pop();continue}if(G==="|"){if(w.length>0){w[w.length-1].conditions++}push({type:"text",value:G});continue}if(G===","){let t=G;const e=N[N.length-1];if(e&&I[I.length-1]==="braces"){e.comma=true;t="|"}push({type:"comma",value:G,output:t});continue}if(G==="/"){if(B.type==="dot"&&m.index===m.start+1){m.start=m.index+1;m.consumed="";m.output="";A.pop();B=f;continue}push({type:"slash",value:G,output:b});continue}if(G==="."){if(m.braces>0&&B.type==="dot"){if(B.value===".")B.output=h;const t=N[N.length-1];B.type="dots";B.output+=G;B.value+=G;t.dots=true;continue}if(m.braces+m.parens===0&&B.type!=="bos"&&B.type!=="slash"){push({type:"text",value:G,output:h});continue}push({type:"dot",value:G,output:h});continue}if(G==="?"){const t=B&&B.value==="(";if(!t&&u.noextglob!==true&&D()==="("&&D(2)!=="?"){extglobOpen("qmark",G);continue}if(B&&B.type==="paren"){const t=D();let e=G;if(B.value==="("&&!/[!=<:]/.test(t)||t==="<"&&!/<([!=]|\w+>)/.test(remaining())){e=`\\${G}`}push({type:"text",value:G,output:e});continue}if(u.dot!==true&&(B.type==="slash"||B.type==="bos")){push({type:"qmark",value:G,output:v});continue}push({type:"qmark",value:G,output:H});continue}if(G==="!"){if(u.noextglob!==true&&D()==="("){if(D(2)!=="?"||!/[!=<:]/.test(D(3))){extglobOpen("negate",G);continue}}if(u.nonegate!==true&&m.index===0){negate();continue}}if(G==="+"){if(u.noextglob!==true&&D()==="("&&D(2)!=="?"){extglobOpen("plus",G);continue}if(B&&B.value==="("||u.regex===false){push({type:"plus",value:G,output:g});continue}if(B&&(B.type==="bracket"||B.type==="paren"||B.type==="brace")||m.parens>0){push({type:"plus",value:G});continue}push({type:"plus",value:g});continue}if(G==="@"){if(u.noextglob!==true&&D()==="("&&D(2)!=="?"){push({type:"at",extglob:true,value:G,output:""});continue}push({type:"text",value:G});continue}if(G!=="*"){if(G==="$"||G==="^"){G=`\\${G}`}const t=a.exec(remaining());if(t){G+=t[0];m.index+=t[0].length}push({type:"text",value:G});continue}if(B&&(B.type==="globstar"||B.star===true)){B.type="star";B.star=true;B.value+=G;B.output=k;m.backtrack=true;m.globstar=true;consume(G);continue}let e=remaining();if(u.noextglob!==true&&/^\([^?]/.test(e)){extglobOpen("star",G);continue}if(B.type==="star"){if(u.noglobstar===true){consume(G);continue}const n=B.prev;const o=n.prev;const s=n.type==="slash"||n.type==="bos";const r=o&&(o.type==="star"||o.type==="globstar");if(u.bash===true&&(!s||e[0]&&e[0]!=="/")){push({type:"star",value:G,output:""});continue}const a=m.braces>0&&(n.type==="comma"||n.type==="brace");const i=w.length&&(n.type==="pipe"||n.type==="paren");if(!s&&n.type!=="paren"&&!a&&!i){push({type:"star",value:G,output:""});continue}while(e.slice(0,3)==="/**"){const u=t[m.index+4];if(u&&u!=="/"){break}e=e.slice(3);consume("/**",3)}if(n.type==="bos"&&eos()){B.type="globstar";B.value+=G;B.output=globstar(u);m.output=B.output;m.globstar=true;consume(G);continue}if(n.type==="slash"&&n.prev.type!=="bos"&&!r&&eos()){m.output=m.output.slice(0,-(n.output+B.output).length);n.output=`(?:${n.output}`;B.type="globstar";B.output=globstar(u)+(u.strictSlashes?")":"|$)");B.value+=G;m.globstar=true;m.output+=n.output+B.output;consume(G);continue}if(n.type==="slash"&&n.prev.type!=="bos"&&e[0]==="/"){const t=e[1]!==void 0?"|$":"";m.output=m.output.slice(0,-(n.output+B.output).length);n.output=`(?:${n.output}`;B.type="globstar";B.output=`${globstar(u)}${b}|${b}${t})`;B.value+=G;m.output+=n.output+B.output;m.globstar=true;consume(G+M());push({type:"slash",value:"/",output:""});continue}if(n.type==="bos"&&e[0]==="/"){B.type="globstar";B.value+=G;B.output=`(?:^|${b}|${globstar(u)}${b})`;m.output=B.output;m.globstar=true;consume(G+M());push({type:"slash",value:"/",output:""});continue}m.output=m.output.slice(0,-B.output.length);B.type="globstar";B.output=globstar(u);B.value+=G;m.output+=B.output;m.globstar=true;consume(G);continue}const n={type:"star",value:G,output:k};if(u.bash===true){n.output=".*?";if(B.type==="bos"||B.type==="slash"){n.output=T+n.output}push(n);continue}if(B&&(B.type==="bracket"||B.type==="paren")&&u.regex===true){n.output=G;push(n);continue}if(m.index===m.start||B.type==="slash"||B.type==="dot"){if(B.type==="dot"){m.output+=x;B.output+=x}else if(u.dot===true){m.output+=S;B.output+=S}else{m.output+=T;B.output+=T}if(D()!=="*"){m.output+=C;B.output+=C}}push(n)}while(m.brackets>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing","]"));m.output=o.escapeLast(m.output,"[");decrement("brackets")}while(m.parens>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing",")"));m.output=o.escapeLast(m.output,"(");decrement("parens")}while(m.braces>0){if(u.strictBrackets===true)throw new SyntaxError(syntaxError("closing","}"));m.output=o.escapeLast(m.output,"{");decrement("braces")}if(u.strictSlashes!==true&&(B.type==="star"||B.type==="bracket")){push({type:"maybe_slash",value:"",output:`${b}?`})}if(m.backtrack===true){m.output="";for(const t of m.tokens){m.output+=t.output!=null?t.output:t.value;if(t.suffix){m.output+=t.suffix}}}return m};parse.fastpaths=(t,e)=>{const u={...e};const r=typeof u.maxLength==="number"?Math.min(s,u.maxLength):s;const a=t.length;if(a>r){throw new SyntaxError(`Input length: ${a}, exceeds maximum allowed length: ${r}`)}t=c[t]||t;const{DOT_LITERAL:i,SLASH_LITERAL:p,ONE_CHAR:l,DOTS_SLASH:f,NO_DOT:A,NO_DOTS:_,NO_DOTS_SLASH:R,STAR:E,START_ANCHOR:h}=n.globChars(u.windows);const g=u.dot?_:A;const b=u.dot?R:A;const C=u.capture?"":"?:";const y={negated:false,prefix:""};let $=u.bash===true?".*?":E;if(u.capture){$=`(${$})`}const globstar=t=>{if(t.noglobstar===true)return $;return`(${C}(?:(?!${h}${t.dot?f:i}).)*?)`};const create=t=>{switch(t){case"*":return`${g}${l}${$}`;case".*":return`${i}${l}${$}`;case"*.*":return`${g}${$}${i}${l}${$}`;case"*/*":return`${g}${$}${p}${l}${b}${$}`;case"**":return g+globstar(u);case"**/*":return`(?:${g}${globstar(u)}${p})?${b}${l}${$}`;case"**/*.*":return`(?:${g}${globstar(u)}${p})?${b}${$}${i}${l}${$}`;case"**/.*":return`(?:${g}${globstar(u)}${p})?${i}${l}${$}`;default:{const e=/^(.*?)\.(\w+)$/.exec(t);if(!e)return;const u=create(e[1]);if(!u)return;return u+i+e[2]}}};const x=o.removePrefix(t,y);let S=create(x);if(S&&u.strictSlashes!==true){S+=`${p}?`}return S};t.exports=parse},510:(t,e,u)=>{const n=u(716);const o=u(697);const s=u(96);const r=u(154);const isObject=t=>t&&typeof t==="object"&&!Array.isArray(t);const picomatch=(t,e,u=false)=>{if(Array.isArray(t)){const n=t.map((t=>picomatch(t,e,u)));const arrayMatcher=t=>{for(const e of n){const u=e(t);if(u)return u}return false};return arrayMatcher}const n=isObject(t)&&t.tokens&&t.input;if(t===""||typeof t!=="string"&&!n){throw new TypeError("Expected pattern to be a non-empty string")}const o=e||{};const s=o.windows;const r=n?picomatch.compileRe(t,e):picomatch.makeRe(t,e,false,true);const a=r.state;delete r.state;let isIgnored=()=>false;if(o.ignore){const t={...e,ignore:null,onMatch:null,onResult:null};isIgnored=picomatch(o.ignore,t,u)}const matcher=(u,n=false)=>{const{isMatch:i,match:c,output:p}=picomatch.test(u,r,e,{glob:t,posix:s});const l={glob:t,state:a,regex:r,posix:s,input:u,output:p,match:c,isMatch:i};if(typeof o.onResult==="function"){o.onResult(l)}if(i===false){l.isMatch=false;return n?l:false}if(isIgnored(u)){if(typeof o.onIgnore==="function"){o.onIgnore(l)}l.isMatch=false;return n?l:false}if(typeof o.onMatch==="function"){o.onMatch(l)}return n?l:true};if(u){matcher.state=a}return matcher};picomatch.test=(t,e,u,{glob:n,posix:o}={})=>{if(typeof t!=="string"){throw new TypeError("Expected input to be a string")}if(t===""){return{isMatch:false,output:""}}const r=u||{};const a=r.format||(o?s.toPosixSlashes:null);let i=t===n;let c=i&&a?a(t):t;if(i===false){c=a?a(t):t;i=c===n}if(i===false||r.capture===true){if(r.matchBase===true||r.basename===true){i=picomatch.matchBase(t,e,u,o)}else{i=e.exec(c)}}return{isMatch:Boolean(i),match:i,output:c}};picomatch.matchBase=(t,e,u)=>{const n=e instanceof RegExp?e:picomatch.makeRe(e,u);return n.test(s.basename(t))};picomatch.isMatch=(t,e,u)=>picomatch(e,u)(t);picomatch.parse=(t,e)=>{if(Array.isArray(t))return t.map((t=>picomatch.parse(t,e)));return o(t,{...e,fastpaths:false})};picomatch.scan=(t,e)=>n(t,e);picomatch.compileRe=(t,e,u=false,n=false)=>{if(u===true){return t.output}const o=e||{};const s=o.contains?"":"^";const r=o.contains?"":"$";let a=`${s}(?:${t.output})${r}`;if(t&&t.negated===true){a=`^(?!${a}).*$`}const i=picomatch.toRegex(a,e);if(n===true){i.state=t}return i};picomatch.makeRe=(t,e={},u=false,n=false)=>{if(!t||typeof t!=="string"){throw new TypeError("Expected a non-empty string")}let s={negated:false,fastpaths:true};if(e.fastpaths!==false&&(t[0]==="."||t[0]==="*")){s.output=o.fastpaths(t,e)}if(!s.output){s=o(t,e)}return picomatch.compileRe(s,e,u,n)};picomatch.toRegex=(t,e)=>{try{const u=e||{};return new RegExp(t,u.flags||(u.nocase?"i":""))}catch(t){if(e&&e.debug===true)throw t;return/$^/}};picomatch.constants=r;t.exports=picomatch},716:(t,e,u)=>{const n=u(96);const{CHAR_ASTERISK:o,CHAR_AT:s,CHAR_BACKWARD_SLASH:r,CHAR_COMMA:a,CHAR_DOT:i,CHAR_EXCLAMATION_MARK:c,CHAR_FORWARD_SLASH:p,CHAR_LEFT_CURLY_BRACE:l,CHAR_LEFT_PARENTHESES:f,CHAR_LEFT_SQUARE_BRACKET:A,CHAR_PLUS:_,CHAR_QUESTION_MARK:R,CHAR_RIGHT_CURLY_BRACE:E,CHAR_RIGHT_PARENTHESES:h,CHAR_RIGHT_SQUARE_BRACKET:g}=u(154);const isPathSeparator=t=>t===p||t===r;const depth=t=>{if(t.isPrefix!==true){t.depth=t.isGlobstar?Infinity:1}};const scan=(t,e)=>{const u=e||{};const b=t.length-1;const C=u.parts===true||u.scanToEnd===true;const y=[];const $=[];const x=[];let S=t;let H=-1;let v=0;let d=0;let L=false;let T=false;let O=false;let k=false;let m=false;let w=false;let N=false;let I=false;let B=false;let G=false;let D=0;let M;let P;let K={value:"",depth:0,isGlob:false};const eos=()=>H>=b;const peek=()=>S.charCodeAt(H+1);const advance=()=>{M=P;return S.charCodeAt(++H)};while(H<b){P=advance();let t;if(P===r){N=K.backslashes=true;P=advance();if(P===l){w=true}continue}if(w===true||P===l){D++;while(eos()!==true&&(P=advance())){if(P===r){N=K.backslashes=true;advance();continue}if(P===l){D++;continue}if(w!==true&&P===i&&(P=advance())===i){L=K.isBrace=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(w!==true&&P===a){L=K.isBrace=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===E){D--;if(D===0){w=false;L=K.isBrace=true;G=true;break}}}if(C===true){continue}break}if(P===p){y.push(H);$.push(K);K={value:"",depth:0,isGlob:false};if(G===true)continue;if(M===i&&H===v+1){v+=2;continue}d=H+1;continue}if(u.noext!==true){const t=P===_||P===s||P===o||P===R||P===c;if(t===true&&peek()===f){O=K.isGlob=true;k=K.isExtglob=true;G=true;if(P===c&&H===v){B=true}if(C===true){while(eos()!==true&&(P=advance())){if(P===r){N=K.backslashes=true;P=advance();continue}if(P===h){O=K.isGlob=true;G=true;break}}continue}break}}if(P===o){if(M===o)m=K.isGlobstar=true;O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===R){O=K.isGlob=true;G=true;if(C===true){continue}break}if(P===A){while(eos()!==true&&(t=advance())){if(t===r){N=K.backslashes=true;advance();continue}if(t===g){T=K.isBracket=true;O=K.isGlob=true;G=true;break}}if(C===true){continue}break}if(u.nonegate!==true&&P===c&&H===v){I=K.negated=true;v++;continue}if(u.noparen!==true&&P===f){O=K.isGlob=true;if(C===true){while(eos()!==true&&(P=advance())){if(P===f){N=K.backslashes=true;P=advance();continue}if(P===h){G=true;break}}continue}break}if(O===true){G=true;if(C===true){continue}break}}if(u.noext===true){k=false;O=false}let U=S;let X="";let F="";if(v>0){X=S.slice(0,v);S=S.slice(v);d-=v}if(U&&O===true&&d>0){U=S.slice(0,d);F=S.slice(d)}else if(O===true){U="";F=S}else{U=S}if(U&&U!==""&&U!=="/"&&U!==S){if(isPathSeparator(U.charCodeAt(U.length-1))){U=U.slice(0,-1)}}if(u.unescape===true){if(F)F=n.removeBackslashes(F);if(U&&N===true){U=n.removeBackslashes(U)}}const Q={prefix:X,input:t,start:v,base:U,glob:F,isBrace:L,isBracket:T,isGlob:O,isExtglob:k,isGlobstar:m,negated:I,negatedExtglob:B};if(u.tokens===true){Q.maxDepth=0;if(!isPathSeparator(P)){$.push(K)}Q.tokens=$}if(u.parts===true||u.tokens===true){let e;for(let n=0;n<y.length;n++){const o=e?e+1:v;const s=y[n];const r=t.slice(o,s);if(u.tokens){if(n===0&&v!==0){$[n].isPrefix=true;$[n].value=X}else{$[n].value=r}depth($[n]);Q.maxDepth+=$[n].depth}if(n!==0||r!==""){x.push(r)}e=s}if(e&&e+1<t.length){const n=t.slice(e+1);x.push(n);if(u.tokens){$[$.length-1].value=n;depth($[$.length-1]);Q.maxDepth+=$[$.length-1].depth}}Q.slashes=y;Q.parts=x}return Q};t.exports=scan},96:(t,e,u)=>{const{REGEX_BACKSLASH:n,REGEX_REMOVE_BACKSLASH:o,REGEX_SPECIAL_CHARS:s,REGEX_SPECIAL_CHARS_GLOBAL:r}=u(154);e.isObject=t=>t!==null&&typeof t==="object"&&!Array.isArray(t);e.hasRegexChars=t=>s.test(t);e.isRegexChar=t=>t.length===1&&e.hasRegexChars(t);e.escapeRegex=t=>t.replace(r,"\\$1");e.toPosixSlashes=t=>t.replace(n,"/");e.removeBackslashes=t=>t.replace(o,(t=>t==="\\"?"":t));e.escapeLast=(t,u,n)=>{const o=t.lastIndexOf(u,n);if(o===-1)return t;if(t[o-1]==="\\")return e.escapeLast(t,u,o-1);return`${t.slice(0,o)}\\${t.slice(o)}`};e.removePrefix=(t,e={})=>{let u=t;if(u.startsWith("./")){u=u.slice(2);e.prefix="./"}return u};e.wrapOutput=(t,e={},u={})=>{const n=u.contains?"":"^";const o=u.contains?"":"$";let s=`${n}(?:${t})${o}`;if(e.negated===true){s=`(?:^(?!${s}).*$)`}return s};e.basename=(t,{windows:e}={})=>{const u=t.split(e?/[\\/]/:"/");const n=u[u.length-1];if(n===""){return u[u.length-2]}return n}}};var e={};function __nccwpck_require__(u){var n=e[u];if(n!==undefined){return n.exports}var o=e[u]={exports:{}};var s=true;try{t[u](o,o.exports,__nccwpck_require__);s=false}finally{if(s)delete e[u]}return o.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var u=__nccwpck_require__(170);module.exports=u})();

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/cjs/react-is.development.js":
/*!*******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/cjs/react-is.development.js ***!
  \*******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_SERVER_CONTEXT_TYPE = Symbol.for('react.server_context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');

// -----------------------------------------------------------------------------

var enableScopeAPI = false; // Experimental Create Event Handle API.
var enableCacheElement = false;
var enableTransitionTracing = false; // No known bugs, but needs performance testing

var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
// stuff. Intended to enable React core members to more easily debug scheduling
// issues in DEV builds.

var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

var REACT_MODULE_REFERENCE;

{
  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
}

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
    // types supported by any Flight configuration anywhere since
    // we don't know which Flight build this will end up being used
    // with.
    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
      return true;
    }
  }

  return false;
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
          case REACT_SUSPENSE_LIST_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_SERVER_CONTEXT_TYPE:
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var SuspenseList = REACT_SUSPENSE_LIST_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false;
var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isConcurrentMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
      hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}
function isSuspenseList(object) {
  return typeOf(object) === REACT_SUSPENSE_LIST_TYPE;
}

exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.SuspenseList = SuspenseList;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
exports.isSuspenseList = isSuspenseList;
exports.isValidElementType = isValidElementType;
exports.typeOf = typeOf;
  })();
}


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/index.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/index.js ***!
  \************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-api-route.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-api-route.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "isAPIRoute", ({
    enumerable: true,
    get: function() {
        return isAPIRoute;
    }
}));
function isAPIRoute(value) {
    return value === "/api" || Boolean(value == null ? void 0 : value.startsWith("/api/"));
}

//# sourceMappingURL=is-api-route.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-error.js":
/*!*************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-error.js ***!
  \*************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return isError;
    },
    getProperError: function() {
        return getProperError;
    }
});
const _isplainobject = __webpack_require__(/*! ../shared/lib/is-plain-object */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/is-plain-object.js");
function isError(err) {
    return typeof err === "object" && err !== null && "name" in err && "message" in err;
}
function getProperError(err) {
    if (isError(err)) {
        return err;
    }
    if (true) {
        // provide better error for case where `throw undefined`
        // is called in development
        if (typeof err === "undefined") {
            return new Error("An undefined error was thrown, " + "see here for more info: https://nextjs.org/docs/messages/threw-undefined");
        }
        if (err === null) {
            return new Error("A null error was thrown, " + "see here for more info: https://nextjs.org/docs/messages/threw-undefined");
        }
    }
    return new Error((0, _isplainobject.isPlainObject)(err) ? JSON.stringify(err) : err + "");
}

//# sourceMappingURL=is-error.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/api-utils/get-cookie-parser.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/api-utils/get-cookie-parser.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getCookieParser", ({
    enumerable: true,
    get: function() {
        return getCookieParser;
    }
}));
function getCookieParser(headers) {
    return function parseCookie() {
        const { cookie } = headers;
        if (!cookie) {
            return {};
        }
        const { parse: parseCookieFn } = __webpack_require__(/*! next/dist/compiled/cookie */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/cookie/index.js");
        return parseCookieFn(Array.isArray(cookie) ? cookie.join("; ") : cookie);
    };
}

//# sourceMappingURL=get-cookie-parser.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/helpers/interception-routes.js":
/*!******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/helpers/interception-routes.js ***!
  \******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    INTERCEPTION_ROUTE_MARKERS: function() {
        return INTERCEPTION_ROUTE_MARKERS;
    },
    extractInterceptionRouteInformation: function() {
        return extractInterceptionRouteInformation;
    },
    isInterceptionRouteAppPath: function() {
        return isInterceptionRouteAppPath;
    }
});
const _apppaths = __webpack_require__(/*! ../../../shared/lib/router/utils/app-paths */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/app-paths.js");
const INTERCEPTION_ROUTE_MARKERS = [
    "(..)(..)",
    "(.)",
    "(..)",
    "(...)"
];
function isInterceptionRouteAppPath(path) {
    // TODO-APP: add more serious validation
    return path.split("/").find((segment)=>INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m))) !== undefined;
}
function extractInterceptionRouteInformation(path) {
    let interceptingRoute, marker, interceptedRoute;
    for (const segment of path.split("/")){
        marker = INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m));
        if (marker) {
            [interceptingRoute, interceptedRoute] = path.split(marker, 2);
            break;
        }
    }
    if (!interceptingRoute || !marker || !interceptedRoute) {
        throw new Error(`Invalid interception route: ${path}. Must be in the format /<intercepting route>/(..|...|..)(..)/<intercepted route>`);
    }
    interceptingRoute = (0, _apppaths.normalizeAppPath)(interceptingRoute) // normalize the path, e.g. /(blog)/feed -> /feed
    ;
    switch(marker){
        case "(.)":
            // (.) indicates that we should match with sibling routes, so we just need to append the intercepted route to the intercepting route
            if (interceptingRoute === "/") {
                interceptedRoute = `/${interceptedRoute}`;
            } else {
                interceptedRoute = interceptingRoute + "/" + interceptedRoute;
            }
            break;
        case "(..)":
            // (..) indicates that we should match at one level up, so we need to remove the last segment of the intercepting route
            if (interceptingRoute === "/") {
                throw new Error(`Invalid interception route: ${path}. Cannot use (..) marker at the root level, use (.) instead.`);
            }
            interceptedRoute = interceptingRoute.split("/").slice(0, -1).concat(interceptedRoute).join("/");
            break;
        case "(...)":
            // (...) will match the route segment in the root directory, so we need to use the root directory to prepend the intercepted route
            interceptedRoute = "/" + interceptedRoute;
            break;
        case "(..)(..)":
            // (..)(..) indicates that we should match at two levels up, so we need to remove the last two segments of the intercepting route
            const splitInterceptingRoute = interceptingRoute.split("/");
            if (splitInterceptingRoute.length <= 2) {
                throw new Error(`Invalid interception route: ${path}. Cannot use (..)(..) marker at the root level or one level up.`);
            }
            interceptedRoute = splitInterceptingRoute.slice(0, -2).concat(interceptedRoute).join("/");
            break;
        default:
            throw new Error("Invariant: unexpected marker");
    }
    return {
        interceptingRoute,
        interceptedRoute
    };
}

//# sourceMappingURL=interception-routes.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js":
/*!**************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js ***!
  \**************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

if (false) {} else {
    if (true) {
        module.exports = __webpack_require__(/*! next/dist/compiled/next-server/pages.runtime.dev.js */ "next/dist/compiled/next-server/pages.runtime.dev.js");
    } else {}
}

//# sourceMappingURL=module.compiled.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/amp-context.js":
/*!****************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/amp-context.js ***!
  \****************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.AmpContext;

//# sourceMappingURL=amp-context.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/app-router-context.js":
/*!***********************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/app-router-context.js ***!
  \***********************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.AppRouterContext;

//# sourceMappingURL=app-router-context.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/head-manager-context.js":
/*!*************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/head-manager-context.js ***!
  \*************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.HeadManagerContext;

//# sourceMappingURL=head-manager-context.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/image-config-context.js":
/*!*************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/image-config-context.js ***!
  \*************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.ImageConfigContext;

//# sourceMappingURL=image-config-context.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/loadable.js":
/*!*************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/loadable.js ***!
  \*************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.Loadable;

//# sourceMappingURL=loadable.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/router-context.js":
/*!*******************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/router-context.js ***!
  \*******************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

module.exports = __webpack_require__(/*! ../../module.compiled */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/module.compiled.js").vendored.contexts.RouterContext;

//# sourceMappingURL=router-context.js.map

/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/amp-mode.js":
/*!********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/amp-mode.js ***!
  \********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "isInAmpMode", ({
    enumerable: true,
    get: function() {
        return isInAmpMode;
    }
}));
function isInAmpMode(param) {
    let { ampFirst = false, hybrid = false, hasQuery = false } = param === void 0 ? {} : param;
    return ampFirst || hybrid && hasQuery;
} //# sourceMappingURL=amp-mode.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/bloom-filter.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/bloom-filter.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// minimal implementation MurmurHash2 hash function

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "BloomFilter", ({
    enumerable: true,
    get: function() {
        return BloomFilter;
    }
}));
function murmurhash2(str) {
    let h = 0;
    for(let i = 0; i < str.length; i++){
        const c = str.charCodeAt(i);
        h = Math.imul(h ^ c, 0x5bd1e995);
        h ^= h >>> 13;
        h = Math.imul(h, 0x5bd1e995);
    }
    return h >>> 0;
}
// default to 0.01% error rate as the filter compresses very well
const DEFAULT_ERROR_RATE = 0.0001;
class BloomFilter {
    static from(items, errorRate) {
        if (errorRate === void 0) errorRate = DEFAULT_ERROR_RATE;
        const filter = new BloomFilter(items.length, errorRate);
        for (const item of items){
            filter.add(item);
        }
        return filter;
    }
    export() {
        const data = {
            numItems: this.numItems,
            errorRate: this.errorRate,
            numBits: this.numBits,
            numHashes: this.numHashes,
            bitArray: this.bitArray
        };
        if (true) {
            if (this.errorRate < DEFAULT_ERROR_RATE) {
                const filterData = JSON.stringify(data);
                const gzipSize = (__webpack_require__(/*! next/dist/compiled/gzip-size */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/gzip-size/index.js").sync)(filterData);
                if (gzipSize > 1024) {
                    console.warn("Creating filter with error rate less than 0.1% (0.001) can increase the size dramatically proceed with caution. Received error rate " + this.errorRate + " resulted in size " + filterData.length + " bytes, " + gzipSize + " bytes (gzip)");
                }
            }
        }
        return data;
    }
    import(data) {
        this.numItems = data.numItems;
        this.errorRate = data.errorRate;
        this.numBits = data.numBits;
        this.numHashes = data.numHashes;
        this.bitArray = data.bitArray;
    }
    add(item) {
        const hashValues = this.getHashValues(item);
        hashValues.forEach((hash)=>{
            this.bitArray[hash] = 1;
        });
    }
    contains(item) {
        const hashValues = this.getHashValues(item);
        return hashValues.every((hash)=>this.bitArray[hash]);
    }
    getHashValues(item) {
        const hashValues = [];
        for(let i = 1; i <= this.numHashes; i++){
            const hash = murmurhash2("" + item + i) % this.numBits;
            hashValues.push(hash);
        }
        return hashValues;
    }
    constructor(numItems, errorRate = DEFAULT_ERROR_RATE){
        this.numItems = numItems;
        this.errorRate = errorRate;
        this.numBits = Math.ceil(-(numItems * Math.log(errorRate)) / (Math.log(2) * Math.log(2)));
        this.numHashes = Math.ceil(this.numBits / numItems * Math.log(2));
        this.bitArray = new Array(this.numBits).fill(0);
    }
} //# sourceMappingURL=bloom-filter.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/dynamic.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/dynamic.js ***!
  \*******************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    /**
 * This function lets you dynamically import a component.
 * It uses [React.lazy()](https://react.dev/reference/react/lazy) with [Suspense](https://react.dev/reference/react/Suspense) under the hood.
 *
 * Read more: [Next.js Docs: `next/dynamic`](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#nextdynamic)
 */ default: function() {
        return dynamic;
    },
    noSSR: function() {
        return noSSR;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! react */ "react"));
const _loadablesharedruntime = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ./loadable.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/loadable.js"));
const isServerSide = "undefined" === "undefined";
// Normalize loader to return the module as form { default: Component } for `React.lazy`.
// Also for backward compatible since next/dynamic allows to resolve a component directly with loader
// Client component reference proxy need to be converted to a module.
function convertModule(mod) {
    return {
        default: (mod == null ? void 0 : mod.default) || mod
    };
}
function noSSR(LoadableInitializer, loadableOptions) {
    // Removing webpack and modules means react-loadable won't try preloading
    delete loadableOptions.webpack;
    delete loadableOptions.modules;
    // This check is necessary to prevent react-loadable from initializing on the server
    if (!isServerSide) {
        return LoadableInitializer(loadableOptions);
    }
    const Loading = loadableOptions.loading;
    // This will only be rendered on the server side
    return ()=>/*#__PURE__*/ (0, _jsxruntime.jsx)(Loading, {
            error: null,
            isLoading: true,
            pastDelay: false,
            timedOut: false
        });
}
function dynamic(dynamicOptions, options) {
    let loadableFn = _loadablesharedruntime.default;
    let loadableOptions = {
        // A loading component is not required, so we default it
        loading: (param)=>{
            let { error, isLoading, pastDelay } = param;
            if (!pastDelay) return null;
            if (true) {
                if (isLoading) {
                    return null;
                }
                if (error) {
                    return /*#__PURE__*/ (0, _jsxruntime.jsxs)("p", {
                        children: [
                            error.message,
                            /*#__PURE__*/ (0, _jsxruntime.jsx)("br", {}),
                            error.stack
                        ]
                    });
                }
            }
            return null;
        }
    };
    // Support for direct import(), eg: dynamic(import('../hello-world'))
    // Note that this is only kept for the edge case where someone is passing in a promise as first argument
    // The react-loadable babel plugin will turn dynamic(import('../hello-world')) into dynamic(() => import('../hello-world'))
    // To make sure we don't execute the import without rendering first
    if (dynamicOptions instanceof Promise) {
        loadableOptions.loader = ()=>dynamicOptions;
    // Support for having import as a function, eg: dynamic(() => import('../hello-world'))
    } else if (typeof dynamicOptions === "function") {
        loadableOptions.loader = dynamicOptions;
    // Support for having first argument being options, eg: dynamic({loader: import('../hello-world')})
    } else if (typeof dynamicOptions === "object") {
        loadableOptions = {
            ...loadableOptions,
            ...dynamicOptions
        };
    }
    // Support for passing options, eg: dynamic(import('../hello-world'), {loading: () => <p>Loading something</p>})
    loadableOptions = {
        ...loadableOptions,
        ...options
    };
    const loaderFn = loadableOptions.loader;
    const loader = ()=>loaderFn != null ? loaderFn().then(convertModule) : Promise.resolve(convertModule(()=>null));
    // coming from build/babel/plugins/react-loadable-plugin.js
    if (loadableOptions.loadableGenerated) {
        loadableOptions = {
            ...loadableOptions,
            ...loadableOptions.loadableGenerated
        };
        delete loadableOptions.loadableGenerated;
    }
    // support for disabling server side rendering, eg: dynamic(() => import('../hello-world'), {ssr: false}).
    if (typeof loadableOptions.ssr === "boolean" && !loadableOptions.ssr) {
        delete loadableOptions.webpack;
        delete loadableOptions.modules;
        return noSSR(loadableFn, loadableOptions);
    }
    return loadableFn({
        ...loadableOptions,
        loader: loader
    });
}
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=dynamic.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/escape-regexp.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/escape-regexp.js ***!
  \*************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// regexp is based on https://github.com/sindresorhus/escape-string-regexp

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "escapeStringRegexp", ({
    enumerable: true,
    get: function() {
        return escapeStringRegexp;
    }
}));
const reHasRegExp = /[|\\{}()[\]^$+*?.-]/;
const reReplaceRegExp = /[|\\{}()[\]^$+*?.-]/g;
function escapeStringRegexp(str) {
    // see also: https://github.com/lodash/lodash/blob/2da024c3b4f9947a48517639de7560457cd4ec6c/escapeRegExp.js#L23
    if (reHasRegExp.test(str)) {
        return str.replace(reReplaceRegExp, "\\$&");
    }
    return str;
} //# sourceMappingURL=escape-regexp.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/get-img-props.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/get-img-props.js ***!
  \*************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getImgProps", ({
    enumerable: true,
    get: function() {
        return getImgProps;
    }
}));
const _warnonce = __webpack_require__(/*! ./utils/warn-once */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js");
const _imageblursvg = __webpack_require__(/*! ./image-blur-svg */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-blur-svg.js");
const _imageconfig = __webpack_require__(/*! ./image-config */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-config.js");
const VALID_LOADING_VALUES = [
    "lazy",
    "eager",
    undefined
];
function isStaticRequire(src) {
    return src.default !== undefined;
}
function isStaticImageData(src) {
    return src.src !== undefined;
}
function isStaticImport(src) {
    return typeof src === "object" && (isStaticRequire(src) || isStaticImageData(src));
}
const allImgs = new Map();
let perfObserver;
function getInt(x) {
    if (typeof x === "undefined") {
        return x;
    }
    if (typeof x === "number") {
        return Number.isFinite(x) ? x : NaN;
    }
    if (typeof x === "string" && /^[0-9]+$/.test(x)) {
        return parseInt(x, 10);
    }
    return NaN;
}
function getWidths(param, width, sizes) {
    let { deviceSizes, allSizes } = param;
    if (sizes) {
        // Find all the "vw" percent sizes used in the sizes prop
        const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
        const percentSizes = [];
        for(let match; match = viewportWidthRe.exec(sizes); match){
            percentSizes.push(parseInt(match[2]));
        }
        if (percentSizes.length) {
            const smallestRatio = Math.min(...percentSizes) * 0.01;
            return {
                widths: allSizes.filter((s)=>s >= deviceSizes[0] * smallestRatio),
                kind: "w"
            };
        }
        return {
            widths: allSizes,
            kind: "w"
        };
    }
    if (typeof width !== "number") {
        return {
            widths: deviceSizes,
            kind: "w"
        };
    }
    const widths = [
        ...new Set(// > are actually 3x in the green color, but only 1.5x in the red and
        // > blue colors. Showing a 3x resolution image in the app vs a 2x
        // > resolution image will be visually the same, though the 3x image
        // > takes significantly more data. Even true 3x resolution screens are
        // > wasteful as the human eye cannot see that level of detail without
        // > something like a magnifying glass.
        // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
        [
            width,
            width * 2 /*, width * 3*/ 
        ].map((w)=>allSizes.find((p)=>p >= w) || allSizes[allSizes.length - 1]))
    ];
    return {
        widths,
        kind: "x"
    };
}
function generateImgAttrs(param) {
    let { config, src, unoptimized, width, quality, sizes, loader } = param;
    if (unoptimized) {
        return {
            src,
            srcSet: undefined,
            sizes: undefined
        };
    }
    const { widths, kind } = getWidths(config, width, sizes);
    const last = widths.length - 1;
    return {
        sizes: !sizes && kind === "w" ? "100vw" : sizes,
        srcSet: widths.map((w, i)=>loader({
                config,
                src,
                quality,
                width: w
            }) + " " + (kind === "w" ? w : i + 1) + kind).join(", "),
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        src: loader({
            config,
            src,
            quality,
            width: widths[last]
        })
    };
}
function getImgProps(param, _state) {
    let { src, sizes, unoptimized = false, priority = false, loading, className, quality, width, height, fill = false, style, overrideSrc, onLoad, onLoadingComplete, placeholder = "empty", blurDataURL, fetchPriority, decoding = "async", layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest } = param;
    const { imgConf, showAltText, blurComplete, defaultLoader } = _state;
    let config;
    let c = imgConf || _imageconfig.imageConfigDefault;
    if ("allSizes" in c) {
        config = c;
    } else {
        const allSizes = [
            ...c.deviceSizes,
            ...c.imageSizes
        ].sort((a, b)=>a - b);
        const deviceSizes = c.deviceSizes.sort((a, b)=>a - b);
        config = {
            ...c,
            allSizes,
            deviceSizes
        };
    }
    if (typeof defaultLoader === "undefined") {
        throw new Error("images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config");
    }
    let loader = rest.loader || defaultLoader;
    // Remove property so it's not spread on <img> element
    delete rest.loader;
    delete rest.srcSet;
    // This special value indicates that the user
    // didn't define a "loader" prop or "loader" config.
    const isDefaultLoader = "__next_img_default" in loader;
    if (isDefaultLoader) {
        if (config.loader === "custom") {
            throw new Error('Image with src "' + src + '" is missing "loader" prop.' + "\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader");
        }
    } else {
        // The user defined a "loader" prop or config.
        // Since the config object is internal only, we
        // must not pass it to the user-defined "loader".
        const customImageLoader = loader;
        loader = (obj)=>{
            const { config: _, ...opts } = obj;
            return customImageLoader(opts);
        };
    }
    if (layout) {
        if (layout === "fill") {
            fill = true;
        }
        const layoutToStyle = {
            intrinsic: {
                maxWidth: "100%",
                height: "auto"
            },
            responsive: {
                width: "100%",
                height: "auto"
            }
        };
        const layoutToSizes = {
            responsive: "100vw",
            fill: "100vw"
        };
        const layoutStyle = layoutToStyle[layout];
        if (layoutStyle) {
            style = {
                ...style,
                ...layoutStyle
            };
        }
        const layoutSizes = layoutToSizes[layout];
        if (layoutSizes && !sizes) {
            sizes = layoutSizes;
        }
    }
    let staticSrc = "";
    let widthInt = getInt(width);
    let heightInt = getInt(height);
    let blurWidth;
    let blurHeight;
    if (isStaticImport(src)) {
        const staticImageData = isStaticRequire(src) ? src.default : src;
        if (!staticImageData.src) {
            throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received " + JSON.stringify(staticImageData));
        }
        if (!staticImageData.height || !staticImageData.width) {
            throw new Error("An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received " + JSON.stringify(staticImageData));
        }
        blurWidth = staticImageData.blurWidth;
        blurHeight = staticImageData.blurHeight;
        blurDataURL = blurDataURL || staticImageData.blurDataURL;
        staticSrc = staticImageData.src;
        if (!fill) {
            if (!widthInt && !heightInt) {
                widthInt = staticImageData.width;
                heightInt = staticImageData.height;
            } else if (widthInt && !heightInt) {
                const ratio = widthInt / staticImageData.width;
                heightInt = Math.round(staticImageData.height * ratio);
            } else if (!widthInt && heightInt) {
                const ratio = heightInt / staticImageData.height;
                widthInt = Math.round(staticImageData.width * ratio);
            }
        }
    }
    src = typeof src === "string" ? src : staticSrc;
    let isLazy = !priority && (loading === "lazy" || typeof loading === "undefined");
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
        // https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
        unoptimized = true;
        isLazy = false;
    }
    if (config.unoptimized) {
        unoptimized = true;
    }
    if (isDefaultLoader && src.endsWith(".svg") && !config.dangerouslyAllowSVG) {
        // Special case to make svg serve as-is to avoid proxying
        // through the built-in Image Optimization API.
        unoptimized = true;
    }
    if (priority) {
        fetchPriority = "high";
    }
    const qualityInt = getInt(quality);
    if (true) {
        if (config.output === "export" && isDefaultLoader && !unoptimized) {
            throw new Error("Image Optimization using the default loader is not compatible with `{ output: 'export' }`.\n  Possible solutions:\n    - Remove `{ output: 'export' }` and run \"next start\" to run server mode including the Image Optimization API.\n    - Configure `{ images: { unoptimized: true } }` in `next.config.js` to disable the Image Optimization API.\n  Read more: https://nextjs.org/docs/messages/export-image-api");
        }
        if (!src) {
            // React doesn't show the stack trace and there's
            // no `src` to help identify which image, so we
            // instead console.error(ref) during mount.
            unoptimized = true;
        } else {
            if (fill) {
                if (width) {
                    throw new Error('Image with src "' + src + '" has both "width" and "fill" properties. Only one should be used.');
                }
                if (height) {
                    throw new Error('Image with src "' + src + '" has both "height" and "fill" properties. Only one should be used.');
                }
                if ((style == null ? void 0 : style.position) && style.position !== "absolute") {
                    throw new Error('Image with src "' + src + '" has both "fill" and "style.position" properties. Images with "fill" always use position absolute - it cannot be modified.');
                }
                if ((style == null ? void 0 : style.width) && style.width !== "100%") {
                    throw new Error('Image with src "' + src + '" has both "fill" and "style.width" properties. Images with "fill" always use width 100% - it cannot be modified.');
                }
                if ((style == null ? void 0 : style.height) && style.height !== "100%") {
                    throw new Error('Image with src "' + src + '" has both "fill" and "style.height" properties. Images with "fill" always use height 100% - it cannot be modified.');
                }
            } else {
                if (typeof widthInt === "undefined") {
                    throw new Error('Image with src "' + src + '" is missing required "width" property.');
                } else if (isNaN(widthInt)) {
                    throw new Error('Image with src "' + src + '" has invalid "width" property. Expected a numeric value in pixels but received "' + width + '".');
                }
                if (typeof heightInt === "undefined") {
                    throw new Error('Image with src "' + src + '" is missing required "height" property.');
                } else if (isNaN(heightInt)) {
                    throw new Error('Image with src "' + src + '" has invalid "height" property. Expected a numeric value in pixels but received "' + height + '".');
                }
            }
        }
        if (!VALID_LOADING_VALUES.includes(loading)) {
            throw new Error('Image with src "' + src + '" has invalid "loading" property. Provided "' + loading + '" should be one of ' + VALID_LOADING_VALUES.map(String).join(",") + ".");
        }
        if (priority && loading === "lazy") {
            throw new Error('Image with src "' + src + '" has both "priority" and "loading=\'lazy\'" properties. Only one should be used.');
        }
        if (placeholder !== "empty" && placeholder !== "blur" && !placeholder.startsWith("data:image/")) {
            throw new Error('Image with src "' + src + '" has invalid "placeholder" property "' + placeholder + '".');
        }
        if (placeholder !== "empty") {
            if (widthInt && heightInt && widthInt * heightInt < 1600) {
                (0, _warnonce.warnOnce)('Image with src "' + src + '" is smaller than 40x40. Consider removing the "placeholder" property to improve performance.');
            }
        }
        if (placeholder === "blur" && !blurDataURL) {
            const VALID_BLUR_EXT = [
                "jpeg",
                "png",
                "webp",
                "avif"
            ] // should match next-image-loader
            ;
            throw new Error('Image with src "' + src + '" has "placeholder=\'blur\'" property but is missing the "blurDataURL" property.\n        Possible solutions:\n          - Add a "blurDataURL" property, the contents should be a small Data URL to represent the image\n          - Change the "src" property to a static import with one of the supported file types: ' + VALID_BLUR_EXT.join(",") + ' (animated images not supported)\n          - Remove the "placeholder" property, effectively no blur effect\n        Read more: https://nextjs.org/docs/messages/placeholder-blur-data-url');
        }
        if ("ref" in rest) {
            (0, _warnonce.warnOnce)('Image with src "' + src + '" is using unsupported "ref" property. Consider using the "onLoad" property instead.');
        }
        if (!unoptimized && !isDefaultLoader) {
            const urlStr = loader({
                config,
                src,
                width: widthInt || 400,
                quality: qualityInt || 75
            });
            let url;
            try {
                url = new URL(urlStr);
            } catch (err) {}
            if (urlStr === src || url && url.pathname === src && !url.search) {
                (0, _warnonce.warnOnce)('Image with src "' + src + '" has a "loader" property that does not implement width. Please implement it or use the "unoptimized" property instead.' + "\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader-width");
            }
        }
        if (onLoadingComplete) {
            (0, _warnonce.warnOnce)('Image with src "' + src + '" is using deprecated "onLoadingComplete" property. Please use the "onLoad" property instead.');
        }
        for (const [legacyKey, legacyValue] of Object.entries({
            layout,
            objectFit,
            objectPosition,
            lazyBoundary,
            lazyRoot
        })){
            if (legacyValue) {
                (0, _warnonce.warnOnce)('Image with src "' + src + '" has legacy prop "' + legacyKey + '". Did you forget to run the codemod?' + "\nRead more: https://nextjs.org/docs/messages/next-image-upgrade-to-13");
            }
        }
        if (false) {}
    }
    const imgStyle = Object.assign(fill ? {
        position: "absolute",
        height: "100%",
        width: "100%",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit,
        objectPosition
    } : {}, showAltText ? {} : {
        color: "transparent"
    }, style);
    const backgroundImage = !blurComplete && placeholder !== "empty" ? placeholder === "blur" ? 'url("data:image/svg+xml;charset=utf-8,' + (0, _imageblursvg.getImageBlurSvg)({
        widthInt,
        heightInt,
        blurWidth,
        blurHeight,
        blurDataURL: blurDataURL || "",
        objectFit: imgStyle.objectFit
    }) + '")' : 'url("' + placeholder + '")' // assume `data:image/`
     : null;
    let placeholderStyle = backgroundImage ? {
        backgroundSize: imgStyle.objectFit || "cover",
        backgroundPosition: imgStyle.objectPosition || "50% 50%",
        backgroundRepeat: "no-repeat",
        backgroundImage
    } : {};
    if (true) {
        if (placeholderStyle.backgroundImage && placeholder === "blur" && (blurDataURL == null ? void 0 : blurDataURL.startsWith("/"))) {
            // During `next dev`, we don't want to generate blur placeholders with webpack
            // because it can delay starting the dev server. Instead, `next-image-loader.js`
            // will inline a special url to lazily generate the blur placeholder at request time.
            placeholderStyle.backgroundImage = 'url("' + blurDataURL + '")';
        }
    }
    const imgAttributes = generateImgAttrs({
        config,
        src,
        unoptimized,
        width: widthInt,
        quality: qualityInt,
        sizes,
        loader
    });
    if (true) {
        if (false) {}
    }
    const props = {
        ...rest,
        loading: isLazy ? "lazy" : loading,
        fetchPriority,
        width: widthInt,
        height: heightInt,
        decoding,
        className,
        style: {
            ...imgStyle,
            ...placeholderStyle
        },
        sizes: imgAttributes.sizes,
        srcSet: imgAttributes.srcSet,
        src: overrideSrc || imgAttributes.src
    };
    const meta = {
        unoptimized,
        priority,
        placeholder,
        fill
    };
    return {
        props,
        meta
    };
} //# sourceMappingURL=get-img-props.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/head.js":
/*!****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/head.js ***!
  \****************************************************************************************************************************************/
/***/ ((module, exports, __webpack_require__) => {

"use strict";
/* __next_internal_client_entry_do_not_use__  cjs */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    defaultHead: function() {
        return defaultHead;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _interop_require_wildcard = __webpack_require__(/*! @swc/helpers/_/_interop_require_wildcard */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs");
const _jsxruntime = __webpack_require__(/*! react/jsx-runtime */ "webpack/sharing/consume/default/react/jsx-runtime/react/jsx-runtime");
const _react = /*#__PURE__*/ _interop_require_wildcard._(__webpack_require__(/*! react */ "react"));
const _sideeffect = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ./side-effect */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/side-effect.js"));
const _ampcontextsharedruntime = __webpack_require__(/*! ./amp-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/amp-context.js");
const _headmanagercontextsharedruntime = __webpack_require__(/*! ./head-manager-context.shared-runtime */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/route-modules/pages/vendored/contexts/head-manager-context.js");
const _ampmode = __webpack_require__(/*! ./amp-mode */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/amp-mode.js");
const _warnonce = __webpack_require__(/*! ./utils/warn-once */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js");
function defaultHead(inAmpMode) {
    if (inAmpMode === void 0) inAmpMode = false;
    const head = [
        /*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
            charSet: "utf-8"
        })
    ];
    if (!inAmpMode) {
        head.push(/*#__PURE__*/ (0, _jsxruntime.jsx)("meta", {
            name: "viewport",
            content: "width=device-width"
        }));
    }
    return head;
}
function onlyReactElement(list, child) {
    // React children can be "string" or "number" in this case we ignore them for backwards compat
    if (typeof child === "string" || typeof child === "number") {
        return list;
    }
    // Adds support for React.Fragment
    if (child.type === _react.default.Fragment) {
        return list.concat(_react.default.Children.toArray(child.props.children).reduce((fragmentList, fragmentChild)=>{
            if (typeof fragmentChild === "string" || typeof fragmentChild === "number") {
                return fragmentList;
            }
            return fragmentList.concat(fragmentChild);
        }, []));
    }
    return list.concat(child);
}
const METATYPES = [
    "name",
    "httpEquiv",
    "charSet",
    "itemProp"
];
/*
 returns a function for filtering head child elements
 which shouldn't be duplicated, like <title/>
 Also adds support for deduplicated `key` properties
*/ function unique() {
    const keys = new Set();
    const tags = new Set();
    const metaTypes = new Set();
    const metaCategories = {};
    return (h)=>{
        let isUnique = true;
        let hasKey = false;
        if (h.key && typeof h.key !== "number" && h.key.indexOf("$") > 0) {
            hasKey = true;
            const key = h.key.slice(h.key.indexOf("$") + 1);
            if (keys.has(key)) {
                isUnique = false;
            } else {
                keys.add(key);
            }
        }
        // eslint-disable-next-line default-case
        switch(h.type){
            case "title":
            case "base":
                if (tags.has(h.type)) {
                    isUnique = false;
                } else {
                    tags.add(h.type);
                }
                break;
            case "meta":
                for(let i = 0, len = METATYPES.length; i < len; i++){
                    const metatype = METATYPES[i];
                    if (!h.props.hasOwnProperty(metatype)) continue;
                    if (metatype === "charSet") {
                        if (metaTypes.has(metatype)) {
                            isUnique = false;
                        } else {
                            metaTypes.add(metatype);
                        }
                    } else {
                        const category = h.props[metatype];
                        const categories = metaCategories[metatype] || new Set();
                        if ((metatype !== "name" || !hasKey) && categories.has(category)) {
                            isUnique = false;
                        } else {
                            categories.add(category);
                            metaCategories[metatype] = categories;
                        }
                    }
                }
                break;
        }
        return isUnique;
    };
}
/**
 *
 * @param headChildrenElements List of children of <Head>
 */ function reduceComponents(headChildrenElements, props) {
    const { inAmpMode } = props;
    return headChildrenElements.reduce(onlyReactElement, []).reverse().concat(defaultHead(inAmpMode).reverse()).filter(unique()).reverse().map((c, i)=>{
        const key = c.key || i;
        if (false) {}
        if (true) {
            // omit JSON-LD structured data snippets from the warning
            if (c.type === "script" && c.props["type"] !== "application/ld+json") {
                const srcMessage = c.props["src"] ? '<script> tag with src="' + c.props["src"] + '"' : "inline <script>";
                (0, _warnonce.warnOnce)("Do not add <script> tags using next/head (see " + srcMessage + "). Use next/script instead. \nSee more info here: https://nextjs.org/docs/messages/no-script-tags-in-head-component");
            } else if (c.type === "link" && c.props["rel"] === "stylesheet") {
                (0, _warnonce.warnOnce)('Do not add stylesheets using next/head (see <link rel="stylesheet"> tag with href="' + c.props["href"] + '"). Use Document instead. \nSee more info here: https://nextjs.org/docs/messages/no-stylesheets-in-head-component');
            }
        }
        return /*#__PURE__*/ _react.default.cloneElement(c, {
            key
        });
    });
}
/**
 * This component injects elements to `<head>` of your page.
 * To avoid duplicated `tags` in `<head>` you can use the `key` property, which will make sure every tag is only rendered once.
 */ function Head(param) {
    let { children } = param;
    const ampState = (0, _react.useContext)(_ampcontextsharedruntime.AmpStateContext);
    const headManager = (0, _react.useContext)(_headmanagercontextsharedruntime.HeadManagerContext);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)(_sideeffect.default, {
        reduceComponentsToState: reduceComponents,
        headManager: headManager,
        inAmpMode: (0, _ampmode.isInAmpMode)(ampState),
        children: children
    });
}
const _default = Head;
if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
    Object.defineProperty(exports.default, "__esModule", {
        value: true
    });
    Object.assign(exports.default, exports);
    module.exports = exports.default;
} //# sourceMappingURL=head.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js":
/*!**************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js ***!
  \**************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "normalizeLocalePath", ({
    enumerable: true,
    get: function() {
        return normalizeLocalePath;
    }
}));
function normalizeLocalePath(pathname, locales) {
    let detectedLocale;
    // first item will be empty string from splitting at first char
    const pathnameParts = pathname.split("/");
    (locales || []).some((locale)=>{
        if (pathnameParts[1] && pathnameParts[1].toLowerCase() === locale.toLowerCase()) {
            detectedLocale = locale;
            pathnameParts.splice(1, 1);
            pathname = pathnameParts.join("/") || "/";
            return true;
        }
        return false;
    });
    return {
        pathname,
        detectedLocale
    };
} //# sourceMappingURL=normalize-locale-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-blur-svg.js":
/*!**************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-blur-svg.js ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * A shared function, used on both client and server, to generate a SVG blur placeholder.
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getImageBlurSvg", ({
    enumerable: true,
    get: function() {
        return getImageBlurSvg;
    }
}));
function getImageBlurSvg(param) {
    let { widthInt, heightInt, blurWidth, blurHeight, blurDataURL, objectFit } = param;
    const std = 20;
    const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
    const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
    const viewBox = svgWidth && svgHeight ? "viewBox='0 0 " + svgWidth + " " + svgHeight + "'" : "";
    const preserveAspectRatio = viewBox ? "none" : objectFit === "contain" ? "xMidYMid" : objectFit === "cover" ? "xMidYMid slice" : "none";
    return "%3Csvg xmlns='http://www.w3.org/2000/svg' " + viewBox + "%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='" + std + "'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='" + preserveAspectRatio + "' style='filter: url(%23b);' href='" + blurDataURL + "'/%3E%3C/svg%3E";
} //# sourceMappingURL=image-blur-svg.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-config.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-config.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    VALID_LOADERS: function() {
        return VALID_LOADERS;
    },
    imageConfigDefault: function() {
        return imageConfigDefault;
    }
});
const VALID_LOADERS = [
    "default",
    "imgix",
    "cloudinary",
    "akamai",
    "custom"
];
const imageConfigDefault = {
    deviceSizes: [
        640,
        750,
        828,
        1080,
        1200,
        1920,
        2048,
        3840
    ],
    imageSizes: [
        16,
        32,
        48,
        64,
        96,
        128,
        256,
        384
    ],
    path: "/_next/image",
    loader: "default",
    loaderFile: "",
    domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: [
        "image/webp"
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
    contentDispositionType: "inline",
    localPatterns: undefined,
    remotePatterns: [],
    unoptimized: false
}; //# sourceMappingURL=image-config.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-external.js":
/*!**************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-external.js ***!
  \**************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    getImageProps: function() {
        return getImageProps;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _getimgprops = __webpack_require__(/*! ./get-img-props */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/get-img-props.js");
const _imagecomponent = __webpack_require__(/*! ../../client/image-component */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/image-component.js");
const _imageloader = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! next/dist/shared/lib/image-loader */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-loader.js"));
function getImageProps(imgProps) {
    const { props } = (0, _getimgprops.getImgProps)(imgProps, {
        defaultLoader: _imageloader.default,
        // This is replaced by webpack define plugin
        imgConf: {"deviceSizes":[640,750,828,1080,1200,1920,2048,3840],"imageSizes":[16,32,48,64,96,128,256,384],"path":"/_next/image","loader":"default","dangerouslyAllowSVG":false,"unoptimized":false,"domains":[],"remotePatterns":[]}
    });
    // Normally we don't care about undefined props because we pass to JSX,
    // but this exported function could be used by the end user for anything
    // so we delete undefined props to clean it up a little.
    for (const [key, value] of Object.entries(props)){
        if (value === undefined) {
            delete props[key];
        }
    }
    return {
        props
    };
}
const _default = _imagecomponent.Image; //# sourceMappingURL=image-external.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-loader.js":
/*!************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-loader.js ***!
  \************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return _default;
    }
}));
function defaultLoader(param) {
    let { config, src, width, quality } = param;
    if (true) {
        const missingValues = [];
        // these should always be provided but make sure they are
        if (!src) missingValues.push("src");
        if (!width) missingValues.push("width");
        if (missingValues.length > 0) {
            throw new Error("Next Image Optimization requires " + missingValues.join(", ") + " to be provided. Make sure you pass them as props to the `next/image` component. Received: " + JSON.stringify({
                src,
                width,
                quality
            }));
        }
        if (src.startsWith("//")) {
            throw new Error('Failed to parse src "' + src + '" on `next/image`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)');
        }
        if (src.startsWith("/") && config.localPatterns) {
            if (true) {
                // We use dynamic require because this should only error in development
                const { hasLocalMatch } = __webpack_require__(/*! ./match-local-pattern */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-local-pattern.js");
                if (!hasLocalMatch(config.localPatterns, src)) {
                    throw new Error("Invalid src prop (" + src + ") on `next/image` does not match `images.localPatterns` configured in your `next.config.js`\n" + "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns");
                }
            }
        }
        if (!src.startsWith("/") && (config.domains || config.remotePatterns)) {
            let parsedSrc;
            try {
                parsedSrc = new URL(src);
            } catch (err) {
                console.error(err);
                throw new Error('Failed to parse src "' + src + '" on `next/image`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)');
            }
            if (true) {
                // We use dynamic require because this should only error in development
                const { hasRemoteMatch } = __webpack_require__(/*! ./match-remote-pattern */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-remote-pattern.js");
                if (!hasRemoteMatch(config.domains, config.remotePatterns, parsedSrc)) {
                    throw new Error("Invalid src prop (" + src + ') on `next/image`, hostname "' + parsedSrc.hostname + '" is not configured under images in your `next.config.js`\n' + "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host");
                }
            }
        }
    }
    return config.path + "?url=" + encodeURIComponent(src) + "&w=" + width + "&q=" + (quality || 75) + ( false ? 0 : "");
}
// We use this to determine if the import is the default loader
// or a custom loader defined by the user in next.config.js
defaultLoader.__next_img_default = true;
const _default = defaultLoader; //# sourceMappingURL=image-loader.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/is-plain-object.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/is-plain-object.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getObjectClassLabel: function() {
        return getObjectClassLabel;
    },
    isPlainObject: function() {
        return isPlainObject;
    }
});
function getObjectClassLabel(value) {
    return Object.prototype.toString.call(value);
}
function isPlainObject(value) {
    if (getObjectClassLabel(value) !== "[object Object]") {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    /**
   * this used to be previously:
   *
   * `return prototype === null || prototype === Object.prototype`
   *
   * but Edge Runtime expose Object from vm, being that kind of type-checking wrongly fail.
   *
   * It was changed to the current implementation since it's resilient to serialization.
   */ return prototype === null || prototype.hasOwnProperty("isPrototypeOf");
} //# sourceMappingURL=is-plain-object.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-local-pattern.js":
/*!*******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-local-pattern.js ***!
  \*******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    hasLocalMatch: function() {
        return hasLocalMatch;
    },
    matchLocalPattern: function() {
        return matchLocalPattern;
    }
});
const _picomatch = __webpack_require__(/*! next/dist/compiled/picomatch */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/picomatch/index.js");
function matchLocalPattern(pattern, url) {
    if (pattern.search !== undefined) {
        if (pattern.search !== url.search) {
            return false;
        }
    }
    var _pattern_pathname;
    if (!(0, _picomatch.makeRe)((_pattern_pathname = pattern.pathname) != null ? _pattern_pathname : "**", {
        dot: true
    }).test(url.pathname)) {
        return false;
    }
    return true;
}
function hasLocalMatch(localPatterns, urlPathAndQuery) {
    if (!localPatterns) {
        // if the user didn't define "localPatterns", we allow all local images
        return true;
    }
    const url = new URL(urlPathAndQuery, "http://n");
    return localPatterns.some((p)=>matchLocalPattern(p, url));
} //# sourceMappingURL=match-local-pattern.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-remote-pattern.js":
/*!********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/match-remote-pattern.js ***!
  \********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    hasRemoteMatch: function() {
        return hasRemoteMatch;
    },
    matchRemotePattern: function() {
        return matchRemotePattern;
    }
});
const _picomatch = __webpack_require__(/*! next/dist/compiled/picomatch */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/picomatch/index.js");
function matchRemotePattern(pattern, url) {
    if (pattern.protocol !== undefined) {
        const actualProto = url.protocol.slice(0, -1);
        if (pattern.protocol !== actualProto) {
            return false;
        }
    }
    if (pattern.port !== undefined) {
        if (pattern.port !== url.port) {
            return false;
        }
    }
    if (pattern.hostname === undefined) {
        throw new Error("Pattern should define hostname but found\n" + JSON.stringify(pattern));
    } else {
        if (!(0, _picomatch.makeRe)(pattern.hostname).test(url.hostname)) {
            return false;
        }
    }
    if (pattern.search !== undefined) {
        if (pattern.search !== url.search) {
            return false;
        }
    }
    var _pattern_pathname;
    // Should be the same as writeImagesManifest()
    if (!(0, _picomatch.makeRe)((_pattern_pathname = pattern.pathname) != null ? _pattern_pathname : "**", {
        dot: true
    }).test(url.pathname)) {
        return false;
    }
    return true;
}
function hasRemoteMatch(domains, remotePatterns, url) {
    return domains.some((domain)=>url.hostname === domain) || remotePatterns.some((p)=>matchRemotePattern(p, url));
} //# sourceMappingURL=match-remote-pattern.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/mitt.js":
/*!****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/mitt.js ***!
  \****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
MIT License

Copyright (c) Jason Miller (https://jasonformat.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/ // This file is based on https://github.com/developit/mitt/blob/v1.1.3/src/index.js
// It's been edited for the needs of this script
// See the LICENSE at the top of the file

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return mitt;
    }
}));
function mitt() {
    const all = Object.create(null);
    return {
        on (type, handler) {
            (all[type] || (all[type] = [])).push(handler);
        },
        off (type, handler) {
            if (all[type]) {
                all[type].splice(all[type].indexOf(handler) >>> 0, 1);
            }
        },
        emit (type) {
            for(var _len = arguments.length, evts = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                evts[_key - 1] = arguments[_key];
            }
            (all[type] || []).slice().map((handler)=>{
                handler(...evts);
            });
        }
    };
} //# sourceMappingURL=mitt.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/denormalize-page-path.js":
/*!*******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/denormalize-page-path.js ***!
  \*******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "denormalizePagePath", ({
    enumerable: true,
    get: function() {
        return denormalizePagePath;
    }
}));
const _utils = __webpack_require__(/*! ../router/utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/index.js");
const _normalizepathsep = __webpack_require__(/*! ./normalize-path-sep */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/normalize-path-sep.js");
function denormalizePagePath(page) {
    let _page = (0, _normalizepathsep.normalizePathSep)(page);
    return _page.startsWith("/index/") && !(0, _utils.isDynamicRoute)(_page) ? _page.slice(6) : _page !== "/index" ? _page : "/";
} //# sourceMappingURL=denormalize-page-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/ensure-leading-slash.js":
/*!******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/ensure-leading-slash.js ***!
  \******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * For a given page path, this function ensures that there is a leading slash.
 * If there is not a leading slash, one is added, otherwise it is noop.
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "ensureLeadingSlash", ({
    enumerable: true,
    get: function() {
        return ensureLeadingSlash;
    }
}));
function ensureLeadingSlash(path) {
    return path.startsWith("/") ? path : "/" + path;
} //# sourceMappingURL=ensure-leading-slash.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/normalize-path-sep.js":
/*!****************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/normalize-path-sep.js ***!
  \****************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * For a given page path, this function ensures that there is no backslash
 * escaping slashes in the path. Example:
 *  - `foo\/bar\/baz` -> `foo/bar/baz`
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "normalizePathSep", ({
    enumerable: true,
    get: function() {
        return normalizePathSep;
    }
}));
function normalizePathSep(path) {
    return path.replace(/\\/g, "/");
} //# sourceMappingURL=normalize-path-sep.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/router.js":
/*!*************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/router.js ***!
  \*************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// tslint:disable:no-console

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    createKey: function() {
        return createKey;
    },
    default: function() {
        return Router;
    },
    matchesMiddleware: function() {
        return matchesMiddleware;
    }
});
const _interop_require_default = __webpack_require__(/*! @swc/helpers/_/_interop_require_default */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_default.cjs");
const _interop_require_wildcard = __webpack_require__(/*! @swc/helpers/_/_interop_require_wildcard */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs");
const _removetrailingslash = __webpack_require__(/*! ./utils/remove-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js");
const _routeloader = __webpack_require__(/*! ../../../client/route-loader */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/route-loader.js");
const _script = __webpack_require__(/*! ../../../client/script */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/script.js");
const _iserror = /*#__PURE__*/ _interop_require_wildcard._(__webpack_require__(/*! ../../../lib/is-error */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-error.js"));
const _denormalizepagepath = __webpack_require__(/*! ../page-path/denormalize-page-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/denormalize-page-path.js");
const _normalizelocalepath = __webpack_require__(/*! ../i18n/normalize-locale-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js");
const _mitt = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ../mitt */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/mitt.js"));
const _utils = __webpack_require__(/*! ../utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
const _isdynamic = __webpack_require__(/*! ./utils/is-dynamic */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-dynamic.js");
const _parserelativeurl = __webpack_require__(/*! ./utils/parse-relative-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-relative-url.js");
const _resolverewrites = /*#__PURE__*/ _interop_require_default._(__webpack_require__(/*! ./utils/resolve-rewrites */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/resolve-rewrites.js"));
const _routematcher = __webpack_require__(/*! ./utils/route-matcher */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-matcher.js");
const _routeregex = __webpack_require__(/*! ./utils/route-regex */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-regex.js");
const _formaturl = __webpack_require__(/*! ./utils/format-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-url.js");
const _detectdomainlocale = __webpack_require__(/*! ../../../client/detect-domain-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/detect-domain-locale.js");
const _parsepath = __webpack_require__(/*! ./utils/parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
const _addlocale = __webpack_require__(/*! ../../../client/add-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-locale.js");
const _removelocale = __webpack_require__(/*! ../../../client/remove-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-locale.js");
const _removebasepath = __webpack_require__(/*! ../../../client/remove-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-base-path.js");
const _addbasepath = __webpack_require__(/*! ../../../client/add-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/add-base-path.js");
const _hasbasepath = __webpack_require__(/*! ../../../client/has-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/has-base-path.js");
const _resolvehref = __webpack_require__(/*! ../../../client/resolve-href */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/resolve-href.js");
const _isapiroute = __webpack_require__(/*! ../../../lib/is-api-route */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/lib/is-api-route.js");
const _getnextpathnameinfo = __webpack_require__(/*! ./utils/get-next-pathname-info */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-next-pathname-info.js");
const _formatnextpathnameinfo = __webpack_require__(/*! ./utils/format-next-pathname-info */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-next-pathname-info.js");
const _comparestates = __webpack_require__(/*! ./utils/compare-states */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/compare-states.js");
const _islocalurl = __webpack_require__(/*! ./utils/is-local-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-local-url.js");
const _isbot = __webpack_require__(/*! ./utils/is-bot */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-bot.js");
const _omit = __webpack_require__(/*! ./utils/omit */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/omit.js");
const _interpolateas = __webpack_require__(/*! ./utils/interpolate-as */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/interpolate-as.js");
const _handlesmoothscroll = __webpack_require__(/*! ./utils/handle-smooth-scroll */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/handle-smooth-scroll.js");
function buildCancellationError() {
    return Object.assign(new Error("Route Cancelled"), {
        cancelled: true
    });
}
async function matchesMiddleware(options) {
    const matchers = await Promise.resolve(options.router.pageLoader.getMiddleware());
    if (!matchers) return false;
    const { pathname: asPathname } = (0, _parsepath.parsePath)(options.asPath);
    // remove basePath first since path prefix has to be in the order of `/${basePath}/${locale}`
    const cleanedAs = (0, _hasbasepath.hasBasePath)(asPathname) ? (0, _removebasepath.removeBasePath)(asPathname) : asPathname;
    const asWithBasePathAndLocale = (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(cleanedAs, options.locale));
    // Check only path match on client. Matching "has" should be done on server
    // where we can access more info such as headers, HttpOnly cookie, etc.
    return matchers.some((m)=>new RegExp(m.regexp).test(asWithBasePathAndLocale));
}
function stripOrigin(url) {
    const origin = (0, _utils.getLocationOrigin)();
    return url.startsWith(origin) ? url.substring(origin.length) : url;
}
function prepareUrlAs(router, url, as) {
    // If url and as provided as an object representation,
    // we'll format them into the string version here.
    let [resolvedHref, resolvedAs] = (0, _resolvehref.resolveHref)(router, url, true);
    const origin = (0, _utils.getLocationOrigin)();
    const hrefWasAbsolute = resolvedHref.startsWith(origin);
    const asWasAbsolute = resolvedAs && resolvedAs.startsWith(origin);
    resolvedHref = stripOrigin(resolvedHref);
    resolvedAs = resolvedAs ? stripOrigin(resolvedAs) : resolvedAs;
    const preparedUrl = hrefWasAbsolute ? resolvedHref : (0, _addbasepath.addBasePath)(resolvedHref);
    const preparedAs = as ? stripOrigin((0, _resolvehref.resolveHref)(router, as)) : resolvedAs || resolvedHref;
    return {
        url: preparedUrl,
        as: asWasAbsolute ? preparedAs : (0, _addbasepath.addBasePath)(preparedAs)
    };
}
function resolveDynamicRoute(pathname, pages) {
    const cleanPathname = (0, _removetrailingslash.removeTrailingSlash)((0, _denormalizepagepath.denormalizePagePath)(pathname));
    if (cleanPathname === "/404" || cleanPathname === "/_error") {
        return pathname;
    }
    // handle resolving href for dynamic routes
    if (!pages.includes(cleanPathname)) {
        // eslint-disable-next-line array-callback-return
        pages.some((page)=>{
            if ((0, _isdynamic.isDynamicRoute)(page) && (0, _routeregex.getRouteRegex)(page).re.test(cleanPathname)) {
                pathname = page;
                return true;
            }
        });
    }
    return (0, _removetrailingslash.removeTrailingSlash)(pathname);
}
function getMiddlewareData(source, response, options) {
    const nextConfig = {
        basePath: options.router.basePath,
        i18n: {
            locales: options.router.locales
        },
        trailingSlash: Boolean(false)
    };
    const rewriteHeader = response.headers.get("x-nextjs-rewrite");
    let rewriteTarget = rewriteHeader || response.headers.get("x-nextjs-matched-path");
    const matchedPath = response.headers.get("x-matched-path");
    if (matchedPath && !rewriteTarget && !matchedPath.includes("__next_data_catchall") && !matchedPath.includes("/_error") && !matchedPath.includes("/404")) {
        // leverage x-matched-path to detect next.config.js rewrites
        rewriteTarget = matchedPath;
    }
    if (rewriteTarget) {
        if (rewriteTarget.startsWith("/") || false) {
            const parsedRewriteTarget = (0, _parserelativeurl.parseRelativeUrl)(rewriteTarget);
            const pathnameInfo = (0, _getnextpathnameinfo.getNextPathnameInfo)(parsedRewriteTarget.pathname, {
                nextConfig,
                parseData: true
            });
            let fsPathname = (0, _removetrailingslash.removeTrailingSlash)(pathnameInfo.pathname);
            return Promise.all([
                options.router.pageLoader.getPageList(),
                (0, _routeloader.getClientBuildManifest)()
            ]).then((param)=>{
                let [pages, { __rewrites: rewrites }] = param;
                let as = (0, _addlocale.addLocale)(pathnameInfo.pathname, pathnameInfo.locale);
                if ((0, _isdynamic.isDynamicRoute)(as) || !rewriteHeader && pages.includes((0, _normalizelocalepath.normalizeLocalePath)((0, _removebasepath.removeBasePath)(as), options.router.locales).pathname)) {
                    const parsedSource = (0, _getnextpathnameinfo.getNextPathnameInfo)((0, _parserelativeurl.parseRelativeUrl)(source).pathname, {
                        nextConfig:  false ? 0 : nextConfig,
                        parseData: true
                    });
                    as = (0, _addbasepath.addBasePath)(parsedSource.pathname);
                    parsedRewriteTarget.pathname = as;
                }
                if (false) {} else if (!pages.includes(fsPathname)) {
                    const resolvedPathname = resolveDynamicRoute(fsPathname, pages);
                    if (resolvedPathname !== fsPathname) {
                        fsPathname = resolvedPathname;
                    }
                }
                const resolvedHref = !pages.includes(fsPathname) ? resolveDynamicRoute((0, _normalizelocalepath.normalizeLocalePath)((0, _removebasepath.removeBasePath)(parsedRewriteTarget.pathname), options.router.locales).pathname, pages) : fsPathname;
                if ((0, _isdynamic.isDynamicRoute)(resolvedHref)) {
                    const matches = (0, _routematcher.getRouteMatcher)((0, _routeregex.getRouteRegex)(resolvedHref))(as);
                    Object.assign(parsedRewriteTarget.query, matches || {});
                }
                return {
                    type: "rewrite",
                    parsedAs: parsedRewriteTarget,
                    resolvedHref
                };
            });
        }
        const src = (0, _parsepath.parsePath)(source);
        const pathname = (0, _formatnextpathnameinfo.formatNextPathnameInfo)({
            ...(0, _getnextpathnameinfo.getNextPathnameInfo)(src.pathname, {
                nextConfig,
                parseData: true
            }),
            defaultLocale: options.router.defaultLocale,
            buildId: ""
        });
        return Promise.resolve({
            type: "redirect-external",
            destination: "" + pathname + src.query + src.hash
        });
    }
    const redirectTarget = response.headers.get("x-nextjs-redirect");
    if (redirectTarget) {
        if (redirectTarget.startsWith("/")) {
            const src = (0, _parsepath.parsePath)(redirectTarget);
            const pathname = (0, _formatnextpathnameinfo.formatNextPathnameInfo)({
                ...(0, _getnextpathnameinfo.getNextPathnameInfo)(src.pathname, {
                    nextConfig,
                    parseData: true
                }),
                defaultLocale: options.router.defaultLocale,
                buildId: ""
            });
            return Promise.resolve({
                type: "redirect-internal",
                newAs: "" + pathname + src.query + src.hash,
                newUrl: "" + pathname + src.query + src.hash
            });
        }
        return Promise.resolve({
            type: "redirect-external",
            destination: redirectTarget
        });
    }
    return Promise.resolve({
        type: "next"
    });
}
async function withMiddlewareEffects(options) {
    const matches = await matchesMiddleware(options);
    if (!matches || !options.fetchData) {
        return null;
    }
    const data = await options.fetchData();
    const effect = await getMiddlewareData(data.dataHref, data.response, options);
    return {
        dataHref: data.dataHref,
        json: data.json,
        response: data.response,
        text: data.text,
        cacheKey: data.cacheKey,
        effect
    };
}
const manualScrollRestoration =  false && 0;
const SSG_DATA_NOT_FOUND = Symbol("SSG_DATA_NOT_FOUND");
function fetchRetry(url, attempts, options) {
    return fetch(url, {
        // Cookies are required to be present for Next.js' SSG "Preview Mode".
        // Cookies may also be required for `getServerSideProps`.
        //
        // > `fetch` won’t send cookies, unless you set the credentials init
        // > option.
        // https://developer.mozilla.org/docs/Web/API/Fetch_API/Using_Fetch
        //
        // > For maximum browser compatibility when it comes to sending &
        // > receiving cookies, always supply the `credentials: 'same-origin'`
        // > option instead of relying on the default.
        // https://github.com/github/fetch#caveats
        credentials: "same-origin",
        method: options.method || "GET",
        headers: Object.assign({}, options.headers, {
            "x-nextjs-data": "1"
        })
    }).then((response)=>{
        return !response.ok && attempts > 1 && response.status >= 500 ? fetchRetry(url, attempts - 1, options) : response;
    });
}
function tryToParseAsJSON(text) {
    try {
        return JSON.parse(text);
    } catch (error) {
        return null;
    }
}
function fetchNextData(param) {
    let { dataHref, inflightCache, isPrefetch, hasMiddleware, isServerRender, parseJSON, persistCache, isBackground, unstable_skipClientCache } = param;
    const { href: cacheKey } = new URL(dataHref, window.location.href);
    const getData = (params)=>{
        var _params_method;
        return fetchRetry(dataHref, isServerRender ? 3 : 1, {
            headers: Object.assign({}, isPrefetch ? {
                purpose: "prefetch"
            } : {}, isPrefetch && hasMiddleware ? {
                "x-middleware-prefetch": "1"
            } : {}),
            method: (_params_method = params == null ? void 0 : params.method) != null ? _params_method : "GET"
        }).then((response)=>{
            if (response.ok && (params == null ? void 0 : params.method) === "HEAD") {
                return {
                    dataHref,
                    response,
                    text: "",
                    json: {},
                    cacheKey
                };
            }
            return response.text().then((text)=>{
                if (!response.ok) {
                    /**
             * When the data response is a redirect because of a middleware
             * we do not consider it an error. The headers must bring the
             * mapped location.
             * TODO: Change the status code in the handler.
             */ if (hasMiddleware && [
                        301,
                        302,
                        307,
                        308
                    ].includes(response.status)) {
                        return {
                            dataHref,
                            response,
                            text,
                            json: {},
                            cacheKey
                        };
                    }
                    if (response.status === 404) {
                        var _tryToParseAsJSON;
                        if ((_tryToParseAsJSON = tryToParseAsJSON(text)) == null ? void 0 : _tryToParseAsJSON.notFound) {
                            return {
                                dataHref,
                                json: {
                                    notFound: SSG_DATA_NOT_FOUND
                                },
                                response,
                                text,
                                cacheKey
                            };
                        }
                    }
                    const error = new Error("Failed to load static props");
                    /**
             * We should only trigger a server-side transition if this was
             * caused on a client-side transition. Otherwise, we'd get into
             * an infinite loop.
             */ if (!isServerRender) {
                        (0, _routeloader.markAssetError)(error);
                    }
                    throw error;
                }
                return {
                    dataHref,
                    json: parseJSON ? tryToParseAsJSON(text) : null,
                    response,
                    text,
                    cacheKey
                };
            });
        }).then((data)=>{
            if (!persistCache || "development" !== "production" || 0) {
                delete inflightCache[cacheKey];
            }
            return data;
        }).catch((err)=>{
            if (!unstable_skipClientCache) {
                delete inflightCache[cacheKey];
            }
            if (err.message === "Failed to fetch" || // firefox
            err.message === "NetworkError when attempting to fetch resource." || // safari
            err.message === "Load failed") {
                (0, _routeloader.markAssetError)(err);
            }
            throw err;
        });
    };
    // when skipping client cache we wait to update
    // inflight cache until successful data response
    // this allows racing click event with fetching newer data
    // without blocking navigation when stale data is available
    if (unstable_skipClientCache && persistCache) {
        return getData({}).then((data)=>{
            if (data.response.headers.get("x-middleware-cache") !== "no-cache") {
                // only update cache if not marked as no-cache
                inflightCache[cacheKey] = Promise.resolve(data);
            }
            return data;
        });
    }
    if (inflightCache[cacheKey] !== undefined) {
        return inflightCache[cacheKey];
    }
    return inflightCache[cacheKey] = getData(isBackground ? {
        method: "HEAD"
    } : {});
}
function createKey() {
    return Math.random().toString(36).slice(2, 10);
}
function handleHardNavigation(param) {
    let { url, router } = param;
    // ensure we don't trigger a hard navigation to the same
    // URL as this can end up with an infinite refresh
    if (url === (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(router.asPath, router.locale))) {
        throw new Error("Invariant: attempted to hard navigate to the same URL " + url + " " + location.href);
    }
    window.location.href = url;
}
const getCancelledHandler = (param)=>{
    let { route, router } = param;
    let cancelled = false;
    const cancel = router.clc = ()=>{
        cancelled = true;
    };
    const handleCancelled = ()=>{
        if (cancelled) {
            const error = new Error('Abort fetching component for route: "' + route + '"');
            error.cancelled = true;
            throw error;
        }
        if (cancel === router.clc) {
            router.clc = null;
        }
    };
    return handleCancelled;
};
class Router {
    reload() {
        window.location.reload();
    }
    /**
   * Go back in history
   */ back() {
        window.history.back();
    }
    /**
   * Go forward in history
   */ forward() {
        window.history.forward();
    }
    /**
   * Performs a `pushState` with arguments
   * @param url of the route
   * @param as masks `url` for the browser
   * @param options object you can define `shallow` and other options
   */ push(url, as, options) {
        if (options === void 0) options = {};
        if (false) {}
        ({ url, as } = prepareUrlAs(this, url, as));
        return this.change("pushState", url, as, options);
    }
    /**
   * Performs a `replaceState` with arguments
   * @param url of the route
   * @param as masks `url` for the browser
   * @param options object you can define `shallow` and other options
   */ replace(url, as, options) {
        if (options === void 0) options = {};
        ({ url, as } = prepareUrlAs(this, url, as));
        return this.change("replaceState", url, as, options);
    }
    async _bfl(as, resolvedAs, locale, skipNavigate) {
        if (true) {
            let matchesBflStatic = false;
            let matchesBflDynamic = false;
            for (const curAs of [
                as,
                resolvedAs
            ]){
                if (curAs) {
                    const asNoSlash = (0, _removetrailingslash.removeTrailingSlash)(new URL(curAs, "http://n").pathname);
                    const asNoSlashLocale = (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(asNoSlash, locale || this.locale));
                    if (asNoSlash !== (0, _removetrailingslash.removeTrailingSlash)(new URL(this.asPath, "http://n").pathname)) {
                        var _this__bfl_s, _this__bfl_s1;
                        matchesBflStatic = matchesBflStatic || !!((_this__bfl_s = this._bfl_s) == null ? void 0 : _this__bfl_s.contains(asNoSlash)) || !!((_this__bfl_s1 = this._bfl_s) == null ? void 0 : _this__bfl_s1.contains(asNoSlashLocale));
                        for (const normalizedAS of [
                            asNoSlash,
                            asNoSlashLocale
                        ]){
                            // if any sub-path of as matches a dynamic filter path
                            // it should be hard navigated
                            const curAsParts = normalizedAS.split("/");
                            for(let i = 0; !matchesBflDynamic && i < curAsParts.length + 1; i++){
                                var _this__bfl_d;
                                const currentPart = curAsParts.slice(0, i).join("/");
                                if (currentPart && ((_this__bfl_d = this._bfl_d) == null ? void 0 : _this__bfl_d.contains(currentPart))) {
                                    matchesBflDynamic = true;
                                    break;
                                }
                            }
                        }
                        // if the client router filter is matched then we trigger
                        // a hard navigation
                        if (matchesBflStatic || matchesBflDynamic) {
                            if (skipNavigate) {
                                return true;
                            }
                            handleHardNavigation({
                                url: (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(as, locale || this.locale, this.defaultLocale)),
                                router: this
                            });
                            return new Promise(()=>{});
                        }
                    }
                }
            }
        }
        return false;
    }
    async change(method, url, as, options, forcedScroll) {
        var _this_components_pathname;
        if (!(0, _islocalurl.isLocalURL)(url)) {
            handleHardNavigation({
                url,
                router: this
            });
            return false;
        }
        // WARNING: `_h` is an internal option for handing Next.js client-side
        // hydration. Your app should _never_ use this property. It may change at
        // any time without notice.
        const isQueryUpdating = options._h === 1;
        if (!isQueryUpdating && !options.shallow) {
            await this._bfl(as, undefined, options.locale);
        }
        let shouldResolveHref = isQueryUpdating || options._shouldResolveHref || (0, _parsepath.parsePath)(url).pathname === (0, _parsepath.parsePath)(as).pathname;
        const nextState = {
            ...this.state
        };
        // for static pages with query params in the URL we delay
        // marking the router ready until after the query is updated
        // or a navigation has occurred
        const readyStateChange = this.isReady !== true;
        this.isReady = true;
        const isSsr = this.isSsr;
        if (!isQueryUpdating) {
            this.isSsr = false;
        }
        // if a route transition is already in progress before
        // the query updating is triggered ignore query updating
        if (isQueryUpdating && this.clc) {
            return false;
        }
        const prevLocale = nextState.locale;
        if (false) { var _this_locales; }
        // marking route changes as a navigation start entry
        if (_utils.ST) {
            performance.mark("routeChange");
        }
        const { shallow = false, scroll = true } = options;
        const routeProps = {
            shallow
        };
        if (this._inFlightRoute && this.clc) {
            if (!isSsr) {
                Router.events.emit("routeChangeError", buildCancellationError(), this._inFlightRoute, routeProps);
            }
            this.clc();
            this.clc = null;
        }
        as = (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)((0, _hasbasepath.hasBasePath)(as) ? (0, _removebasepath.removeBasePath)(as) : as, options.locale, this.defaultLocale));
        const cleanedAs = (0, _removelocale.removeLocale)((0, _hasbasepath.hasBasePath)(as) ? (0, _removebasepath.removeBasePath)(as) : as, nextState.locale);
        this._inFlightRoute = as;
        const localeChange = prevLocale !== nextState.locale;
        // If the url change is only related to a hash change
        // We should not proceed. We should only change the state.
        if (!isQueryUpdating && this.onlyAHashChange(cleanedAs) && !localeChange) {
            nextState.asPath = cleanedAs;
            Router.events.emit("hashChangeStart", as, routeProps);
            // TODO: do we need the resolved href when only a hash change?
            this.changeState(method, url, as, {
                ...options,
                scroll: false
            });
            if (scroll) {
                this.scrollToHash(cleanedAs);
            }
            try {
                await this.set(nextState, this.components[nextState.route], null);
            } catch (err) {
                if ((0, _iserror.default)(err) && err.cancelled) {
                    Router.events.emit("routeChangeError", err, cleanedAs, routeProps);
                }
                throw err;
            }
            Router.events.emit("hashChangeComplete", as, routeProps);
            return true;
        }
        let parsed = (0, _parserelativeurl.parseRelativeUrl)(url);
        let { pathname, query } = parsed;
        // The build manifest needs to be loaded before auto-static dynamic pages
        // get their query parameters to allow ensuring they can be parsed properly
        // when rewritten to
        let pages, rewrites;
        try {
            [pages, { __rewrites: rewrites }] = await Promise.all([
                this.pageLoader.getPageList(),
                (0, _routeloader.getClientBuildManifest)(),
                this.pageLoader.getMiddleware()
            ]);
        } catch (err) {
            // If we fail to resolve the page list or client-build manifest, we must
            // do a server-side transition:
            handleHardNavigation({
                url: as,
                router: this
            });
            return false;
        }
        // If asked to change the current URL we should reload the current page
        // (not location.reload() but reload getInitialProps and other Next.js stuffs)
        // We also need to set the method = replaceState always
        // as this should not go into the history (That's how browsers work)
        // We should compare the new asPath to the current asPath, not the url
        if (!this.urlIsNew(cleanedAs) && !localeChange) {
            method = "replaceState";
        }
        // we need to resolve the as value using rewrites for dynamic SSG
        // pages to allow building the data URL correctly
        let resolvedAs = as;
        // url and as should always be prefixed with basePath by this
        // point by either next/link or router.push/replace so strip the
        // basePath from the pathname to match the pages dir 1-to-1
        pathname = pathname ? (0, _removetrailingslash.removeTrailingSlash)((0, _removebasepath.removeBasePath)(pathname)) : pathname;
        let route = (0, _removetrailingslash.removeTrailingSlash)(pathname);
        const parsedAsPathname = as.startsWith("/") && (0, _parserelativeurl.parseRelativeUrl)(as).pathname;
        // if we detected the path as app route during prefetching
        // trigger hard navigation
        if ((_this_components_pathname = this.components[pathname]) == null ? void 0 : _this_components_pathname.__appRouter) {
            handleHardNavigation({
                url: as,
                router: this
            });
            return new Promise(()=>{});
        }
        const isMiddlewareRewrite = !!(parsedAsPathname && route !== parsedAsPathname && (!(0, _isdynamic.isDynamicRoute)(route) || !(0, _routematcher.getRouteMatcher)((0, _routeregex.getRouteRegex)(route))(parsedAsPathname)));
        // we don't attempt resolve asPath when we need to execute
        // middleware as the resolving will occur server-side
        const isMiddlewareMatch = !options.shallow && await matchesMiddleware({
            asPath: as,
            locale: nextState.locale,
            router: this
        });
        if (isQueryUpdating && isMiddlewareMatch) {
            shouldResolveHref = false;
        }
        if (shouldResolveHref && pathname !== "/_error") {
            options._shouldResolveHref = true;
            if (false) {} else {
                parsed.pathname = resolveDynamicRoute(pathname, pages);
                if (parsed.pathname !== pathname) {
                    pathname = parsed.pathname;
                    parsed.pathname = (0, _addbasepath.addBasePath)(pathname);
                    if (!isMiddlewareMatch) {
                        url = (0, _formaturl.formatWithValidation)(parsed);
                    }
                }
            }
        }
        if (!(0, _islocalurl.isLocalURL)(as)) {
            if (true) {
                throw new Error('Invalid href: "' + url + '" and as: "' + as + '", received relative href and external as' + "\nSee more info: https://nextjs.org/docs/messages/invalid-relative-url-external-as");
            }
            handleHardNavigation({
                url: as,
                router: this
            });
            return false;
        }
        resolvedAs = (0, _removelocale.removeLocale)((0, _removebasepath.removeBasePath)(resolvedAs), nextState.locale);
        route = (0, _removetrailingslash.removeTrailingSlash)(pathname);
        let routeMatch = false;
        if ((0, _isdynamic.isDynamicRoute)(route)) {
            const parsedAs = (0, _parserelativeurl.parseRelativeUrl)(resolvedAs);
            const asPathname = parsedAs.pathname;
            const routeRegex = (0, _routeregex.getRouteRegex)(route);
            routeMatch = (0, _routematcher.getRouteMatcher)(routeRegex)(asPathname);
            const shouldInterpolate = route === asPathname;
            const interpolatedAs = shouldInterpolate ? (0, _interpolateas.interpolateAs)(route, asPathname, query) : {};
            if (!routeMatch || shouldInterpolate && !interpolatedAs.result) {
                const missingParams = Object.keys(routeRegex.groups).filter((param)=>!query[param] && !routeRegex.groups[param].optional);
                if (missingParams.length > 0 && !isMiddlewareMatch) {
                    if (true) {
                        console.warn("" + (shouldInterpolate ? "Interpolating href" : "Mismatching `as` and `href`") + " failed to manually provide " + ("the params: " + missingParams.join(", ") + " in the `href`'s `query`"));
                    }
                    throw new Error((shouldInterpolate ? "The provided `href` (" + url + ") value is missing query values (" + missingParams.join(", ") + ") to be interpolated properly. " : "The provided `as` value (" + asPathname + ") is incompatible with the `href` value (" + route + "). ") + ("Read more: https://nextjs.org/docs/messages/" + (shouldInterpolate ? "href-interpolation-failed" : "incompatible-href-as")));
                }
            } else if (shouldInterpolate) {
                as = (0, _formaturl.formatWithValidation)(Object.assign({}, parsedAs, {
                    pathname: interpolatedAs.result,
                    query: (0, _omit.omit)(query, interpolatedAs.params)
                }));
            } else {
                // Merge params into `query`, overwriting any specified in search
                Object.assign(query, routeMatch);
            }
        }
        if (!isQueryUpdating) {
            Router.events.emit("routeChangeStart", as, routeProps);
        }
        const isErrorRoute = this.pathname === "/404" || this.pathname === "/_error";
        try {
            var _self___NEXT_DATA___props_pageProps, _self___NEXT_DATA___props, _routeInfo_props;
            let routeInfo = await this.getRouteInfo({
                route,
                pathname,
                query,
                as,
                resolvedAs,
                routeProps,
                locale: nextState.locale,
                isPreview: nextState.isPreview,
                hasMiddleware: isMiddlewareMatch,
                unstable_skipClientCache: options.unstable_skipClientCache,
                isQueryUpdating: isQueryUpdating && !this.isFallback,
                isMiddlewareRewrite
            });
            if (!isQueryUpdating && !options.shallow) {
                await this._bfl(as, "resolvedAs" in routeInfo ? routeInfo.resolvedAs : undefined, nextState.locale);
            }
            if ("route" in routeInfo && isMiddlewareMatch) {
                pathname = routeInfo.route || route;
                route = pathname;
                if (!routeProps.shallow) {
                    query = Object.assign({}, routeInfo.query || {}, query);
                }
                const cleanedParsedPathname = (0, _hasbasepath.hasBasePath)(parsed.pathname) ? (0, _removebasepath.removeBasePath)(parsed.pathname) : parsed.pathname;
                if (routeMatch && pathname !== cleanedParsedPathname) {
                    Object.keys(routeMatch).forEach((key)=>{
                        if (routeMatch && query[key] === routeMatch[key]) {
                            delete query[key];
                        }
                    });
                }
                if ((0, _isdynamic.isDynamicRoute)(pathname)) {
                    const prefixedAs = !routeProps.shallow && routeInfo.resolvedAs ? routeInfo.resolvedAs : (0, _addbasepath.addBasePath)((0, _addlocale.addLocale)(new URL(as, location.href).pathname, nextState.locale), true);
                    let rewriteAs = prefixedAs;
                    if ((0, _hasbasepath.hasBasePath)(rewriteAs)) {
                        rewriteAs = (0, _removebasepath.removeBasePath)(rewriteAs);
                    }
                    if (false) {}
                    const routeRegex = (0, _routeregex.getRouteRegex)(pathname);
                    const curRouteMatch = (0, _routematcher.getRouteMatcher)(routeRegex)(new URL(rewriteAs, location.href).pathname);
                    if (curRouteMatch) {
                        Object.assign(query, curRouteMatch);
                    }
                }
            }
            // If the routeInfo brings a redirect we simply apply it.
            if ("type" in routeInfo) {
                if (routeInfo.type === "redirect-internal") {
                    return this.change(method, routeInfo.newUrl, routeInfo.newAs, options);
                } else {
                    handleHardNavigation({
                        url: routeInfo.destination,
                        router: this
                    });
                    return new Promise(()=>{});
                }
            }
            const component = routeInfo.Component;
            if (component && component.unstable_scriptLoader) {
                const scripts = [].concat(component.unstable_scriptLoader());
                scripts.forEach((script)=>{
                    (0, _script.handleClientScriptLoad)(script.props);
                });
            }
            // handle redirect on client-transition
            if ((routeInfo.__N_SSG || routeInfo.__N_SSP) && routeInfo.props) {
                if (routeInfo.props.pageProps && routeInfo.props.pageProps.__N_REDIRECT) {
                    // Use the destination from redirect without adding locale
                    options.locale = false;
                    const destination = routeInfo.props.pageProps.__N_REDIRECT;
                    // check if destination is internal (resolves to a page) and attempt
                    // client-navigation if it is falling back to hard navigation if
                    // it's not
                    if (destination.startsWith("/") && routeInfo.props.pageProps.__N_REDIRECT_BASE_PATH !== false) {
                        const parsedHref = (0, _parserelativeurl.parseRelativeUrl)(destination);
                        parsedHref.pathname = resolveDynamicRoute(parsedHref.pathname, pages);
                        const { url: newUrl, as: newAs } = prepareUrlAs(this, destination, destination);
                        return this.change(method, newUrl, newAs, options);
                    }
                    handleHardNavigation({
                        url: destination,
                        router: this
                    });
                    return new Promise(()=>{});
                }
                nextState.isPreview = !!routeInfo.props.__N_PREVIEW;
                // handle SSG data 404
                if (routeInfo.props.notFound === SSG_DATA_NOT_FOUND) {
                    let notFoundRoute;
                    try {
                        await this.fetchComponent("/404");
                        notFoundRoute = "/404";
                    } catch (_) {
                        notFoundRoute = "/_error";
                    }
                    routeInfo = await this.getRouteInfo({
                        route: notFoundRoute,
                        pathname: notFoundRoute,
                        query,
                        as,
                        resolvedAs,
                        routeProps: {
                            shallow: false
                        },
                        locale: nextState.locale,
                        isPreview: nextState.isPreview,
                        isNotFound: true
                    });
                    if ("type" in routeInfo) {
                        throw new Error("Unexpected middleware effect on /404");
                    }
                }
            }
            if (isQueryUpdating && this.pathname === "/_error" && ((_self___NEXT_DATA___props = self.__NEXT_DATA__.props) == null ? void 0 : (_self___NEXT_DATA___props_pageProps = _self___NEXT_DATA___props.pageProps) == null ? void 0 : _self___NEXT_DATA___props_pageProps.statusCode) === 500 && ((_routeInfo_props = routeInfo.props) == null ? void 0 : _routeInfo_props.pageProps)) {
                // ensure statusCode is still correct for static 500 page
                // when updating query information
                routeInfo.props.pageProps.statusCode = 500;
            }
            var _routeInfo_route;
            // shallow routing is only allowed for same page URL changes.
            const isValidShallowRoute = options.shallow && nextState.route === ((_routeInfo_route = routeInfo.route) != null ? _routeInfo_route : route);
            var _options_scroll;
            const shouldScroll = (_options_scroll = options.scroll) != null ? _options_scroll : !isQueryUpdating && !isValidShallowRoute;
            const resetScroll = shouldScroll ? {
                x: 0,
                y: 0
            } : null;
            const upcomingScrollState = forcedScroll != null ? forcedScroll : resetScroll;
            // the new state that the router gonna set
            const upcomingRouterState = {
                ...nextState,
                route,
                pathname,
                query,
                asPath: cleanedAs,
                isFallback: false
            };
            // When the page being rendered is the 404 page, we should only update the
            // query parameters. Route changes here might add the basePath when it
            // wasn't originally present. This is also why this block is before the
            // below `changeState` call which updates the browser's history (changing
            // the URL).
            if (isQueryUpdating && isErrorRoute) {
                var _self___NEXT_DATA___props_pageProps1, _self___NEXT_DATA___props1, _routeInfo_props1;
                routeInfo = await this.getRouteInfo({
                    route: this.pathname,
                    pathname: this.pathname,
                    query,
                    as,
                    resolvedAs,
                    routeProps: {
                        shallow: false
                    },
                    locale: nextState.locale,
                    isPreview: nextState.isPreview,
                    isQueryUpdating: isQueryUpdating && !this.isFallback
                });
                if ("type" in routeInfo) {
                    throw new Error("Unexpected middleware effect on " + this.pathname);
                }
                if (this.pathname === "/_error" && ((_self___NEXT_DATA___props1 = self.__NEXT_DATA__.props) == null ? void 0 : (_self___NEXT_DATA___props_pageProps1 = _self___NEXT_DATA___props1.pageProps) == null ? void 0 : _self___NEXT_DATA___props_pageProps1.statusCode) === 500 && ((_routeInfo_props1 = routeInfo.props) == null ? void 0 : _routeInfo_props1.pageProps)) {
                    // ensure statusCode is still correct for static 500 page
                    // when updating query information
                    routeInfo.props.pageProps.statusCode = 500;
                }
                try {
                    await this.set(upcomingRouterState, routeInfo, upcomingScrollState);
                } catch (err) {
                    if ((0, _iserror.default)(err) && err.cancelled) {
                        Router.events.emit("routeChangeError", err, cleanedAs, routeProps);
                    }
                    throw err;
                }
                return true;
            }
            Router.events.emit("beforeHistoryChange", as, routeProps);
            this.changeState(method, url, as, options);
            // for query updates we can skip it if the state is unchanged and we don't
            // need to scroll
            // https://github.com/vercel/next.js/issues/37139
            const canSkipUpdating = isQueryUpdating && !upcomingScrollState && !readyStateChange && !localeChange && (0, _comparestates.compareRouterStates)(upcomingRouterState, this.state);
            if (!canSkipUpdating) {
                try {
                    await this.set(upcomingRouterState, routeInfo, upcomingScrollState);
                } catch (e) {
                    if (e.cancelled) routeInfo.error = routeInfo.error || e;
                    else throw e;
                }
                if (routeInfo.error) {
                    if (!isQueryUpdating) {
                        Router.events.emit("routeChangeError", routeInfo.error, cleanedAs, routeProps);
                    }
                    throw routeInfo.error;
                }
                if (false) {}
                if (!isQueryUpdating) {
                    Router.events.emit("routeChangeComplete", as, routeProps);
                }
                // A hash mark # is the optional last part of a URL
                const hashRegex = /#.+$/;
                if (shouldScroll && hashRegex.test(as)) {
                    this.scrollToHash(as);
                }
            }
            return true;
        } catch (err) {
            if ((0, _iserror.default)(err) && err.cancelled) {
                return false;
            }
            throw err;
        }
    }
    changeState(method, url, as, options) {
        if (options === void 0) options = {};
        if (true) {
            if (typeof window.history === "undefined") {
                console.error("Warning: window.history is not available.");
                return;
            }
            if (typeof window.history[method] === "undefined") {
                console.error("Warning: window.history." + method + " is not available");
                return;
            }
        }
        if (method !== "pushState" || (0, _utils.getURL)() !== as) {
            this._shallow = options.shallow;
            window.history[method]({
                url,
                as,
                options,
                __N: true,
                key: this._key = method !== "pushState" ? this._key : createKey()
            }, // Passing the empty string here should be safe against future changes to the method.
            // https://developer.mozilla.org/docs/Web/API/History/replaceState
            "", as);
        }
    }
    async handleRouteInfoError(err, pathname, query, as, routeProps, loadErrorFail) {
        console.error(err);
        if (err.cancelled) {
            // bubble up cancellation errors
            throw err;
        }
        if ((0, _routeloader.isAssetError)(err) || loadErrorFail) {
            Router.events.emit("routeChangeError", err, as, routeProps);
            // If we can't load the page it could be one of following reasons
            //  1. Page doesn't exists
            //  2. Page does exist in a different zone
            //  3. Internal error while loading the page
            // So, doing a hard reload is the proper way to deal with this.
            handleHardNavigation({
                url: as,
                router: this
            });
            // Changing the URL doesn't block executing the current code path.
            // So let's throw a cancellation error stop the routing logic.
            throw buildCancellationError();
        }
        try {
            let props;
            const { page: Component, styleSheets } = await this.fetchComponent("/_error");
            const routeInfo = {
                props,
                Component,
                styleSheets,
                err,
                error: err
            };
            if (!routeInfo.props) {
                try {
                    routeInfo.props = await this.getInitialProps(Component, {
                        err,
                        pathname,
                        query
                    });
                } catch (gipErr) {
                    console.error("Error in error page `getInitialProps`: ", gipErr);
                    routeInfo.props = {};
                }
            }
            return routeInfo;
        } catch (routeInfoErr) {
            return this.handleRouteInfoError((0, _iserror.default)(routeInfoErr) ? routeInfoErr : new Error(routeInfoErr + ""), pathname, query, as, routeProps, true);
        }
    }
    async getRouteInfo(param) {
        let { route: requestedRoute, pathname, query, as, resolvedAs, routeProps, locale, hasMiddleware, isPreview, unstable_skipClientCache, isQueryUpdating, isMiddlewareRewrite, isNotFound } = param;
        /**
     * This `route` binding can change if there's a rewrite
     * so we keep a reference to the original requested route
     * so we can store the cache for it and avoid re-requesting every time
     * for shallow routing purposes.
     */ let route = requestedRoute;
        try {
            var _data_effect, _data_effect1, _data_effect2, _data_response;
            let existingInfo = this.components[route];
            if (routeProps.shallow && existingInfo && this.route === route) {
                return existingInfo;
            }
            const handleCancelled = getCancelledHandler({
                route,
                router: this
            });
            if (hasMiddleware) {
                existingInfo = undefined;
            }
            let cachedRouteInfo = existingInfo && !("initial" in existingInfo) && "development" !== "development" ? 0 : undefined;
            const isBackground = isQueryUpdating;
            const fetchNextDataParams = {
                dataHref: this.pageLoader.getDataHref({
                    href: (0, _formaturl.formatWithValidation)({
                        pathname,
                        query
                    }),
                    skipInterpolation: true,
                    asPath: isNotFound ? "/404" : resolvedAs,
                    locale
                }),
                hasMiddleware: true,
                isServerRender: this.isSsr,
                parseJSON: true,
                inflightCache: isBackground ? this.sbc : this.sdc,
                persistCache: !isPreview,
                isPrefetch: false,
                unstable_skipClientCache,
                isBackground
            };
            let data = isQueryUpdating && !isMiddlewareRewrite ? null : await withMiddlewareEffects({
                fetchData: ()=>fetchNextData(fetchNextDataParams),
                asPath: isNotFound ? "/404" : resolvedAs,
                locale: locale,
                router: this
            }).catch((err)=>{
                // we don't hard error during query updating
                // as it's un-necessary and doesn't need to be fatal
                // unless it is a fallback route and the props can't
                // be loaded
                if (isQueryUpdating) {
                    return null;
                }
                throw err;
            });
            // when rendering error routes we don't apply middleware
            // effects
            if (data && (pathname === "/_error" || pathname === "/404")) {
                data.effect = undefined;
            }
            if (isQueryUpdating) {
                if (!data) {
                    data = {
                        json: self.__NEXT_DATA__.props
                    };
                } else {
                    data.json = self.__NEXT_DATA__.props;
                }
            }
            handleCancelled();
            if ((data == null ? void 0 : (_data_effect = data.effect) == null ? void 0 : _data_effect.type) === "redirect-internal" || (data == null ? void 0 : (_data_effect1 = data.effect) == null ? void 0 : _data_effect1.type) === "redirect-external") {
                return data.effect;
            }
            if ((data == null ? void 0 : (_data_effect2 = data.effect) == null ? void 0 : _data_effect2.type) === "rewrite") {
                const resolvedRoute = (0, _removetrailingslash.removeTrailingSlash)(data.effect.resolvedHref);
                const pages = await this.pageLoader.getPageList();
                // during query updating the page must match although during
                // client-transition a redirect that doesn't match a page
                // can be returned and this should trigger a hard navigation
                // which is valid for incremental migration
                if (!isQueryUpdating || pages.includes(resolvedRoute)) {
                    route = resolvedRoute;
                    pathname = data.effect.resolvedHref;
                    query = {
                        ...query,
                        ...data.effect.parsedAs.query
                    };
                    resolvedAs = (0, _removebasepath.removeBasePath)((0, _normalizelocalepath.normalizeLocalePath)(data.effect.parsedAs.pathname, this.locales).pathname);
                    // Check again the cache with the new destination.
                    existingInfo = this.components[route];
                    if (routeProps.shallow && existingInfo && this.route === route && !hasMiddleware) {
                        // If we have a match with the current route due to rewrite,
                        // we can copy the existing information to the rewritten one.
                        // Then, we return the information along with the matched route.
                        return {
                            ...existingInfo,
                            route
                        };
                    }
                }
            }
            if ((0, _isapiroute.isAPIRoute)(route)) {
                handleHardNavigation({
                    url: as,
                    router: this
                });
                return new Promise(()=>{});
            }
            const routeInfo = cachedRouteInfo || await this.fetchComponent(route).then((res)=>({
                    Component: res.page,
                    styleSheets: res.styleSheets,
                    __N_SSG: res.mod.__N_SSG,
                    __N_SSP: res.mod.__N_SSP
                }));
            if (true) {
                const { isValidElementType } = __webpack_require__(/*! next/dist/compiled/react-is */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/react-is/index.js");
                if (!isValidElementType(routeInfo.Component)) {
                    throw new Error('The default export is not a React Component in page: "' + pathname + '"');
                }
            }
            const wasBailedPrefetch = data == null ? void 0 : (_data_response = data.response) == null ? void 0 : _data_response.headers.get("x-middleware-skip");
            const shouldFetchData = routeInfo.__N_SSG || routeInfo.__N_SSP;
            // For non-SSG prefetches that bailed before sending data
            // we clear the cache to fetch full response
            if (wasBailedPrefetch && (data == null ? void 0 : data.dataHref)) {
                delete this.sdc[data.dataHref];
            }
            const { props, cacheKey } = await this._getData(async ()=>{
                if (shouldFetchData) {
                    if ((data == null ? void 0 : data.json) && !wasBailedPrefetch) {
                        return {
                            cacheKey: data.cacheKey,
                            props: data.json
                        };
                    }
                    const dataHref = (data == null ? void 0 : data.dataHref) ? data.dataHref : this.pageLoader.getDataHref({
                        href: (0, _formaturl.formatWithValidation)({
                            pathname,
                            query
                        }),
                        asPath: resolvedAs,
                        locale
                    });
                    const fetched = await fetchNextData({
                        dataHref,
                        isServerRender: this.isSsr,
                        parseJSON: true,
                        inflightCache: wasBailedPrefetch ? {} : this.sdc,
                        persistCache: !isPreview,
                        isPrefetch: false,
                        unstable_skipClientCache
                    });
                    return {
                        cacheKey: fetched.cacheKey,
                        props: fetched.json || {}
                    };
                }
                return {
                    headers: {},
                    props: await this.getInitialProps(routeInfo.Component, {
                        pathname,
                        query,
                        asPath: as,
                        locale,
                        locales: this.locales,
                        defaultLocale: this.defaultLocale
                    })
                };
            });
            // Only bust the data cache for SSP routes although
            // middleware can skip cache per request with
            // x-middleware-cache: no-cache as well
            if (routeInfo.__N_SSP && fetchNextDataParams.dataHref && cacheKey) {
                delete this.sdc[cacheKey];
            }
            // we kick off a HEAD request in the background
            // when a non-prefetch request is made to signal revalidation
            if (!this.isPreview && routeInfo.__N_SSG && "development" !== "development" && 0) {}
            props.pageProps = Object.assign({}, props.pageProps);
            routeInfo.props = props;
            routeInfo.route = route;
            routeInfo.query = query;
            routeInfo.resolvedAs = resolvedAs;
            this.components[route] = routeInfo;
            return routeInfo;
        } catch (err) {
            return this.handleRouteInfoError((0, _iserror.getProperError)(err), pathname, query, as, routeProps);
        }
    }
    set(state, data, resetScroll) {
        this.state = state;
        return this.sub(data, this.components["/_app"].Component, resetScroll);
    }
    /**
   * Callback to execute before replacing router state
   * @param cb callback to be executed
   */ beforePopState(cb) {
        this._bps = cb;
    }
    onlyAHashChange(as) {
        if (!this.asPath) return false;
        const [oldUrlNoHash, oldHash] = this.asPath.split("#", 2);
        const [newUrlNoHash, newHash] = as.split("#", 2);
        // Makes sure we scroll to the provided hash if the url/hash are the same
        if (newHash && oldUrlNoHash === newUrlNoHash && oldHash === newHash) {
            return true;
        }
        // If the urls are change, there's more than a hash change
        if (oldUrlNoHash !== newUrlNoHash) {
            return false;
        }
        // If the hash has changed, then it's a hash only change.
        // This check is necessary to handle both the enter and
        // leave hash === '' cases. The identity case falls through
        // and is treated as a next reload.
        return oldHash !== newHash;
    }
    scrollToHash(as) {
        const [, hash = ""] = as.split("#", 2);
        (0, _handlesmoothscroll.handleSmoothScroll)(()=>{
            // Scroll to top if the hash is just `#` with no value or `#top`
            // To mirror browsers
            if (hash === "" || hash === "top") {
                window.scrollTo(0, 0);
                return;
            }
            // Decode hash to make non-latin anchor works.
            const rawHash = decodeURIComponent(hash);
            // First we check if the element by id is found
            const idEl = document.getElementById(rawHash);
            if (idEl) {
                idEl.scrollIntoView();
                return;
            }
            // If there's no element with the id, we check the `name` property
            // To mirror browsers
            const nameEl = document.getElementsByName(rawHash)[0];
            if (nameEl) {
                nameEl.scrollIntoView();
            }
        }, {
            onlyHashChange: this.onlyAHashChange(as)
        });
    }
    urlIsNew(asPath) {
        return this.asPath !== asPath;
    }
    /**
   * Prefetch page code, you may wait for the data during page rendering.
   * This feature only works in production!
   * @param url the href of prefetched page
   * @param asPath the as path of the prefetched page
   */ async prefetch(url, asPath, options) {
        if (asPath === void 0) asPath = url;
        if (options === void 0) options = {};
        // Prefetch is not supported in development mode because it would trigger on-demand-entries
        if (true) {
            return;
        }
        if (false) {}
        let parsed = (0, _parserelativeurl.parseRelativeUrl)(url);
        const urlPathname = parsed.pathname;
        let { pathname, query } = parsed;
        const originalPathname = pathname;
        if (false) {}
        const pages = await this.pageLoader.getPageList();
        let resolvedAs = asPath;
        const locale = typeof options.locale !== "undefined" ? options.locale || undefined : this.locale;
        const isMiddlewareMatch = await matchesMiddleware({
            asPath: asPath,
            locale: locale,
            router: this
        });
        if (false) {}
        parsed.pathname = resolveDynamicRoute(parsed.pathname, pages);
        if ((0, _isdynamic.isDynamicRoute)(parsed.pathname)) {
            pathname = parsed.pathname;
            parsed.pathname = pathname;
            Object.assign(query, (0, _routematcher.getRouteMatcher)((0, _routeregex.getRouteRegex)(parsed.pathname))((0, _parsepath.parsePath)(asPath).pathname) || {});
            if (!isMiddlewareMatch) {
                url = (0, _formaturl.formatWithValidation)(parsed);
            }
        }
        const data =  false ? 0 : await withMiddlewareEffects({
            fetchData: ()=>fetchNextData({
                    dataHref: this.pageLoader.getDataHref({
                        href: (0, _formaturl.formatWithValidation)({
                            pathname: originalPathname,
                            query
                        }),
                        skipInterpolation: true,
                        asPath: resolvedAs,
                        locale
                    }),
                    hasMiddleware: true,
                    isServerRender: false,
                    parseJSON: true,
                    inflightCache: this.sdc,
                    persistCache: !this.isPreview,
                    isPrefetch: true
                }),
            asPath: asPath,
            locale: locale,
            router: this
        });
        /**
     * If there was a rewrite we apply the effects of the rewrite on the
     * current parameters for the prefetch.
     */ if ((data == null ? void 0 : data.effect.type) === "rewrite") {
            parsed.pathname = data.effect.resolvedHref;
            pathname = data.effect.resolvedHref;
            query = {
                ...query,
                ...data.effect.parsedAs.query
            };
            resolvedAs = data.effect.parsedAs.pathname;
            url = (0, _formaturl.formatWithValidation)(parsed);
        }
        /**
     * If there is a redirect to an external destination then we don't have
     * to prefetch content as it will be unused.
     */ if ((data == null ? void 0 : data.effect.type) === "redirect-external") {
            return;
        }
        const route = (0, _removetrailingslash.removeTrailingSlash)(pathname);
        if (await this._bfl(asPath, resolvedAs, options.locale, true)) {
            this.components[urlPathname] = {
                __appRouter: true
            };
        }
        await Promise.all([
            this.pageLoader._isSsg(route).then((isSsg)=>{
                return isSsg ? fetchNextData({
                    dataHref: (data == null ? void 0 : data.json) ? data == null ? void 0 : data.dataHref : this.pageLoader.getDataHref({
                        href: url,
                        asPath: resolvedAs,
                        locale: locale
                    }),
                    isServerRender: false,
                    parseJSON: true,
                    inflightCache: this.sdc,
                    persistCache: !this.isPreview,
                    isPrefetch: true,
                    unstable_skipClientCache: options.unstable_skipClientCache || options.priority && !!true
                }).then(()=>false).catch(()=>false) : false;
            }),
            this.pageLoader[options.priority ? "loadPage" : "prefetch"](route)
        ]);
    }
    async fetchComponent(route) {
        const handleCancelled = getCancelledHandler({
            route,
            router: this
        });
        try {
            const componentResult = await this.pageLoader.loadPage(route);
            handleCancelled();
            return componentResult;
        } catch (err) {
            handleCancelled();
            throw err;
        }
    }
    _getData(fn) {
        let cancelled = false;
        const cancel = ()=>{
            cancelled = true;
        };
        this.clc = cancel;
        return fn().then((data)=>{
            if (cancel === this.clc) {
                this.clc = null;
            }
            if (cancelled) {
                const err = new Error("Loading initial props cancelled");
                err.cancelled = true;
                throw err;
            }
            return data;
        });
    }
    _getFlightData(dataHref) {
        // Do not cache RSC flight response since it's not a static resource
        return fetchNextData({
            dataHref,
            isServerRender: true,
            parseJSON: false,
            inflightCache: this.sdc,
            persistCache: false,
            isPrefetch: false
        }).then((param)=>{
            let { text } = param;
            return {
                data: text
            };
        });
    }
    getInitialProps(Component, ctx) {
        const { Component: App } = this.components["/_app"];
        const AppTree = this._wrapApp(App);
        ctx.AppTree = AppTree;
        return (0, _utils.loadGetInitialProps)(App, {
            AppTree,
            Component,
            router: this,
            ctx
        });
    }
    get route() {
        return this.state.route;
    }
    get pathname() {
        return this.state.pathname;
    }
    get query() {
        return this.state.query;
    }
    get asPath() {
        return this.state.asPath;
    }
    get locale() {
        return this.state.locale;
    }
    get isFallback() {
        return this.state.isFallback;
    }
    get isPreview() {
        return this.state.isPreview;
    }
    constructor(pathname, query, as, { initialProps, pageLoader, App, wrapApp, Component, err, subscription, isFallback, locale, locales, defaultLocale, domainLocales, isPreview }){
        // Server Data Cache (full data requests)
        this.sdc = {};
        // Server Background Cache (HEAD requests)
        this.sbc = {};
        this.isFirstPopStateEvent = true;
        this._key = createKey();
        this.onPopState = (e)=>{
            const { isFirstPopStateEvent } = this;
            this.isFirstPopStateEvent = false;
            const state = e.state;
            if (!state) {
                // We get state as undefined for two reasons.
                //  1. With older safari (< 8) and older chrome (< 34)
                //  2. When the URL changed with #
                //
                // In the both cases, we don't need to proceed and change the route.
                // (as it's already changed)
                // But we can simply replace the state with the new changes.
                // Actually, for (1) we don't need to nothing. But it's hard to detect that event.
                // So, doing the following for (1) does no harm.
                const { pathname, query } = this;
                this.changeState("replaceState", (0, _formaturl.formatWithValidation)({
                    pathname: (0, _addbasepath.addBasePath)(pathname),
                    query
                }), (0, _utils.getURL)());
                return;
            }
            // __NA is used to identify if the history entry can be handled by the app-router.
            if (state.__NA) {
                window.location.reload();
                return;
            }
            if (!state.__N) {
                return;
            }
            // Safari fires popstateevent when reopening the browser.
            if (isFirstPopStateEvent && this.locale === state.options.locale && state.as === this.asPath) {
                return;
            }
            let forcedScroll;
            const { url, as, options, key } = state;
            if (false) {}
            this._key = key;
            const { pathname } = (0, _parserelativeurl.parseRelativeUrl)(url);
            // Make sure we don't re-render on initial load,
            // can be caused by navigating back from an external site
            if (this.isSsr && as === (0, _addbasepath.addBasePath)(this.asPath) && pathname === (0, _addbasepath.addBasePath)(this.pathname)) {
                return;
            }
            // If the downstream application returns falsy, return.
            // They will then be responsible for handling the event.
            if (this._bps && !this._bps(state)) {
                return;
            }
            this.change("replaceState", url, as, Object.assign({}, options, {
                shallow: options.shallow && this._shallow,
                locale: options.locale || this.defaultLocale,
                // @ts-ignore internal value not exposed on types
                _h: 0
            }), forcedScroll);
        };
        // represents the current component key
        const route = (0, _removetrailingslash.removeTrailingSlash)(pathname);
        // set up the component cache (by route keys)
        this.components = {};
        // We should not keep the cache, if there's an error
        // Otherwise, this cause issues when when going back and
        // come again to the errored page.
        if (pathname !== "/_error") {
            this.components[route] = {
                Component,
                initial: true,
                props: initialProps,
                err,
                __N_SSG: initialProps && initialProps.__N_SSG,
                __N_SSP: initialProps && initialProps.__N_SSP
            };
        }
        this.components["/_app"] = {
            Component: App,
            styleSheets: []
        };
        if (true) {
            const { BloomFilter } = __webpack_require__(/*! ../../lib/bloom-filter */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/bloom-filter.js");
            const routerFilterSValue = false;
            const staticFilterData = routerFilterSValue ? routerFilterSValue : undefined;
            const routerFilterDValue = false;
            const dynamicFilterData = routerFilterDValue ? routerFilterDValue : undefined;
            if (staticFilterData == null ? void 0 : staticFilterData.numHashes) {
                this._bfl_s = new BloomFilter(staticFilterData.numItems, staticFilterData.errorRate);
                this._bfl_s.import(staticFilterData);
            }
            if (dynamicFilterData == null ? void 0 : dynamicFilterData.numHashes) {
                this._bfl_d = new BloomFilter(dynamicFilterData.numItems, dynamicFilterData.errorRate);
                this._bfl_d.import(dynamicFilterData);
            }
        }
        // Backwards compat for Router.router.events
        // TODO: Should be remove the following major version as it was never documented
        this.events = Router.events;
        this.pageLoader = pageLoader;
        // if auto prerendered and dynamic route wait to update asPath
        // until after mount to prevent hydration mismatch
        const autoExportDynamic = (0, _isdynamic.isDynamicRoute)(pathname) && self.__NEXT_DATA__.autoExport;
        this.basePath =  false || "";
        this.sub = subscription;
        this.clc = null;
        this._wrapApp = wrapApp;
        // make sure to ignore extra popState in safari on navigating
        // back from external site
        this.isSsr = true;
        this.isLocaleDomain = false;
        this.isReady = !!(self.__NEXT_DATA__.gssp || self.__NEXT_DATA__.gip || self.__NEXT_DATA__.isExperimentalCompile || self.__NEXT_DATA__.appGip && !self.__NEXT_DATA__.gsp || !autoExportDynamic && !self.location.search && !false);
        if (false) {}
        this.state = {
            route,
            pathname,
            query,
            asPath: autoExportDynamic ? pathname : as,
            isPreview: !!isPreview,
            locale:  false ? 0 : undefined,
            isFallback
        };
        this._initialMatchesMiddlewarePromise = Promise.resolve(false);
        if (false) {}
    }
}
Router.events = (0, _mitt.default)(); //# sourceMappingURL=router.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-locale.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-locale.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addLocale", ({
    enumerable: true,
    get: function() {
        return addLocale;
    }
}));
const _addpathprefix = __webpack_require__(/*! ./add-path-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js");
const _pathhasprefix = __webpack_require__(/*! ./path-has-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js");
function addLocale(path, locale, defaultLocale, ignorePrefix) {
    // If no locale was given or the locale is the default locale, we don't need
    // to prefix the path.
    if (!locale || locale === defaultLocale) return path;
    const lower = path.toLowerCase();
    // If the path is an API path or the path already has the locale prefix, we
    // don't need to prefix the path.
    if (!ignorePrefix) {
        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/api")) return path;
        if ((0, _pathhasprefix.pathHasPrefix)(lower, "/" + locale.toLowerCase())) return path;
    }
    // Add the locale prefix to the path.
    return (0, _addpathprefix.addPathPrefix)(path, "/" + locale);
} //# sourceMappingURL=add-locale.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js":
/*!****************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js ***!
  \****************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addPathPrefix", ({
    enumerable: true,
    get: function() {
        return addPathPrefix;
    }
}));
const _parsepath = __webpack_require__(/*! ./parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
function addPathPrefix(path, prefix) {
    if (!path.startsWith("/") || !prefix) {
        return path;
    }
    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
    return "" + prefix + pathname + query + hash;
} //# sourceMappingURL=add-path-prefix.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-suffix.js":
/*!****************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-suffix.js ***!
  \****************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "addPathSuffix", ({
    enumerable: true,
    get: function() {
        return addPathSuffix;
    }
}));
const _parsepath = __webpack_require__(/*! ./parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
function addPathSuffix(path, suffix) {
    if (!path.startsWith("/") || !suffix) {
        return path;
    }
    const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
    return "" + pathname + suffix + query + hash;
} //# sourceMappingURL=add-path-suffix.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/app-paths.js":
/*!**********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/app-paths.js ***!
  \**********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    normalizeAppPath: function() {
        return normalizeAppPath;
    },
    normalizeRscURL: function() {
        return normalizeRscURL;
    }
});
const _ensureleadingslash = __webpack_require__(/*! ../../page-path/ensure-leading-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/page-path/ensure-leading-slash.js");
const _segment = __webpack_require__(/*! ../../segment */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/segment.js");
function normalizeAppPath(route) {
    return (0, _ensureleadingslash.ensureLeadingSlash)(route.split("/").reduce((pathname, segment, index, segments)=>{
        // Empty segments are ignored.
        if (!segment) {
            return pathname;
        }
        // Groups are ignored.
        if ((0, _segment.isGroupSegment)(segment)) {
            return pathname;
        }
        // Parallel segments are ignored.
        if (segment[0] === "@") {
            return pathname;
        }
        // The last segment (if it's a leaf) should be ignored.
        if ((segment === "page" || segment === "route") && index === segments.length - 1) {
            return pathname;
        }
        return pathname + "/" + segment;
    }, ""));
}
function normalizeRscURL(url) {
    return url.replace(/\.rsc($|\?)/, "$1");
} //# sourceMappingURL=app-paths.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/compare-states.js":
/*!***************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/compare-states.js ***!
  \***************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "compareRouterStates", ({
    enumerable: true,
    get: function() {
        return compareRouterStates;
    }
}));
function compareRouterStates(a, b) {
    const stateKeys = Object.keys(a);
    if (stateKeys.length !== Object.keys(b).length) return false;
    for(let i = stateKeys.length; i--;){
        const key = stateKeys[i];
        if (key === "query") {
            const queryKeys = Object.keys(a.query);
            if (queryKeys.length !== Object.keys(b.query).length) {
                return false;
            }
            for(let j = queryKeys.length; j--;){
                const queryKey = queryKeys[j];
                if (!b.query.hasOwnProperty(queryKey) || a.query[queryKey] !== b.query[queryKey]) {
                    return false;
                }
            }
        } else if (!b.hasOwnProperty(key) || a[key] !== b[key]) {
            return false;
        }
    }
    return true;
} //# sourceMappingURL=compare-states.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-next-pathname-info.js":
/*!**************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-next-pathname-info.js ***!
  \**************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "formatNextPathnameInfo", ({
    enumerable: true,
    get: function() {
        return formatNextPathnameInfo;
    }
}));
const _removetrailingslash = __webpack_require__(/*! ./remove-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js");
const _addpathprefix = __webpack_require__(/*! ./add-path-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js");
const _addpathsuffix = __webpack_require__(/*! ./add-path-suffix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-path-suffix.js");
const _addlocale = __webpack_require__(/*! ./add-locale */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/add-locale.js");
function formatNextPathnameInfo(info) {
    let pathname = (0, _addlocale.addLocale)(info.pathname, info.locale, info.buildId ? undefined : info.defaultLocale, info.ignorePrefix);
    if (info.buildId || !info.trailingSlash) {
        pathname = (0, _removetrailingslash.removeTrailingSlash)(pathname);
    }
    if (info.buildId) {
        pathname = (0, _addpathsuffix.addPathSuffix)((0, _addpathprefix.addPathPrefix)(pathname, "/_next/data/" + info.buildId), info.pathname === "/" ? "index.json" : ".json");
    }
    pathname = (0, _addpathprefix.addPathPrefix)(pathname, info.basePath);
    return !info.buildId && info.trailingSlash ? !pathname.endsWith("/") ? (0, _addpathsuffix.addPathSuffix)(pathname, "/") : pathname : (0, _removetrailingslash.removeTrailingSlash)(pathname);
} //# sourceMappingURL=format-next-pathname-info.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-url.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/format-url.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
// Format function modified from nodejs
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    formatUrl: function() {
        return formatUrl;
    },
    formatWithValidation: function() {
        return formatWithValidation;
    },
    urlObjectKeys: function() {
        return urlObjectKeys;
    }
});
const _interop_require_wildcard = __webpack_require__(/*! @swc/helpers/_/_interop_require_wildcard */ "../../node_modules/.pnpm/@swc+helpers@0.5.5/node_modules/@swc/helpers/cjs/_interop_require_wildcard.cjs");
const _querystring = /*#__PURE__*/ _interop_require_wildcard._(__webpack_require__(/*! ./querystring */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js"));
const slashedProtocols = /https?|ftp|gopher|file/;
function formatUrl(urlObj) {
    let { auth, hostname } = urlObj;
    let protocol = urlObj.protocol || "";
    let pathname = urlObj.pathname || "";
    let hash = urlObj.hash || "";
    let query = urlObj.query || "";
    let host = false;
    auth = auth ? encodeURIComponent(auth).replace(/%3A/i, ":") + "@" : "";
    if (urlObj.host) {
        host = auth + urlObj.host;
    } else if (hostname) {
        host = auth + (~hostname.indexOf(":") ? "[" + hostname + "]" : hostname);
        if (urlObj.port) {
            host += ":" + urlObj.port;
        }
    }
    if (query && typeof query === "object") {
        query = String(_querystring.urlQueryToSearchParams(query));
    }
    let search = urlObj.search || query && "?" + query || "";
    if (protocol && !protocol.endsWith(":")) protocol += ":";
    if (urlObj.slashes || (!protocol || slashedProtocols.test(protocol)) && host !== false) {
        host = "//" + (host || "");
        if (pathname && pathname[0] !== "/") pathname = "/" + pathname;
    } else if (!host) {
        host = "";
    }
    if (hash && hash[0] !== "#") hash = "#" + hash;
    if (search && search[0] !== "?") search = "?" + search;
    pathname = pathname.replace(/[?#]/g, encodeURIComponent);
    search = search.replace("#", "%23");
    return "" + protocol + host + pathname + search + hash;
}
const urlObjectKeys = [
    "auth",
    "hash",
    "host",
    "hostname",
    "href",
    "path",
    "pathname",
    "port",
    "protocol",
    "query",
    "search",
    "slashes"
];
function formatWithValidation(url) {
    if (true) {
        if (url !== null && typeof url === "object") {
            Object.keys(url).forEach((key)=>{
                if (!urlObjectKeys.includes(key)) {
                    console.warn("Unknown key passed via urlObject into url.format: " + key);
                }
            });
        }
    }
    return formatUrl(url);
} //# sourceMappingURL=format-url.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-asset-path-from-route.js":
/*!**************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-asset-path-from-route.js ***!
  \**************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
// Translates a logical route into its pages asset path (relative from a common prefix)
// "asset path" being its javascript file, data file, prerendered html,...

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return getAssetPathFromRoute;
    }
}));
function getAssetPathFromRoute(route, ext) {
    if (ext === void 0) ext = "";
    const path = route === "/" ? "/index" : /^\/index(\/|$)/.test(route) ? "/index" + route : route;
    return path + ext;
} //# sourceMappingURL=get-asset-path-from-route.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-next-pathname-info.js":
/*!***********************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/get-next-pathname-info.js ***!
  \***********************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getNextPathnameInfo", ({
    enumerable: true,
    get: function() {
        return getNextPathnameInfo;
    }
}));
const _normalizelocalepath = __webpack_require__(/*! ../../i18n/normalize-locale-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js");
const _removepathprefix = __webpack_require__(/*! ./remove-path-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-path-prefix.js");
const _pathhasprefix = __webpack_require__(/*! ./path-has-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js");
function getNextPathnameInfo(pathname, options) {
    var _options_nextConfig;
    const { basePath, i18n, trailingSlash } = (_options_nextConfig = options.nextConfig) != null ? _options_nextConfig : {};
    const info = {
        pathname,
        trailingSlash: pathname !== "/" ? pathname.endsWith("/") : trailingSlash
    };
    if (basePath && (0, _pathhasprefix.pathHasPrefix)(info.pathname, basePath)) {
        info.pathname = (0, _removepathprefix.removePathPrefix)(info.pathname, basePath);
        info.basePath = basePath;
    }
    let pathnameNoDataPrefix = info.pathname;
    if (info.pathname.startsWith("/_next/data/") && info.pathname.endsWith(".json")) {
        const paths = info.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
        const buildId = paths[0];
        info.buildId = buildId;
        pathnameNoDataPrefix = paths[1] !== "index" ? "/" + paths.slice(1).join("/") : "/";
        // update pathname with normalized if enabled although
        // we use normalized to populate locale info still
        if (options.parseData === true) {
            info.pathname = pathnameNoDataPrefix;
        }
    }
    // If provided, use the locale route normalizer to detect the locale instead
    // of the function below.
    if (i18n) {
        let result = options.i18nProvider ? options.i18nProvider.analyze(info.pathname) : (0, _normalizelocalepath.normalizeLocalePath)(info.pathname, i18n.locales);
        info.locale = result.detectedLocale;
        var _result_pathname;
        info.pathname = (_result_pathname = result.pathname) != null ? _result_pathname : info.pathname;
        if (!result.detectedLocale && info.buildId) {
            result = options.i18nProvider ? options.i18nProvider.analyze(pathnameNoDataPrefix) : (0, _normalizelocalepath.normalizeLocalePath)(pathnameNoDataPrefix, i18n.locales);
            if (result.detectedLocale) {
                info.locale = result.detectedLocale;
            }
        }
    }
    return info;
} //# sourceMappingURL=get-next-pathname-info.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/handle-smooth-scroll.js":
/*!*********************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/handle-smooth-scroll.js ***!
  \*********************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Run function with `scroll-behavior: auto` applied to `<html/>`.
 * This css change will be reverted after the function finishes.
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "handleSmoothScroll", ({
    enumerable: true,
    get: function() {
        return handleSmoothScroll;
    }
}));
function handleSmoothScroll(fn, options) {
    if (options === void 0) options = {};
    // if only the hash is changed, we don't need to disable smooth scrolling
    // we only care to prevent smooth scrolling when navigating to a new page to avoid jarring UX
    if (options.onlyHashChange) {
        fn();
        return;
    }
    const htmlElement = document.documentElement;
    const existing = htmlElement.style.scrollBehavior;
    htmlElement.style.scrollBehavior = "auto";
    if (!options.dontForceLayout) {
        // In Chrome-based browsers we need to force reflow before calling `scrollTo`.
        // Otherwise it will not pickup the change in scrollBehavior
        // More info here: https://github.com/vercel/next.js/issues/40719#issuecomment-1336248042
        htmlElement.getClientRects();
    }
    fn();
    htmlElement.style.scrollBehavior = existing;
} //# sourceMappingURL=handle-smooth-scroll.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/index.js":
/*!******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/index.js ***!
  \******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getSortedRoutes: function() {
        return _sortedroutes.getSortedRoutes;
    },
    isDynamicRoute: function() {
        return _isdynamic.isDynamicRoute;
    }
});
const _sortedroutes = __webpack_require__(/*! ./sorted-routes */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/sorted-routes.js");
const _isdynamic = __webpack_require__(/*! ./is-dynamic */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-dynamic.js"); //# sourceMappingURL=index.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/interpolate-as.js":
/*!***************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/interpolate-as.js ***!
  \***************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "interpolateAs", ({
    enumerable: true,
    get: function() {
        return interpolateAs;
    }
}));
const _routematcher = __webpack_require__(/*! ./route-matcher */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-matcher.js");
const _routeregex = __webpack_require__(/*! ./route-regex */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-regex.js");
function interpolateAs(route, asPathname, query) {
    let interpolatedRoute = "";
    const dynamicRegex = (0, _routeregex.getRouteRegex)(route);
    const dynamicGroups = dynamicRegex.groups;
    const dynamicMatches = (asPathname !== route ? (0, _routematcher.getRouteMatcher)(dynamicRegex)(asPathname) : "") || // Fall back to reading the values from the href
    // TODO: should this take priority; also need to change in the router.
    query;
    interpolatedRoute = route;
    const params = Object.keys(dynamicGroups);
    if (!params.every((param)=>{
        let value = dynamicMatches[param] || "";
        const { repeat, optional } = dynamicGroups[param];
        // support single-level catch-all
        // TODO: more robust handling for user-error (passing `/`)
        let replaced = "[" + (repeat ? "..." : "") + param + "]";
        if (optional) {
            replaced = (!value ? "/" : "") + "[" + replaced + "]";
        }
        if (repeat && !Array.isArray(value)) value = [
            value
        ];
        return (optional || param in dynamicMatches) && // Interpolate group into data URL if present
        (interpolatedRoute = interpolatedRoute.replace(replaced, repeat ? value.map(// path delimiter escaped since they are being inserted
        // into the URL and we expect URL encoded segments
        // when parsing dynamic route params
        (segment)=>encodeURIComponent(segment)).join("/") : encodeURIComponent(value)) || "/");
    })) {
        interpolatedRoute = "" // did not satisfy all requirements
        ;
    // n.b. We ignore this error because we handle warning for this case in
    // development in the `<Link>` component directly.
    }
    return {
        params,
        result: interpolatedRoute
    };
} //# sourceMappingURL=interpolate-as.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-bot.js":
/*!*******************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-bot.js ***!
  \*******************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "isBot", ({
    enumerable: true,
    get: function() {
        return isBot;
    }
}));
function isBot(userAgent) {
    return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(userAgent);
} //# sourceMappingURL=is-bot.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-dynamic.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-dynamic.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "isDynamicRoute", ({
    enumerable: true,
    get: function() {
        return isDynamicRoute;
    }
}));
const _interceptionroutes = __webpack_require__(/*! ../../../../server/future/helpers/interception-routes */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/helpers/interception-routes.js");
// Identify /[param]/ in route string
const TEST_ROUTE = /\/\[[^/]+?\](?=\/|$)/;
function isDynamicRoute(route) {
    if ((0, _interceptionroutes.isInterceptionRouteAppPath)(route)) {
        route = (0, _interceptionroutes.extractInterceptionRouteInformation)(route).interceptedRoute;
    }
    return TEST_ROUTE.test(route);
} //# sourceMappingURL=is-dynamic.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-local-url.js":
/*!*************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/is-local-url.js ***!
  \*************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "isLocalURL", ({
    enumerable: true,
    get: function() {
        return isLocalURL;
    }
}));
const _utils = __webpack_require__(/*! ../../utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
const _hasbasepath = __webpack_require__(/*! ../../../../client/has-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/has-base-path.js");
function isLocalURL(url) {
    // prevent a hydration mismatch on href for url with anchor refs
    if (!(0, _utils.isAbsoluteUrl)(url)) return true;
    try {
        // absolute urls can be local if they are on the same origin
        const locationOrigin = (0, _utils.getLocationOrigin)();
        const resolved = new URL(url, locationOrigin);
        return resolved.origin === locationOrigin && (0, _hasbasepath.hasBasePath)(resolved.pathname);
    } catch (_) {
        return false;
    }
} //# sourceMappingURL=is-local-url.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/omit.js":
/*!*****************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/omit.js ***!
  \*****************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "omit", ({
    enumerable: true,
    get: function() {
        return omit;
    }
}));
function omit(object, keys) {
    const omitted = {};
    Object.keys(object).forEach((key)=>{
        if (!keys.includes(key)) {
            omitted[key] = object[key];
        }
    });
    return omitted;
} //# sourceMappingURL=omit.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Given a path this function will find the pathname, query and hash and return
 * them. This is useful to parse full paths on the client side.
 * @param path A path to parse e.g. /foo/bar?id=1#hash
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "parsePath", ({
    enumerable: true,
    get: function() {
        return parsePath;
    }
}));
function parsePath(path) {
    const hashIndex = path.indexOf("#");
    const queryIndex = path.indexOf("?");
    const hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
    if (hasQuery || hashIndex > -1) {
        return {
            pathname: path.substring(0, hasQuery ? queryIndex : hashIndex),
            query: hasQuery ? path.substring(queryIndex, hashIndex > -1 ? hashIndex : undefined) : "",
            hash: hashIndex > -1 ? path.slice(hashIndex) : ""
        };
    }
    return {
        pathname: path,
        query: "",
        hash: ""
    };
} //# sourceMappingURL=parse-path.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-relative-url.js":
/*!*******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-relative-url.js ***!
  \*******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "parseRelativeUrl", ({
    enumerable: true,
    get: function() {
        return parseRelativeUrl;
    }
}));
const _utils = __webpack_require__(/*! ../../utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
const _querystring = __webpack_require__(/*! ./querystring */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js");
function parseRelativeUrl(url, base) {
    const globalBase = new URL( true ? "http://n" : 0);
    const resolvedBase = base ? new URL(base, globalBase) : url.startsWith(".") ? new URL( true ? "http://n" : 0) : globalBase;
    const { pathname, searchParams, search, hash, href, origin } = new URL(url, resolvedBase);
    if (origin !== globalBase.origin) {
        throw new Error("invariant: invalid relative URL, router received " + url);
    }
    return {
        pathname,
        query: (0, _querystring.searchParamsToUrlQuery)(searchParams),
        search,
        hash,
        href: href.slice(globalBase.origin.length)
    };
} //# sourceMappingURL=parse-relative-url.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-url.js":
/*!**********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-url.js ***!
  \**********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "parseUrl", ({
    enumerable: true,
    get: function() {
        return parseUrl;
    }
}));
const _querystring = __webpack_require__(/*! ./querystring */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js");
const _parserelativeurl = __webpack_require__(/*! ./parse-relative-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-relative-url.js");
function parseUrl(url) {
    if (url.startsWith("/")) {
        return (0, _parserelativeurl.parseRelativeUrl)(url);
    }
    const parsedURL = new URL(url);
    return {
        hash: parsedURL.hash,
        hostname: parsedURL.hostname,
        href: parsedURL.href,
        pathname: parsedURL.pathname,
        port: parsedURL.port,
        protocol: parsedURL.protocol,
        query: (0, _querystring.searchParamsToUrlQuery)(parsedURL.searchParams),
        search: parsedURL.search
    };
} //# sourceMappingURL=parse-url.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js":
/*!****************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js ***!
  \****************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "pathHasPrefix", ({
    enumerable: true,
    get: function() {
        return pathHasPrefix;
    }
}));
const _parsepath = __webpack_require__(/*! ./parse-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-path.js");
function pathHasPrefix(path, prefix) {
    if (typeof path !== "string") {
        return false;
    }
    const { pathname } = (0, _parsepath.parsePath)(path);
    return pathname === prefix || pathname.startsWith(prefix + "/");
} //# sourceMappingURL=path-has-prefix.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-match.js":
/*!***********************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-match.js ***!
  \***********************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getPathMatch", ({
    enumerable: true,
    get: function() {
        return getPathMatch;
    }
}));
const _pathtoregexp = __webpack_require__(/*! next/dist/compiled/path-to-regexp */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/path-to-regexp/index.js");
function getPathMatch(path, options) {
    const keys = [];
    const regexp = (0, _pathtoregexp.pathToRegexp)(path, keys, {
        delimiter: "/",
        sensitive: typeof (options == null ? void 0 : options.sensitive) === "boolean" ? options.sensitive : false,
        strict: options == null ? void 0 : options.strict
    });
    const matcher = (0, _pathtoregexp.regexpToFunction)((options == null ? void 0 : options.regexModifier) ? new RegExp(options.regexModifier(regexp.source), regexp.flags) : regexp, keys);
    /**
   * A matcher function that will check if a given pathname matches the path
   * given in the builder function. When the path does not match it will return
   * `false` but if it does it will return an object with the matched params
   * merged with the params provided in the second argument.
   */ return (pathname, params)=>{
        // If no pathname is provided it's not a match.
        if (typeof pathname !== "string") return false;
        const match = matcher(pathname);
        // If the path did not match `false` will be returned.
        if (!match) return false;
        /**
     * If unnamed params are not allowed they must be removed from
     * the matched parameters. path-to-regexp uses "string" for named and
     * "number" for unnamed parameters.
     */ if (options == null ? void 0 : options.removeUnnamedParams) {
            for (const key of keys){
                if (typeof key.name === "number") {
                    delete match.params[key.name];
                }
            }
        }
        return {
            ...params,
            ...match.params
        };
    };
} //# sourceMappingURL=path-match.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/prepare-destination.js":
/*!********************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/prepare-destination.js ***!
  \********************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    compileNonPath: function() {
        return compileNonPath;
    },
    matchHas: function() {
        return matchHas;
    },
    prepareDestination: function() {
        return prepareDestination;
    }
});
const _pathtoregexp = __webpack_require__(/*! next/dist/compiled/path-to-regexp */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/compiled/path-to-regexp/index.js");
const _escaperegexp = __webpack_require__(/*! ../../escape-regexp */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/escape-regexp.js");
const _parseurl = __webpack_require__(/*! ./parse-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-url.js");
const _interceptionroutes = __webpack_require__(/*! ../../../../server/future/helpers/interception-routes */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/helpers/interception-routes.js");
const _approuterheaders = __webpack_require__(/*! ../../../../client/components/app-router-headers */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/components/app-router-headers.js");
const _getcookieparser = __webpack_require__(/*! ../../../../server/api-utils/get-cookie-parser */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/api-utils/get-cookie-parser.js");
/**
 * Ensure only a-zA-Z are used for param names for proper interpolating
 * with path-to-regexp
 */ function getSafeParamName(paramName) {
    let newParamName = "";
    for(let i = 0; i < paramName.length; i++){
        const charCode = paramName.charCodeAt(i);
        if (charCode > 64 && charCode < 91 || // A-Z
        charCode > 96 && charCode < 123 // a-z
        ) {
            newParamName += paramName[i];
        }
    }
    return newParamName;
}
function escapeSegment(str, segmentName) {
    return str.replace(new RegExp(":" + (0, _escaperegexp.escapeStringRegexp)(segmentName), "g"), "__ESC_COLON_" + segmentName);
}
function unescapeSegments(str) {
    return str.replace(/__ESC_COLON_/gi, ":");
}
function matchHas(req, query, has, missing) {
    if (has === void 0) has = [];
    if (missing === void 0) missing = [];
    const params = {};
    const hasMatch = (hasItem)=>{
        let value;
        let key = hasItem.key;
        switch(hasItem.type){
            case "header":
                {
                    key = key.toLowerCase();
                    value = req.headers[key];
                    break;
                }
            case "cookie":
                {
                    if ("cookies" in req) {
                        value = req.cookies[hasItem.key];
                    } else {
                        const cookies = (0, _getcookieparser.getCookieParser)(req.headers)();
                        value = cookies[hasItem.key];
                    }
                    break;
                }
            case "query":
                {
                    value = query[key];
                    break;
                }
            case "host":
                {
                    const { host } = (req == null ? void 0 : req.headers) || {};
                    // remove port from host if present
                    const hostname = host == null ? void 0 : host.split(":", 1)[0].toLowerCase();
                    value = hostname;
                    break;
                }
            default:
                {
                    break;
                }
        }
        if (!hasItem.value && value) {
            params[getSafeParamName(key)] = value;
            return true;
        } else if (value) {
            const matcher = new RegExp("^" + hasItem.value + "$");
            const matches = Array.isArray(value) ? value.slice(-1)[0].match(matcher) : value.match(matcher);
            if (matches) {
                if (Array.isArray(matches)) {
                    if (matches.groups) {
                        Object.keys(matches.groups).forEach((groupKey)=>{
                            params[groupKey] = matches.groups[groupKey];
                        });
                    } else if (hasItem.type === "host" && matches[0]) {
                        params.host = matches[0];
                    }
                }
                return true;
            }
        }
        return false;
    };
    const allMatch = has.every((item)=>hasMatch(item)) && !missing.some((item)=>hasMatch(item));
    if (allMatch) {
        return params;
    }
    return false;
}
function compileNonPath(value, params) {
    if (!value.includes(":")) {
        return value;
    }
    for (const key of Object.keys(params)){
        if (value.includes(":" + key)) {
            value = value.replace(new RegExp(":" + key + "\\*", "g"), ":" + key + "--ESCAPED_PARAM_ASTERISKS").replace(new RegExp(":" + key + "\\?", "g"), ":" + key + "--ESCAPED_PARAM_QUESTION").replace(new RegExp(":" + key + "\\+", "g"), ":" + key + "--ESCAPED_PARAM_PLUS").replace(new RegExp(":" + key + "(?!\\w)", "g"), "--ESCAPED_PARAM_COLON" + key);
        }
    }
    value = value.replace(/(:|\*|\?|\+|\(|\)|\{|\})/g, "\\$1").replace(/--ESCAPED_PARAM_PLUS/g, "+").replace(/--ESCAPED_PARAM_COLON/g, ":").replace(/--ESCAPED_PARAM_QUESTION/g, "?").replace(/--ESCAPED_PARAM_ASTERISKS/g, "*");
    // the value needs to start with a forward-slash to be compiled
    // correctly
    return (0, _pathtoregexp.compile)("/" + value, {
        validate: false
    })(params).slice(1);
}
function prepareDestination(args) {
    const query = Object.assign({}, args.query);
    delete query.__nextLocale;
    delete query.__nextDefaultLocale;
    delete query.__nextDataReq;
    delete query.__nextInferredLocaleFromDefault;
    delete query[_approuterheaders.NEXT_RSC_UNION_QUERY];
    let escapedDestination = args.destination;
    for (const param of Object.keys({
        ...args.params,
        ...query
    })){
        escapedDestination = escapeSegment(escapedDestination, param);
    }
    const parsedDestination = (0, _parseurl.parseUrl)(escapedDestination);
    const destQuery = parsedDestination.query;
    const destPath = unescapeSegments("" + parsedDestination.pathname + (parsedDestination.hash || ""));
    const destHostname = unescapeSegments(parsedDestination.hostname || "");
    const destPathParamKeys = [];
    const destHostnameParamKeys = [];
    (0, _pathtoregexp.pathToRegexp)(destPath, destPathParamKeys);
    (0, _pathtoregexp.pathToRegexp)(destHostname, destHostnameParamKeys);
    const destParams = [];
    destPathParamKeys.forEach((key)=>destParams.push(key.name));
    destHostnameParamKeys.forEach((key)=>destParams.push(key.name));
    const destPathCompiler = (0, _pathtoregexp.compile)(destPath, // have already validated before we got to this point and validating
    // breaks compiling destinations with named pattern params from the source
    // e.g. /something:hello(.*) -> /another/:hello is broken with validation
    // since compile validation is meant for reversing and not for inserting
    // params from a separate path-regex into another
    {
        validate: false
    });
    const destHostnameCompiler = (0, _pathtoregexp.compile)(destHostname, {
        validate: false
    });
    // update any params in query values
    for (const [key, strOrArray] of Object.entries(destQuery)){
        // the value needs to start with a forward-slash to be compiled
        // correctly
        if (Array.isArray(strOrArray)) {
            destQuery[key] = strOrArray.map((value)=>compileNonPath(unescapeSegments(value), args.params));
        } else if (typeof strOrArray === "string") {
            destQuery[key] = compileNonPath(unescapeSegments(strOrArray), args.params);
        }
    }
    // add path params to query if it's not a redirect and not
    // already defined in destination query or path
    let paramKeys = Object.keys(args.params).filter((name)=>name !== "nextInternalLocale");
    if (args.appendParamsToQuery && !paramKeys.some((key)=>destParams.includes(key))) {
        for (const key of paramKeys){
            if (!(key in destQuery)) {
                destQuery[key] = args.params[key];
            }
        }
    }
    let newUrl;
    // The compiler also that the interception route marker is an unnamed param, hence '0',
    // so we need to add it to the params object.
    if ((0, _interceptionroutes.isInterceptionRouteAppPath)(destPath)) {
        for (const segment of destPath.split("/")){
            const marker = _interceptionroutes.INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m));
            if (marker) {
                args.params["0"] = marker;
                break;
            }
        }
    }
    try {
        newUrl = destPathCompiler(args.params);
        const [pathname, hash] = newUrl.split("#", 2);
        parsedDestination.hostname = destHostnameCompiler(args.params);
        parsedDestination.pathname = pathname;
        parsedDestination.hash = "" + (hash ? "#" : "") + (hash || "");
        delete parsedDestination.search;
    } catch (err) {
        if (err.message.match(/Expected .*? to not repeat, but got an array/)) {
            throw new Error("To use a multi-match in the destination you must add `*` at the end of the param name to signify it should repeat. https://nextjs.org/docs/messages/invalid-multi-match");
        }
        throw err;
    }
    // Query merge order lowest priority to highest
    // 1. initial URL query values
    // 2. path segment values
    // 3. destination specified query values
    parsedDestination.query = {
        ...query,
        ...parsedDestination.query
    };
    return {
        newUrl,
        destQuery,
        parsedDestination
    };
} //# sourceMappingURL=prepare-destination.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js":
/*!************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/querystring.js ***!
  \************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    assign: function() {
        return assign;
    },
    searchParamsToUrlQuery: function() {
        return searchParamsToUrlQuery;
    },
    urlQueryToSearchParams: function() {
        return urlQueryToSearchParams;
    }
});
function searchParamsToUrlQuery(searchParams) {
    const query = {};
    searchParams.forEach((value, key)=>{
        if (typeof query[key] === "undefined") {
            query[key] = value;
        } else if (Array.isArray(query[key])) {
            query[key].push(value);
        } else {
            query[key] = [
                query[key],
                value
            ];
        }
    });
    return query;
}
function stringifyUrlQueryParam(param) {
    if (typeof param === "string" || typeof param === "number" && !isNaN(param) || typeof param === "boolean") {
        return String(param);
    } else {
        return "";
    }
}
function urlQueryToSearchParams(urlQuery) {
    const result = new URLSearchParams();
    Object.entries(urlQuery).forEach((param)=>{
        let [key, value] = param;
        if (Array.isArray(value)) {
            value.forEach((item)=>result.append(key, stringifyUrlQueryParam(item)));
        } else {
            result.set(key, stringifyUrlQueryParam(value));
        }
    });
    return result;
}
function assign(target) {
    for(var _len = arguments.length, searchParamsList = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        searchParamsList[_key - 1] = arguments[_key];
    }
    searchParamsList.forEach((searchParams)=>{
        Array.from(searchParams.keys()).forEach((key)=>target.delete(key));
        searchParams.forEach((value, key)=>target.append(key, value));
    });
    return target;
} //# sourceMappingURL=querystring.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-path-prefix.js":
/*!*******************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-path-prefix.js ***!
  \*******************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removePathPrefix", ({
    enumerable: true,
    get: function() {
        return removePathPrefix;
    }
}));
const _pathhasprefix = __webpack_require__(/*! ./path-has-prefix */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js");
function removePathPrefix(path, prefix) {
    // If the path doesn't start with the prefix we can return it as is. This
    // protects us from situations where the prefix is a substring of the path
    // prefix such as:
    //
    // For prefix: /blog
    //
    //   /blog -> true
    //   /blog/ -> true
    //   /blog/1 -> true
    //   /blogging -> false
    //   /blogging/ -> false
    //   /blogging/1 -> false
    if (!(0, _pathhasprefix.pathHasPrefix)(path, prefix)) {
        return path;
    }
    // Remove the prefix from the path via slicing.
    const withoutPrefix = path.slice(prefix.length);
    // If the path without the prefix starts with a `/` we can return it as is.
    if (withoutPrefix.startsWith("/")) {
        return withoutPrefix;
    }
    // If the path without the prefix doesn't start with a `/` we need to add it
    // back to the path to make sure it's a valid path.
    return "/" + withoutPrefix;
} //# sourceMappingURL=remove-path-prefix.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js":
/*!**********************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js ***!
  \**********************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/**
 * Removes the trailing slash for a given route or page path. Preserves the
 * root page. Examples:
 *   - `/foo/bar/` -> `/foo/bar`
 *   - `/foo/bar` -> `/foo/bar`
 *   - `/` -> `/`
 */ 
Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "removeTrailingSlash", ({
    enumerable: true,
    get: function() {
        return removeTrailingSlash;
    }
}));
function removeTrailingSlash(route) {
    return route.replace(/\/$/, "") || "/";
} //# sourceMappingURL=remove-trailing-slash.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/resolve-rewrites.js":
/*!*****************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/resolve-rewrites.js ***!
  \*****************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return resolveRewrites;
    }
}));
const _pathmatch = __webpack_require__(/*! ./path-match */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/path-match.js");
const _preparedestination = __webpack_require__(/*! ./prepare-destination */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/prepare-destination.js");
const _removetrailingslash = __webpack_require__(/*! ./remove-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js");
const _normalizelocalepath = __webpack_require__(/*! ../../i18n/normalize-locale-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js");
const _removebasepath = __webpack_require__(/*! ../../../../client/remove-base-path */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/remove-base-path.js");
const _parserelativeurl = __webpack_require__(/*! ./parse-relative-url */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/parse-relative-url.js");
function resolveRewrites(asPath, pages, rewrites, query, resolveHref, locales) {
    let matchedPage = false;
    let externalDest = false;
    let parsedAs = (0, _parserelativeurl.parseRelativeUrl)(asPath);
    let fsPathname = (0, _removetrailingslash.removeTrailingSlash)((0, _normalizelocalepath.normalizeLocalePath)((0, _removebasepath.removeBasePath)(parsedAs.pathname), locales).pathname);
    let resolvedHref;
    const handleRewrite = (rewrite)=>{
        const matcher = (0, _pathmatch.getPathMatch)(rewrite.source + ( false ? 0 : ""), {
            removeUnnamedParams: true,
            strict: true
        });
        let params = matcher(parsedAs.pathname);
        if ((rewrite.has || rewrite.missing) && params) {
            const hasParams = (0, _preparedestination.matchHas)({
                headers: {
                    host: document.location.hostname,
                    "user-agent": navigator.userAgent
                },
                cookies: document.cookie.split("; ").reduce((acc, item)=>{
                    const [key, ...value] = item.split("=");
                    acc[key] = value.join("=");
                    return acc;
                }, {})
            }, parsedAs.query, rewrite.has, rewrite.missing);
            if (hasParams) {
                Object.assign(params, hasParams);
            } else {
                params = false;
            }
        }
        if (params) {
            if (!rewrite.destination) {
                // this is a proxied rewrite which isn't handled on the client
                externalDest = true;
                return true;
            }
            const destRes = (0, _preparedestination.prepareDestination)({
                appendParamsToQuery: true,
                destination: rewrite.destination,
                params: params,
                query: query
            });
            parsedAs = destRes.parsedDestination;
            asPath = destRes.newUrl;
            Object.assign(query, destRes.parsedDestination.query);
            fsPathname = (0, _removetrailingslash.removeTrailingSlash)((0, _normalizelocalepath.normalizeLocalePath)((0, _removebasepath.removeBasePath)(asPath), locales).pathname);
            if (pages.includes(fsPathname)) {
                // check if we now match a page as this means we are done
                // resolving the rewrites
                matchedPage = true;
                resolvedHref = fsPathname;
                return true;
            }
            // check if we match a dynamic-route, if so we break the rewrites chain
            resolvedHref = resolveHref(fsPathname);
            if (resolvedHref !== asPath && pages.includes(resolvedHref)) {
                matchedPage = true;
                return true;
            }
        }
    };
    let finished = false;
    for(let i = 0; i < rewrites.beforeFiles.length; i++){
        // we don't end after match in beforeFiles to allow
        // continuing through all beforeFiles rewrites
        handleRewrite(rewrites.beforeFiles[i]);
    }
    matchedPage = pages.includes(fsPathname);
    if (!matchedPage) {
        if (!finished) {
            for(let i = 0; i < rewrites.afterFiles.length; i++){
                if (handleRewrite(rewrites.afterFiles[i])) {
                    finished = true;
                    break;
                }
            }
        }
        // check dynamic route before processing fallback rewrites
        if (!finished) {
            resolvedHref = resolveHref(fsPathname);
            matchedPage = pages.includes(resolvedHref);
            finished = matchedPage;
        }
        if (!finished) {
            for(let i = 0; i < rewrites.fallback.length; i++){
                if (handleRewrite(rewrites.fallback[i])) {
                    finished = true;
                    break;
                }
            }
        }
    }
    return {
        asPath,
        parsedAs,
        matchedPage,
        resolvedHref,
        externalDest
    };
} //# sourceMappingURL=resolve-rewrites.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-matcher.js":
/*!**************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-matcher.js ***!
  \**************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getRouteMatcher", ({
    enumerable: true,
    get: function() {
        return getRouteMatcher;
    }
}));
const _utils = __webpack_require__(/*! ../../utils */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js");
function getRouteMatcher(param) {
    let { re, groups } = param;
    return (pathname)=>{
        const routeMatch = re.exec(pathname);
        if (!routeMatch) {
            return false;
        }
        const decode = (param)=>{
            try {
                return decodeURIComponent(param);
            } catch (_) {
                throw new _utils.DecodeError("failed to decode param");
            }
        };
        const params = {};
        Object.keys(groups).forEach((slugName)=>{
            const g = groups[slugName];
            const m = routeMatch[g.pos];
            if (m !== undefined) {
                params[slugName] = ~m.indexOf("/") ? m.split("/").map((entry)=>decode(entry)) : g.repeat ? [
                    decode(m)
                ] : decode(m);
            }
        });
        return params;
    };
} //# sourceMappingURL=route-matcher.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-regex.js":
/*!************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/route-regex.js ***!
  \************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    getNamedMiddlewareRegex: function() {
        return getNamedMiddlewareRegex;
    },
    getNamedRouteRegex: function() {
        return getNamedRouteRegex;
    },
    getRouteRegex: function() {
        return getRouteRegex;
    },
    parseParameter: function() {
        return parseParameter;
    }
});
const _interceptionroutes = __webpack_require__(/*! ../../../../server/future/helpers/interception-routes */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/server/future/helpers/interception-routes.js");
const _escaperegexp = __webpack_require__(/*! ../../escape-regexp */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/escape-regexp.js");
const _removetrailingslash = __webpack_require__(/*! ./remove-trailing-slash */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js");
const NEXT_QUERY_PARAM_PREFIX = "nxtP";
const NEXT_INTERCEPTION_MARKER_PREFIX = "nxtI";
function parseParameter(param) {
    const optional = param.startsWith("[") && param.endsWith("]");
    if (optional) {
        param = param.slice(1, -1);
    }
    const repeat = param.startsWith("...");
    if (repeat) {
        param = param.slice(3);
    }
    return {
        key: param,
        repeat,
        optional
    };
}
function getParametrizedRoute(route) {
    const segments = (0, _removetrailingslash.removeTrailingSlash)(route).slice(1).split("/");
    const groups = {};
    let groupIndex = 1;
    return {
        parameterizedRoute: segments.map((segment)=>{
            const markerMatch = _interceptionroutes.INTERCEPTION_ROUTE_MARKERS.find((m)=>segment.startsWith(m));
            const paramMatches = segment.match(/\[((?:\[.*\])|.+)\]/) // Check for parameters
            ;
            if (markerMatch && paramMatches) {
                const { key, optional, repeat } = parseParameter(paramMatches[1]);
                groups[key] = {
                    pos: groupIndex++,
                    repeat,
                    optional
                };
                return "/" + (0, _escaperegexp.escapeStringRegexp)(markerMatch) + "([^/]+?)";
            } else if (paramMatches) {
                const { key, repeat, optional } = parseParameter(paramMatches[1]);
                groups[key] = {
                    pos: groupIndex++,
                    repeat,
                    optional
                };
                return repeat ? optional ? "(?:/(.+?))?" : "/(.+?)" : "/([^/]+?)";
            } else {
                return "/" + (0, _escaperegexp.escapeStringRegexp)(segment);
            }
        }).join(""),
        groups
    };
}
function getRouteRegex(normalizedRoute) {
    const { parameterizedRoute, groups } = getParametrizedRoute(normalizedRoute);
    return {
        re: new RegExp("^" + parameterizedRoute + "(?:/)?$"),
        groups: groups
    };
}
/**
 * Builds a function to generate a minimal routeKey using only a-z and minimal
 * number of characters.
 */ function buildGetSafeRouteKey() {
    let i = 0;
    return ()=>{
        let routeKey = "";
        let j = ++i;
        while(j > 0){
            routeKey += String.fromCharCode(97 + (j - 1) % 26);
            j = Math.floor((j - 1) / 26);
        }
        return routeKey;
    };
}
function getSafeKeyFromSegment(param) {
    let { interceptionMarker, getSafeRouteKey, segment, routeKeys, keyPrefix } = param;
    const { key, optional, repeat } = parseParameter(segment);
    // replace any non-word characters since they can break
    // the named regex
    let cleanedKey = key.replace(/\W/g, "");
    if (keyPrefix) {
        cleanedKey = "" + keyPrefix + cleanedKey;
    }
    let invalidKey = false;
    // check if the key is still invalid and fallback to using a known
    // safe key
    if (cleanedKey.length === 0 || cleanedKey.length > 30) {
        invalidKey = true;
    }
    if (!isNaN(parseInt(cleanedKey.slice(0, 1)))) {
        invalidKey = true;
    }
    if (invalidKey) {
        cleanedKey = getSafeRouteKey();
    }
    if (keyPrefix) {
        routeKeys[cleanedKey] = "" + keyPrefix + key;
    } else {
        routeKeys[cleanedKey] = key;
    }
    // if the segment has an interception marker, make sure that's part of the regex pattern
    // this is to ensure that the route with the interception marker doesn't incorrectly match
    // the non-intercepted route (ie /app/(.)[username] should not match /app/[username])
    const interceptionPrefix = interceptionMarker ? (0, _escaperegexp.escapeStringRegexp)(interceptionMarker) : "";
    return repeat ? optional ? "(?:/" + interceptionPrefix + "(?<" + cleanedKey + ">.+?))?" : "/" + interceptionPrefix + "(?<" + cleanedKey + ">.+?)" : "/" + interceptionPrefix + "(?<" + cleanedKey + ">[^/]+?)";
}
function getNamedParametrizedRoute(route, prefixRouteKeys) {
    const segments = (0, _removetrailingslash.removeTrailingSlash)(route).slice(1).split("/");
    const getSafeRouteKey = buildGetSafeRouteKey();
    const routeKeys = {};
    return {
        namedParameterizedRoute: segments.map((segment)=>{
            const hasInterceptionMarker = _interceptionroutes.INTERCEPTION_ROUTE_MARKERS.some((m)=>segment.startsWith(m));
            const paramMatches = segment.match(/\[((?:\[.*\])|.+)\]/) // Check for parameters
            ;
            if (hasInterceptionMarker && paramMatches) {
                const [usedMarker] = segment.split(paramMatches[0]);
                return getSafeKeyFromSegment({
                    getSafeRouteKey,
                    interceptionMarker: usedMarker,
                    segment: paramMatches[1],
                    routeKeys,
                    keyPrefix: prefixRouteKeys ? NEXT_INTERCEPTION_MARKER_PREFIX : undefined
                });
            } else if (paramMatches) {
                return getSafeKeyFromSegment({
                    getSafeRouteKey,
                    segment: paramMatches[1],
                    routeKeys,
                    keyPrefix: prefixRouteKeys ? NEXT_QUERY_PARAM_PREFIX : undefined
                });
            } else {
                return "/" + (0, _escaperegexp.escapeStringRegexp)(segment);
            }
        }).join(""),
        routeKeys
    };
}
function getNamedRouteRegex(normalizedRoute, prefixRouteKey) {
    const result = getNamedParametrizedRoute(normalizedRoute, prefixRouteKey);
    return {
        ...getRouteRegex(normalizedRoute),
        namedRegex: "^" + result.namedParameterizedRoute + "(?:/)?$",
        routeKeys: result.routeKeys
    };
}
function getNamedMiddlewareRegex(normalizedRoute, options) {
    const { parameterizedRoute } = getParametrizedRoute(normalizedRoute);
    const { catchAll = true } = options;
    if (parameterizedRoute === "/") {
        let catchAllRegex = catchAll ? ".*" : "";
        return {
            namedRegex: "^/" + catchAllRegex + "$"
        };
    }
    const { namedParameterizedRoute } = getNamedParametrizedRoute(normalizedRoute, false);
    let catchAllGroupedRegex = catchAll ? "(?:(/.*)?)" : "";
    return {
        namedRegex: "^" + namedParameterizedRoute + catchAllGroupedRegex + "$"
    };
} //# sourceMappingURL=route-regex.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/sorted-routes.js":
/*!**************************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/router/utils/sorted-routes.js ***!
  \**************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "getSortedRoutes", ({
    enumerable: true,
    get: function() {
        return getSortedRoutes;
    }
}));
class UrlNode {
    insert(urlPath) {
        this._insert(urlPath.split("/").filter(Boolean), [], false);
    }
    smoosh() {
        return this._smoosh();
    }
    _smoosh(prefix) {
        if (prefix === void 0) prefix = "/";
        const childrenPaths = [
            ...this.children.keys()
        ].sort();
        if (this.slugName !== null) {
            childrenPaths.splice(childrenPaths.indexOf("[]"), 1);
        }
        if (this.restSlugName !== null) {
            childrenPaths.splice(childrenPaths.indexOf("[...]"), 1);
        }
        if (this.optionalRestSlugName !== null) {
            childrenPaths.splice(childrenPaths.indexOf("[[...]]"), 1);
        }
        const routes = childrenPaths.map((c)=>this.children.get(c)._smoosh("" + prefix + c + "/")).reduce((prev, curr)=>[
                ...prev,
                ...curr
            ], []);
        if (this.slugName !== null) {
            routes.push(...this.children.get("[]")._smoosh(prefix + "[" + this.slugName + "]/"));
        }
        if (!this.placeholder) {
            const r = prefix === "/" ? "/" : prefix.slice(0, -1);
            if (this.optionalRestSlugName != null) {
                throw new Error('You cannot define a route with the same specificity as a optional catch-all route ("' + r + '" and "' + r + "[[..." + this.optionalRestSlugName + ']]").');
            }
            routes.unshift(r);
        }
        if (this.restSlugName !== null) {
            routes.push(...this.children.get("[...]")._smoosh(prefix + "[..." + this.restSlugName + "]/"));
        }
        if (this.optionalRestSlugName !== null) {
            routes.push(...this.children.get("[[...]]")._smoosh(prefix + "[[..." + this.optionalRestSlugName + "]]/"));
        }
        return routes;
    }
    _insert(urlPaths, slugNames, isCatchAll) {
        if (urlPaths.length === 0) {
            this.placeholder = false;
            return;
        }
        if (isCatchAll) {
            throw new Error("Catch-all must be the last part of the URL.");
        }
        // The next segment in the urlPaths list
        let nextSegment = urlPaths[0];
        // Check if the segment matches `[something]`
        if (nextSegment.startsWith("[") && nextSegment.endsWith("]")) {
            // Strip `[` and `]`, leaving only `something`
            let segmentName = nextSegment.slice(1, -1);
            let isOptional = false;
            if (segmentName.startsWith("[") && segmentName.endsWith("]")) {
                // Strip optional `[` and `]`, leaving only `something`
                segmentName = segmentName.slice(1, -1);
                isOptional = true;
            }
            if (segmentName.startsWith("...")) {
                // Strip `...`, leaving only `something`
                segmentName = segmentName.substring(3);
                isCatchAll = true;
            }
            if (segmentName.startsWith("[") || segmentName.endsWith("]")) {
                throw new Error("Segment names may not start or end with extra brackets ('" + segmentName + "').");
            }
            if (segmentName.startsWith(".")) {
                throw new Error("Segment names may not start with erroneous periods ('" + segmentName + "').");
            }
            function handleSlug(previousSlug, nextSlug) {
                if (previousSlug !== null) {
                    // If the specific segment already has a slug but the slug is not `something`
                    // This prevents collisions like:
                    // pages/[post]/index.js
                    // pages/[id]/index.js
                    // Because currently multiple dynamic params on the same segment level are not supported
                    if (previousSlug !== nextSlug) {
                        // TODO: This error seems to be confusing for users, needs an error link, the description can be based on above comment.
                        throw new Error("You cannot use different slug names for the same dynamic path ('" + previousSlug + "' !== '" + nextSlug + "').");
                    }
                }
                slugNames.forEach((slug)=>{
                    if (slug === nextSlug) {
                        throw new Error('You cannot have the same slug name "' + nextSlug + '" repeat within a single dynamic path');
                    }
                    if (slug.replace(/\W/g, "") === nextSegment.replace(/\W/g, "")) {
                        throw new Error('You cannot have the slug names "' + slug + '" and "' + nextSlug + '" differ only by non-word symbols within a single dynamic path');
                    }
                });
                slugNames.push(nextSlug);
            }
            if (isCatchAll) {
                if (isOptional) {
                    if (this.restSlugName != null) {
                        throw new Error('You cannot use both an required and optional catch-all route at the same level ("[...' + this.restSlugName + ']" and "' + urlPaths[0] + '" ).');
                    }
                    handleSlug(this.optionalRestSlugName, segmentName);
                    // slugName is kept as it can only be one particular slugName
                    this.optionalRestSlugName = segmentName;
                    // nextSegment is overwritten to [[...]] so that it can later be sorted specifically
                    nextSegment = "[[...]]";
                } else {
                    if (this.optionalRestSlugName != null) {
                        throw new Error('You cannot use both an optional and required catch-all route at the same level ("[[...' + this.optionalRestSlugName + ']]" and "' + urlPaths[0] + '").');
                    }
                    handleSlug(this.restSlugName, segmentName);
                    // slugName is kept as it can only be one particular slugName
                    this.restSlugName = segmentName;
                    // nextSegment is overwritten to [...] so that it can later be sorted specifically
                    nextSegment = "[...]";
                }
            } else {
                if (isOptional) {
                    throw new Error('Optional route parameters are not yet supported ("' + urlPaths[0] + '").');
                }
                handleSlug(this.slugName, segmentName);
                // slugName is kept as it can only be one particular slugName
                this.slugName = segmentName;
                // nextSegment is overwritten to [] so that it can later be sorted specifically
                nextSegment = "[]";
            }
        }
        // If this UrlNode doesn't have the nextSegment yet we create a new child UrlNode
        if (!this.children.has(nextSegment)) {
            this.children.set(nextSegment, new UrlNode());
        }
        this.children.get(nextSegment)._insert(urlPaths.slice(1), slugNames, isCatchAll);
    }
    constructor(){
        this.placeholder = true;
        this.children = new Map();
        this.slugName = null;
        this.restSlugName = null;
        this.optionalRestSlugName = null;
    }
}
function getSortedRoutes(normalizedPages) {
    // First the UrlNode is created, and every UrlNode can have only 1 dynamic segment
    // Eg you can't have pages/[post]/abc.js and pages/[hello]/something-else.js
    // Only 1 dynamic segment per nesting level
    // So in the case that is test/integration/dynamic-routing it'll be this:
    // pages/[post]/comments.js
    // pages/blog/[post]/comment/[id].js
    // Both are fine because `pages/[post]` and `pages/blog` are on the same level
    // So in this case `UrlNode` created here has `this.slugName === 'post'`
    // And since your PR passed through `slugName` as an array basically it'd including it in too many possibilities
    // Instead what has to be passed through is the upwards path's dynamic names
    const root = new UrlNode();
    // Here the `root` gets injected multiple paths, and insert will break them up into sublevels
    normalizedPages.forEach((pagePath)=>root.insert(pagePath));
    // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
    return root.smoosh();
} //# sourceMappingURL=sorted-routes.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/segment.js":
/*!*******************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/segment.js ***!
  \*******************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DEFAULT_SEGMENT_KEY: function() {
        return DEFAULT_SEGMENT_KEY;
    },
    PAGE_SEGMENT_KEY: function() {
        return PAGE_SEGMENT_KEY;
    },
    isGroupSegment: function() {
        return isGroupSegment;
    }
});
function isGroupSegment(segment) {
    // Use array[0] for performant purpose
    return segment[0] === "(" && segment.endsWith(")");
}
const PAGE_SEGMENT_KEY = "__PAGE__";
const DEFAULT_SEGMENT_KEY = "__DEFAULT__"; //# sourceMappingURL=segment.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/side-effect.js":
/*!***********************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/side-effect.js ***!
  \***********************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "default", ({
    enumerable: true,
    get: function() {
        return SideEffect;
    }
}));
const _react = __webpack_require__(/*! react */ "react");
const isServer = "undefined" === "undefined";
const useClientOnlyLayoutEffect = isServer ? ()=>{} : _react.useLayoutEffect;
const useClientOnlyEffect = isServer ? ()=>{} : _react.useEffect;
function SideEffect(props) {
    const { headManager, reduceComponentsToState } = props;
    function emitChange() {
        if (headManager && headManager.mountedInstances) {
            const headElements = _react.Children.toArray(Array.from(headManager.mountedInstances).filter(Boolean));
            headManager.updateHead(reduceComponentsToState(headElements, props));
        }
    }
    if (isServer) {
        var _headManager_mountedInstances;
        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
        emitChange();
    }
    useClientOnlyLayoutEffect(()=>{
        var _headManager_mountedInstances;
        headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.add(props.children);
        return ()=>{
            var _headManager_mountedInstances;
            headManager == null ? void 0 : (_headManager_mountedInstances = headManager.mountedInstances) == null ? void 0 : _headManager_mountedInstances.delete(props.children);
        };
    });
    // We need to call `updateHead` method whenever the `SideEffect` is trigger in all
    // life-cycles: mount, update, unmount. However, if there are multiple `SideEffect`s
    // being rendered, we only trigger the method from the last one.
    // This is ensured by keeping the last unflushed `updateHead` in the `_pendingUpdate`
    // singleton in the layout effect pass, and actually trigger it in the effect pass.
    useClientOnlyLayoutEffect(()=>{
        if (headManager) {
            headManager._pendingUpdate = emitChange;
        }
        return ()=>{
            if (headManager) {
                headManager._pendingUpdate = emitChange;
            }
        };
    });
    useClientOnlyEffect(()=>{
        if (headManager && headManager._pendingUpdate) {
            headManager._pendingUpdate();
            headManager._pendingUpdate = null;
        }
        return ()=>{
            if (headManager && headManager._pendingUpdate) {
                headManager._pendingUpdate();
                headManager._pendingUpdate = null;
            }
        };
    });
    return null;
} //# sourceMappingURL=side-effect.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js":
/*!*****************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils.js ***!
  \*****************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
0 && (0);
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DecodeError: function() {
        return DecodeError;
    },
    MiddlewareNotFoundError: function() {
        return MiddlewareNotFoundError;
    },
    MissingStaticPage: function() {
        return MissingStaticPage;
    },
    NormalizeError: function() {
        return NormalizeError;
    },
    PageNotFoundError: function() {
        return PageNotFoundError;
    },
    SP: function() {
        return SP;
    },
    ST: function() {
        return ST;
    },
    WEB_VITALS: function() {
        return WEB_VITALS;
    },
    execOnce: function() {
        return execOnce;
    },
    getDisplayName: function() {
        return getDisplayName;
    },
    getLocationOrigin: function() {
        return getLocationOrigin;
    },
    getURL: function() {
        return getURL;
    },
    isAbsoluteUrl: function() {
        return isAbsoluteUrl;
    },
    isResSent: function() {
        return isResSent;
    },
    loadGetInitialProps: function() {
        return loadGetInitialProps;
    },
    normalizeRepeatedSlashes: function() {
        return normalizeRepeatedSlashes;
    },
    stringifyError: function() {
        return stringifyError;
    }
});
const WEB_VITALS = [
    "CLS",
    "FCP",
    "FID",
    "INP",
    "LCP",
    "TTFB"
];
function execOnce(fn) {
    let used = false;
    let result;
    return function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        if (!used) {
            used = true;
            result = fn(...args);
        }
        return result;
    };
}
// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const isAbsoluteUrl = (url)=>ABSOLUTE_URL_REGEX.test(url);
function getLocationOrigin() {
    const { protocol, hostname, port } = window.location;
    return protocol + "//" + hostname + (port ? ":" + port : "");
}
function getURL() {
    const { href } = window.location;
    const origin = getLocationOrigin();
    return href.substring(origin.length);
}
function getDisplayName(Component) {
    return typeof Component === "string" ? Component : Component.displayName || Component.name || "Unknown";
}
function isResSent(res) {
    return res.finished || res.headersSent;
}
function normalizeRepeatedSlashes(url) {
    const urlParts = url.split("?");
    const urlNoQuery = urlParts[0];
    return urlNoQuery // first we replace any non-encoded backslashes with forward
    // then normalize repeated forward slashes
    .replace(/\\/g, "/").replace(/\/\/+/g, "/") + (urlParts[1] ? "?" + urlParts.slice(1).join("?") : "");
}
async function loadGetInitialProps(App, ctx) {
    if (true) {
        var _App_prototype;
        if ((_App_prototype = App.prototype) == null ? void 0 : _App_prototype.getInitialProps) {
            const message = '"' + getDisplayName(App) + '.getInitialProps()" is defined as an instance method - visit https://nextjs.org/docs/messages/get-initial-props-as-an-instance-method for more information.';
            throw new Error(message);
        }
    }
    // when called from _app `ctx` is nested in `ctx`
    const res = ctx.res || ctx.ctx && ctx.ctx.res;
    if (!App.getInitialProps) {
        if (ctx.ctx && ctx.Component) {
            // @ts-ignore pageProps default
            return {
                pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
            };
        }
        return {};
    }
    const props = await App.getInitialProps(ctx);
    if (res && isResSent(res)) {
        return props;
    }
    if (!props) {
        const message = '"' + getDisplayName(App) + '.getInitialProps()" should resolve to an object. But found "' + props + '" instead.';
        throw new Error(message);
    }
    if (true) {
        if (Object.keys(props).length === 0 && !ctx.ctx) {
            console.warn("" + getDisplayName(App) + " returned an empty object from `getInitialProps`. This de-optimizes and prevents automatic static optimization. https://nextjs.org/docs/messages/empty-object-getInitialProps");
        }
    }
    return props;
}
const SP = typeof performance !== "undefined";
const ST = SP && [
    "mark",
    "measure",
    "getEntriesByName"
].every((method)=>typeof performance[method] === "function");
class DecodeError extends Error {
}
class NormalizeError extends Error {
}
class PageNotFoundError extends Error {
    constructor(page){
        super();
        this.code = "ENOENT";
        this.name = "PageNotFoundError";
        this.message = "Cannot find module for page: " + page;
    }
}
class MissingStaticPage extends Error {
    constructor(page, message){
        super();
        this.message = "Failed to load static file for page: " + page + " " + message;
    }
}
class MiddlewareNotFoundError extends Error {
    constructor(){
        super();
        this.code = "ENOENT";
        this.message = "Cannot find the middleware module";
    }
}
function stringifyError(error) {
    return JSON.stringify({
        message: error.message,
        stack: error.stack
    });
} //# sourceMappingURL=utils.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js":
/*!***************************************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/utils/warn-once.js ***!
  \***************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({
    value: true
}));
Object.defineProperty(exports, "warnOnce", ({
    enumerable: true,
    get: function() {
        return warnOnce;
    }
}));
let warnOnce = (_)=>{};
if (true) {
    const warnings = new Set();
    warnOnce = (msg)=>{
        if (!warnings.has(msg)) {
            console.warn(msg);
        }
        warnings.add(msg);
    };
} //# sourceMappingURL=warn-once.js.map


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js":
/*!***************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dynamic.js ***!
  \***************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/shared/lib/dynamic */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/dynamic.js")


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/head.js ***!
  \************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/shared/lib/head */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/head.js")


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/image.js ***!
  \*************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/shared/lib/image-external */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/shared/lib/image-external.js")


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/link.js ***!
  \************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/client/link */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/link.js")


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/router.js ***!
  \**************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/client/router */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/router.js")


/***/ }),

/***/ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js":
/*!**************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/script.js ***!
  \**************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./dist/client/script */ "../../node_modules/.pnpm/next@14.2.16_@babel+core@7.25.2_react-dom@18.3.1_react@18.3.1/node_modules/next/dist/client/script.js")


/***/ })

};
;