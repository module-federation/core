// TODO: Remove use of `any` type. Fix no-use-before-define violations.
/* eslint-disable @typescript-eslint/no-use-before-define */ /**
 * MIT License
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */ /// <reference types="webpack/module.d.ts" />
// This file is a modified version of the Create React App HMR dev client that
// can be found here:
// https://github.com/facebook/create-react-app/blob/v3.4.1/packages/react-dev-utils/webpackHotDevClient.js
/// <reference types="webpack/module.d.ts" />
import { register, onBuildError, onBuildOk, onBeforeRefresh, onRefresh, onVersionInfo, onStaticIndicator, onDevIndicator } from './client';
import stripAnsi from 'next/dist/compiled/strip-ansi';
import { addMessageListener, sendMessage } from './websocket';
import formatWebpackMessages from '../utils/format-webpack-messages';
import { HMR_ACTIONS_SENT_TO_BROWSER } from '../../../../server/dev/hot-reloader-types';
import { REACT_REFRESH_FULL_RELOAD, REACT_REFRESH_FULL_RELOAD_FROM_ERROR, reportInvalidHmrMessage } from '../shared';
import { RuntimeErrorHandler } from '../../errors/runtime-error-handler';
import reportHmrLatency from '../utils/report-hmr-latency';
import { TurbopackHmr } from '../utils/turbopack-hot-reloader-common';
window.__nextDevClientId = Math.round(Math.random() * 100 + Date.now());
let customHmrEventHandler;
let turbopackMessageListeners = [];
export default function connect() {
    register();
    addMessageListener((payload)=>{
        if (!('action' in payload)) {
            return;
        }
        try {
            processMessage(payload);
        } catch (err) {
            reportInvalidHmrMessage(payload, err);
        }
    });
    return {
        subscribeToHmrEvent (handler) {
            customHmrEventHandler = handler;
        },
        onUnrecoverableError () {
            RuntimeErrorHandler.hadRuntimeError = true;
        },
        addTurbopackMessageListener (cb) {
            turbopackMessageListeners.push(cb);
        },
        sendTurbopackMessage (msg) {
            sendMessage(msg);
        },
        handleUpdateError (err) {
            performFullReload(err);
        }
    };
}
// Remember some state related to hot module replacement.
var isFirstCompilation = true;
var mostRecentCompilationHash = null;
var hasCompileErrors = false;
function clearOutdatedErrors() {
    // Clean up outdated compile errors, if any.
    if (typeof console !== 'undefined' && typeof console.clear === 'function') {
        if (hasCompileErrors) {
            console.clear();
        }
    }
}
// Successful compilation.
function handleSuccess() {
    clearOutdatedErrors();
    hasCompileErrors = false;
    if (process.env.TURBOPACK) {
        const hmrUpdate = turbopackHmr.onBuilt();
        if (hmrUpdate != null) {
            reportHmrLatency(sendMessage, [
                ...hmrUpdate.updatedModules
            ], hmrUpdate.startMsSinceEpoch, hmrUpdate.endMsSinceEpoch, hmrUpdate.hasUpdates);
        }
        onBuildOk();
    } else {
        const isHotUpdate = !isFirstCompilation || window.__NEXT_DATA__.page !== '/_error' && isUpdateAvailable();
        // Attempt to apply hot updates or reload.
        if (isHotUpdate) {
            tryApplyUpdatesWebpack();
        }
    }
    isFirstCompilation = false;
}
// Compilation with warnings (e.g. ESLint).
function handleWarnings(warnings) {
    clearOutdatedErrors();
    const isHotUpdate = !isFirstCompilation;
    isFirstCompilation = false;
    hasCompileErrors = false;
    function printWarnings() {
        // Print warnings to the console.
        const formatted = formatWebpackMessages({
            warnings: warnings,
            errors: []
        });
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            var _formatted_warnings;
            for(let i = 0; i < ((_formatted_warnings = formatted.warnings) == null ? void 0 : _formatted_warnings.length); i++){
                if (i === 5) {
                    console.warn('There were more warnings in other files.\n' + 'You can find a complete log in the terminal.');
                    break;
                }
                console.warn(stripAnsi(formatted.warnings[i]));
            }
        }
    }
    printWarnings();
    // Attempt to apply hot updates or reload.
    if (isHotUpdate) {
        tryApplyUpdatesWebpack();
    }
}
// Compilation with errors (e.g. syntax error or missing modules).
function handleErrors(errors) {
    clearOutdatedErrors();
    isFirstCompilation = false;
    hasCompileErrors = true;
    // "Massage" webpack messages.
    var formatted = formatWebpackMessages({
        errors: errors,
        warnings: []
    });
    // Only show the first error.
    onBuildError(formatted.errors[0]);
    // Also log them to the console.
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        for(var i = 0; i < formatted.errors.length; i++){
            console.error(stripAnsi(formatted.errors[i]));
        }
    }
    // Do not attempt to reload now.
    // We will reload on next success instead.
    if (process.env.__NEXT_TEST_MODE) {
        if (self.__NEXT_HMR_CB) {
            self.__NEXT_HMR_CB(formatted.errors[0]);
            self.__NEXT_HMR_CB = null;
        }
    }
}
let webpackStartMsSinceEpoch = null;
const turbopackHmr = process.env.TURBOPACK ? new TurbopackHmr() : null;
let isrManifest = {};
// There is a newer version of the code available.
function handleAvailableHash(hash) {
    // Update last known compilation hash.
    mostRecentCompilationHash = hash;
}
export function handleStaticIndicator() {
    if (process.env.__NEXT_DEV_INDICATOR) {
        var _window_next_router_components__app;
        const routeInfo = window.next.router.components[window.next.router.pathname];
        const pageComponent = routeInfo == null ? void 0 : routeInfo.Component;
        const appComponent = (_window_next_router_components__app = window.next.router.components['/_app']) == null ? void 0 : _window_next_router_components__app.Component;
        const isDynamicPage = Boolean(pageComponent == null ? void 0 : pageComponent.getInitialProps) || Boolean(routeInfo == null ? void 0 : routeInfo.__N_SSP);
        const hasAppGetInitialProps = Boolean(appComponent == null ? void 0 : appComponent.getInitialProps) && (appComponent == null ? void 0 : appComponent.getInitialProps) !== (appComponent == null ? void 0 : appComponent.origGetInitialProps);
        const isPageStatic = window.location.pathname in isrManifest || !isDynamicPage && !hasAppGetInitialProps;
        onStaticIndicator(isPageStatic);
    }
}
/** Handles messages from the server for the Pages Router. */ function processMessage(obj) {
    if (!('action' in obj)) {
        return;
    }
    switch(obj.action){
        case HMR_ACTIONS_SENT_TO_BROWSER.ISR_MANIFEST:
            {
                isrManifest = obj.data;
                handleStaticIndicator();
                break;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.BUILDING:
            {
                if (process.env.TURBOPACK) {
                    turbopackHmr.onBuilding();
                } else {
                    webpackStartMsSinceEpoch = Date.now();
                    console.log('[Fast Refresh] rebuilding');
                }
                break;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.BUILT:
        case HMR_ACTIONS_SENT_TO_BROWSER.SYNC:
            {
                if (obj.hash) handleAvailableHash(obj.hash);
                const { errors, warnings } = obj;
                // Is undefined when it's a 'built' event
                if ('versionInfo' in obj) onVersionInfo(obj.versionInfo);
                if ('devIndicator' in obj) onDevIndicator(obj.devIndicator);
                const hasErrors = Boolean(errors && errors.length);
                if (hasErrors) {
                    sendMessage(JSON.stringify({
                        event: 'client-error',
                        errorCount: errors.length,
                        clientId: window.__nextDevClientId
                    }));
                    return handleErrors(errors);
                }
                // NOTE: Turbopack does not currently send warnings
                const hasWarnings = Boolean(warnings && warnings.length);
                if (hasWarnings) {
                    sendMessage(JSON.stringify({
                        event: 'client-warning',
                        warningCount: warnings.length,
                        clientId: window.__nextDevClientId
                    }));
                    return handleWarnings(warnings);
                }
                sendMessage(JSON.stringify({
                    event: 'client-success',
                    clientId: window.__nextDevClientId
                }));
                return handleSuccess();
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.SERVER_COMPONENT_CHANGES:
            {
                turbopackHmr == null ? void 0 : turbopackHmr.onServerComponentChanges();
                if (hasCompileErrors || RuntimeErrorHandler.hadRuntimeError) {
                    window.location.reload();
                }
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.SERVER_ERROR:
            {
                const { errorJSON } = obj;
                if (errorJSON) {
                    const { message, stack } = JSON.parse(errorJSON);
                    const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
                        value: "E394",
                        enumerable: false,
                        configurable: true
                    });
                    error.stack = stack;
                    handleErrors([
                        error
                    ]);
                }
                return;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.TURBOPACK_CONNECTED:
            {
                for (const listener of turbopackMessageListeners){
                    listener({
                        type: HMR_ACTIONS_SENT_TO_BROWSER.TURBOPACK_CONNECTED,
                        data: obj.data
                    });
                }
                break;
            }
        case HMR_ACTIONS_SENT_TO_BROWSER.TURBOPACK_MESSAGE:
            {
                turbopackHmr.onTurbopackMessage(obj);
                onBeforeRefresh();
                for (const listener of turbopackMessageListeners){
                    listener({
                        type: HMR_ACTIONS_SENT_TO_BROWSER.TURBOPACK_MESSAGE,
                        data: obj.data
                    });
                }
                if (RuntimeErrorHandler.hadRuntimeError) {
                    console.warn(REACT_REFRESH_FULL_RELOAD_FROM_ERROR);
                    performFullReload(null);
                }
                onRefresh();
                break;
            }
        default:
            {
                if (customHmrEventHandler) {
                    customHmrEventHandler(obj);
                    break;
                }
                break;
            }
    }
}
// Is there a newer version of this code available?
function isUpdateAvailable() {
    /* globals __webpack_hash__ */ // __webpack_hash__ is the hash of the current compilation.
    // It's a global variable injected by Webpack.
    return mostRecentCompilationHash !== __webpack_hash__;
}
// Webpack disallows updates in other states.
function canApplyUpdates() {
    return module.hot.status() === 'idle';
}
function afterApplyUpdates(fn) {
    if (canApplyUpdates()) {
        fn();
    } else {
        function handler(status) {
            if (status === 'idle') {
                module.hot.removeStatusHandler(handler);
                fn();
            }
        }
        module.hot.addStatusHandler(handler);
    }
}
// Attempt to update code on the fly, fall back to a hard reload.
function tryApplyUpdatesWebpack() {
    if (!module.hot) {
        // HotModuleReplacementPlugin is not in Webpack configuration.
        console.error('HotModuleReplacementPlugin is not in Webpack configuration.');
        // window.location.reload();
        return;
    }
    if (!isUpdateAvailable() || !canApplyUpdates()) {
        onBuildOk();
        return;
    }
    function handleApplyUpdates(err, updatedModules) {
        if (err || RuntimeErrorHandler.hadRuntimeError || updatedModules == null) {
            if (err) {
                console.warn(REACT_REFRESH_FULL_RELOAD);
            } else if (RuntimeErrorHandler.hadRuntimeError) {
                console.warn(REACT_REFRESH_FULL_RELOAD_FROM_ERROR);
            }
            performFullReload(err);
            return;
        }
        onBuildOk();
        if (isUpdateAvailable()) {
            // While we were updating, there was a new update! Do it again.
            tryApplyUpdatesWebpack();
            return;
        }
        onRefresh();
        reportHmrLatency(sendMessage, updatedModules, webpackStartMsSinceEpoch, Date.now());
        if (process.env.__NEXT_TEST_MODE) {
            afterApplyUpdates(()=>{
                if (self.__NEXT_HMR_CB) {
                    self.__NEXT_HMR_CB();
                    self.__NEXT_HMR_CB = null;
                }
            });
        }
    }
    // https://webpack.js.org/api/hot-module-replacement/#check
    module.hot.check(/* autoApply */ false).then((updatedModules)=>{
        if (updatedModules == null) {
            return null;
        }
        // We should always handle an update, even if updatedModules is empty (but
        // non-null) for any reason. That's what webpack would normally do:
        // https://github.com/webpack/webpack/blob/3aa6b6bc3a64/lib/hmr/HotModuleReplacement.runtime.js#L296-L298
        onBeforeRefresh();
        // https://webpack.js.org/api/hot-module-replacement/#apply
        return module.hot.apply();
    }).then((updatedModules)=>{
        handleApplyUpdates(null, updatedModules);
    }, (err)=>{
        handleApplyUpdates(err, null);
    });
}
export function performFullReload(err) {
    const stackTrace = err && (err.stack && err.stack.split('\n').slice(0, 5).join('\n') || err.message || err + '');
    sendMessage(JSON.stringify({
        event: 'client-full-reload',
        stackTrace,
        hadRuntimeError: !!RuntimeErrorHandler.hadRuntimeError,
        dependencyChain: err ? err.dependencyChain : undefined
    }));
    window.location.reload();
}

//# sourceMappingURL=hot-reloader-client.js.map