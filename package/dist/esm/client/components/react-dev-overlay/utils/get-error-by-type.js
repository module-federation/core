import { ACTION_UNHANDLED_ERROR, ACTION_UNHANDLED_REJECTION } from '../shared';
import { getOriginalStackFrames } from './stack-frame';
import { getErrorSource } from '../../../../shared/lib/error-source';
import React from 'react';
export const useFrames = (error)=>{
    if ('use' in React) {
        const frames = error.frames;
        if (typeof frames !== 'function') {
            throw Object.defineProperty(new Error('Invariant: frames must be a function when the React version has React.use. This is a bug in Next.js.'), "__NEXT_ERROR_CODE", {
                value: "E636",
                enumerable: false,
                configurable: true
            });
        }
        return React.use(frames());
    } else {
        if (!Array.isArray(error.frames)) {
            throw Object.defineProperty(new Error('Invariant: frames must be an array when the React version does not have React.use. This is a bug in Next.js.'), "__NEXT_ERROR_CODE", {
                value: "E637",
                enumerable: false,
                configurable: true
            });
        }
        return error.frames;
    }
};
export async function getErrorByType(ev, isAppDir) {
    const { id, event } = ev;
    switch(event.type){
        case ACTION_UNHANDLED_ERROR:
        case ACTION_UNHANDLED_REJECTION:
            {
                const baseError = {
                    id,
                    runtime: true,
                    error: event.reason
                };
                if ('use' in React) {
                    const readyRuntimeError = {
                        ...baseError,
                        // createMemoizedPromise dedups calls to getOriginalStackFrames
                        frames: createMemoizedPromise(async ()=>{
                            return await getOriginalStackFrames(event.frames, getErrorSource(event.reason), isAppDir);
                        })
                    };
                    if (event.type === ACTION_UNHANDLED_ERROR) {
                        readyRuntimeError.componentStackFrames = event.componentStackFrames;
                    }
                    return readyRuntimeError;
                } else {
                    const readyRuntimeError = {
                        ...baseError,
                        // createMemoizedPromise dedups calls to getOriginalStackFrames
                        frames: await getOriginalStackFrames(event.frames, getErrorSource(event.reason), isAppDir)
                    };
                    if (event.type === ACTION_UNHANDLED_ERROR) {
                        readyRuntimeError.componentStackFrames = event.componentStackFrames;
                    }
                    return readyRuntimeError;
                }
            }
        default:
            {
                break;
            }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = event;
    throw Object.defineProperty(new Error('type system invariant violation'), "__NEXT_ERROR_CODE", {
        value: "E335",
        enumerable: false,
        configurable: true
    });
}
function createMemoizedPromise(promiseFactory) {
    const cachedPromise = promiseFactory();
    return function() {
        return cachedPromise;
    };
}

//# sourceMappingURL=get-error-by-type.js.map