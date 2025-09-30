import { createContext, useContext } from 'react';
export const HtmlContext = createContext(undefined);
if (process.env.NODE_ENV !== 'production') {
    HtmlContext.displayName = 'HtmlContext';
}
export function useHtmlContext() {
    const context = useContext(HtmlContext);
    if (!context) {
        throw Object.defineProperty(new Error("<Html> should not be imported outside of pages/_document.\n" + 'Read more: https://nextjs.org/docs/messages/no-document-import-in-page'), "__NEXT_ERROR_CODE", {
            value: "E67",
            enumerable: false,
            configurable: true
        });
    }
    return context;
}

//# sourceMappingURL=html-context.shared-runtime.js.map