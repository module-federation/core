export const reportGlobalError = typeof reportError === 'function' ? // emulating an uncaught JavaScript error.
reportError : (error)=>{
    // TODO: Dispatch error event
    globalThis.console.error(error);
};

//# sourceMappingURL=report-global-error.js.map