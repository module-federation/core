export const lazyRenderAppPage = (...args)=>{
    if (process.env.NEXT_MINIMAL) {
        throw Object.defineProperty(new Error("Can't use lazyRenderAppPage in minimal mode"), "__NEXT_ERROR_CODE", {
            value: "E256",
            enumerable: false,
            configurable: true
        });
    } else {
        const render = require('./module.compiled').renderToHTMLOrFlight;
        return render(...args);
    }
};

//# sourceMappingURL=module.render.js.map