export function isStableBuild() {
    var _process_env___NEXT_VERSION;
    return !((_process_env___NEXT_VERSION = "15.3.3") == null ? void 0 : _process_env___NEXT_VERSION.includes('canary')) && !process.env.__NEXT_TEST_MODE && !process.env.NEXT_PRIVATE_LOCAL_DEV;
}
export class CanaryOnlyError extends Error {
    constructor(arg){
        if (typeof arg === 'object' && 'feature' in arg) {
            super('The experimental feature "' + arg.feature + '" can only be enabled when using the latest canary version of Next.js.');
        } else {
            super(arg);
        }
        // This error is meant to interrupt the server start/build process
        // but the stack trace isn't meaningful, as it points to internal code.
        this.stack = undefined;
    }
}

//# sourceMappingURL=canary-only.js.map