"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    DISALLOWED_FORM_PROPS: null,
    checkFormActionUrl: null,
    createFormSubmitDestinationUrl: null,
    hasReactClientActionAttributes: null,
    hasUnsupportedSubmitterAttributes: null,
    isSupportedFormEncType: null,
    isSupportedFormMethod: null,
    isSupportedFormTarget: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    DISALLOWED_FORM_PROPS: function() {
        return DISALLOWED_FORM_PROPS;
    },
    checkFormActionUrl: function() {
        return checkFormActionUrl;
    },
    createFormSubmitDestinationUrl: function() {
        return createFormSubmitDestinationUrl;
    },
    hasReactClientActionAttributes: function() {
        return hasReactClientActionAttributes;
    },
    hasUnsupportedSubmitterAttributes: function() {
        return hasUnsupportedSubmitterAttributes;
    },
    isSupportedFormEncType: function() {
        return isSupportedFormEncType;
    },
    isSupportedFormMethod: function() {
        return isSupportedFormMethod;
    },
    isSupportedFormTarget: function() {
        return isSupportedFormTarget;
    }
});
const DISALLOWED_FORM_PROPS = [
    'method',
    'encType',
    'target'
];
function createFormSubmitDestinationUrl(action, formElement) {
    let targetUrl;
    try {
        // NOTE: It might be more correct to resolve URLs relative to `document.baseURI`,
        // but we already do it relative to `location.href` elsewhere:
        //  (see e.g. https://github.com/vercel/next.js/blob/bb0e6722f87ceb2d43015f5b8a413d0072f2badf/packages/next/src/client/components/app-router.tsx#L146)
        // so it's better to stay consistent.
        const base = window.location.href;
        targetUrl = new URL(action, base);
    } catch (err) {
        throw Object.defineProperty(new Error('Cannot parse form action "' + action + '" as a URL', {
            cause: err
        }), "__NEXT_ERROR_CODE", {
            value: "E152",
            enumerable: false,
            configurable: true
        });
    }
    if (targetUrl.searchParams.size) {
        // url-encoded HTML forms *overwrite* any search params in the `action` url:
        //
        //  "Let `query` be the result of running the application/x-www-form-urlencoded serializer [...]"
        //  "Set parsed action's query component to `query`."
        //   https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#submit-mutate-action
        //
        // We need to match that.
        // (note that all other parts of the URL, like `hash`, are preserved)
        targetUrl.search = '';
    }
    const formData = new FormData(formElement);
    for (let [name, value] of formData){
        if (typeof value !== 'string') {
            // For file inputs, the native browser behavior is to use the filename as the value instead:
            //
            //   "If entry's value is a File object, then let value be entry's value's name. Otherwise, let value be entry's value."
            //   https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#converting-an-entry-list-to-a-list-of-name-value-pairs
            //
            if (process.env.NODE_ENV === 'development') {
                console.warn("<Form> only supports file inputs if `action` is a function. File inputs cannot be used if `action` is a string, " + "because files cannot be encoded as search params.");
            }
            value = value.name;
        }
        targetUrl.searchParams.append(name, value);
    }
    return targetUrl;
}
function checkFormActionUrl(action, source) {
    const aPropName = source === 'action' ? "an `action`" : "a `formAction`";
    let testUrl;
    try {
        testUrl = new URL(action, 'http://n');
    } catch (err) {
        console.error("<Form> received " + aPropName + ' that cannot be parsed as a URL: "' + action + '".');
        return;
    }
    // url-encoded HTML forms ignore any queryparams in the `action` url. We need to match that.
    if (testUrl.searchParams.size) {
        console.warn("<Form> received " + aPropName + ' that contains search params: "' + action + '". This is not supported, and they will be ignored. ' + 'If you need to pass in additional search params, use an `<input type="hidden" />` instead.');
    }
}
const isSupportedFormEncType = (value)=>value === 'application/x-www-form-urlencoded';
const isSupportedFormMethod = (value)=>value === 'get';
const isSupportedFormTarget = (value)=>value === '_self';
function hasUnsupportedSubmitterAttributes(submitter) {
    // A submitter can override `encType` for the form.
    const formEncType = submitter.getAttribute('formEncType');
    if (formEncType !== null && !isSupportedFormEncType(formEncType)) {
        if (process.env.NODE_ENV === 'development') {
            console.error("<Form>'s `encType` was set to an unsupported value via `formEncType=\"" + formEncType + '"`. ' + "This will disable <Form>'s navigation functionality. If you need this, use a native <form> element instead.");
        }
        return true;
    }
    // A submitter can override `method` for the form.
    const formMethod = submitter.getAttribute('formMethod');
    if (formMethod !== null && !isSupportedFormMethod(formMethod)) {
        if (process.env.NODE_ENV === 'development') {
            console.error("<Form>'s `method` was set to an unsupported value via `formMethod=\"" + formMethod + '"`. ' + "This will disable <Form>'s navigation functionality. If you need this, use a native <form> element instead.");
        }
        return true;
    }
    // A submitter can override `target` for the form.
    const formTarget = submitter.getAttribute('formTarget');
    if (formTarget !== null && !isSupportedFormTarget(formTarget)) {
        if (process.env.NODE_ENV === 'development') {
            console.error("<Form>'s `target` was set to an unsupported value via `formTarget=\"" + formTarget + '"`. ' + "This will disable <Form>'s navigation functionality. If you need this, use a native <form> element instead.");
        }
        return true;
    }
    return false;
}
function hasReactClientActionAttributes(submitter) {
    // CSR: https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L482-L487
    // SSR: https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-dom-bindings/src/client/ReactDOMComponent.js#L2401
    const action = submitter.getAttribute('formAction');
    return action && /\s*javascript:/i.test(action);
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=form-shared.js.map