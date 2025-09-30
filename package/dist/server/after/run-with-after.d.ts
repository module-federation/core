import type { AfterContextOpts } from './after-context';
type Ctx = {
    waitUntil: NonNullable<AfterContextOpts['waitUntil']>;
    onClose: NonNullable<AfterContextOpts['onClose']>;
    onTaskError: NonNullable<AfterContextOpts['onTaskError']>;
};
export declare class AfterRunner {
    private awaiter;
    private closeController;
    private finishedWithoutErrors;
    readonly context: Ctx;
    executeAfter(): Promise<void>;
}
export {};
