import { InvariantError } from '../../shared/lib/invariant-error';
/**
 * Provides a `waitUntil` implementation which gathers promises to be awaited later (via {@link AwaiterMulti.awaiting}).
 * Unlike a simple `Promise.all`, {@link AwaiterMulti} works recursively --
 * if a promise passed to {@link AwaiterMulti.waitUntil} calls `waitUntil` again,
 * that second promise will also be awaited.
 */ export class AwaiterMulti {
    constructor({ onError } = {}){
        this.promises = new Set();
        this.waitUntil = (promise)=>{
            // if a promise settles before we await it, we should drop it --
            // storing them indefinitely could result in a memory leak.
            const cleanup = ()=>{
                this.promises.delete(promise);
            };
            promise.then(cleanup, (err)=>{
                cleanup();
                this.onError(err);
            });
            this.promises.add(promise);
        };
        this.onError = onError ?? console.error;
    }
    async awaiting() {
        while(this.promises.size > 0){
            const promises = Array.from(this.promises);
            this.promises.clear();
            await Promise.allSettled(promises);
        }
    }
}
/**
 * Like {@link AwaiterMulti}, but can only be awaited once.
 * If {@link AwaiterOnce.waitUntil} is called after that, it will throw.
 */ export class AwaiterOnce {
    constructor(options = {}){
        this.done = false;
        this.waitUntil = (promise)=>{
            if (this.done) {
                throw Object.defineProperty(new InvariantError('Cannot call waitUntil() on an AwaiterOnce that was already awaited'), "__NEXT_ERROR_CODE", {
                    value: "E563",
                    enumerable: false,
                    configurable: true
                });
            }
            return this.awaiter.waitUntil(promise);
        };
        this.awaiter = new AwaiterMulti(options);
    }
    async awaiting() {
        if (!this.pending) {
            this.pending = this.awaiter.awaiting().finally(()=>{
                this.done = true;
            });
        }
        return this.pending;
    }
}

//# sourceMappingURL=awaiter.js.map