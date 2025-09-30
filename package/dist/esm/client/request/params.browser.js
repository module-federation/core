export const createRenderParamsFromClient = process.env.NODE_ENV === 'development' ? require('./params.browser.dev').makeDynamicallyTrackedExoticParamsWithDevWarnings : require('./params.browser.prod').makeUntrackedExoticParams;

//# sourceMappingURL=params.browser.js.map