export const createRenderSearchParamsFromClient = process.env.NODE_ENV === 'development' ? require('./search-params.browser.dev').makeUntrackedExoticSearchParamsWithDevWarnings : require('./search-params.browser.prod').makeUntrackedExoticSearchParams;

//# sourceMappingURL=search-params.browser.js.map