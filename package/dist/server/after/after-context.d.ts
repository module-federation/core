import type { RequestLifecycleOpts } from '../base-server';
import type { AfterTask } from './after';
export type AfterContextOpts = {
    waitUntil: RequestLifecycleOpts['waitUntil'] | undefined;
    onClose: RequestLifecycleOpts['onClose'];
    onTaskError: RequestLifecycleOpts['onAfterTaskError'] | undefined;
};
export declare class AfterContext {
    private waitUntil;
    private onClose;
    private onTaskError;
    private runCallbacksOnClosePromise;
    private callbackQueue;
    private workUnitStores;
    constructor({ waitUntil, onClose, onTaskError }: AfterContextOpts);
    after(task: AfterTask): void;
    private addCallback;
    private runCallbacksOnClose;
    private runCallbacks;
    private reportTaskError;
}
