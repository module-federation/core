const error = new Proxy({}, {
    get (_target) {
        throw Object.defineProperty(new Error('Using client components is not allowed in this environment.'), "__NEXT_ERROR_CODE", {
            value: "E44",
            enumerable: false,
            configurable: true
        });
    }
});
export default new Proxy({}, {
    get: (_target, p)=>{
        if (p === '__esModule') return true;
        return error;
    }
});

//# sourceMappingURL=use-client-disallowed.js.map