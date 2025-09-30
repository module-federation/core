import { InvariantError } from '../../shared/lib/invariant-error';
import { isPrerenderInterruptedError } from './dynamic-rendering';
/**
 * This is a utility function to make scheduling sequential tasks that run back to back easier.
 * We schedule on the same queue (setImmediate) at the same time to ensure no other events can sneak in between.
 */ export function prerenderAndAbortInSequentialTasks(prerender, abort) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new InvariantError('`prerenderAndAbortInSequentialTasks` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E538",
            enumerable: false,
            configurable: true
        });
    } else {
        return new Promise((resolve, reject)=>{
            let pendingResult;
            setImmediate(()=>{
                try {
                    pendingResult = prerender();
                    pendingResult.catch(()=>{});
                } catch (err) {
                    reject(err);
                }
            });
            setImmediate(()=>{
                abort();
                resolve(pendingResult);
            });
        });
    }
}
export function prerenderServerWithPhases(signal, render, ...remainingPhases) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new InvariantError('`prerenderAndAbortInSequentialTasks` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E538",
            enumerable: false,
            configurable: true
        });
    } else {
        return new Promise((resolve, reject)=>{
            let result;
            signal.addEventListener('abort', ()=>{
                if (isPrerenderInterruptedError(signal.reason)) {
                    result.markInterrupted();
                } else {
                    result.markComplete();
                }
            }, {
                once: true
            });
            setImmediate(()=>{
                try {
                    result = new ServerPrerenderStreamResult(render());
                } catch (err) {
                    reject(err);
                }
            });
            function runFinalTask() {
                try {
                    if (result) {
                        result.markComplete();
                        this();
                    }
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            }
            function runNextTask() {
                try {
                    if (result) {
                        result.markPhase();
                        this();
                    }
                } catch (err) {
                    reject(err);
                }
            }
            let i = 0;
            for(; i < remainingPhases.length - 1; i++){
                const phase = remainingPhases[i];
                setImmediate(runNextTask.bind(phase));
            }
            if (remainingPhases[i]) {
                const finalPhase = remainingPhases[i];
                setImmediate(runFinalTask.bind(finalPhase));
            }
        });
    }
}
const PENDING = 0;
const COMPLETE = 1;
const INTERRUPTED = 2;
const ERRORED = 3;
export class ServerPrerenderStreamResult {
    constructor(stream){
        this.status = PENDING;
        this.reason = null;
        this.trailingChunks = [];
        this.currentChunks = [];
        this.chunksByPhase = [
            this.currentChunks
        ];
        const reader = stream.getReader();
        const progress = ({ done, value })=>{
            if (done) {
                if (this.status === PENDING) {
                    this.status = COMPLETE;
                }
                return;
            }
            if (this.status === PENDING || this.status === INTERRUPTED) {
                this.currentChunks.push(value);
            } else {
                this.trailingChunks.push(value);
            }
            reader.read().then(progress, error);
        };
        const error = (reason)=>{
            this.status = ERRORED;
            this.reason = reason;
        };
        reader.read().then(progress, error);
    }
    markPhase() {
        this.currentChunks = [];
        this.chunksByPhase.push(this.currentChunks);
    }
    markComplete() {
        if (this.status === PENDING) {
            this.status = COMPLETE;
        }
    }
    markInterrupted() {
        this.status = INTERRUPTED;
    }
    /**
   * Returns a stream which only releases chunks when `releasePhase` is called. This stream will never "complete" because
   * we rely upon the stream remaining open when prerendering to avoid triggering errors for incomplete chunks in the client.
   *
   * asPhasedStream is expected to be called once per result however it is safe to call multiple times as long as we have not
   * transferred the underlying data. Generally this will only happen when streaming to a response
   */ asPhasedStream() {
        switch(this.status){
            case COMPLETE:
            case INTERRUPTED:
                return new PhasedStream(this.chunksByPhase);
            default:
                throw Object.defineProperty(new InvariantError(`ServerPrerenderStreamResult cannot be consumed as a stream because it is not yet complete. status: ${this.status}`), "__NEXT_ERROR_CODE", {
                    value: "E612",
                    enumerable: false,
                    configurable: true
                });
        }
    }
    /**
   * Returns a stream which will release all chunks immediately. This stream will "complete" synchronously. It should be used outside
   * of render use cases like loading client chunks ahead of SSR or writing the streamed content to disk.
   */ asStream() {
        switch(this.status){
            case COMPLETE:
            case INTERRUPTED:
                const chunksByPhase = this.chunksByPhase;
                const trailingChunks = this.trailingChunks;
                return new ReadableStream({
                    start (controller) {
                        for(let i = 0; i < chunksByPhase.length; i++){
                            const chunks = chunksByPhase[i];
                            for(let j = 0; j < chunks.length; j++){
                                controller.enqueue(chunks[j]);
                            }
                        }
                        for(let i = 0; i < trailingChunks.length; i++){
                            controller.enqueue(trailingChunks[i]);
                        }
                        controller.close();
                    }
                });
            default:
                throw Object.defineProperty(new InvariantError(`ServerPrerenderStreamResult cannot be consumed as a stream because it is not yet complete. status: ${this.status}`), "__NEXT_ERROR_CODE", {
                    value: "E612",
                    enumerable: false,
                    configurable: true
                });
        }
    }
}
class PhasedStream extends ReadableStream {
    constructor(chunksByPhase){
        if (chunksByPhase.length === 0) {
            throw Object.defineProperty(new InvariantError('PhasedStream expected at least one phase but none were found.'), "__NEXT_ERROR_CODE", {
                value: "E574",
                enumerable: false,
                configurable: true
            });
        }
        let destination;
        super({
            start (controller) {
                destination = controller;
            }
        });
        // the start function above is called synchronously during construction so we will always have a destination
        // We wait to assign it until after the super call because we cannot access `this` before calling super
        this.destination = destination;
        this.nextPhase = 0;
        this.chunksByPhase = chunksByPhase;
        this.releasePhase();
    }
    releasePhase() {
        if (this.nextPhase < this.chunksByPhase.length) {
            const chunks = this.chunksByPhase[this.nextPhase++];
            for(let i = 0; i < chunks.length; i++){
                this.destination.enqueue(chunks[i]);
            }
        } else {
            throw Object.defineProperty(new InvariantError('PhasedStream expected more phases to release but none were found.'), "__NEXT_ERROR_CODE", {
                value: "E541",
                enumerable: false,
                configurable: true
            });
        }
    }
    assertExhausted() {
        if (this.nextPhase < this.chunksByPhase.length) {
            throw Object.defineProperty(new InvariantError('PhasedStream expected no more phases to release but some were found.'), "__NEXT_ERROR_CODE", {
                value: "E584",
                enumerable: false,
                configurable: true
            });
        }
    }
}
export function prerenderClientWithPhases(render, ...remainingPhases) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        throw Object.defineProperty(new InvariantError('`prerenderAndAbortInSequentialTasks` should not be called in edge runtime.'), "__NEXT_ERROR_CODE", {
            value: "E538",
            enumerable: false,
            configurable: true
        });
    } else {
        return new Promise((resolve, reject)=>{
            let pendingResult;
            setImmediate(()=>{
                try {
                    pendingResult = render();
                    pendingResult.catch((err)=>reject(err));
                } catch (err) {
                    reject(err);
                }
            });
            function runFinalTask() {
                try {
                    this();
                    resolve(pendingResult);
                } catch (err) {
                    reject(err);
                }
            }
            function runNextTask() {
                try {
                    this();
                } catch (err) {
                    reject(err);
                }
            }
            let i = 0;
            for(; i < remainingPhases.length - 1; i++){
                const phase = remainingPhases[i];
                setImmediate(runNextTask.bind(phase));
            }
            if (remainingPhases[i]) {
                const finalPhase = remainingPhases[i];
                setImmediate(runFinalTask.bind(finalPhase));
            }
        });
    }
}
// React's RSC prerender function will emit an incomplete flight stream when using `prerender`. If the connection
// closes then whatever hanging chunks exist will be errored. This is because prerender (an experimental feature)
// has not yet implemented a concept of resume. For now we will simulate a paused connection by wrapping the stream
// in one that doesn't close even when the underlying is complete.
export class ReactServerResult {
    constructor(stream){
        this._stream = stream;
    }
    tee() {
        if (this._stream === null) {
            throw Object.defineProperty(new Error('Cannot tee a ReactServerResult that has already been consumed'), "__NEXT_ERROR_CODE", {
                value: "E106",
                enumerable: false,
                configurable: true
            });
        }
        const tee = this._stream.tee();
        this._stream = tee[0];
        return tee[1];
    }
    consume() {
        if (this._stream === null) {
            throw Object.defineProperty(new Error('Cannot consume a ReactServerResult that has already been consumed'), "__NEXT_ERROR_CODE", {
                value: "E470",
                enumerable: false,
                configurable: true
            });
        }
        const stream = this._stream;
        this._stream = null;
        return stream;
    }
}
export async function createReactServerPrerenderResult(underlying) {
    const chunks = [];
    const { prelude } = await underlying;
    const reader = prelude.getReader();
    while(true){
        const { done, value } = await reader.read();
        if (done) {
            return new ReactServerPrerenderResult(chunks);
        } else {
            chunks.push(value);
        }
    }
}
export async function createReactServerPrerenderResultFromRender(underlying) {
    const chunks = [];
    const reader = underlying.getReader();
    while(true){
        const { done, value } = await reader.read();
        if (done) {
            break;
        } else {
            chunks.push(value);
        }
    }
    return new ReactServerPrerenderResult(chunks);
}
export class ReactServerPrerenderResult {
    assertChunks(expression) {
        if (this._chunks === null) {
            throw Object.defineProperty(new InvariantError(`Cannot \`${expression}\` on a ReactServerPrerenderResult that has already been consumed.`), "__NEXT_ERROR_CODE", {
                value: "E593",
                enumerable: false,
                configurable: true
            });
        }
        return this._chunks;
    }
    consumeChunks(expression) {
        const chunks = this.assertChunks(expression);
        this.consume();
        return chunks;
    }
    consume() {
        this._chunks = null;
    }
    constructor(chunks){
        this._chunks = chunks;
    }
    asUnclosingStream() {
        const chunks = this.assertChunks('asUnclosingStream()');
        return createUnclosingStream(chunks);
    }
    consumeAsUnclosingStream() {
        const chunks = this.consumeChunks('consumeAsUnclosingStream()');
        return createUnclosingStream(chunks);
    }
    asStream() {
        const chunks = this.assertChunks('asStream()');
        return createClosingStream(chunks);
    }
    consumeAsStream() {
        const chunks = this.consumeChunks('consumeAsStream()');
        return createClosingStream(chunks);
    }
}
function createUnclosingStream(chunks) {
    let i = 0;
    return new ReadableStream({
        async pull (controller) {
            if (i < chunks.length) {
                controller.enqueue(chunks[i++]);
            }
        // we intentionally keep the stream open. The consumer will clear
        // out chunks once finished and the remaining memory will be GC'd
        // when this object goes out of scope
        }
    });
}
function createClosingStream(chunks) {
    let i = 0;
    return new ReadableStream({
        async pull (controller) {
            if (i < chunks.length) {
                controller.enqueue(chunks[i++]);
            } else {
                controller.close();
            }
        }
    });
}

//# sourceMappingURL=app-render-prerender-utils.js.map