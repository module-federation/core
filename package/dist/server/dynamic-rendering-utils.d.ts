export declare function isHangingPromiseRejectionError(err: unknown): err is HangingPromiseRejectionError;
declare class HangingPromiseRejectionError extends Error {
    readonly expression: string;
    readonly digest = "HANGING_PROMISE_REJECTION";
    constructor(expression: string);
}
export {};
