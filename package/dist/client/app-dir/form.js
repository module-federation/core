'use client';
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return Form;
    }
});
const _jsxruntime = require("react/jsx-runtime");
const _react = require("react");
const _addbasepath = require("../add-base-path");
const _usemergedref = require("../use-merged-ref");
const _approutercontextsharedruntime = require("../../shared/lib/app-router-context.shared-runtime");
const _routerreducertypes = require("../components/router-reducer/router-reducer-types");
const _formshared = require("../form-shared");
const _links = require("../components/links");
function Form(param) {
    let { replace, scroll, prefetch: prefetchProp, ref: externalRef, ...props } = param;
    const router = (0, _react.useContext)(_approutercontextsharedruntime.AppRouterContext);
    const actionProp = props.action;
    const isNavigatingForm = typeof actionProp === 'string';
    // Validate `action`
    if (process.env.NODE_ENV === 'development') {
        if (isNavigatingForm) {
            (0, _formshared.checkFormActionUrl)(actionProp, 'action');
        }
    }
    // Validate `prefetch`
    if (process.env.NODE_ENV === 'development') {
        if (!(prefetchProp === undefined || prefetchProp === false || prefetchProp === null)) {
            console.error('The `prefetch` prop of <Form> must be `false` or `null`');
        }
        if (prefetchProp !== undefined && !isNavigatingForm) {
            console.error('Passing `prefetch` to a <Form> whose `action` is a function has no effect.');
        }
    }
    const prefetch = prefetchProp === false || prefetchProp === null ? prefetchProp : null;
    // Validate `scroll` and `replace`
    if (process.env.NODE_ENV === 'development') {
        if (!isNavigatingForm && (replace !== undefined || scroll !== undefined)) {
            console.error('Passing `replace` or `scroll` to a <Form> whose `action` is a function has no effect.\n' + 'See the relevant docs to learn how to control this behavior for navigations triggered from actions:\n' + '  `redirect()`       - https://nextjs.org/docs/app/api-reference/functions/redirect#parameters\n' + '  `router.replace()` - https://nextjs.org/docs/app/api-reference/functions/use-router#userouter\n');
        }
    }
    // Clean up any unsupported form props (and warn if present)
    for (const key of _formshared.DISALLOWED_FORM_PROPS){
        if (key in props) {
            if (process.env.NODE_ENV === 'development') {
                console.error("<Form> does not support changing `" + key + "`. " + (isNavigatingForm ? "If you'd like to use it to perform a mutation, consider making `action` a function instead.\n" + "Learn more: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations" : ''));
            }
            delete props[key];
        }
    }
    const isPrefetchEnabled = // if we don't have an action path, we can't prefetch anything.
    !!router && isNavigatingForm && prefetch === null;
    const observeFormVisibilityOnMount = (0, _react.useCallback)((element)=>{
        if (isPrefetchEnabled && router !== null) {
            (0, _links.mountFormInstance)(element, actionProp, router, _routerreducertypes.PrefetchKind.AUTO);
        }
        return ()=>{
            (0, _links.unmountPrefetchableInstance)(element);
        };
    }, [
        isPrefetchEnabled,
        actionProp,
        router
    ]);
    const mergedRef = (0, _usemergedref.useMergedRef)(observeFormVisibilityOnMount, externalRef != null ? externalRef : null);
    if (!isNavigatingForm) {
        return /*#__PURE__*/ (0, _jsxruntime.jsx)("form", {
            ...props,
            ref: mergedRef
        });
    }
    const actionHref = (0, _addbasepath.addBasePath)(actionProp);
    return /*#__PURE__*/ (0, _jsxruntime.jsx)("form", {
        ...props,
        ref: mergedRef,
        action: actionHref,
        onSubmit: (event)=>onFormSubmit(event, {
                router,
                actionHref,
                replace,
                scroll,
                onSubmit: props.onSubmit
            })
    });
}
function onFormSubmit(event, param) {
    let { actionHref, onSubmit, replace, scroll, router } = param;
    if (typeof onSubmit === 'function') {
        onSubmit(event);
        // if the user called event.preventDefault(), do nothing.
        // (this matches what Link does for `onClick`)
        if (event.defaultPrevented) {
            return;
        }
    }
    if (!router) {
        // Form was somehow used outside of the router (but not in pages, the implementation is forked!).
        // We can't perform a soft navigation, so let the native submit handling do its thing.
        return;
    }
    const formElement = event.currentTarget;
    const submitter = event.nativeEvent.submitter;
    let action = actionHref;
    if (submitter) {
        if (process.env.NODE_ENV === 'development') {
            // the way server actions are encoded (e.g. `formMethod="post")
            // causes some unnecessary dev-mode warnings from `hasUnsupportedSubmitterAttributes`.
            // we'd bail out anyway, but we just do it silently.
            if (hasReactServerActionAttributes(submitter)) {
                return;
            }
        }
        if ((0, _formshared.hasUnsupportedSubmitterAttributes)(submitter)) {
            return;
        }
        // client actions have `formAction="javascript:..."`. We obviously can't prefetch/navigate to that.
        if ((0, _formshared.hasReactClientActionAttributes)(submitter)) {
            return;
        }
        // If the submitter specified an alternate formAction,
        // use that URL instead -- this is what a native form would do.
        // NOTE: `submitter.formAction` is unreliable, because it will give us `location.href` if it *wasn't* set
        // NOTE: this should not have `basePath` added, because we can't add it before hydration
        const submitterFormAction = submitter.getAttribute('formAction');
        if (submitterFormAction !== null) {
            if (process.env.NODE_ENV === 'development') {
                (0, _formshared.checkFormActionUrl)(submitterFormAction, 'formAction');
            }
            action = submitterFormAction;
        }
    }
    const targetUrl = (0, _formshared.createFormSubmitDestinationUrl)(action, formElement);
    // Finally, no more reasons for bailing out.
    event.preventDefault();
    const method = replace ? 'replace' : 'push';
    const targetHref = targetUrl.href;
    router[method](targetHref, {
        scroll
    });
}
function hasReactServerActionAttributes(submitter) {
    // https://github.com/facebook/react/blob/942eb80381b96f8410eab1bef1c539bed1ab0eb1/packages/react-client/src/ReactFlightReplyClient.js#L931-L934
    const name = submitter.getAttribute('name');
    return name && (name.startsWith('$ACTION_ID_') || name.startsWith('$ACTION_REF_'));
}

if ((typeof exports.default === 'function' || (typeof exports.default === 'object' && exports.default !== null)) && typeof exports.default.__esModule === 'undefined') {
  Object.defineProperty(exports.default, '__esModule', { value: true });
  Object.assign(exports.default, exports);
  module.exports = exports.default;
}

//# sourceMappingURL=form.js.map