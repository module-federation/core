import { useEffect } from 'react';
import { attachHydrationErrorState } from './attach-hydration-error-state';
import { isNextRouterError } from '../is-next-router-error';
import { storeHydrationErrorStateFromConsoleArgs } from './hydration-error-info';
import { formatConsoleArgs, parseConsoleArgs } from '../../lib/console';
import isError from '../../../lib/is-error';
import { createConsoleError } from './console-error';
import { enqueueConsecutiveDedupedError } from './enqueue-client-error';
import { getReactStitchedError } from '../errors/stitched-error';
const queueMicroTask = globalThis.queueMicrotask || ((cb)=>Promise.resolve().then(cb));
const errorQueue = [];
const errorHandlers = [];
const rejectionQueue = [];
const rejectionHandlers = [];
export function handleConsoleError(originError, consoleErrorArgs) {
    let error;
    const { environmentName } = parseConsoleArgs(consoleErrorArgs);
    if (isError(originError)) {
        error = createConsoleError(originError, environmentName);
    } else {
        error = createConsoleError(formatConsoleArgs(consoleErrorArgs), environmentName);
    }
    error = getReactStitchedError(error);
    storeHydrationErrorStateFromConsoleArgs(...consoleErrorArgs);
    attachHydrationErrorState(error);
    enqueueConsecutiveDedupedError(errorQueue, error);
    for (const handler of errorHandlers){
        // Delayed the error being passed to React Dev Overlay,
        // avoid the state being synchronously updated in the component.
        queueMicroTask(()=>{
            handler(error);
        });
    }
}
export function handleClientError(originError) {
    let error;
    if (isError(originError)) {
        error = originError;
    } else {
        // If it's not an error, format the args into an error
        const formattedErrorMessage = originError + '';
        error = Object.defineProperty(new Error(formattedErrorMessage), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    error = getReactStitchedError(error);
    attachHydrationErrorState(error);
    enqueueConsecutiveDedupedError(errorQueue, error);
    for (const handler of errorHandlers){
        // Delayed the error being passed to React Dev Overlay,
        // avoid the state being synchronously updated in the component.
        queueMicroTask(()=>{
            handler(error);
        });
    }
}
export function useErrorHandler(handleOnUnhandledError, handleOnUnhandledRejection) {
    useEffect(()=>{
        // Handle queued errors.
        errorQueue.forEach(handleOnUnhandledError);
        rejectionQueue.forEach(handleOnUnhandledRejection);
        // Listen to new errors.
        errorHandlers.push(handleOnUnhandledError);
        rejectionHandlers.push(handleOnUnhandledRejection);
        return ()=>{
            // Remove listeners.
            errorHandlers.splice(errorHandlers.indexOf(handleOnUnhandledError), 1);
            rejectionHandlers.splice(rejectionHandlers.indexOf(handleOnUnhandledRejection), 1);
            // Reset error queues.
            errorQueue.splice(0, errorQueue.length);
            rejectionQueue.splice(0, rejectionQueue.length);
        };
    }, [
        handleOnUnhandledError,
        handleOnUnhandledRejection
    ]);
}
function onUnhandledError(event) {
    if (isNextRouterError(event.error)) {
        event.preventDefault();
        return false;
    }
    // When there's an error property present, we log the error to error overlay.
    // Otherwise we don't do anything as it's not logging in the console either.
    if (event.error) {
        handleClientError(event.error);
    }
}
function onUnhandledRejection(ev) {
    const reason = ev == null ? void 0 : ev.reason;
    if (isNextRouterError(reason)) {
        ev.preventDefault();
        return;
    }
    let error = reason;
    if (error && !isError(error)) {
        error = Object.defineProperty(new Error(error + ''), "__NEXT_ERROR_CODE", {
            value: "E394",
            enumerable: false,
            configurable: true
        });
    }
    rejectionQueue.push(error);
    for (const handler of rejectionHandlers){
        handler(error);
    }
}
export function handleGlobalErrors() {
    if (typeof window !== 'undefined') {
        try {
            // Increase the number of stack frames on the client
            Error.stackTraceLimit = 50;
        } catch (e) {}
        window.addEventListener('error', onUnhandledError);
        window.addEventListener('unhandledrejection', onUnhandledRejection);
    }
}

//# sourceMappingURL=use-error-handler.js.map